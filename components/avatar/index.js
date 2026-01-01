

import util from '../../utils/util.js'

Component({
  options: {
    styleIsolation: 'apply-shared'
  },
  externalClasses: ["avatar-class"],
  properties: {
    src: {
      type: String,

      value: "" 
    },
    size: {
      type: Number,
      value: 60
    },
    userId: {
      type: Number,
      value: -1
    },
    
    anonymous: {
      type: Boolean,
      value: false
    },
    
    isLink: {
      type: Boolean,
      value: true
    },
    circle:{
      type: Boolean,
      value: true
    },

    gray:{
      type: Boolean,
      value: false
    },

    showMask:{
      type: Boolean,
      value: false
    },

    chatting:{
      type: Boolean,
      value:false
    },

    avatarUrl:{
      type: String,
      value:''
    },

    admin:{
      type: Boolean,
      value:false
    },

    blueV:{
      type: Boolean,
      value: false
    }
  },
  data: {

  },

  observers: {
    src: function(src) {
      if (src) {

        let cosParam = "!article_small"
        this.setData({
          
          avatarUrl: 'https://' + this.data.src+cosParam
        })
      }
    },

    anonymous: function(anonymous) {
      
      if (anonymous) {
        
        let cosParam = "!article_small"
        this.setData({
          
          avatarUrl: 'https://' + this.data.src+cosParam
        })
      }
    }
  },

  methods: {
    onAvatarTap: util.throttle(function (e) {

      if(util.isForbidden()){
        return
      }

      const url= "/page-profile/visiting-card/index?userId=" + this.data.userId + "&chatting="+this.data.chatting

      wx.navigateTo({
        url: url
      })

    }, 1000),

    doNothing(){

    }
  }
})
