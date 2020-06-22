let jkr = require("Jkr");

cc.Class({
    extends: cc.Component,

    properties: {
    },

    init: function(blackType) {
        let splashNode = cc.find("Splash", this.node);
        if (blackType === jkr.pageConstant.BLACK_NODE_TYPE_NONE) {
            splashNode.active = false;
        } else if (blackType === jkr.pageConstant.BLACK_NODE_TYPE_BLACK) {  // 百分之九十
            splashNode.active = true;
            splashNode.opacity = 255 * 0.9;
        }
    }

    // update (dt) {},
});
