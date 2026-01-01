const app = getApp();
Component({
  
  options: {
    addGlobalClass: true,
    multipleSlots: true
  },
  
  properties: {
    bgColor: {
      type: String,
      default: ''
    }, 
    isCustom: {
      type: [Boolean, String],
      default: false
    },
    isBack: {
      type: [Boolean, String],
      default: false
    },
    bgImage: {
      type: String,
      default: ''
    },
    customBack: {
      type: [Boolean, String],
      default: false
    },
  },
  
  data: {
    StatusBar: app.globalData.StatusBar,
    CustomBar: app.globalData.CustomBar,
    Custom: app.globalData.Custom
  },
  
  methods: {
    BackPage() {
      if (this.properties.customBack) {
        this.triggerEvent('back')
        return
      }
      wx.navigateBack({
        delta: 1
      });
    },
    toHome(){
      wx.reLaunch({
        url: '/pages/topic/index',
      })
    }
  }
})