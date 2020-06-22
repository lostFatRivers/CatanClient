let jkr = require("Jkr");

cc.Class({
    extends: jkr.BasePage,

    properties: {
        controlNode: cc.Node,
        contentLabel: cc.Label,
    },

    showPageBegan: function() {
        this.controlNode.position = this.data.pos;
        if (this.data.buildType === jkr.constant.buildType.smallCity) {
            this.contentLabel.string = "建造小城";
        } else if (this.data.buildType === jkr.constant.buildType.bigCity) {
            this.contentLabel.string = "建造大城";
        } else if (this.data.buildType === jkr.constant.buildType.road) {
            this.contentLabel.string = "建造道路";
        }
    },
    
    onClickConfirm: function() {
        if (!this.data) {
            return;
        }
        this.data.onConfirm();
    },

    onClickCancel: function() {
        if (!this.data) {
            return;
        }
        this.data.onCancel();
        this.closePage();
    },

});