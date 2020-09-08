let jkr = require("Jkr");

cc.Class({
    extends: cc.Component,

    properties: {
        publicNode: cc.Node,
        privateNode: cc.Node,
        roleName: cc.Label,

        colorBg: cc.Node,

        cardNumLabel: cc.Label,
        skillNumLabel: cc.Label,
        robNumLabel: cc.Label,
        roadNumLabel: cc.Label,
        scoreNumLabel: cc.Label,

        brickNumLabel: cc.Label,
        riceNumLabel: cc.Label,
        sheepNumLabel: cc.Label,
        stoneNumLabel: cc.Label,
        woodNumLabel: cc.Label,
    },

    initRole: function(roleIndex) {
        if (jkr.player.getMyRoleIndex() === roleIndex) {
            this.node.x = 50;
        } else {
            this.privateNode.active = false;
        }
        this.roleIndex = roleIndex;
        let roleData = jkr.player.getRoleData(roleIndex);
        this.roleName.string = roleData.roleName;
        this.closer = jkr.eventBus.addListener(jkr.GameEventType.ROLE_DATA_REFRESH + roleIndex, () => this.refreshRoleResource());
    },

    refreshRoleResource: function() {
        let roleData = jkr.player.getRoleData(this.roleIndex);
        this.cardNumLabel.string = roleData.sourceCardNum + "";
        this.skillNumLabel.string = roleData.skillCardNum + "";
        this.robNumLabel.string = roleData.robTimes + "";
        this.roadNumLabel.string = roleData.roadLength + "";
        this.scoreNumLabel.string = roleData.totalScore + "";

        if (this.roleIndex === jkr.player.getMyRoleIndex()) {
            this.brickNumLabel.string = jkr.player.getResourceNum(jkr.constant.MAP_BRICK) + "";
            this.riceNumLabel.string = jkr.player.getResourceNum(jkr.constant.MAP_RICE) + "";
            this.sheepNumLabel.string = jkr.player.getResourceNum(jkr.constant.MAP_SHEEP) + "";
            this.stoneNumLabel.string = jkr.player.getResourceNum(jkr.constant.MAP_STONE) + "";
            this.woodNumLabel.string = jkr.player.getResourceNum(jkr.constant.MAP_WOOD) + "";
        }
    },
    
    resetColor: function() {
        let roleData = jkr.player.getRoleData(this.roleIndex);
        this.colorBg.color = jkr.Utils.hex2color(roleData.color);
        jkr.Logger.debug("role color:", roleData.color);
    },

    onDestroy() {
        if (this.closer) {
            this.closer();
        }
    }

});