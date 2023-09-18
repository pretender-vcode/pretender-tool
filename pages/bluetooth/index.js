// pages/bluetooth/index.js
const app = getApp();
import { Common } from '../../utils/bluetooth/common/common';
const bluetooth = Common.getInstance({ nameFlags: ['e-park', 'SmartLock', 'hctdx', 'ISH', 'GW'] })
Page({

    /**
     * 页面的初始数据
     */
    data: {
        bluetooth: '',
        deviceList: [],
    },
    getDeviceList(e) {
        wx.showLoading({
            title: '蓝牙搜索中...',
        });
        this.setData({
            deviceList: []
        })
        bluetooth.getDeviceList((res) => {
						wx.hideLoading();
            if (res.code.startsWith('E0')) {
                wx.showToast({
                    title: res.message,
                    icon: 'none',
                    duration: 2000
                })
            } else {
                this.setData({
                    deviceList: res.list
                })
            }
        })
    },
    stopBluetooth() {
				bluetooth.stopBluetoothDevicesDiscovery();
        bluetooth.closeBluetoothAdapter('yes');
        this.setData({
            currentCMD: '',
            currentDevice: {}
        })
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {},

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady() {

    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow() {

    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide() {

    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload() {

    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh() {

    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom() {

    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage() {

    }
})