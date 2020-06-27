let jkr = require("Jkr");

cc.Class({
    extends: jkr.BasePage,

    properties: {
        otherItemPrefab: cc.Prefab,

        othersPanel: cc.Node,
    },

    showPageBegan: function() {
        for (let i = 0; i < jkr.player.gameRoleSize; i++) {
            if (i === jkr.player.getMyRoleIndex()) {
                continue;
            }
            let otherItem = cc.instantiate(this.otherItemPrefab);
            let otherObj = otherItem.getComponent("OtherExchangeItem");
            otherObj.initOtherExchange(i);
            otherObj.host = this;
            this.othersPanel.addChild(otherItem);
        }
    },



});

