let jkr = require("Jkr");

cc.Class({
    extends: jkr.BasePage,

    properties: {
        myCardContent: cc.Node,

        cardPrefab: cc.Prefab,
    },

    showPageBegan() {
        this.selectCardId = 0;
        this.cards = [];
        for (let i = 0; i < 10; i++) {
            let cardItem = cc.instantiate(this.cardPrefab);
            let cardItemObj = cardItem.getComponent("CardItem");
            cardItemObj.initCardData(jkr.constant.SkillType.soldier, i);
            cardItemObj.host = this;
            this.cards.push(cardItemObj);
            cardItem.parent = this.myCardContent;
        }
        this.cards[this.selectCardId].onSelect();
    },

    clearOtherSelect: function(cardId) {
        this.selectCardId = cardId;
        for (let i = 0; i < this.cards.length; i++) {
            if (i === cardId) {
                continue;
            }
            let eachItemObj = this.cards[i];
            eachItemObj.clearSelect();
        }
    },

    onClickExchange: function() {
        if (!jkr.player.checkResource(0, 1, 1, 1, 0)) {
            jkr.gameScene.showTipsItemRender("资源不足.", 0.3);
            return false;
        }
        let msg = {
            type: jkr.messageType.CS_GET_SKILL_CARD
        };
        jkr.player.sendMessage(msg);
    },

    onClickUse: function() {
        let msg = {
            type: jkr.messageType.CS_USE_SKILL_CARD,
            cardType: jkr.constant.SkillType.soldier,
            cardParam: ""
        };
        jkr.player.sendMessage(msg);
        jkr.gameScene.showRobOtherMask();
        this.closePage();
    },
    
    onClickClose: function() {
        this.closePage();
    },

});
