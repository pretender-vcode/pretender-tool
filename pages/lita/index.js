// index.js
// 获取应用实例
const app = getApp()
import { Lita } from '../../utils/bluetooth/lita';
Page({
    data: {
        bluetooth: '',
        deviceList: [],
        currentDevice: {},
        timer: null,
        IP: '',
        port: ''
    },
    onLoad() {
        const bluetooth = new Lita({ env: app.globalData.env });
        this.setData({
            bluetooth
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
        app.globalData.bluetooth.getDeviceList(['SmartLock'],(res) => {
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
    selectDevice(e) {
        const { item } = e.currentTarget.dataset;
        let { bluetooth } = this.data;
        this.setData({
            currentDevice: item
        });
    },
    changeIP(e) {
        this.setData({
            IP: e.detail
        })
    },
    changePort(e) {
        this.setData({
            port: e.detail
        })
    },
    submitIPPort() {
        //测试环境 IP: 113.105.90.219, port: 31821
        //公司环境 IP: 159.75.189.133 port: 3000
        const { bluetooth, currentDevice, IP, port } = this.data;
        bluetooth.dealCMD('setIp', { deviceId: currentDevice.deviceId, ip: IP, port }, (res) => {
            console.log("setIp结果：", res);
        });
    },
    openLock(e) {
        const { cmd } = e.currentTarget.dataset;
        this.setData({
            currentCMD: cmd
        })
        let { bluetooth, currentDevice } = this.data;
        bluetooth.dealCMD('openLock', { deviceId: currentDevice.deviceId }, (res) => {
            wx.showToast({
                title: res.message,
                icon: res.code.startsWith('E0') ? 'error' : 'success',
                duration: 2000
            })
        });
    },
    closeLock() {
        let { bluetooth, currentDevice } = this.data;
        bluetooth.dealCMD('closeLock', { deviceId: currentDevice.deviceId }, (res) => {
            console.log("关锁结果：", res);
        });
    },
    rebootLock(e) {
        const { cmd } = e.currentTarget.dataset;
        this.setData({
            currentCMD: cmd
        })
        let { bluetooth, currentDevice } = this.data;
        bluetooth.dealCMD('rebootLock', { deviceId: currentDevice.deviceId }, (res) => {
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

    },
    getIp(e) {
        const { cmd } = e.currentTarget.dataset;
        this.setData({
            currentCMD: cmd
        })
        wx.showToast({
            title: 'IP地址获取中',
            icon: 'loading',
            duration: 2000
        })
        const { bluetooth, currentDevice } = this.data;
        bluetooth.dealCMD('getIp', { deviceId: currentDevice.deviceId }, (res) => {
            if (res.code.startsWith('E0')) {
                wx.showToast({
                    title: res.message,
                    icon: 'none',
                    duration: 2000
                })
            } else {
                const { ip, port } = res.content;
                this.setData({
                    IP: ip,
                    port
                })
            }
        });
    }
})