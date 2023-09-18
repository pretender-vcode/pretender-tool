// pages/photo/index.js
Page({

    /**
     * 页面的初始数据
     */
    data: {
        imageInfo: {
            width: 0,
            height: 0,
            src: '',
        },
        files: [],
        canvas: {
            id: 'my-photo',
            width: 0,
            height: 0,
				},
				calcWidth: 10,
				calcHeight: 10,
    },
    // 获取图片信息
    getImageInfo(src) {
        // 获取图片信息
        wx.getImageInfo({
            src,
            success: (res) => {
                this.setData({
                    'imageInfo.width': res.width,
                    'imageInfo.height': res.height,
                    'imageInfo.src': res.path,
                })
            }
        });
    },
    setCanvasData() {
        const query = wx.createSelectorQuery();
        query.select('#preview').fields({ node: true, size: true }).exec(res => {
            const { width, height } = res[0];
            query.select('#my-photo').fields({ node: true, size: true }).exec((cs) => {
							console.log("aaaaa:", width, height);
                if (!cs[0].node) return;
                const canvas = cs[0].node
                const ctx = canvas.getContext('2d')
                const dpr = wx.getSystemInfoSync().pixelRatio
                canvas.width = width * dpr
                canvas.height = height * dpr
                ctx.scale(dpr, dpr)
                ctx.fillRect(0, 0, 100, 100)
            })
        });
    },
    // 选择照片
    uploadImg() {
        wx.chooseMedia({
            count: 1,
            mediaType: ['image'],
            sourceType: ['album', 'camera'],
            sizeType: ['original'],
            success: (res) => {
                if (res.errMsg === 'chooseMedia:ok' && res.type === 'image') {
                    this.setData({
                        files: res.tempFiles
                    });
                    wx.nextTick(() => {
                        this.setCanvasData();
                        this.getImageInfo(res.tempFiles[0].tempFilePath);
                    })
                }
            },
            fail: (err) => {

            },
            complete: () => {

            }
        });
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {

    },

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