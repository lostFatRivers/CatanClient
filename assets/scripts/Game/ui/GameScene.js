let jkr = require("Jkr");

cc.Class({
    extends: jkr.PageManager,

    properties: {
        commonItemPrefab: cc.Prefab,
        commonTipPrefab: cc.Prefab,

        colorSelectPrefab: cc.Prefab,
        throwDicePrefab: cc.Prefab,
        settingPrefab: cc.Prefab,
        roomDetailPrefab: cc.Prefab,
        buildConfirmPrefab: cc.Prefab,
        exchangePrefab: cc.Prefab,
        otherExchangeBackPrefab: cc.Prefab,
        congratulationPrefab: cc.Prefab,
        sysRobPrefab: cc.Prefab,
        sysRobWaitPrefab: cc.Prefab,
        playerRobOtherPrefab: cc.Prefab,
        skillPrefab: cc.Prefab,
    },

    onLoadManager: function() {
        // 静态数据初始化
        jkr.templateManager.init();

        this.initPlayer();
        this.initSounds();
        jkr.gameScene = this;
        this.preloadMainPage();

        this.createRoomPage();

        this.loadCycleNode = cc.find("loadingCycleNode", this.node);
        this.loadCycleSprite = cc.find("cycle", this.loadCycleNode);
        this.loadCycleNode.zIndex = jkr.constant.PAGE_LAYER_LOADING_CYCLE;

        this.chatNode = cc.find("chat", this.node);
        this.chatNode.zIndex = 800;

        this.mainNode = cc.find("mainNode", this.node);

        this.curTime = 0;
        if (cc.sys.os === cc.sys.OS_ANDROID) {
            jsb.reflection.callStaticMethod("org/cocos2dx/javascript/AppActivity", "removeLaunchImage", "()V");
        }

        this.showLoadingCycle();
        jkr.player.connectServer();
    },

    loadPrefab: function(url, lamb) {
        jkr.resLoader.loadRes(url, cc.Prefab, (err, res) => {
            if (err) {
                jkr.Logger.error("load prefab [", url, "] error:", err.message);
                return;
            }
            lamb(res);
        });
    },

    // 提前加载主页面
    preloadMainPage () {
        this.loadPrefab("prefab/ui/MainPage", pref => {
            this.mainPagePrefab = pref;
        });
    },

    showMainPage: function() {
        if (this.mainPage) {
            this.mainPage.active = true;
            this.mainPageObj.initGameMain();
            return;
        }
        this.mainPage = cc.instantiate(this.mainPagePrefab);
        this.mainNode.addChild(this.mainPage);
        this.mainPageObj = this.mainPage.getComponent("MainPage");
        this.mainPageObj.initGameMain();
    },

    slowShowMainPage: function() {
        if (!this.mainPage || !this.mainPage.active) {
            return;
        }
        this.mainPageObj.refreshAllRolesColor();
        cc.tween(this.mainPage)
            .to(0.5, {opacity: 255})
            .start();
    },

    hideMainPage: function() {
        if (this.mainPage) {
            this.mainPage.active = false;
            this.mainPageObj.clearGameMain();
        }
        jkr.player.clearGameData();
        this.showRoomPage();
    },

    createRoomPage: function() {
        this.loadPrefab("prefab/ui/RoomPage", pref => {
            let roomPage = cc.instantiate(pref);
            this.mainNode.addChild(roomPage);
            this.roomPageObj = roomPage.getComponent("RoomPage");
        });
    },

    showRoomPage: function() {
        if (!this.roomPageObj) {
            this.createRoomPage();
        } else {
            this.roomPageObj.node.active = true;
        }
    },
    
    hideRoomPage: function() {
        if (this.roomPageObj) {
            this.roomPageObj.node.active = false;
        }
    },

    showChatInput: function() {
        if (this.chatShow) {
            return;
        }
        jkr.Logger.debug("显示chat");
        this.chatShow = true;
        this.chatNode.active = true;
        this.chatNode.opacity = 1;
        cc.tween(this.chatNode)
            .to(0.3, {opacity: 255})
            .start();
    },

    hideChatInput: function() {
        if (!this.chatShow) {
            return;
        }
        this.chatShow = false;
        cc.tween(this.chatNode)
            .to(0.1, {opacity: 1})
            .call(() => this.chatNode.active = false)
            .start();
    },

    initPlayer: function() {
        jkr.player.init();
    },

    initSounds: function() {
        jkr.soundsUtil.loadSounds();
    },

    delayTask: function(lamb, delayTime) {
        this.scheduleOnce(() => lamb(), delayTime)
    },

    // 转菊花延迟执行任务
    loadingDelayTask: function(lamb, delayTime) {
        this.showLoadingCycle();
        this.scheduleOnce(() => {
            this.hideLoadingCycle();
            lamb();
        }, delayTime);
    },

    showRobOtherMask: function() {
        this.mainPageObj.showRobMaskSlow();
    },

    // 初始化tips提示界面
    initTipsItemRender: function() {
        this.tipsItemRender = cc.instantiate(this.commonTipPrefab);
        this.node.addChild(this.tipsItemRender, jkr.constant.PAGE_LAYER_TIP);
        this.tipsItemRender.setPosition(cc.v2(0, 0));
        this.tipsItemRenderObj = this.tipsItemRender.getComponent("CommonTipItemRender");
        this.tipsItemRenderObj.gameScene = this;
        this.tipsItemRender.active = false;
    },

    showTipsItemRender: function(string, stayTime = 1) {
        if (!this.tipsItemRender) {
            this.initTipsItemRender();
        }
        this.tipsItemRender.stopAllActions();
        this.tipsItemRender.setPosition(cc.v2(0, 0));
        this.tipsItemRender.active = true;
        this.tipsItemRender.opacity = 1;
        this.tipsItemRenderObj.initData(string);
        cc.tween(this.tipsItemRender)
            .delay(0.3)
            .parallel(
                cc.tween().by(0.25, {y: 120}, {easing: "cubicOut"}),
                cc.tween().to(0.25, {opacity: 255})
            )
            .delay(stayTime)
            .parallel(
                cc.tween().by(0.3, {y: 180}, {easing: "cubicIn"}),
                cc.tween().to(0.3, {opacity: 1})
            )
            .call(() => {
                jkr.Logger.debug("Tips open over");
                this.tipsItemRender.active = false;
            })
            .start();
    },

    showLoadingCycle: function() {
        if (this.loadCycleNode.active) {
            return;
        }
        this.loadCycleNode.active = true;
        this.loadCycleSprite.stopAllActions();
        cc.tween(this.loadCycleSprite)
            .by(0.1, {angle: -20})
            .repeatForever()
            .start();
    },

    hideLoadingCycle: function() {
        this.loadCycleSprite.stopAllActions();
        this.loadCycleNode.active = false;
    },

    showCongratulations: function(cType, roleName, roleColor, maxNum) {
        let data = {
            type: cType,
            roleName: roleName,
            roleColor: roleColor,
            num: maxNum
        }
        this.showPage(jkr.pageConstant.PAGE_TYPE_CONGRATULATION, data);
    },

    showColorPopUp: function() {
        this.showPage(jkr.pageConstant.PAGE_TYPE_SELECT_COLOR);
    },

    hideColorPopUp: function() {
        this.closePage(jkr.pageConstant.PAGE_TYPE_SELECT_COLOR);
    },

    showDicePopUp: function() {
        this.showPage(jkr.pageConstant.PAGE_TYPE_THROW_DICE);
    },

    hideDicePopUp: function() {
        this.closePage(jkr.pageConstant.PAGE_TYPE_THROW_DICE);
    },

    showSettingPage: function() {
        this.showPage(jkr.pageConstant.PAGE_TYPE_SETTING);
    },

    showRoomDetailPopUp: function(roomData) {
        this.showPage(jkr.pageConstant.PAGE_TYPE_ROOM_DETAIL, roomData);
    },

    hideRoomDetailPopUp: function() {
        this.closePage(jkr.pageConstant.PAGE_TYPE_ROOM_DETAIL);
    },

    showConfirmBuildPopUp: function(buildData) {
        this.showPage(jkr.pageConstant.PAGE_TYPE_BUILD_CONFIRM, buildData);
    },

    hideConfirmBuildPopUp: function() {
        this.closePage(jkr.pageConstant.PAGE_TYPE_BUILD_CONFIRM);
    },

    showExchangePopUp: function(exchangeData) {
        this.showPage(jkr.pageConstant.PAGE_TYPE_EXCHANGE, exchangeData);
    },

    hideExchangePopUp: function() {
        this.closePage(jkr.pageConstant.PAGE_TYPE_EXCHANGE);
    },

    showOtherExchangeBackPopUp: function() {
        this.showPage(jkr.pageConstant.PAGE_TYPE_OTHER_EXCHANGE_BACK);
    },

    hideOtherExchangeBackPopUp: function() {
        this.closePage(jkr.pageConstant.PAGE_TYPE_OTHER_EXCHANGE_BACK);
    },

    showSysRobPopUp: function() {
        this.showPage(jkr.pageConstant.PAGE_TYPE_SYSTEM_ROB);
    },

    hideSysRobPopUp: function() {
        this.closePage(jkr.pageConstant.PAGE_TYPE_SYSTEM_ROB);
    },

    showSysRobWaitPopUp: function(data) {
        this.showPage(jkr.pageConstant.PAGE_TYPE_SYSTEM_ROB_WAIT, data);
    },

    hideSysRobWaitPopUp: function() {
        this.closePage(jkr.pageConstant.PAGE_TYPE_SYSTEM_ROB_WAIT);
    },

    showPlayerRobOtherPopUp: function(data) {
        this.showPage(jkr.pageConstant.PAGE_TYPE_PLAYER_ROB_OTHER, data);
    },

    hidePlayerRobOtherPopUp: function() {
        this.closePage(jkr.pageConstant.PAGE_TYPE_PLAYER_ROB_OTHER);
    },

    showSkillPopUp: function() {
        this.showPage(jkr.pageConstant.PAGE_TYPE_SKILL);
    },

    hideSkillPopUp: function() {
        this.closePage(jkr.pageConstant.PAGE_TYPE_SKILL);
    },

    update (dt) {
        this.curTime += dt;
        if (this.curTime >= 1) {
            this.curTime = 0;
        }
    },

    registerPage () {
        return [
            {
                pageType: jkr.pageConstant.PAGE_TYPE_SELECT_COLOR,
                createPrefab: this.colorSelectPrefab,
                pageScript: "SelectColorPopUp",
                blackNodeType: jkr.pageConstant.BLACK_NODE_TYPE_NONE,
                showAnimType: jkr.pageConstant.OPEN_PAGE_ANIMATION_OPACITY,
            },
            {
                pageType: jkr.pageConstant.PAGE_TYPE_THROW_DICE,
                createPrefab: this.throwDicePrefab,
                pageScript: "ThrowDicePopUp",
                blackNodeType: jkr.pageConstant.BLACK_NODE_TYPE_NONE,
                showAnimType: jkr.pageConstant.OPEN_PAGE_ANIMATION_OPACITY,
            },
            {
                pageType: jkr.pageConstant.PAGE_TYPE_SETTING,
                createPrefab: this.settingPrefab,
                pageScript: "SettingPopUp",
                blackNodeType: jkr.pageConstant.BLACK_NODE_TYPE_NONE,
                showAnimType: jkr.pageConstant.OPEN_PAGE_ANIMATION_OPACITY,
            },
            {
                pageType: jkr.pageConstant.PAGE_TYPE_ROOM_DETAIL,
                createPrefab: this.roomDetailPrefab,
                pageScript: "RoomDetailPopUp",
                blackNodeType: jkr.pageConstant.BLACK_NODE_TYPE_NONE,
                showAnimType: jkr.pageConstant.OPEN_PAGE_ANIMATION_OPACITY,
            },
            {
                pageType: jkr.pageConstant.PAGE_TYPE_BUILD_CONFIRM,
                createPrefab: this.buildConfirmPrefab,
                pageScript: "ConfirmBuildPopUp",
                blackNodeType: jkr.pageConstant.BLACK_NODE_TYPE_NONE,
                showAnimType: jkr.pageConstant.OPEN_PAGE_ANIMATION_OPACITY,
            },
            {
                pageType: jkr.pageConstant.PAGE_TYPE_EXCHANGE,
                createPrefab: this.exchangePrefab,
                pageScript: "ExchangePopUp",
                blackNodeType: jkr.pageConstant.BLACK_NODE_TYPE_NONE,
                showAnimType: jkr.pageConstant.OPEN_PAGE_ANIMATION_OPACITY,
            },
            {
                pageType: jkr.pageConstant.PAGE_TYPE_OTHER_EXCHANGE_BACK,
                createPrefab: this.otherExchangeBackPrefab,
                pageScript: "OtherExchangeBackPopUp",
                blackNodeType: jkr.pageConstant.BLACK_NODE_TYPE_NONE,
                showAnimType: jkr.pageConstant.OPEN_PAGE_ANIMATION_OPACITY,
            },
            {
                pageType: jkr.pageConstant.PAGE_TYPE_CONGRATULATION,
                createPrefab: this.congratulationPrefab,
                pageScript: "CongratulationPopUp",
                blackNodeType: jkr.pageConstant.BLACK_NODE_TYPE_NONE,
                showAnimType: jkr.pageConstant.OPEN_PAGE_ANIMATION_NONE,
            },
            {
                pageType: jkr.pageConstant.PAGE_TYPE_SYSTEM_ROB,
                createPrefab: this.sysRobPrefab,
                pageScript: "SysRobPopUp",
                blackNodeType: jkr.pageConstant.BLACK_NODE_TYPE_NONE,
                showAnimType: jkr.pageConstant.OPEN_PAGE_ANIMATION_OPACITY,
            },
            {
                pageType: jkr.pageConstant.PAGE_TYPE_SYSTEM_ROB_WAIT,
                createPrefab: this.sysRobWaitPrefab,
                pageScript: "SysRobWaitPopUp",
                blackNodeType: jkr.pageConstant.BLACK_NODE_TYPE_NONE,
                showAnimType: jkr.pageConstant.OPEN_PAGE_ANIMATION_OPACITY,
                zIndex: 14,
            },
            {
                pageType: jkr.pageConstant.PAGE_TYPE_PLAYER_ROB_OTHER,
                createPrefab: this.playerRobOtherPrefab,
                pageScript: "PlayerRobOtherPopUp",
                blackNodeType: jkr.pageConstant.BLACK_NODE_TYPE_NONE,
                showAnimType: jkr.pageConstant.OPEN_PAGE_ANIMATION_OPACITY,
            },
            {
                pageType: jkr.pageConstant.PAGE_TYPE_SKILL,
                createPrefab: this.skillPrefab,
                pageScript: "SkillPopUp",
                blackNodeType: jkr.pageConstant.BLACK_NODE_TYPE_NONE,
                showAnimType: jkr.pageConstant.OPEN_PAGE_ANIMATION_OPACITY,
            },
        ];
    },
});
