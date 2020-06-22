let LanguageUtils = cc.Class({
    statics: {
        _i18n: null,

        _instance: null,
        getInstance: function() {
            if (!this._instance) {
                this._instance = new LanguageUtils();
            }
            return this._instance;
        }
    },

    /**
     * 初始化;
     *
     * @param lang 语言( zh | en )
     */
    init: function() {
        let lang = "zh";
        if(cc.sys.language !== cc.sys.LANGUAGE_CHINESE){
            lang = "en";
        }
        this._i18n = require('LanguageData');
        this._i18n.init(lang);
    },

    /**
     * 获取多语言text值;
     *
     * @param key text的key
     * @returns {never|*} 对应的多语言字符串
     */
    getGameText: function(key) {
        return this._i18n.t("GameText."+key);
    },

    getArgGameText: function(key, arg) {
        let result = this.getGameText(key);
        if (arg && arg.length > 0) {
            for (let i = 0; i < arg.length; i++) {
                let re = new RegExp('\\{' + (i) + '\\}', 'gm');
                result = result.replace(re, arg[i]);
            }
        }
        return result;
    },

    // 获取指定多语言 加参格式化字符串
    getFormatString: function(textId, arg) {
        let result = this.getGameText(textId);
        // 替换arg数组里的值到{0} {1}...里
        if (arg !== undefined && arg !== null && arg.length > 0) {
            for (let i = 0; i < arg.length; i++) {
                let re = new RegExp('\\{' + (i) + '\\}', 'gm');
                result = result.replace(re, arg[i]);
            }
        }
        return result;
    },

    updateLabelStringArgs: function(label, gameText, arg) {
        // 默认文本
        let result = label.string;

        result = this.getGameText(gameText);

        // 替换arg数组里的值到{0} {1}...里
        if (arg && arg.length > 0) {
            for (let i = 0; i < arg.length; i++) {
                let re = new RegExp('\\{' + (i) + '\\}', 'gm');
                result = result.replace(re, arg[i]);
            }
        }
        this.setString(label, result);
    },
    
    /**
     * 切换语言
     * @param {*} curlang
     */
    changeLanguage:function(curlang){
        if(!this._i18n || !curlang) {
            return;
        }
        this._i18n.init(curlang);
        this._i18n.updateSceneRenderers();
    },

    // 更新label文本根据{0} {1}... 替换成arg数组里的值
    updateLabelString: function(label, arg) {
        let result = label.string;

        // 获取策划配置的GameText.xxxx的文本
        let localizedLabel = label.node.getComponent("LocalizedLabel");
        if (localizedLabel) {
            let textId = localizedLabel._dataID;
            textId = textId.replace("GameText.", "");
            result = this.getGameText(textId);
        }

        // 替换arg数组里的值到{0} {1}...里
        if (arg && arg.length > 0) {
            for (let i = 0; i < arg.length; i++) {
                let re = new RegExp('\\{' + (i) + '\\}', 'gm');
                result = result.replace(re, arg[i]);
            }
        }
        this.setString(label, result);
    },

    // 设置label的string 同时刷新黑影显示
    setString: function(label, string) {
        label.string = string;
        let labelShadow = label.node.getComponent("LabelShadow");
        if (labelShadow) {
            labelShadow.onLabelChange();
        }
    }
});

module.exports = LanguageUtils.getInstance();
