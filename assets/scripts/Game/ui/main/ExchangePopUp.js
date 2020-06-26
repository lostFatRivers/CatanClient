let jkr = require("Jkr");

cc.Class({
    extends: jkr.BasePage,

    properties: {
        inWoodNumLabel: cc.Label,
        inBrickNumLabel: cc.Label,
        inSheepNumLabel: cc.Label,
        inRiceNumLabel: cc.Label,
        inStoneNumLabel: cc.Label,

        outWoodNumLabel: cc.Label,
        outBrickNumLabel: cc.Label,
        outSheepNumLabel: cc.Label,
        outRiceNumLabel: cc.Label,
        outStoneNumLabel: cc.Label,

        ownWoodNumLabel: cc.Label,
        ownBrickNumLabel: cc.Label,
        ownSheepNumLabel: cc.Label,
        ownRiceNumLabel: cc.Label,
        ownStoneNumLabel: cc.Label,

        ratioWoodNumLabel: cc.Label,
        ratioBrickNumLabel: cc.Label,
        ratioSheepNumLabel: cc.Label,
        ratioRiceNumLabel: cc.Label,
        ratioStoneNumLabel: cc.Label,

        ratioNode: cc.Node,
    },

    showPageBegan: function() {
        this.ratioNode.active = this.data.type === jkr.constant.exchangeType.bank;

        this.inWoodNum = 0;
        this.inBrickNum = 0;
        this.inSheepNum = 0;
        this.inRiceNum = 0;
        this.inStoneNum = 0;

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

        this.refreshAllNumLabel();
    },

    refreshAllNumLabel: function() {
        this.inWoodNumLabel.string = this.inWoodNum + "";
        this.inBrickNumLabel.string = this.inBrickNum + "";
        this.inSheepNumLabel.string = this.inSheepNum + "";
        this.inRiceNumLabel.string = this.inRiceNum + "";
        this.inStoneNumLabel.string = this.inStoneNum + "";

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
    },

    onClickConfirm: function() {

    },

    onClickCancel: function() {
        jkr.gameScene.hideExchangePopUp();
    },

    onClickWoodAdd: function() {
        this.sourceCommonAdd("WoodNum");
    },

    onClickWoodSub: function() {
        this.sourceCommonSub("WoodNum");
    },

    onClickBrickAdd: function() {
        this.sourceCommonAdd("BrickNum");
    },

    onClickBrickSub: function() {
        this.sourceCommonSub("BrickNum");
    },

    onClickSheepAdd: function() {
        this.sourceCommonAdd("SheepNum");
    },

    onClickSheepSub: function() {
        this.sourceCommonSub("SheepNum");
    },

    onClickRiceAdd: function() {
        this.sourceCommonAdd("RiceNum");
    },

    onClickRiceSub: function() {
        this.sourceCommonSub("RiceNum");
    },

    onClickStoneAdd: function() {
        this.sourceCommonAdd("StoneNum");
    },

    onClickStoneSub: function() {
        this.sourceCommonSub("StoneNum");
    },
    
    sourceCommonAdd: function(sourceName) {
        if (this.data.type === jkr.constant.exchangeType.player) {
            this["own" + sourceName] += 1;
            if (this["out" + sourceName] > 0) {
                this["out" + sourceName] -= 1;
            } else {
                this["in" + sourceName] += 1;
            }
        }
        this.refreshAllNumLabel();
    },

    sourceCommonSub: function(sourceName) {
        if (this.data.type === jkr.constant.exchangeType.player) {
            if (this["own" + sourceName] <= 0) {
                return;
            }
            this["own" + sourceName] -= 1;
            if (this["in" + sourceName] > 0) {
                this["in" + sourceName] -= 1;
            } else {
                this["out" + sourceName] += 1;
            }
        }
        this.refreshAllNumLabel();
    },

});