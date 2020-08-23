let jkr = require("Jkr");

cc.Class({
    extends: jkr.BaseUI,

    properties: {
        inputNode: cc.Node,
        inputBgNode: cc.Node,
        inputStopNode: cc.Node,
    },

    start() {
        this.inputStopNode.on(cc.Node.EventType.TOUCH_END, () => this.hideInputNode());
    },

    onClickChat: function() {
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

});