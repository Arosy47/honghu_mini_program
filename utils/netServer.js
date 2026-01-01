import api from "../config/api"

const baseUrl=api.baseAPI
const app = getApp();
import util from './util.js'

function baseRequest () {
  this.header = {'Content-Type':'application/json'};
  this.serverName;
  this.method = 'get';
  this.start = function(success, fail) {

    this.header['authorization'] = wx.getStorageSync('userToken')

    wx.request({
      url: baseUrl + this.serverName, 
      timeout:10000,
      data: this.data,
      method:this.method,
      header: this.header,
      success (res) {
        
        if (res.data.statusCode == 200) {
          success(res);
        } else if (res.data.data && res.data.data?.errMsg == '未登录') {

          getApp().wxLogin()
          wx.showToast({
            title: '请重试',
          })

        } else if(res.data.statusCode == 500){
          
          wx.hideLoading()

          wx.showModal({
            title: 'error',
            content: res.data.data?.errMsg,
            complete: (res) => {
              fail();
            }
          })
        }
      },
      
      fail (err) {
        wx.hideLoading()
        if(err.errMsg.indexOf('timeout')!==-1){
          wx.showToast({
            title: '网络超时',
            icon:"error"
          })
        }
        fail(err);
      }
    })
  }
}
const loginServer = function(header, method, data, success, fail) {
  baseRequest(header, '/auth/login',method, data, success, fail);
}

const couseDataServer = function(header, method, data, success, fail) {
  baseRequest(header, '/course/date',method, data, success, fail);
}

function createRequest(options) {

  return new Promise((resolve) => {

    var header = {'Content-Type':'application/json'};
    header['authorization'] = wx.getStorageSync('userToken')

    const url = `${baseUrl}${options.url}`

    wx.showLoading({
      title: '处理中',
      mask: true
    })
    wx.request({
      url,
      method: options.method || 'GET',
      timeout: options.timeout || 8000,
      header: header,
      data: options.data || {},
      success(res) {
        
        wx.hideLoading()
        if(res.data.statusCode==200){
          return resolve(res)
        }else{
          if(res.data.message=="教务系统用户名或密码错误"){
            
            wx.showModal({
              title: '用户名或密码错误',
              confirmText:'重新登录',
              cancelText:'暂不登录',
              complete: (res) => {
                if (res.confirm) {
                  wx.navigateTo({
                    url: '/page-course/student-login/index',
                  })
                }
              }
            })
            return
          }else if(res.data.message=="教务系统未登录"){
            wx.showModal({
              title: '请先登录',
              confirmText:'去登录',
              cancelText:'暂不登录',
              complete: (res) => {
                if (res.confirm) {
                  wx.navigateTo({
                    url: '/page-course/student-login/index',
                  })
                }
              }
            })
            return
          }else if(res.data.message=="新学期还没开始"){
            wx.showToast({
              title: '新学期还没开始',
              icon:'none'
            })
            return
          }else if (res.data.message =="日期不在教学周期,无空教室信息") {
            wx.showToast({
              title: '日期不在教学周期',
              icon:'none'
            })
            return
          }else{

            wx.showToast({
              title: '服务开小差啦！',
              icon: 'none'
            })
          }
        }
      },
      fail() {

        wx.hideLoading()
        wx.showToast({
          title: '服务开小差啦！',
          icon: 'none'
        })
      },
      complete() {
        
      }
    })
  })
}

export {loginServer, couseDataServer, baseRequest, createRequest};