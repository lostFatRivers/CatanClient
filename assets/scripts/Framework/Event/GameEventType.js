/**
 * 游戏自定义事件类型枚举;
 *
 * @type {{}}
 */
let GameEventType = cc.Enum({

    SEND_MESSAGE: "SEND_MESSAGE",
    RECEIVE_MESSAGE: "RECEIVE_MESSAGE",
    SOCKET_ERROR: "SOCKET_ERROR",

    RECEIVE_SIMPLE_MESSAGE: "RECEIVE_SIMPLE_MESSAGE",

    PLAYER_COLOR_SETTING: "PLAYER_COLOR_SETTING",           // 玩家颜色
    MAP_NUMBER_KEY: "MAP_NUMBER_",                          // 地图块注册前缀
    PLAYER_RESOURCE_CHANGE: "PLAYER_RESOURCE_CHANGE",       // 玩家资源改变刷新
    PLAYER_NAME_CHANGE: "PLAYER_NAME_CHANGE",               // 玩家名字刷新
    ROOM_DETAIL_REFRESH: "ROOM_DETAIL_REFRESH",             // 房间信息刷新
    COLOR_SELECT_FAILED: "COLOR_SELECT_FAILED",             // 颜色选择失败
    SYNC_ROLE_COLOR: "SYNC_ROLE_COLOR",                     // 同步玩家颜色
    SYNC_DICE: "SYNC_DICE",                                 // 骰子数字同步
    EXCHANGE_ACCEPT: "EXCHANGE_ACCEPT",                     // 接受交换通知
    EXCHANGE_RESUME: "EXCHANGE_RESUME",                     // 拒绝交换通知
    EXCHANGE_SUCCESS: "EXCHANGE_SUCCESS",                   // 交换成功通知
    NEW_CHAT: "NEW_CHAT",                                   // 收到新聊天消息
    SYSTEM_ROB_ONE_FINISHED: "SYSTEM_ROB_ONE_FINISHED",     // 海盗来了被抢
    PLAYER_ROB_ONE: "PLAYER_ROB_ONE",                       // 玩家放置海盗
    ROLE_DATA_REFRESH: "ROLE_DATA_REFRESH_",                // 玩家信息刷新
});

module.exports = GameEventType;