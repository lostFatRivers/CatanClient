const jkr = require("Jkr");

// 游戏常用
const config = {
    gameType: 11111111,

    LOGGER_LEVEL: "debug",

    // h5顶部下降
    h5TopPullDown: true,

    wsServiceUrl: "ws://192.168.1.222:7008/websocket",
};

jkr.config = config;