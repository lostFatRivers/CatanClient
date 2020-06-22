let HttpClient = cc.Class({

    statics: {
        /** 最大超时重试次数 */
        MAX_TIMEOUT_TIMES: 3,
        /** 超时时间 */
        TIMEOUT: 5000,

        /**
         * 使用 Promise 异步处理;
         * 请求超时则会进行重试, 超时时间 10s, 重试次数 5;
         *
         * @param url 地址
         *
         * @returns {Promise<string>} 结果的promise对象
         */
        httpGet: function(url) {
            return new Promise((resolve, reject) => {
                try {
                    HttpClient.httpGet0(url, resolve, reject, 0);
                } catch (e) {
                    reject(url + " http get error:" + e.message);
                }
            });
        },

        httpGet0: function(url, resolve, reject, timeoutCount) {
            let xhr = cc.loader.getXMLHttpRequest();
            xhr.timeout = HttpClient.TIMEOUT;
            xhr.open("GET", url, true);
            if(cc.sys.isNative){
                xhr.setRequestHeader("Connection", "close");
            }
            xhr.ontimeout = function () {
                timeoutCount++;
                if (timeoutCount >= HttpClient.MAX_TIMEOUT_TIMES) {
                    reject("http get request timeout");
                } else {
                    HttpClient.httpGet0(url, resolve, reject, timeoutCount);
                }
            };
            xhr.onabort = function () {
                reject("http get request aborted");
            };
            xhr.onerror = function () {
                reject("http get request error");
            };
            xhr.onload = function () {
                if ((xhr.status >= 200 && xhr.status < 300) || xhr.status === 304) {
                    resolve(xhr.responseText);
                } else {
                    reject(url + " http get request error:" + xhr.status);
                }
            };
            xhr.send();
        },

        /**
         *  使用Promise方式发送 http/https post 请求;
         *  请求超时则会进行重试, 超时时间 10s, 重试次数 5;
         *
         * @param url 地址
         * @param msg 放在body里的数据
         * @param contentType 数据类型, 默认 'application/json'
         *
         * @returns {Promise<string>} 结果的 Promise 对象;
         */
        httpPost: function(url, msg, contentType) {
            return new Promise((resolve, reject) => {
                let realContentType = contentType;
                if (!contentType) {
                    realContentType = "application/json";
                }
                try {
                    HttpClient.httpPost0(url, msg, realContentType, resolve, reject, 0);
                } catch (e) {
                    reject(url + " http post error:" + e.message);
                }
            });
        },

        httpPost0: function(url, msg, contentType, resolve, reject, timeoutCount) {
            let xhr = cc.loader.getXMLHttpRequest();
            xhr.timeout = HttpClient.TIMEOUT;
            xhr.open("POST", url, true);
            xhr.setRequestHeader("Content-Type", contentType);
            if(cc.sys.isNative){
                xhr.setRequestHeader("Connection", "close");
            }
            xhr.ontimeout = function () {
                timeoutCount++;
                if (timeoutCount >= HttpClient.MAX_TIMEOUT_TIMES) {
                    reject("http post request timeout");
                } else {
                    HttpClient.httpPost0(url, msg, contentType, resolve, reject, timeoutCount);
                }
            };
            xhr.onabort = function () {
                reject("http post request aborted");
            };
            xhr.onerror = function () {
                reject("http post request error");
            };
            xhr.onload = function () {
                if ((xhr.status >= 200 && xhr.status < 300) || xhr.status === 304) {
                    resolve(xhr.responseText);
                } else {
                    reject(url + " http post request error:" + xhr.status);
                }
            };
            xhr.send(msg);
        },

        /**
         *  使用Promise方式发送 http/https post 请求;
         *  请求超时则会进行重试, 超时时间 10s, 重试次数 5;
         *
         * @param url 地址
         * @param msg 放在body里的数据
         * @param contentType 数据类型, 默认 'application/json'
         *
         * @returns {Promise<string>} 结果的 Promise 对象;
         */
        httpPost: function(url, msg, contentType) {
            return new Promise((resolve, reject) => {
                let realContentType = contentType;
                if (!contentType) {
                    realContentType = "application/json";
                }
                try {
                    HttpClient.httpPost0(url, msg, realContentType, resolve, reject, 0);
                } catch (e) {
                    reject(url + " http post error:" + e.message);
                }
            });
        },

        httpPost0: function(url, msg, contentType, resolve, reject, timeoutCount) {
            let xhr = cc.loader.getXMLHttpRequest();
            xhr.timeout = HttpClient.TIMEOUT;
            xhr.open("POST", url, true);
            xhr.setRequestHeader("Content-Type", contentType);
            if(cc.sys.isNative){
                xhr.setRequestHeader("Connection", "close");
            }
            xhr.ontimeout = function () {
                timeoutCount++;
                if (timeoutCount >= HttpClient.MAX_TIMEOUT_TIMES) {
                    reject("http post request timeout");
                } else {
                    HttpClient.httpPost0(url, msg, contentType, resolve, reject, timeoutCount);
                }
            };
            xhr.onabort = function () {
                reject("http post request aborted");
            };
            xhr.onerror = function () {
                reject("http post request error");
            };
            xhr.onload = function () {
                if ((xhr.status >= 200 && xhr.status < 300) || xhr.status === 304) {
                    resolve(xhr.responseText);
                } else {
                    reject(url + " http post request error:" + xhr.status);
                }
            };
            xhr.send(msg);
        }
    }

});