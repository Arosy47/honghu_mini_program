

const app=getApp()
Component({
  options: {
    styleIsolation: 'apply-shared'
  },
  properties: {
   
    user: Object,
    
    defaultPoster: {
      type: String,
      
      value:''
    },
    
    defaultAvatar: {
      type: String,
      
      value:''
    },
    
    defaultNickname: {
      type: String,
      value: "微信用户"
    },
    
    defaultSignature: {
      type: String,
      value: "这家伙选择躺平，什么都没有留下"
    },
    
    isOwner: {
      type: Boolean,
      value: true
    },
    isSelf: {
      type: Boolean,
      value: false
    },
    certification: {
      type: Boolean,
      value: false
    },
    visit: {
      type: Boolean,
      value: false
    },
    scrollTop: {
      type: Number,
      value: 0
    },

    admin:{
      type: Boolean,
      value:false
    },

    isMf:{
      type: Boolean,
      value:false
    }
  },
  data: {
    selfUser:app.globalData.userInfo
  },

  observers: {
    user: function(user) {
      if (user) {

        this.setData({
          avatarUrl:'https://' + user.avatar.url,
          selfUser:app.globalData.userInfo, 
        })
      }
    }
  },

  methods: {
    
    onPosterTap() {
      this.triggerEvent("posterTap")
    },

    onChooseAvatarTap(event) {
      this.triggerEvent("chooseAvatarTap", event)
    },

    onFollowTap() {
      this.triggerEvent("followTap")
    },

    gotoChatRoom() {
      const user = this.properties.user
      if (user === null) {
        return
      }

      this.triggerEvent("gotoChatRoom")

    },

    moreAction(){
      const user = this.properties.user
      if (user === null) {
        return
      }
      this.triggerEvent("moreAction")
    },

    lookUserInfo(){
      const user = this.properties.user
      if (user === null) {
        return
      }

      this.triggerEvent("lookUserInfo")
    },

    previewImage(event) {
       
      app.globalData.preImgStatus=true  

      const url = 'https://' + this.data.user.avatar.url + "!article_big"
      wx.previewImage({
        current: url,
        urls: [url]
      })
    },

    gotoLogin() {

      this.triggerEvent("userLogin")
    },

    gotoCertification() {
      wx.navigateTo({
        url: "/page-certification/certification/step1/index"
      })
    },

    gotoUserEdit() {
      wx.navigateTo({
        url: "/page-profile/user-edit/index"
      })
    },

    chooseStrollSchool(){
      wx.showToast({
        title: '敬请期待',
        icon: 'none'
      })
    },

    getGenderText() {
      const gender = this.data.user.gender
      if (gender === 1) {
        return "他"
      }
      else if (gender === 2) {
        return "她"
      }
      return "Ta"
    },

    banUser(){
      this.triggerEvent("banUser")
    },
    
    unbanUser(){
      this.triggerEvent("unbanUser")
    },

    blackUser(){
      this.triggerEvent("blackUser")
    },
    
    unblackUser(){
      this.triggerEvent("unblackUser")
    }

  }
})
