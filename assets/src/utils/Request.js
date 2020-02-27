/**
 * request.js 改写wx.request
 *
 * @Author: GB
 * @Date:   2018-08-20 21:05:07
 * @Last Modified by:   GB
 * @Last Modified time: 2019-05-23 15:37:39
 */

import { getToken } from 'login.service';
import { server, local } from 'Config';

// 针对微信请求的封装
let request = async (url, method = 'GET', data, useToken = true) => {
    const isDevelop = false;
    let header = {
        'content-type': 'application/json', // 默认值
    };

    // 如果需要使用token
    if (useToken) header['Authorization'] = `Bearer ${await getToken()}`;

    // console.log(header);
    url = isDevelop ? `${local}${url}` : `${server}${url}`;

    return new Promise((resolve, reject) => {
        wx.request({
            url, data, header, method,
            success: function (res) {
                resolve(res.data);
            },
            fail: function (err) {
                reject(err);
            },
        });
    });
};


export default request;