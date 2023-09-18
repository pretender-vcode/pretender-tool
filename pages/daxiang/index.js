// index.js
// 获取应用实例
const app = getApp()
import { Daxiang, Lita } from '../../utils/bluetooth/index';
Page({
    data: {
        daxiang: '',
        lita: '',
        deviceList: [],
        currentDevice: {},
        timer: null,
        IP: '',
        port: ''
    },
    onLoad() {
        const daxiang = new Daxiang({ env: app.globalData.env });
        const lita = new Lita({ env: app.globalData.env });
        this.setData({
            daxiang,
            lita
        })

    },
    getDeviceList(e) {
        const { cmd } = e.currentTarget.dataset;
        this.setData({
            currentCMD: cmd
        })
        wx.showLoading({
            title: '蓝牙搜索中...',
        });
        this.setData({
            deviceList: []
        })
        const { flag } = e.currentTarget.dataset;
        app.globalData.bluetooth.getDeviceList(['SmartLock', 'hct'],(res) => {
            wx.hideLoading();
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
    },
    selectDevice(e) {
        const { item } = e.currentTarget.dataset;
        this.setData({
            currentDevice: item
        });
        console.log("当前设备-----------：", this.data.currentDevice);
    },
    openLock(e) {
        const { cmd } = e.currentTarget.dataset;
        this.setData({
            currentCMD: cmd
        })
        let { daxiang, lita, currentDevice } = this.data;
        if(currentDevice.deviceName.startsWith('hctdx')) {
            daxiang.dealCMD('openLock', { deviceId: currentDevice.deviceId }, (res) => {
                wx.showToast({
                    title: res.message,
                    icon: res.code.startsWith('E0') ? 'error' : 'success',
                    duration: 2000
                })
            });
        }else {
            lita.dealCMD('openLock', { deviceId: currentDevice.deviceId }, (res) => {
                wx.showToast({
                    title: res.message,
                    icon: res.code.startsWith('E0') ? 'error' : 'success',
                    duration: 2000
                })
            });
        }
        
    },
    closeLock() {
        let { daxiang, currentDevice } = this.data;
        daxiang.dealCMD('closeLock', { deviceId: currentDevice.deviceId }, (res) => {
            console.log("关锁结果：", res);
        });
    },
    rebootLock(e) {
        const { cmd } = e.currentTarget.dataset;
        this.setData({
            currentCMD: cmd
        })
        let { lita, currentDevice } = this.data;
        lita.dealCMD('rebootLock', { deviceId: currentDevice.deviceId }, (res) => {
            wx.showToast({
                title: res.message,
                icon: res.code.startsWith('E0') ? 'error' : 'success',
                duration: 2000
            })
        });
    },
    stopBluetooth() {
        app.globalData.bluetooth.closeBluetoothAdapter('yes');
        this.setData({
            deviceList: [],
            currentCMD: '',
            currentDevice: {}
        })
    },
    setIp(e) {
        const { cmd } = e.currentTarget.dataset;
        this.setData({
            currentCMD: cmd
        })

    }
})