
import { User } from "../../../models/user"
import wxutil from "../../../miniprogram_npm/@yyjeffrey/wxutil/index"
const app = getApp()

import util from '../../../utils/util.js'
Page({

  data: {
    nickName:null,
    
    user:null,
    hiddenArticle:true,
    hiddenCollect:true,
  },

  onLoad(e) {
    
    const user = app.globalData.userInfo
    this.setData({
      user:user
    })

    this.setData({
      operation:e.operation
    })

    this.getUserInfo()
  },

  async getUserInfo() {
    const user = app.globalData.userInfo
    if(this.data.operation == 'editPrivacy'){
      this.setData({
        user: user,
        nickName: user.nickName,
        anonymousName:user.anonymousName,
        gender: user.gender,
        motto:user.motto,
        hiddenArticle:user.hiddenArticle==true?true:false,
        hiddenCollect:user.hiddenCollect==true?true:false
      })
    }else{
      this.setData({
        user: user,
        nickName: user.nickName,
        anonymousName:user.anonymousName,
        gender: user.gender,
       
        motto:user.motto
      })
    }

  },

  onReady() {

  },

  onShow() {

  },

  setNickName(event) {
    
    this.setData({
      nickName: event.detail.value
    })
  },

  setMotto(event) {
    this.setData({
      motto: event.detail.value
    })
  },

  saveNickName(){
    
    if (!wxutil.isNotNull(this.data.nickName)) {
      wx.showToast({
        title: '昵称不能为空！',
        icon: 'error'
      })
      return
    }
    
    const data = {
      nickName: this.data.nickName,
    }
    this.updateUserInfo(data)
  },

  saveMotto(){
    
    const data = {
      motto: this.data.motto,
    }
    this.updateUserInfo(data)
  },

  updateUserInfo:util.throttle(async function (data){

    const res = await User.updateUser(data)
    
    if (res&&res!="illegal") {

      let userInfo=res
      wx.setStorageSync('userInfo', userInfo)
      app.globalData.userInfo =userInfo
      this.setData({
        user: userInfo,
      })
      
      wx.showToast({
        title: '更新成功',
        icon:'success',
      })
    }else {
      if(res=="illegal"){
        wx.showToast({
          title: '内容违规',
          icon:'none'
        })
      }else{
        wx.showToast({
          title: '更新失败',
          icon:"error"
        })
      }
    }
  },1500),

  onChangeGenderTap(event) {

    if(this.data.user?.gender!=2){

      return
    }

    wx.showModal({
      title: '性别一旦确认不能修改哦',
      content: '',
      complete: (res) => {
        if (res.cancel) {
        }
    
        if (res.confirm) {
          const data = {
            gender: event.currentTarget.dataset.gender,
          }
          this.updateUserInfo(data)
        }
      }
    })

  },

  onChangeShowCollect(event){

    const data = {
      hiddenArticle:this.data.hiddenArticle,
      hiddenCollect:!event.detail.value
    }
    this.privacySetting(data)
  },

  onChangeShowArticle(event){

    const data = {
      hiddenArticle:!event.detail.value,
      hiddenCollect:this.data.hiddenCollect
    }
    this.privacySetting(data)
  },

  async privacySetting(data) {

    const res = await User.privacySetting(data)
    
    if (res) {

      let userInfo=res
      wx.setStorageSync('userInfo', userInfo)
      app.globalData.userInfo =userInfo

      this.setData({
        user: userInfo,
        hiddenArticle:userInfo.hiddenArticle==true?true:false,
        hiddenCollect:userInfo.hiddenCollect==true?true:false
      })
      
    } else {
      wx.showToast({
        title: '更新失败！',
        icon:'error',
        duration: 3000
      })
    }
  },

  async certificatePhone (e) {

    if(e.detail.errno){
      return
    }

    this.setData({
      phoneLoading:true
    })
    const data={
      code:e.detail.code
    }
    const res = await User.certificatePhone(data)
    
    if(res){
      app.globalData.userInfo.phone=res
      
      this.setData({
        [`user.phone`]:res,
        phoneLoading:false
      })

      var userInfo=wx.getStorageSync('userInfo')
      userInfo.phone=res
      wx.setStorageSync('userInfo', userInfo)
    }else{
      wx.showToast({
        title: '网络异常',
        icon:"none"
      })
      this.setData({
        phoneLoading:false
      })
    }

  },
})