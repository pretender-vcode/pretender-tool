const HandleDirective = require("./HandleDirective.js");
class LeKai {
    constructor(params) {
        this.options = {
            system: '',
            key: '',
            randomArr: [],
            // key: '33E3DF8C7987867C0A9286AB83AC21BB62E7237EB1AEE99234B58C00F2F95120', //前端传入
            isDeviceFind: false,
            connected: false,
            deviceCode: '',
            connectedDeviceId: '',
            serialNo: '',
            chsValue: '',
            readserviceId: '',
            writeServiceId: '',
            notifyServiceId: '',
            readCharacteristicsId: '',
            writeCharacteristicsId: '',
            notifyCharacteristicsId: '',
            devices: [],
            openStep: 1
        };
        let system = wx.getSystemInfoSync();
        this.options.system = system.platform;
    }
    openBluetoothAdapter() {
        wx.showToast({
            title: '正在扫描设备',
            icon: 'loading',
            duration: 2000
        })
        if (!wx.openBluetoothAdapter) {
            wx.hideLoading();
            return wx.showToast({
                title: '当前微信版本过低，无法使用蓝牙功能',
                icon: 'none',
                duration: 2000
            })
        }

        wx.openBluetoothAdapter({
            success: (res) => {
                this.startBluetoothDevicesDiscovery();
            },
            fail: (err) => {
                if (err.errCode === 10001) {
                    wx.onBluetoothAdapterStateChange(function(res) {
                        console.log('onBluetoothAdapterStateChange', res)
                        if (res.available) {
                            this.startBluetoothDevicesDiscovery()
                        }
                    })
                }
            }
        })
    }
    startBluetoothDevicesDiscovery() {
        wx.startBluetoothDevicesDiscovery({
            allowDuplicatesKey: true,
            success: (res) => {
                if (!this.options.isDeviceFind) {
                    this.onBluetoothDeviceFound();
                }
            },
            fail: (err) => {
                wx.showToast({
                    title: '蓝牙处于不可用状态',
                    icon: 'none',
                    duration: 2000
                })
            }
        })
    }
    stopBluetoothDevicesDiscovery() {
        wx.stopBluetoothDevicesDiscovery({
            success: (res) => {
                console.log("停止搜索附近设备成功")
            },
            fail: (err) => {
                console.log("停止discover", err)
            }
        })
    }
    onBluetoothDeviceFound() {
        wx.onBluetoothDeviceFound((res) => {
            if (Array.isArray(res.devices) && res.devices.length > 0) {
                for (let i = 0; i < res.devices.length; i++) {
                    const { RSSI, name, deviceId, advertisData } = res.devices[i];
                    let dataArr = Array.prototype.map.call(new Uint8Array(advertisData), x => ('00' + x.toString(16)).slice(-2)); //byte->hex
                    let mac = dataArr.length >= 18 ? dataArr.slice(11, 17).join(':') : dataArr.join(':');
                    let cipherID = dataArr.length >= 26 && dataArr.slice(19, 25).join(''); //截取其中cipherID
                    let itemData = {
                        RSSI,
                        deviceId,
                        deviceName: name,
                        mac: mac.toUpperCase(),
                        cipherID,
                        code: cipherID,
                        version: 'StandardVersion_' + ((dataArr[2] >> 4) & 0x0f),
                        advertisData
                    }
                    if (this.options.connectedDeviceId === itemData.mac && !this.options.isDeviceFind) {
                        if(this.options.system === 'ios') {
                            this.options.connectedDeviceId = itemData.deviceId;
                        }
                        if (itemData.advertisData.byteLength < 29) {
                            wx.showToast({
                                title: '设备不支持',
                                icon: 'error',
                                duration: 2000
                            })
                            throw '设备不支持小程序开锁'
                        }
                        this.options.randomArr = new Uint8Array(itemData.advertisData, 27, 2);
                        this.options.isDeviceFind = true;
                        wx.showToast({
                            title: '匹配到设备',
                            icon: 'success',
                            duration: 2000
                        })
                        break;
                    }
                }
            }
            if (this.options.isDeviceFind) {
                wx.offBluetoothDeviceFound();
                this.stopBluetoothDevicesDiscovery();
                this.createBLEConnection(this.options.connectedDeviceId);
            }
        })
    }
    createBLEConnection(deviceId) {
        wx.showLoading({
            title: '蓝牙连接中...',
        })
        //连接选中设备
        wx.createBLEConnection({
            deviceId,
            success: (res) => {
                wx.hideLoading();
                wx.showToast({
                    title: '蓝牙连接成功',
                    icon: 'success',
                    duration: 2000
                })
                this.getBLEDeviceServices(deviceId);
            },
            fail: (err) => {
                console.log('err:', err)
                wx.showToast({
                    title: '连接失败，请重试',
                    icon: 'none',
                    duration: 2000
                })
                this.closeBLEConnection();
            }
        });
    }
    closeBLEConnection() {
        this.resetData();
        wx.closeBLEConnection({
            deviceId: this.options.connectedDeviceId,
            success: (res) => {
                console.log('断开连接成功');
                this.options.connected = false;
            }
        })
    }
    getBLEDeviceServices(deviceId) {
        wx.getBLEDeviceServices({
            deviceId,
            success: (res) => {
                if (res.errCode === 0 && Array.isArray(res.services) && res.services.length > 0) {
                    let serviceArr = res.services;
                    for (let i = 0; i < serviceArr.length; i++) {
                        if (serviceArr[i].isPrimary && !this.options.notifyCharacteristicsId && !this.options.writeCharacteristicsId) {
                            this.getBLEDeviceCharacteristics(deviceId, serviceArr[i].uuid);
                        }
                    }
                }
            }
        });
    }
    async getBLEDeviceCharacteristics(deviceId, serviceId) {
        console.log('进来了几次')
        wx.showToast({
            title: '获取特征值列表',
            icon: 'loading',
            duration: 2000
        })
        let res = await wx.getBLEDeviceCharacteristics({
            deviceId,
            serviceId
        })
        for (let item of res.characteristics) {
            if (item.uuid.indexOf("FFF1") != -1) { // 写
                this.options.writeServiceId = serviceId;
                this.options.writeCharacteristicsId = item.uuid; // 当前uuid
            } else if (item.uuid.indexOf("FFF2") != -1) { // 订阅
                this.options.notifyServiceId = serviceId;
                this.options.notifyCharacteristicsId = item.uuid;
            }
        }
        this.options.connected = true;
        await this.startNotify();
        setTimeout(() => {
            if (this.options.connected) {
                let { key, randomArr } = this.options;
                let buffer = new HandleDirective('down', key, randomArr).generateData();
                this.writeBLECharacteristicValue(buffer);
            }
        }, 50) //直接开门
    }
    async startNotify() {
        const { connectedDeviceId, notifyServiceId, notifyCharacteristicsId } = this.options;
        await wx.notifyBLECharacteristicValueChange({ //启用订阅功能
            state: true, // 启用 notify 功能  
            deviceId: connectedDeviceId,
            serviceId: notifyServiceId,
            characteristicId: notifyCharacteristicsId,
        })
        console.log("notify启用成功");
        // 这里的回调可以获取到 write 导致的特征值改变    
        wx.onBLECharacteristicValueChange((res) => {
            console.log("收到消息：", Array.prototype.map.call(new Uint8Array(res.value), x => ('00' + x.toString(16)).slice(-2)).join(''))
            let hex = Array.prototype.map.call(new Uint8Array(res.value), x => ('00' + x.toString(16)).slice(-2)).join(''); // hex的字符串
            if (hex.substr(4, 2) == '00') {
                wx.showToast({
                    title: '开锁成功',
                    icon: 'success',
                    duration: '2000'
                })
            } else {
                wx.showToast({
                    title: '开锁失败',
                    icon: 'success',
                    duration: '2000'
                })
            }
            this.closeBLEConnection();
            this.closeBluetoothAdapter();
        })
    }
    closeBluetoothAdapter() {
        wx.closeBluetoothAdapter();
        wx.showToast({
            title: '蓝牙断开成功',
            icon: 'success',
            duration: 2000
        })
    }
    writeBLECharacteristicValue(buffer) {
        let { connectedDeviceId, writeServiceId, writeCharacteristicsId } = this.options;
        wx.writeBLECharacteristicValue({
            deviceId: connectedDeviceId,
            serviceId: writeServiceId,
            characteristicId: writeCharacteristicsId,
            value: buffer,
            success: (write1) => {
                console.log('写入消息-----');
                wx.showToast({
                    title: '开锁成功',
                    icon: 'success',
                    duration: 2000
                })
            },
            fail: (err) => {
                wx.showToast({
                    title: '写入指令失败',
                    icon: 'error',
                    duration: 2000
                })
            }
        })
    }
    openLock(deviceId, key) {
        this.options.connectedDeviceId = deviceId, this.options.key = key;
        wx.showToast({
            title: '蓝牙开锁中...',
            icon: 'loading',
            duration: 2000
        })
        this.openBluetoothAdapter();
    }
    resetData() {
        this.options.isDeviceFind = false;
        this.options.connected = false;
        this.options.notifyServiceId = '';
        this.options.writeServiceId = '';
        this.options.writeCharacteristicsId = '';
        this.options.notifyCharacteristicsId = '';
    }
    // buffer转十六进制
    buffer2Hex(buffer) {
        return Array.prototype.map.call(new Uint8Array(buffer), x => ('00' + x.toString(16)).slice(-2)).join('');
    }
    hex2int(hex) {
        var len = hex.length;
        var a = new Array(len);
        var code;
        for (var i = 0; i < len; i++) {
            code = hex.charCodeAt(i);
            if (48 <= code && code < 58) {
                code -= 48;
            } else {
                code = (code & 0xdf) - 65 + 10;
            }
            a[i] = code;
        }

        return a.reduce(function(acc, c) {
            acc = 16 * acc + c;
            return acc;
        }, 0);
    }
    // 进制转换
    baseConversion(num, m, n) {
        var s = num + '';
        var result = parseInt(s, m).toString(n);
        return result;
    }
}


export {
    LeKai
}