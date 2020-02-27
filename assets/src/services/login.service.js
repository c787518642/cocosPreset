// ***********************
// *** 【看最后导出的】 ***
// ***********************

import Global from 'Global';
import request from 'Request';


// 微信登录
function wxlogin() {
    return new Promise((resolve, reject) => {
        wx.login({
            success: (res) => {
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

// 获取渠道码
function getChannel(launchOptions) {
    let channel = launchOptions.query.channel;

    if (channel !== void 0) {
        return channel;
    }

    let scene = launchOptions.scene;

    switch (scene) {
        case 1005:
        case 1006:
        case 1027:
        case 1042:
        case 1054:
            channel = 10001;
            break;
        default:
            channel = 10002;
            break;
    }

    return channel;
}

// 静默登录(获取OpenId)
async function login() {
    // 如果本地用户有缓存 => 直接返回
    const userInfo = wx.getStorageSync('userInfoNew');

    if (userInfo && userInfo.openId) {
        Global.userInfo = userInfo;
        return Promise.resolve(userInfo.openId);
    }

    // 第一次登录游戏  => 调用login

    const launchOptions = wx.getLaunchOptionsSync();
    const channel = getChannel(launchOptions);
    const { query, scene } = launchOptions;
    const { code } = await wxlogin();

    console.log('query.openId', query.openId);

    // 提交后台获取用户unionId
    const API = '/v1/wx/oid';
    const data = {
        jscode: code,
        inviteOid: query.openId || '', //邀请人openId
        channel: channel || '',
        join: scene || '',
    };

    // 提交后台服务器获取用户的openid
    const result = await request(API, 'GET', data, false).catch(() => { });

    if (!result) { console.error('登录错误'); return; }

    const newUserInfo = {
        openId: result.data.oid,
        channel: channel || '',
    };

    Global.userInfo = newUserInfo;
    wx.setStorageSync('userInfoNew', newUserInfo);

    // return Promise.resolve(userInfo.openId);
}

// 获取Token
async function getToken() {

    let token = Global.token;
    let info;
    let isExp;

    // 如果数据已经存，检查是否过期
    if (token) {

        // 检查是否过期
        info = jwtDecode(token);
        isExp = info.exp - parseInt(new Date().valueOf() / 1000) < 3600;

        // 如果没过期直接返回
        if (!isExp) return Promise.resolve(token);

        // 如果不存在Vuex数据从本地读取
    } else {
        // 查找本地用户数据
        token = wx.getStorageSync('tokenNew');

        // 如果存在本地token
        if (token) {
            info = jwtDecode(token);

            isExp = info.exp - parseInt(new Date().valueOf() / 1000) < 3600;

            // 如果没过期保存数据
            if (!isExp) {
                // 将数据保存在全局变量
                Global.token = token;
                return Promise.resolve(token);
            }
        }
    }

    // 如果不存在本地数据，重新获取token
    let API = '/token/jwt';

    let data = {
        // uid:Global.userInfo.unionId,
        oid: Global.userInfo.openId,
    };

    // 提交后台服务器获取用户的JWT
    let result = await request(API, 'POST', data, false).catch(() => { });
    token = result.data.token;

    // 将数据保存在全局变量
    Global.token = token;

    // 保存用户信息到本地
    wx.setStorageSync('tokenNew', token);

    return Promise.resolve(token);
};

export default {
    login,
    getToken
}