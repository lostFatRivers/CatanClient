let jkr = require("Jkr");

cc.Class({
    extends: jkr.BasePage,

    properties: {
        dice1NumLabel: cc.Label,
        dice2NumLabel: cc.Label,
        throwBtnNode: cc.Node,
    },

    registerGameListener: function() {
        this.registerListener(jkr.GameEventType.SYNC_DICE, msg => this.showDiceResult(msg));
    },

    /**
     * 页面动画前回调
     */
    showPageBegan() {
        this.alreadyThrow = false;
        this.dice1NumLabel.string = "?";
        this.dice2NumLabel.string = "?";
        this.throwBtnNode.active = jkr.player.isMyRound();
    },

    onClickThrow: function() {
        if (this.alreadyThrow) {
            return;
        }
        this.alreadyThrow = true;
        let diceNum1 = jkr.Utils.getSeedRandomInt(1, 6);
        let diceNum2 = jkr.Utils.getSeedRandomInt(1, 6);

        let msg = {
            type: jkr.messageType.CS_THROW_DICE,
            diceNum1: diceNum1,
            diceNum2: diceNum2,
            roleIndex: jkr.player.getMyRoleIndex()
        }
        jkr.player.sendMessage(msg);
    },
    
    showDiceResult: function(msg) {
        let dice1 = msg.diceNum1;
        let dice2 = msg.diceNum2;
        this.dice1NumLabel.string = dice1 + "";
        this.dice2NumLabel.string = dice2 + "";
        let num = dice1 + dice2;
        jkr.eventBus.dispatchEvent(jkr.GameEventType.MAP_NUMBER_KEY + num);

        // 为了同步一下玩家的随机数种子
        if (!jkr.player.isMyRound()) {
            jkr.Utils.getSeedRandomInt(1, 6);
            jkr.Utils.getSeedRandomInt(1, 6);
        }

        this.scheduleOnce(() => {
            jkr.player.refreshResourceView();
            jkr.player.getGameSM().toOperate();
        }, 1);
    },

});
