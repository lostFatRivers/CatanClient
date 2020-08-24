let jkr = require("Jkr");

cc.Class({
    extends: jkr.BaseUI,

    properties: {
        inputNode: cc.Node,
        inputBgNode: cc.Node,
        inputStopNode: cc.Node,
        inputEditBox: cc.EditBox,

        chatParent: cc.Node,

        chatItemPrefab: cc.Prefab,
    },

    registerGameListener: function() {
        this.registerListener(jkr.GameEventType.NEW_CHAT, cData => this.createChatItem(cData.nickName, cData.chatContent));
    },

    start() {
        this.chatItemCount = cc.macro.MAX_ZINDEX;
        this.inputStopNode.on(cc.Node.EventType.TOUCH_END, () => this.hideInputNode());
    },

    onClickChat: function() {
        if (!jkr.gameScene.chatShow) {
            return;
        }
        this.showInputNode();
    },

    showInputNode: function() {
        if (this.inputAction || this.inputShow) {
            return;
        }
        this.inputStopNode.active = true;
        this.inputAction = true;
        cc.tween(this.inputNode)
            .by(0.3, {x: -540}, {easing: "backOut"})
            .call(() => {
                this.inputAction = false;
                this.inputShow = true;
            })
            .start();
        cc.tween(this.inputBgNode)
            .to(0.2, {opacity: 200})
            .start();
    },

    hideInputNode: function() {
        if (this.inputAction || !this.inputShow) {
            return;
        }
        this.inputAction = true;
        cc.tween(this.inputNode)
            .by(0.3, {x: 540}, {easing: "backOut"})
            .call(() => {
                this.inputAction = false;
                this.inputShow = false;
                this.inputStopNode.active = false;
            })
            .start();
        cc.tween(this.inputBgNode)
            .to(0.4, {opacity: 1})
            .start();
    },

    onClickSend: function() {
        if (this.inputEditBox.string) {
            let msg = {
                type: jkr.messageType.CS_SEND_CHAT,
                nickName: jkr.player.playerModule.getNickName(),
                chatMsg: this.inputEditBox.string,
            };
            jkr.player.sendMessage(msg);
        }
        this.inputEditBox.string = "";
    },

    createChatItem: function(nickName, chatContent) {
        let chatItem = cc.instantiate(this.chatItemPrefab);
        chatItem.getComponent("ChatItem").initChatItem(nickName, chatContent);
        chatItem.zIndex = this.chatItemCount--;
        chatItem.parent = this.chatParent;
        chatItem.sortAllChildren();
    },

});