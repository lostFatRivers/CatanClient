let jkr = require("Jkr");

cc.Class({
    extends: jkr.BasePage,

    properties: {
        memberNodes: [cc.Node],
        startBtnNode: cc.Button
    },

    registerGameListener: function() {
        this.registerListener(jkr.GameEventType.ROOM_DETAIL_REFRESH, rData => {
            this.setData(rData);
            this.refreshRoom()
        });
    },

    /**
     * 页面动画前回调
     */
    showPageBegan() {
        this.refreshRoom();
        jkr.gameScene.showChatInput();
    },

    /**
     * 页面关闭动画后回调
     */
    closePageEnded() {
        jkr.Logger.debug("退出房间");
        jkr.player.setCurrentRoomId(0);
        jkr.gameScene.hideChatInput();
    },

    refreshRoom: function() {
        jkr.Logger.debug("刷新房间:", JSON.stringify(this.data));
        let roomMembers = this.data.members;
        let playerIds = Object.keys(roomMembers);
        for (let i = 0; i < this.memberNodes.length; i++) {
            let eachNode = this.memberNodes[i];
            let eachId = playerIds[i];
            if (!eachId) {
                eachNode.opacity = 1;
                continue;
            }
            eachNode.opacity = 255;
            cc.find("name", eachNode).getComponent(cc.Label).string = roomMembers[eachId];
        }
        this.startBtnNode.interactable = this.data.masterId === jkr.player.getPlayerId();
        jkr.player.setCurrentRoomId(this.data.roomId);
    },

    onClickStart: function() {
        let msg = {
            type: jkr.messageType.CS_START_GAME,
            roomId: this.data.roomId,
        };
        jkr.player.sendMessage(msg);
    },

    onClickExit: function() {
        if (this.data.masterId === jkr.player.getPlayerId()) {
            let msg = {
                type: jkr.messageType.CS_DELETE_ROOM,
                roomId: this.data.roomId,
            };
            jkr.player.sendMessage(msg);
        } else {
            let msg = {
                type: jkr.messageType.CS_EXIT_ROOM,
                roomId: this.data.roomId,
            };
            jkr.player.sendMessage(msg);
        }
    },

});