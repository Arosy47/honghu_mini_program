

const app = getApp()
Page({

  data: {
    shareUserId:null,
  },

  onLoad(options) {
    if(options.shareUserId){
      this.setData({
        shareUserId:options.shareUserId
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

  onShareAppMessage() {
    
    return {
      title: "红狐生态圈-社区规范",
      path: "/page-profile/community-norms/index?shareUserId="+app.globalData.userInfo.userId
    }
  },

  back(){
    if (this.data.shareUserId){
    
      wx.switchTab({
        url: '/pages/topic/index',
      })
    } else {
    
      wx.navigateBack({
        delta: 1,
      });
    }
  }
})