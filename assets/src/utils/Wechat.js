/**
 * wechat.js 微信默认API改写为Promise
 *
 * @Author: GB
 * @Date:   2018-08-20 21:29:16
 * @Last Modified by:   GB
 * @Last Modified time: 2019-07-17 10:32:50
 */

let wxGetSetting = () => {
    return new Promise(resolve => {
        wx.getSetting({
            success(res){
                // console.log(res.authSetting);
                if (res.authSetting['scope.userInfo']) {
                    console.log('用户已授权');
                    resolve(true);
                }else {
                    console.log('用户未授权');
                    resolve(false);
                }
            },
        });
    });
};

// 获取微信用户信息
let wxgetUserInfo = ()=>{
    return new Promise(resolve=>{
        wx.getUserInfo({
            success:(res) => {
                resolve(res);
            },
        });
    });
};

// 微信登录
let wxlogin = ()=>{
    return new Promise((resolve,reject)=>{
        wx.login({
            success: (res)=>{
                if (res.code) {
                    // console.log('wxlogin',res);
                    resolve(res);
                } else {
                    console.log('登录失败！' + res.errMsg);
                    reject(res.errMsg);
                }
            },
        });
    });
};

// 检测登录态是否过期
let wxcheckSession = ()=>{
    return new Promise(resolve=>{
        wx.checkSession({
            success: function(){
                //session_key 未过期，并且在本生命周期一直有效
                resolve({timeout:false});
            },
            fail: function(){
                // session_key 已经失效，需要重新执行登录流程
                resolve({timeout:true});
            },
        });
    });
};

// 小程序升级
let wxupdate = ()=>{
    const updateManager = wx.getUpdateManager();

    // updateManager.onCheckForUpdate(function (res) {
    //     // 请求完新版本信息的回调
    //     console.log('hasUpdate',res.hasUpdate);
    // });

    updateManager.onUpdateReady(function () {
        wx.showModal({
            title: '更新提示',
            content: '新版本已经准备好，是否重启应用？',
            success: function (res) {
                if (res.confirm) {
                    // 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
                    updateManager.applyUpdate();
                }
            },
        });
    });

    // updateManager.onUpdateFailed(function () {
    //     // 新版本下载失败
    //     console.log('updatefail');
    // });
};

let wxgetImageInfo = (src) => {
    return new Promise((resolve,reject) => {
        wx.getImageInfo({
            src: src,
            success(res) {
                // console.log(res)
                // console.log(res.width)
                // console.log(res.height)
                resolve(res);
            },
            fail(res){
                reject(res);
            },
        });
    });
};

let wxdownload = (url) => {
    return new Promise((resolve,reject) => {
        wx.downloadFile({
            url: url,
            success(res) {
            // 只要服务器有响应数据，就会把响应内容写入文件并进入 success 回调，业务需要自行判断是否下载到了想要的内容
                if (res.statusCode === 200) {
                    resolve(res);
                }else{
                    reject(res);
                }
            },
            fail(res){
                reject(res);
            },
        });
    });
};

// 创建授权按钮,只有用户确认授权才会返回
let wxCreateUserInfoButton = () => {
    let sysInfo = wx.getSystemInfoSync();
    //获取微信界面大小
    let width = sysInfo.screenWidth;
    let height = sysInfo.screenHeight;

    let btnWidth = 366/2;
    let btnHeight = 126/2;

    let left = (width-btnWidth)/2;
    let top = (height-btnHeight)/2 + 200;

    return new Promise(resolve => {
        // let button = wx.createUserInfoButton({
        //     type: 'text',
        //     text: '授权',
        //     style: {
        //         left: 0,
        //         top: 0,
        //         width: width,
        //         height: height,
        //         backgroundColor: '#ffffffff',//最后两位为透明度
        //         color: '#000000',
        //         fontSize: 60,
        //         textAlign: 'center',
        //         lineHeight: height,
        //     },
        // });

        let button = wx.createUserInfoButton({
            type: 'image',
            image: 'https://cdn.herinapp.com/2048/game-enter-190717101625.png',
            style: {
                left: left,
                top: top,
                width: btnWidth,
                height: btnHeight,
            },
        });

        button.onTap((res) => {
            if (res.userInfo) {
                // console.log('用户授权:', res);
                button.destroy();
                return resolve(res);
            }else {
                console.log('用户拒绝授权:', res);
            }
        });
    });
};

let wxPostMessage = (msg) => {
    wx.postMessage(msg);
};

let wxShareAppMessage = (object) => {
    wx.shareAppMessage(object);
};

let wxCreateRewardedVideoAd = (object) => {
    wx.createRewardedVideoAd(object);
};

let wxNavigateToMiniProgram = (object) => {
    wx.navigateToMiniProgram(object);
};

let wxSetUserCloudStorage = (KVDataList) => {
    return new Promise(resolve => {
        wx.setUserCloudStorage({
            KVDataList: KVDataList,
            success: res => {
                resolve(res);
            },
        });
    });
};

let wxVibrateShort = ()=>{
    try { wx.vibrateShort(); } catch (error) { }
};


export default {
    wxGetSetting,
    wxgetUserInfo,
    wxlogin,
    wxcheckSession,
    wxupdate,
    wxgetImageInfo,
    wxdownload,
    wxCreateUserInfoButton,
    wxPostMessage,
    wxShareAppMessage,
    wxCreateRewardedVideoAd,
    wxNavigateToMiniProgram,
    wxSetUserCloudStorage,
    wxVibrateShort,
};

export {
    wxGetSetting,
    wxgetUserInfo,
    wxlogin,
    wxcheckSession,
    wxupdate,
    wxgetImageInfo,
    wxdownload,
    wxCreateUserInfoButton,
    wxPostMessage,
    wxShareAppMessage,
    wxCreateRewardedVideoAd,
    wxNavigateToMiniProgram,
    wxSetUserCloudStorage,
    wxVibrateShort,
};