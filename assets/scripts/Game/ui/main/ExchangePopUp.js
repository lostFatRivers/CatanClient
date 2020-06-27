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

        playerBtnNode: cc.Node,
        bankBtnNode: cc.Node,

        playerBtnBgNode: cc.Node,
        bankBtnBgNode: cc.Node,

        stopNode: cc.Node,
    },

    registerGameListener: function() {
        this.registerListener(jkr.GameEventType.EXCHANGE_SUCCESS, rIndex => this.onExchangeSuccess());
    },

    showPageBegan: function() {
        this.outPureCount = 0;
        this.inPureCount = 0;
        if (this.data.type === jkr.constant.exchangeType.player) {
            this.playerBtnNode.zIndex = -1;
            this.bankBtnNode.zIndex = -2;
            this.playerBtnBgNode.color = jkr.Utils.hex2color(jkr.constant.exchangeBtnColor.enable);
            this.bankBtnBgNode.color = jkr.Utils.hex2color(jkr.constant.exchangeBtnColor.disable);
        } else {
            this.playerBtnNode.zIndex = -2;
            this.bankBtnNode.zIndex = -1;
            this.playerBtnBgNode.color = jkr.Utils.hex2color(jkr.constant.exchangeBtnColor.disable);
            this.bankBtnBgNode.color = jkr.Utils.hex2color(jkr.constant.exchangeBtnColor.enable);
        }
        this.ratioNode.active = this.data.type === jkr.constant.exchangeType.bank;
        this.confirmBtnNode.active = this.data.type !== jkr.constant.exchangeType.receive;
        this.cancelBtnNode.active = this.data.type !== jkr.constant.exchangeType.receive;
        this.playerBtnNode.active = this.data.type !== jkr.constant.exchangeType.receive;
        this.bankBtnNode.active = this.data.type !== jkr.constant.exchangeType.receive;

        this.acceptBtnNode.active = this.data.type === jkr.constant.exchangeType.receive;
        this.refuseBtnNode.active = this.data.type === jkr.constant.exchangeType.receive;

        if (this.data.type === jkr.constant.exchangeType.receive) {
            this.resetAllResource(this.data.receiveExchangeInfo.inWoodNum, this.data.receiveExchangeInfo.inBrickNum,
                    this.data.receiveExchangeInfo.inSheepNum, this.data.receiveExchangeInfo.inRiceNum,
                    this.data.receiveExchangeInfo.inStoneNum, this.data.receiveExchangeInfo.outWoodNum,
                    this.data.receiveExchangeInfo.outBrickNum, this.data.receiveExchangeInfo.outSheepNum,
                    this.data.receiveExchangeInfo.outRiceNum, this.data.receiveExchangeInfo.outStoneNum);

            let roleIndex = this.data.receiveExchangeInfo.roleIndex;
            let roleData = jkr.player.getRoleData(roleIndex);
            this.exchangeLabel.string = roleData.roleName + "的交换请求";
        } else {
            this.resetAllResource();
            this.exchangeLabel.string = "交换";
        }
        this.refreshAllNumLabel();
    },

    onExchangeSuccess: function() {
        this.resetAllResource();
        this.refreshAllNumLabel();
    },
    
    resetAllResource: function(inWoodNum = 0, inBrickNum = 0, inSheepNum = 0,
                               inRiceNum = 0, inStoneNum = 0, outWoodNum = 0,
                               outBrickNum = 0, outSheepNum = 0, outRiceNum = 0,
                               outStoneNum = 0) {
        this.inWoodNum = inWoodNum;
        this.inBrickNum = inBrickNum;
        this.inSheepNum = inSheepNum;
        this.inRiceNum = inRiceNum;
        this.inStoneNum = inStoneNum;

        this.outWoodNum = outWoodNum;
        this.outBrickNum = outBrickNum;
        this.outSheepNum = outSheepNum;
        this.outRiceNum = outRiceNum;
        this.outStoneNum = outStoneNum;

        this.ownWoodNum = jkr.player.getResourceNum(jkr.constant.MAP_WOOD) + this.inWoodNum - this.outWoodNum;
        this.ownBrickNum = jkr.player.getResourceNum(jkr.constant.MAP_BRICK) + this.inBrickNum - this.outBrickNum;
        this.ownSheepNum = jkr.player.getResourceNum(jkr.constant.MAP_SHEEP) + this.inSheepNum - this.outSheepNum;
        this.ownRiceNum = jkr.player.getResourceNum(jkr.constant.MAP_RICE) + this.inRiceNum - this.outRiceNum;
        this.ownStoneNum = jkr.player.getResourceNum(jkr.constant.MAP_STONE) + this.inStoneNum - this.outStoneNum;
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
        } else if (this.data.type === jkr.constant.exchangeType.bank) {
            jkr.player.onExchangedResource({
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
            });
            jkr.gameScene.showTipsItemRender("与银行交换成功", 0.3);
            this.onExchangeSuccess();
        }
    },

    onClickCancel: function() {
        jkr.gameScene.hideExchangePopUp();
    },

    onClickAccept: function() {
        if (this.ownWoodNum < 0 || this.ownBrickNum < 0 || this.ownSheepNum < 0
            || this.ownRiceNum < 0 || this.ownStoneNum < 0) {
            jkr.gameScene.showTipsItemRender("资源不足, 无法交换", 0.3);
            return;
        }
        this.stopNode.active = true;
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
    
    onClickPlayer: function() {
        if (this.data.type === jkr.constant.exchangeType.player) {
            return;
        }
        this.data.type = jkr.constant.exchangeType.player;
        this.showPageBegan();
    },

    onClickBank: function() {
        if (this.data.type === jkr.constant.exchangeType.bank) {
            return;
        }
        this.data.type = jkr.constant.exchangeType.bank;
        this.showPageBegan();
    },
    
    sourceCommonAdd: function(sourceName) {
        if (this.data.type === jkr.constant.exchangeType.receive) {
            return;
        }
        if (this.data.type === jkr.constant.exchangeType.player) {
            this["own" + sourceName + "Num"] += 1;
            if (this["out" + sourceName + "Num"] > 0) {
                this["out" + sourceName + "Num"] -= 1;
            } else {
                this["in" + sourceName + "Num"] += 1;
            }
        } else if (this.data.type === jkr.constant.exchangeType.bank) {
            // 可以收回
            if (this["out" + sourceName + "Num"] > 0) {
                let ratio = jkr.player.getSourceBankRatio(sourceName);
                this["out" + sourceName + "Num"] -= ratio;
                this["own" + sourceName + "Num"] += ratio;
                this.outPureCount--;
            } else {
                if (this.outPureCount - this.inPureCount <= 0) {
                    // 没有足够的点数
                    return;
                }
                this["in" + sourceName + "Num"] += 1;
                this["own" + sourceName + "Num"] += 1;
                this.inPureCount++;
            }
        }
        this.refreshAllNumLabel();
    },

    sourceCommonSub: function(sourceName) {
        if (this.data.type === jkr.constant.exchangeType.receive) {
            return;
        }
        if (this.data.type === jkr.constant.exchangeType.player) {
            if (this["own" + sourceName + "Num"] <= 0) {
                return;
            }
            this["own" + sourceName + "Num"] -= 1;
            if (this["in" + sourceName + "Num"] > 0) {
                this["in" + sourceName + "Num"] -= 1;
            } else {
                this["out" + sourceName + "Num"] += 1;
            }
        } else if (this.data.type === jkr.constant.exchangeType.bank) {
            // 可以退回
            if (this["in" + sourceName + "Num"] > 0) {
                this["in" + sourceName + "Num"] -= 1;
                this["own" + sourceName + "Num"] -= 1;
                this.inPureCount--;
            } else {
                let ratio = jkr.player.getSourceBankRatio(sourceName);
                if (this["own" + sourceName + "Num"] < ratio) {
                    return;
                }
                this["own" + sourceName + "Num"] -= ratio;
                this["out" + sourceName + "Num"] += ratio;
                this.outPureCount++;
            }
        }
        this.refreshAllNumLabel();
    },

});