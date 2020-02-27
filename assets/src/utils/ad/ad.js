// import missionService from 'mission.service';
// import appService from 'app.service';
import Ald from 'Ald';

// 【使用方法见 ad-demo.js】

const ad = {
    AD_ENUM: {
        // 购买道具
        'buyProps': {
            adUnitId: 'adunit-e8c4938e4de45d7f',
        },
        // 奖励类
        'reward': {
            adUnitId: 'adunit-64b0668561680f58',
        },
        // 复活
        'revive': {
            adUnitId: 'adunit-fcf03ccb2f6a4d17', // 复活
        },

        // // stageSettled: 'adunit-a6f566f36049a10a',
        // default: 'adunit-4b06e444b7d6cdf0',
    },

    createAd(name) {
        const adInfo = this.AD_ENUM[name];
        // 如果已经创建了对象实体
        if (adInfo.entity) {
            // 先清空所有订阅
            adInfo.entity.offLoad();
            adInfo.entity.offError();
            adInfo.entity.offClose();
            adInfo.entity.onLoad(() => {
                // 加载成功 => 设置标志位为true
                adInfo.isReady = true;
            });
            adInfo.entity.onError(err => {
                // adInfo.isReady = false;
            });
            return;
        }
        const ad = wx.createRewardedVideoAd({ adUnitId: adInfo.adUnitId, multiton: true });
        // >>>>>>>> AD_ENUM中 每一个广告对象，添加如下属性和方法
        // 属性: entity, 表示广告实体，外部不会直接调用
        adInfo.entity = ad;
        // 属性: 广告是否加载完成
        adInfo.isReady = false;
        // 方法: 显示广告回调
        adInfo.show = this.show;
        // 方法: 关闭广告回调
        adInfo.onClose = this.onClose;
        adInfo.onLoad = this.onLoad;

        ad.onLoad(() => {
            // 加载成功 => 设置标志位为true
            adInfo.isReady = true;
        });
        ad.onError(err => {
            // adInfo.isReady = false;
        });
    },

    // 显示广告
    show() {
        Ald.sendEvent('广告总点击播放次数');
        
        // appService.recordData({
        //     type: 'showAd',
        //     count: 1,
        // });

        const videoAd = this.entity;
        videoAd.show().catch(err => {
            videoAd.load()
                .then(() => videoAd.show())
                .catch(err => {
                    console.log('videoAd show:error', err);
                });
        });
    },

    // 关闭广告
    onClose(callback) {
        this.entity.onClose(res => {
            // 每次关闭广告，会重新加载
            this.isReady = false;
            // 回调
            callback && callback(res.isEnded);

            if (res.isEnded === true) {
                // missionService.finishMission('mission-ad');
                Ald.sendEvent('广告总完整观看次数');
                // appService.recordData({
                //     type: 'watchOverAd',
                //     count: 1,
                // });
            }
        });
    },

    // 广告加载完成
    onLoad(callback) {
        this.entity.onLoad(() => {
            // 回调
            callback && callback();
        });
    },

    // 返回单个广告对象
    getAd(name) {
        return this.AD_ENUM[name];
    },
};


export default ad;