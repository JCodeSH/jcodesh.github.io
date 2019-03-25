import numpy as np
from PIL import Image
import cv2 # opencv
import io
import time
import pandas as pd
import numpy as np
from IPython.display import clear_output
from random import randint
import os

from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.keys import Keys

# keras imports
from keras.models import model_from_json
from keras.models import Sequential
from keras.layers.core import Dense, Dropout, Activation, Flatten
from keras.layers.convolutional import Conv2D, MaxPooling2D
from keras.optimizers import SGD , Adam
from keras.callbacks import TensorBoard
from collections import deque
import random
import pickle
from io import BytesIO
import base64
import json

# path variables
game_url = "https://jcodesh.github.io/Projects/Tetris%20Clone/index.html"
chrome_driver_path = "/usr/bin/chromedriver"
loss_file_path = "./objects/loss_df.csv"
actions_file_path = "./objects/actions_df.csv"
q_value_file_path = "./objects/q_values.csv"
scores_file_path = "./objects/scores_df.csv"

# scripts
# get image from canvas
getbase64Script = "canvasRunner = document.getElementById('tm-canvas'); \
return canvasRunner.toDataURL().substring(22)"

'''
* Game class: Selenium interfacing between the python and browser
* __init__():  Launch the broswer window using the attributes in chrome_options
* get_crashed() : return true if the agent as crashed on an obstacles. Gets javascript variable from game decribing the state
* get_playing(): true if game in progress, false is crashed or paused
* restart() : sends a signal to browser-javascript to restart the game
* press_up(): sends a single to press up get to the browser
* get_score(): gets current game score from javascript variables.
* pause(): pause the game
* resume(): resume a paused game if not crashed
* end(): close the browser and end the game
'''
class Game:
    def __init__(self,custom_config=True):
        chrome_options = Options()
        chrome_options.add_argument("disable-infobars")
        chrome_options.add_argument("--mute-audio")
        chrome_options.add_argument("--start-maximized")
        chrome_options.add_argument('--no-sandbox')
        chrome_options.add_argument("--disable-dev-shm-usage");
        chrome_options.add_argument('--headless')

        self._driver = webdriver.Chrome(executable_path = chrome_driver_path,chrome_options=chrome_options)
        self._driver.get('https://jcodesh.github.io/Projects/Tetris%20Clone/index.html')
    def get_crashed(self):
        return self._driver.execute_script("return MAIN.data.scores.isGameOver")
    def get_playing(self):
        return self._driver.execute_script("return MAIN.data.scores.isPause")
    def restart(self):
        self._driver.execute_script("MAIN.changeProgram(MAIN.programs.game)")
    def arrow_up(self):
        self._driver.find_element_by_id("tm-canvas").send_keys(Keys.UP)
    def arrow_left(self):
        self._driver.find_element_by_id("tm-canvas").send_keys(Keys.LEFT)
    def arrow_right(self):
        self._driver.find_element_by_id("tm-canvas").send_keys(Keys.RIGHT)
    def arrow_down(self):
        self._driver.find_element_by_id("tm-canvas").send_keys(Keys.DOWN)
    def hard_drop(self):
        self._driver.find_element_by_id("tm-canvas").send_keys(Keys.SPACE)
    def get_score(self):
        score = self._driver.execute_script("return MAIN.data.scores.currentScore")
        return score
    def get_nextPiece(self):
        nextPiece = self._driver.execute_script("return MAIN.data.scores.nextPiece")
        return int(nextPiece + 1)
    def pause(self):
        return self._driver.find_element_by_id("tm-canvas").send_keys("P")
    def resume(self):
        return self._driver.find_element_by_id("tm-canvas").send_keys("P")
    def end(self):
        self._driver.close()

class TetrisAgent:
    def __init__(self,game): # takes game as input for taking actions
        self._game = game; 
        self.drop(); # to start the game, we need to enter any key
    def is_running(self):
        return self._game.get_playing()
    def is_crashed(self):
        return self._game.get_crashed()
    def up(self):
        self._game.arrow_up()
    def left(self):
        self._game.arrow_left()
    def right(self):
        self._game.arrow_right()
    def down(self):
        self._game.arrow_down()
    def drop(self):
        self._game.hard_drop()
        
class GameState:
    def __init__(self,agent,game):
        self._agent = agent
        self._game = game
        # self._display = show_img() # display the processed image on screen using openCV, implemented using python coroutine
        # self._display.__next__() # initiliaze the display coroutine
    def get_state(self,actions, previous_score):
        actions_df.loc[len(actions_df)] = actions # storing actions in a dataframe
        score = self._game.get_score()
        temScore = self._game.get_score()
        if temScore is None:    temScore = 0
        if previous_score is None:    previous_score = 0
        reward = temScore - previous_score
        if reward <= 0:
            reward = 0.1
        
        next = self._game.get_nextPiece()
        is_over = False # game over
        
        if actions == 1:
            self._agent.up()
        elif actions == 2:
            self._agent.left()
        elif actions == 3:
            self._agent.right()
        elif actions == 4:
            self._agent.down()
        elif actions == 5:
            self._agent.drop()
        
        image = grab_screen(self._game._driver) 
        # self._display.send(image) # display the image on screen
        if self._agent.is_crashed():
            scores_df.loc[len(loss_df)] = score # log the score when game is over
            reward = -1
            self._game.restart()
            is_over = True
        return image, next, reward, score, is_over # return the Experience tuple

def save_obj(obj, name ):
    with open('objects/'+ name + '.pkl', 'wb') as f: # dump files into objects folder
        pickle.dump(obj, f, pickle.HIGHEST_PROTOCOL)

def load_obj(name ):
    with open('objects/' + name + '.pkl', 'rb') as f:
        return pickle.load(f)

def grab_screen(_driver):
    image_b64 = _driver.execute_script(getbase64Script)
    screen = np.array(Image.open(BytesIO(base64.b64decode(image_b64))))
    image = process_img(screen)# processing image as required
    return image

def process_img(image):
    
    image = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY) # RGB to Grey Scale
    image = image[39:871, 56:482] # crop Region of Interest(ROI)
    image = image_resize(image, height = 100)
    return  image

def image_resize(image, width = None, height = None, inter = cv2.INTER_AREA):
    # initialize the dimensions of the image to be resized and grab the image size
    dim = None
    (h, w) = image.shape[:2]

    # if both the width and height are None, then return the
    # original image
    if width is None and height is None:
        return image

    # check to see if the width is None
    if width is None:
        # calculate the ratio of the height and construct the
        # dimensions
        r = height / float(h)
        dim = (int(w * r), height)

    # otherwise, the height is None
    else:
        # calculate the ratio of the width and construct the dimensions
        r = width / float(w)
        dim = (width, int(h * r))

    # resize the image
    resized = cv2.resize(image, dim, interpolation = inter)

    # return the resized image
    return resized

def show_img(graphs = False):
    """
    Show images in new window
    """
    while True:
        screen = (yield)
        window_title = "logs" if graphs else "game_play"
        cv2.namedWindow(window_title, cv2.WINDOW_NORMAL)        
        imS = cv2.resize(screen, (800, 400)) 
        cv2.imshow(window_title, screen)
        if (cv2.waitKey(1) & 0xFF == ord('q')):
            cv2.destroyAllWindows()
            break

# intialize log structures from file if exists else create new
loss_df = pd.read_csv(loss_file_path) if os.path.isfile(loss_file_path) else pd.DataFrame(columns =['loss'])
scores_df = pd.read_csv(scores_file_path) if os.path.isfile(loss_file_path) else pd.DataFrame(columns = ['scores'])
actions_df = pd.read_csv(actions_file_path) if os.path.isfile(actions_file_path) else pd.DataFrame(columns = ['actions'])
q_values_df =pd.read_csv(actions_file_path) if os.path.isfile(q_value_file_path) else pd.DataFrame(columns = ['qvalues'])

# game parameters
ACTIONS = 6 # possible actions: do nothing, up, left, right, down, drop
GAMMA = 0.99 # decay rate of past observations original 0.99
OBSERVATION = 100. # to observe before training
EXPLORE = 100000  # frames over which to anneal epsilon
FINAL_EPSILON = 0.0001 # final value of epsilon
INITIAL_EPSILON = 0.1 # starting value of epsilon
REPLAY_MEMORY = 100000 # number of previous transitions to remember
BATCH = 16 # size of minibatch
FRAME_PER_ACTION = 1
LEARNING_RATE = 1e-4
img_rows , img_cols = 100,51
img_channels = 4

# temp information
previous_score = 0

# training variables saved as checkpoints to filesystem to resume training from the same step
def init_cache():
    """initial variable caching, done only once"""
    save_obj(INITIAL_EPSILON,"epsilon")
    t = 0
    save_obj(t,"time")
    D = deque()
    save_obj(D,"D")
    p = 0
    save_obj(p,"play")

'''
Call only once to init file structure
'''
init_cache()

def buildmodel():
    print("Now we build the model")
    model = Sequential()
    model.add(Conv2D(32, (4, 4), padding='same',strides=(2, 2),input_shape=(img_rows,img_cols,img_channels)))
    model.add(MaxPooling2D(pool_size=(2,2), dim_ordering="th"))
    model.add(Activation('relu'))
    model.add(Conv2D(64, (4, 4),strides=(2, 2),  padding='same'))
    model.add(MaxPooling2D(pool_size=(2,2), dim_ordering="th"))
    model.add(Activation('relu'))
    model.add(Conv2D(64, (3, 3),strides=(1, 1),  padding='same'))
    model.add(MaxPooling2D(pool_size=(2,2), dim_ordering="th"))
    model.add(Activation('relu'))
    model.add(Flatten())
    model.add(Dense(512))
    model.add(Activation('relu'))
    model.add(Dense(ACTIONS))
    adam = Adam(lr=LEARNING_RATE)
    model.compile(loss='mse',optimizer=adam)
    
    #create model file if not present
    if not os.path.isfile(loss_file_path):
        model.save_weights('model.h5')
    print("We finish building the model")
    return model

''' 
main training module
Parameters:
* model => Keras Model to be trained
* game_state => Game State module with access to game environment and tetris
* observe => flag to indicate whether the model is to be trained(weight updates), else just play
'''
def trainNetwork(model,game_state,observe=False):
    last_time = time.time()
    # store the previous observations in replay memory
    D = load_obj("D") # load from file system
    # get the first state by doing nothing
    do_nothing = 0 # 0 => do nothing,
    
    x_t, n_0, r_0, score_0, terminal = game_state.get_state(do_nothing, 0) # get next step after performing the action
    
    s_t = np.stack((x_t, x_t, x_t, x_t), axis=2) # stack 4 images to create placeholder input
    
    s_t = s_t.reshape(1, s_t.shape[0], s_t.shape[1], s_t.shape[2])
    
    initial_state = s_t

    if observe :
        OBSERVE = 999999999    # we keep observe, never train
        epsilon = FINAL_EPSILON
        print ("Now we load weight")
        model.load_weights("model.h5")
        adam = Adam(lr=LEARNING_RATE)
        model.compile(loss='mse',optimizer=adam)
        print ("Weight load successfully")    
    else:                      # we go to training mode
        OBSERVE = OBSERVATION
        epsilon = load_obj("epsilon") 
        model.load_weights("model.h5")
        adam = Adam(lr=LEARNING_RATE)
        model.compile(loss='mse',optimizer=adam)

    t = load_obj("time") # resume from the previous time step stored in file system
    p = load_obj("play") # resume from the previous play step stored in file system
    isGameOver = False
    previous_score = 0
    
    while (True): # endless running
        
        loss = 0
        Q_sa = 0
        r_t = 0     # reward at t
        a_t = 0     # action at t
        score_t = 0 # score at t
        n_t = 0
        
        # choose an action epsilon greedy
        if t % FRAME_PER_ACTION == 0: # parameter to skip frames for actions
            if  random.random() <= epsilon: # randomly explore an action
                print("----------Random Action----------")
                a_t = random.randrange(ACTIONS)
            else: # predict the output
                q = model.predict(s_t)       # input a stack of 4 images, get the prediction
                max_Q = np.argmax(q)         # chosing index with maximum q value
                a_t = max_Q 
                
        # we reduced the epsilon (exploration parameter) gradually
        if epsilon > FINAL_EPSILON and p > OBSERVE:
            epsilon -= (INITIAL_EPSILON - FINAL_EPSILON) / EXPLORE 

        # run the selected action and observed next state and reward
        x_t1, n_t, r_t, score_t, terminal = game_state.get_state(a_t, previous_score)
        previous_score = score_t
        
        print('fps: {0}'.format(1 / (time.time()-last_time))) # helpful for measuring frame rate
        last_time = time.time()
        x_t1 = x_t1.reshape(1, x_t1.shape[0], x_t1.shape[1], 1)
        s_t1 = np.append(x_t1, s_t[:, :, :, :3], axis=3) # append the new image to input stack and remove the first one
        
        # store the transition in D
        D.append((s_t, a_t, n_t, r_t, s_t1, terminal))
        if len(D) > REPLAY_MEMORY:
            D.popleft()

        # only train if done observing
        if p > OBSERVE: 
            
            # sample a minibatch to train on
            minibatch = random.sample(D, BATCH)
            inputs = np.zeros((BATCH, s_t.shape[1], s_t.shape[2], s_t.shape[3]))
            targets = np.zeros((inputs.shape[0], ACTIONS))

            # now we do the experience replay
            for i in range(0, len(minibatch)):
                state_t = minibatch[i][0]    # 4D stack of images
                action_t = minibatch[i][1]   # This is action index
                next_t = minibatch[i][2]     # next piece
                reward_t = minibatch[i][3]   # reward at state_t due to action_t
                state_t1 = minibatch[i][4]   # next state
                terminal = minibatch[i][5]   # whether the agent died or survided due the action

                inputs[i:i + 1] = state_t    

                targets[i] = model.predict(state_t)  # predicted q values
                Q_sa = model.predict(state_t1)      # predict q values for next step
                
                if terminal:
                    targets[i, action_t] = reward_t # if terminated, only equals reward
                else:
                    targets[i, action_t] = reward_t + GAMMA * np.max(Q_sa)

            loss += model.train_on_batch(inputs, targets)
            loss_df.loc[len(loss_df)] = loss
            q_values_df.loc[len(q_values_df)] = np.max(Q_sa)
        s_t = initial_state if terminal else s_t1 # reset game to initial frame if terminate
        t = t + 1
        
        # save progress every 10 games
        if p % 10 == 0 and isGameOver:
            print("Now we save model")
            game_state._game.pause() # pause game while saving to filesystem
            model.save_weights("model.h5", overwrite=True)
            save_obj(D,"D") # saving episodes
            save_obj(t,"time") # caching time steps
            save_obj(p,"play") # caching play steps
            save_obj(epsilon,"epsilon") # cache epsilon to avoid repeated randomness in actions
            loss_df.to_csv("./objects/loss_df.csv",index=False)
            scores_df.to_csv("./objects/scores_df.csv",index=False)
            actions_df.to_csv("./objects/actions_df.csv",index=False)
            q_values_df.to_csv(q_value_file_path,index=False)
            with open("model.json", "w") as outfile:
                json.dump(model.to_json(), outfile)
            clear_output()
            game_state._game.resume()
        # print info
        state = ""
        if t <= OBSERVE:
            state = "observe"
        elif t > OBSERVE and t <= OBSERVE + EXPLORE:
            state = "explore"
        else:
            state = "train"

        print("TIMESTEP", t, "/ PLAY", p, "/ STATE", state, "/ EPSILON", epsilon, "/ ACTION", a_t, "/ NEXT", n_t, "/ REWARD", r_t, "/ SCORE", score_t, "/ Q_MAX " , np.max(Q_sa), "/ Loss ", loss)
        
        # signify end of a game (reward = -1)
        if r_t == -1:
            p = p + 1
            isGameOver = True
        else:
            isGameOver = False
        
    print("Episode finished!")
    print("************************")

# main function
def playGame(observe=False):
    game = Game()
    tetris = TetrisAgent(game)
    game_state = GameState(tetris,game)    
    model = buildmodel()
    try:
        print("Train Network!")
        trainNetwork(model,game_state,observe=observe)
    except StopIteration:
        print("Iteration Stop!")
        game.end()

playGame(observe=False);