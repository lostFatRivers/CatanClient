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

    initGameRoles: function(roomId, roleIndex, roles) {
        this.roomId = roomId;

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
                { name: 'toOperate',  from: 'throwing',       to: 'operating',            desc: '操作'},
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

    showColorPopUp: function() {
        jkr.Logger.debug("go to select color");
        this.selectedColorNum = 0;
        jkr.gameScene.hideRoomPage();
        jkr.gameScene.showColorPopUp();
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
});

jkr.player = Player.getInstance();