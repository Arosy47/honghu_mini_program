
import wxutil from "../../miniprogram_npm/@yyjeffrey/wxutil/index"
import { User } from "../../models/user"
import randomName from "../models/random-name"
import { uploadAvatar } from "../../utils/util"
import {cos} from "../../utils/util"

import util from '../../utils/util.js'

const app = getApp()

Page({
  data: {
    user: null,
    userId: -1,
    gender: 0,
    nickName: "1",
    anonymousName:"",
    anonymousAvatar:"",
    tmpAvatar:null,
    showImageClipper:false,
    home: [],
    customItem: '全部',

    defaultAvatar: "" 
  },

  onLoad() {
    
    this.setData({
      showInfoConfig:app.globalData.showInfoConfig
    })
  },

  onShow() {
    this.getUserInfo()
    if(this.data.user.homeCity){
      var home = this.data.home
      home.push(this.data.user.homeCity)
      home.push(this.data.user.homeProvince)
      this.setData({
        home:home
      })
    }
  },

  async getUserInfo() {
    const user = app.globalData.userInfo
    this.setData({
      user: user,
      userId: user.userId,
      nickName: user.nickName,
      anonymousName:user.anonymousName,
      anonymousAvatar:user.anonymousAvatar,
      gender: user.gender,
      motto:user.motto
    })
  },

  changeAnonymousName() {

    if(util.isForbidden()){
      return
    }

    var timestamp = wx.getStorageSync('changeAnonymousNameTimeStamp')
    var times = wx.getStorageSync('changeAnonymousNameTimes')

    if(timestamp){

      if(Date.now()-Number(timestamp) > 86400000){
        wx.setStorageSync('changeAnonymousNameTimeStamp', Date.now())
        times=0
        wx.setStorageSync('changeAnonymousNameTimes', 0)
      }else{
        if(times!=null){
          
          wx.setStorageSync('changeAnonymousNameTimes', Number(times)+1)
        }else{
          times=0
          wx.setStorageSync('changeAnonymousNameTimes', 0)
        }
      }
    }else{
      wx.setStorageSync('changeAnonymousNameTimeStamp', Date.now())
      if(times==null){
        times=0
        wx.setStorageSync('changeAnonymousNameTimes', 0)
      }
    }

    if(times>=5){
      wx.showToast({
        title: '一天最多修改五次',
        icon: 'error' 
      })
      return
    }

    const anonymousName = randomName.getNickName()

    let anonymousAvatarUrl = randomName.getAnonymousAvatarUrl()
    while(this.data.anonymousAvatar?.url && anonymousAvatarUrl == this.data.anonymousAvatar?.url){
      anonymousAvatarUrl=randomName.getAnonymousAvatarUrl()
    }
    
    let anonymousAvatar = {
      url:anonymousAvatarUrl
    }
    this.setData({
      anonymousName:anonymousName,
      anonymousAvatar:anonymousAvatar
    })
    
    const that = this
    
    if(this.timerId){
      
      clearTimeout(this.timerId);
    }
    this.timerId=setTimeout(async() => {
      
      const data = {
        anonymousName: anonymousName,
        anonymousAvatar: anonymousAvatar
      }
      await that.updateUserInfo(data)
    }, 2000);
  },

  edit(e) {
    
    wx.navigateTo({
      url: "/page-profile/user-edit/edit/index?operation=" + e.currentTarget.dataset.operate
    })
  },

  certifacate(){
    
    wx.navigateTo({
      url: "/page-certification/certification/step1/index"
    })
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

  changeAvatar(event) {
    if(util.isForbidden()){
      return
    }
    wx.chooseMedia({
      count: 1,
      mediaType:['image'],
      
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        
        const tempFilePath = res.tempFiles[0].tempFilePath;

        uploadAvatar(tempFilePath, this.updateAvatar)
      }
    });

  },

  async updateAvatar(data) {
    if(util.isForbidden()){
      return
    }
    var location = data.Location;
    const params = {
      avatar: {"url":location,"key":data.Key},
    }

    var oldAvatarKey=app.globalData.userInfo.avatar?.key
    
    await this.updateUserInfo(params);
    this.setData({
      showImageClipper: false
    })

    if(oldAvatarKey){

    }
  },

   deleteCosAvatar(avatarKey){
    if(avatarKey == null || avatarKey==""){
      
      return
    }
    cos.deleteObject({
      Bucket: 'campus-alliance-1316743522',
      Region: 'ap-shanghai',
      Key: avatarKey,  
    }, function(err, data) {
        
    });
  },

  bindRegionChange: function (e) {
    if(util.isForbidden()){
      return
    }

    const home = e.detail.value
    this.setData({
      home: home
    })

    const data = {
      homeCity: home[0],
      homeProvince:home[1]
    }
    this.updateUserInfo(data)
  },

  bindBirthdayChange: function (e) {
    if(util.isForbidden()){
      return
    }

    const birthday = e.detail.value
    this.setData({
      birthday: birthday
    })

    const data = {
      birthday: birthday,
    }
    this.updateUserInfo(data)
  },

  async updateUserInfo(data) {

    const res = await User.updateUser(data)
    
    if (res&&res!="illegal") {

      let userInfo=res
      
      wx.setStorageSync('userInfo', userInfo)
      app.globalData.userInfo =userInfo

      this.setData({
        user: userInfo,
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
  },

  chooseStrollSchool(e) {
    wx.navigateTo({
      url: "/page-school/choose-school/index?chooseSchoolType:chooseStrollSchool"
    })
  },
})
