const eptimes =  {
    //示例： utils.eptimes.formatTime(new Date(), 'YYYY-MM-dd HH:mm:ss')

    //参数value：支持 Date   时间戳（1554194681923）  '2019-03-31 10:00:00'

    //参数format：字符串
    //参数format入参及返回格式示例（部分示例）
    // utils.eptimes.outTime(1554194681923, 'YYYY/MM/dd')
    // utils.eptimes.outTime(new Date(), 'YYYY年MM月dd日')
    // utils.eptimes.outTime(new Date(), 'YYYY-MM-dd HH时mm分ss秒')
    // utils.eptimes.outTime(new Date(), 'HH时mm分ss秒')

    outTime(v, format) {
        if (typeof v == 'string') {
            v = v.replace(/-/g, '/');
        }
        let t = new Date(v);
        let s = format || 'yyyy-MM-dd HH:mm:ss';
        let [FY, Y, M, D] = [t.getFullYear(), t.getYear(), t.getMonth(), t.getDate()];
        let [H, m, S] = [t.getHours(), t.getMinutes(), t.getSeconds()];
        s = s.replace(/yyyy|YYYY/, FY);
        s = s.replace(/yy|YY/, (Y % 100) > 9 ? Y % 100 : '0' + (Y % 100));
        s = s.replace(/MM/, M + 1 > 9 ? M + 1 : '0' + (M + 1));
        s = s.replace(/M/g, M + 1);
        s = s.replace(/dd|DD/, D > 9 ? D : '0' + D);
        s = s.replace(/d|D/g, D);
        s = s.replace(/hh|HH/, H > 9 ? H : '0' + H);
        s = s.replace(/h|H/g, H);
        s = s.replace(/mm/, m > 9 ? m : '0' + m);
        s = s.replace(/m/g, m);
        s = s.replace(/ss|SS/, S > 9 ? S : '0' + S);
        s = s.replace(/s|S/g, S);
        return s;
    },
    //参数v      14位字符串20190203123523  或者8位20190203
    //参数type   默认为 strtime类型   表示字符串转Date////datestr 表示Date转字符串（20190403090710）
    //示例
    //utils.eptimes.formatTime('20190203123523')   输出Date类型
    //utils.eptimes.formatTime('20190203')         输出Date类型
    //utils.eptimes.formatTime(new Date(),'datestr')  输出20190403090710
    formatTime(v, type) {
        type = type || 'strtime'; //当前20190402170958转Date称为strtime
        if (type === 'strtime' && v.length === 14) {
            return new Date(v.substring(0, 4), v.substring(4, 6), v.substring(6, 8), v.substring(8, 10), v.substring(10, 12), v.substring(12, 14));
        } else if (type === 'strtime' && v.length === 8) {
            return new Date(v.substring(0, 4), v.substring(4, 6), v.substring(6, 8));
        } else if (type === 'datestr') {
            return this.outTime(v, 'YYYYMMddHHmmss');
        } else {
            return v;
        }
    },
    //参数inTime 入参为number类型时间差的毫秒值 如2235712
    //参数type 不传参数默认返回  年月日时分秒，参数值为hour时返回 小时
    diffTime(inTime, type) {
        if (typeof inTime !== 'number') { return inTime; }
        var s = '';
        var t = {};
        t.s = inTime;
        inTime = Math.floor(inTime / (1000 * 60));
        t.m = inTime % 60;
        inTime = Math.floor(inTime / 60);
        t.h = inTime % 24;
        inTime = Math.floor(inTime / 24);
        t.d = inTime % 30;
        inTime = Math.floor(inTime / 30);
        t.M = inTime % 12;
        inTime = Math.floor(inTime / 12);
        t.y = inTime;
        //console.log('t', t)
        if (type == "hour") {
            s = (t.s / (1000 * 60 * 60)).toFixed(1);
        } else {
            if (t.y) {
                s = (t.y ? t.y + "年" : "") + (t.M ? t.M + "月" : "00月") + (t.d ? t.d + "天" : "00天") + (t.h ? t.h + "时" : "00时") + (t.m ? t.m + "分" : "00分");
            } else if (t.M) {
                s = (t.M ? t.M + "月" : "00月") + (t.d ? t.d + "天" : "00天") + (t.h ? t.h + "时" : "00时") + (t.m ? t.m + "分" : "00分");
            } else if (t.d) {
                s = (t.d ? t.d + "天" : "00天") + (t.h ? t.h + "时" : "00时") + (t.m ? t.m + "分" : "00分");
            } else if (t.h) {
                s = (t.h ? t.h + "时" : "00时") + (t.m ? t.m + "分" : "00分");
            } else {
                s = t.m ? t.m + "分" : "00分";
            }
        }
        return s;
    },
    //获取本周的第一天和最后一天
    getDayOfWeek() {
        let date = new Date();
        // 本周一的日期
        date.setDate(date.getDate() - date.getDay() + 1);
        let begin = date.getFullYear() + "/" + (date.getMonth() + 1) + "/" + date.getDate() + " 00:00:00";

        // 本周日的日期
        date.setDate(date.getDate() + 6);
        let end = date.getFullYear() + "/" + (date.getMonth() + 1) + "/" + date.getDate() + " 23:59:59";
        return { begin, end };
    },
    //获取本月的第一天和最后一天
    getDayOfMonth() {
        let date = new Date(), year = date.getFullYear(), month = date.getMonth();
        let begin = new Date(year, month, 1);
        let end = new Date(year, month + 1, 0);
        begin = this.outTime(begin, 'yyyy/MM/dd') + ' 00:00:00';
        end = this.outTime(end, 'yyyy/MM/dd') + ' 23:59:59';
        return { begin, end };
    },
    /**
     * 根据 年份 和 季度  获取 季度 第一天 和 季度 最后 一天
     * @param year
     * @param quarter
     */
    getQuartorStartDate(year, quarter) {
        let startMonth = 1;
        if (quarter == 1) {
            startMonth = 1;
        } else if (quarter == 2) {
            startMonth = 4;
        } else if (quarter == 3) {
            startMonth = 7;
        } else if (quarter == 4) {
            startMonth = 10;
        }
        let endMonth = startMonth + 2;
        if (quarter == 0) {
            endMonth = 12
        }
        const begin = year + "/" + this.formatDate(startMonth) + '/01 00:00:00';
        const end = year + '/' + this.formatDate(endMonth) + '/' + new Date(year, endMonth, 0).getDate() + ' 23:59:59'
        return { begin, end }
    },
    //格式化月和日为MM、dd
    formatDate(value) {
        if ( typeof value !== 'number' ) {
            return Error('Invalid parameter')
        }
        return value < 10 ? '0' + value : value;
    }
}

export {
    eptimes
}