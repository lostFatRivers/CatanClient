let EventBus = require("EventBus");

let BaseUI = cc.Class({
    extends: cc.Component,

    properties: {
        _listenerRemoves: {
            default: {},
        }
    },

    onLoad: function() {
        this.registerSysEvent();
        this.registerGameListener();
        this.jkrerLoad();
    },

    onDestroy: function() {
        this.removeAllGameListener();
    },

    registerSysEvent: function() {
        // Override me;
    },

    registerGameListener: function() {
        // Override me;
    },

    jkrerLoad: function() {
        // Override me;
    },

    /**
     * 注册自定义事件监听;
     *
     * @param eventName 事件名
     * @param lamb 事件处理 lambda 函数
     */
    registerListener: function(eventName, lamb) {
        this._listenerRemoves[eventName] = EventBus.getInstance().addListener(eventName, lamb);
    },

    removeAllGameListener: function () {
        for (let eachEventName in this._listenerRemoves) {
            if (!this._listenerRemoves.hasOwnProperty(eachEventName)) {
                continue;
            }
            this.removeGameListener(eachEventName);
        }
    },

    removeGameListener: function(eventName) {
        let listener = this._listenerRemoves[eventName];
        if (listener) {
            listener();
        }
        delete this._listenerRemoves[eventName];
    }

});