const jkr = require("Jkr");

let ServerMessageModule = cc.Class({
    extends: jkr.BaseHandler,

    properties: {},

    registerSelf: function() {
        jkr.handlerManager.registerHandler(jkr.messageType.SC_PLAYER_ENTER, msg => this.onEnterServer(msg));
        jkr.handlerManager.registerHandler(jkr.messageType.SC_SYNC_ROOM, msg => this.onSyncRoom(msg));
        jkr.handlerManager.registerHandler(jkr.messageType.SC_DELETE_ROOM, msg => this.onDeleteRoom(msg));
        jkr.handlerManager.registerHandler(jkr.messageType.SC_EXIT_ROOM, msg => this.onExitRoom(msg));
        jkr.handlerManager.registerHandler(jkr.messageType.SC_JOIN_ROOM, msg => this.onJoinRoom(msg));
        jkr.handlerManager.registerHandler(jkr.messageType.SC_START_GAME, msg => this.onGameStart(msg));
        jkr.handlerManager.registerHandler(jkr.messageType.SC_SYNC_ROOM_STATUS, msg => this.onStatusChange(msg));
        jkr.handlerManager.registerHandler(jkr.messageType.SC_COLOR_SELECT, msg => this.onColorChange(msg));
        jkr.handlerManager.registerHandler(jkr.messageType.SC_BUILD_ROAD, msg => this.onBuildRoad(msg));
        jkr.handlerManager.registerHandler(jkr.messageType.SC_BUILD_CITY, msg => this.onBuildCity(msg));
        jkr.handlerManager.registerHandler(jkr.messageType.SC_THROW_DICE, msg => this.onSyncDice(msg));
        jkr.handlerManager.registerHandler(jkr.messageType.SC_TURN_NEXT_ONE, msg => this.onTurnNext(msg));
        jkr.handlerManager.registerHandler(jkr.messageType.SC_SYNC_ROLE_VIEW, msg => this.onInfoUpdate(msg));
        jkr.handlerManager.registerHandler(jkr.messageType.SC_START_EXCHANGE, msg => this.onStartExchange(msg));
    },

    init: function (player) {
        this.player = player;
        jkr.Logger.debug("ServerMessageModule init.");
    },

    onEnterServer: function(msg) {
        jkr.Logger.debug("player enter server success.");
    },

    onSyncRoom: function(msg) {
        if (!msg.rooms || msg.rooms.length <= 0) {
            jkr.Logger.debug("room is empty");
            return;
        }
        jkr.Logger.debug("receive room data:", JSON.stringify(msg.rooms));
        jkr.gameScene.roomPageObj.onReceiveRooms(msg.rooms);
    },

    onDeleteRoom: function(msg) {
        jkr.Logger.debug("onDeleteRoom success.");
        if (jkr.player.getCurrentRoomId() === msg.roomId) {
            jkr.gameScene.hideRoomDetailPopUp();
        }
        jkr.gameScene.roomPageObj.onDeleteRoom(msg.roomId);
    },

    onExitRoom: function(msg) {
        jkr.Logger.debug("onExitRoom success.");
        jkr.gameScene.hideRoomDetailPopUp();
    },

    onJoinRoom: function(msg) {
        jkr.Logger.debug("onJoinRoom success.");
        jkr.gameScene.showRoomDetailPopUp(msg.roomData);
    },

    onGameStart: function(msg) {
        jkr.Logger.debug("onGameStart success.");
        jkr.Utils.seed = msg.seed;
        let myGameIndex = msg.playerIndex;
        let roles = msg.allGameRoles;
        jkr.Logger.debug("my role index:", myGameIndex, "all roles:", JSON.stringify(roles));
        jkr.player.initGameRoles(msg.roomId, myGameIndex, roles);
        jkr.player.initStateMachine();
        jkr.gameScene.hideRoomDetailPopUp();
        jkr.gameScene.showMainPage();
    },

    onStatusChange: function(msg) {
        jkr.Logger.debug("onStatusChange success. msg:", JSON.stringify(msg));
        let status = msg.status;
        let trans = msg.trans;
        let gameSM = this.player.getGameSM();
        if (gameSM.is(status) || !gameSM.can(trans)) {
            jkr.Logger.debug("status change error:", gameSM.state);
            return;
        }
        if (trans === "begin") {
            gameSM.begin();
        } else if (trans === "toPre1") {
            gameSM.toPre1();
        } else if (trans === "toPre2") {
            gameSM.toPre2();
        } else if (trans === "throwDice") {
            gameSM.throwDice();
        } else if (trans === "toOperate") {
            gameSM.toOperate();
        } else if (trans === "toNext") {
            gameSM.toNext();
        }
    },

    onColorChange: function(msg) {
        jkr.Logger.debug("onColorChange success.");
        let isSuccess = msg.success;
        if (!isSuccess) {
            jkr.eventBus.dispatchEvent(jkr.GameEventType.COLOR_SELECT_FAILED);
            return;
        }
        jkr.Logger.debug("onColorChange success.", msg.roleIndex, msg.colorStr);
        jkr.player.updateRoleColor(msg.roleIndex, msg.colorStr);
        jkr.eventBus.dispatchEvent(jkr.GameEventType.SYNC_ROLE_COLOR, msg);
    },

    onBuildRoad: function(msg) {
        jkr.Logger.debug("onBuildRoad success.", JSON.stringify(msg));
        jkr.gameScene.mainPageObj.onBuildRoad(msg.roadKey, msg.roleIndex);
    },

    onBuildCity: function(msg) {
        jkr.Logger.debug("onBuildCity success.", JSON.stringify(msg));
        jkr.gameScene.mainPageObj.onBuildCity(msg.cityKey, msg.roleIndex, msg.cityType);
    },

    onSyncDice: function(msg) {
        jkr.Logger.debug("onSyncDice success.", JSON.stringify(msg));
        jkr.eventBus.dispatchEvent(jkr.GameEventType.SYNC_DICE, msg);
    },

    onTurnNext: function(msg) {
        jkr.Logger.debug("onTurnNext success.", JSON.stringify(msg));
        jkr.gameScene.mainPageObj.turnToNextRound();
    },

    onInfoUpdate: function(msg) {
        jkr.Logger.debug("onInfoUpdate success.", JSON.stringify(msg));
        jkr.player.updateRoleInfo(msg);
    },

    onStartExchange: function(msg) {
        jkr.Logger.debug("onStartExchange success.", JSON.stringify(msg));
        if (msg.roleIndex === jkr.player.getMyRoleIndex()) {
            jkr.gameScene.showOtherExchangeBackPopUp();
        } else {
            jkr.gameScene.showExchangePopUp({
                type: jkr.constant.exchangeType.receive,
                receiveExchangeInfo: msg
            })
        }
    },
});