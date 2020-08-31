let jkr = require("Jkr");

cc.Class({
    extends: cc.Component,

    properties: {
        smallNode: cc.Node,
        bigNode: cc.Node,
        colorSprites: [cc.Node],
    },

    initCity: function(logicPos, position, logicPosKey) {
        // 城市类型: -1:没有, 0:小城, 1:大城
        this.cityType = -1;
        this.roleIndex = -1;
        this.node.x = position[0];
        this.node.y = position[1];
        this.logicPos = logicPos;
        this.cityKey = logicPosKey;
        this.roads = [];
        this.mapLands = [];
    },

    setColor: function(color) {
        for (let i = 0; i < this.colorSprites.length; i++) {
            this.colorSprites[i].color = color;
        }
    },
    
    onClickCity: function() {
        if (!this.checkBuildEnable()) {
            return;
        }
        let color = jkr.Utils.hex2color(jkr.player.getMyColor());
        this.setColor(color);
        this.node.opacity = 120;
        let buildType = jkr.constant.buildType.smallCity;
        if (this.cityType === -1) {
            this.smallNode.active = true;
            this.bigNode.active = false;
        } else if (this.cityType === 0) {
            this.smallNode.active = false;
            this.bigNode.active = true;
            buildType = jkr.constant.buildType.bigCity;
        }
        let worldPos = this.node.convertToWorldSpaceAR(cc.v2(0, 0));
        let gameScenePos = jkr.gameScene.node.convertToNodeSpaceAR(worldPos);
        jkr.gameScene.showConfirmBuildPopUp({
            pos: gameScenePos,
            buildType: buildType,
            onConfirm: () => this.sendBuildCityMsg(),
            onCancel: () => this.cancelBuildCity()
        });
    },
    
    sendBuildCityMsg: function() {
        let gameSM = jkr.player.getGameSM();
        if (gameSM.is("operating")) {
            if (this.cityType === -1) {
                jkr.player.costResource(1, 1, 1, 0, 1);
            } else if (this.cityType === 0) {
                jkr.player.costResource(0, 2, 0, 3, 0);
            }
        }
        let bCityType = 0;
        if (this.cityType === -1) {
            bCityType = 0;
        } else if (this.cityType === 0) {
            bCityType = 1;
        }
        let msg = {
            type: jkr.messageType.CS_BUILD_CITY,
            cityKey: this.cityKey,
            roleIndex: jkr.player.getMyRoleIndex(),
            cityType: bCityType
        }
        jkr.player.sendMessage(msg);
    },

    buildCity: function(colorStr, roleIndex, cityType) {
        this.node.opacity = 255;
        let color = jkr.Utils.hex2color(colorStr);
        this.setColor(color);
        this.cityType = cityType;
        this.roleIndex = roleIndex;
        this.smallNode.active = cityType === 0;
        this.bigNode.active = cityType === 1;
        if (this.cityType === 0) {
            if (jkr.player.getMyRoleIndex() === roleIndex) {
                let gameSM = jkr.player.getGameSM();
                if (gameSM.is("preRound2")) {
                    this.preRoundGiveResource();
                }
                jkr.player.addSelfCity(this.cityKey);
            }
        }
        if (jkr.player.getMyRoleIndex() === roleIndex) {
            jkr.player.addCityScore();
        }
        jkr.gameScene.hideConfirmBuildPopUp();
    },

    cancelBuildCity: function() {
        this.node.opacity = 225;
        if (this.cityType === -1) {
            this.smallNode.active = false;
            this.bigNode.active = false;
        } else if (this.cityType === 0) {
            this.smallNode.active = true;
            this.bigNode.active = false;
        }
    },

    addLinkedRoad: function(roadObj) {
        this.roads.push(roadObj);
    },

    addPressMapLand: function(mapLandObj) {
        this.mapLands.push(mapLandObj);
        jkr.Logger.debug("mapLands length:", this.mapLands.length);
    },

    checkBuildEnable: function() {
        jkr.Logger.debug("[0] checkBuildEnable.");
        // 地形判断
        if (this.roleIndex >= 0 && this.roleIndex !== jkr.player.getMyRoleIndex()) {
            jkr.Logger.debug("city had owner.");
            return false;
        }
        if (this.roleIndex < 0) {
            if (this.checkRoundHadCity()) {
                jkr.Logger.debug("neighbor had city.");
                jkr.gameScene.showTipsItemRender("相连道路已经有其他城镇");
                return false;
            }
            if (!jkr.player.inMyPreRound() && !this.roundHadOwnRoad()) {
                jkr.Logger.debug("round not have my road.");
                return false;
            }
        }

        // 状态机判断
        let myRoleData = jkr.player.getRoleData(jkr.player.getMyRoleIndex());
        let gameSM = jkr.player.getGameSM();
        if ((gameSM.is("preRound1") && myRoleData.preCity1Build)
                || (gameSM.is("preRound2") && myRoleData.preCity2Build)) {
            // 初始2城
            jkr.Logger.debug("[1] pre Round had build city.");
            return false;
        }
        if (gameSM.is("throwing") || gameSM.is("roundEnd")) {
            jkr.Logger.debug("[2] throwing or roundEnd.");
            return false;
        }
        if (gameSM.is("operating")) {
            // 操作中
            if (!jkr.player.isMyRound()) {
                jkr.gameScene.showTipsItemRender("不是自己的回合", 0.3);
                return false;
            }
            if (this.cityType === -1) {
                if (!jkr.player.checkResource(1, 1, 1, 0, 1)) {
                    jkr.gameScene.showTipsItemRender("资源不足.", 0.3);
                    return false;
                }
            } else if (this.cityType === 0) {
                if (!jkr.player.checkResource(0, 2, 0, 3, 0)) {
                    jkr.gameScene.showTipsItemRender("资源不足.", 0.3);
                    return false;
                }
            }
        }
        jkr.Logger.debug("not player build time");
        return true;
    },

    getCityOwnerIndex: function() {
        return this.roleIndex;
    },

    // 相邻是否有其他城;
    checkRoundHadCity: function() {
        for (let i = 0; i < this.roads.length; i++) {
            let eachRoadObj = this.roads[i];
            if (eachRoadObj.otherCityHold(this)) {
                return true;
            }
        }
        return false;
    },

    otherRoadHold: function(roadObj) {
        for (let i = 0; i < this.roads.length; i++) {
            let eachRoadObj = this.roads[i];
            if (eachRoadObj === roadObj) {
                continue;
            }
            if (eachRoadObj.getRoadOwnerIndex() === jkr.player.getMyRoleIndex()) {
                return true;
            }
        }
        return false;
    },

    // 有自己的路连到此城
    roundHadOwnRoad: function() {
        for (let i = 0; i < this.roads.length; i++) {
            let eachRoadObj = this.roads[i];
            if (eachRoadObj.getRoadOwnerIndex() === jkr.player.getMyRoleIndex()) {
                return true;
            }
        }
        return false;
    },

    // 准备回合发放第二个城资源
    preRoundGiveResource: function() {
        for (let i = 0; i < this.mapLands.length; i++) {
            let eachMapObj = this.mapLands[i];
            if (!eachMapObj || eachMapObj.mapType === jkr.constant.MAP_ROBBER) {
                continue;
            }
            jkr.player.addSelfResource(eachMapObj.mapType, 1);
        }
        jkr.player.refreshResourceView();
    },

    giveOwnerResource: function(mapType) {
        if (this.roleIndex !== jkr.player.getMyRoleIndex()) {
            jkr.Logger.debug("city not my");
            return;
        }
        jkr.player.addSelfResource(mapType, this.cityType + 1);
    },

    clearCityData: function() {
        this.cityType = -1;
        this.roleIndex = -1;
        this.smallNode.active = false;
        this.bigNode.active = false;
        this.mapLands = [];
    },

});
