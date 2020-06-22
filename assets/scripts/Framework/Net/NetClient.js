let MessageFactory = require("MessageFactory");
let HandlerManager = require("HandlerManager");
let Logger = require("Logger");
let EventBus = require("EventBus");
let GameEventType = require("GameEventType");

let ByteBuf = require("ByteBuf");

const HEADER_LENGTH_LEN = 4;
const HEADER_TYPE_LEN = 4;

let NetStatus = cc.Enum({
    NONE: 0,
    CONNECTING: 1,
    CONNECTED: 2,
    DISCONNECTED: 3,
});

/**
 * websocket 网络服务;
 *
 * @type {Function}
 */
let NetClient = cc.Class({
    extends: cc.Component,

    properties: {
        url: "",
        connectHook: null,
        closeHook: null,
        ws: null,
        status: NetStatus.NONE,
        _connectingWaitMessages: []
    },

    /**
     * 连接服务器;
     *
     * @param url 服务器的 websocket url.
     * @param connectCallback 连接成功回调.
     * @param closeCallback 连接断开回调.
     */
    connect: function(url, connectCallback, closeCallback) {
        if (this.isConnected()) {
            if (this.url === url) {
                return;
            }
            this.ws.close();
            this.ws = null;
        }
        if (this.url !== url) {
            this.url = url;
        }
        if (!this.connectHook) {
            this.connectHook = connectCallback;
        }
        if (!this.closeHook) {
            this.closeHook = closeCallback;
        }
        if (url.indexOf("wss") >= 0 && cc.sys.isNative) {
            this.ws = new WebSocket(url, "ninja", cc.url.raw("resources/root_bundle.pem"));
        } else {
            this.ws = new WebSocket(url);
        }
        this.status = NetStatus.CONNECTING;

        this.ws.binaryType = "arraybuffer";
        this.ws.onopen = ev => this.onConnected(ev, this.connectHook);
        this.ws.onmessage = ev => this.onMessage(ev);
        this.ws.onclose = ev => this.onClosed(ev, this.closeHook);
        this.ws.onerror = ev => this.onError(ev);
    },

    /**
     * 重新连接, 需要上一次 connect 时传入了有效的 url 和 handler;
     */
    reconnect: function() {
        if (this.url === "") {
            Logger.debug("connect url or handler is empty.");
            return;
        }
        if (this.ws && this.isConnected()) {
            this.ws.close();
            this.ws = null;
        }
        this.connect(this.url, this.connectHook, this.closeHook);
    },

    onConnected: function(event, connectCallback) {
        Logger.debug("websocket connect success.");
        this.status = NetStatus.CONNECTED;
        if (connectCallback) {
            connectCallback();
        }
        Logger.debug("websocket connect waiting messages queue size:", this._connectingWaitMessages.length);
        this._connectingWaitMessages.forEach(em => {
            this.ws.send(em.toUint8Array());
        });
        this._connectingWaitMessages = [];
    },

    disconnect: function() {
        this.ws.close();
    },

    /**
     * 收到网络消息;
     *
     * @param event 网络消息事件
     */
    onMessage: function(event) {
        let binary = new Uint8Array(event.data);

        if (binary.length < HEADER_LENGTH_LEN + HEADER_TYPE_LEN) {
            Logger.debug("Invalid message buffer. (length < header_length + type_length), buffer:", binary);
            return;
        }
        // 协议号
        let type;
        // 协议长度
        let len;
        // 协议体
        let bodyBuff;
        try {
            for (let i = 0; i < 4; i++) {
                len |= binary[i] << (8 * (4 - i - 1));
            }
            for (let i = 0; i < 4; i++) {
                type |= binary[i + 4] << (8 * (4 - i - 1));
            }
            bodyBuff = new Uint8Array(len - HEADER_LENGTH_LEN - HEADER_TYPE_LEN);
            let mark = HEADER_LENGTH_LEN + HEADER_TYPE_LEN;
            for (let i = 0; i < bodyBuff.length; i++) {
                bodyBuff[i] = binary[mark];
                mark++;
            }
            Logger.debug("messageLength:", len, "messageType:", type);
        } catch (e) {
            Logger.debug("message decode failed.", e);
            return;
        }
        let messageClass = MessageFactory.typeOfClass(type);
        if (!messageClass) {
            Logger.debug("No such message type Class. messageType:", type);
            return;
        }
        let message = messageClass.decode(bodyBuff);
        HandlerManager.getInstance().onMessage(type, message);
        EventBus.getInstance().dispatchEvent(GameEventType.RECEIVE_MESSAGE, type);
    },

    /**
     * 发送消息;
     *
     * @param messageCode 消息type
     * @param byteBuf proto转成的Uint8Array
     */
    send(messageCode, byteBuf) {
        try {
            if (this.isNotConnect()) {
                Logger.debug("net client disconnect.");
                return;
            }
            let messageLength = byteBuf.length + HEADER_LENGTH_LEN + HEADER_TYPE_LEN;
            let buf = new ByteBuf();
            buf.writeInt(messageLength);
            buf.writeInt(messageCode);
            buf.write(byteBuf);
            if (this.isConnecting()) {
                this._connectingWaitMessages.push(buf);
                return;
            }
            this.ws.send(buf.toUint8Array());

            EventBus.getInstance().dispatchEvent(GameEventType.SEND_MESSAGE, messageCode);
        } catch (e) {
            Logger.debug("message send failed. messageCode:", messageCode, "error:", e);
        }
    },

    onClosed: function(event, closeCallback) {
        Logger.debug("websocket closed.");
        this.status = NetStatus.DISCONNECTED;
        closeCallback();
        EventBus.getInstance().dispatchEvent(GameEventType.SOCKET_ERROR);
    },

    onError: function(event) {
        Logger.debug("websocket error.", JSON.stringify(event));
        EventBus.getInstance().dispatchEvent(GameEventType.SOCKET_ERROR);
    },

    isConnected: function() {
        return this.status === NetStatus.CONNECTED;
    },

    isConnecting: function() {
        return this.status === NetStatus.CONNECTING;
    },

    isDisconnect: function() {
        return this.status === NetStatus.DISCONNECTED;
    },

    isNotConnect: function() {
        return this.status === NetStatus.DISCONNECTED || this.status === NetStatus.NONE;
    }
});

module.exports = NetClient;