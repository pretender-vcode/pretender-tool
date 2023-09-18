// pages/index/index.js
const app = getApp();
Page({

    /**
     * 页面的初始数据
     */
    data: {
        toolList: [{
                id: 1,
                name: '二维码识别',
                icon: 'i-qrcode',
                url: '/pages/qrcode/index',
            },
            {
                id: 2,
                name: '蓝牙扫描',
                icon: 'i-bluetooth',
                url: '/pages/bluetooth/index',
            },
            {
                id: 1,
                name: '魔法图片',
                icon: 'i-camera',
                url: '/pages/photo/index'
            },
            // {
            //     id: 2,
            //     name: '乐开蓝牙',
            //     icon: 'i-bluetooth',
            //     url: '/pages/lekai/index'
            // },
            // {
            //     id: 3,
            //     name: '大象蓝牙',
            //     icon: 'i-bluetooth',
            //     url: '/pages/daxiang/index'
            // },
            // {
            //     id: 4,
            //     name: '文件读写',
            //     icon: 'i-file',
            //     url: '/pages/file/index'
            // }
        ],
        // envList: [
        //     {
        //         id: 'uat',
        //         name: '测试环境'
        //     },
        //     {
        //         id: 'prod',
        //         name: '正式环境'
        //     },
        // ],
        // envOption: {
        //     id: 'id',
        //     name: 'name'
        // }
    },
    redirectPage(e) {
        const { item: { url, id } } = e.currentTarget.dataset;
        wx.navigateTo({
            url
        })
    },
    setEnv(e) {
        console.log("当前运行环境：", e.detail);
        app.globalData.env = e.detail;
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {

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