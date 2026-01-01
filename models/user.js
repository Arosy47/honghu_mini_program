import api from "../config/api"
import wxutil from "../miniprogram_npm/@yyjeffrey/wxutil/index"

import { Paging } from "../utils/paging"

class User {

  static async certificatePhone(data) {
    var res;
    try{
      var result = await wxutil.request.get(api.certificatePhoneAPI, data)
      if (result.statusCode === 200) {
        res = result.data  
      }else{
        res=null
      }
    }catch(err){
      res=null
    }
    return res
  }
   
  static async certificate(data) {
    var res;
    try{
      var result = await wxutil.request.post(api.authenticateAPI, data)
      if (result.statusCode === 200) {
        res = "success"
      }else{
        res=null
      }
    }catch(err){
      res=null
    }
    return res
  }

  static async createSession(data) {
    var res;
    try{
      var result = await wxutil.request.get(api.createSessionAPI, data)
      if (result.statusCode === 200) {
        res = result.data
      }else{
        res=null
      }
    }catch(err){
      res=null
    }
    return res
  }

  static async createMatchChatSession(data) {
    var res;
    try{
      var result = await wxutil.request.get(api.createRandomChatSessionAPI, data)
      if (result.statusCode === 200) {
        res = result.data
      }else{
        res=null
      }
    }catch(err){
      res=null
    }
    return res
  }

  static async getUserInfo(userId) {

    var res;
    try{

      var result = await wxutil.request.get(api.userInfoAPI,{"targetUserId": userId})
      if (result.statusCode === 200) {
        res = result.data
      }else{
        res=null
      }
    }catch(err){
      res=null
    }
    return res

  }

  static async aboutShareAddScore(data) {

    var res;
    try{
      var result = await wxutil.request.get(api.aboutShareAddScoreAPI, data)
      if (result.statusCode === 200) {
        res = result.data
      }else{
        res=null
      }
    }catch(err){
      res=null
    }
    return res
  }

  static async shareAddScore() {

    var res;
    try{
      var result = await wxutil.request.get(api.shareAddScoreAPI)
      if (result.statusCode === 200) {
        res = result.data
      }else{
        res=null
      }
    }catch(err){
      res=null
    }
    return res
  }

  static async updateUser(data) {

    var res;
    try{
      var result = await wxutil.request.post(api.userChangeAPI, data)
      if (result.statusCode === 200) {
        res = result.data
      }else{
        if(result.data?.errMsg=="内容违规"){
          res="illegal"
        }else{
          res=null
        }
      }
    }catch(err){
      res=null
    }
    return res
  }

  static async privacySetting(data) {

    var res;
    try{
      var result = await wxutil.request.post(api.privacySettingAPI, data)
      if (result.statusCode === 200) {
        res = result.data
      }else{
        res=null
      }
    }catch(err){
      res=null
    }
    return res
  }

  static async uploadPoster(fileKey, filePath) {
    const res = await wxutil.file.upload({
      url: api.userAPI + "poster/",
      fileKey: fileKey,
      filePath: filePath
    })
    return JSON.parse(res.data)
  }

  static async getScoreRecords(param) {

    return new Paging(api.scoreRecordAPI, param)
    
  }

  static async updateLocationInfo(data) {
    return null
  }

  static async getWalletAmount() {
    var res;
    try{
      var result = await wxutil.request.get(api.queryWalletAmountAPI)
      if (result.statusCode === 200) {
        res = result.data
      }else{
        res='error'
      }
    }catch(err){
      res='error'
    }
    return res

  }

  static async initWalletRecords(param) {

    return new Paging(api.pageQueryWalletRecords, param, 1, 25)
    
  }

  static async withdraw(data) {
    var res;
    try{
      var result = await wxutil.request.get(api.withdrawAPI, data)
      
      if (result.statusCode === 200) {
        res = result.data
      }else{
        if(result.data?.errMsg){
          if(result.data?.errMsg=='操作太频繁'){
            wx.showModal({
              title: '操作太频繁',
              content: '请30秒后再试',
              showCancel:false,
            })
          }else{
            wx.showToast({
              title: result.data?.errMsg,
              icon:'none'
            })
          }
        }
        res=null
      }
    }catch(err){
      wx.showToast({
        title: '请重试',
        icon:'none'
      })
      res=null
    }
    return res
  }

  static async unfreeze(data) {
    var res;
    try{
      var result = await wxutil.request.get(api.unfreezeAPI, data)
      
      if (result.statusCode === 200) {
        res = "success"
      }else{

        res=null
      }
    }catch(err){

      res=null
    }
    return res
  }

  static async banUser(param){
    var res;
    try{
      var result = await wxutil.request.get(api.banUserAPI, param)
      
      if (result.statusCode === 200) {
        res = "success"
      }else{
        res=null
      }
    }catch(err){
      res=null
    }
    return res
    
  }
  
  static async unbanUser(param){
    var res;
    try{
      var result = await wxutil.request.get(api.unbanUserAPI, param)
      if (result.statusCode === 200) {
        res = "success"
      }else{
        res=null
      }
    }catch(err){
      res=null
    }
    return res
  }

  static async blackUser(param){
    var res;
    try{
      var result = await wxutil.request.get(api.blackUserAPI, param)
      
      if (result.statusCode === 200) {
        res = "success"
      }else{
        res=null
      }
    }catch(err){
      res=null
    }
    return res
    
  }
  
  static async unblackUser(param){
    var res;
    try{
      var result = await wxutil.request.get(api.unblackUserAPI, param)
      if (result.statusCode === 200) {
        res = "success"
      }else{
        res=null
      }
    }catch(err){
      res=null
    }
    return res
  }

  static async blackUser(param){
    var res;
    try{
      var result = await wxutil.request.get(api.blackUserAPI, param)
      
      if (result.statusCode === 200) {
        res = "success"
      }else{
        res=null
      }
    }catch(err){
      res=null
    }
    return res
    
  }
  
  static async isBlacked(param){
    var res;
    try{
      var result = await wxutil.request.get(api.isBlackedAPI, param)
      if (result.statusCode === 200) {
        res = result.data
      }else{
        res='error'
      }
    }catch(err){
      res='error'
    }
    return res
  }

  static async getUserPaging(params) {
    return new Paging(api.userPageingAPI, params, 1, 26)   
  }
  
}

export {
  User
}
