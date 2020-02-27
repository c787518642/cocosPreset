const Global = require('Global');

cc.Class({
    extends: cc.Component,

    properties: {
        _MapLoadedAsset: Map,
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        Global.ResMgr = this;

        this._MapLoadedAsset = new Map();
    },

    start () {

    },

    // update (dt) {},

    // methods

    // info = {url:'',type: cc.ValueType,success: function}
    // url: 资源路径; type: 资源类型; success: 加载成功回调
    loadAsset(info){
        let self = this;
        let [url,assetType,callback] = [info.url,info.type, info.success];

        cc.loader.loadRes(url, assetType, function (err, asset) {

            if (err) {
                cc.error(err.message || err);
                return;
            }

            callback&&callback(asset);

            self.loadAssetToLoaded(url,asset);
        });
    },

    // info = {url:'',type: cc.ValueType}
    // url: 资源路径; type: 资源类型;
    loadAssetSync(info){
        let self = this;
        let [url,assetType] = [info.url,info.type];

        return new Promise((reslove,reject) => {
            cc.loader.loadRes(url, assetType, function (err, asset) {

                if (err) {
                    cc.error(err.message || err);
                    reject(err);
                }

                self.loadAssetToLoaded(url,asset);

                reslove(asset);
            });
        });
    },

    loadAssetToLoaded(url,asset){
        this._MapLoadedAsset.set(url,asset);
    },

    getAsset(url){
        let asset = this._MapLoadedAsset.get(url);

        if (!asset) {
            cc.error(`资源:${url}还未加载!!`);
        }

        return asset;
    },
});
