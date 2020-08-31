let jkr = require("Jkr");

cc.Class({
    extends: jkr.BaseUI,

    properties: {
        mapImage: cc.Sprite,
        ratioNode: cc.Node,
        ratioImage: cc.Sprite,
        robberImage: cc.Sprite,
    },

    start() {
        this.robberImage.node.on(cc.Node.EventType.TOUCH_END, () => {
            if (!jkr.player.isMyRound() || jkr.player.robberDone() || !this.canTouchRobber) {
                return;
            }
            jkr.player.setRobberOver(true);
            let msg = {
                type: jkr.messageType.CS_ROBBER_PUT_MAP,
                mapIndex: this.mapIndex,
            };
            jkr.player.sendMessage(msg);
        });
    },

    unregisterListener: function() {
        this.removeAllGameListener();
    },

    initLandItem: function(index, mapType, ratio) {
        this.mapIndex = index;
        this.mapType = mapType;
        this.ratioNum = ratio;
        this.mapPoints = [];
        this.roundCitys = [];

        this.initMapPoints(index);
        this.node.position = this.getPositionByIndex(index);
        this.mapImage.spriteFrame = this.host.getMapSpriteFrame(mapType);
        if (mapType === jkr.constant.MAP_ROBBER) {
            this.robberImage.node.active = true;
            this.ratioNode.active = false;
        } else {
            this.ratioNode.active = true;
            this.robberImage.node.active = false;
            this.ratioImage.spriteFrame = this.host.getRatioSpriteFrame(ratio);
        }
        this.registerListener(jkr.GameEventType.MAP_NUMBER_KEY + this.ratioNum, () => this.giveResource());
    },

    getPositionByIndex: function(index) {
        let offsetX = jkr.constant.MAP_OFFSET_X;
        let offsetY = jkr.constant.MAP_OFFSET_Y;
        if (index >= 0  && index <= 4) {
            return cc.v2(0, -offsetY * index * 2);
        } else if (index >= 5 && index <= 8) {
            return cc.v2(-offsetX, -offsetY * (index - 4.5) * 2);
        } else if (index >= 9 && index <= 12) {
            return cc.v2(offsetX, -offsetY * (index - 8.5) * 2);
        } else if (index >= 13 && index <= 15) {
            return cc.v2(-offsetX * 2, -offsetY * (index - 12) * 2);
        } else if (index >= 16 && index <= 18) {
            return cc.v2(offsetX * 2, -offsetY * (index - 15) * 2);
        }
    },

    initMapPoints: function(index) {
        let x = 1;
        let y1 = 1;
        let y2 = 2;
        if (index >= 0  && index <= 4) {
            x = index * 2 + 1;
            y1 = 3;
            y2 = 4;
        } else if (index >= 5 && index <= 8) {
            x = (index - 4) * 2;
            y1 = 2;
            y2 = 3;
        } else if (index >= 9 && index <= 12) {
            x = (index - 8) * 2;
            y1 = 4;
            y2 = 5;
        } else if (index >= 13 && index <= 15) {
            x = (index - 12) * 2 + 1;
            y1 = 1;
            y2 = 2;
        } else if (index >= 16 && index <= 18) {
            x = (index - 15) * 2 + 1;
            y1 = 5;
            y2 = 6;
        }
        this.mapPoints.push([x, y1], [x, y2]);
        this.mapPoints.push([x + 1, y1], [x + 1, y2]);
        this.mapPoints.push([x + 2, y1], [x + 2, y2]);

        for (let i = 0; i < this.mapPoints.length; i++) {
            let eachLogicPos = this.mapPoints[i];
            let cityKey = eachLogicPos[0] + "_" + eachLogicPos[1];
            let cityObj = this.host.getCityObjByCityKey(cityKey);
            if (!cityObj) {
                jkr.Logger.error("not found city:", cityKey);
                continue;
            }
            this.roundCitys.push(cityObj);
            cityObj.addPressMapLand(this);
        }
    },

    // 摇到本地块数字, 发放资源
    giveResource: function() {
        if (this.mapType === jkr.constant.MAP_ROBBER
            || this.ratioNum === jkr.constant.ROB_NUMBER) {
            return;
        }
        for (let i = 0; i < this.roundCitys.length; i++) {
            let eachCityObj = this.roundCitys[i];
            if (!eachCityObj || eachCityObj.roleIndex < 0) {
                continue;
            }
            eachCityObj.giveOwnerResource(this.mapType);
        }
    },
    
    setRobber: function(isRobber) {
        if (isRobber) {
            this.robberImage.node.active = true;
            this.robberImage.node.opacity = 255;
        } else {
            this.robberImage.node.active = false;
        }
        this.mapType = jkr.constant.MAP_ROBBER;
    },
    
    showRobImage: function() {
        this.robberImage.node.active = true;
        this.robberImage.node.opacity = 1;
        cc.tween(this.robberImage.node)
            .to(0.3, {opacity: 180})
            .start();
        this.canTouchRobber = true;
    },
    
    hideRobImage: function() {
        this.canTouchRobber = false;
        if (this.mapType === jkr.constant.MAP_ROBBER) {
            return;
        }
        this.robberImage.node.active = false;
    },

    getRoundRoleIndex: function() {
        let roleIndexArray = [];
        for (let i = 0; i < this.roundCitys.length; i++) {
            let eachCityObj = this.roundCitys[i];
            if (!eachCityObj || eachCityObj.roleIndex < 0) {
                continue;
            }
            roleIndexArray.push(eachCityObj.roleIndex);
        }
        return roleIndexArray;
    },
});
