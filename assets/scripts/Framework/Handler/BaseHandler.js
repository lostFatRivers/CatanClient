let BaseHandler = cc.Class({
    extends: cc.Object,

    ctor: function() {
        this.registerSelf();
    },

    registerSelf: function() {
        // Override me.
    }
});