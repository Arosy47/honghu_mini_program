
import api from "./config/api"
import { Notification } from "./models/notification"
import { User } from "./models/user"

const emojis = require('./utils/emoji-util')

App({
  topTen:[],
  yasuoTopTen:[],
  isSinglePage:false,
  categoryList:null,
  organizationSubjects:null,
  courseCacheKey:"courses",
  courseColorCacheKey:"courseColor",
  clearPageCourse:false, 

  globalData: {
    appId: wx.getAccountInfoSync().miniProgram.appId,
    userInfo: null, 
    tokenExpires: 86400 * 28, 
    navBarHeight: 0, 
    menuBottom: 0, 
    menuHeight: 0, 
    
    socketTask:null,
    socketOpen : false,  
    socketClose : true,
    socketMsgQueue : [],
    
    heart : null,
    
    heartBeatFailCount : 0,
    
    heartBeatTimeout : null,
    
    connectSocketTimeout : null,

    articleNum: 0,
    newMatchChatMsgNum:0,

    sixinNum: 0,
    systemNoticeNum: 0,
    thumbUpAndCollectNum:0,
    commentNum: 0,
    
    organizationNum:0,
    dingNum:0,
    deliveryNum:0,

    sessionStart:0,

    loginPromise:null,
    loginResolve:null,   

    lastViewTimes:{},

    isFirstLoaded:false,

    fromPublishArticle:false, 
    jumpTo:null, 
    
    categoryToGo:null,

    showInfoConfig:null,
    systemInfo:null,

    nonTabBarPageWindowHeight:null,

    navTop:0,

    emojiPickerCached:[],
    subscribeTimes:null,
    subscribeInfo:null, 

    tmplIds:
      {NEW_COMMENT:"K-RFm-yB2zvqtiRYpWmqNfYD4IeRzqoocFkm2kVIdl4",
      SIXIN:"Vzpz8j_pQT-9wbeBhoZydUgc2dwos7tplTWtg6dPrJk",
      ORGANIZATION_SUCCESS:"oqqpzWywMUdCdGrYxBV7nxps8XQEGcaO7QuYjq9ReEw",
      
      HOT_ARTICLE:"DmgKttv_7q4zr_1mpsngikfnXKctIMKAoIAvJmPfbks",
      ACTIVITY_START:"WVr0YeLeVLEVi4ro0ELF0NAGG2_M9AIX6fUoafPsn-w",
      COURSE_REMIND:"QxIonjRf_0obaeZ9aPq2_r-N95cNV8UO3A9wABmvDDY"}
    ,

    preImgStatus:false, 

    freshHome:false,

    locationInfo:null,

    termTime:"", 
    termStartDate:"",
    
  },

  onLaunch(options) {

    const scene = options.scene;
    if(scene && scene===1154){
      this.isSinglePage=true 
    }

    this.globalData.startTime = Date.now();

    if(!this.isSinglePage){

      this.globalData.isFirstLoaded=true
      this.globalData.loginPromise=new Promise(resolve => {
        this.globalData.loginResolve=resolve;
      });

      this.getUserInfoOrLogin()
      
      const res = wx.getWindowInfo()
      
      let menuButtonObject = wx.getMenuButtonBoundingClientRect();
      
      let statusBarHeight = res.statusBarHeight,
        navTop = menuButtonObject.top,
        navHeight = statusBarHeight + menuButtonObject.height + (menuButtonObject.top - statusBarHeight)*2;
      this.globalData.navHeight = navHeight;
      this.globalData.navTop = navTop;
      this.globalData.safeArea=res.safeArea
      this.globalData.systemInfo=res
      this.globalData.windowHeight = res.windowHeight;  
      this.globalData.windowWidth = res.windowWidth;
      this.globalData.screenHeight = res.screenHeight

      this.globalData.StatusBar = res.statusBarHeight;
      this.globalData.Custom = menuButtonObject;
      
      this.globalData.CustomBar = menuButtonObject.bottom + menuButtonObject.top - res.statusBarHeight;

      const updateManager = wx.getUpdateManager()
      updateManager.onUpdateReady(function () {
        wx.showModal({
          title: '更新提示',
          content: '新版本已经准备好，是否重启小程序？',
          success(res) {
            if (res.confirm) {
              
              updateManager.applyUpdate()
            }
          }
        })
      })

      const that = this;
      wx.getNetworkType({
        success(res) {
          const networkType = res.networkType
          if (networkType === 'none') {
            that.globalData.isConnected = false
            wx.showToast({
              title: '当前无网络',
              icon: 'loading',
              duration: 2000
            })
          }
        }
      }); 

      this.cacheEmojis();
      this.getSubscribeInfo()
    }

  },

  onShow(){

    if (this.isSinglePage) {
      return
    }

    if (!this.globalData.isFirstLoaded) {

      if(this.globalData.socketTask==null||[2,3].includes(this.globalData.socketTask.readyState)){

        if(this.globalData.userInfo){
          this.createWebSocket()
        }
      }

      if(this.globalData.userInfo){
        
        this.getUnreadCount()
      }
      
    }

    if(this.globalData.isFirstLoaded){
      this.globalData.isFirstLoaded=false
    }

    this.globalData.sessionStart = new Date(); 
    if(this.globalData.userInfo){
      
      this.recordOnlineTime()
    }

    const that = this
    const listener=function(res) {
      if (!res.isConnected) {
        that.globalData.isConnected = false
        wx.showToast({
          title: '网络已断开',
          icon: 'loading',
          duration: 4000
        })
      } else {
        that.globalData.isConnected = true
        wx.hideToast()
      }
    }
    this.globalData.NetworkStatusListener = listener
    
    wx.onNetworkStatusChange(this.globalData.NetworkStatusListener)

  },

  cacheEmojis(){
    emojis.forEach(emoji=>{
      wx.getStorage({
        key:emoji.src,
        success:(res)=>{

        },
        fail:()=>{
          
          wx.downloadFile({
            url: emoji.src,
            success:(res)=>{

              if(res.statusCode===200){
                wx.getFileSystemManager().saveFile({
                  tempFilePath: res.tempFilePath,
                  success:(saveRes)=>{
                    wx.setStorage({
                      key:emoji.src,
                      data:saveRes.savedFilePath,
                    });

                  },
                  fail:(err)=>{

                  }
                })
              }
            },
            fail:(err)=>{

            }
          })
        }
      })
    })
  },

  recordOnlineTime(){
    const currentDate = new Date();
    const lastVisitDate = wx.getStorageSync('lastVisitDate');
    if(lastVisitDate && lastVisitDate != currentDate.toDateString()){
      
      const durationKey = this.getTodayKey(new Date(lastVisitDate));
      this.upLoadDurationData(durationKey)
    }
    wx.setStorageSync('lastVisitDate', currentDate.toDateString())

    var hisKeyList = wx.getStorageSync("history_online_day")
    if(!(hisKeyList === null || hisKeyList.length === 0)){

      this.upLoadDurationDataHistory(hisKeyList)
    }
  },

  async upLoadDurationDataHistory(durationKeyList){
    const data=[]
    durationKeyList.map(key => {
      const durationData = wx.getStorageSync(key)
      data.push({
        dateKey:key,
        duration:durationData
      })
    })

    this.header = {'Content-Type':'application/json'};
    this.header['authorization'] = wx.getStorageSync('userToken')
    wx.request({
      url: api.baseAPI+"/app/user/recordOnlineTimeHistory",
      data: data,
      method:'post',
      header: this.header,
      success (res) {
        if (res.data.statusCode == 200) {
          durationKeyList.map(key => {
            wx.removeStorageSync(key);
          })
          wx.removeStorageSync("history_online_day");

        } else if(res.data.statusCode == 500){
          wx.hideLoading()
          
        }
      },
      
      fail (err) {
        wx.hideLoading()

      }
    })
  },

  async upLoadDurationData(durationKey){
    const durationData = wx.getStorageSync(durationKey)
    if(durationData){

      const data = {
        dateKey:durationKey,
        duration:durationData
      }
      this.header = {'Content-Type':'application/json'};
      this.header['authorization'] = wx.getStorageSync('userToken')
      wx.request({
        url: api.baseAPI+"/app/user/recordOnlineTime",
        data: data,
        method:'post',
        header: this.header,
        success (res) {
          if (res.data.statusCode == 200) {
            wx.removeStorageSync(durationKey);

          } else if(res.data.statusCode == 500){
            wx.hideLoading()

            var hisKeyList = wx.getStorageSync("history_online_day")
            if(hisKeyList.length>0){
              
              if(!hisKeyList.includes(durationKey)){
                hisKeyList.push(durationKey)
                wx.setStorageSync('history_online_day', hisKeyList)
              }
            }else{
              wx.setStorageSync('history_online_day', [durationKey])
            }

          }
        },
        
        fail (err) {
          wx.hideLoading()

          var hisKeyList = wx.getStorageSync("history_online_day")
          if(hisKeyList.length>0){
            
            if(!hisKeyList.includes(durationKey)){
              hisKeyList.push(durationKey)
              wx.setStorageSync('history_online_day', hisKeyList)
            }
            
          }else{
            wx.setStorageSync('history_online_day', [durationKey])
          }
        }
      })
    }else{
      wx.removeStorageSync(durationKey);
      var hisKeyList = wx.getStorageSync("history_online_day")
      if(hisKeyList.length>0){
        
        hisKeyList = hisKeyList.filter(item=>item!=durationKey)
        if(hisKeyList.length == 0){
          wx.removeStorageSync('history_online_day')
        }else{
          wx.setStorageSync('history_online_day', hisKeyList)
        }
      }
    }
  },

  onHide(){
    
    if (this.isSinglePage) {
      return
    }

    if(this.globalData.preImgStatus ==true) {
      this.globalData.preImgStatus=false
      return;
    }

    var endTime = Date.now();
    
    var duration = endTime-this.globalData.startTime;
    this.addSessionDuration(duration); 
    
    this.closeSocket()
    if(this.globalData.NetworkStatusListener){
      wx.offNetworkStatusChange(this.globalData.NetworkStatusListener)
    }

  },

  addSessionDuration(duration) {
    let sessionEnd = new Date();
    let sessionStart = this.globalData.sessionStart;
    
    if(sessionStart.toDateString()===sessionEnd.toDateString()){
      this.saveDuration(duration, sessionStart);
    }else{
      let endOffirstDay = new Date(sessionStart);
      endOffirstDay.setHours(24,0,0,0);
      let firstDayDuration = endOffirstDay - sessionStart;
      this.saveDuration(firstDayDuration, sessionStart);
      
      let secondDayDuration = sessionEnd - endOffirstDay;
      this.saveDuration(secondDayDuration,sessionEnd);
    }
  },

  saveDuration(duration,date){
    const todayKey = this.getTodayKey(date);
    const previousDuration = wx.getStorageSync(todayKey) || 0;
    wx.setStorageSync(todayKey, previousDuration + duration);
  },

  getTodayKey(date){
    return `duration_${date.getFullYear()}_${date.getMonth()+1}_${date.getDate()}`
  },

  calcNavBarInfo () {
    
    const systemInfo = wx.getSystemInfoSync();
    
    const menuButtonInfo = wx.getMenuButtonBoundingClientRect();
    
    this.globalData.navBarHeight = (menuButtonInfo.top - systemInfo.statusBarHeight) * 2 + menuButtonInfo.height + systemInfo.statusBarHeight;

    this.globalData.menuBottom = menuButtonInfo.top - systemInfo.statusBarHeight;
    
    this.globalData.menuHeight = menuButtonInfo.height;

  },

  getUserInfoOrLogin() {

    const expireTime = wx.getStorageSync('userToken_expireTime')

    if (!expireTime || Number(expireTime) - Date.now() < 259200000) {

      this.wxLogin()
    }else{
      
      const userInfo = wx.getStorageSync('userInfo')
      const userToken = wx.getStorageSync('userToken')
      if (userInfo && userToken) {  
        
        this.globalData.userInfo = userInfo
        this.globalData.userId = userInfo.userId

        this.createWebSocket()

        this.getUnreadCount()

        this.globalData.loginResolve();
      }else{

        this.wxLogin()
      }
    }
  },

  async wxLogin() {

    const that = this;
    wx.login({
      success: res => {

        const data = {
          code: res.code,
        }

        this.header = {'Content-Type':'application/json'};
        this.header['authorization'] = wx.getStorageSync('userToken')
        wx.request({
          url: api.baseAPI+"/app/user/login",
          data: data,
          method:'post',
          header: this.header,
          success (res) {
            if (res.data.statusCode == 200) {
              
              that.globalData.userId = res.data.data.userId;
              wx.setStorageSync('userToken', res.data.data.token)

              wx.setStorageSync('userToken_expireTime', res.data.data.expire)
              that.getUserInfo(()=>{
                
                that.globalData.loginResolve();
              });
              
            } else if(res.data.statusCode == 500){
              wx.showToast({
                title: '登录失败',
                icon:'none'
              })
            }
          },
          
          fail (err) {
            wx.showToast({
              title: '登录失败',
              icon:'none'
            })
          }
        })
      },
      fail(e){

      }
    })

  },

  getUserInfo(callback) {
    const data = {
      targetUserId: this.globalData.userId
    }

    const that = this
    this.header = {'Content-Type':'application/json'};
    this.header['authorization'] = wx.getStorageSync('userToken')
    wx.request({
      url: api.baseAPI+"/app/user/userInfo",
      data: data,
      method:'get',
      header: this.header,
      success (res) {

        if (res.data.statusCode == 200) {
          const userInfo = res.data.data
          
          that.globalData.userInfo = userInfo

          if(callback){
            callback()
          }

          if(that.globalData.socketTask==null||[2,3].includes(that.globalData.socketTask.readyState)){
            that.createWebSocket()
          }
          that.getUnreadCount()
          wx.setStorageSync('userInfo', userInfo)
          that.recordOnlineTime()

          that.checkSchoolSelect(userInfo.schoolId)
          
        } else if (res.data.statusCode !== 200){
          if(res.data.message=="请登录"){
            wx.showModal({
              title: '请登录',
              complete: (res) => {
                if (res.cancel) {
                }
                if (res.confirm) { 
                }
                wx.switchTab({
                  url: '/pages/profile/index',
                })
              }
            })
          }

          else {

            wx.showToast({
              title: '网络异常',
              icon:'error'
            })
          }
        }
      },
      
      fail (err) {
        wx.showToast({
          title: '获取用户信息报错',
        })
        that.getUserInfo()
      }
    })

  },

  checkSchoolSelect(schoolId) {
    if (schoolId < 0) {
      wx.navigateTo({
        url: "/page-school/choose-school/index"
      })
    }
  },

  gotoAuthPage(res) {

    if(res.data && res.data?.errMsg == '未登录'){

      this.wxLogin()
    }
  },

  async getUnreadCount() {

    const unreadCount = await Notification.getUnreadCount()
    if(!unreadCount){
      return
    }

    var msgNum = 0
    for(var i = 0; i<unreadCount.length;i++){
      msgNum += unreadCount[i]
    }

    this.globalData.sixinNum = unreadCount[0]
    this.globalData.systemNoticeNum = unreadCount[1]
    this.globalData.commentNum = unreadCount[2]
    this.globalData.thumbUpAndCollectNum = unreadCount[3]
    this.globalData.organizationNum = unreadCount[4]
    this.globalData.deliveryNum = unreadCount[5]

    if(msgNum>99){
      wx.setTabBarBadge({
        index: 3,
        text: '99+'
      })
    }else if(msgNum!= 0){
      wx.setTabBarBadge({
        index: 3,
        text: msgNum+''
      })
    }

  },

  createWebSocket(){

    this.globalData.socketOpen = false;
    this.globalData.socketMsgQueue = [];

    this.closeSocket();
    this.globalData.socketClose = false;
    
    var socket =  wx.connectSocket({
      url: api.socketAPI+"/newMessageRemindWebSocket/"+this.globalData.userInfo.userId,
      header:{
        'content-type': 'application/json'
      },
      success:function(res) {
        
      },
      fail:function(err) {
        
      }
    })

    socket.onOpen((e)=>{

      if (this.globalData.socketClose) {
        
        this.closeSocket();
      } else {
        this.globalData.socketOpen = true
        this.startHeartBeat();
      }
    }) 
    socket.onMessage((e)=>{

      if(e.data == "HEART_BEAT"){
        
        return
      }
     
      var data = JSON.parse(e.data);

      if(data.type == "NEW_ARTICLE"){
        
        this.globalData.articleNum = this.globalData.articleNum+1
        if(this.globalData.articleNum>99){
          wx.setTabBarBadge({
            index: 0,
            text: '99+'
          })
        }else{

          wx.setTabBarBadge({
            index: 0,
            text: this.globalData.articleNum+''
          })
        }
      } else if(data.type == "NEW_MATCH_CHAT_MSG"){
        
        const pages=getCurrentPages();
        const currentPage=pages[pages.length-1];
        
        this.globalData.newMatchChatMsgNum= this.globalData.newMatchChatMsg+1
        if(currentPage.route=='pages/topic/index'){
          currentPage.getMatchChatUnreadCount()
        }else if(currentPage.route=='page-makefriend/slide-match/index'){
          currentPage.getMatchChatUnreadCount()
        }else if(currentPage.route=='page-makefriend/session-list/index'){
          currentPage.initMatchChatSessionList()
        }
      }else{
        const pages=getCurrentPages();
        const currentPage=pages[pages.length-1];

        if(data.type == "NEW_SIXIN"){
          
          this.globalData.sixinNum= this.globalData.sixinNum+1

          if(currentPage.route=='pages/notification/index'){
            currentPage.initSixinSessionList()
          }
        } else{
          if(data.type == "NEW_THUMB_UP" || data.type == "NEW_COLLECT"){
            this.globalData.thumbUpAndCollectNum= this.globalData.thumbUpAndCollectNum+1
          }else if(data.type == "NEW_COMMENT"){
            this.globalData.commentNum= this.globalData.commentNum+1
          }else if(data.type == "NEW_JOIN_ORGANIZATION" || data.type == "NEW_OUT_ORGANIZATION"){
            this.globalData.organizationNum= this.globalData.organizationNum+1
          }else if(data.type == "NEW_TASK_MSG"){
            this.globalData.deliveryNum= this.globalData.deliveryNum+1
          }else if(data.type == "NEW_SYSTEM_NOTICE"){
            this.globalData.systemNoticeNum= this.globalData.systemNoticeNum+1
            if(currentPage.route=='pages/notification/index') {
              currentPage.getNewSystemNotice()
            }
          }

          if(currentPage.route=='pages/notification/index'){
            currentPage.genAllUnreadCount()
          }
        }
        
        const msgNum = this.globalData.sixinNum + this.globalData.systemNoticeNum+ this.globalData.thumbUpAndCollectNum+this.globalData.commentNum+this.globalData.dingNum+this.globalData.organizationNum+this.globalData.deliveryNum

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
      
    }) 

    socket.onClose((e)=>{

      if (this.globalData.heartBeatTimeout) {
        
        clearTimeout(this.globalData.heartBeatTimeout);
        this.globalData.heartBeatTimeout=null
      };

      if (!this.globalData.socketClose) {
        
        clearTimeout(this.globalData.connectSocketTimeout);
        this.globalData.connectSocketTimeout = setTimeout(() => {

          if(this.globalData.socketClose){
            
            return
          }
          
          if(this.globalData.socketTask&&[0,1].includes(this.globalData.socketTask.readyState)){
            
            return
          }
          this.createWebSocket();
        }, 3000);
      }
    }) 

    socket.onError((error) => {

    })

    this.globalData.socketTask= socket
  },

  startHeartBeat: function() {
    this.globalData.heart = true;
    
    this.heartBeat();
  },

  heartBeat() {
    var that = this;
    if (!this.globalData.heart||this.globalData.socketClose) {
        return;
    };

    that.sendSocketMessage({
        data:JSON.stringify({
          
          "content":"HeartBeat",
          "type":"HEART_BEAT"})
        ,
        success: function(res) {
          if (that.globalData.heart) {
            
            if(that.globalData.heartBeatTimeout){
              clearTimeout(that.globalData.heartBeatTimeout)
            }
              
            that.globalData.heartBeatTimeout = setTimeout(() => {
                that.heartBeat();
            }, 20000);
          }
        },
        fail: function(res) {
          
          if (that.globalData.heartBeatFailCount >= 2) {
            that.createWebSocket();
            return
          };
          if (that.globalData.heart) {

            if(that.globalData.heartBeatTimeout){
              clearTimeout(that.globalData.heartBeatTimeout)
            }
            that.globalData.heartBeatTimeout = setTimeout(() => {
              that.heartBeat();
            }, 20000);
          };
          that.globalData.heartBeatFailCount++;
        },
    });
  },

  sendSocketMessage(options) {

    if (this.globalData.socketTask?.readyState === 1) {
      this.globalData.socketTask.send({
        data: options.data,
        success: function(res) {
            if (options) {
                options.success && options.success(res);
            }
        },
        fail: function(res) {
            if (options) {
                options.fail && options.fail(res);
            }
        }
      })
    } else {
      this.globalData.socketMsgQueue.push(options.msg)
    }
  },

  closeSocket() {
    
    if (this.globalData.connectSocketTimeout) {
      clearTimeout(this.globalData.connectSocketTimeout);
      this.globalData.connectSocketTimeout = null;
    };
    
    this.globalData.socketClose=true
    this.stopHeartBeat();
    
    if(this.globalData.socketTask&&[0,1].includes(this.globalData.socketTask.readyState)){
      this.globalData.socketTask.close()
    }
  },

  stopHeartBeat() {
    
    this.globalData.heart = false;
    if (this.globalData.heartBeatTimeout) {
      
      clearTimeout(this.globalData.heartBeatTimeout);
      this.globalData.heartBeatTimeout=null
    };
    if (this.globalData.connectSocketTimeout) {
      clearTimeout(this.globalData.connectSocketTimeout);
      this.globalData.connectSocketTimeout=null
    }
  },

  getHeader(){
    return {}
  },

  getSubscribeTimes:throttle(async function(callback){
  
    const res = await Notification.getSubscribeTimes()

    if (res) {
      this.globalData.subscribeTimes =res
      if(callback){
        callback()
      }
    }
  },1500),

  getSubscribeInfo(callback){
    const that = this
    wx.getSetting({
      withSubscriptions: true, 
      success(res) {

        if (res.subscriptionsSetting.mainSwitch) {
          
          let itemSettings = res.subscriptionsSetting.itemSettings;
          if (itemSettings) {
            
            var tmplIds = that.globalData.tmplIds
            Object.entries(tmplIds).forEach(([key, value])=>{
              if(itemSettings[value]){
                if(that.globalData.subscribeInfo==null){
                  that.globalData.subscribeInfo={}
                }
                
                if(itemSettings[value]=="accept"){
                  that.globalData.subscribeInfo[key]=true
                }else if(itemSettings[value]=="reject"){

                }
              }
            });

          } else {
            that.globalData.subscribeInfo={}
          }
        }else{
          
          that.globalData.subscribeInfo={}
        }
        if(callback){
          callback()
        }
      },
    })
  },

})

function throttle(fn, gapTime) {
  if (gapTime == null || gapTime == undefined) {
    gapTime = 1500
  }
  let _lastTime = null
  return function () {
    let _nowTime = + new Date()
    if (_nowTime - _lastTime > gapTime || !_lastTime) {
      fn.apply(this, arguments)
      _lastTime = _nowTime
    }
  }
}