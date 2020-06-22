/**
 * 消息处理器管理中心;
 */
let HandlerManager = cc.Class({
    extends: cc.Object,

    properties: {
        handlers: {
            default: {}
        }
    },

    statics: {
        _instance: null,
        getInstance: function() {
            if (!this._instance) {
                this._instance = new HandlerManager();
            }
            return this._instance;
        }
    },

    /**
     * 注册网络消息处理器;
     *
     * @param messageCode 消息编号
     * @param handler 消息处理函数(lambda)
     */
    registerHandler: function(messageCode, handler) {
        if (!this.handlers[messageCode]) {
            this.handlers[messageCode] = [];
        }
        this.handlers[messageCode].push(handler);
    },

    /**
     * 接收网络消息;
     *
     * @param messageCode 消息编号
     * @param proto protobuf 类型消息
     */
    onMessage: function(messageCode, proto) {
        if (!this.handlers[messageCode] || this.handlers[messageCode].length <= 0) {
            cc.log("message not be consumed. code:", messageCode, "proto:", proto);
            return;
        }
        let handlerArray = this.handlers[messageCode];
        for (let i = 0; i < handlerArray.length; i++) {
            let eh = handlerArray[i];
            try {
                eh(proto);
            } catch (e) {
                cc.log("handler:", eh, "proto:", proto);
                cc.log("handler execute proto error", e);
            }
        }
    },

    /**
     * 销毁所有消息监听;
     */
    destroy: function() {
        this.handlers = {};
    }

});
