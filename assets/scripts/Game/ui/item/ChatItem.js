let jkr = require("Jkr");

cc.Class({
    extends: cc.Component,

    properties: {
        bgImgNode: cc.Node,
        nameLabel: cc.Label,
        chatLabel: cc.Label,
    },

    start() {
        cc.tween(this.node)
            .to(0.3, {x: 0}, {easing: "backOut"})
            .call(() => jkr.Logger.debug("聊天位置:", this.node.position))
            .start();
        this.scheduleOnce(() => this.hideItem(), 5);
    },

    initChatItem: function(name, chat, bgColor) {
        this.node.x = 330;
        this.nameLabel.string = name + ":";
        this.chatLabel.string = chat;
        if (bgColor) {
            this.bgImgNode.color = new cc.Color().fromHEX(bgColor);
        }
    },
    
    hideItem: function() {
        cc.tween(this.node)
            .to(0.5, {opacity: 1})
            .call(() => this.node.destroy())
            .start();
    },

});