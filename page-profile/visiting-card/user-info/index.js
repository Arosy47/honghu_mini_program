
Page({

  data: {
    home: [],
    user:null
  },

  onLoad(options) {
    const userInfo = JSON.parse(options.userInfo)
    this.setData({
      user:userInfo
    })

    if(userInfo.homeCity){
      
      var home = this.data.home
      home.push(userInfo.homeCity)
      home.push(userInfo.homeProvince)
      this.setData({
        home:home
      })
    }
  },

  onReady() {

  },

  onShow() {

  },

  onHide() {

  },

  onUnload() {

  },

  onPullDownRefresh() {

  },

  onReachBottom() {

  },

  copyId(value){
    
    wx.setClipboardData({
      data: value.currentTarget.dataset.userId+"",
      success(res){
        wx.showToast({
          title: '内容已复制',
          icon:'none'
        })

      },
      fail(e){
        
      }
    })
  },
})