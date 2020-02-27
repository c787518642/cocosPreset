/**
 * user.js 用户相关函数
 *
 * @Author: GB
 * @Date:   2018-08-20 21:29:16
 * @Last Modified by:   GB
 * @Last Modified time: 2019-08-12 17:00:33
 */

import request from 'Request';
import {wxgetUserInfo,wxlogin} from 'Wechat';
import config from 'Config';
import jwtDecode from 'jwt-decode';
import Global from 'Global';

/**
 *
 * isInfoChange 判断用户数据是否有更新,本地数据不存在时 return true;
 *
 * @param {Object} localInfo 本地缓存用户数据
 * @param {Object} wxInfo 从微信获取的用户数据
 *
 * @return {Boolean} 数据是否变化
 */
let isInfoChange = (localInfo,wxInfo) => {

    // 本地信息不存在直接返回
    if (!localInfo) return true;

    // 判断头像
    let isAvatarChange = localInfo.avatarUrl !== wxInfo.avatarUrl;
    // 判断昵称
    let isNicknameChange = localInfo.nickName !== wxInfo.nickName;

    return isAvatarChange || isNicknameChange;
};

// 用户授权
let getUserInfo = async ()=>{

    // 如果数据已经存在
    if(Global.userInfo.unionId) return Promise.resolve();

    // 查找本地用户数据
    let userInfo = wx.getStorageSync('userInfoNew');

    // 调用login
    let loginRes = await wxlogin();

    // 获取用户信息
    let userInfoRes = await wxgetUserInfo();

    // 对比本地数据和微信数据
    if(!isInfoChange(userInfo,userInfoRes.userInfo)){
        // 将数据保存在Vuex
        Global.userInfo = userInfo;
        return Promise.resolve(userInfo);
    }

    userInfo = userInfoRes.userInfo;

    // 小游戏启动时的参数
    let launchOptions = wx.getLaunchOptionsSync();

    let data = {
        userInfo:userInfoRes.userInfo,
        encryptedData: userInfoRes.encryptedData,
        iv: userInfoRes.iv,
        jscode: loginRes.code,

        join: launchOptions.scene,
        inviteOid: launchOptions.query.openId,
        shopOid: launchOptions.query.shopOid,
    };

    // 提交后台获取用户unionId
    let API = 'wx/wxuser';

    // 提交后台服务器获取用户的openid及unionId
    let result = await request(API,'POST',data,false).catch(()=>{});

    let {uid,oid,init} = result.data.data;

    // 将uid和openId赋值给用户
    userInfo.unionId = uid;
    userInfo.openId = oid;
    userInfo.init = init;

    // 将数据保存在全局变量
    Global.userInfo = userInfo;

    // 保存用户信息到本地
    wx.setStorageSync('userInfoNew', userInfo);

    return Promise.resolve(userInfo);
};


export default {
    getUserInfo
};
