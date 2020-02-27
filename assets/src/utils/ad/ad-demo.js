const demoObj = {
    start() {
        // 初始化广告
        this.initAd();
    },


    // 初始化广告加载
    initAd() {
        // 可在外部先创建
        Ad.createAd('adName');

        // 获取广告
        this.videoAd = Ad.getAd('adName');

        this.videoAd.onLoad(() => {
            // 广告加载完成，切换为观看视频图标'
            console.log('加载完成,切换为观看视频图标');
        });

        // 关闭此次广告
        this.videoAd.onClose((isEnded) => {
            // 广告看完 => 获得奖励
            console.log('观看完成?', isEnded);
            isEnded && this.watchOver();
        });
    },


    // 触发事件-显示广告
    async showAd() {
        console.log(`广告加载完成？${this.videoAd && this.videoAd.isReady}`);
        // 判断广告是否加载完成
        if (this.videoAd && this.videoAd.isReady) {
            this.videoAd.show();
            // Ald.sendEvent('关卡观看广告点击次数');
        } else {
            // 没有加载完成 =>
        }
    },

    async watchOver() {
        // Ald.sendEvent('关卡观看广告完整观看次数');
    },

}