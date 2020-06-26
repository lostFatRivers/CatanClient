let PageConstant = {
    OPEN_PAGE_ANIMATION_NONE: 0,                                // 打开页面动画类型 -------- 无
    OPEN_PAGE_ANIMATION_SCALE: 1,                               // 打开页面动画类型 -------- 缩放
    OPEN_PAGE_ANIMATION_OPACITY: 2,                             // 打开页面动画类型 -------- 渐显

    BLACK_NODE_TYPE_NONE: 0,                                    // 通用黑底类型 -------- 无
    BLACK_NODE_TYPE_BLACK: 1,                                   // 通用黑底类型 -------- 半透黑底 90%

    PAGE_TYPE_MAIN: 1,                                          // 页面唯一标示 --------- 主页面
    PAGE_TYPE_PAUSE: 2,                                         // 页面唯一标示 ---------- 暂停
    PAGE_TYPE_REVIVAL: 3,                                       // 页面唯一标示 ---------- 复活
    PAGE_TYPE_RESULT: 4,                                        // 页面唯一标示 ---------- 结算
    PAGE_TYPE_DEBUG: 5,                                         // 页面唯一标示 ---------- debug
    PAGE_TYPE_SELECT_COLOR: 6,                                  // 页面唯一标示 ---------- select color
    PAGE_TYPE_THROW_DICE: 7,                                    // 页面唯一标示 ---------- throw dice
    PAGE_TYPE_ROB: 8,                                           // 页面唯一标示 ---------- rob
    PAGE_TYPE_SETTING: 9,                                       // 页面唯一标示 ---------- setting
    PAGE_TYPE_ROOM_DETAIL: 10,                                  // 页面唯一标示 ---------- room detail
    PAGE_TYPE_BUILD_CONFIRM: 11,                                // 页面唯一标示 ---------- build confirm
    PAGE_TYPE_EXCHANGE: 12,                                     // 页面唯一标示 ---------- 资源交换
};

module.exports = PageConstant;