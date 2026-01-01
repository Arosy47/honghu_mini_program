

import { User } from "../../models/user"
import { Topic } from "../../models/topic"

import util from '../../utils/util.js'

const app = getApp()

Page({
  interval:null,
  data: {
    user: null,
    topics: [],
    comments: [],
    stars: [],
    tabIndex: 0,  
    
    showImageClipper: false, 
    messageBrief: null, 
    tmpAvatar: "", 
    topicPaging: null,  
    commentPaging: null,  
    starPaging: null, 
    hasMoreTopic: true, 
    hasMoreComment: true, 
    hasMoreStar: true, 
    
    loading: false,
    userCode: '',

    otherInfo:{articleCount:0,commentCount:0,collectCount:0},

    active: 0,
    icon: {
      normal: 'https://img.yzcdn.cn/vant/user-inactive.png',
      active: 'https://img.yzcdn.cn/vant/user-active.png',
    },
    showInfoConfig:null,
    
  },

  onLoad() {

    app.globalData.loginPromise.then(()=>{

      this.setData({
        navHeight: app.globalData.navHeight,
        navTop: app.globalData.navTop,
        windowHeight: app.globalData.windowHeight,  

      })
    })
  },

  getStrollSchool(){
    if(app.globalData.userInfo.strollSchoolId){

      let strollSchool = wx.getStorageSync("stroll_school")

      if(!strollSchool){
        this.queryStrollSchool()
      }else{
        if(strollSchool.id && strollSchool.id==app.globalData.userInfo.strollSchoolId){
          
          this.setData({
            strollSchool:strollSchool, 
          })
          app.globalData.strollSchool=strollSchool
        }else{
          wx.removeStorageSync("stroll_school")
          this.queryStrollSchool()
        }
      }
    }else{
      
      this.gotoChooseStrollSchool()
    }
  },

  async queryStrollSchool(){
   this.setData({
        strollSchool:1, 
      })
      app.globalData.strollSchool = 1
      
      wx.setStorage({
        key:'stroll_school',
        data:1,
      });
  },
  
  onShow() {

    app.globalData.loginPromise.then(()=>{
      
      const userInfo = app.globalData.userInfo  
      if(wx.getStorageSync('userToken')){
        this.setData({
          user:userInfo,
          showInfoConfig:app.globalData.showInfoConfig
        })

        if(app.globalData.strollSchool && app.globalData.strollSchool.id==app.globalData.userInfo.strollSchoolId){
          this.setData({
            strollSchool:app.globalData.strollSchool
          })
        }else{
          this.getStrollSchool()
        }

        this.getUserInfo()
        this.getUserOtherInfo();
        this.updateUnreadCount();

      }else{
        this.setData({
          showInfoConfig:app.globalData.showInfoConfig
        })
      }
    })
  },

  updateUnreadCount(){
    const msgNum = app.globalData.sixinNum+app.globalData.systemNoticeNum+app.globalData.thumbUpAndCollectNum+app.globalData.commentNum+app.globalData.organizationNum+app.globalData.deliveryNum
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

  gotoLogin(){
    
    wx.showLoading({
      title: '登陆中',
      mask: true
    })
    app.getUserInfoOrLogin()
    
    this.interval= setInterval(() => {
      if(app.globalData.userInfo){

        if(wx.getStorageSync('userToken')){
          this.setData({
            user: app.globalData.userInfo,
          })
        }else{
          this.setData({
          })
        }

        wx.hideLoading()
        clearInterval(this.interval)
      }
    }, 800);
    
    setTimeout(() => {

    }, 5000); 
    
  },

  async gotoCertificate() {
    wx.navigateTo({
      url: "/page-certification/certification/step1/index",
    })
  },

  async getUserOtherInfo() {
    const params = {
      targetUserId: app.globalData.userId
    }
    const res = await Topic.getUserOtherInfo(params)
    if(res) {
      this.setData({
        otherInfo: res
      })
    }
    
  },

  async changePoster() {

  },
  async getUserInfo() {
    const userInfo = await User.getUserInfo(app.globalData.userId)
    if(userInfo){
      
      app.globalData.userInfo = userInfo

      wx.setStorageSync('userInfo', userInfo)

      this.setData({
        user: userInfo,
      })
    }else{
      wx.showToast({
        title: '获取信息失败',
        icon:'error'
      })
    }
    
  },

  checkSchoolSelect(data) {
    if (data.data.data.schoolId < 0) {
      wx.navigateTo({
        url: "/page-school/choose-school/index"
      })
    }
  },

  bindArticle: async function (e) {
    wx.navigateTo({
      url: '/page-profile/profile-article/index?type=1'
    })
  },

  bindCollect: async function (e) {
    wx.navigateTo({
      url: '/page-profile/profile-article/index?type=2'
    })
  },

  bindComment: async function (e) {
    wx.navigateTo({
      url: '/page-profile/profile-comment/index'
    })
  },

  openSetting() {
    wx.openSetting({})
  },

  clearStorage() {
    const that = this
    wx.showModal({
      title: '提示',
      content: '确定要清除所有缓存？',
      complete: (res) => {
        
        if (res.confirm) {
          app.globalData.userInfo = null
          wx.clearStorage({
            success:function(res) {
              wx.showToast({
                title: '成功清理缓存',
              })

              app.onLaunch()
            },
          })
        }
      }
    })
  },

  societyRule() {
    
    wx.navigateTo({
      url: "/page-profile/community-norms/index"
    })
  },

  onPullDownRefresh() {

    this.getUserOtherInfo()

    wx.stopPullDownRefresh()
    wx.vibrateShort()
  },

  onShareAppMessage(options) {
    return {
      title: "红狐生态圈",
      path: "/pages/topic/index?&shareUserId="+this.data.user.userId,
    }

  },

})