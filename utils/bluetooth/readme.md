#### 使用说明
``` javascript
//初始化蓝牙
onLoad: function(options) {
    const bluetooth = new LeKai();
    this.setData({
        bluetooth
    })
}
//获取列表
getDeviceList(e) {
        wx.showLoading({
            title: '蓝牙搜索中...',
            icon: 'none',
            duration: 2000
        });
        this.setData({
            deviceList: []
        })
        const { flag } = e.currentTarget.dataset;
        let { bluetooth } = this.data;
        bluetooth.getDeviceList((res) => {
            console.log("设备搜索结果：", res);
            if (res.code.startsWith('E0')) {
                wx.showToast({
                    title: res.message,
                    icon: 'none',
                    duration: 2000
                })
            } else {
                wx.hideLoading();
                this.setData({
                    deviceList: res.list
                })
            }
        })
    }
    /**
     * 开锁可以结合获取列表一起使用，及在获取列表中匹配到设备后直接开锁，此处有坑，开锁完成后尽量断开蓝牙适配器，然后可以再次进行开锁
    */
    openLock() {
        let { bluetooth, currentDevice } = this.data;  //currentDevice是当前项
        bluetooth.dealCMD('openLock', { deviceId: currentDevice.mac, key: '33E3DF8C7987867C0A9286AB83AC21BB62E7237EB1AEE99234B58C00F2F95120' }, (res) => {
            if(res.code.startsWith('S0')) {
                wx.showToast({
                  title: res.message,
                  icon: 'success',
                  duration: 2000
                })
            }else {
                wx.showToast({
                    title: res.message,
                    icon: 'error',
                    duration: 2000
                  })
            }
        });
    }
    stopBluetooth() {
        let { bluetooth } = this.data;
        bluetooth.closeBluetoothAdapter();
        this.setData({
            deviceList: []
        })
    },
``` 
