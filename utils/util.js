import COS from '../utils/cos-wx-sdk-v5'
import api from "../config/api"
import wxutil from "../miniprogram_npm/@yyjeffrey/wxutil/index"
const emojis = require('./emoji-util')

const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return `${[year, month, day].map(formatNumber).join('-')} ${[hour, minute, second].map(formatNumber).join(':')}`
}

const formatTimeMinute = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return `${[year, month, day].map(formatNumber).join('-')} ${[hour, minute].map(formatNumber).join(':')}`
}

const cos = new COS({
  Domain: 'img.honghu.com', 
  Protocol: 'https:', 

  SimpleUploadMethod: 'putObject', 

  getAuthorization: function (options, callback) {

    wxutil.request.get(api.getCredentialAPI).then(res => {
      
      if(res.statusCode == 200) {
        const credentials = res.data;

        callback({
            TmpSecretId: credentials.tmpSecretId,
            TmpSecretKey: credentials.tmpSecretKey,
            
            SecurityToken: credentials.sessionToken,
            
            StartTime: credentials.startTime, 
            ExpiredTime: credentials.expiredTime, 
        });
      }else{
        wx.showToast({
          title: '获取oss签名失败',
        })
      }
    }).catch(error => {
      wx.showToast({
        title: error,
      })
    })

  }
});

const generateCosKey = function (pathType, filePath, index, date) {
  
  var extIndex = filePath.lastIndexOf('.');
  var fileExt = extIndex >= -1 ? filePath.substr(extIndex + 1) : '';

  var y = date.getFullYear();
  var m = (date.getMonth() + 1).toString().padStart(2, '0');
  var d = date.getDate().toString().padStart(2, '0');
  var h = date.getHours().toString().padStart(2, '0');
  var min = date.getHours().toString().padStart(2, '0');
  var s = date.getSeconds().toString().padStart(2, '0');
  var ms = date.getMilliseconds().toString().padStart(3, '0');
  
  var random = Math.floor(Math.random()*1000000).toString().padStart(6, '0');
  var ymd=`${y}${m}${d}`
  var ymdhminsms=`${y}${m}${d}${h}${min}${s}${ms}`

  var cosKey = `${pathType}/${ymd}/${ymdhminsms}_${random}${getApp().globalData.userInfo.userId}_${index}${fileExt ? `.${fileExt}` : ''}`;
  return cosKey;
};

const uploadAvatar = (file, success) => {
  wx.showLoading({
    title: '上传中...',
  })

  var key = generateCosKey('avatar', file, 0, new Date())

  cos.putObject(
    {
      Bucket: 'campus-alliance-1316743522',
      Region: 'ap-shanghai',
      Key: key,
      FilePath: file,

    },
    (err, data) => {
      
      if (data) {

        var location=data.Location
        location=location.replace("img.honghu.com","cdn.honghu.com");

        success({Location:location,Key:key})
        wx.showToast({
          title: '修改成功',
        })
      } else {
        wx.showToast({
          title: '修改头像失败',
        })
        
      }
      wx.hideLoading()
    },
  );

}

const timeStamp2ReadableTime = timestamp  => {
  function zeroize( num ) {
    return (String(num).length == 1 ? '0' : '') + num;
  }

  timestamp = timestamp / 1000

  var curTimestamp = parseInt(new Date().getTime() / 1000); 
  var timestampDiff = curTimestamp - timestamp; 

  var curDate = new Date( curTimestamp * 1000 ); 
  var tmDate = new Date( timestamp * 1000 );  

  var Y = tmDate.getFullYear(), m = tmDate.getMonth() + 1, d = tmDate.getDate();
  var H = tmDate.getHours(), i = tmDate.getMinutes(), s = tmDate.getSeconds();

  if ( timestampDiff < 60 ) { 
    return "刚刚";
  } else if( timestampDiff < 3600 ) { 
    return Math.floor( timestampDiff / 60 ) + "分钟前";
  } else if ( curDate.getFullYear() == Y && curDate.getMonth()+1 == m && curDate.getDate() == d ) {
    return '今天' + zeroize(H) + ':' + zeroize(i);
  } else {
    var newDate = new Date( (curTimestamp - 86400) * 1000 ); 
    if ( newDate.getFullYear() == Y && newDate.getMonth()+1 == m && newDate.getDate() == d ) {
        return '昨天' + zeroize(H) + ':' + zeroize(i);
    } else if ( curDate.getFullYear() == Y ) {
        return  zeroize(m) + '月' + zeroize(d) + '日 ' + zeroize(H) + ':' + zeroize(i);
    } else {
        return  Y + '年' + zeroize(m) + '月' + zeroize(d) + '日 ' + zeroize(H) + ':' + zeroize(i);
    }
  }
}

const timeStamp2ReadableTimeDay = timestamp  => {
  function zeroize( num ) {
    return (String(num).length == 1 ? '0' : '') + num;
  }

  timestamp = timestamp / 1000

  var curTimestamp = parseInt(new Date().getTime() / 1000); 
  var timestampDiff = curTimestamp - timestamp; 

  var curDate = new Date( curTimestamp * 1000 ); 
  var tmDate = new Date( timestamp * 1000 );  

  var Y = tmDate.getFullYear(), m = tmDate.getMonth() + 1, d = tmDate.getDate();
  var H = tmDate.getHours(), i = tmDate.getMinutes(), s = tmDate.getSeconds();

  if ( timestampDiff < 60 ) { 
    return "刚刚";
  } else if( timestampDiff < 3600 ) { 
    return Math.floor( timestampDiff / 60 ) + "分钟前";
  } else if ( curDate.getFullYear() == Y && curDate.getMonth()+1 == m && curDate.getDate() == d ) {
    return '今天' + zeroize(H) + ':' + zeroize(i);
  } else {
    var newDate = new Date( (curTimestamp - 86400) * 1000 ); 
    if ( newDate.getFullYear() == Y && newDate.getMonth()+1 == m && newDate.getDate() == d ) {
        return '昨天';
    } else if ( curDate.getFullYear() == Y ) {
        return  zeroize(m) + '月' + zeroize(d) + '日 ';
    } else {
        return  Y + '年' + zeroize(m) + '月' + zeroize(d) + '日 ';
    }
  }
}

const timeStamp2FormatTime = timeStamp => {
  return formatTime(new Date(timeStamp))
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : `0${n}`
}

const getYear = time => {
  var date = new Date(time);
  var year = date.getFullYear()
  return year
}

const getMonth = time => {
  var date = new Date(time);
  var month = date.getMonth() + 1
  return month
}

const getDay = time => {
  var date = new Date(time);
  var day = date.getDate()
  return day
}

const isAuthed =() =>{
  let user = getApp().globalData.userInfo

  if (user && user.authStatus!=="认证完成"){
    
    wx.showModal({
      title: '您还未认证',
      content: '是否前去认证',
      cancelText: '取消',
      confirmText: '去认证',
      complete: (res) => {
        if (res.confirm) {
          wx.navigateTo({
            url: '/page-certification/certification/step1/index',
          })
        }
      }
    })
    
    return false
  } else{
    return true
  }
  
}

const isForbidden =() =>{

  let user = getApp().globalData.userInfo

  if (user?.accountStatus && user.accountStatus!='正常'){
    
    wx.showModal({
      title: '账号已被封禁',
      content: '如有疑问请联系客服申诉',
      showCancel: false,
    })
    
    return true
  } else{
    return false
  }
  
}

function getNowWeek(startDate, totalWeek) {
  const nowDate = new Date().getTime()
  startDate = new Date(startDate)
  const time = nowDate - startDate
  let nowWeek = Math.ceil(time / 1000 / 60 / 60 / 24 / 7)
  if (nowWeek > totalWeek || nowWeek < 1) {

    nowWeek = 1
  }
  return nowWeek
}

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

function getZodiac(month, day) {
  const zodiacSignsChinese = [
      "摩羯座", "水瓶座", "双鱼座", "白羊座", "金牛座", "双子座",
      "巨蟹座", "狮子座", "处女座", "天秤座", "天蝎座", "射手座"
  ];

  const cutoffDates = [
      20, 19, 20, 20, 21, 21, 22, 23, 23, 23, 22, 21
  ];

  if (month < 1 || month > 12 || day < 1 || day > 31) {
      return "无效的日期";
  }

  if (day < cutoffDates[month - 1]) {
      return zodiacSignsChinese[month - 1];
  } else {
      return zodiacSignsChinese[month % 12];
  }
}

function shareAddScoreRestrictTimes(){
  var timestamp = wx.getStorageSync('shareTimeStamp')
  var times = wx.getStorageSync('shareTimes')

  if(timestamp){

    if(Date.now()-Number(timestamp) > 86400000){
      wx.setStorageSync('shareTimeStamp', Date.now())
      times=0
      wx.setStorageSync('shareTimes', 0)
    }else{
      if(times!=null){
        
        wx.setStorageSync('shareTimes', Number(times)+1)
      }else{
        times=0
        wx.setStorageSync('shareTimes', 0)
      }
    }
  }else{
    wx.setStorageSync('shareTimeStamp', Date.now())
    if(times==null){
      times=0
      wx.setStorageSync('shareTimes', 0)
    }
  }

  if(times>=10){
    
    return false
  }
  return true
}
 
function getTodayFormat() {
  const today=new Date();
  const yyyy=today.getFullYear();
  const mm=String(today.getMonth()+1).padStart(2,'0');
  const dd=String(today.getDate()).padStart(2,'0');
  const formattedDate=`${yyyy}-${mm}-${dd}`;
  return formattedDate;
}

function replaceTextWithEmojiString(content, size){
  if(content instanceof Array){
    return
  }
  
  let result=content
  emojis.forEach(emoji => {

    const regex = new RegExp(escapeRegExp(emoji.replace),'g');
    result = result.replace(regex,`<img src="${emoji.src}" style="width: ${size}; height:${size}; vertical-align:middle;" />`)
  });

  return result;
}

function replaceTextWithEmoji(content, size){
  if(content instanceof Array){
    return
  }
  
  let result=content
  emojis.forEach(emoji => {

    const regex = new RegExp(escapeRegExp(emoji.replace),'g');
    result = result.replace(regex,`<img src="${emoji.src}" style="width: ${size}; height:${size}; vertical-align:middle;" />`)
  });

  result = parseRichText(result)

  return result;
}

const escapeRegExp = str => {
  return str.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')
}

const parseRichTextWithParent = content => {
  const nodes = [];

  const regex = /(<img.*?>)|((?:(?!<img.*?>).)+)/gs;  
  
  let match;
  const parentNode={
    name:'span',
    attrs:{
      
      class:'rich-text-content'
    },
    children:[]
  }
  while ((match = regex.exec(content)) !== null) {
    if (match[1]) {

      const imgTag = match[1];
      const srcMatch = imgTag.match(/src=\"(.*?)\"/);
      const src = srcMatch ? srcMatch[1] : '';
      const styleMatch = imgTag.match(/style=\"(.*?)\"/);
      const style = styleMatch ? styleMatch[1] : '';
      parentNode.children.push({
        name: 'img',
        attrs: {
          src,
          style
        }
      });
    } else if (match[2]) {
      // console.log("match[2]",match[2])
      // 处理文本部分,替换换行符为<br>
      const textParts=match[2].split('\n');
      textParts.forEach((part, index)=>{
        parentNode.children.push({
          name:'span',
          attrs:{
            // 折行长单词，允许再任何字符处进行换行
            style:'vertical-align:middle; word-wrap:break-word;word-break:break-all'
          },
          children:[{
            type: 'text',
            text: part
          }]
        });

        // 在每个文本部分后面添加<br> 除了最后一段
        if(index<textParts.length-1){
          parentNode.children.push({
            name:'br'
          })
        }
      })
      
    }
  }
  nodes.push(parentNode)
  return nodes;
}

const parseRichText = content => {
  const nodes = [];
  // 正则表达式匹配 <img> 标签以及纯文本部分
  // const regex = /(<img.*?>)|([^<img>]+)/g;  这个regex会把img三个字母剔除
  
  const regex = /(<img.*?>)|((?:(?!<img.*?>).)+)/gs;  //最后这个s可以匹配换行符号
  let match;
  while ((match = regex.exec(content)) !== null) {
    if (match[1]) {
      // 处理 <img> 标签
      const imgTag = match[1];
      const srcMatch = imgTag.match(/src=\"(.*?)\"/);
      const src = srcMatch ? srcMatch[1] : '';
      const styleMatch = imgTag.match(/style=\"(.*?)\"/);
      const style = styleMatch ? styleMatch[1] : '';
      nodes.push({
        name: 'img',
        attrs: {
          src,
          style
        }
      });
    } else if (match[2]) {
      // 处理文本部分,替换换行符为<br>
      const textParts=match[2].split('\n');
      textParts.forEach((part, index)=>{
        nodes.push({
          name:'span',
          attrs:{
            // 折行长单词，允许再任何字符处进行换行
            style:'vertical-align:middle; word-wrap:break-word;word-break:break-all'
          },
          children:[{
            type: 'text',
            text: part
          }]
        });

        // 在每个文本部分后面添加<br> 除了最后一段
        if(index<textParts.length-1){
          nodes.push({
            name:'br'
          })
        }
      })
      
    }
  }
  return nodes;
}

function dingyue(method,param,tmplIds, remindTimestapCache,cacheHours=24, type){
  // const tmplIds = this.tmplIds
  const that = this;
  // https://blog.csdn.net/m0_61087678/article/details/132173717
    
    wx.getSetting({
      withSubscriptions: true, // 是否获取用户订阅消息的订阅状态，默认false不返回
      success(res) {
//         console.log('res', res)
        if (res.subscriptionsSetting.mainSwitch) {
          // 用户已开启总开关
          let itemSettings = res.subscriptionsSetting.itemSettings;
          if (itemSettings) {
            // 用户已授权模板消息
            let status = true; 
            //判断模板是否全部授权
            for(let i=0; i<tmplIds.length; i++){
              let key = tmplIds[i];
              if(itemSettings[key]==null){
                // 说明用户没有选择 总是保持以上选择,所以设置中没有这个模板的订阅记录，此时打开订阅消息提示

                var lastRequestTime = wx.getStorageSync(remindTimestapCache)
                const currentTime=Date.now()
                if(!lastRequestTime){
                  wx.setStorageSync(remindTimestapCache, currentTime)
                }
                const hoursPassed=(currentTime - lastRequestTime)/(1000*60*60)
                // console.log("itemSettings[key]==null",hoursPassed)
                if(hoursPassed>cacheHours){
                  openSubscribeMessage(method,param,tmplIds);
                  wx.setStorageSync(remindTimestapCache, currentTime)
                }else{
                  method(param)
                }
                // console.log("用户有订阅记录，但是没有该模板的订阅记录")
                return
              }

              if(itemSettings[key] != 'accept'){
                // 说明用户拒绝了该模板，模态框提示用户是否去设置中开启
                status = false;
                break;
              }
            }
            // console.log("status",status)
            if(!status){
              // console.log("用户目前时拒绝该订阅的")
              var lastRequestTime = wx.getStorageSync(remindTimestapCache)
              const currentTime=Date.now()
              if(!lastRequestTime){
                wx.setStorageSync(remindTimestapCache, currentTime)
              }
              // lastRequestTime为空在下面这个公式会被当成0计算
              const hoursPassed=(currentTime - lastRequestTime)/(1000*60*60)
              if(hoursPassed>cacheHours){
                weidingyue_muban(method,param,tmplIds);
                wx.setStorageSync(remindTimestapCache, currentTime)
              }else{
                method(param)
              }
            }else{
              // 
              // console.log("用户是永久同意的")
              openSubscribeMessage(method,param,tmplIds);
              // method(param)
            }
          } else {
            //说明用户没有任何一个模板的订阅记录，不管是同意还是拒绝
            // 用户未授权任何模板消息
            // if(type == 'kaiguan'){ // 设置返回后提示是否授权模板
            //   onSettingNotSubscribeMessage(method,param,tmplIds);
            //   return;
            // }
            // console.log("总开关开了，但是没有任何订阅？ 啥情况itemSettings会为空")
            // 没有没有任何一个模板的订阅记录时itemSettings会为空!!

            var lastRequestTime = wx.getStorageSync(remindTimestapCache)
            const currentTime=Date.now()
            if(!lastRequestTime){
              wx.setStorageSync(remindTimestapCache, currentTime)
            }
            // lastRequestTime为空在下面这个公式会被当成0计算
            const hoursPassed=(currentTime - lastRequestTime)/(1000*60*60)
            if(hoursPassed>cacheHours){
              openSubscribeMessage(method,param,tmplIds);
              wx.setStorageSync(remindTimestapCache, currentTime)
            }else{
              method(param)
            }
          }
        } else {
          
          // 说明用户未开启总开关
          // if(type == 'kaiguan'){ // 设置返回后仍未开启进入下一步
          //   method(param)
          //   return;
          // }

          var lastRequestTime = wx.getStorageSync(remindTimestapCache)
          const currentTime=Date.now()
          if(!lastRequestTime){
            wx.setStorageSync(remindTimestapCache, currentTime)
          }
          const hoursPassed=(currentTime - lastRequestTime)/(1000*60*60)
          // console.log("hoursPasseaad",hoursPassed)
          if(hoursPassed>cacheHours){
            wx.setStorageSync(remindTimestapCache, currentTime)
            weidingyue_kaiguan(method,param,tmplIds);
          }else{
            method(param)
          }
        }
      },
      fail(e){
        method(param)
//         console.log("eee",e)
      }
    })

}

// 未开启订阅 开关
function weidingyue_kaiguan(method,param,tmplIds){
  let that = this;
  wx.showModal({
    title: '提示',
    // content: '检测到您未开启订阅消息，是否前往设置？',

    content:'检测到你未开启消息订阅，可能错过相关信息，请前往设置授权',
    cancelText:"放弃提醒",
    confirmText:"开启通知",
    success (res) {
      if (res.confirm) {
        openSetting(method,param,tmplIds,'kaiguan');
      } else if (res.cancel) {
        method(param)
      }
    }
  })
}

// 未开启订阅 模板
function weidingyue_muban(method,param,tmplIds){
  let that = this;
  wx.showModal({
    title: '提示',
    // content: '检测到有订阅消息未开启，是否前往设置？',

    content:'检测到你未开启消息订阅，可能错过相关信息，请前往设置授权',
    cancelText:"放弃提醒",
    confirmText:"开启通知",
    success (res) {
      if (res.confirm) {
        openSetting(method,param,tmplIds,'muban');
      } else if (res.cancel) {
        method(param)
      }
    }
  })
}
// 打开设置
function openSetting(method,param,tmplIds,type){
  let that = this;
  wx.openSetting({
    success: function(res) {
      // console.log("openSetting", res, type)
      // 返回后流程
      if(type == 'muban'){
        method(param)
      } else if(type == 'kaiguan'){
        // // 再次验证订阅状态
        // dingyue(method,param,tmplIds,'kaiguan');

        //这里就不再次验证了，直接执行方法，不然操作太繁琐，影响用户体验，另外一般来说用户既然选择去设置，一般都会勾选上这个通知，就算没勾选这个模板，下次再提示就好了
        // method(param)

        // 但是有一种情况，如果用户从来没有订阅（总是保持以上选择）过该消息，那就需要调用requestSubscribeMessage，如果是不接收该消息，那就不要调用weidingyue_muban再弹窗提示了，所以这里和dingyue()还不太一样，这里加一个方法
        dingyueOnlyHandleMuban(method,param,tmplIds)
      }

      // 获取最新配置信息
      getApp().getSubscribeInfo()
    },
    fail: function(err) {
      settingFail(method,param,tmplIds,type);
    }
  });
}

// 设置失败
function settingFail(method,param,tmplIds,type){
  let that = this;
  wx.showModal({
    title: '提示',
    content: '设置失败，是否重新设置？',
    success (res) {
      if (res.confirm) {
        openSetting(method,param,tmplIds,type);
      } else if (res.cancel) {
        method(param)
      }
    }
  })
}

// 设置开启总开关返回后，并未授权的情况（如果不加二次确认弹窗，无法直接唤起授权弹窗）
function onSettingNotSubscribeMessage(method,param,tmplIds){
  let that = this;
  wx.showModal({
    title: '提示',
    content:'检测到有订阅消息未授权，是否授权？',
    success (res) {
      if (res.confirm) {
        openSubscribeMessage(method,param,tmplIds);
      } else if (res.cancel) {
        method(param)
      }
    }
  })
}

// 唤起授权订阅弹窗
function openSubscribeMessage(method,param,tmplIds){
  let that = this;
  // console.log("openSubscribeMessage",tmplIds)
  
  wx.requestSubscribeMessage({
    tmplIds,
    success(res) {
      method(param)
      // console.log("requestSubscribeMessage result",res)
      const app = getApp()
      let refreshSubscribeFlag=false
      tmplIds.forEach(tmplId=>{
        if(res[tmplId] == "accept"){
          refreshSubscribeFlag=true
          let tmplateMap = app.globalData.tmplIds
          Object.entries(tmplateMap).forEach(([key, value])=>{
            if(tmplId==value){
              // console.log("a.subscribeTimes",app.globalData.subscribeTimes)
              // console.log("a.globalData",app.globalData)

              if(app.globalData.subscribeTimes && app.globalData.subscribeTimes[key]){
                app.globalData.subscribeTimes[key]=app.globalData.subscribeTimes[key]+1
              }else{
                if(app.globalData.subscribeTimes){
                  app.globalData.subscribeTimes[key]=1
                }else{
                  app.globalData.subscribeTimes={}
                  app.globalData.subscribeTimes[key]=1
                }
                // app.globalData.subscribeTimes[key]=1
              }
            }
          })
        }
      })
      // console.log("openSubscribeMessage subscribeInfo",app.globalData.subscribeInfo)
      // console.log("refreshSubscribeFlag",refreshSubscribeFlag)

      // 必须要再刷新配置信息一次，不然如果这里永久同意了，像新回复通知，在首页点击进入详情的时候并不会执行requestSubscribeMessage加次数，因为globaldata保存的还是旧配置
      if(refreshSubscribeFlag){
        app.getSubscribeInfo()
      }
      
    },
    fail(err) {
          // console.log("error",err)
      // 失败直接执行方法得了，不用再反复提示了，因为用户点击永久同意后，就不会再弹窗，如果失败这里无缘无故谈了个窗也有点奇怪
      method(param)
      // subscribeMessageFail(method,param,tmplIds);
    }

    // 下面这个就是如果拒绝了，就再提示一下
    // complete: async(res) => {
    //   console.log("res",res)
    //   tmplIds.forEach(item => {
    //     if(res[item] == "accept"){
    //       // console.log("订阅举报成功")
    //     }
    //     if (res[item] === 'reject') {
    //       // console.log('拒绝')
    //       wx.showModal({
    //         title: '温馨提示',
    //         showCancel:false,
    //         content: '您没有接受订阅，会导致消息接收不及时，建议在设置中打开消息通知',
    //         complete: (res) => {
    //         }
    //       })
    //     }
    //   })
    //   method(param)
    // }
  })
}

// 授权失败
function subscribeMessageFail(method,param,tmplIds){
  let that = this;
  wx.showModal({
    title: '提示',
    content:'授权失败，是否重新授权？',
    success (res) {
      if (res.confirm) {
        openSubscribeMessage(method,param,tmplIds);
      } else if (res.cancel) {
        method(param)
      }
    }
  })
}

function dingyueOnlyHandleMuban(method,param,tmplIds){
  // const tmplIds = this.tmplIds
  const that = this;
  // https://blog.csdn.net/m0_61087678/article/details/132173717
    
    wx.getSetting({
      withSubscriptions: true, // 是否获取用户订阅消息的订阅状态，默认false不返回
      success(res) {
//         console.log('res', res)
        if (res.subscriptionsSetting.mainSwitch) {
          // 用户已开启总开关
          let itemSettings = res.subscriptionsSetting.itemSettings;
          if (itemSettings) {
            //判断模板是否全部授权过
            for(let i=0; i<tmplIds.length; i++){
              let key = tmplIds[i];
              if(itemSettings[key]==null){
                // 说明用户没有选择 总是保持以上选择,所以设置中没有这个模板的订阅记录，此时打开订阅消息提示
                onSettingNotSubscribeMessage(method,param,tmplIds);
                return
              }
            }
            method(param)
          } else {
            onSettingNotSubscribeMessage(method,param,tmplIds);
          }
        }else{
          method(param)
        }
      },
      fail(e){
        method(param)
      }
    })

}

const px2rpx = (px) => (px / getApp().globalData.windowWidth) * 750
const rpx2px = (rpx) => (rpx / 750) * getApp().globalData.windowWidth

function isPropertyValid(obj, prop){
  // if(obj===null || obj===undefined){
  //   return false;
  // }
  // return prop in obj && obj[prop] !== null && obj[prop] !== undefined;

  // 或者下面这种方式，使用Optional Chaining 和Nullish Coalescing检查对象属性
  return obj?.[prop] !== null && obj?.[prop] !== undefined
}

function formatText(content, length) {
  // 去掉回车，换行
  // console.log("contentcontent",content)
  const cleanedText=content.replace(/[\r\n]+/g, ' ');
  const truncatedText = cleanedText.length>length?cleanedText.slice(0,length) + '...':cleanedText;
  return truncatedText
}

const checkPostFrequencyLimit = () => {
  const lastPostTime = wx.getStorageSync('lastPostTime') || 0;
  const currentTime = new Date().getTime();
  const oneMinute = 60 * 1000;
  
  if (currentTime - lastPostTime < oneMinute) {
    return {
      allowed: false,
      message: '发帖太频繁，请稍后再试'
    };
  }
  return {
    allowed: true
  };
};

const checkDailyPostLimit = () => {
  const today = new Date().toDateString();
  const dailyPostCount = wx.getStorageSync('dailyPostCount') || {};
  
  if (dailyPostCount.date !== today) {
    dailyPostCount.date = today;
    dailyPostCount.count = 0;
    wx.setStorageSync('dailyPostCount', dailyPostCount);
  }
  
  if (dailyPostCount.count >= 20) {
    return {
      allowed: false,
      message: '今日发帖已达上限'
    };
  }
  return {
    allowed: true
  };
};

function checkContentDuplicate(content) {
  const recentPosts = wx.getStorageSync('recentPosts') || [];

  const SIMILARITY_THRESHOLD = 0.85; 
  const MIN_LENGTH = 10; 

  const oneDay = 24 * 60 * 60 * 1000;
  const currentTime = new Date().getTime();
  const validPosts = recentPosts.filter(post => currentTime - post.time < oneDay);
  
  return validPosts.some(post => {

    const similarity = getStringSimilarity(content, post.content);
    return similarity > SIMILARITY_THRESHOLD;
  });
}

const updatePostRecord = (content) => {
  const currentTime = new Date().getTime();

  wx.setStorageSync('lastPostTime', currentTime);

  const dailyPostCount = wx.getStorageSync('dailyPostCount') || {
    date: new Date().toDateString(),
    count: 0
  };
  dailyPostCount.count += 1;
  wx.setStorageSync('dailyPostCount', dailyPostCount);

  const recentPosts = wx.getStorageSync('recentPosts') || [];

  const oneDay = 12 * 60 * 60 * 1000;
  const validPosts = recentPosts.filter(post => currentTime - post.time < oneDay);
  
  validPosts.push({
    content: content,
    time: currentTime
  });
  wx.setStorageSync('recentPosts', validPosts);
};

function getStringSimilarity(str1, str2) {
  
  const cleanStr1 = str1.replace(/[^\u4e00-\u9fa5a-zA-Z0-9]/g, '').toLowerCase();
  const cleanStr2 = str2.replace(/[^\u4e00-\u9fa5a-zA-Z0-9]/g, '').toLowerCase();
  
  if (cleanStr1 === cleanStr2) return 1;
  if (cleanStr1.length === 0 || cleanStr2.length === 0) return 0;

  const matrix = [];
  for (let i = 0; i <= cleanStr1.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= cleanStr2.length; j++) {
    matrix[0][j] = j;
  }
  
  for (let i = 1; i <= cleanStr1.length; i++) {
    for (let j = 1; j <= cleanStr2.length; j++) {
      if (cleanStr1[i-1] === cleanStr2[j-1]) {
        matrix[i][j] = matrix[i-1][j-1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i-1][j-1] + 1,
          matrix[i][j-1] + 1,
          matrix[i-1][j] + 1
        );
      }
    }
  }

  const maxLength = Math.max(cleanStr1.length, cleanStr2.length);
  const similarity = 1 - matrix[cleanStr1.length][cleanStr2.length] / maxLength;
  return similarity;
}

module.exports = {
  formatTime,
  formatTimeMinute,
  timeStamp2FormatTime,
  timeStamp2ReadableTime,
  timeStamp2ReadableTimeDay,
  cos,

  uploadAvatar,
  getYear,
  getMonth,
  getDay,
  isAuthed,
  isForbidden,
  getNowWeek,
  throttle: throttle,
  getZodiac,
  shareAddScoreRestrictTimes,
  getTodayFormat,
  replaceTextWithEmoji,
  replaceTextWithEmojiString,
  dingyue,
  rpx2px,
  px2rpx,
  isPropertyValid,
  generateCosKey,
  formatText,

  checkPostFrequencyLimit,
  checkDailyPostLimit,
  checkContentDuplicate,
  updatePostRecord,
  getStringSimilarity,
}
