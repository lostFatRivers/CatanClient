let SoundsUtil = cc.Class({

    properties: {
        name: "SoundsUtil",
        sounds: {
            default: null
        },
        musicEnabled: true,
        effectEnabled: true,
        init: false,
        effectPlays: {
            default: null
        },
        // 音效播放最小间隔
        _effectInterval: 100,
        _callBackEffectId:0
    },

    ctor() {
        this.sounds = {};
        this.effectPlays = {};
        cc.audioEngine.setEffectsVolume(1);
    },

    loadSounds: function() {
        if(this.init){
            return;
        }
        this.init = true;
        cc.audioEngine.setEffectsVolume(0.0);
        cc.loader.loadResDir('audio', cc.AudioClip, (err, clips) => {
            for (let i = 0; i < clips.length; i++) {
                this.addSound(clips[i].name, clips[i]);
                cc.audioEngine.playEffect(clips[i], false);
            }
            cc.audioEngine.stopAllEffects();
            cc.audioEngine.setEffectsVolume(1.0);
        });
    },

    addSound: function(key, clip) {
        this.sounds[key] = clip;
    },

    playSoundEffect: function (fxName, isLoop, remindId) {
        if (!this.effectEnabled) return;
        let curTime = new Date().getTime();
        let lastPlayTime = this.effectPlays[fxName];
        if (lastPlayTime && (curTime - lastPlayTime) < this._effectInterval) {
            return 0;
        }
        this.effectPlays[fxName] = curTime;
        if(!this.sounds[fxName]) {
            cc.loader.loadRes("audio/" + fxName , cc.AudioClip, (err, clip) => {
                if (err) {
                    cc.log("load sound error.", err.message);
                    return;
                }
                let audioID = cc.audioEngine.playEffect(clip, false);
                if(remindId){
                    this._callBackEffectId = audioID;
                }
                this.addSound(fxName, clip);
            });
            return 0;
        } else {
            let audioID = cc.audioEngine.playEffect(this.sounds[fxName], isLoop);
            if(remindId){
                this._callBackEffectId = audioID;
            }
            return 0;
        }
    },

    stopSoundEffect: function (audioID) {
        if (!audioID) return;
        cc.audioEngine.stopEffect(audioID);
    },

    stopAllSoundEffects: function () {
        cc.audioEngine.stopAllEffects();
    },

    playMusic: function (musicName) {
        if(!musicName)return;
        this.music = musicName;
        if (!this.musicEnabled) return;
        if(!this.sounds[musicName]){
            cc.loader.loadRes("audio/" + musicName , cc.AudioClip, (err, clip) => {
                if (err) {
                    cc.log("load sound error.", err.message);
                    return;
                }
                cc.audioEngine.playMusic(clip, true);
                this.addSound(musicName,clip);
            });
        } else {
            cc.audioEngine.playMusic(this.sounds[musicName], true);
        }
    },

    // 设置音效音量
    setEffectsVolume : function (volume) {
        cc.audioEngine.setEffectsVolume(volume);
    },

    // 获取音效音量
    getEffectsVolume : function () {
        cc.audioEngine.getEffectsVolume();
    },

    // 设置背景音乐音量
    setMusicVolume : function (volume) {
        cc.audioEngine.setMusicVolume(volume);
    },

    // 获取背景音乐音量
    getMusicVolume : function () {
        cc.audioEngine.getMusicVolume();
    },

    stopMusic: function () {
        cc.audioEngine.stopMusic();
        this.music = null;
    },

    setMusicEnabled: function (enabled, ignorePlay) {
        this.musicEnabled = enabled;
        if (this.musicEnabled) {
            if( !ignorePlay){
                this.playMusic(this.music);
            }
        } else {
            cc.audioEngine.stopMusic();
        }
    },

    setEffectEnabled: function (enabled) {
        this.effectEnabled = enabled;
        if (!this.effectEnabled) {
            cc.audioEngine.stopAllEffects();
        }
    },


    getMusicEnable: function () {
        return this.musicEnabled;
    },

    getCallBackEffectId:function () {
        return this._callBackEffectId;
    }

});

module.exports = SoundsUtil;