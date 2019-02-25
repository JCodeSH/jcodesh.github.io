console.log('tetris-settings.js loaded');

var screenSetting = {
    fontSize: 30,
    zoom: 0.6,
    column: 70,
    row: 26,
    fontFamily: 'Nanum Gothic Coding',
    fontSource: 'https://fonts.googleapis.com/css?family=Nanum+Gothic+Coding',
};

var charGroups = {
    fullwidth: {// ■□★☆△▷▽◁...
        chars: '\u2500-\u2BFF\u2022\u2008',
        isFullwidth: true,
        sizeAdj: 1.2,
        xAdj: -0.05,
        yAdj: 0.03,
    },
};

var debugSetting = {
    devMode: true,
};

var GAME_SETTINGS = {
    COL_NUM: 12,
    ROW_NUM: 24,
    SPEED_LOOKUP: [80, 60, 40, 20, 10, 8, 4, 2, 1, 0],
    KEYSET: {
        QUIT: 27, // esc key
        PAUSE: 80, // 'p';
    },
    COLORSET: {
        WALL: '#F5F7FA',
        CEILING: '#656D78',
        BLOCKS: ['#48CFAD', '#FFCE54', '#FC6E51', '#EC87C0', '#AC92EC', '#4FC1E9', '#A0D468'],
        GAME_OVER_BLOCK: '#AAB2BD',
    },
    PLAYER1: {
        KEYSET: {
            RIGHT: 39,
            LEFT: 37,
            ROTATE: 38,
            DOWN: 40,
            DROP: 32, //space key
        }
    },
};
