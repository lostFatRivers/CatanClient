/**
 * 页面管理中页面基类BasePage
 * 使用时页面脚本需继承BasePage ------------- extends: jkr.BasePage
 * 使用onLoadPage替代onLoad
 * pageConstant ------------ 页面管理相关枚举，包含页面唯一标示，页面Action类型，(黑层类型，Action和黑层类型请基于需求修改)
 */
const jkr = require("Jkr");

let BasePage = cc.Class ({
    extends: jkr.BaseUI,

    properties: {
        // 页面管理器
        pageManager: {
            default: null,
            visible: false,
        },

        // 打开页面传递的数据
        data: {
            default: null,
            visible: false,
        },

        // 通用黑底
        blackNode: {
            default: null,
            visible: false,
        },

        // 页面唯一标示
        pageType: {
            default: -1,
            visible: false,
        },
    },

    afterLoad () {
        // let closeNode = cc.find("ButtonClose", this.node);
        // closeNode.on(cc.Node.EventType.TOUCH_END, function () {
        //     this.closePage();
        // }, this);

        this.onLoadPage();
    },

    /**
     * 页面加载完毕后调用 -------- 替代 onLoad
     */
    onLoadPage () {
         // Override me
    },

    /**
     * 设置页面唯一标示
     * @param {*} type 
     */
    setPageType (type) {
        this.pageType = type;
    },

    /**
     * 获取页面唯一标示
     */
    getPageType() {
        return this.pageType;
    },

    /**
     * 设置页面管理器
     * @param {*} pageManager 
     */
    setPageManager(pageManager) {
        this.pageManager = pageManager;
    },

    /**
     * 获取页面管理器
     */
    getPageManager () {
        return this.pageManager;
    },

    /**
     * 获取打开页面传递的数据
     */
    getData () {
        return this.data;
    },

    /**
     * 设置打开页面需要传递的数据
     * @param {*} data 
     */
    setData (data) {
        this.data = data;
    },

    /**
     * 设置通用黑底
     * @param {*} node 
     */
    setBlackNode(node) {
        this.blackNode = node;
    },

    /**
     * 获取通用黑底
     */
    getBlackNode() {
        return this.blackNode;
    },

    /**
     * 打开页面
     * @param {*} data
     * @param {*} animType 
     */
    showPage(data, animType) {

        this.node.active = true;
        this.blackNode && (this.blackNode.active = true);
        this.animType = animType;

        this.setData(data);
        this.showPageBegan();

        if (animType === jkr.pageConstant.OPEN_PAGE_ANIMATION_NONE){
            this.node.scale = 1;
            this.showPageEnded();
        } else if (animType === jkr.pageConstant.OPEN_PAGE_ANIMATION_SCALE){
            this.node.scale = 0;
            var scale1 = cc.scaleTo(0.1, 1.1);
            var scale2 = cc.scaleTo(0.1, 1);
            var callFunc = cc.callFunc(function () {
                this.showPageEnded();
            }, this);
            var actions = cc.sequence(scale1, scale2, callFunc);
            this.node.stopAllActions();
            this.node.runAction(actions);
        } else if (animType === jkr.pageConstant.OPEN_PAGE_ANIMATION_OPACITY) {
            this.node.scale = 1;
            this.node.opacity = 1;
            this.node.stopAllActions();
            cc.tween(this.node)
                .to(0.2, {opacity: 255})
                .call(() => this.showPageEnded())
                .start();
        }
    },

    /**
     * 页面动画前回调
     */
    showPageBegan() {
        // Override me
    },

    /**
     * 页面动画后回调
     */
    showPageEnded () {
        // Override me
    },

    /**
     * 关闭页面
     */
    closePage() {
        this.closePageBegan();
        this.blackNode && (this.blackNode.active = false);

        if (this.animType === jkr.pageConstant.OPEN_PAGE_ANIMATION_NONE){
            this.closePageEnded();
            this.pageManager.removePageInOpened(this.pageType);
            this.node.active = false;
        } else if (this.animType === jkr.pageConstant.OPEN_PAGE_ANIMATION_SCALE){
            var scale1 = cc.scaleTo(0.1, 0);
            var callFunc = cc.callFunc(function () {
                this.closePageEnded();
                this.pageManager.removePageInOpened(this.pageType);
                this.node.active = false;
            }, this);
            var actions = cc.sequence(scale1, callFunc);
            this.node.stopAllActions();
            this.node.runAction(actions);
        } else if (this.animType === jkr.pageConstant.OPEN_PAGE_ANIMATION_OPACITY) {
            this.node.scale = 1;
            this.node.stopAllActions();
            cc.tween(this.node)
                .to(0.2, {opacity: 1})
                .call(() => {
                    this.showPageEnded();
                    this.pageManager.removePageInOpened(this.pageType);
                    this.node.active = false;
                })
                .start();
        }
    },

    /**
     * 关闭页面前回调
     */
    closePageBegan() {
        // Override me
    },

    /**
     * 页面关闭动画后回调
     */
    closePageEnded() {
        // Override me
    },
});

jkr.BasePage = BasePage;