// components/PopPicker/index.js
Component({
    externalClasses: ['ui-pop-picker'],
    /**
     * 组件的属性列表
     */
    properties: {
        initData: {
            type: String,
            value: '',
            observer: function(newVal) {
                this.setFieldName();
            }
        },
        placeholder: {
            type: String,
            value: ''
        },
        columns: {
            type: Array,
            value: [],
            observer: function(newVal) {
                let { id, name } = this.data.options;
                let arr = newVal.map(item => {
                    return {
                        id: item[id],
                        text: item[name]
                    }
                })
                this.setData({
                    dataArr: arr
                })
                this.setFieldName();
            }
        },
        options: {
            type: Array,
            optionalTypes: [Array, Object],
            value: []
        },
        readonly: {
            type: Boolean,
            value: false
        },
        clearable: {
            type: Boolean,
            value: false
        }
    },
    options: {
        styleIsolation: 'shared'
    },
    /**
     * 组件的初始数据
     */
    data: {
        myTitle: '',
        myValue: '',
        popShow: false,
        currentItem: {},
        dataArr: []
    },
    /**
     * 组件的方法列表
     */
    methods: {
        handleClick: function() {
            if (this.data.readonly) {
                return;
            } else {
                this.setData({
                    popShow: true
                });
            }
        },
        handleClose: function() {
            this.setData({
                popShow: false
            });
        },
        handleClear() {
            this.setData({
                myValue: ''
            })
            this.triggerEvent('setValue', '');
        },
        onConfirm(e) {
            const { value } = e.detail;
            this.setData({
                myValue: value.text,
                popShow: false
            })
            this.triggerEvent('setValue', value.id);
        },
        onCancel() {

        },
        setFieldName() {
            if (this.data.initData !== '') {
                let obj = this.data.dataArr.find(item => item.id == this.data.initData);
                if (obj) {
                    this.setData({
                        myValue: obj.text
                    })
                }
            }
        },
        async initData() {
            const { columns, options } = this.data;
            if (Object.keys(options).length > 0 && columns.length > 0) {
                let { id, name } = options;
                let arr = columns.map(item => {
                    return {
                        id: item[id],
                        text: item[name]
                    }
                })
                this.setData({
                    dataArr: arr
                })
                this.setFieldName();
            }
        }
    },
    lifetimes: {
        ready() {
            this.initData();
        }
    }
})
