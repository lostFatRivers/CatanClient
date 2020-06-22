const jkr = require("Jkr");

let PlayerBaseModule = cc.Class({
    extends: jkr.BaseHandler,

    properties: {

    },

    init: function (player) {
        this.player = player;
        let playerDataStr = jkr.StorageUtil.getData(jkr.constant.SAVE_PLAYER_BASE_DATA);
        if (!playerDataStr) {
            let randomAccount = jkr.Utils.getUUID();
            let playerData = {
                nickName: this.getRandomPlayerId(),
                account: randomAccount,                                                                 // 账号
                createTime: new Date().getTime(),                                                       // 创建时间
                dataIndex: 0,                                                                           // 数据存储索引
                playerLevel: 1,                                                                         // 玩家等级
                playerExp: 0,                                                                           // 玩家经验
                gold: 0,                                                                                // 金币
                diamond: 0,                                                                             // 钻石
            };
            jkr.StorageUtil.save(jkr.constant.SAVE_PLAYER_BASE_DATA, playerData);
            this.player._gameData.playerBaseData = playerData;
        } else {
            this.player._gameData.playerBaseData = JSON.parse(playerDataStr);
        }
        this.loadData();
    },

    loadData:function(){
        this._goldNum = new jkr.BigNumber(this.getPlayerData().gold);
        this._diamondNum = new jkr.BigNumber(this.getPlayerData().diamond);
    },

    saveBefore:function(){
        this.player._gameData.playerBaseData.gold = this._goldNum.toFixed(0);
        this.player._gameData.playerBaseData.diamond = this._diamondNum.toFixed(0);
    },

    savePlayerData () {
        this.saveBefore();
        jkr.StorageUtil.save(jkr.constant.SAVE_PLAYER_BASE_DATA, this.player._gameData.playerBaseData);
    },

    getPlayerData() {
        return this.player._gameData.playerBaseData;
    },


    /**
     * 掉落物品通用接口
     * @param itemId
     * @param number
     */
    dropItem: function(itemId, number) {
        jkr.Logger.debug("====== drop player item, itemId:", itemId, "number:", number);
        if (!jkr.Utils.isNumber(number) || number <= 0) {
            jkr.Logger.error("====== drop player item count error, itemId:", itemId, "number:", number);
            return;
        }
        let itemType = jkr.player.commonModule.getItemType(itemId);
        if(itemType === jkr.constant.ITEM_TYPE_COIN){
            this.dropCoin(itemId, number);
        } else if(itemType === jkr.constant.ITEM_TYPE_BAG){
            this.dropBag(itemId, number);
        } else if(itemType === jkr.constant.ITEM_TYPE_EQUIP) {
            this.dropEquip(itemId, number);
        } else{
            jkr.Logger.error("====== drop player item type error, itemId:", itemId, " number:", number,"itemType: ",itemType) ;
        }
    },


    dropCoin:function (itemId,number) {
        jkr.Logger.debug("====== drop player coin, itemId:", itemId, "number:", number);
        if(itemId === jkr.constant.COIN_TYPE_GOLD){
            this.addGoldNum(number);
        }else if(itemId === jkr.constant.COIN_TYPE_DIAMOND){
            this.addDiamondNum(number);
        }else{
            jkr.Logger.error("====== drop player coin id error, itemId:", itemId, "number:", number);
        }
    },

    dropBag:function (itemId,number) {
        this.player.itemModule.addItemCount(itemId,number);
    },

    dropEquip:function (itemId,number) {
        //TODO 写装备掉落逻辑
    },

    /**
     * 获取玩家金币数量 (bigNumber)
     * @returns {number}
     */
    getGoldNum () {
        return this._goldNum;
    },

    /**
     * 获取玩家金币数量 (string)
     * @returns {number}
     */
    getPlayerGoldNum: function () {
        return this._goldNum.toFixed(0);
    },

    /**
     * 判断金币是否足够
     * @param count
     * @returns {boolean}
     */
    isGoldEnough (count) {
        if (!jkr.Utils.isNumber(count)) {
            jkr.Logger.error("Gold isGoldEnough count is NaN:", count);
            return false;
        }
        if(count <= 0){
            return false;
        }
        let compare = this._goldNum.comparedTo(count);
        if(compare == null || compare < 0){
            return false;
        }
        return true;
    },

    /**
     * 增加金币
     * @param addCount
     */
    addGoldNum: function (addCount) {
        if (!jkr.Utils.isNumber(addCount)) {
            jkr.Logger.error("Gold add count is NaN:", addCount);
            return;
        }
        if(addCount <= 0){
            return;
        }
        let oldNum = this._goldNum;
        if (oldNum.isNaN()) {
            oldNum = new jkr.BigNumber("0");
        }
        this._goldNum = new jkr.BigNumber(this._goldNum.plus(addCount).toFixed(0));
        this._goldNum = this._goldNum.comparedTo(0) < 0 ? new jkr.BigNumber(0) : this._goldNum;

        if (this._goldNum.isNaN()) {
            // 运算完之后变成了NaN
            jkr.Logger.error("gold is NaN", addCount);
            this._goldNum = oldNum;
        }

        this.savePlayerData();
    },

    /**
     * 消耗金币
     * @param {*} costCount 金币消耗量
     */
    costGoldNum(costCount) {
        if (!jkr.Utils.isNumber(costCount)) {
            jkr.Logger.error("Gold cost count is NaN:", costCount);
            return;
        }
        if(costCount <= 0){
            return;
        }
        this._goldNum = new jkr.BigNumber(this._goldNum.minus(costCount).toFixed(0));
        this._goldNum = this._goldNum.comparedTo(0) < 0 ? new jkr.BigNumber(0) : this._goldNum;
        this.savePlayerData();
    },



    /**
     * 获取玩家钻石数量 (bigNumber)
     * @returns {number}
     */
    getDiamondNum () {
        return this._diamondNum;
    },

    /**
     * 获取玩家钻石数量 (string)
     * @returns {number}
     */
    getPlayerDiamondNum: function () {
        return this._diamondNum.toFixed(0);
    },

    /**
     * 判断钻石是否足够
     * @param count
     * @returns {boolean}
     */
    isDiamondEnough (count) {
        if (!jkr.Utils.isNumber(count)) {
            jkr.Logger.error("Gold isDiamondEnough count is NaN:", count);
            return false;
        }
        if(count <= 0){
            return false;
        }
        let compare = this._diamondNum.comparedTo(count);
        if(compare == null || compare < 0){
            return false;
        }
        return true;
    },

    /**
     * 增加钻石
     * @param addCount
     */
    addDiamondNum: function (addCount) {
        if (!jkr.Utils.isNumber(addCount)) {
            jkr.Logger.error("diamond add count is NaN:", addCount);
            return;
        }
        if(addCount <= 0){
            return;
        }
        let oldNum = this._diamondNum;
        if (oldNum.isNaN()) {
            oldNum = new jkr.BigNumber("0");
        }
        this._diamondNum = new jkr.BigNumber(this._diamondNum.plus(addCount).toFixed(0));
        this._diamondNum = this._diamondNum.comparedTo(0) < 0 ? new jkr.BigNumber(0) : this._diamondNum;

        if (this._diamondNum.isNaN()) {
            // 运算完之后变成了NaN
            jkr.Logger.error("diamond is NaN", addCount);
            this._diamondNum = oldNum;
        }
        this.savePlayerData();
    },

    /**
     * 消耗钻石
     * @param {*} costCount 钻石消耗量
     */
    costDiamondNum(costCount) {
        if (!jkr.Utils.isNumber(costCount)) {
            jkr.Logger.error("diamond cost count is NaN:", costCount);
            return;
        }
        if(costCount <= 0){
            return;
        }
        this._diamondNum = new jkr.BigNumber(this._diamondNum.minus(costCount).toFixed(0));
        this._diamondNum = this._diamondNum.comparedTo(0) < 0 ? new jkr.BigNumber(0) : this._diamondNum;
        this.savePlayerData();
    },


    /**
     * 获取玩家等级
     * @returns {number}
     */
    getPlayerLevel () {
        if ( !this.player || !this.player._gameData || !this.player._gameData.playerBaseData || !this.player._gameData.playerBaseData.playerLevel) {
            return 1;
        }
        return this.player._gameData.playerBaseData.playerLevel;
    },

    /**
     * 获取玩家名称
     * @returns {string|*}
     */
    getNickName: function () {
        if ( !this.player || !this.player._gameData
            || !this.player._gameData.playerBaseData || !this.player._gameData.playerBaseData.nickName) {
            return "newPlayer";
        }
        return this.player._gameData.playerBaseData.nickName ? this.player._gameData.playerBaseData.nickName : "Player";
    },

    setNickName: function (nickName) {
        this.player._gameData.playerBaseData.nickName = nickName;
        this.savePlayerData();
        jkr.eventBus.dispatchEvent(jkr.GameEventType.PLAYER_NAME_CHANGE);
    },

    getSex: function () {
        return 1;
    },

    getAge: function () {
        return 1;
    },

    getPlayerId: function () {
        return this.player._gameData.playerBaseData.account;
    },

    getRandomPlayerId:function () {
        let randomId = jkr.Utils.getRandomInt(0,9999);
        return "Player_" +randomId;
    },

});
