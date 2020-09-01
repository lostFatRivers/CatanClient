let jkr = require("Jkr");

cc.Class({
    extends: cc.Component,

    properties: {
        cardNameLabel: cc.Label,

        cardSelectedBg: cc.Node,
    },

    initCardData: function(cardType, cardId) {
        this.cardType = cardType;
        this.cardId = cardId;
        this.node.on(cc.Node.EventType.TOUCH_END, () => this.onSelect());
    },

    onSelect: function() {
        this.cardSelectedBg.active = true;
        this.host.clearOtherSelect(this.cardId);
    },

    clearSelect: function() {
        this.cardSelectedBg.active = false;
    },

});
