/**
 * Framework 导出对象;
 * @author Joker
 */
let jkr = {};
window.jkr = jkr;

jkr.JsonData = {};
jkr.constant = require("GameConst");
jkr.EventBus = require("EventBus");
jkr.eventBus = jkr.EventBus.getInstance();
jkr.GameEventType = require("GameEventType");
jkr.pageConstant = require("PageConstant");
jkr.Logger = require("Logger");


// 消息处理器
jkr.HandlerManager = require("HandlerManager");
jkr.handlerManager = jkr.HandlerManager.getInstance();
jkr.BaseHandler = require("BaseHandler");

// websocket 客户端
jkr.NetClient = require("NetClient");
jkr.SimpleNetClient = require("SimpleNetClient");
jkr.ByteBuf = require("ByteBuf");

jkr.HttpClient = require("HttpClient");

jkr.StorageUtil = require("StorageUtil");

jkr.BaseUI = require("BaseUI");
jkr.BaseScrollView = require("BaseScrollView");
jkr.Utils = require("Utils");
jkr.timeUtil = require("TimeUtil");

jkr.SoundsUtil = require("SoundsUtil");
jkr.soundsUtil = new jkr.SoundsUtil();

jkr.BigNumber = BigNumber.clone();
jkr.BigNumber.config({
    ROUNDING_MODE: BigNumber.ROUND_FLOOR
});

jkr.StateMachine = StateMachine;

jkr.lang = require("LanguageUtils");

let { resLoader } = require("ResLoader");
jkr.resLoader = resLoader;

jkr.newBigNumber = function(anyNum) {
    if (isNaN(anyNum)) {
        jkr.Logger.debug("number is NaN.");
        return new jkr.BigNumber(0);
    }
    return new jkr.BigNumber(anyNum);
};

// 屏幕常亮
if(cc.sys.isNative){
    jsb.Device.setKeepScreenOn(true);
}
module.exports = jkr;