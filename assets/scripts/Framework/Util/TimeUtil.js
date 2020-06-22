let TimeUtil = cc.Class({

    statics: {
        _instance: null,
        getInstance: function () {
            if (!this._instance) {
                this._instance = new TimeUtil();
            }
            return this._instance;
        }
    },

    properties: {
        // 一天的毫秒数
        ONE_DAY_MILLISECOND: 60 * 60 * 24 * 1000
    },

    /**
     * 获取当前毫秒数;
     */
    getTime: function() {
        return new Date().getTime();
    },

    /**
     * 获取整秒数;
     */
    getSecond: function() {
        return Math.ceil(new Date().getTime() / 1000);
    },

    /**
     * 秒数转 "00:00" 或 "00:00:00" 格式时间;
     * 例: 123 -> "02:03";
     */
    secondFormat: function(second) {
        let secondInteger = Math.ceil(second);
        let secondSlot = "" + secondInteger % 60;
        secondSlot = this.twoTimeFill(secondSlot);

        let minuteInteger = Math.floor(secondInteger / 60);
        let minuteSlot = "" + minuteInteger % 60;
        minuteSlot = this.twoTimeFill(minuteSlot);
        if (minuteInteger < 60) {
            return minuteSlot + ":" + secondSlot;
        }

        let hourSlot = "" + Math.floor(minuteInteger / 60);
        hourSlot = this.twoTimeFill(hourSlot);
        return hourSlot + ":" + minuteSlot + ":" + secondSlot;
    },

    /**
     * 秒数转 [天, 小时，分钟，秒]
     */
    secondArrayFormat: function(second, ignoreFill) {
        if (second < 0) {
            return [0, 0, 0, 0];
        }
        // 秒位
        let secondInteger = Math.ceil(second);
        let secondSlot = secondInteger % 60;
        if(!ignoreFill){
            secondSlot = this.twoTimeFill("" + secondSlot);
        }
        // 分钟位
        let minuteInteger = Math.floor(secondInteger / 60);
        let minuteSlot = minuteInteger % 60;
        if(!ignoreFill){
            minuteSlot = this.twoTimeFill("" + minuteSlot);
        }
        // 小时位
        let hourInteger = Math.floor(minuteInteger / 60);
        let hourSlot = hourInteger % 24;
        if(!ignoreFill){
            hourSlot =  this.twoTimeFill("" + hourSlot);
        }
        // 天位
        let daySlot = "" + Math.floor(hourInteger / 24);
        return [daySlot, hourSlot, minuteSlot, secondSlot];
    },

    twoTimeFill: function(timeStr) {
        if (timeStr.length < 2) {
            timeStr = "0" + timeStr;
        }
        return timeStr;
    },

    /**
     * 获取 "YYYY-MM-DD" 格式时间;
     */
    getFullDay: function() {
        let date = new Date();
        return date.getFullYear() + "-" + date.getMonth() + "-" + date.getDate();
    },

    getNextHourTime: function(time, hour) {
        let date = new Date(time);
        let curHours = date.getHours();
        let isNext = false;
        if (curHours >= hour) {
            isNext = true;
        }
        date.setHours(hour);
        date.setMinutes(0);
        date.setSeconds(0);
        let resTime = date.getTime();
        if (isNext) {
            resTime += 24 * 60 * 60 * 1000;
        }
        return resTime;
    },

    /**
     * 获取今天某点毫秒时间;
     *
     * @param hour 整点小时
     */
    getTodayHourTime: function(hour) {
        let curDate = new Date();
        curDate.setHours(hour);
        curDate.setMinutes(0);
        curDate.setSeconds(0);
        curDate.setMilliseconds(0);
        return curDate.getTime();
    },

    /**
     * 获取今天某点毫秒时间;
     *
     * @param clock 字符串 "00:00" 或 "00:00:00" 格式时间;
     */
    getTodayClockTime: function(clock) {
        let curDate = new Date();
        let clockSplit = clock.split(":");
        let hour = parseInt(clockSplit[0]);
        let minute = parseInt(clockSplit[1]);
        let second = 0;
        if (clockSplit.length > 2) {
            second = parseInt(clockSplit[2]);
        }
        curDate.setHours(hour);
        curDate.setMinutes(minute);
        curDate.setSeconds(second);
        return curDate.getTime();
    },

    /**
     * 一个小时的毫秒数;
     */
    getHourMillisecond: function() {
        return 60 * 60 * 1000;
    },

    getHourSecond: function() {
        return 60 * 60;
    }
});

module.exports = TimeUtil.getInstance();