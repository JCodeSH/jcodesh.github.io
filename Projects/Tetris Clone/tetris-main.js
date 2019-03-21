console.log('tetris-main.js loaded');

var TMS = new TM.ScreenManager(screenSetting, charGroups),
    TMI = new TM.InputManager(screenSetting.canvasId, debugSetting.devMode),
    TMD = new TM.DebugManager(debugSetting);

var MAIN = {
    programs: {
        intro: new Program_Intro(),
        game: new Program_Game(),
    },
    data: {
        scores: {
            lastScore: 0,
            bestScore: 0,
            currentScore: 0,
            nextPiece: -1,
            isGameOver: 0,
            isPause: 0,
        }
    },
    init: function () {
        TMS.cursor.hide();
        this.inactivate();
        this.programs.intro.init();
    },
    inactivate: function () {
        for (var i in this.programs) {
            var program = this.programs[i];
            program.inactivate();
        }
    },
    changeProgram: function (program) {
        this.inactivate();
        program.init();
    },
};

TMS.onReady(function () {
    MAIN.init();
});
