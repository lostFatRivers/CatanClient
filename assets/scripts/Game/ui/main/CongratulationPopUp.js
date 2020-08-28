let jkr = require("Jkr");

cc.Class({
    extends: jkr.BasePage,

    properties: {
        titleLabel: cc.Label,

        contentNode: cc.Node,

        nameLabel: cc.Label,
        numLabel: cc.Label,
    },

    showPageBegan() {
        if (this.data.type === jkr.constant.CongratulationTypes.MAX_ROAD_LENGTH) {
            this.titleLabel.string = "最长道路";
        } else if (this.data.type === jkr.constant.CongratulationTypes.MAX_ROB_TIMES) {
            this.titleLabel.string = "最大士兵";
        }
        this.nameLabel.string = this.data.roleName;
        this.numLabel.string = this.data.num + "";
        this.contentNode.x = -700;

        cc.tween(this.contentNode)
            .to(0.4, {x: 0}, {easing: "backOut"})
            .delay(3)
            .to(0.4, {x: 700}, {easing: "backIn"})
            .call(() => jkr.gameScene.closePage(jkr.pageConstant.PAGE_TYPE_CONGRATULATION))
            .start();
    },

});
