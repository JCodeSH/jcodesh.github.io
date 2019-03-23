console.log('tetris-object.js loaded');

//=============================
// Star
//=============================
// Object Type: TM.ILoopObject
// Description: Create a Blinking star
var Star = function (speed, data) {
    this.data = {
        x: undefined,
        y: undefined,
        refContainer: undefined,
        blink: 0,
    };
    TM.ILoopObject.call(this, speed, data);
};
Star.prototype = Object.create(TM.ILoopObject.prototype);
Star.prototype.constructor = Star;

// TM.ILoopObject functions implementation
Star.prototype._init = function () {
};
Star.prototype._inactivate = function () {
    this.data.refContainer.splice(this.data.refContainer.indexOf(this), 1);
    TMS.insertTextAt(this.data.x, this.data.y, '  ');
};
Star.prototype._calculate = function () {
    this.data.blink = (this.data.blink + 1) % 2;
};
Star.prototype._draw = function () {
    var text = this.data.blink % 2 === 0 ? '★' : '☆';
    TMS.insertTextAt(this.data.x, this.data.y, text);
};

//=============================
// PausePopup
//=============================
// Object Type: TM.ILoopObject
// Description: Create a Pause Popup box
var PausePopup = function (speed, data) {
    this.data = {
        x: undefined,
        y: undefined,
        bgColor: undefined,
        frame: [
            '┏━━━━━━━━━━━━━━━━━━┓\n',
            '┃            [ PAUSED ]              ┃\n',
            '┃                                    ┃\n',
            '┗━━━━━━━━━━━━━━━━━━┛\n',
        ],
        text: 'Please press <P> to return to game',
        blink: 0,
    };
    TM.ILoopObject.call(this, speed, data);
};
PausePopup.prototype = Object.create(TM.ILoopObject.prototype);
PausePopup.prototype.constructor = PausePopup;

// TM.ILoopObject functions implementation
PausePopup.prototype._init = function () {
    this.drawFrame();
};
PausePopup.prototype._inactivate = function () {
    this.drawFrame(true);
};
PausePopup.prototype._calculate = function () {
    this.data.blink = (this.data.blink + 1) % 2;
};
PausePopup.prototype._draw = function () {
    this.blinkText();
};

// Custom functions
PausePopup.prototype.drawFrame = function (remove) {
    TMS.cursor.move(this.data.x, this.data.y);
    for (var i = 0; i < this.data.frame.length; i++) {
        if (remove) TMS.deleteText(this.data.frame[i]);
        else TMS.insertText(this.data.frame[i], '#fff', this.data.bgColor);
    }
};
PausePopup.prototype.blinkText = function () {
    var color = this.data.blink % 2 === 0 ? '#fff' : 'gray';
    TMS.insertTextAt(this.data.x + 3, this.data.y + 2, this.data.text, color, this.data.bgColor);
};

//=============================
// GameOverPopup
//=============================
// Object Type: TM.ILoopObject
// Description: Create a Game Over Popup box
var GameOverPopup = function (speed, data) {
    this.data = {
        x: undefined,
        y: undefined,
        bgColor: undefined,
        frame: [
            '┏━━━━━━━━━━━━━┓\n',
            '┃      [ GAME OVER ]       ┃\n',
            '┃                          ┃\n',
            '┃    YOUR SCORE:           ┃\n',
            '┃                          ┃\n',
            '┃                          ┃\n',
            '┃                          ┃\n',
            '┗━━━━━━━━━━━━━┛\n',
        ],
        text: 'Please press <ESC>',
        blink: 0,
        currentScore: null,
    };
    TM.ILoopObject.call(this, speed, data);
};
GameOverPopup.prototype = Object.create(TM.ILoopObject.prototype);
GameOverPopup.prototype.constructor = GameOverPopup;

// TM.ILoopObject functions implementation
GameOverPopup.prototype._init = function () {
    this.drawFrame();
    this.drawScore();
};
GameOverPopup.prototype._inactivate = function () {
    this.drawFrame(true);
};
GameOverPopup.prototype._calculate = function () {
    this.data.blink = (this.data.blink + 1) % 2;
};
GameOverPopup.prototype._draw = function () {
    this.blinkText();
};

// Custom functions
GameOverPopup.prototype.drawFrame = function (remove) {
    TMS.cursor.move(this.data.x, this.data.y);
    for (var i = 0; i < this.data.frame.length; i++) {
        if (remove) TMS.deleteText(this.data.frame[i]);
        else TMS.insertText(this.data.frame[i], '#fff', this.data.bgColor);
    }
};
GameOverPopup.prototype.drawScore = function () {
    var scoreText = Status.convertScore(this.data.currentScore);
    TMS.insertTextAt(this.data.x + 14, this.data.y + 4, scoreText, '#fff', this.data.bgColor);
};
GameOverPopup.prototype.blinkText = function () {
    var color = this.data.blink % 2 === 0 ? '#fff' : 'gray';
    TMS.insertTextAt(this.data.x + 6, this.data.y + 6, this.data.text, color, this.data.bgColor);
};

//=============================
// Status
//=============================
// Object Type: TM.IObject
// Description: Display Tetris game status
var Status = function (data) {
    this.data = {
        x: undefined,
        y: undefined,
        frame: [
            ' LEVEL :   \n',
            ' GOAL  :   \n',
            '┍ N E X T  ┑\n',
            '│      │\n',
            '│      │\n',
            '│      │\n',
            '│      │\n',
            '┕━━━━━━┙\n',
            ' YOUR SCORE :\n',
            '                 \n',
            ' LAST SCORE :\n',
            '                 \n',
            ' BEST SCORE :\n',
            '                 \n\n',
            '  △   : Shift        SPACE : Hard Drop\n',
            '◁  ▷ : Left / Right   P   : Pause\n',
            '  ▽   : Soft Drop     ESC  : Quit\n\n\n',
        ],
        COLORSET: GAME_SETTINGS.COLORSET,
        currentScore: 0,
        nextBlockType: null,
        level: null,
        i: null,
    };
    TM.IObject.call(this, data);
};
Status.prototype = Object.create(TM.IObject.prototype);
Status.prototype.constructor = Status;

// TM.IObject functions implementation
Status.prototype._init = function () {
    this.drawFrame();
    this.drawLastScore(MAIN.data.scores.lastScore);
    this.drawBestScore(MAIN.data.scores.bestScore);
};
Status.prototype._inactivate = function () {
    this.drawFrame(true);
};

// Custom functions - Static functions
Status.convertScore = function (score) {
    var string = Math.floor(score).toString();
    var formatted = string.replace(/(\d)(?=(\d{3})+$)/g, '$1,');
    var offset = 10 - formatted.length;
    var padding = '';
    for (var i = offset; i > 0; i--) padding += ' ';
    return padding + formatted;
};

// Custom functions
Status.prototype.drawFrame = function (remove) {
    TMS.cursor.move(this.data.x, this.data.y);
    for (var i = 0; i < this.data.frame.length; i++) {
        if (remove) TMS.deleteText(this.data.frame[i]);
        else TMS.insertText(this.data.frame[i]);
    }
};
Status.prototype.drawNextBlock = function (blockType) {
    if (blockType || blockType === 0) this.data.nextBlockType = blockType;
    var nextBlockType = this.data.nextBlockType;
    MAIN.data.scores.nextPiece = this.data.nextBlockType;
    var xOffset = (nextBlockType === 0 || nextBlockType === 1) ? 0 : 1;
    var color = Tetris.COLORSET.BLOCKS[nextBlockType];
    var xAdj = this.data.x + 2 + xOffset;
    var yAdj = this.data.y + 3;
    var width = 6 - xOffset;
    var height = 3;
    for (var i = 1; i < height; i++) {
        for (var j = 0; j < width; j++) {
            var x = xAdj + j * 2;
            var y = yAdj + i;
            if (j > 0 && Tetris.BLOCKS[nextBlockType][0][i][j - 1] == 1) {
                TMS.insertTextAt(x, y, '■', color);
            } else {
                TMS.insertTextAt(x, y, '  ');
            }
        }
    }
};
Status.prototype.drawLevel = function (num) {
    if (num) this.data.level = num;
    var level = this.data.level;
    level = (level > 9) ? level : ' ' + level;
    TMS.insertTextAt(this.data.x + 9, this.data.y, level);
};
Status.prototype.drawGoal = function (num) {
    if (num) this.data.goal = num;
    var goal = this.data.goal;
    goal = (goal > 9) ? goal : ' ' + goal;
    TMS.insertTextAt(this.data.x + 9, this.data.y + 1, goal);
};
Status.prototype.drawCurrentScore = function (score) {
    if (score) this.data.currentScore = score;
    MAIN.data.scores.currentScore = score;
    TMS.insertTextAt(this.data.x + 7, this.data.y + 9, Status.convertScore(this.data.currentScore));
};
Status.prototype.drawLastScore = function (score) {
    if (score) MAIN.data.scores.lastScore = score;
    TMS.insertTextAt(this.data.x + 7, this.data.y + 11, Status.convertScore(MAIN.data.scores.lastScore));
};
Status.prototype.drawBestScore = function (score) {
    if (score) MAIN.data.scores.bestScore = Math.max(score, MAIN.data.scores.bestScore);
    TMS.insertTextAt(this.data.x + 7, this.data.y + 13, Status.convertScore(MAIN.data.scores.bestScore));
};
Status.prototype.refresh = function () {
    this.drawFrame();
    this.drawLevel();
    this.drawGoal();
    this.drawNextBlock();
    this.drawCurrentScore();
    this.drawLastScore();
    this.drawBestScore();
};

//=============================
// Tetris
//=============================
// Object Type: TM.ILoopObject
// Description: Main Tetris game
var Tetris = function (data) {
    this.speed = 10;
    this.data = {
        x: undefined,
        y: undefined,
        refGameObjects: undefined,
        dataArray: null,
        activeBlock: new Tetris_ActiveBlock(),
        currentScore: 0,
        level: 1,
        goal: 10,
        GOAL_MAX: 10,
        message: {
            flag: false,
            count: 0,
            COUNT_MAX: 20,
            x: null,
            y: null,
            text1: null,
            text2: null,
        },
        gameOver: {
            flag: false,
            count: 0,
            COUNT_MAX: 5,
            rowNum: GAME_SETTINGS.ROW_NUM - 2,
        },
        isGameOver: false,
    };
    TM.ILoopObject.call(this, this.speed, data);
};
Tetris.prototype = Object.create(TM.ILoopObject.prototype);
Tetris.prototype.constructor = Tetris;

// Static properties
Tetris.ACTIVE_BLOCK = -2;
Tetris.CEILING = -1;
Tetris.EMPTY = 0;
Tetris.WALL = 1;
Tetris.STAR = 100;
Tetris.GRAY_BLOCK = 101;
Tetris.COL_NUM = GAME_SETTINGS.COL_NUM;
Tetris.ROW_NUM = GAME_SETTINGS.ROW_NUM;
Tetris.COLORSET = GAME_SETTINGS.COLORSET;
Tetris.BLOCKS = [
    [[[0, 0, 0, 0], [0, 1, 1, 0], [0, 1, 1, 0], [0, 0, 0, 0]], [[0, 0, 0, 0], [0, 1, 1, 0], [0, 1, 1, 0], [0, 0, 0, 0]], [[0, 0, 0, 0], [0, 1, 1, 0], [0, 1, 1, 0], [0, 0, 0, 0]], [[0, 0, 0, 0], [0, 1, 1, 0], [0, 1, 1, 0], [0, 0, 0, 0]]],
    [[[0, 0, 0, 0], [0, 0, 0, 0], [1, 1, 1, 1], [0, 0, 0, 0]], [[0, 1, 0, 0], [0, 1, 0, 0], [0, 1, 0, 0], [0, 1, 0, 0]], [[0, 0, 0, 0], [0, 0, 0, 0], [1, 1, 1, 1], [0, 0, 0, 0]], [[0, 1, 0, 0], [0, 1, 0, 0], [0, 1, 0, 0], [0, 1, 0, 0]]],
    [[[0, 0, 0, 0], [1, 1, 0, 0], [0, 1, 1, 0], [0, 0, 0, 0]], [[0, 0, 0, 0], [0, 0, 1, 0], [0, 1, 1, 0], [0, 1, 0, 0]], [[0, 0, 0, 0], [1, 1, 0, 0], [0, 1, 1, 0], [0, 0, 0, 0]], [[0, 0, 0, 0], [0, 0, 1, 0], [0, 1, 1, 0], [0, 1, 0, 0]]],
    [[[0, 0, 0, 0], [0, 1, 1, 0], [1, 1, 0, 0], [0, 0, 0, 0]], [[0, 0, 0, 0], [1, 0, 0, 0], [1, 1, 0, 0], [0, 1, 0, 0]], [[0, 0, 0, 0], [0, 1, 1, 0], [1, 1, 0, 0], [0, 0, 0, 0]], [[0, 0, 0, 0], [1, 0, 0, 0], [1, 1, 0, 0], [0, 1, 0, 0]]],
    [[[0, 0, 0, 0], [0, 0, 1, 0], [1, 1, 1, 0], [0, 0, 0, 0]], [[0, 0, 0, 0], [1, 1, 0, 0], [0, 1, 0, 0], [0, 1, 0, 0]], [[0, 0, 0, 0], [0, 0, 0, 0], [1, 1, 1, 0], [1, 0, 0, 0]], [[0, 0, 0, 0], [0, 1, 0, 0], [0, 1, 0, 0], [0, 1, 1, 0]]],
    [[[0, 0, 0, 0], [1, 0, 0, 0], [1, 1, 1, 0], [0, 0, 0, 0]], [[0, 0, 0, 0], [0, 1, 0, 0], [0, 1, 0, 0], [1, 1, 0, 0]], [[0, 0, 0, 0], [0, 0, 0, 0], [1, 1, 1, 0], [0, 0, 1, 0]], [[0, 0, 0, 0], [0, 1, 1, 0], [0, 1, 0, 0], [0, 1, 0, 0]]],
    [[[0, 0, 0, 0], [0, 1, 0, 0], [1, 1, 1, 0], [0, 0, 0, 0]], [[0, 0, 0, 0], [0, 1, 0, 0], [1, 1, 0, 0], [0, 1, 0, 0]], [[0, 0, 0, 0], [0, 0, 0, 0], [1, 1, 1, 0], [0, 1, 0, 0]], [[0, 0, 0, 0], [0, 1, 0, 0], [0, 1, 1, 0], [0, 1, 0, 0]]]
];

// TM.ILoopObject functions inheritance
Tetris.prototype._init = function () {
    var activeBlock = this.data.activeBlock;
    var status = this.data.refGameObjects.status;
    this.resetDataArray();
    this.createNewBlock(activeBlock, status);
    activeBlock.setSpeed(this.data.level);
    status.drawLevel(this.data.level);
    status.drawGoal(this.data.goal);
    status.drawCurrentScore(this.data.currentScore);
};
Tetris.prototype._inactivate = function (blockType) {
    TMD.delete('tetris_debug');
    this.emptyDataArray();
    this.data.message.flag = false;
    this.draw();
};
Tetris.prototype._calculate = function () {
    var activeBlock = this.data.activeBlock;
    var status = this.data.refGameObjects.status;

    if (this.data.isGameOver) return;
    if (this.data.gameOver.flag) return this.processGameOver();

    if (!activeBlock.data.landing.flag) {
        this.updateCeilling();
        activeBlock.processAutoDrop(this.data.dataArray);
        activeBlock.updateOnTetrisDataArray(this.data.dataArray);
    }

    if (activeBlock.data.sliding.flag) {
        var slidingFinished = activeBlock.processSliding(this.data.dataArray);
        if (slidingFinished) {
            activeBlock.data.landing.flag = true;
            activeBlock.setBlock(this.data.dataArray);
            this.changeFullLinesToStar();
        }
    } else if (activeBlock.data.landing.flag) {
        var landingFinished = activeBlock.processLanding(this.data.dataArray);
        if (landingFinished) {
            var removedLineNum = this.removeFullLines(activeBlock, status);
            if (removedLineNum) {
                var score = removedLineNum * 100 * this.data.level;
                score += (removedLineNum > 1) ? this.data.level * 50 * removedLineNum * 2 : 0;
                this.showComboBonusMessage(activeBlock.data.x, activeBlock.data.y, removedLineNum, score);
                this.data.goal -= removedLineNum;
                this.addScore(status, score);
                if (this.data.goal <= 0) this.levelUp(activeBlock, status);
                else status.drawGoal(this.data.goal);
            }

            if (this.checkGameOver()) {
                this.data.gameOver.flag = true;
                status.drawBestScore(this.data.currentScore);
                status.drawLastScore(this.data.currentScore);
            } else {
                this.createNewBlock(activeBlock, status);
            }
        }
    }

    TMD.print('tetris_debug', activeBlock.data);
};
Tetris.prototype._draw = function () {
    var activeBlock = this.data.activeBlock;
    if (this.data.isGameOver) return;

    for (var i = 0; i < Tetris.ROW_NUM; i++) {
        for (var j = 0; j < Tetris.COL_NUM; j++) {
            var blockChar;
            var color;
            switch (this.data.dataArray[i][j]) {
                case Tetris.ACTIVE_BLOCK: //-2
                    blockChar = '□';
                    color = Tetris.COLORSET.BLOCKS[activeBlock.data.type];
                    break;
                case Tetris.GRAY_BLOCK: //-2
                    blockChar = '■';
                    color = Tetris.COLORSET.GAME_OVER_BLOCK;
                    break;
                case Tetris.CEILING: // -1
                    blockChar = '•';
                    color = Tetris.COLORSET.CEILING;
                    break;
                case Tetris.EMPTY: //0
                    blockChar = '  ';
                    break;
                case Tetris.WALL: // 1
                    blockChar = '▣';
                    color = Tetris.COLORSET.WALL;
                    break;
                case Tetris.STAR: //100
                    blockChar = '★';
                    var colorNum = j % Tetris.COLORSET.BLOCKS.length;
                    color = Tetris.COLORSET.BLOCKS[colorNum];
                    break;
                default: // 2~
                    blockChar = '■';
                    color = Tetris.COLORSET.BLOCKS[this.data.dataArray[i][j] - 2];
                    break;
            }
            TMS.insertTextAt(this.data.x + j * 2, this.data.y + i, blockChar, color);
        }
    }

    if (this.data.message.flag) {
        this.processMessage();
    }
};

// Custom functions
Tetris.prototype.processMessage = function () {
    var message = this.data.message;
    var longestText = (message.text1.length > message.text2.length) ? message.text1 : message.text2;
    var x = this.data.x + message.x * 2;
    var y = this.data.y + message.y - 2;
    if (x <= this.data.x + 2) {
        x = this.data.x + 4;
    } else if (x + longestText.length > Tetris.COL_NUM * 2) {
        x = this.data.x + (Tetris.COL_NUM - 1 - Math.ceil(longestText.length / 2)) * 2;
    }
    if (y < this.data.y) {
        y = this.data.y;
    }
    TMS.insertTextAt(46, 11, message.text1);
    TMS.insertTextAt(46, 11 + 1, message.text2);
    if (++message.count > message.COUNT_MAX) {
        message.count = 0;
        message.flag = false;
    }
};
Tetris.prototype.resetDataArray = function () {
    this.data.dataArray = [];
    for (var i = 0; i < Tetris.ROW_NUM; i++) {
        this.data.dataArray[i] = [];
        for (var j = 0; j < Tetris.COL_NUM; j++) {
            if (i == Tetris.ROW_NUM - 1) {
                this.data.dataArray[i][j] = Tetris.WALL;
            } else if (j === 0 || j == Tetris.COL_NUM - 1) {
                this.data.dataArray[i][j] = Tetris.WALL;
            } else {
                this.data.dataArray[i][j] = Tetris.EMPTY;
            }
        }
    }
};
Tetris.prototype.emptyDataArray = function () {
    this.data.dataArray = [];
    for (var i = 0; i < Tetris.ROW_NUM; i++) {
        this.data.dataArray[i] = [];
        for (var j = 0; j < Tetris.COL_NUM; j++) {
            this.data.dataArray[i][j] = Tetris.EMPTY;
        }
    }
};
Tetris.prototype.updateCeilling = function () {
    for (var j = 1; j < Tetris.COL_NUM - 1; j++) {
        if (this.data.dataArray[3][j] <= 0) this.data.dataArray[3][j] = Tetris.CEILING;
    }
};
Tetris.prototype.createNewBlock = function (activeBlock, status) {
    activeBlock.init();
    activeBlock.updateOnTetrisDataArray(this.data.dataArray);
    status.drawNextBlock(activeBlock.data.nextBlockType);
};
Tetris.prototype.showMessage = function (x, y, text1, text2) {
    this.data.message.flag = true;
    this.data.message.count = 0;
    this.data.message.x = x;
    this.data.message.y = y;
    this.data.message.text1 = text1 ? text1 : "";
    this.data.message.text2 = text2 ? text2 : "";
};
Tetris.prototype.showHardDropBonusMessage = function (x, y, score) {
    var text1 = "HARD DROP!";
    var text2 = " + " + score;
    this.showMessage(x, y, text1, text2);
};
Tetris.prototype.showComboBonusMessage = function (x, y, combo, score) {
    var text1 = (combo > 1) ? combo + " COMBOS!" : "";
    var text2 = " + " + score;
    this.showMessage(x, y, text1, text2);
};
Tetris.prototype.showLevelUpMessage = function (x, y) {
    var text1 = "LEVEL UP!";
    var text2 = " SPEED UP!";
    this.showMessage(x, y, text1, text2);
};
Tetris.prototype.changeFullLinesToStar = function () {
    for (var i = Tetris.ROW_NUM - 2; i >= 0; i--) {
        var occupiedCount = 0;
        for (var j = 1; j < Tetris.COL_NUM - 1; j++) {
            if (this.data.dataArray[i][j] > 0) occupiedCount++;
        }
        if (occupiedCount == Tetris.COL_NUM - 2) {
            for (j = 1; j < Tetris.COL_NUM - 1; j++) {
                this.data.dataArray[i][j] = Tetris.STAR;
            }
        }
    }
};
Tetris.prototype.removeFullLines = function (activeBlock, status) {
    var removedLineNum = 0;
    for (var i = Tetris.ROW_NUM - 2; i >= 0; i--) {
        var occupiedCount = 0;
        for (var j = 1; j < Tetris.COL_NUM - 1; j++) {
            if (removedLineNum) {
                if (i < removedLineNum) this.data.dataArray[i][j] = 0;
                else if (i === 0 || this.data.dataArray[i - removedLineNum][j] == Tetris.CEILING) this.data.dataArray[i][j] = Tetris.EMPTY;
                else this.data.dataArray[i][j] = this.data.dataArray[i - removedLineNum][j];
            }
            if (this.data.dataArray[i][j] > 0) occupiedCount++;
        }
        if (occupiedCount == Tetris.COL_NUM - 2) {
            i++;
            removedLineNum++;
        }
    }
    return removedLineNum;
};
Tetris.prototype.addScore = function (status, score) {
    this.data.currentScore += score;
    status.drawCurrentScore(this.data.currentScore);
};
Tetris.prototype.levelUp = function (activeBlock, status) {
    this.data.level++;
    this.data.goal = this.data.GOAL_MAX;
    activeBlock.setSpeed(this.data.level);
    status.drawGoal(this.data.goal);
    status.drawLevel(this.data.level);
    this.showLevelUpMessage(activeBlock.data.x, activeBlock.data.y);
};
Tetris.prototype.checkGameOver = function () {
    for (var j = 1; j < Tetris.COL_NUM - 1; j++) {
        if (this.data.dataArray[3][j] > 0) return true;
    }
};
Tetris.prototype.processGameOver = function () {
    var gameOver = this.data.gameOver;
    if (++gameOver.count > gameOver.COUNT_MAX) {
        gameOver.count = 0;

        for (var j = 1; j < Tetris.COL_NUM - 1; j++) {
            if (this.data.dataArray[gameOver.rowNum][j] > 0) this.data.dataArray[gameOver.rowNum][j] = Tetris.GRAY_BLOCK;
        }
        if (--gameOver.rowNum < 0) {
            this.data.isGameOver = true;
            MAIN.data.scores.isGameOver = 1;
        }
    }
};
Tetris.prototype.gameOver = function () {
    var i = Tetris.ROW_NUM - 2;
    var _self = this;
    var interval = setInterval(function () {
        for (var j = 1; j < _self.data.COL_NUM - 1; j++) {
            if (_self.data.dataArray[i][j] > 0) _self.data.dataArray[i][j] = Tetris.GRAY_BLOCK;
        }
        if (--i < 0) {
            _self.data.isGameOver = true;
            clearInterval(interval);
        }
    }, 100);
};

//=============================
// Tetris_ActiveBlock
//=============================
// Object Type: TM.IObject
// Description: Contains active tetris block status and functions to control it
var Tetris_ActiveBlock = function (data) {
    this.data = {
        type: null,
        nextBlockType: null,
        rotation: null,
        x: null,
        y: null,
        autoDrop: {
            count: 0,
            countMax: null,
        },
        sliding: {
            flag: false,
            count: 0,
            COUNT_MAX: 50,
        },
        landing: {
            flag: false,
            count: 0,
            COUNT_MAX: 10,
        },
    };
    TM.IObject.call(this, data);
};
Tetris_ActiveBlock.prototype = Object.create(TM.IObject.prototype);
Tetris_ActiveBlock.prototype.constructor = Tetris_ActiveBlock;

// TM.IObject functions implementation
Tetris_ActiveBlock.prototype._init = function () {
    this.data.x = Math.floor(Tetris.COL_NUM / 2) - 2;
    this.data.y = 0;
    this.data.rotation = 0;
    this.data.autoDrop.count = 0;
    this.data.type = TM.common.isNumber(this.data.nextBlockType) ? this.data.nextBlockType : Math.floor(Math.random() * 7);
    this.data.nextBlockType = Math.floor(Math.random() * 7);
    this.data.sliding.flag = false;
    this.data.sliding.count = 0;
    this.data.isLanded = false;
};
Tetris_ActiveBlock.prototype._inactivate = function () {
};

// Custom Functions - Update ActiveBlock to dataArray
Tetris_ActiveBlock.prototype.transFormTo = function (dataArray, to) {
    for (var i = 0; i < dataArray.length; i++) {
        for (var j = 0; j < dataArray[i].length; j++) {
            if (dataArray[i][j] == Tetris.ACTIVE_BLOCK)
                dataArray[i][j] = to;
        }
    }
};
Tetris_ActiveBlock.prototype.setBlock = function (dataArray) {
    this.transFormTo(dataArray, this.data.type + 2);
};
Tetris_ActiveBlock.prototype.updateOnTetrisDataArray = function (dataArray) {
    if (!this.data.isLanded) {
        this.transFormTo(dataArray, Tetris.EMPTY);

        for (var i = 0; i < 4; i++) {
            for (var j = 0; j < 4; j++) {
                if (Tetris.BLOCKS[this.data.type][this.data.rotation][i][j] == 1)
                    dataArray[this.data.y + i][this.data.x + j] = Tetris.ACTIVE_BLOCK;
            }
        }
    }
};

// Custom Functions - Check and move ActiveBLock
Tetris_ActiveBlock.prototype.checkMove = function (dataArray, type, rN, xN, yN) {
    for (var i = 0; i < 4; i++) {
        for (var j = 0; j < 4; j++) {
            if (Tetris.BLOCKS[type][rN][i][j] == 1
                && dataArray[yN + i][xN + j] > 0) {
                return false;
            }
        }
    }
    return true;
};
Tetris_ActiveBlock.prototype.checkMoveDown = function (dataArray) {
    return this.checkMove(dataArray, this.data.type, this.data.rotation, this.data.x, this.data.y + 1);
};
Tetris_ActiveBlock.prototype.rotate = function (dataArray) {
    var rN = (this.data.rotation - 1) % 4;
    if (rN == -1) rN = 3;
    var moved = false;
    if (this.checkMove(dataArray, this.data.type, rN, this.data.x, this.data.y)) {
        this.data.rotation = rN;
        moved = true;
    } else if (this.checkMove(dataArray, this.data.type, rN, this.data.x, this.data.y - 1)) {
        this.data.rotation = rN;
        this.data.y -= 1;
        moved = true;
    }
    return moved;
};
Tetris_ActiveBlock.prototype.move = function (dataArray, x, y) {
    var xN = this.data.x + x;
    var yN = this.data.y + y;
    var moved = false;
    if (this.checkMove(dataArray, this.data.type, this.data.rotation, xN, yN)) {
        this.data.x = xN;
        this.data.y = yN;
        moved = true;
    }
    return moved;
};
Tetris_ActiveBlock.prototype.moveRight = function (dataArray) {
    this.move(dataArray, 1, 0);
};
Tetris_ActiveBlock.prototype.moveLeft = function (dataArray) {
    this.move(dataArray, -1, 0);
};
Tetris_ActiveBlock.prototype.moveDown = function (dataArray) {
    var moved = this.move(dataArray, 0, 1);
    if (moved) {
        this.data.sliding.count = 0;
        if (this.checkMoveDown(dataArray)) {
            this.data.sliding.flag = false;
        }
    } else {
        this.data.sliding.flag = true;
    }
    return moved;
};
Tetris_ActiveBlock.prototype.hardDrop = function (dataArray, level, hardDropBonus) {
    if (!hardDropBonus) hardDropBonus = 0;

    if (this.moveDown(dataArray)) {
        hardDropBonus += level / 2;
        return this.hardDrop(dataArray, level, hardDropBonus);
    }

    this.data.sliding.flag = true;
    this.data.sliding.count = this.data.sliding.COUNT_MAX;
    return hardDropBonus;
};
Tetris_ActiveBlock.prototype.setSpeed = function (level) {
    if (level <= GAME_SETTINGS.SPEED_LOOKUP.length) {
        this.data.autoDrop.countMax = GAME_SETTINGS.SPEED_LOOKUP[(level - 1)];
    } else {
        this.data.autoDrop.countMax = GAME_SETTINGS.SPEED_LOOKUP[GAME_SETTINGS.SPEED_LOOKUP.length - 1];
    }
};
Tetris_ActiveBlock.prototype.processAutoDrop = function (dataArray) {
    if (++this.data.autoDrop.count > this.data.autoDrop.countMax) {
        this.data.autoDrop.count = 0;
        this.moveDown(dataArray);
    }
};

// Custom functions - sliding
Tetris_ActiveBlock.prototype.processSliding = function (dataArray) {
    var slidingFinished = false;
    if (++this.data.sliding.count > this.data.sliding.COUNT_MAX && !this.checkMoveDown(dataArray)) {
        this.data.sliding.count = 0;
        this.data.sliding.flag = false;
        slidingFinished = true;
    }
    return slidingFinished;
};
Tetris_ActiveBlock.prototype.processLanding = function (dataArray) {
    var landingFinished = false;
    if (++this.data.landing.count > this.data.landing.COUNT_MAX) {
        this.data.landing.count = 0;
        this.data.landing.flag = false;
        landingFinished = true;
    }
    return landingFinished;
};

// export as JSON
"use strict";

function exportToJsonFile(jsonData) {
    let dataStr = JSON.stringify(jsonData);
    let dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);

    let exportFileDefaultName = 'data.json';

    let linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
}