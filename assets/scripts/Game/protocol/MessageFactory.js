let MessageFactory = cc.Class({});

/**
 * 根据 messageType 获取对应的 Protobuf 类;
 *
 * @param type 消息编号
 * @returns Class protobuf类
 */
MessageFactory.typeOfClass = function(type) {
    let messageClass = null;
    switch (type) {
        // case proto.Code.SC_PLATFORM_ERROR_CODE:
        //     messageClass = proto.ErrorCodeResp;
        //     break;
        // case proto.Code.SC_PLAYER_ENTER:
        //     messageClass = proto.PlayerEnterResp;
        //     break;

        default:
            messageClass = null;
    }
    return messageClass;
};

module.exports = MessageFactory;