import api from "../config/api"
import wxutil from "../miniprogram_npm/@yyjeffrey/wxutil/index"
import { Paging } from "../utils/paging"

class Notification {
  
  static async getNotificationPaging(params) {
    return new Paging(api.notificationAPI, params,1,25)
  }

  static async getViolationNotifications(params) {
    return new Paging(api.violationNotificationsAPI, params)
  }

  static async getSysNotificationPaging() {
    return new Paging(api.sysNotificationsAPI)
  }

  static async updateAlreadyReadViolationNotification(params) {
    var res;
    try{
      var result = await wxutil.request.get(api.updateAlreadyReadViolationNotificationAPI, params)
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

  static async getSixinSessionPaging(params) {
    return new Paging(api.chatSessionListAPI, params,1,30)
  }

  static async getMatchChatUnreadCount(){
    var res;
    try{
      var result = await wxutil.request.get(api.getMatchChatUnreadCountApi)
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

  static async getUnreadCount(params) {

    let header = {
      'content-type': 'application/json',
      'authorization': wx.getStorageSync('userToken')
    }

    var res;
    try{
      var result = await new Promise((resolve, reject) => {
        wx.request({
          url: api.getUnreadCountAPI,
          data: params,
          method:'get',
          header: header,
          success (res) {
            
            resolve(res.data)
          },
          
          fail (err) {
            reject(err)
          }
        })
      })

      if (result.statusCode === 200) {
        res= result.data
      }else{
        res=null
      }
    }catch(err){
      
      res=null
    }
    return res;
  }

  static async getNewSystemNotice(){
    var res;
    try{
      var result = await wxutil.request.get(api.getNewestSystemNoticeApi)
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

  static async getTopicUserPaging(params) {
    return new Paging(api.userTopicApi, params)
  }

  static async deleteSession(params) {
    var res;
    try{
      var result = await wxutil.request.get(api.deleteSessionApi, params)
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

  static async getSubscribeTimes() {

    let header = {
      'content-type': 'application/json',
      'authorization': wx.getStorageSync('userToken')
    }

    var res;
    try{
      var result = await new Promise((resolve, reject) => {
        wx.request({
          url: api.getSubscribeTimesAPI,
          method:'get',
          header: header,
          success (res) {
            
            resolve(res.data)
          },
          
          fail (err) {
            reject(err)
          }
        })
      })
      
      if (result.statusCode === 200) {
        res= result.data
      }else{
        res=null
      }
    }catch(err){
      
      res=null
    }
    return res;
  }
}

export {
  Notification
}
