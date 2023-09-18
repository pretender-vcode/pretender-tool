// pages/file/index.js
const app = getApp();
import { Gateway } from '../../utils/bluetooth/index';
Page({

    /**
     * 页面的初始数据
     */
    data: {
        gateway: '',
        deviceList: [],
        currentDevice: {},
        percent: 0,
        time: 0
    },
    getDeviceList(e) {
        const { cmd } = e.currentTarget.dataset;
        this.setData({
            currentCMD: cmd
        })
        this.setData({
            deviceList: []
        })
        app.globalData.bluetooth.getDeviceList(['GW'], (res) => {
            console.log("设备搜索结果：", res);
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
    selectDevice(e) {
        const { item } = e.currentTarget.dataset;
        this.setData({
            currentDevice: item
        });
        console.log("当前设备-----------：", this.data.currentDevice);
    },
    async dfu(e) {
        try {
            const fileInfo = await wx.chooseMessageFile({ count: 1, type: 'all' });
            if (Array.isArray(fileInfo.tempFiles) && fileInfo.tempFiles.length > 0) {
                const { path } = fileInfo.tempFiles[0];
                this.writeFile(path);
            }
        } catch (err) {
            console.error(err);
        }
    },
    writeFile(url) {
        const fs = wx.getFileSystemManager();
        fs.readFile({
            filePath: url,
            position: 0,
            success: (res) => {
                console.log("读取信息：", res.data.byteLength);
                let { gateway, currentDevice } = this.data;
                gateway.dealCMD('dfuStart', { deviceId: currentDevice.deviceId, buffer: res.data, readLen: 200 }, (dfu) => {
                    this.setData({
                        percent: dfu.percent,
                        time: parseFloat(dfu.time/1000).toFixed(2)
                    })
                    console.log(dfu);
                });
                

            },
            fail: (res) => {
                console.error(res)
            }
        })
    },
    stopBluetooth() {
        app.globalData.bluetooth.closeBluetoothAdapter('yes');
        this.setData({
            deviceList: [],
            currentCMD: '',
            currentDevice: {}
        })
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        const gateway = new Gateway();
        this.setData({
            gateway
        })
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function() {

    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function() {

    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function() {

    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload: function() {

    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function() {

    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function() {

    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function() {

    }
})