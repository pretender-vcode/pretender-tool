
const { host, gateway: url } = require('../const/config');
const app = getApp();

import Notify from '../miniprogram_npm/@vant/weapp/notify/notify';

const HttpMethod = ["GET", "OPTIONS", "HEAD", "POST", "PUT", "DELETE", "TRACE", "CONNECT", undefined];

const request = (url, options = {}, isFullURL = false) => {
    let myMethod = '';
    if (options.method === undefined) {
        myMethod = 'GET';
    } else if (!HttpMethod.includes(options.method)) {
        console.log("传入了不合法的method");
        return false;
    } else {
        myMethod = options.method;
    }
    return new Promise(function (resolve, reject) {
        let header = {
            'content-type': 'application/json',
        };
        wx.request({
            method: myMethod,
            url: isFullURL ? url : host + url,
            data: options.data || {},
            header: Object.assign(header, options.header),
            success(res) {
                if (res.statusCode == 200 && res.data) {
                    //请求成功
                    resolve(res.data);
                } else {
                    //其他异常
                    reject(res.data);
                }
            },
            fail(err) {
                wx.showToast({
                  title: '请求数据异常,请重试',
                  icon: 'none',
                  duration: 3000
                })
                //请求失败
                reject(err);
            },
        });
    });

};

const gateway = (options = { type: '', method: '' }, permissions_key = '', biz_content = {}) => {
    let token = wx.getStorageSync('access_token');
    let app_id = app.globalData.userTenant.client_app_id;
    const frameInfo = wx.getStorageSync('userFrameInfo')  ? JSON.parse(wx.getStorageSync('userFrameInfo')) : [];
    if(options.type === 'gd') {
        biz_content.frame = frameInfo
    }
    let data = {
        app_id,
        token,
        method: options.method,
        format: 'json',
        charset: 'utf8',
        timestamp: parseInt(Date.now() / 1000),
        biz_content: biz_content ? JSON.stringify(biz_content) : ''
    }

    let arg = {
        url: `${url[options.type || 'default']}?permissions_key=${permissions_key}`,
        method: 'POST',
        header: {
            'content-type': 'application/x-www-form-urlencoded'
        },
        data
    }
    return new Promise((resolve, reject) => {
        wx.request({
            ...arg,
            success(res) {
                if(res.data.code === 90000) {
                    wx.showModal({
                        title: '授权过期',
                        content: '',
                        showCancel: false,
                        confirmText: '确定',
                        confirmColor: '#3CC51F',
                        success: (result) => {
                            if (result.confirm) {
                                wx.setStorageSync('categries', '');
                                wx.redirectTo({
                                    url: '/pages/index/index',
                                })
                            }
                        },
                    });
                      
                }else if(res.data.code !== 0) {
                    Notify({
                        type: 'danger',
                        message: res.data.message
                    })
                }
                resolve(res.data);
            },
            fail(err) {
                wx.showToast({
                    title: '请求数据异常,请重试',
                    icon: 'none',
                    duration: 3000
                  })
                reject(err)
            }
        })
    })
}

export {
    request,
    gateway
}