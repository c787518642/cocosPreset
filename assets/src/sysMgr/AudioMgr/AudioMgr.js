import Global from 'Global';
import { sleep } from 'Function';

cc.Class({
    extends: cc.Component,

    properties: {
        canPlayMusic: true,
        canPlayEffet: true,

        currentBgmVolume: 1,

        currentBgmInfo: null,
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad() { },

    start() {
        // 挂载到 Global 上
        Global.AudioMgr = this;

        // 初始化声音配置
        this.initAudioSetting();
    },

    initAudioSetting() {
        try {
            // 读取本地缓存
            const canPlayMusic = wx.getStorageSync('canPlayMusic');
            const canPlayEffet = wx.getStorageSync('canPlayEffet');

            // 设置私有对象
            this.canPlayMusic = canPlayMusic === 'false' ? false : true;
            this.canPlayEffet = canPlayEffet === 'false' ? false : true;

            // 如果是背景音乐是关闭状态
            if (!this.canPlayMusic) {
                this.setBgmVolume(0);
            }
        } catch (error) { }
    },

    // 停止播放Bgm(外界调用)
    async stopBgm() {
        cc.audioEngine.pauseMusic();
    },

    // 播放音频(外界调用)
    play(audioName, params) {
        if (!audioName) return;
        try {
            const { clip, type } = Global.audios[audioName];
            switch (type) {
                // 背景音乐类型
                case 'bgm': {
                    // 从头开始播放
                    const isFromHead = params && params.isFromHead || null;
                    // 是否循环
                    const isloop = params && params.isloop || true;
                    this.playMusic(audioName, clip, isFromHead, isloop);
                    break;
                }
                // 音效类型
                case 'effect': {
                    const isloop = params && params.isloop || false;
                    this.playEffect(clip, isloop);
                    break;
                }
                default:
                    break;
            }
        } catch (error) {
            console.error(`Global.audios 中没找到音乐文件 ${audioName}`);
        }
    },

    // 开始播放背景音乐
    // @isFromHead : 从头开始重新播
    async playMusic(audioName, clip, isFromHead = false, loop = true, ) {
        await sleep(800);

        if (
            !isFromHead &&
            this.currentBgmInfo &&
            this.currentBgmInfo.name === audioName
        ) {
            cc.audioEngine.resumeMusic();
            return;
        }
        const audioID = cc.audioEngine.playMusic(clip, loop);

        this.currentBgmInfo = { name: audioName, id: audioID };
        // 如果音量为0，就暂停播放（用来解决安卓bug）
        if (this.currentBgmVolume === 0) {
            this.stopBgm();
        }
    },

    // 播放音效
    playEffect(clip, loop = false) {
        if (!this.canPlayEffet) return;
        cc.audioEngine.playEffect(clip, loop);
    },
    // update (dt) {},


    // 背景音乐总控 - 开
    openBgm() {
        this.setBgmVolume(1);
        cc.audioEngine.resumeMusic();

        this.canPlayMusic = true;
        try {
            wx.setStorageSync('canPlayMusic', 'true');
        } catch (error) { }
    },

    // 背景音乐总控 - 关
    closeBgm() {
        this.setBgmVolume(0);
        this.stopBgm();

        this.canPlayMusic = false;
        try {
            wx.setStorageSync('canPlayMusic', 'false');
        } catch (error) { }
    },

    // 音效总控 - 开
    openEffect() {
        this.canPlayEffet = true;
        try {
            wx.setStorageSync('canPlayEffet', 'true');
        } catch (error) { }
    },

    // 音效总控 - 关
    closeEffect() {
        this.canPlayEffet = false;
        try {
            wx.setStorageSync('canPlayEffet', 'false');
        } catch (error) { }
    },


    // 设置背景音乐音量
    setBgmVolume(value) {
        this.currentBgmVolume = value;
        cc.audioEngine.setMusicVolume(value);
        console.log('当前音量', cc.audioEngine.getMusicVolume());
    },


    // 停止播放某一音效
    async stopEffect(audioName) {
        if (!audioName) return;

        try {
            const { clip } = Global.audios[audioName];
            cc.audioEngine.stopEffect(clip);
        } catch (error) {
        }
    },

    // 停止播放所有音效
    async stopAllEffects() {
        cc.audioEngine.stopAllEffects();
    },



});
