let jkr = require("Jkr");

cc.Class({
    extends: jkr.BasePage,

    properties: {
        colors: [cc.Node],
        names: [cc.Label]
    },

    registerGameListener: function() {
        this.registerListener(jkr.GameEventType.SYNC_ROLE_COLOR, msg => this.syncRoleColor());
    },

    start() {
        jkr.Logger.debug("start");
        this.selected = false;
        this.oldIndex = -1;
        let colorEnum = jkr.constant.roleColors;
        let colorEnumKeys = Object.keys(colorEnum);
        for (let i = 0; i < colorEnumKeys.length; i++) {
            let eachKey = colorEnumKeys[i];
            if (!colorEnum.hasOwnProperty(eachKey)) {
                continue;
            }
            let eachColor = this.colors[i];
            eachColor.color = jkr.Utils.hex2color(colorEnum[eachKey]);
            eachColor.on(cc.Node.EventType.TOUCH_END, () => {
                if (this.selected || this.oldIndex === i) {
                    return;
                }
                let nameLabel = this.names[i];
                if (nameLabel.string !== "UnKnow") {
                    jkr.Logger.debug("already choose by other:", nameLabel.string);
                    return;
                }
                nameLabel.string = jkr.player.getName();

                let oldIndexName = this.names[this.oldIndex];
                if (oldIndexName) {
                    oldIndexName.string = "UnKnow";
                }

                this.oldIndex = i;
            });
        }
    },

    onEnable() {
        jkr.Logger.debug("onEnable");
        this.selected = false;
        this.oldIndex = -1;
        this.scheduleOnce(() => {
            this.syncRoleColor();
        }, 0.5);
    },

    onClickSelected: function() {
        if (this.oldIndex === -1) {
            jkr.Logger.debug("not select color.");
            return;
        }
        this.selected = true;
        let selectedColor = this.colors[this.oldIndex];
        let msg = {
            type: jkr.messageType.CS_COLOR_SELECT,
            colorStr: "#" + selectedColor.color.toHEX("#rrggbb")
        };
        jkr.player.sendMessage(msg);
        jkr.gameScene.showTipsItemRender("颜色选择成功!");
    },

    syncRoleColor: function() {
        jkr.Logger.debug("syncRoleColor");
        for (let i = 0; i < this.colors.length; i++) {
            let eachColor = this.colors[i];
            let colorStr = "#" + eachColor.color.toHEX("#rrggbb");
            let nameLabel = this.names[i];
            let colorOwned = false;
            for (let j = 0; j < jkr.player.gameRoleSize; j++) {
                let eachRoleInfo = jkr.player.gameRoles[j];
                if (!eachRoleInfo) {
                    jkr.Logger.debug("gameRoleSize:", jkr.player.gameRoleSize);
                    continue;
                }
                jkr.Logger.debug("colorStr:", colorStr, "eachRoleInfo.color:", eachRoleInfo.color, "match:", eachRoleInfo.color === colorStr);
                if (eachRoleInfo.color === colorStr) {
                    nameLabel.string = eachRoleInfo.roleName;
                    colorOwned = true;
                    break;
                }
            }
            if (!colorOwned) {
                nameLabel.string = "UnKnow";
            }
        }
    },

});
