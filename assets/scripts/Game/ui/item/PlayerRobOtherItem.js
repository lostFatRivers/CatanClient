let jkr = require("Jkr");

cc.Class({
    extends: cc.Component,

    properties: {
        playerNameLabel: cc.Label,

        otherSourceName: cc.Label,

        bg1Sprite: cc.Node,
        bg2Sprite: cc.Node,

        btnBgSprite: cc.Sprite,
        selectBtnBgSpriteFrame: cc.SpriteFrame,
        refuseBtnBgSpriteFrame: cc.SpriteFrame,

        acceptIconNode: cc.Node,
    },

    start() {
        // 0:未选择; 1:选择
        this.status = 0;
        this.switchStatusIcon();
        this.btnBgSprite.spriteFrame = this.refuseBtnBgSpriteFrame;
    },

    initPlayerRobOther: function(roleIndex) {
        this.roleIndex = roleIndex;
        let roleData = jkr.player.getRoleData(roleIndex);
        this.playerNameLabel.string = roleData.roleName;
        this.bg1Sprite.color = jkr.Utils.hex2color(roleData.color);
        this.bg2Sprite.color = jkr.Utils.hex2color(roleData.color);
        this.otherSourceName.string = roleData.sourceCardNum + "";
    },

    switchStatusIcon: function() {
        this.acceptIconNode.active = this.status === 1;
    },

    onClickSelect: function() {
        let roleData = jkr.player.getRoleData(this.roleIndex);
        if (roleData.sourceCardNum <= 0) {
            jkr.gameScene.showTipsItemRender("目标没有足够的资源", 0.3);
            return;
        }
        if (this.status === 1) {
            return;
        }
        this.status = 1;
        this.switchStatusIcon();
        this.btnBgSprite.spriteFrame = this.selectBtnBgSpriteFrame;
        this.host.clearOtherSelect(this.roleIndex);
    },

    unSelect: function() {
        if (this.status === 0) {
            return;
        }
        this.status = 0;
        this.switchStatusIcon();
        this.btnBgSprite.spriteFrame = this.refuseBtnBgSpriteFrame;
    },

});