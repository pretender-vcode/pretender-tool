
const Crypto = require('./cryptojs.js').Crypto;
const app = getApp();

class WXBizDataCrypt {
    constructor() {
      this.appId = app.globalData.appId;
      this.sessionKey = app.globalData.session_key;
    }
    decryptData(encryptedData, iv) {
        let decryptResult;
        // base64 decode ：使用 CryptoJS 中 Crypto.util.base64ToBytes()进行 base64解码
        let enData = Crypto.util.base64ToBytes(encryptedData)
        let key = Crypto.util.base64ToBytes(this.sessionKey);
        let ivv = Crypto.util.base64ToBytes(iv);
        // 对称解密使用的算法为 AES-128-CBC，数据采用PKCS#7填充
        let mode = new Crypto.mode.CBC(Crypto.pad.pkcs7);

        try {
            // 解密
            let decrypt = Crypto.AES.decrypt(enData, key, {
                asBpytes: true,
                iv: ivv,
                mode: mode
            });
            decryptResult = JSON.parse(decrypt);
        } catch (err) {
            console.log(err)
        }

        if (decryptResult.watermark.appid !== this.appId) {
            console.log(err)
        }

        return decryptResult
    }
}

export default WXBizDataCrypt;