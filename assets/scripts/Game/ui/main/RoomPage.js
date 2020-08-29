let jkr = require("Jkr");

cc.Class({
    extends: jkr.BaseUI,

    properties: {
        roomItemPrefab: cc.Prefab,

        itemContent: cc.Node,
        noticeNode: cc.Node,

        nickNameLabel: cc.Label,
    },

    start () {
        let msg = {
            type: jkr.messageType.CS_SYNC_ROOM
        };
        jkr.player.sendMessage(msg);
        this.roomItemObjs = [];

        this.node.opacity = 1;
        cc.tween(this.node)
            .to(1, {opacity: 255})
            .start();
    },

    onEnable() {
        this.refreshPlayerName();
    },

    registerGameListener: function() {
        this.registerListener(jkr.GameEventType.PLAYER_NAME_CHANGE, () => this.refreshPlayerName());
    },

    refreshPlayerName: function() {
        this.nickNameLabel.string = jkr.player.playerModule.getNickName();
    },

    onReceiveRooms: function(roomsData) {
        for (let i = 0; i < roomsData.length; i++) {
            let eachRoom = roomsData[i];
            if (eachRoom.masterId === jkr.player.getPlayerId() && jkr.player.getCurrentRoomId() !== eachRoom.roomId) {
                jkr.gameScene.showRoomDetailPopUp(eachRoom);
                jkr.gameScene.showTipsItemRender("房间创建成功!", 0.5);
            }
            if (eachRoom.roomId === jkr.player.getCurrentRoomId()) {
                jkr.eventBus.dispatchEvent(jkr.GameEventType.ROOM_DETAIL_REFRESH, eachRoom);
            }
            let roomObj = this.findRoomObj(eachRoom.roomId);
            if (roomObj) {
                roomObj.initRoomData(eachRoom);
                return;
            }
            let roomItem = cc.instantiate(this.roomItemPrefab);
            roomObj = roomItem.getComponent("RoomItem");
            roomObj.initRoomData(eachRoom);
            roomItem.parent = this.itemContent;
            this.roomItemObjs.push(roomObj);
        }
        this.updateNotice();
    },

    onDeleteRoom: function(roomId) {
        let deleteRoom = null;
        for (let i = 0; i < this.roomItemObjs.length; i++) {
            let roomObj = this.roomItemObjs[i];
            if (roomObj.roomId === roomId) {
                deleteRoom = roomObj;
                break;
            }
        }
        if (deleteRoom) {
            deleteRoom.node.destroy();
            jkr.Utils.removeElement(this.roomItemObjs, deleteRoom);
        }
        jkr.Logger.debug("room:", roomId, "deleted");
        this.scheduleOnce(() => this.updateNotice(), 0.1);
    },

    findRoomObj: function(roomId) {
        for (let i = 0; i < this.roomItemObjs.length; i++) {
            let eachRoomObj = this.roomItemObjs[i];
            if (eachRoomObj.roomId === roomId) {
                return eachRoomObj;
            }
        }
    },
    
    updateNotice: function() {
        this.noticeNode.active = this.itemContent.children.length <= 0;
        jkr.Logger.debug("this.noticeNode.active:", this.noticeNode.active, "this.itemContent.children.length:", this.itemContent.children.length);
    },

    onClickCreateRoom: function() {
        jkr.Logger.debug("roomId:", !!jkr.player.getRoomId());
        if (jkr.player.getRoomId()) {
            return;
        }
        let msg = {
            type: jkr.messageType.CS_CREATE_ROOM,
        };
        jkr.player.sendMessage(msg);
    },

    onClickSetting: function() {
        jkr.gameScene.showSettingPage();
    },

});
