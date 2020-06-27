let jkr = require("Jkr");

cc.Class({
    extends: jkr.BasePage,

    properties: {
        otherItemPrefab: cc.Prefab,

        othersPanel: cc.Node,
    },

    registerGameListener: function() {
        this.registerListener(jkr.GameEventType.EXCHANGE_ACCEPT, rIndex => this.onAccept(rIndex));
        this.registerListener(jkr.GameEventType.EXCHANGE_RESUME, rIndex => this.onResume(rIndex));
    },

    showPageBegan: function() {
        this.selectedRoleIndex = -1;
        this.roleItem = {};
        for (let i = 0; i < jkr.player.gameRoleSize; i++) {
            if (i === jkr.player.getMyRoleIndex()) {
                continue;
            }
            let otherItem = cc.instantiate(this.otherItemPrefab);
            let otherObj = otherItem.getComponent("OtherExchangeItem");
            otherObj.initOtherExchange(i);
            otherObj.host = this;
            this.othersPanel.addChild(otherItem);
            this.roleItem[i] = otherObj;
        }
    },

    closePageEnded: function() {
        this.othersPanel.destroyAllChildren();
    },

    onClickConfirm: function() {
        if (this.selectedRoleIndex < 0) {
            jkr.gameScene.showTipsItemRender("没有选择交换对象", 0.3);
            return;
        }
        let selectRoleData = jkr.player.getRoleData(this.selectedRoleIndex);
        let msg = {
            type: jkr.messageType.CS_CONFIRM_EXCHANGE,
            targetId: selectRoleData.roleId,
        };
        jkr.player.sendMessage(msg);
    },
    
    onClickClose: function() {
        let msg = {
            type: jkr.messageType.CS_CLOSE_EXCHANGE,
            roleIndex: jkr.player.getMyRoleIndex(),
        };
        jkr.player.sendMessage(msg);
    },

    onAccept: function(roleIndex) {
        let roleItemObj = this.roleItem[roleIndex];
        if (!roleItemObj) {
            jkr.Logger.debug("onAccept error:", roleIndex);
            return;
        }
        roleItemObj.acceptExchange();
    },

    onResume: function(roleIndex) {
        let roleItemObj = this.roleItem[roleIndex];
        if (!roleItemObj) {
            jkr.Logger.debug("onResume error:", roleIndex);
            return;
        }
        roleItemObj.resumeExchange();
    },

    clearOtherSelect: function(roleIndex) {
        this.selectedRoleIndex = roleIndex;
        for (let i = 0; i < jkr.player.gameRoleSize; i++) {
            if (i === roleIndex || i === jkr.player.getMyRoleIndex()) {
                continue;
            }
            let roleObj = this.roleItem[i];
            roleObj.unSelect();
        }
    },

});

