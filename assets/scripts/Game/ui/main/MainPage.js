let jkr = require("Jkr");

cc.Class({
    extends: jkr.BaseUI,

    properties: {
        mapPanel: cc.Node,
        cityPanel: cc.Node,
        roadPanel: cc.Node,

        mapLandPrefab: cc.Prefab,

        cityPrefab: cc.Prefab,
        roadPrefab: cc.Prefab,

        rolePrefab: cc.Prefab,

        mapSpriteFrames: [cc.SpriteFrame],
        ratioSpriteFrames: [cc.SpriteFrame],

        rolePosNodes: [cc.Node]
    },

    registerGameListener: function() {
        this.registerListener(jkr.GameEventType.MAP_NUMBER_KEY + jkr.constant.ROB_NUMBER, () => this.robResource());
    },

    start() {
        this.logicPosToCity = {};
        this.twoLogicPosToRoad = {};

        this.initBuildings();
    },

    initGameMain: function() {
        this.node.opacity = 1;
        this.scheduleOnce(() => {
            let typesStr = JSON.stringify(jkr.constant.mapTypes);
            this.mapTypes = JSON.parse(typesStr);

            let ratioStr = JSON.stringify(jkr.constant.ratioTypes);
            this.ratioTypes = JSON.parse(ratioStr);

            this.initMap();
            jkr.player.getGameSM().begin();
        }, 0.5);

        this.roleItems = [];
        let firstIndex = jkr.player.getMyRoleIndex();
        for (let i = 0; i < jkr.player.gameRoleSize; i++) {
            let eachRoleIndex = firstIndex + i;
            if (eachRoleIndex >= jkr.player.gameRoleSize) {
                eachRoleIndex -= jkr.player.gameRoleSize;
            }
            let roleNode = this.rolePosNodes[i];
            if (!roleNode) {
                continue;
            }
            let roleItem = cc.instantiate(this.rolePrefab);
            let roleObj = roleItem.getComponent("RoleItem");
            roleObj.initRole(eachRoleIndex);
            roleNode.addChild(roleItem);
            this.roleItems.push(roleItem);
        }
    },

    clearGameMain: function() {
        for (let i = 0; i < this.landObjList.length; i++) {
            let eachLandObj = this.landObjList[i];
            eachLandObj.unregisterListener();
        }

        let cityKeys = Object.keys(this.logicPosToCity);
        for (let i = 0; i < cityKeys.length; i++) {
            let eachKey = cityKeys[i];
            if (!this.logicPosToCity.hasOwnProperty(eachKey)) {
                continue;
            }
            let cityObj = this.logicPosToCity[eachKey];
            cityObj.clearCityData();
        }

        for (let i = 0; i < this.roadObjList.length; i++) {
            let eachRoadObj = this.roadObjList[i];
            eachRoadObj.clearRoadData();
        }

        for (let i = 0; i < this.roleItems.length; i++) {
            this.roleItems[i].destroy();
        }
        this.roleItems = [];
    },

    initMap: function() {
        let robberIndex = jkr.Utils.getSeedRandomInt(0, 18);

        if (!this.landObjList || this.landObjList.length <= 0) {
            this.landObjList = [];
            for (let i = 0; i < 19; i++) {
                let land = cc.instantiate(this.mapLandPrefab);
                let landObj = land.getComponent("MapLandItem");
                landObj.host = this;
                if (robberIndex === i) {
                    landObj.initLandItem(i, jkr.constant.MAP_ROBBER, jkr.constant.ROB_NUMBER);
                } else {
                    landObj.initLandItem(i, this.randomMapType(), this.randomMapRatio());
                }
                land.parent = this.mapPanel;
                this.landObjList.push(landObj);
            }
        } else {
            for (let i = 0; i < 19; i++) {
                let landObj = this.landObjList[i];
                if (robberIndex === i) {
                    landObj.initLandItem(i, jkr.constant.MAP_ROBBER, jkr.constant.ROB_NUMBER);
                } else {
                    landObj.initLandItem(i, this.randomMapType(), this.randomMapRatio());
                }
            }
        }

    },

    initBuildings: function() {
        // 房子
        for (let i = 1; i <= 11; i++) {
            for (let j = 1; j <= 6; j++) {
                let valid = this.checkValidPos(i, j);
                if (!valid) {
                    continue;
                }
                this.createCity([i, j], this.getPositionByPoint([i, j]));
            }
        }
        // 路
        this.roadObjList = [];
        for (let i = 1; i <= 11; i++) {
            for (let j = 1; j <= 6; j++) {
                let valid = this.checkValidPos(i, j);
                if (!valid) {
                    continue;
                }
                if ((i + j) % 2 !== 0) {
                    continue;
                }
                let pointList = this.getNearlyPointList([i, j]);
                for (let k = 0; k < pointList.length; k++) {
                    let eachNear = pointList[k];
                    this.createRoad([i, j], eachNear);
                }
            }
        }
    },

    randomMapType: function() {
        let typeKeys = Object.keys(this.mapTypes);
        let randomKey = jkr.Utils.getSeedRandomItemInList(typeKeys);
        this.mapTypes[randomKey] -= 1;
        if (this.mapTypes[randomKey] <= 0) {
            delete this.mapTypes[randomKey];
        }
        return randomKey;
    },

    randomMapRatio: function() {
        let ratioKeys = Object.keys(this.ratioTypes);
        let randomKey = jkr.Utils.getSeedRandomItemInList(ratioKeys);
        this.ratioTypes[randomKey] -= 1;
        if (this.ratioTypes[randomKey] <= 0) {
            delete this.ratioTypes[randomKey];
        }
        return randomKey;
    },

    getNearlyPointList: function (tarPoint) {
        let logicX = tarPoint[0];
        let logicY = tarPoint[1];

        let logicPosList = [];
        if (this.checkValidPos(logicX - 1, logicY)) {
            logicPosList.push([logicX - 1, logicY]);
        }
        if (this.checkValidPos(logicX + 1, logicY)) {
            logicPosList.push([logicX + 1, logicY]);
        }
        let lp3;
        if ((logicX + logicY) % 2 === 0) {
            lp3 = [logicX, logicY + 1];
        } else {
            lp3 = [logicX, logicY - 1];
        }
        if (lp3 && this.checkValidPos(lp3[0], lp3[1])) {
            logicPosList.push(lp3);
        }
        return logicPosList;
    },

    getPositionByPoint: function (tarPoint) {
        let x, y, num=0;
        y = (6 - tarPoint[0]) * 56.48;

        if (tarPoint[0] % 2 === 0) {
            switch (tarPoint[1] - 3) {
                case -2:
                    num = -4;
                    break;
                case -1:
                    num = -2;
                    break;
                case 0:
                    num = -1;
                    break;
                case 1:
                    num = 1;
                    break;
                case 2:
                    num = 2;
                    break;
                case 3:
                    num = 4;
                    break;
                default:
                    num = 0;
                    break;
            }
        } else {
            switch (tarPoint[1] - 3) {
                case -2:
                    num = -3.5;
                    break;
                case -1:
                    num = -2.5;
                    break;
                case 0:
                    num = -0.5;
                    break;
                case 1:
                    num = 0.5;
                    break;
                case 2:
                    num = 2.5;
                    break;
                case 3:
                    num = 3.5;
                    break;
                default:
                    num = 0;
                    break;
            }
        }
        x = num *  63.36;
        return [x, y];
    },

    // 造城
    createCity: function(logicPos, position) {
        let cityNode = cc.instantiate(this.cityPrefab);
        let cityObj = cityNode.getComponent("CityItem");
        let logicPosKey = this.logicPosToKey(logicPos);
        cityObj.initCity(logicPos, position, logicPosKey);
        this.logicPosToCity[logicPosKey] = cityObj;
        cityNode.parent = this.cityPanel;
    },

    createRoad: function(logicPos, nearLogicPos) {
        let position1 = this.getPositionByPoint(logicPos);
        let position2 = this.getPositionByPoint(nearLogicPos);
        let pos1V2 = cc.v2(position1[0], position1[1]);
        let pos2V2 = cc.v2(position2[0], position2[1]);
        let centerPosition = jkr.Utils.getCenter(pos1V2, pos2V2);

        let roadAngle = jkr.Utils.getRotation(pos1V2, pos2V2);
        let roadNode = cc.instantiate(this.roadPrefab);
        let roadObj = roadNode.getComponent("RoadItem");
        let twoLogicPosKey = this.twoLogicPosToKey(logicPos, nearLogicPos);
        roadObj.initRoad(logicPos, nearLogicPos, twoLogicPosKey);
        roadNode.position = centerPosition;
        roadNode.angle = roadAngle;
        roadNode.parent = this.roadPanel;
        // 放入缓存
        this.twoLogicPosToRoad[twoLogicPosKey] = roadObj;

        // 路一端的城
        let logicPosKey = this.logicPosToKey(logicPos);
        let cityObj = this.logicPosToCity[logicPosKey];
        cityObj.addLinkedRoad(roadObj);
        roadObj.addLinkedCity(cityObj);
        // 路二端的城
        let logicPosKey1 = this.logicPosToKey(nearLogicPos);
        let cityObj1 = this.logicPosToCity[logicPosKey1];
        cityObj1.addLinkedRoad(roadObj);
        roadObj.addLinkedCity(cityObj1);

        this.roadObjList.push(roadObj);
    },

    // 一个点, 城的位置索引
    logicPosToKey: function(logicPos) {
        if (!logicPos || logicPos.length < 2) return null;
        return logicPos[0] + "_" + logicPos[1];
    },

    // 两个点, 路的位置索引
    twoLogicPosToKey: function(logicPos1, logicPos2) {
        return logicPos1[0] + "_" + logicPos1[1] + "||" + logicPos2[0] + "_" + logicPos2[1];
    },

    getCityObjByCityKey: function(cityKey) {
        return this.logicPosToCity[cityKey];
    },

    // true: 有效点, false: 无效点
    checkValidPos: function(logicX, logicY) {
        // 特殊点排除
        if (logicX < 1 || logicX > 11 || logicY < 1 || logicY > 6) {
            return false;
        }
        return !(((logicX === 1 || logicX === 11) && (logicY <= 2 || logicY >= 5))
            || ((logicX === 2 || logicX === 10) && (logicY === 1 || logicY === 6)));

    },

    getMapSpriteFrame: function(mapType) {
        switch (mapType) {
            case jkr.constant.MAP_BRICK:
                return this.mapSpriteFrames[0];
            case jkr.constant.MAP_RICE:
                return this.mapSpriteFrames[1];
            case jkr.constant.MAP_SHEEP:
                return this.mapSpriteFrames[2];
            case jkr.constant.MAP_STONE:
                return this.mapSpriteFrames[3];
            case jkr.constant.MAP_WOOD:
                return this.mapSpriteFrames[4];
            default:
                return this.mapSpriteFrames[5];
        }
    },

    getRatioSpriteFrame: function(ratio) {
        return this.ratioSpriteFrames[ratio - 1];
    },
    
    onClickNext: function() {
        if (!jkr.player.isMyRound()) {
            jkr.gameScene.showTipsItemRender("不是自己的回合, 等会儿", 0.3);
            return;
        }
        let msg = {
            type: jkr.messageType.CS_TURN_NEXT_ONE,
            roleIndex: jkr.player.getMyRoleIndex()
        }
        jkr.player.sendMessage(msg);
    },

    onClickExchange: function() {
        jkr.gameScene.showExchangePopUp({type: jkr.constant.exchangeType.player});
    },

    onClickSkill: function() {

    },

    robResource: function() {
        jkr.gameScene.showTipsItemRender("海盗来了...", 0.5);
        let totalNum = jkr.player.getTotalResourceNum();
        if (totalNum > jkr.constant.ROB_NUMBER) {
            jkr.gameScene.showRobPopUp();
        }
    },

    onBuildRoad: function(roadKey, roleIndex) {
        let roadObj = this.twoLogicPosToRoad[roadKey];
        if (!roadObj) {
            jkr.gameScene.showTipsItemRender("道路建设出错! roadKey不存在!", 0.5);
            return;
        }
        let roleData = jkr.player.getRoleData(roleIndex);
        if (!roleData) {
            jkr.gameScene.showTipsItemRender("道路建设出错! 玩家不存在!", 0.5);
            return;
        }
        let gameSM = jkr.player.getGameSM();
        if (gameSM.is("preRound1")) {
            roleData.preRoad1Build = true;
        } else if (gameSM.is("preRound2")) {
            roleData.preRoad2Build = true;
        }
        roadObj.buildRoad(roleData.color, roleIndex);
    },

    onBuildCity: function(cityKey, roleIndex, cityType) {
        let cityObj = this.getCityObjByCityKey(cityKey);
        if (!cityObj) {
            jkr.gameScene.showTipsItemRender("城市建设出错! cityKey不存在!", 0.5);
            return;
        }
        let roleData = jkr.player.getRoleData(roleIndex);
        if (!roleData) {
            jkr.gameScene.showTipsItemRender("城市建设出错! 玩家不存在!", 0.5);
            return;
        }
        let gameSM = jkr.player.getGameSM();
        if (gameSM.is("preRound1")) {
            roleData.preCity1Build = true;
            roleData.preCityKey = cityKey;
        } else if (gameSM.is("preRound2")) {
            roleData.preCity2Build = true;
            roleData.preCityKey = cityKey;
        }
        cityObj.buildCity(roleData.color, roleIndex, cityType);
    },

    refreshAllRolesColor: function() {
        for (let i = 0; i < this.roleItems.length; i++) {
            let roleItem = this.roleItems[i];
            let roleObj = roleItem.getComponent("RoleItem");
            roleObj.resetColor();
        }
    },

    turnToNextRound: function() {
        let gameSM = jkr.player.getGameSM();
        if (!gameSM.can("toNext")) {
            return;
        }
        gameSM.toNext();
        jkr.gameScene.showTipsItemRender("本回合结束, 新回合开始", 0.5);
        this.scheduleOnce(() => {
            if (!gameSM.can("throwDice")) {
                return;
            }
            gameSM.throwDice();
        }, 1);
    },

});