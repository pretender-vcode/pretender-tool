// pages/lekai/index.js
import { LeKai } from '../../utils/bluetooth/lekai';
Page({

    /**
     * 页面的初始数据
     */
    data: {
        bluetooth: '',
        MAC: '00:81:F9:71:D6:DA',
        KEY: '33E3DF8C7987867C0A9286AB83AC21BB62E7237EB1AEE99234B58C00F2F95120'
    },
    openLock() {
        //郭老师办公室门口 '00:81:F9:71:D6:DA', '33E3DF8C7987867C0A9286AB83AC21BB62E7237EB1AEE99234B58C00F2F95120'
        let { bluetooth, MAC, KEY } = this.data;
        bluetooth.openLock(MAC, KEY);
    },
    stopBluetooth() {
        let { bluetooth } = this.data;
        bluetooth.closeBluetoothAdapter();
        this.setData({
            deviceList: []
        })
    },
    changeMac(e) {
        this.setData({
            MAC: e.detail
        })
    },
    changeKey(e) {
        this.setData({
            KEY: e.detail
        })
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        const bluetooth = new LeKai();
        this.setData({
            bluetooth
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