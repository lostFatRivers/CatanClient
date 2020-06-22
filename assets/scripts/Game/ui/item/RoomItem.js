let jkr = require("Jkr");

cc.Class({
    extends: cc.Component,

    properties: {
        masterNameLabel: cc.Label,
        posNodeArray: [cc.Node]
    },

    initRoomData: function(roomData) {
        this.roomId = roomData.roomId;
        this.rData = roomData;
        let masterId = roomData.masterId;
        let members = roomData.members;
        this.masterNameLabel.string = members[masterId];

        let playerIds = Object.keys(members);
        for (let i = 0; i < this.posNodeArray.length; i++) {
            let eachPosNode = this.posNodeArray[i];
            let eachPlayerId = playerIds[i];
            if (eachPlayerId) {
                eachPosNode.color = cc.color("#FFFFFF");
            } else {
                eachPosNode.color = cc.color("#000000");
            }
        }
    },

    onClickJoin: function() {
        jkr.Logger.debug("加入房间");
        if (jkr.player.getCurrentRoomId() === this.roomId) {
            return;
        }
        let msg = {
            type: jkr.messageType.CS_JOIN_ROOM,
            roomId: this.roomId
        };
        jkr.player.sendMessage(msg);
    },

});
