
import util from '../../utils/util.js'
const app = getApp()
Component({
  properties: {
    chat: Object,
    
    isOwner: {
      type: Boolean,
      value: false
    },
    fromUserName: {
      type: String,
      value: ""
    },
    avatar: {
      type: String,
      value: ""
    },
    imgUrl: {
      type: String,
      value: ""
    },
    reverse: {
      type: Boolean,
      value: false
    },
    anonymous:{
      type: Boolean,
      value: false
    },
    
    blueV:{
      type: Boolean,
      value: false
    }
  },
  data: {
    imgHeight:0,
    imgWidth:0,
    imageMode:"widthFix",

    richContent:[],
    createTime: '',

    matchcard:null,
  },

  observers: {
    chat: function(chat) {
      if (chat) {
        if (chat.type === "IMAGE" && chat.content!=null&&chat.content.length>0) {
          
          var content = JSON.parse(chat.content)
          let cosParam = "!article_medium"
          this.setData({
            imgUrl: 'https://' + content.url +cosParam,
            imageMode:content.imageMode,
            imgHeight : content.height,
            imgWidth : content.width,
          })
        }else if(chat.type === "TEXT" && chat.content!=null&&chat.content.length>0){
          this.setData({
            richContent:util.replaceTextWithEmoji(chat.content,"25px")
          })
        }else if(chat.type === "MATCH_CARD"){
          
          this.setData({
            matchcard:JSON.parse(chat.content)
          })
        }
        
        if (chat.createTime) {
          this.setData({
            createTime: chat.createTime
          })
        }
      }
    }
  },

  methods: {
    
    previewImage(event) {
       
      app.globalData.preImgStatus=true  

      var imgUrl = this.properties.imgUrl.split("!")[0]+"!article_big"
      
      wx.previewImage({
        current: imgUrl,
        urls: [imgUrl]
      })
    },

    copy(value){
      
      wx.setClipboardData({
        data: value.currentTarget.dataset.content+"",
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

    gotoCardDetail(){
      wx.navigateTo({
        url: '/page-makefriend/card-detail/index?cardId='+this.data.matchcard.id,
        fail(e){
          
        }
      })
    }

  }
})
