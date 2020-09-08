let GameConst = {
    // 页面层级
    PAGE_LAYER_MAIN_PAGE: 1,            // 主页面
    PAGE_LAYER_TOP_BAR_DOWN: 5,         // 顶部信息条下面
    PAGE_LAYER_TOP_BAR: 10,             // 主页面顶部信息条
    PAGE_LAYER_TOP_BAR_UP: 15,          // 顶部信息条上面
    PAGE_LAYER_TIP: 100,                // 提示条
    PAGE_LAYER_LOADING_CYCLE: 100,      // 菊花

    // 游戏存储key （各游戏需替换游戏前缀）
    SAVE_PLAYER_BASE_DATA: "CATAN_SAVE_PLAYER_BASE_DATA",         // 玩家基础信息
    SAVE_ITEM_DATA: "CATAN_SAVE_ITEM_DATA",                       // 背包物品数据

    // map种类
    MAP_BRICK: "brick",     // 砖
    MAP_RICE: "rice",       // 麦子
    MAP_SHEEP: "sheep",     // 羊
    MAP_STONE: "stone",     // 矿
    MAP_WOOD: "wood",       // 木头
    MAP_ROBBER: "robber",   // 强盗

    MAP_OFFSET_X: 118.8,    // 地块x距离
    MAP_OFFSET_Y: 70.6,     // 地块y距离

    ROB_NUMBER: 7,          // 抢劫数字

    roleColors: {
        ROLE_COLOR_RED: "#ff1835",          // 红色
        ROLE_COLOR_YELLOW: "#ffd918",       // 黄色
        ROLE_COLOR_GREEN: "#76ff20",        // 绿色
        ROLE_COLOR_BLUE: "#12d8ff",         // 蓝色
        ROLE_COLOR_PURPLE: "#3e13ac",       // 紫色
        ROLE_COLOR_BROWN: "#5f2e05",        // 褐色
    },

    mapTypes: {
        "rice": 4,
        "sheep": 4,
        "wood": 4,
        "brick": 3,
        "stone": 3,
    },

    // 资源名字
    sourceName: {
        wood: "木头",
        brick: "砖块",
        sheep: "羊毛",
        rice: "麦子",
        stone: "矿石"
    },

    ratioTypes: {
        "2": 1,
        "3": 2,
        "4": 2,
        "5": 2,
        "6": 2,
        "8": 2,
        "9": 2,
        "10": 2,
        "11": 2,
        "12": 1,
    },

    buildType: {
        smallCity: 101,
        bigCity: 102,
        road: 103
    },

    exchangeType: {
        // 发起与玩家交换
        player: 1,
        // 发起与银行交换
        bank: 2,
        // 收到玩家交换请求
        receive: 3,
    },

    exchangeBtnColor: {
        enable: "#1D363B",
        disable: "#0E1A1C",
    },

    // 祝贺类型
    CongratulationTypes: {
        MAX_ROAD_LENGTH: 1,
        MAX_ROB_TIMES: 2,
    },

    // 技能类型
    SkillType: {
        // 士兵
        soldier: 1,
        // 道路建设
        roadBuilding: 2,
        // 丰收之年
        goodHarvest: 3,
        // 垄断
        monopoly: 4,
        // 分数 1 点
        score: 5,
    },

};
module.exports = GameConst;