/**
 * author: pretender
 * date: 2021-07-30
 * description: 利他车位锁相关
 */
const CMDS = ['openLock', 'closeLock', 'setIp', 'getIp', 'getLockDeviceCode', 'setLockDeviceCode', 'rebootLock', 'setLockParams', 'getLockStatus', 'getLockParams'];
const answerMap = {
    openLock: '开锁',
    closeLock: '关锁',
    setIp: '设置IP',
    getIp: '获取IP',
    getLockDeviceCode: '获取车位设备码',
    setLockDeviceCode: '设置车位设备码',
    rebootLock: '重启',
    setLockParams: '设置车位锁参数',
    getLockParams: '获取车位锁参数',
    getLockStatus: '获取车位锁状态'
}
const Tips = require('./tip');

class Lita {
    constructor(params) {
        this.options = {
            cmd: '',
            discoveryStarted: false,
            connected: false,
            canWrite: false,
            isWriting: true,
            deviceCode: '',
            connectedDeviceId: '',
            serialNo: '',
            chsValue: '',
            readserviceId: '',
            writeServiceId: '0000FFE5-0000-1000-8000-00805F9B34FB',
            notifyServiceId: '0000FFE0-0000-1000-8000-00805F9B34FB',
            readCharacteristicsId: '',
            writeCharacteristicsId: '0000FFE9-0000-1000-8000-00805F9B34FB',
            notifyCharacteristicsId: '0000FFE4-0000-1000-8000-00805F9B34FB',
            devices: [],
            overTime: 1, //总共搜索50次，50次没有搜索到就给出提示
        };
        Object.assign(this.options, params);
    }
    getDeviceList(callback) {
        this.openBluetoothAdapter(callback);
    }
    openBluetoothAdapter(callback) {
        if (!wx.openBluetoothAdapter) {
            callback(Tips['E0007']);
        }
        if (this.options.discoveryStarted) {
            return
        }
        this.options.discoveryStarted = true
        wx.openBluetoothAdapter({
            success: (res) => {
                this.startBluetoothDevicesDiscovery(callback);
            },
            fail: (err) => {
                this.closeBluetoothAdapter();
                callback(Tips['E0005'])
            }
        })
    }
    getBluetoothAdapterState(callback) {
        wx.getBluetoothAdapterState({
            success: (res) => {
                console.log('getBluetoothAdapterState', res)
                if (res.discovering) {
                    this.onBluetoothDeviceFound(callback)
                } else if (res.available) {
                    this.startBluetoothDevicesDiscovery(callback)
                }
            }
        })
    }
    startBluetoothDevicesDiscovery(callback) {
        wx.startBluetoothDevicesDiscovery({
            allowDuplicatesKey: true,
            success: (res) => {
                this.onBluetoothDeviceFound(callback);
            },
            fail: (err) => {
                callback(Tips['E0008'])
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
    onBluetoothDeviceFound(callback) {
        wx.onBluetoothDeviceFound((res) => {
            this.options.overTime++;
            if (Array.isArray(res.devices) && res.devices.length > 0) {
                for (let i = 0; i < res.devices.length; i++) {
                    const { RSSI, name, deviceId, advertisData } = res.devices[i];
                    let itemData = {
                        RSSI,
                        deviceId,
                        deviceName: name,
                        mac: deviceId,
                        code: this.buffer2Hex(advertisData).substr(-16),
                        version: this.buffer2Hex(advertisData).substr(-6)
                    }
                    //筛选出属于智能锁的蓝牙列表
                    if (itemData.deviceId && itemData.code && itemData.deviceName.startsWith('SmartLock')) {
                        this.newDevice(itemData, callback);
                    } else if (this.options.overTime >= 50 && this.options.devices.length === 0) {
                        this.options.overTime = 0;
                        this.closeBluetoothAdapter();
                        callback(Tips['E0009']);
                        
                    }
                }
            }

        })
    }
    newDevice(item, callback) {
        let { devices } = this.options;
        let index = devices.findIndex(el => el.deviceId === item.mac);
        if (index === -1) {
            devices.push(item);
        } else {
            devices[index] = item;
        }
        this.options.devices = devices;
        console.log("外围设备列表：", devices);
        if (this.options.devices.length > 0) {
            callback({
                ...Tips['S0001'],
                list: this.options.devices
            });
        } else {
            callback(Tips['E0009']);
        }
    }
    createBLEConnection(deviceId, callback) {
        wx.showLoading({
            title: '蓝牙连接中...',
        })
        this.stopBluetoothDevicesDiscovery();
        //连接选中设备
        wx.createBLEConnection({
            deviceId,
            success: (res) => {
                wx.hideLoading();
                this.getBLEDeviceServices(deviceId, callback);
            },
            fail: (err) => {
                console.log("连接状态：", err);
                wx.showToast({
                    title: '连接失败，请重试',
                    icon: 'none',
                    duration: 2000
                })
                this.closeBLEConnection();
                callback(Tips['E0003']);

            }
        });
    }
    closeBLEConnection() {
        this.options.isWriting = true;
        wx.closeBLEConnection({
            deviceId: this.options.connectedDeviceId,
            success: (res) => {
                console.log('断开连接成功');
                this.options.connected = false;
            }
        })
    }
    getBLEDeviceServices(deviceId, callback) {
        wx.getBLEDeviceServices({
            deviceId,
            success: (res) => {
                if (res.errCode === 0 && Array.isArray(res.services) && res.services.length > 0) {
                    let serviceArr = res.services;
                    for (let i = 0; i < serviceArr.length; i++) {
                        if (serviceArr[i].isPrimary) {
                            this.getBLEDeviceCharacteristics(deviceId, serviceArr[i].uuid, callback);
                        }
                    }
                }
            }
        });
    }
    getBLEDeviceCharacteristics(deviceId, serviceId, callback) {
        wx.getBLEDeviceCharacteristics({
            deviceId,
            serviceId,
            success: (res) => {
                if (Array.isArray(res.characteristics) && res.characteristics.length > 0) {
                    let chtsArr = res.characteristics;
                    console.log("特征值列表：", chtsArr);
                    for (let i = 0; i < chtsArr.length; i++) {
                        let { uuid, properties } = chtsArr[i];
                        if (uuid) {

                            // if (properties && properties.read) {
                            //     this.options.readserviceId = serviceId;
                            //     this.options.readCharacteristicsId = uuid;

                            // }
                            if (properties && properties.write) { //可写
                                this.options.canWrite = true;
                                // this.options.writeServiceId = serviceId;
                                this.options.connectedDeviceId = deviceId;
                                this.options.connected = true;
                                wx.showToast({
                                    title: '连接成功',
                                })
                                if (this.options.cmd === 'openLock' && this.options.isWriting) {
                                    this.openLock(callback)
                                } else if (this.options.cmd === 'rebootLock' && this.options.isWriting) {
                                    this.rebootLock(callback)
                                } else if (this.options.cmd === 'closeLock' && this.options.isWriting) {
                                    this.closeLock(callback);
                                } else if (this.options.cmd === 'setIp' && this.options.isWriting) {
                                    this.setIp(callback);
                                } else if (this.options.cmd === 'getIp' && this.options.isWriting) {
                                    this.getIp(callback);
                                }
                                // this.options.writeCharacteristicsId = uuid; // 当前uuid
                            }
                            // if (properties && properties.notify) { //可通知
                            //     this.options.notifyServiceId = serviceId;
                            //     this.options.notifyCharacteristicsId = uuid;
                            // }
                        }
                    }
                }

            }
        });

    }
    closeBluetoothAdapter() {
        wx.closeBluetoothAdapter({
            success() {
                wx.showToast({
                    title: '蓝牙断开成功',
                    icon: 'success',
                    duration: 2000
                })
            }
        });
        this.options.discoveryStarted = false;
    }
    writeBLECharacteristicValue(buffer, callback) {
        this.options.isWriting = false;
        let { connectedDeviceId, writeServiceId, writeCharacteristicsId } = this.options;
        wx.writeBLECharacteristicValue({
            deviceId: connectedDeviceId,
            serviceId: writeServiceId,
            characteristicId: writeCharacteristicsId,
            value: buffer,
            success: (write1) => {
                console.log("写入：", this.buffer2Hex(buffer));
            },
            fail: (err) => {
                callback(Tips['E0011'])
                this.closeBLEConnection();
            }
        })
    }
    dealCMD(cmd, params = {}, callback) {
        if (!cmd || !CMDS.includes(cmd)) {
            wx.showToast({
                title: '无效的命令'
            })
        }
        this.options.cmd = cmd;
        this.options[cmd] = params;
        const { deviceId } = params;
        this.createBLEConnection(deviceId, callback);
    }
    openLock(callback) {
        this.options.isWriting = false;
        wx.showToast({
            title: '蓝牙开锁中',
            icon: 'loading',
            duration: 2000
        })
        let { connectedDeviceId, notifyServiceId, notifyCharacteristicsId, writeServiceId, writeCharacteristicsId } = this.options;
        //写入之前先启用消息订阅
        wx.notifyBLECharacteristicValueChange({ //启用订阅功能
            state: true, // 启用 notify 功能 
            type: 'notification',
            deviceId: connectedDeviceId,
            serviceId: notifyServiceId,
            characteristicId: notifyCharacteristicsId,
            success: (res) => {
                wx.showToast({
                    title: '启用消息订阅',
                    icon: 'none',
                    duration: 2000
                })
                wx.onBLECharacteristicValueChange((recive1) => {
                    let hex = this.buffer2Hex(recive1.value);
                    console.log("接收到消息1：", hex);
                    let command = "0EA003" + this.options.serialNo + hex.slice(10, 26);
                    let receiveBuffer = this.returnBuffer(this.adornOrder(command)); //报文组装
                    wx.writeBLECharacteristicValue({
                        deviceId: connectedDeviceId,
                        serviceId: writeServiceId,
                        characteristicId: writeCharacteristicsId,
                        value: receiveBuffer,
                        success: (write2) => {
                            console.log("写入消息2：", this.buffer2Hex(receiveBuffer));
                            wx.onBLECharacteristicValueChange((recive2) => {
                                const hex = this.buffer2Hex(recive2.value);
                                console.log("接收到消息2：", hex);
                                let result = +hex.substr(9 * 2, 1 * 2);
                                if (result === 0) {
                                    callback(Tips['S0002']);
                                }else {
                                    callback(Tips['E0013']);
                                }
                                this.closeBLEConnection();
                            })
                        },
                        fail: (err) => {
                            callback(Tips['E0012'])
                            this.closeBLEConnection();
                        }
                    })
                })
            }
        })
        this.setSerialNo();
        let command = "06A001" + this.options.serialNo;
        let data = this.adornOrder(command);
        let buffer = this.returnBuffer(data);
        wx.showToast({
            title: '写入数据中',
            icon: 'loading',
            duration: 2000
        })
        wx.writeBLECharacteristicValue({
            deviceId: connectedDeviceId,
            serviceId: writeServiceId,
            characteristicId: writeCharacteristicsId,
            value: buffer,
            success: (write1) => {
                console.log("写入消息1：", this.buffer2Hex(buffer));
            },
            fail: (err) => {
                callback(Tips['E0011'])
                this.closeBLEConnection();
            }
        })
    }
    closeLock() {
        this.setSerialNo();
        let buffer = this.returnBuffer(this.adornOrder('05a1' + this.options.serialNo));
        this.writeBLECharacteristicValue(buffer, callback);
    }
    // 设置车位锁IP及端口号, 指令报文0734
    setIp(callback) {
        const { ip, port } = this.options.setIp;
        if (!ip || !port) {
            return wx.showToast({
                title: 'ip或port为空',
                icon: 'error',
                duration: 2000
            })
        }
        let ipArr = ip.split('.');
        let ipStr = '';
        ipArr.map(item => {
            ipStr += Number(item).toString(16) + '';
        })
        let command = '0734' + ipStr + Number(port).toString(16);
        console.log("IP:", ipStr, command);
        let { connectedDeviceId, notifyServiceId, notifyCharacteristicsId, writeServiceId, writeCharacteristicsId } = this.options;
        //写入之前先启用消息订阅
        wx.notifyBLECharacteristicValueChange({ //启用订阅功能
            state: true, // 启用 notify 功能 
            type: 'notification',
            deviceId: connectedDeviceId,
            serviceId: notifyServiceId,
            characteristicId: notifyCharacteristicsId,
            success: (res) => {
                wx.showToast({
                    title: '启用消息订阅',
                    icon: 'none',
                    duration: 2000
                })
                wx.onBLECharacteristicValueChange((recive1) => {
                    let hex = this.buffer2Hex(recive1.value);
                    let result = hex.substr(4 * 2, 1 * 2);
                    if(result) {
                        callback({
                            ...Tips['S0003'],
                            content: {
                                ip,
                                port
                            }
                        })
                    }else {
                        callback(Tips['E0014'])
                    }
                    this.closeBLEConnection();
                })
            }
        })
        let buffer = this.returnBuffer(this.adornOrder(command));
        this.writeBLECharacteristicValue(buffer, callback);
    }
    getIp(callback) {
        this.options.isWriting = false;
        let { connectedDeviceId, notifyServiceId, notifyCharacteristicsId, writeServiceId, writeCharacteristicsId } = this.options;
        //写入之前先启用消息订阅
        wx.notifyBLECharacteristicValueChange({ //启用订阅功能
            state: true, // 启用 notify 功能 
            type: 'notification',
            deviceId: connectedDeviceId,
            serviceId: notifyServiceId,
            characteristicId: notifyCharacteristicsId,
            success: (res) => {
                console.log("启用消息通知：", res);
                wx.onBLECharacteristicValueChange((recive1) => {
                    let hex = this.buffer2Hex(recive1.value);
                    console.log("接收到消息1：", hex);
                    let ip = "";
                    for (var i = 4; i < hex.length / 2 - 4; i++) {
                        ip += this.hex2int(hex.substr(i * 2, 2)) + ".";
                    }
                    ip = ip.substring(0, ip.lastIndexOf('.'));
                    let port = this.hex2int(hex.substr(8 * 2, 2 * 2));
                    callback({
                        ...Tips['S0005'],
                        content: {
                            ip,
                            port
                        }
                    })
                    this.closeBLEConnection();
                })
            }
        })

        let buffer = this.returnBuffer(this.adornOrder('0133'));
        wx.writeBLECharacteristicValue({
            deviceId: connectedDeviceId,
            serviceId: writeServiceId,
            characteristicId: writeCharacteristicsId,
            value: buffer,
            success: (write1) => {
                console.log("写入消息1：", this.buffer2Hex(buffer));
            },
            fail: (err) => {
                console.log("step1写入异常：", err);
                callback(Tips['E0011'])
            }
        })
    }
    setLockDeviceCode(callback) {

    }
    getLockDeviceCode(callback) {

    }
    rebootLock(callback) {
        let { connectedDeviceId, notifyServiceId, notifyCharacteristicsId, writeServiceId, writeCharacteristicsId } = this.options;
        //写入之前先启用消息订阅
        wx.notifyBLECharacteristicValueChange({ //启用订阅功能
            state: true, // 启用 notify 功能 
            type: 'notification',
            deviceId: connectedDeviceId,
            serviceId: notifyServiceId,
            characteristicId: notifyCharacteristicsId,
            success: (res) => {
                console.log("启用消息通知：", res);
                wx.onBLECharacteristicValueChange((recive1) => {
                    let hex = this.buffer2Hex(recive1.value);
                    let result = hex.substr(4 * 2, 1 * 2);
                    if(result) {
                        callback(Tips['S0005']);
                    }else {
                        callback(Tips['E0015']);
                    }
                    this.closeBLEConnection();
                })
            }
        })
        let buffer = this.returnBuffer(this.adornOrder('0137'));
        this.writeBLECharacteristicValue(buffer, callback);
    }
    setLockParams(callback) {

    }
    getLockParams(callback) {

    }
    getLockStatus(callback) {
        let buffer = this.returnBuffer(this.adornOrder('0139'));
        this.writeBLECharacteristicValue(buffer, callback);
    }
    // 设置流水号
    setSerialNo() {
        let value = '';
        for (let j = 1; j <= 8; j++) {
            let i = parseInt(10 * Math.random());
            value = value + i.toString();
        }
        this.options.serialNo = value;
    }
    // 组装报文
    adornOrder(order) {
        return this.sum8('3B01' + order) + 'B3'
    }
    // 报文算法
    sum8(command) {
        command = command.toString();
        let comunit = 0;
        for (let i = 0; i < command.length / 2; i++) {
            let cunit = parseInt(command.substr(i * 2, 2), 16)
            if (this.options.env === 'prod') {
                comunit = comunit ^ parseInt(cunit);
            } else {
                comunit += parseInt(cunit)
            }

        }
        if (comunit.toString(16).length > 1) {
            command = command + (comunit.toString(16).substr(-2)).toUpperCase();
        } else {
            command = command + '0' + comunit.toString(16).toUpperCase();
        }
        comunit = 0
        return command
    }
    // 报文转换为buffer
    returnBuffer(data) {
        let buffer = new ArrayBuffer(data.length / 2);
        let dataView = new DataView(buffer);
        for (var i = 0; i < data.length / 2; i++) {
            dataView.setUint8(i, '0x' + data.substr(i * 2, 2));
        }
        return buffer
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
    Lita
}