// components/FormItem/index.js
Component({
    properties: {
      border:{
        type:Boolean,
        value:true,
        observer(newVal, oldVal, changedPath) {
          
        }
      },
      arrow:{
        type:Boolean,
        value:false
      },
      label:{
        type:String,
        value:''
      }
    },
    options: {
      multipleSlots: true
    },
    data:{
      active:false,
    },
    methods:{
      formItemClick(){
        this.triggerEvent('formItemClick')
      },
      formItemStart(){
        this.setData({ active: true });
      },
      formItemEnd(){
        this.setData({ active: false });
      }
    }
  })
  
