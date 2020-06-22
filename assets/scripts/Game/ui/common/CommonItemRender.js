let jkr = require("Jkr");

cc.Class({
    extends: cc.Component,

    properties: {

    },

    onLoad () {
        this.qualitySprite = cc.find("bg", this.node).getComponent(cc.Sprite);
        this.iconSprite = cc.find("icon", this.node).getComponent(cc.Sprite);
    },

    setHost (host) {
        this.host = host;
    },

    initData (id) {
        this.itemId = id;
        // this.itemType = jkr.Utils.getItemType(id);
        //
        // let iconName = "";
        // let qualityBgName = "";
        // let spriteAtlas = this.equipAtlas;
        // this.iconSprite.spriteFrame = spriteAtlas.getSpriteFrame(iconName);

    },

    updateData () {

    },

    onClickNode () {

    },

    // update (dt) {},
});
