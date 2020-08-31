const jkr = require("Jkr");

let PlayerBaseModule = require("PlayerBaseModule");
let ServerMessageModule = require("ServerMessageModule");

let Player = cc.Class({
    extends: cc.Object,

    properties: {
        _playerId: 0,

        playerModule: null,
        messageModule: null,

        serverConnector: null,

        _initFinish: false
    },

    statics: {
        _instance: null,
        getInstance: function() {
            if (!this._instance) {
                this._instance = new Player();
            }
            return this._instance;
        },
    },

    ctor: function() {
        this.playerModule = new PlayerBaseModule();
        this.messageModule = new ServerMessageModule();
    },

    initModule: function () {
        // 必须在第一个
        this.playerModule.init(this);
        this.messageModule.init(this);
    },

    init: function() {
        if (this._initFinish) {
            return;
        }
        this._gameData = {};
        this.initModule();

        jkr.eventBus.addListener(jkr.GameEventType.RECEIVE_SIMPLE_MESSAGE, textMsg => this.receiveMessage(textMsg));
        this.serverConnector = new jkr.SimpleNetClient();
        this._initFinish = true;
    },

    isInitFinish: function() {
        return this._initFinish;
    },

    connectServer: function() {
        this.serverConnector.connect(
            jkr.config.wsServiceUrl,
            () => this.connectServerSuccess(),
            () => this.serverConnectClosed());
    },

    connectServerSuccess: function() {
        jkr.gameScene.delayTask(() => {
            jkr.gameScene.hideLoadingCycle();
            jkr.gameScene.showTipsItemRender("服务器连接成功!", 0.8);
        }, 1.5);
        let msg = {
            type: jkr.messageType.CS_PLAYER_ENTER,
            playerId: this._gameData.playerBaseData.account,
            name: this._gameData.playerBaseData.nickName
        };
        this.sendMessage(msg);
    },

    serverConnectClosed: function() {
        jkr.gameScene.showLoadingCycle();
        jkr.gameScene.showTipsItemRender("服务器连接失败, 请检查网络.", 0.8);
    },
    
    sendMessage: function(jsonData) {
        this.serverConnector.send(JSON.stringify(jsonData));
    },

    receiveMessage: function(textMessage) {
        if (typeof textMessage !== "string") {
            jkr.Logger.warn("receive message not text:", typeof textMessage);
            return;
        }
        let jsonMsg = JSON.parse(textMessage);
        if (!jsonMsg.type) {
            jkr.Logger.debug("message type is null:", textMessage);
            return;
        }
        jkr.handlerManager.onMessage(jsonMsg.type, jsonMsg);
    },

    clearGameData: function() {
        this.roomId = null;
        this.selfRoleIndex = -1;
        this.gameRoles = {};
        this.selfResources = {};
        this.gameStateMachine = null;
        this.gameRoleSize = 0;
        this.roomMaster = null;
    },

    initGameRoles: function(roomId, roleIndex, roles, roomMaster) {
        this.roomId = roomId;

        this.roomMaster = roomMaster;

        // 自己的玩家下标
        this.selfRoleIndex = roleIndex;

        this.gameRoles = {};

        for (let i = 0; i < roles.length; i++) {
            let eachRole = roles[i];
            this.gameRoles[eachRole.roleIndex] = {
                index: eachRole.roleIndex,
                color: eachRole.colorStr,
                roleName: eachRole.roleName,
                roleId: eachRole.roleId,
                // 占领的城
                cities: [],
                // 占领的地
                roads: [],
                // 资源卡数
                sourceCardNum: 0,
                // 技能卡数
                skillCardNum: 0,
                // 使用骑士次数
                robTimes: 0,
                // 当前最长路长度
                roadLength: 0,
                // 总得分
                totalScore: 0,

                cityScore: 0,
                cardScore: 0,

                isMaxRobTimes: false,
                isMaxRoadLength: false,

                preCityKey: "",

                preCity1Build: false,
                preRoad1Build: false,

                preCity2Build: false,
                preRoad2Build: false,
            }
        }

        // 自己的资源
        this.selfResources = {
            brick: 0,
            rice: 0,
            sheep: 0,
            stone: 0,
            wood: 0,
        };

        // 玩家个数
        this.gameRoleSize = roles.length;
    },

    initStateMachine: function() {
        this.gameStateMachine = new jkr.StateMachine({
            init: 'preparing',
            transitions: [
                { name: 'begin',    from: 'preparing',      to: 'colorChoosing',        desc: '选择颜色'},
                { name: 'toPre1',   from: 'colorChoosing',  to: 'preRound1',            desc: '第一轮放城和路'},
                { name: 'toPre2',   from: 'preRound1',      to: 'preRound2',            desc: '第二轮放城和路'},
                { name: 'throwDice',from: ['preRound2', 'roundEnd'],    to: 'throwing', desc: '扔骰子'},
                { name: 'toOperate',  from: 'throwing',     to: 'operating',            desc: '操作'},
                { name: 'toNext',   from: 'operating',      to: 'roundEnd',             desc: '自己操作完毕, 下一个'},
            ],
            methods: {
                onColorChoosing: (sl, res) => this.showColorPopUp(),
                onLeaveColorChoosing: (sl, res) => this.hideColorPopUp(),
                onPreRound1: (sl, res) => this.preRoundStart(1),
                onPreRound2: (sl, res) => this.preRoundStart(2),
                onLeavePreRound2: (sl, res) => this.preRoundEnd(),
                onThrowDice: (sl, res) => this.showDiceThrowPopUp(),
                onLeaveThrowing: (sl, res) => this.throwDiceFinish(),
                onLeaveRoundEnd: (sl, res) => this.roundEnd(),
            }
        });
    },
    
    isRoomMaster: function() {
        return this.roomMaster === this._gameData.playerBaseData.account;
    },

    showColorPopUp: function() {
        jkr.Logger.debug("go to select color");
        this.selectedColorNum = 0;
        jkr.gameScene.hideRoomPage();
        jkr.gameScene.showColorPopUp();
        jkr.gameScene.showChatInput();
    },

    hideColorPopUp: function() {
        jkr.Logger.debug("select color finished");
        jkr.gameScene.hideColorPopUp();
        jkr.gameScene.slowShowMainPage();
    },

    preRoundStart: function(roundIndex) {
        jkr.Logger.debug("preRound Start:", roundIndex);
        if (roundIndex === 1) {
            this.currentPreOperateRoleIndex = 0;
        } else if (roundIndex === 2) {
            this.currentPreOperateRoleIndex = this.gameRoleSize - 1;
        }
        this.roundPlayerNotice(this.currentPreOperateRoleIndex);
    },

    preRoundEnd: function() {
        this.gameRoundIndex = 0;
        jkr.Logger.debug("preRound end, game start.");
    },

    showDiceThrowPopUp: function() {
        jkr.Logger.debug("go to show dice");
        jkr.gameScene.showDicePopUp();
    },

    throwDiceFinish: function() {
        jkr.gameScene.hideDicePopUp();
    },

    roundEnd: function() {
        this.gameRoundIndex++;
        if (this.gameRoundIndex >= this.gameRoleSize) {
            this.gameRoundIndex = 0;
        }
    },

    getGameSM: function() {
        return this.gameStateMachine;
    },

    getMyRoleIndex: function() {
        return this.selfRoleIndex;
    },

    getMyColor: function() {
        return this.gameRoles[this.selfRoleIndex].color;
    },

    getName: function() {
        return this._gameData.playerBaseData.nickName;
    },
    
    getPlayerId: function() {
        return this._gameData.playerBaseData.account;
    },

    setCurrentRoomId: function(roomId) {
        this.currentRoomId = roomId;
    },

    getCurrentRoomId: function() {
        return this.currentRoomId;
    },

    setMyColor: function(colorStr) {
        this.selectedColorNum++;
        this.gameRoles[this.selfRoleIndex].color = colorStr;
    },

    checkSelectedColorNum: function() {
        if (this.selectedColorNum < this.gameRoleSize) {
            return;
        }
        jkr.Logger.debug("[1] select color num:", this.gameStateMachine.can('toPre1'));
        if (this.gameStateMachine.can('toPre1')) {
            this.gameStateMachine.toPre1();
        }
    },

    inMyPreRound: function() {
        if (this.gameStateMachine.is("preRound1")
            || this.gameStateMachine.is("preRound2")) {
            return this.currentPreOperateRoleIndex === this.selfRoleIndex;
        }
        return false;
    },

    checkPreRound: function() {
        if (this.gameStateMachine.is("preRound1")) {
            let currentRoleData = this.getRoleData(this.currentPreOperateRoleIndex);
            if (currentRoleData.preCity1Build && currentRoleData.preRoad1Build) {
                this.currentPreOperateRoleIndex++;
                this.roundPlayerNotice(this.currentPreOperateRoleIndex);
            }
            if (this.currentPreOperateRoleIndex > this.gameRoleSize - 1) {
                this.gameStateMachine.toPre2();
            }
        }
        if (this.gameStateMachine.is("preRound2")) {
            let currentRoleData = this.getRoleData(this.currentPreOperateRoleIndex);
            if (currentRoleData.preCity2Build && currentRoleData.preRoad2Build) {
                this.currentPreOperateRoleIndex--;
                this.roundPlayerNotice(this.currentPreOperateRoleIndex);
            }
            if (this.currentPreOperateRoleIndex < 0) {
                this.gameStateMachine.throwDice();
            }
        }
    },

    addSelfResource: function(resourceType, num) {
        this.selfResources[resourceType] += num;
        let selfRoleData = this.getRoleData(this.selfRoleIndex);
        selfRoleData.sourceCardNum = this.getTotalResourceNum();
    },

    getResourceNum: function(resourceType) {
        return this.selfResources[resourceType];
    },
    
    getTotalResourceNum: function() {
        let totalNum = 0;
        totalNum += this.selfResources.brick;
        totalNum += this.selfResources.rice;
        totalNum += this.selfResources.sheep;
        totalNum += this.selfResources.stone;
        totalNum += this.selfResources.wood;
        return totalNum;
    },

    refreshResourceView: function() {
        let selfRoleData = this.getRoleData(this.selfRoleIndex);
        selfRoleData.sourceCardNum = this.getTotalResourceNum();
        this.syncInfoToAll();
        jkr.eventBus.dispatchEvent(jkr.GameEventType.ROLE_DATA_REFRESH + this.selfRoleIndex);
    },
    
    syncInfoToAll: function() {
        let selfRoleData = this.getRoleData(this.selfRoleIndex);
        let msg = {
            type: jkr.messageType.CS_SYNC_ROLE_VIEW,
            sourceCardNum: selfRoleData.sourceCardNum,
            skillCardNum: selfRoleData.skillCardNum,
            robTimes: selfRoleData.robTimes,
            roadLength: selfRoleData.roadLength,
            totalScore: selfRoleData.totalScore
        };
        this.sendMessage(msg);
    },
    
    updateRoleInfo: function(msg) {
        let roleIndex = msg.roleIndex;
        let roleData = this.getRoleData(roleIndex);
        roleData.sourceCardNum = msg.sourceCardNum;
        roleData.skillCardNum = msg.skillCardNum;
        roleData.robTimes = msg.robTimes;
        roleData.roadLength = msg.roadLength;
        roleData.totalScore = msg.totalScore;
        jkr.eventBus.dispatchEvent(jkr.GameEventType.ROLE_DATA_REFRESH + roleIndex);
    },

    getRoomId: function() {
        return this.roomId;
    },

    isMyRound: function() {
        return this.selfRoleIndex === this.gameRoundIndex;
    },

    updateRoleColor: function(roleIndex, colorStr) {
        let roleInfo = this.gameRoles[roleIndex];
        roleInfo.color = colorStr;
    },

    getRoleData: function(roleIndex) {
        return this.gameRoles[roleIndex];
    },
    
    roundPlayerNotice: function(roleIndex) {
        let roleInfo = this.gameRoles[roleIndex];
        if (!roleInfo) {
            return;
        }
        jkr.gameScene.showTipsItemRender("玩家: '" + roleInfo.roleName + "' 操作中...")
    },

    // 检查资源是否足够
    checkResource: function(needBrick = 0, needRice = 0, needSheep = 0, needStone = 0, needWood = 0) {
        return !(this.selfResources.brick < needBrick
            || this.selfResources.rice < needRice
            || this.selfResources.sheep < needSheep
            || this.selfResources.stone < needStone
            || this.selfResources.wood < needWood);
    },

    // 消耗资源并同步
    costResource: function(costBrick = 0, costRice = 0, costSheep = 0, costStone = 0, costWood = 0) {
        this.selfResources.brick -= costBrick;
        this.selfResources.rice -= costRice;
        this.selfResources.sheep -= costSheep
        this.selfResources.stone -= costStone;
        this.selfResources.wood -= costWood;

        this.refreshResourceView();
    },

    onExchangedResource: function(exchangeData) {
        this.selfResources.brick = this.selfResources.brick + exchangeData.inBrickNum - exchangeData.outBrickNum;
        this.selfResources.rice = this.selfResources.rice + exchangeData.inRiceNum - exchangeData.outRiceNum;
        this.selfResources.sheep = this.selfResources.sheep + exchangeData.inSheepNum - exchangeData.outSheepNum;
        this.selfResources.stone = this.selfResources.stone + exchangeData.inStoneNum - exchangeData.outStoneNum;
        this.selfResources.wood = this.selfResources.wood + exchangeData.inWoodNum - exchangeData.outWoodNum;

        this.refreshResourceView();
    },

    getSourceBankRatio: function(sourceName) {
        return 4;
    },
    
    addSelfCity: function(cityKey) {
        let selfRoleData = this.getRoleData(this.selfRoleIndex);
        selfRoleData.cities.push(cityKey);
    },

    addSelfRoad: function(roadKey) {
        let selfRoleData = this.getRoleData(this.selfRoleIndex);
        selfRoleData.roads.push(roadKey);
        jkr.Logger.debug("all roads:", JSON.stringify(selfRoleData.roads));
        this.countRoadMaxLength();
    },

    // 造城加分
    addCityScore: function() {
        let selfRoleData = this.getRoleData(this.selfRoleIndex);
        selfRoleData.cityScore++;
        this.refreshSelfTotalScore();
    },

    // 刷新总分 (不包括得分卡)
    refreshSelfTotalScore: function() {
        let selfRoleData = this.getRoleData(this.selfRoleIndex);
        let cityScore = selfRoleData.cityScore;
        let maxRoadLengthScore = selfRoleData.isMaxRoadLength ? 2 : 0;
        let maxRobTimesScore = selfRoleData.isMaxRobTimes ? 2 : 0;
        selfRoleData.totalScore = cityScore + maxRoadLengthScore + maxRobTimesScore;
        this.refreshResourceView();
    },

    /**
     * 寻找最长路长度:
     *  1. 找出路的起点
     *  2. 列举所有路线
     *  3. 比较路线长度
     */
    countRoadMaxLength: function() {
        let selfRoleData = this.getRoleData(this.selfRoleIndex);
        let roads = selfRoleData.roads;

        let roadPointTupleArray = [];
        for (let i = 0; i < roads.length; i++) {
            let eachRoad = roads[i];
            let points = eachRoad.split("||");
            roadPointTupleArray.push(points);
        }
        let startPoints = this.findStartPoints(roadPointTupleArray);
        let allWays = this.walkAllRoadWay(startPoints, roadPointTupleArray);

        let maxLength = 0;
        for (let i = 0; i < allWays.length; i++) {
            let eachWay = allWays[i];
            if (eachWay.length > maxLength) {
                maxLength = eachWay.length;
            }
        }
        jkr.Logger.debug("road max length:", maxLength);
        if (maxLength > selfRoleData.roadLength) {
            selfRoleData.roadLength = maxLength;
            this.syncInfoToAll();
        }
    },

    // 寻找路径起始点, 路径可能不连续, 所以可能有多个
    findStartPoints: function(roadPoints) {
        let startPoints = [];
        out:
            for (let i = 0; i < roadPoints.length; i++) {
                let eachRoad = roadPoints[i];
                let leftPoint = eachRoad[0];
                for (let j = 0; j < roadPoints.length; j++) {
                    let eachCompareRoad = roadPoints[j];
                    if (i === j) continue;
                    if (eachCompareRoad[1] === leftPoint) continue out;
                }
                startPoints.push(eachRoad);
            }
        // 防止环状路径找不到起始点
        if (startPoints.length <= 0) {
            startPoints.push(roadPoints[0]);
        }
        return startPoints;
    },

    // 依次从起始点寻找所有路线
    walkAllRoadWay: function(startPoints, roadPoints) {
        let allWays = [];
        for (let i = 0; i < startPoints.length; i++) {
            let startPoint = startPoints[i];
            let ways = [startPoint];
            this.walkRoadWayWithStart(-1, ways, roadPoints, allWays);
        }
        return allWays;
    },

    walkRoadWayWithStart: function(compareIndex, ways, roadPoints, targets) {
        let startPoint = ways[ways.length - 1];
        let ended = true;
        for (let i = 0; i < roadPoints.length; i++) {
            let eachPoint = roadPoints[i];
            let nextCompareIndex = -1;
            if (compareIndex === 0) {
                // 第一个点作为下个路的起点
                if (eachPoint[0] === startPoint[0] && eachPoint[1] !== startPoint[1]) {
                    nextCompareIndex = 1;
                } else if (eachPoint[1] === startPoint[0] && eachPoint[0] !== startPoint[1]) {
                    nextCompareIndex = 0;
                }
            } else if (compareIndex === 1) {
                // 第二个点作为下个路的起点
                if (eachPoint[0] === startPoint[1] && eachPoint[1] !== startPoint[0]) {
                    nextCompareIndex = 1;
                } else if (eachPoint[1] === startPoint[1] && eachPoint[0] !== startPoint[0]) {
                    nextCompareIndex = 0;
                }
            } else {
                // 未知点起点
                if (eachPoint[0] === startPoint[0] && eachPoint[1] !== startPoint[1]) {
                    nextCompareIndex = 1;
                } else if (eachPoint[1] === startPoint[0] && eachPoint[0] !== startPoint[1]) {
                    nextCompareIndex = 0;
                } else if (eachPoint[0] === startPoint[1] && eachPoint[1] !== startPoint[0]) {
                    nextCompareIndex = 1;
                } else if (eachPoint[1] === startPoint[1] && eachPoint[0] !== startPoint[0]) {
                    nextCompareIndex = 0;
                }
            }

            // 点不相连
            if (nextCompareIndex === -1)
                continue;
            // 路径形成环状
            if (ways.indexOf(eachPoint) >= 0)
                continue;

            // 有下一个相连点
            ended = false;
            let eachWay = [];
            eachWay.push(...ways);
            eachWay.push(eachPoint);
            this.walkRoadWayWithStart(nextCompareIndex, eachWay, roadPoints, targets);
        }
        // 路径到达终点
        if (ended) {
            targets.push(ways);
        }
    },

    roleMaxRoadLength: function(roleIndex, roadLength) {
        let selfRoleData = this.getRoleData(this.selfRoleIndex);
        if (selfRoleData.index === roleIndex) {
            if (!selfRoleData.isMaxRoadLength) {
                selfRoleData.isMaxRoadLength = true;
                this.refreshSelfTotalScore();
            }
        } else {
            if (selfRoleData.isMaxRoadLength) {
                selfRoleData.isMaxRoadLength = false;
                this.refreshSelfTotalScore();
            }
        }
        let maxRoleData = this.getRoleData(roleIndex);
        jkr.gameScene.showCongratulations(jkr.constant.CongratulationTypes.MAX_ROAD_LENGTH, maxRoleData.roleName, maxRoleData.color, roadLength)
    },

    roleMaxRobTimes: function(roleIndex, robTimes) {
        let selfRoleData = this.getRoleData(this.selfRoleIndex);
        if (selfRoleData.index === roleIndex) {
            if (!selfRoleData.isMaxRobTimes) {
                selfRoleData.isMaxRobTimes = true;
                this.refreshSelfTotalScore();
            }
        } else {
            if (selfRoleData.isMaxRobTimes) {
                selfRoleData.isMaxRobTimes = false;
                this.refreshSelfTotalScore();
            }
        }
        let maxRoleData = this.getRoleData(roleIndex);
        jkr.gameScene.showCongratulations(jkr.constant.CongratulationTypes.MAX_ROB_TIMES, maxRoleData.roleName, maxRoleData.color, robTimes)
    },

    setRobberOver: function(isOver) {
        this.robberOver = isOver;
    },

    robberDone: function() {
        return this.robberOver;
    },

    randomRobbedSource: function() {
        let sourceTypeArray = [];
        for (let eachKey in this.selfResources) {
            if (!this.selfResources.hasOwnProperty(eachKey)) {
                continue;
            }
            let sourceNum = this.selfResources[eachKey];
            if (sourceNum > 0) {
                sourceTypeArray.push(eachKey);
            }
        }
        let randomKey = jkr.Utils.getRandomItemInList(sourceTypeArray);
        this.selfResources[randomKey] -= 1;

        let msg = {
            type: jkr.messageType.CS_PLAYER_SELECTED_ROB_TARGET,
            sourceType: randomKey,
        };
        this.sendMessage(msg);

        jkr.gameScene.delayTask(() => {
            this.refreshResourceView();
        }, 0.1);
    },
});

jkr.player = Player.getInstance();