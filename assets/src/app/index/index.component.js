
// 【首个场景的默认组件】
const UIMgr = require('UIMgr');
const ResMgr = require('ResMgr');
const AudioMgr = require('AudioMgr');

// 各种服务
import loginService from 'login.service';
import appService from 'app.service';
import shareService from 'share.service';

import Global from 'Global';// 全局变量
import Ald from 'Ald'; // 阿拉丁打点
import { sleep } from 'Function';

cc.Class({
    extends: cc.Component,

    properties: {
        UIRoot: cc.Node, // 用于挂载弹框的节点（常驻）

        progressNode: cc.Node, // 进度条节点
        progressLabelNode: cc.Node, // 进度条百分比文字

        // 预加载的节点和图片
        preloadNodes: [cc.Node],
        preloadSprite: [cc.SpriteFrame],

        isLoading: true, // 标志位，正在加载
    },

    onLoad() {
        console.log('开始游戏', new Date());
    },

    async start() {
        // 挂载管理器
        this.node.addComponent(ResMgr);
        this.node.addComponent(UIMgr);
        this.node.addComponent(AudioMgr);

        // 设置 index 节点和 UIRoot 节点常驻
        cc.game.addPersistRootNode(this.node);
        cc.game.addPersistRootNode(this.UIRoot);

        try {
            this.recordEnterGame();
        } catch (error) { }

        // 获取玩家游戏信息，存到Global内,
        await Promise.all([
            this.getGameInfo(), // 获取游戏数据
            this.runProgress(), // 跑进度条
            this.preloadScene(),// 预加载下个场景
        ]);

        // 右上角按钮-显示分享
        shareService.showShareMenu();
        // 订阅打开关闭事件-统计
        this.subscribe();


        // 填满进度条
        this.progressNode.getComponent(cc.ProgressBar).progress = 1;
        this.progressLabelNode.getComponent(cc.Label).string = '100%';

        //加载关卡界面
        try {
            cc.director.loadScene('game');
        } catch (error) { }
    },


    // 预加载场景
    async preloadScene() {
        try {
            cc.director.preloadScene('game');
        } catch (error) { }
    },

    async runProgress() {
        // 默认每20毫秒走1%，（2秒走完）
        // 加载完数据后，每毫秒走5% （20毫秒走完）
        const sleepTime = this.isLoading ? 10 : 1;
        const plusNum = this.isLoading ? 0.01 : 0.05;

        // 百分比
        const percentage = Number(this.progressNode.getComponent(cc.ProgressBar).progress);
        // 更新进度条
        this.progressNode.getComponent(cc.ProgressBar).progress = percentage + plusNum;
        // 更新进度 Label
        this.progressLabelNode.getComponent(cc.Label).string = `${Math.floor(percentage * 100)}%`;

        if (this.progressNode.getComponent(cc.ProgressBar).progress < 0.99) {
            await sleep(sleepTime);
            await this.runProgress();
        }
    },


    // 加载资源和数据
    async getGameInfo() {
        try {
            // 先登录，获取OpenID
            await loginService.login();
            // 获取Token
            await loginService.getToken();
        } catch (error) { }

        await Promise.all([
            // 获取基本信息
            // this.getDataInfo(),
            // // 加载图标
            // this.loadIcon(),
            // // 加载音频
            // this.loadAudio(),
            sleep(1000),
        ]);
        console.log('loaded');

        // 与进度条相关
        this.isLoading = false;
    },

    // 获取玩家关卡数据，
    async getDataInfo() {
        const res = await appService.getLevelsInfo();
        if (!res || !res.data) return;
        const data = res.data;
        // 对象类型
        Global.scores = data || {};
    },

    // 加载图标
    async loadIcon() {
        const promiseArr = [];
        for (let key in Global.props) {
            // 每一项
            const item = Global.props[key];
            // 路径
            const prefabUrl = item.prefabUrl;
            const promise = new Promise((resolve) => {
                cc.loader.loadRes(prefabUrl, cc.Prefab,
                    (err, prefab) => {
                        item.prefab = prefab;
                        resolve();
                    });
            });
            promiseArr.push(promise);
        }
        await Promise.all(promiseArr);
    },

    // 加载音频
    async loadAudio() {
        const promiseArr = [];
        for (let key in Global.audios) {
            // 每一项
            const item = Global.audios[key];
            // 路径
            const clipUrl = item.clipUrl;
            const promise = new Promise((resolve) => {
                cc.loader.loadRes(clipUrl, cc.AudioClip,
                    (err, clip) => {
                        item.clip = clip;
                        resolve();
                    });
            });
            promiseArr.push(promise);
        }
        await Promise.all(promiseArr);
    },

    // 统计进入游戏
    recordEnterGame() {
        Ald.sendEvent('进入游戏');
        // 从其他地方进入游戏的来源
        const sourceType = this.getSourceType();
        sourceType && Ald.sendEvent(sourceType);

        const systemInfo = wx.getSystemInfoSync();
        console.log(systemInfo);
        // 手机设备
        appService.recordData({
            type: 'brand',
            text: systemInfo.brand,
        });
        // 手机型号
        appService.recordData({
            type: 'model',
            text: systemInfo.model,
        });
        appService.recordData({
            type: 'enterGame',
            count: 1,
        });
    },
    getSourceType() {
        const { scene } = wx.getLaunchOptionsSync();
        switch (scene) {
            case 1037:
            case 1038:
                return '商城跳转进入游戏';
            case 1020:
            case 1035:
            case 1043:
            case 1058:
            case 1067:
            case 1074:
            case 1082:
            case 1091:
            case 1102:
                return '公众号进入';
            case 1005:
            case 1006:
            case 1027:
            case 1042:
                return '自然搜索进入';
            case 1036:
                return '分享进入(总次数)';
        }
        return null;
    },


    // 游戏隐藏到后台
    onHide() {
        try {
            appService.recordData({
                type: 'closeGame',
                count: 1,
            });
        } catch (err) { }
    },

    // 小游戏回到前台
    onShow() {
        try {
            appService.recordData({
                type: 'openGame',
                count: 1,
            });
        } catch (err) { }
    },

    // 订阅打开关闭事件-统计
    subscribe() {
        try {
            wx.onHide(this.onHide);
            wx.onShow(this.onShow);
        } catch (err) { }
    },

    // update (dt) {},

});
