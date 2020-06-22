let jkr = require("Jkr");

cc.Class({
    extends: cc.Component,

    properties: {
        loadingPagePrefab: {
            type: cc.Prefab,
            default: null
        },

        totalProgress: 2,
        tickTime: 0,
    },

    onLoad: function () {
        // 多语言初始化
        jkr.lang.init("zh");
        // 初始化数据存储工具
        jkr.StorageUtil.init();
        // 日志级别初始化
        jkr.Logger.init(jkr.config.LOGGER_LEVEL);

        // 初始化加载页面
        this.initLoadPage();
    },

    // 初始化加载页
    initLoadPage: function () {
        this.loadingPage = cc.instantiate(this.loadingPagePrefab);
        this.node.addChild(this.loadingPage);

        this.logoNode = cc.find("Logo", this.loadingPage);
        this.loadingBar = cc.find("Loading/LoadingProgressBar", this.loadingPage).getComponent(cc.ProgressBar);

        this.progress = 0;
        this.loadingBar.progress = this.progress;

        this.goToMainScene();
    },

    goToMainScene: function () {
        cc.director.preloadScene("mainScene",
            (completedCount, totalCount, item) => {},
            () => this.mainSceneLoaded = true);
    },
    
    updateProgress: function() {
        this.loadingBar.progress = this.progress;
    },

    update: function (dt) {
        if (this.progress >= 0.68 && !this.mainSceneLoaded || this.progress >= 1) {
            return;
        }
        this.tickTime += dt;
        this.progress = Math.min(1, this.tickTime / this.totalProgress);
        this.updateProgress();
        if (this.progress >= 1) {
            cc.tween(this.logoNode)
                .to(0.5, {opacity: 1})
                .call(() => cc.director.loadScene("mainScene"))
                .start();
        }
    },

});