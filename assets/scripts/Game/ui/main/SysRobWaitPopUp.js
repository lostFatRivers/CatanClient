let jkr = require("Jkr");

cc.Class({
    extends: jkr.BasePage,

    properties: {
        otherItemPrefab: cc.Prefab,

        othersPanel: cc.Node,
    },

    registerGameListener: function() {
        this.registerListener(jkr.GameEventType.SYSTEM_ROB_ONE_FINISHED, rIndex => this.onRobbed(rIndex));
    },

    showPageBegan: function() {
        this.selectedRoleIndex = -1;
        this.roleItem = {};
        for (let i = 0; i < this.data.robRoles.length; i++) {
            let eachRobRole = this.data.robRoles[i];

            let otherItem = cc.instantiate(this.otherItemPrefab);
            let otherObj = otherItem.getComponent("SysRobWaitItem");
            otherObj.initRobItem(eachRobRole.roleIndex, eachRobRole.totalSourceNum);
            otherObj.host = this;
            this.othersPanel.addChild(otherItem);
            this.roleItem[i] = otherObj;
        }
    },

    closePageEnded: function() {
        this.othersPanel.destroyAllChildren();
    },

    onRobbed: function(roleIndex) {
        for (let i = 0; i < this.roleItem.length; i++) {
            let eachRoleObj = this.roleItem[i];
            if (eachRoleObj.roleIndex === roleIndex) {
                eachRoleObj.robFinished();
            }
        }
        let allRobbed = true;
        for (let i = 0; i < this.roleItem.length; i++) {
            let eachRoleObj = this.roleItem[i];
            if (eachRoleObj.status === 0) {
                allRobbed = false;
                break;
            }
        }
    },

});

