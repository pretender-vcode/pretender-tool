var CryptoJS = require("crypto-js");


class HandleDirective {
  constructor(action, text, random) { //text 服务器获取
    this.key =  text.slice(32)//"CCF26715D23EBB57D9E32EE9C2B7C4AA3181D3539D0E9ACA02C1EAFE162FBCA1".slice(32)
    this.start4B = text.slice(0,8)
    this.action=action // 表 抬起方向动作
    this.random = random
  }
  generateData() {
    let result= this.encrypt()
    console.log(result.toString( ))
    let arrBuf=new ArrayBuffer(4+16)
    const dataView = new DataView(arrBuf); // 使用Unit8操作ArrayBuffer
    let wordArray1 = CryptoJS.enc.Hex.parse(this.start4B )
    let wordArray2 = CryptoJS.enc.Base64.parse(result.toString())
    let allWords = [...wordArray1.words, ...wordArray2.words]
    allWords.forEach((item,i)=>{
      dataView.setInt32(i*4,item)
    })
    return arrBuf
  }
  encrypt() {

    let data=this.packageData()//包装原始数据
    data = CryptoJS.lib.WordArray.create(data);
    console.log("原始数据"+ data)
    return CryptoJS.AES.encrypt(data, CryptoJS.enc.Hex.parse(this.key), {
        // iv: CryptoJS.enc.Utf8.parse(this.iv),//ECB 无需初始向量
        mode: CryptoJS.mode.ECB,
        padding: CryptoJS.pad.NoPadding
    })
  }
  decrypt(text) {
    var result = CryptoJS.AES.decrypt(text, CryptoJS.enc.Hex.parse(this.key), {
      iv: CryptoJS.enc.Utf8.parse(this.iv),
      mode: CryptoJS.mode.ECB,
      padding: CryptoJS.pad.NoPadding
    })
    return result.toString(CryptoJS.enc.Utf8)
  }
  packageData(){
    const buf = new ArrayBuffer(16);// 用于存放原始数据 长度16个字节
    const dv = new DataView(buf); // 使用Unit8操作ArrayBuffer
    dv.setUint8(0, 0x01)
    switch(this.action){
      case 'down':
        dv.setUint8(1, 0x01)//操作门锁开关 1 开 2 关
        break;
      case 'up':
        dv.setUint8(1, 0x02)//操作门锁开关 1 开 2 关
        break;
    }

    // dv.setUint8(1, 0x02)//操作门锁开关 1 开 2 关
    function getTimestamp(){
      let current_date = new Date().getTime()    //当前时间毫秒数
      let init_date=new Date(2000, 0, 1, 0, 0, 0).getTime()//2001-01-01 00:00
      let current_time_sec = Math.floor(((current_date - init_date)) / 1000) 
      return current_time_sec  
    }
    dv.setUint32(6, getTimestamp()) 
    dv.setUint8(12, 0x12) //keyType 

    // dv.setUint16(13, CryptoJS.enc.Hex.parse(this.random).words[0]) //广播里的随机数
    dv.setUint8(13, this.random[0]) //广播里的随机数
    dv.setUint8(14, this.random[1]) //广播里的随机数

    dv.setUint8(15, this.getCKCheckWithData(buf)) // ck校验
    return buf
  }
  getCKCheckWithData(buf){
    const uIntArr_Other = new Uint8Array(buf);
    let arrBuf=new ArrayBuffer(4)
    const dataView = new DataView(arrBuf); //  为了保证字节序正确
    let wordArray1 = CryptoJS.enc.Hex.parse(this.start4B )
    dataView.setInt32(0, wordArray1.words[0])
    let uIntArr_Start4B = new Uint8Array(arrBuf)
    let CK = uIntArr_Start4B[0]
    uIntArr_Start4B.forEach((byte, index) => {
      index !== 0 && (CK ^= byte)
    })
    uIntArr_Other.forEach((byte,index)=>{
      index !== 15&& (CK ^= byte)
    })
    return  CK
  }
}

module.exports=HandleDirective