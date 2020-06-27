/**
 * 页面管理器
 * 使用时作为页面管理的节点，脚本继承PageManager ---------------- extends: jkr.PageManager
 * 使用onLoadManager替代onLoad
 * 重写registerPage方法，下面有例子
 * 被管理的页面需要继承BasePage
 */
let jkr = require("Jkr");

let PageManager = cc.Class({
    extends: jkr.BaseUI,

    properties: {
        // 已创建页面map
        pageMap: {
            default: {},
            visible: false,
        },

        // 已打开页面map
        openedPageMap: {
            default: {},
            visible: false,
        },
        // 已注册页面map
        registeredPageMap: {
            default: {},
            visible: false,  
        },
        // 已注册页面array
        registeredPageList: {
            default: [],
            visible: false,
        },
        // 通用黑层预制体
        blackPrefab: {
            default: null,
            type: cc.Prefab,
        },
    },

    afterLoad () {
        this.registeredPageList = this.registerPage();

        // 需要检测的弹板列表
        this.checkShowPageList = [];
        for(let i = 0; i < this.registeredPageList.length; i++){
            if(this.registeredPageList[i].checkShowSort && this.registeredPageList[i].checkShowSort > 0){
                this.checkShowPageList.push(this.registeredPageList[i].pageType);
            }
        }
        // 缓存弹板列表 data = {pageType: jkr.pageConstant.PAGE_TYPE_PAUSE, pageData: 1, pageSort 1}
        this.cacheShowPageList = [];

        this.registerAllPage();
        this.onLoadManager();


    },

    /**
     * 加载完毕回调 -------- 替代onLoad
     */
    onLoadManager() {
        // Override me
    },

    /**
     * 注册所有页面
     */
    registerAllPage () {
        let registerPageNum = this.registeredPageList.length;
        if (registerPageNum === 0){
            return;
        }

        for (let i = 0; i < registerPageNum; i++){
            let pageData = this.registeredPageList[i];
            this.registerSinglePage(pageData);
        }
    },

    registerSinglePage(pageData) {
        if (!pageData || !pageData.pageType || !pageData.createPrefab){
            return;
        }
        (pageData.blackNodeType === void 0) && (pageData.blackNodeType = jkr.pageConstant.BLACK_NODE_TYPE_NONE);
        (pageData.showAnimType === void 0) && (pageData.showAnimType = jkr.pageConstant.OPEN_PAGE_ANIMATION_SCALE);

        this.registeredPageMap[pageData.pageType] = pageData;
    },

    /**
     * 根据注册的页面信息创建页面
     * @param {*} pageData | registerPageData
     */
    createPageByPageData (pageData) {
        if (!pageData || !pageData.pageType || !pageData.createPrefab) {
            return;
        }

        // if (isLoad && !pageData.createOnLoad){
        //     return;
        // }

        // 创建页面
        let pageNode = cc.instantiate(pageData.createPrefab);
        let pageScript = pageNode.getComponent(pageData.pageScript);

        // 设置页面唯一标识
        pageScript.setPageType(pageData.pageType);

        // 创建通用背景  
        let blackNode = this.createNewBlackNode(pageData.blackNodeType);
        pageScript.setBlackNode(blackNode);

        pageScript.node.parent = this.node;
        pageScript.node.position = cc.v2(0, 0);
        pageScript.setPageManager(this);

        this.pageMap[pageData.pageType] = pageScript;

        pageNode.active = false;
    },

    /**
     * 创建通用背景
     * @param {*} blackType | pageConstant.BLACKNODETYPE
     */
    createNewBlackNode(blackType) {
        let commonBlackPage = cc.instantiate(this.blackPrefab);
        commonBlackPage.parent = this.node;
        commonBlackPage.position = cc.v2(0, 0);

        let blackScript = commonBlackPage.getComponent("CommonBlackPage");
        blackScript.init(blackType);

        commonBlackPage.active = false;

        return commonBlackPage;
    },

    /**
     * 获取页面
     * @param pageType
     * @returns {null|*}
     */
    getPage (pageType) {
        if(!this.pageMap || !this.pageMap[pageType]){
            jkr.Logger.debug("Page not found ！！！");
            return null;
        }

        return this.pageMap[pageType];
    },

    /**
     * 显示页面
     * @param {*} pageType | 页面唯一标识
     * @param {*} data | 显示页面所需数据
     */
    showPage(pageType, data) {
        let pageData = this.registeredPageMap[pageType];
        if (!this.pageMap[pageType]) {
            this.createPageByPageData(pageData);
        }

        if (this.openedPageMap[pageType]) {
            return false;
        }

        // 检测该弹板是否需要缓存起来 不能马上弹
        if(this.isNeedCacheShow(pageType)){
            this.pushCacheShowPage(pageType, data);
            return false;
        }

        let page = this.pageMap[pageType];
        if(page){
            page.node.zIndex = pageData.zIndex || jkr.constant.PAGE_LAYER_TOP_BAR_UP;
            page.getBlackNode().zIndex = pageData.zIndex || jkr.constant.PAGE_LAYER_TOP_BAR_UP;
            page.showPage(data, pageData.showAnimType);
        }

        this.openedPageMap[pageType] = page;
        return true;
    },

    /**
     * 关闭页面
     * @param {*} pageType | 页面唯一标识
     */
    closePage(pageType) {
        this.openedPageMap[pageType] && this.openedPageMap[pageType].closePage();
    },

    // 返回已经打开的弹板数
    getOpenedPageCount() {
        //jkr.Logger.debug(this.openedPageMap);
        return Object.keys(this.openedPageMap).length;
    },

    /**
     * 将页面从已打开map中移除
     * @param {*} pageType 
     */
    removePageInOpened(pageType) {
        if (this.openedPageMap[pageType]) {
            delete this.openedPageMap[pageType];
            // 关闭页面完毕后 检测还有没有之前缓存的界面没弹出来
            this.checkCachePageShow();
        }
    },

    /**
     * 判断页面是否打开
     * @param {*} pageType | 页面唯一标识
     */
    pageIsOpened (pageType) {
        return !!this.openedPageMap[pageType];
    },

    /**
     * 注册页面信息
     */
    registerPage () {
        // Override me

        // example
        //
        // return [
        //     {
        //         pageType: jkr.pageConstant.PAGE_TYPE_MAIN,                                   // 页面唯一标示(必写)
        //         createPrefab: this.mainPrefab,                                               // 页面预制体(必写)
        //         pageScript: "MainPage",                                                      // 页面脚本(必写)
        //         createOnLoad: true,                                                          // 是否在页面管理器加载时创建(可省略，默认加载)
        //         blackNodeType: jkr.pageConstant.BLACK_NODE_TYPE_NONE,                        // 通用黑层类型(可省略，默认不添加黑层)
        //         showAnimType: jkr.pageConstant.OPEN_PAGE_ANIMATION_NONE,                     // 打开页面Action(可省略，默认缩放动画)
        //         checkShowSort: 1,                                                            // 弹板一个一个弹的显示优先级 数字越大 优先级越高（可省略 <=0 或者不写的 不参与弹板一个一个弹的检测）
        //     },
        //     {
        //         pageType: jkr.pageConstant.PAGE_TYPE_TASK,
        //         createPrefab: this.taskPrefab,
        //         pageScript: "TaskPage",
        //         createOnLoad: false,
        //         blackNodeType: jkr.pageConstant.BLACK_NODE_TYPE_BLACK,
        //         showAnimType: jkr.pageConstant.OPEN_PAGE_ANIMATION_SCALE,
        //         showSort: 2,
        //     },
        // ];
        return [];
    },

    // 需要检测 一个一个弹的界面
    checkPage() {
        // Override me

        // example
        // return [
        //     jkr.pageConstant.PAGE_TYPE_PAUSE,
        //     jkr.pageConstant.PAGE_TYPE_RESULT,
        // ];
        return [];
    },

    // 检测该弹板是否需要缓存起来 不能马上弹
    isNeedCacheShow: function (pageType) {
        // 需要检测 且 已经有弹板了
        return this.checkShowPageList.indexOf(pageType) >= 0 && this.getOpenedPageCount() > 0;
    },

    // 不能马上弹出来的弹板 进入缓存列表 (sort越小优先级越高)
    pushCacheShowPage: function(type, data) {
        let sort = this.registeredPageMap[type].checkShowSort;
        let cacheData = {pageType: type, pageData: data, pageSort: sort};
        if (this.cacheShowPageList.indexOf(cacheData) >= 0) {
            return;
        }
        this.cacheShowPageList.push(cacheData);

        // 缓存的列表 根据优先级 排序
        this.cacheShowPageList.sort(function (a, b) {
            let aSort = a.pageSort;
            let bSort = b.pageSort;
            return bSort - aSort;
        });

        // for(let i = 0; i < this.cacheShowPageList.length; i++){
        //     jkr.Logger.debug("this.cacheShowPageList i = " + + i + " data = " + JSON.stringify(this.cacheShowPageList[i]));
        // }
    },

    // 清空缓存列表
    cleanCacheShowPage: function () {
        this.cacheShowPageList = [];
    },

    // 检测缓存的弹板弹出来
    checkCachePageShow: function () {
        // 缓存中无数据
        if(this.cacheShowPageList.length <= 0){
            return;
        }

        // 引导中不弹 有其他弹板 不弹
        if ((jkr.guideManager && jkr.guideManager.isLimitClick()) || this.getOpenedPageCount() > 0) {
            jkr.Logger.debug("isLimitClick: " + jkr.guideManager.isLimitClick() + " curPage.length: " + this.getOpenedPageCount());
            return;
        }
        let cacheData = this.cacheShowPageList[0];
        let isShowSuccess = this.showPage(cacheData.pageType, cacheData.pageData);
        if(isShowSuccess){
            this.cacheShowPageList.splice(0, 1);
        }
    },
});

jkr.PageManager = PageManager;