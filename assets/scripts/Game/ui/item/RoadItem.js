let jkr = require("Jkr");

cc.Class({
    extends: cc.Component,

    properties: {
        roadNode: cc.Node,
        colorNode: cc.Node,
    },

    initRoad: function(logicPos1, logicPos2, twoLogicPosKey) {
        this.citys = [];
        this.cityType = -1;
        this.logicPosList = [logicPos1, logicPos2];
        this.roadKey = twoLogicPosKey;
    },

    setColor: function(color) {
        this.colorNode.color = color;
    },

    onClickRoad: function() {
        if (this.roleIndex >= 0) {
            jkr.Logger.debug("road had owner.");
            return false;
        }
        if (!this.checkRoadEnable()) {
            return;
        }
        let color = jkr.Utils.hex2color(jkr.player.getMyColor());
        this.setColor(color);
        this.node.opacity = 120;
        this.roadNode.active = true;
        let worldPos = this.node.convertToWorldSpaceAR(cc.v2(0, 0));
        let gameScenePos = jkr.gameScene.node.convertToNodeSpaceAR(worldPos);
        jkr.gameScene.showConfirmBuildPopUp({
            pos: gameScenePos,
            buildType: jkr.constant.buildType.road,
            onConfirm: () => this.sendBuildRoadMsg(),
            onCancel: () => this.cancelBuildRoad()
        });
    },

    sendBuildRoadMsg: function() {
        let gameSM = jkr.player.getGameSM();
        if (gameSM.is("operating")) {
            jkr.player.costResource(1, 0, 0, 0, 1);
        }
        jkr.gameScene.showLoadingCycle();
        let msg = {
            type: jkr.messageType.CS_BUILD_ROAD,
            roadKey: this.roadKey,
            roleIndex: jkr.player.getMyRoleIndex()
        }
        jkr.player.sendMessage(msg);
    },

    buildRoad: function(colorStr, roleIndex) {
        jkr.gameScene.hideLoadingCycle();
        this.node.opacity = 255;
        this.roadNode.active = true;
        let color = jkr.Utils.hex2color(colorStr);
        this.setColor(color);
        this.roleIndex = roleIndex;

        jkr.gameScene.hideConfirmBuildPopUp();
        jkr.player.checkPreRound();
    },
    
    cancelBuildRoad: function() {
        this.node.opacity = 255;
        this.roadNode.active = false;
    },

    addLinkedCity: function(cityObj) {
        this.citys.push(cityObj);
    },

    getRoadOwnerIndex: function() {
        return this.roleIndex;
    },

    // 另一个城是否被占领
    otherCityHold: function(cityObj) {
        for (let i = 0; i < this.citys.length; i++) {
            let eachCityObj = this.citys[i];
            if (eachCityObj === cityObj) {
                continue;
            }
            if (eachCityObj.getCityOwnerIndex() >= 0) {
                return true;
            }
        }
        return false;
    },

    // 路另一端是否占了成或连着路
    anyCityOrRoadHold: function() {
        for (let i = 0; i < this.citys.length; i++) {
            let eachCityObj = this.citys[i];
            // 路一边的城被占领, 且是别人的城
            if (eachCityObj.getCityOwnerIndex() >= 0
                    && eachCityObj.getCityOwnerIndex() !== jkr.player.getMyRoleIndex()) {
                continue;
            }
            // 路一边的城被自己占领
            if (eachCityObj.getCityOwnerIndex() === jkr.player.getMyRoleIndex()) {
                return true;
            }
            // 城没有被占领, 判断路是否自己占领
            if (eachCityObj.otherRoadHold(this)) {
                return true;
            }
        }
        return false;
    },

    checkRoadEnable: function() {
        if (!this.anyCityOrRoadHold()) {
            jkr.Logger.debug("none city build.");
            jkr.gameScene.showTipsItemRender("道路需要连接城镇", 0.5);
            return false;
        }
        let myRoleData = jkr.player.getRoleData(jkr.player.getMyRoleIndex());
        let gameSM = jkr.player.getGameSM();
        // 初始2城
        if (gameSM.is("preRound1") || gameSM.is("preRound2")) {
            if (gameSM.is("preRound1")) {
                if (!myRoleData.preCity1Build || myRoleData.preRoad1Build) {
                    return false;
                }
            }
            if (gameSM.is("preRound2")) {
                if (!myRoleData.preCity2Build || myRoleData.preRoad2Build) {
                    return false;
                }
            }
            for (let i = 0; i < this.citys.length; i++) {
                let eachCityObj = this.citys[i];
                if (eachCityObj.getCityOwnerIndex() < 0) {
                    continue;
                }
                if (myRoleData.preCityKey !== eachCityObj.cityKey) {
                    jkr.Logger.debug("preRound not this city road.");
                    jkr.gameScene.showTipsItemRender("初始道路需要连接对应城镇", 0.5);
                    return false;
                }
            }
        }
        // 操作中
        if (gameSM.is("operating")) {
            if (!jkr.player.isMyRound()) {
                jkr.gameScene.showTipsItemRender("不是自己的回合", 0.3);
                return false;
            }
            if (!jkr.player.checkResource(1, 0, 0, 0, 1)) {
                jkr.gameScene.showTipsItemRender("资源不足.", 0.3);
                return false;
            }
        }
        return true;
    },

    clearRoadData: function() {
        this.cityType = -1;
        this.roadNode.active = false;
    },

});
