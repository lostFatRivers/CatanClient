const encrypt = require('encryptjs');
const Utils = require("Utils");

let StorageUtil = cc.Class({

    statics: {
        _dataKeyCache: [],
        _dataObjCache: {},
        _initFinish: false,

        init: function() {
            if(!this._initFinish){
                let node = new cc.Node();
                cc.game.addPersistRootNode(node);
                cc.director.getScheduler().schedule(() => {
                    StorageUtil.syncData();
                }, node, 0.2, cc.macro.REPEAT_FOREVER, 0, false);

                this._initFinish = true;
            }
        },

        syncData () {
            if(StorageUtil._dataKeyCache.length > 0){
                let key = StorageUtil._dataKeyCache[0];
                let data = StorageUtil._dataObjCache[key];
                if(key && data !== void 0 && data !== null){
                    this.saveData(key, data);
                }
                StorageUtil._dataKeyCache.splice(0, 1);
            }
        },

        /**
         * 存入对象, 会将对象转成 Json 字符串存入 storage;
         *
         * @param key 存入的key;
         * @param obj 存入的对象;
         * @param mustSave 是否必须存储;
         */
        save: function(key, obj, mustSave) {
            if(!this._initFinish){
                this.init();
            }
            if(mustSave){
                this.saveData(key, obj);
                return;
            }
            if(this._dataKeyCache.indexOf(key) === -1){
                this._dataKeyCache.push(key);
            }

            this._dataObjCache[key] = obj;
        },

        /**
         * 存入对象, 会将对象转成 Json 字符串存入 storage;
         *
         * @param key 存入的key;
         * @param data 存入的对象;
         */
        saveData: function(key, data) {
            let originStr = JSON.stringify(data);
            cc.sys.localStorage.setItem(key, originStr);
        },

        /**
         * 获取存储的数据;
         *
         * @param key 存储的key;
         * @returns {string | null} 获取的 string 类型的数据;
         */
        getData: function(key) {
            if(!this._initFinish){
                this.init();
            }
            return cc.sys.localStorage.getItem(key);
        },

        /**
         * 删除数据;
         *
         * @param key 存储的key;
         */
        delete: function(key) {
            cc.sys.localStorage.removeItem(key);
            for(let i = 0; i < this._dataKeyCache.length; i++){
                if(this._dataKeyCache[i] == key){
                    this._dataKeyCache.splice(i, 1);
                    break;
                }
            }
            if(this._dataObjCache.hasOwnProperty(key)){
                delete this._dataObjCache[key];
            }
        },

        clearAll: function() {
            cc.sys.localStorage.clear();
            this._dataKeyCache = [];
            this._dataObjCache = {};
        },

        saveAllCache () {
            let keys = Object.keys(this._dataObjCache);
            for (let i = 0; i < keys.length; i++){
                this.saveData(keys[i], this._dataObjCache[keys[i]]);
            }
        }
    }

});