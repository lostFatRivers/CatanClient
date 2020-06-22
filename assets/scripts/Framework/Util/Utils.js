let Logger = require("Logger");
let CryptoJS = require("CryptoJS");

let Utils = cc.Class({

    statics: {
        loginServerTime: 0,
        loginTime: 0,
        serverZeroTime : 0,
        SAVE_SOCK_SETTING_DATA: "PLANE_SAVE_SOCK_SETTING_DATA",     // 震动设置
        _localCryptIvPart: "fGb7e",
        _localCryptKPart: "Yfdjn",

        directorPauseStartTime: 0,
        countTime: 0,

        seed: 5,

        /**
         * 生成 websocket 连接的 url;
         *
         * @param host 服务器ip;
         * @param port 服务器端口;
         * @param isSSL 是否是SSL加密模式;
         * @returns {string} websocket url;
         */
        buildWebsocketUrl: function(host, port, isSSL) {
            if (isSSL) {
                return "wss://" + host + ":" + port + "/websocket";
            }
            return "ws://" + host + ":" + port + "/websocket";
        },

        /**
         * 字符串类型的key用之前需要用uft8先parse一下才能用
         * 读取encryptedData上的ciphertext.toString()才能拿到跟Java一样的密文
         * @param keyStr
         * @param content
         * @param ivStr
         */
        stringEncrypt: function(keyStr, content, ivStr) {
            let key = CryptoJS.enc.Utf8.parse(keyStr);
            let iv = CryptoJS.enc.Utf8.parse(ivStr);
            let encryptedData = CryptoJS.AES.encrypt(content ,key,{
                iv:iv,
                mode: CryptoJS.mode.CBC,
                padding: CryptoJS.pad.Pkcs7
            });
            return encryptedData.ciphertext.toString();
        },

        /**
         * 字符串类型的密文需要先将其用Hex方法parse一下
         * 将密文转为Base64的字符串
         * 只有Base64类型的字符串密文才能对其进行解密
         * @param keyStr
         * @param content
         * @param ivStr
         */
        stringDecrypt: function(keyStr, content, ivStr) {
            let rtnStr = "";
            let dec = CryptoJS.AES.decrypt(CryptoJS.enc.Base64.stringify(CryptoJS.enc.Hex.parse(content)), keyStr,{
                iv: ivStr,
                mode: CryptoJS.mode.CBC,
                padding: CryptoJS.pad.Pkcs7
            });
            rtnStr = dec.toString(CryptoJS.enc.Utf8);
            return rtnStr;
        },

        md5: function(str) {
            return CryptoJS.MD5(str);
        },

        // 判断点是否点中方块 方块的中心坐标
        isPointRect: function(pointX, pointY, rectX, rectY, rectW, rectH){
            let minX = rectX - rectW / 2;
            let minY = rectY - rectH / 2;
            let maxX = rectX + rectW / 2;
            let maxY = rectY + rectH / 2;
            return !(pointX > maxX || pointX < minX || pointY > maxY || pointY < minY);
        },

        pointDistance: function(p1, p2) {
            return Math.ceil(Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2)));
        },

        /**
         * 通过总速度, 计算x, y方向的速度(可能为负, 即负向运动);
         *
         * @param speed 总速度;
         * @param xDif (x2 - x1) 的值;
         * @param yDif (y2 -y1) 的值;
         *
         * @return {Object} 分别速度;
         */
        angleSpeed: function(speed, xDif, yDif) {
            let xSpeed = 0;
            let ySpeed = 0;
            let xSymbol = xDif / Math.abs(xDif);    // x的正负号
            let ySymbol = yDif / Math.abs(yDif);    // y的正负号
            if (xDif === 0) {
                ySpeed = ySymbol * speed;
            } else if (yDif === 0) {
                xSpeed = xSymbol * speed;
            } else {
                let tan = xDif / yDif;
                ySpeed = ySymbol * Math.sqrt((speed * speed) / (tan * tan + 1));
                xSpeed = xSymbol * Math.abs(ySpeed * tan);
            }
            return {xs: xSpeed, ys: ySpeed};
        },

        /**
         * 判断是否是数字
         * @param value
         * @returns {boolean}
         */
        isNumber: function(value) {
            if (value === "" || value == null || value === "NaN" ) {
                return false;
            }
            return !isNaN(value);
        },

        /**
         * 获取UUID
         */
        getUUID : function () {
            let s = [];
            let hexDigits = "0123456789abcdef";
            for (let i = 0; i < 36; i++) {
                s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
            }
            s[14] = "4";  // bits 12-15 of the time_hi_and_version field to 0010
            s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1);  // bits 6-7 of the clock_seq_hi_and_reserved to 01
            s[8] = s[13] = s[18] = s[23] = "-";

            return s.join("");
        },

        /**
         * 从指定数组中移除指定元素;
         */
        removeElement: function(oArray, element) {
            let index = oArray.indexOf(element);
            if (index > -1) {
                oArray.splice(index, 1);
                return true;
            }
            return false;
        },

        // 是否包含emoji表情
        isEmoji: function (content) {
            let ranges = [
                '\ud83c[\udf00-\udfff]',
                '\ud83d[\udc00-\ude4f]',
                '\ud83d[\ude80-\udeff]'
            ];
            //var emojireg = $("#emoji_input").val();
            let str = content.replace(new RegExp(ranges.join('|'), 'g'), '');

            //cc.log("content = " + content + " str = " + str);
            return content !== str;
        },

        /**
         * bigNumber 转 label用的 K M B;
         *
         * @param strNumber BigNumber对象;
         * @returns {string}
         */
        formatBigNumberForLabel: function(strNumber) {
            let MBigNumber = BigNumber.clone();
            let number = new MBigNumber(strNumber);  //去掉小数部分
            let k_str = "K";
            let m_str = "M";
            let b_str = "B";
            let t_str = "T";
            let p_str = "P";
            let e_str = "E";
            let z_str = "Z";
            let y_str = "Y";
            let s_str = "S";
            let l_str = "L";

            let result = "";

            // 截取整数部分
            let integerStr = number.toFixed(0);

            //保留两位小数
            if (integerStr.length > 30) {
                let _b = number.div("1.0E30");
                result = _b.toFixed(2) + l_str;
            } else if (integerStr.length > 27) {
                let _b = number.div("1.0E27");
                result = _b.toFixed(2) + s_str;
            } else if (integerStr.length > 24) {
                let _b = number.div("1.0E24");
                result = _b.toFixed(2) + y_str;
            } else if (integerStr.length > 21) {
                let _b = number.div("1.0E21");
                result = _b.toFixed(2) + z_str;
            } else if (integerStr.length > 18) {
                let _b = number.div("1.0E18");
                result = _b.toFixed(2) + e_str;
            } else if (integerStr.length > 15) {
                let _b = number.div("1.0E15");
                result = _b.toFixed(2) + p_str;
            } else if (integerStr.length > 12) {
                let _b = number.div("1.0E12");
                result = _b.toFixed(2) + t_str;
            } else if (integerStr.length > 9) {
                let _b = number.div("1.0E9");
                result = _b.toFixed(2) + b_str;
            } else if (integerStr.length > 6) {
                let _b = number.div("1.0E6");
                result = _b.toFixed(2) + m_str;
            } else if (integerStr.length > 3) {
                let _b = number.div("1.0E3");
                result = _b.toFixed(2) + k_str;
            } else {
                result = number;
            }

            return result;
        },

        /**
         * 获取随机值
         * @param min
         * @param max
         */
        getRandomInt: function(min, max) {
            let randNum = Math.floor(min + Math.random() * (max - min + 1));
            randNum = Math.max(randNum, min);
            randNum = Math.min(randNum, max);
            return Math.ceil(randNum);
        },

        // 两点之间的角度算偏移用
        getRotation: function(curPos, tarPos) {
            // let diff = curPos.sub(tarPos);
            // diff.y = -diff.y;
            // let angle = diff.signAngle(cc.v2(1, 0));    // 求方向向量与对比向量间的弧度
            // // 将弧度转换为角度
            // return cc.misc.radiansToDegrees(angle);

            if (curPos.x === tarPos.x && curPos.y === tarPos.y) {
                return 0;
            }
            let diffPos = curPos.sub(tarPos);
            let diff = cc.v2(diffPos.x, diffPos.y);
            diff.x = -diff.x;
            // var diff = tarPos.sub(curPos);
            let angle = diff.signAngle(cc.v2(1, 0));    // 求方向向量与对比向量间的弧度
            // 将弧度转换为角度
            return cc.misc.radiansToDegrees(angle);
        },
        
        getCenter: function(curPos, tarPos) {
            let x = (curPos.x + tarPos.x) / 2;
            let y = (curPos.y + tarPos.y) / 2;
            return cc.v2(x, y);
        },
	
	    // 两点之间的角度算偏移用(0-359 右0  右上45 上90 左上135 左180 左下225 下270 右下315)
        getDegree: function (curPos, tarPos) {
            if (curPos.x === tarPos.x && curPos.y === tarPos.y) {
                return 0;
            }
            var diffPos = curPos.sub(tarPos);
            var diff = cc.v2(diffPos.x, diffPos.y);
            diff.x = -diff.x;
            let angle = diff.signAngle(cc.v2(1, 0));    // 求方向向量与对比向量间的弧度
            // 将弧度转换为角度
            var degree = cc.misc.radiansToDegrees(angle);
            if (degree < 0) {
                degree += 360;
            }
            return degree;
        },

        // 根据角度和半径 获得x和y方向的偏移距离 (0-359)
        getOffsetByRotationAndDistance: function (rotation, distance) {
            let offsetX = distance * Math.cos(rotation * Math.PI / 180.0);
            let offsetY = distance * Math.sin(rotation * Math.PI / 180.0);
            return cc.v2(offsetX, offsetY);
        },
	
	    // 两点距离
        getDistance: function (curPos, tarPos) {
            return curPos.sub(tarPos).mag();
        },

        // 震动开关设置 (0开  1关)
        getSockSetting: function() {
            let sockSetting = parseInt(cc.sys.localStorage.getItem(Utils.SAVE_SOCK_SETTING_DATA));
            if (!sockSetting) {
                sockSetting = 0;
            }
            return sockSetting <= 0;
        },

        setSockSetting: function(isOpen) {
            let sockSetting = 0;
            if (!isOpen) {
                sockSetting = 1;
            }
            cc.sys.localStorage.setItem(Utils.SAVE_SOCK_SETTING_DATA, sockSetting.toString());
        },

        // 是否是json串
        isJson:function(str) {
            if (typeof str == 'string') {
                try {
                    let obj = JSON.parse(str);
                    return (typeof obj == 'object' && obj);
                } catch(e) {
                    return false;
                }
            }
            return false;
        },
	
	    isIphoneX: function () {
            if (cc.winSize.height < 1280) {
                return false;
            }
            if (!cc.sys.isNative) {
                return true;
            }
            return cc.sys.os === cc.sys.OS_IOS;

        },

        sensitiveTest: function(string, maskWordList) {
            let str = string;
            cc.log("str: " + str);
            for (let i = 0; i < maskWordList.length; i++) {
                let reg = new RegExp(maskWordList[i], "gi");
                str = str.replace(reg, function () {
                    let resStr = "";
                    for (let j = 0; j < maskWordList[i].length; j++) {
                        resStr += "*"
                    }
                    return resStr;
                });
            }
            return str;
        },

        checkIlligleChar: function(str) {
            if (!str) {
                return false;
            } else {
                //非法字符校验
                let nameStr = str;
                let p = ["﹉", "＃", "＆", "＊", "※", "§", "〃", "№", "〓", "○",
                    "●", "△", "▲", "◎", "☆", "★", "◇", "◆", "■", "□", "▼", "▽",
                    "㊣", "℅", "ˉ", "￣", "＿", "﹍", "﹊", "﹎", "﹋", "﹌", "﹟", "﹠",
                    "﹡", "?", "⊙", "↑", "↓", "←", "→",
                    "┄", "—", "︴", "﹏", "（", "）", "︵", "︶", "｛", "｝", "︷",
                    "︸", "〔", "〕", "︹", "︺", "【", "】", "︻", "︼", "《", "》", "︽",
                    "︾", "〈", "〉", "︿", "﹀", "「", "」", "﹁", "﹂", "『", "』", "﹃",
                    "﹄", "﹙", "﹚", "﹛", "﹜", "﹝", "﹞", "\"", "〝", "〞", "ˋ",
                    "ˊ", "≈", "≡", "≠", "＝", "≤", "≥", "＜", "＞", "≮", "≯", "∷",
                    "±", "＋", "－", "×", "÷", "／", "∫", "∮", "∝", "∧", "∨", "∞",
                    "∑", "∏", "∪", "∩", "∈", "∵", "∴", "⊥", "∥", "∠", "⌒", "⊙",
                    "≌", "∽", "√", "≦", "≧", "≒", "≡", "﹢", "﹣", "﹤", "﹥", "﹦",
                    "～", "∟", "⊿", "∥", "㏒", "㏑", "∣", "｜", "︱", "︳", "|", "／",
                    "＼", "∕", "﹨", "¥", "€", "￥", "£", "，", "、",
                    "。", "．", "；", "：", "？", "！", "︰", "…", "‥", "′", "‵", "々",
                    "～", "‖", "ˇ", "ˉ", "﹐", "﹑", "﹒", "·", "﹔", "﹕", "﹖", "﹗",
                    "-", "&", "*", "#", "`", "~", "+", "=", "(", ")", "^", "%",
                    "$", ";", ",", ":", "'", "\\", "/", ">", "<",
                    "?", "!", "[", "]", "{", "}", " ", "\n", "\t", "\r", "　　", "　", "　", " ", " "];
                for (let j = 0; j < p.length; j++) {
                    Logger.debug("p[j]: " + p[j] + ", nameStr.indexOf(p[j]): " + nameStr.indexOf(p[j]) + ", nameStr: " + nameStr);
                    if (nameStr.indexOf(p[j]) != -1) {
                        Logger.debug("nameStr: " + p[j] + "----" + nameStr + "-----");
                        return false;
                    }
                }

                if (Utils.isEmoji(str)) {
                    return false;
                }
            }
            return true;
        },

        // 获取字符长度
        getStrCharLength: function(str) {
            return str.replace(/[\u0391-\uFFE5]/g,"aa").length;
        },
	
	    // 向量相对于(1,0)的角度
        vectorsToDegree: function (dirVec) {
            // 0 0不能算角度
            if (dirVec.x == 0 && dirVec.y == 0) {
                return 0;
            }
            var dirVec = cc.v2(dirVec.x, dirVec.y);
            let comVec = cc.v2(1, 0);    // 水平向右的对比向量
            let radian = dirVec.signAngle(comVec);    // 求方向向量与对比向量间的弧度
            let degree = cc.misc.radiansToDegrees(radian);    // 将弧度转换为角度
            return degree;
        },

        // 万分比概率
        getTenThousandProbability: function (probability) {
            var random = this.getRandomInt(1, 10000);
            if (random <= probability * 10000) {
                return true;
            }
            return false;
        },

        getRandomItemInList: function (list) {
            var random = this.getRandomInt(0, list.length - 1);
            return list[random];
        },

        omitStringByLength (str, len, omit) {
            if (!str) {
                return str;
            }

            let stringLen = 0;
            let headStr = str;
            for (let i = 0; i < str.length; i++) {
                let c = str.charCodeAt(i);
                //单字节加1
                if ((c >= 0x0001 && c <= 0x007e) || (0xff60 <= c && c <= 0xff9f)) {
                    stringLen++;
                }
                else {
                    stringLen += 2;
                }

                if (stringLen > len) {
                    headStr = str.substring(0, i) + omit;
                    break;
                }
            }

            return headStr;
        },

        setLoginServerTime (time) {
            this.loginServerTime = time;
            this.loginTime = new Date().getTime();
        },

        setServerZeroTime (time){
            this.serverZeroTime = time;
        },

        getServerTime: function () {
            let nowTime = new Date().getTime();
            let timeDiff = nowTime - this.loginTime;

            return this.loginServerTime + timeDiff;
        },

        getServerZeroTime: function () {
            return this.serverZeroTime;
        },

        getNextZeroTime:function(){
            return this.serverZeroTime + 24*60*60*1000;
        },

        // 获取服务器时间的下一个指定小时
        getNextHourTime: function (hour) {
            let now = this.getServerTime();
            let todayHour = this.serverZeroTime + hour * 60 * 60 * 1000;
            if(todayHour > now){
                return todayHour;
            }
            todayHour += 24 * 60 * 60 * 1000;
            return todayHour;
        },


        getHourTime:function(time,hour){
            let curDate = new Date(time);
            curDate.setHours(hour);
            curDate.setMinutes(0);
            curDate.setSeconds(0);
            curDate.setMilliseconds(0);
            return curDate.getTime();
        },

        addNodeTopSpace (node) {
            let widget = node.getComponent(cc.Widget);
            widget && widget.isAlignTop && (widget.top += 52);
        },


        /**
         * bigNumber 转 label用的 K M B;
         *
         * @param strNumber BigNumber对象;
         * @returns {string}
         */
        byteConvert : function(bytes) {
            if (isNaN(bytes)) {
                return '';
            }
            let symbols = ['bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
            let exp = Math.floor(Math.log(bytes)/Math.log(2));
            if (exp < 1) {
                exp = 0;
            }
            let i = Math.floor(exp / 10);
            bytes = bytes / Math.pow(2, 10 * i);

            if (bytes.toString().length > bytes.toFixed(2).toString().length) {
                bytes = bytes.toFixed(2);
            }
            return bytes + ' ' + symbols[i];
        },

        // 获取下一步目标坐标
        getTarCurvePoint:function(p0, p1, p2, p3, tension, t) {
            let t2 = t * t;
            let t3 = t2 * t;

            let s = (1 - tension) / 2;

            let b1 = s * ((-t3 + (2 * t2)) - t);                      // s(-t3 + 2 t2 - t)P1
            let b2 = s * (-t3 + t2) + (2 * t3 - 3 * t2 + 1);          // s(-t3 + t2)P2 + (2 t3 - 3 t2 + 1)P2
            let b3 = s * (t3 - 2 * t2 + t) + (-2 * t3 + 3 * t2);      // s(t3 - 2 t2 + t)P3 + (-2 t3 + 3 t2)P3
            let b4 = s * (t3 - t2);                                   // s(t3 - t2)P4

            let x = (p0.x * b1 + p1.x * b2 + p2.x * b3 + p3.x * b4);
            let y = (p0.y * b1 + p1.y * b2 + p2.y * b3 + p3.y * b4);
            return cc.v2(x, y);
        },

        // 获取关键点
        getControlPoint: function(controlPoints, pos) {
            let p = Math.min(controlPoints.length - 1, Math.max(pos, 0));
            return controlPoints[p];
        },

        // 根据关键点 获取曲线运动轨迹
        getCurvePointList:function (points, tension, pixStep) {
            if (!pixStep) {
                pixStep = 1;
            }
            let deltaT = 1 / (points.length - 1);
            let sumDistance = 0;
            for(let i = 0; i < (points.length - 1); i++){
                sumDistance += this.getDistance(points[i], points[i + 1]);
            }
            let curvePointList = [];
            for(let i = 0; i <= sumDistance; i += pixStep){
                let dt = i / sumDistance;       // 总进度百分比
                let p, lt;
                let ps = points;
                // 最后一步
                if (dt === 1) {
                    p = ps.length - 1;
                    lt = 1;
                } else {
                    var locDT = deltaT;
                    p = 0 | (dt / locDT);
                    lt = (dt - locDT * p) / locDT;
                }

                let newPos = this.getTarCurvePoint(
                    this.getControlPoint(ps, p - 1),
                    this.getControlPoint(ps, p - 0),
                    this.getControlPoint(ps, p + 1),
                    this.getControlPoint(ps, p + 2),
                    tension, lt);

                curvePointList.push(newPos);
            }
            return curvePointList;
        },


        // 获取修正过的曲线运动轨迹
        getFixCurvePointList:function (pointList, tension) {
            let curvePointList = this.getCurvePointList(pointList, tension);
            let okCount = 0;
            let errorCount = 0;
            let min = 0.75;
            let max = 1.25;
            for(let i = 0; i < (curvePointList.length); i++){
                if(i > 0){
                    let dis = Math.abs(jkr.Utils.getDistance(curvePointList[i], curvePointList[i - 1]));
                    if(dis < min){
                        if(i < (curvePointList.length - 1)){
                            let nextDis = Math.abs(jkr.Utils.getDistance(curvePointList[i], curvePointList[i + 1]));
                            if((dis + nextDis) < max){
                                curvePointList.splice(i, 1);
                                i--;
                            }
                        }
                    }
                }
            }
            // for(let i = 0; i < (curvePointList.length); i++){
            //     if(i > 0){
            //         let dis = Math.abs(jkr.Utils.getDistance(curvePointList[i], curvePointList[i - 1]));
            //         if(Math.abs(dis) < min || Math.abs(dis) > max){
            //             jkr.Logger.debug("位置异常！！！ i = " + i + " dis = " + dis);
            //             errorCount++;
            //         }else{
            //             jkr.Logger.debug("ok  i = " + i + " dis = " + dis);
            //             okCount++;
            //         }
            //     }
            // }
            // jkr.Logger.debug("okCount = " + okCount + " errorCount = " + errorCount);   // 536 30
            return curvePointList;
        },

        hex2color: function(hexColor) {
            const hex = hexColor.replace(/^#?/, "0x");
            const c = parseInt(hex);
            const r = c >> 16;
            const g = (65280 & c) >> 8;
            const b = 255 & c;
            return cc.color(r, g, b, 255);
        },

        seededRandom: function(min, max) {
            max = max || 1;
            min = min || 0;
            Utils.seed = (Utils.seed * 9301 + 49297) % 233280;
            let rnd = Utils.seed / 233280.0;
            return min + rnd * (max - min);
        },

        /**
         * 获取随机值
         * @param min
         * @param max
         */
        getSeedRandomInt: function(min, max) {
            let randNum = Math.floor(min + Utils.seededRandom() * (max - min + 1));
            randNum = Math.max(randNum, min);
            randNum = Math.min(randNum, max);
            return Math.ceil(randNum);
        },

        getSeedRandomItemInList: function (list) {
            let random = this.getSeedRandomInt(0, list.length - 1);
            return list[random];
        },
    },

});