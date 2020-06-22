let jkr = require("Jkr");

cc.Class({
    extends: jkr.BasePage,

    properties: {
        nickNameEditBox: cc.EditBox,
    },

    showPageBegan() {
        this.nickNameEditBox.string = "";
        this.nickNameEditBox.placeholder = jkr.player.playerModule.getNickName();
    },

    onClickSave: function() {
        if (this.nickNameEditBox.string) {
            jkr.player.playerModule.setNickName(this.nickNameEditBox.string);
            let msg = {
                type: jkr.messageType.CS_CHANGE_NAME,
                newName: this.nickNameEditBox.string
            };
            jkr.player.sendMessage(msg);
        }
        this.closePage();
    },

});
