const jkr = require("Jkr");

jkr.TemplateManager = cc.Class({
    extends: cc.Object,

    properties: {
        gameParams: null
    },

    statics: {
        _instance: null,
        getInstance: function() {
            if (!this._instance) {
                this._instance = new jkr.TemplateManager();
            }
            return this._instance;
        }
    },

    init: function() {
        // 加载游戏参数表
        this.loadGameParams();
    },

    // 加载游戏参数表
    loadGameParams: function () {
        this.gameParams = {};
    },

    getGameParamValue: function (key) {
        return this.gameParams[key];
    },

});

jkr.templateManager = jkr.TemplateManager.getInstance();