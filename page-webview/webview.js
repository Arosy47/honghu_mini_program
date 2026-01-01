
const app = getApp()
Page({

  data: {
    adId: null,
    adKeyword: '',
    adData: null
  },

  onLoad(options) {

    if(options.mode=='ad'){
      this.setData({
        mode:options.mode, 
        title:options.title,
        adId:options.adId,
      })
    }else if (options.mode='image'){
      this.setData({
        mode:options.mode, 
        title:options.title,
        imgUrl:options.imgUrl+'!article_medium',
      })
    }
  },

  onShareAppMessage() {

  },

  preview(event){
    app.globalData.preImgStatus=true  
    wx.previewImage({
      current: event.currentTarget.dataset.src,
      urls: [event.currentTarget.dataset.src]
    })
  }

})