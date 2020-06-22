/**
 * 简单的 bytes 缓存器, Uint8Array 和 int 写入后, 可全部转为 Uint8Array;
 *
 * @type {Function}
 */
let ByteBuf = cc.Class({
    extends: cc.Object,

    properties: {
        buffers: {
            default: []
        }
    },

    /**
     * 写入 Uint8Array 数据;
     *
     * @param buf Uint8Array对象
     */
    write: function(buf) {
        for (let i = 0; i < buf.length; i++) {
            this.buffers.push(buf[i]);
        }
    },

    /**
     * 写入 int 数据;
     *
     * @param number int值
     */
    writeInt: function(number) {
        this.write(this.numToByte(number));
    },

    /**
     * 全部转换为 Uint8Array;
     *
     * @returns {Uint8Array} Uint8Array对象
     */
    toUint8Array: function() {
        let uint8Array = new Uint8Array(this.buffers.length);
        for (let i = 0; i < this.buffers.length; i++) {
            uint8Array[i] = this.buffers[i];
        }
        return uint8Array;
    },

    numToByte: function(num) {
        let len = 4;
        let tmp = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
            tmp[i] = (0xff & (num >> (8 * (len - i - 1))));
        }
        return tmp;
    },
});

module.exports = ByteBuf;