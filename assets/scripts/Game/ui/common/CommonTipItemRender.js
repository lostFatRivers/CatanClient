var jkr = require("Jkr");
cc.Class({
    extends: cc.Component,

    properties: {
        tipNode: {
            default: null,
            type: cc.Node
        },

    },

    onLoad: function () {

    },

  

    start () {

    },

    initData:function(tipStr){
        jkr.lang.setString(this.tipNode.getComponent(cc.Label),tipStr);
    }

    // update (dt) {},
});
