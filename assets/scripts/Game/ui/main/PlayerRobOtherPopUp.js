let jkr = require("Jkr");

cc.Class({
    extends: jkr.BasePage,

    properties: {
        otherItemPrefab: cc.Prefab,

        othersPanel: cc.Node,
    },

    showPageBegan: function() {
        this.selectedRoleIndex = -1;
        this.confirmed = false;
        this.roleItem = [];
        for (let i = 0; i < this.data.robRoles.length; i++) {
            let roleIndex = this.data.robRoles[i];

            let otherItem = cc.instantiate(this.otherItemPrefab);
            let otherObj = otherItem.getComponent("PlayerRobOtherItem");
            otherObj.initPlayerRobOther(roleIndex);
            otherObj.host = this;
            this.othersPanel.addChild(otherItem);
            this.roleItem.push(otherObj);
        }
    },

    clearOtherSelect: function(roleIndex) {
        this.selectedRoleIndex = roleIndex;
        for (let i = 0; i < this.roleItem.length; i++) {
            let eachRoleObj = this.roleItem[i];
            if (eachRoleObj.roleIndex !== roleIndex) {
                eachRoleObj.unSelect();
            }
        }
    },

    closePageEnded: function() {
        this.othersPanel.destroyAllChildren();
    },

    onClickConfirm: function() {
        if (this.selectedRoleIndex === -1) {
            jkr.gameScene.showTipsItemRender("未选择抢劫对象", 0.3);
            return;
        }
        if (this.confirmed) {
            return;
        }
        this.confirmed = true;
        let msg = {
            type: jkr.messageType.CS_PLAYER_SELECTED_ROB_TARGET,
            targetIndex: this.selectedRoleIndex,
        };
        jkr.player.sendMessage(msg);
    },

});

