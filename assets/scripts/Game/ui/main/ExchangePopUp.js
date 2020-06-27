let jkr = require("Jkr");

cc.Class({
    extends: jkr.BasePage,

    properties: {
        exchangeLabel: cc.Label,

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

        confirmBtnNode: cc.Node,
        cancelBtnNode: cc.Node,

        acceptBtnNode: cc.Node,
        refuseBtnNode: cc.Node,
    },

    showPageBegan: function() {
        this.ratioNode.active = this.data.type === jkr.constant.exchangeType.bank;
        this.confirmBtnNode.active = this.data.type !== jkr.constant.exchangeType.receive;
        this.cancelBtnNode.active = this.data.type !== jkr.constant.exchangeType.receive;
        this.acceptBtnNode.active = this.data.type === jkr.constant.exchangeType.receive;
        this.refuseBtnNode.active = this.data.type === jkr.constant.exchangeType.receive;

        if (this.data.type === jkr.constant.exchangeType.receive) {
            this.inWoodNum = this.data.receiveExchangeInfo.inWoodNum;
            this.inBrickNum = this.data.receiveExchangeInfo.inBrickNum;
            this.inSheepNum = this.data.receiveExchangeInfo.inSheepNum;
            this.inRiceNum = this.data.receiveExchangeInfo.inRiceNum;
            this.inStoneNum = this.data.receiveExchangeInfo.inStoneNum;

            this.outWoodNum = this.data.receiveExchangeInfo.outWoodNum;
            this.outBrickNum = this.data.receiveExchangeInfo.outBrickNum;
            this.outSheepNum = this.data.receiveExchangeInfo.outSheepNum;
            this.outRiceNum = this.data.receiveExchangeInfo.outRiceNum;
            this.outStoneNum = this.data.receiveExchangeInfo.outStoneNum;
            let roleIndex = this.data.receiveExchangeInfo.roleIndex;
            let roleData = jkr.player.getRoleData(roleIndex);
            this.exchangeLabel.string = roleData.roleName + "的交换请求";
        } else {
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
            this.exchangeLabel.string = "交换";
        }
        this.ownWoodNum = jkr.player.getResourceNum(jkr.constant.MAP_WOOD) + this.inWoodNum - this.outWoodNum;
        this.ownBrickNum = jkr.player.getResourceNum(jkr.constant.MAP_BRICK) + this.inBrickNum - this.outBrickNum;
        this.ownSheepNum = jkr.player.getResourceNum(jkr.constant.MAP_SHEEP) + this.inSheepNum - this.outSheepNum;
        this.ownRiceNum = jkr.player.getResourceNum(jkr.constant.MAP_RICE) + this.inRiceNum - this.outRiceNum;
        this.ownStoneNum = jkr.player.getResourceNum(jkr.constant.MAP_STONE) + this.inStoneNum - this.outStoneNum;

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
        if (this.data.type === jkr.constant.exchangeType.player) {
            let inAll = this.inWoodNum + this.inBrickNum + this.inSheepNum + this.inRiceNum + this.inStoneNum;
            let outAll = this.outWoodNum + this.outBrickNum + this.outSheepNum + this.outRiceNum + this.outStoneNum;
            if (inAll === 0 || outAll === 0) {
                jkr.gameScene.showTipsItemRender("送出或收入不能为0.", 0.3);
                return;
            }
            let msg = {
                type: jkr.messageType.CS_START_EXCHANGE,
                roleIndex: jkr.player.getMyRoleIndex(),
                outWoodNum: this.outWoodNum,
                outBrickNum: this.outBrickNum,
                outSheepNum: this.outSheepNum,
                outRiceNum: this.outRiceNum,
                outStoneNum: this.outStoneNum,

                inWoodNum: this.inWoodNum,
                inBrickNum: this.inBrickNum,
                inSheepNum: this.inSheepNum,
                inRiceNum: this.inRiceNum,
                inStoneNum: this.inStoneNum
            };
            jkr.player.sendMessage(msg);
        }
    },

    onClickCancel: function() {
        jkr.gameScene.hideExchangePopUp();
    },

    onClickAccept: function() {
        jkr.gameScene.hideExchangePopUp();
        let msg = {
            type: jkr.messageType.CS_ACCEPT_EXCHANGE,
            roleIndex: jkr.player.getMyRoleIndex(),
        };
        jkr.player.sendMessage(msg);
    },

    onClickResume: function() {
        jkr.gameScene.hideExchangePopUp();
        let msg = {
            type: jkr.messageType.CS_RESUME_EXCHANGE,
            roleIndex: jkr.player.getMyRoleIndex(),
        };
        jkr.player.sendMessage(msg);
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
        if (this.data.type === jkr.constant.exchangeType.receive) {
            return;
        }
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
        if (this.data.type === jkr.constant.exchangeType.receive) {
            return;
        }
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