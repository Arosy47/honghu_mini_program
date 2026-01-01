
const app = getApp()

Component({
  externalClasses: ["nickname-class"],
  properties: {
    nickname: String,
    size: {
      type: Number,
      value: 28
    },
    length:{
      type: Number,
      value: 15
    },
    userId: {
      type: Number,
      value: -1
    },
    
    isLink: {
      type: Boolean,
      value: true
    },
    isAnon:{
      type: Boolean,
      value: false
    },
    
    blueV:{
      type: Boolean,
      value: false
    }
  },
  data: {

  },
  lifetimes: {
    attached	: function() {

      if(this.data.nickname){
        let originNickname=this.data.nickname

        if(originNickname.length > this.data.length){
          this.setData({
            nickname:originNickname.substring(0,this.data.length)+"..."
          })
        }
        
      }
    }
  },
  
  methods: {
    
    onNicknameTap() {
      
      if (app.globalData.userInfo) {

        wx.navigateTo({
          url: "/page-profile/visiting-card/index?userId=" + this.data.userId
        })

      } else {
        wx.navigateTo({
          url: "/page-certification/certification/step1/index"
        })
      }
    }
  }
})
