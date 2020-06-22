let Logger = cc.Class({

    statics: {
        // 记录的日志等级 >= loggerLevel;
        loggerLevel: 0,
        isInit: false,

        init: function(level) {
            if (this.isInit) {
                return;
            }
            let lowerLevelStr = level.toLowerCase();
            if (!LoggerLevel[lowerLevelStr]) {
                return;
            }
            this.isInit = true;
            this.loggerLevel = LoggerLevel[lowerLevelStr];
        },

        debug: function(...args) {
            if (this.loggerLevel > LoggerLevel.debug) {
                return;
            }
            if (cc.sys.isBrowser) {
                cc.log("%s [DEBUG] " + cc.js.formatStr.apply(cc,arguments), this.getDateString());
            } else {
                cc.log(this.getDateString(), "[DEBUG]", cc.js.formatStr.apply(cc,arguments));
            }
        },

        info: function(...args) {
            if (this.loggerLevel > LoggerLevel.info) {
                return;
            }
            if (cc.sys.isBrowser) {
                cc.log("%c%s [INFO] " + cc.js.formatStr.apply(cc,arguments), "color:#00CD00;", this.getDateString());
            } else {
                cc.log(this.getDateString(), "[INFO]", cc.js.formatStr.apply(cc,arguments));
            }
        },

        warn: function(...args) {
            if (this.loggerLevel > LoggerLevel.warn) {
                return;
            }
            if (cc.sys.isBrowser) {
                cc.log("%c%s [WARN] " + cc.js.formatStr.apply(cc,arguments), "color:#ee7700;", this.getDateString());
            } else {
                cc.log(this.getDateString(), "[WARN]", cc.js.formatStr.apply(cc,arguments));
            }
        },

        error: function(...args) {
            if (this.loggerLevel > LoggerLevel.error) {
                return;
            }
            if (cc.sys.isBrowser) {
                cc.log("%c%s [ERROR] " + cc.js.formatStr.apply(cc,arguments), "color:red", this.getDateString());
            } else {
                cc.log(this.getDateString(), "[ERROR]", cc.js.formatStr.apply(cc,arguments));
            }
        },

        getDateString: function() {
            let d = new Date();
            let str = d.getHours().toString();
            let timeStr = "";
            timeStr += (str.length === 1 ? "0" + str : str) + ":";
            str = d.getMinutes().toString();
            timeStr += (str.length === 1 ? "0" + str : str) + ":";
            str = d.getSeconds().toString();
            timeStr += (str.length === 1 ? "0" + str : str) + " ";
            str = d.getMilliseconds().toString();
            if(str.length === 1) str = "00"+str;
            if(str.length === 2) str = "0"+str;
            timeStr += str;

            return "[" + timeStr + "]";
        },

        printStack: function() {
            let e = new Error();
            let lines = e.stack.split("\n");
            for (let i = 0; i < lines.length; i++) {
                cc.log(lines[i]);
            }
        }

    }

});

let LoggerLevel = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3,
};

module.exports = Logger;