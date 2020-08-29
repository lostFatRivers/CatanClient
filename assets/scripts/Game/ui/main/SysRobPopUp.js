let jkr = require("Jkr");

cc.Class({
    extends: jkr.BasePage,

    properties: {
        outWoodNumLabel: cc.Label,
        outBrickNumLabel: cc.Label,
        outSheepNumLabel: cc.Label,
        outRiceNumLabel: cc.Label,
        outStoneNumLabel: cc.Label,

        outWoodBtn: cc.Button,
        outBrickBtn: cc.Button,
        outSheepBtn: cc.Button,
        outRiceBtn: cc.Button,
        outStoneBtn: cc.Button,

        ownWoodNumLabel: cc.Label,
        ownBrickNumLabel: cc.Label,
        ownSheepNumLabel: cc.Label,
        ownRiceNumLabel: cc.Label,
        ownStoneNumLabel: cc.Label,

        inWoodBtn: cc.Button,
        inBrickBtn: cc.Button,
        inSheepBtn: cc.Button,
        inRiceBtn: cc.Button,
        inStoneBtn: cc.Button,

        confirmBtnNode: cc.Node,
    },

    showPageBegan: function() {
        this.initAllResource();
        this.refreshAllNumLabel();
    },
    
    initAllResource: function() {
        this.outPureCount = Math.floor(jkr.player.getTotalResourceNum() / 2);

        this.outWoodNum = 0;
        this.outBrickNum = 0;
        this.outSheepNum = 0;
        this.outRiceNum = 0;
        this.outStoneNum = 0;

        this.ownWoodNum = jkr.player.getResourceNum(jkr.constant.MAP_WOOD);
        this.ownBrickNum = jkr.player.getResourceNum(jkr.constant.MAP_BRICK);
        this.ownSheepNum = jkr.player.getResourceNum(jkr.constant.MAP_SHEEP);
        this.ownRiceNum = jkr.player.getResourceNum(jkr.constant.MAP_RICE);
        this.ownStoneNum = jkr.player.getResourceNum(jkr.constant.MAP_STONE);
    },

    refreshAllNumLabel: function() {
        this.outWoodNumLabel.string = this.outWoodNum + "";
        this.outBrickNumLabel.string = this.outBrickNum + "";
        this.outSheepNumLabel.string = this.outSheepNum + "";
        this.outRiceNumLabel.string = this.outRiceNum + "";
        this.outStoneNumLabel.string = this.outStoneNum + "";

        this.ownWoodNumLabel.string = this.ownWoodNum + "";
        this.ownBrickNumLabel.string = this.ownBrickNum + "";
        this.ownSheepNumLabel.string = this.ownSheepNum + "";
        this.ownRiceNumLabel.string = this.ownRiceNum + "";
        this.ownStoneNumLabel.string = this.ownStoneNum + "";

        this.inWoodBtn.interactable = this.outWoodNum > 0;
        this.inBrickBtn.interactable = this.outBrickNum > 0;
        this.inSheepBtn.interactable = this.outSheepNum > 0;
        this.inRiceBtn.interactable = this.outRiceNum > 0;
        this.inStoneBtn.interactable = this.outStoneNum > 0;

        let lastNeedOut = this.outPureCount - this.outWoodNum - this.outBrickNum - this.outSheepNum - this.outRiceNum - this.outStoneNum;

        this.outWoodBtn.interactable = lastNeedOut > 0;
        this.outBrickBtn.interactable = lastNeedOut > 0;
        this.outSheepBtn.interactable = lastNeedOut > 0;
        this.outRiceBtn.interactable = lastNeedOut > 0;
        this.outStoneBtn.interactable = lastNeedOut > 0;
    },

    onClickConfirm: function() {
        let lastNeedOut = this.outPureCount - this.outWoodNum - this.outBrickNum - this.outSheepNum - this.outRiceNum - this.outStoneNum;
        if (lastNeedOut > 0) {
            jkr.gameScene.showTipsItemRender("需要交出一半数量的资源");
            return;
        }
        jkr.player.costResource(this.outBrickNum, this.outRiceNum, this.outSheepNum, this.outStoneNum, this.outWoodNum);
        jkr.Logger.debug("lastWood:", this.ownWoodNum, "lastBrick:", this.ownBrickNum, "lastSheep:", this.ownSheepNum, "lastRice:", this.ownRiceNum, "lastStone:", this.ownStoneNum, )
        jkr.gameScene.hideSysRobPopUp();
    },

    onClickWoodAdd: function() {
        this.sourceCommonAdd("Wood");
    },

    onClickWoodSub: function() {
        this.sourceCommonSub("Wood");
    },

    onClickBrickAdd: function() {
        this.sourceCommonAdd("Brick");
    },

    onClickBrickSub: function() {
        this.sourceCommonSub("Brick");
    },

    onClickSheepAdd: function() {
        this.sourceCommonAdd("Sheep");
    },

    onClickSheepSub: function() {
        this.sourceCommonSub("Sheep");
    },

    onClickRiceAdd: function() {
        this.sourceCommonAdd("Rice");
    },

    onClickRiceSub: function() {
        this.sourceCommonSub("Rice");
    },

    onClickStoneAdd: function() {
        this.sourceCommonAdd("Stone");
    },

    onClickStoneSub: function() {
        this.sourceCommonSub("Stone");
    },
    
    sourceCommonAdd: function(sourceName) {
        if (this["out" + sourceName + "Num"] <= 0) {
            return;
        }
        this["own" + sourceName + "Num"] += 1;
        this["out" + sourceName + "Num"] -= 1;
        this.refreshAllNumLabel();
    },

    sourceCommonSub: function(sourceName) {
        if (this["own" + sourceName + "Num"] <= 0) {
            return;
        }
        this["own" + sourceName + "Num"] -= 1;
        this["out" + sourceName + "Num"] += 1;
        this.refreshAllNumLabel();
    },

});