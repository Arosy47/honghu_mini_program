

import util from '../../utils/util.js'
const app = getApp()

Page({
  data: {
    
  },

  onLoad() {
    
  },

  onShow() {
    this.updateUnreadCount()
   
  },
  updateUnreadCount(){
    const msgNum = app.globalData.sixinNum+app.globalData.systemNoticeNum+app.globalData.thumbUpAndCollectNum+app.globalData.commentNum
    if(msgNum==0){
      wx.removeTabBarBadge({
        index: 3,
      })
    }else{
      if(msgNum>99){
        wx.setTabBarBadge({
          index: 3,
          text: '99+'
        })
      }else{
        wx.setTabBarBadge({
          index: 3,
          text: msgNum+''
        })
      }
    }
  },

  goTopicEdit(){
    if(this.validateCertificate()==true){
      let url = "/page-topic/topic-edit/index?fromPublishPage=true"
      wx.navigateTo({
        url: url
      })
    }
  },

  validateCertificate(){

    return true
    
  }

})
