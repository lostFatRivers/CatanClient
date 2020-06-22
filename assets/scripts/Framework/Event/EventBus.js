let Logger = require("Logger");
/**
 * 自定义事件分发总线;
 *
 * @type {Function}
 */
let EventBus = cc.Class({
    extends: cc.Object,

    properties: {
        eventListeners: {
            default: {}
        }
    },

    statics: {
        _instance: null,
        getInstance: function() {
            if (!this._instance) {
                this._instance = new EventBus();
            }
            return this._instance;
        }
    },

    /**
     * 注册游戏内自定义事件监听;
     *
     * @param eventName 事件名
     * @param listener lambda事件处理函数
     * @returns {Function} 函数注销回调
     */
    addListener: function(eventName, listener) {
        if (!eventName || !listener) {
            Logger.warn("invalid listener, eventName:", eventName);
            return;
        }
        if (!this.eventListeners[eventName]) {
            this.eventListeners[eventName] = [];
        }
        let listenerArray = this.eventListeners[eventName];
        listenerArray.push(listener);

        // 返回remove回调;
        return () => {
            let index = listenerArray.indexOf(listener);
            if (index <= -1) {
                return;
            }
            listenerArray.splice(index, 1);
        }
    },

    /**
     * 事件分发;
     *
     * @param eventName 事件名
     * @param customData 事件参数
     */
    dispatchEvent: function(eventName, customData) {
        let listenerArray = this.eventListeners[eventName];
        if (!listenerArray || listenerArray.length <= 0) {
            Logger.warn("Event not any listener. eventName:", eventName);
            return;
        }
        for (let i = 0; i < listenerArray.length; i++) {
            let eachL = listenerArray[i];
            eachL(customData);
        }
    },

    /**
     * 销毁所有事件监听;
     */
    destroy: function() {
        this.eventListeners = {};
    }
});