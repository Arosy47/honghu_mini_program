
import api from "../../config/api"
import wxutil from "../../miniprogram_npm/@yyjeffrey/wxutil/index"

import { Topic } from "../../models/topic"

import {cos} from "../../utils/util"

import util from '../../utils/util.js'

const app = getApp()

Page({
  fromPublishPage:false,
  keyList:null,
  imageFiles: [],
  ossImagePaths:[],
  voteValidDays:'',
  cursorPosition: 0, 

  latitude:null,
  longitude:null,

  imageMode:"aspectFill",
  imgHeight : 200, 
  imgWidth : 200, 

  data: {

    labels: [],
    
    labelsActive: [], 
    height: 420,  
    canAnon: true, 
    isAnon: false,  
    commentTemplateId: null, 
    content: '',
    video: null,
    title: null,
    selectLabel:null,
    
    showPopup:false,

    initKeyboardHeight:0,
    emojiheight:0,
    systemInfo:null,
    safeAreaBottom:0,
    focus:false,
    loading:false,
    categoryCode:null,

    sizeType: ['original','compressed'],
    showInfoConfig:null,

    voteOptions:[{optionContent:''},{optionContent:''}],

    lotteryPrizes:[{prizeName:'',prizeCount:'',prizeLevel:1}],
    lotteryConditions:"",

    lotteryEndDate: (()=>{
      const now = new Date();
      return now.getFullYear() + '-' +
        String(now.getMonth() + 1).padStart(2, '0') + '-' +
        String(now.getDate()).padStart(2, '0');
    })(),
    lotteryEndTime:  (()=>{
      const now = new Date();
      return String(now.getHours()).padStart(2, '0') + ':' +
             String(now.getMinutes()).padStart(2, '0') + ':' +
             String(now.getSeconds()).padStart(2, '0');
    })(),

    minDate: (()=>{
      const now = new Date();
      return now.getFullYear() + '-' +
        String(now.getMonth() + 1).padStart(2, '0') + '-' +
        String(now.getDate()).padStart(2, '0');
    })(),

    canMultiSelect: false,  
    isVote:false,
    address:null,
    isPosition:false,

    isFile:false,
    isVoice:false,
    isLottery:false,
  },

  onLoad(options) {
    
    if(options.fromPublishPage){
      this.fromPublishPage=true
    }
    this.categoryCode=options.categoryCode

    this.getAllCategory()

    var windowHeight=null
    if(!app.globalData.nonTabBarPageWindowHeight){
      const systemInfo = wx.getWindowInfo()
      app.globalData.nonTabBarPageWindowHeight = systemInfo.windowHeight;
      windowHeight=systemInfo.windowHeight
    }else{
      windowHeight=app.globalData.nonTabBarPageWindowHeight
    }

    var safeAreaBottom=this.data.safeAreaBottom
    if(app.globalData.safeArea){
      safeAreaBottom=windowHeight - app.globalData.safeArea.bottom
    }

    var initKeyboardHeight = wx.getStorageSync('initKeyboardHeight')
    if(!initKeyboardHeight){
      initKeyboardHeight=0
    }

    this.setData({
      initKeyboardHeight:initKeyboardHeight,
      stickTop:app.globalData.CustomBar,
      
      windowHeight: windowHeight,
      safeAreaBottom:safeAreaBottom,
      userInfo:app.globalData.userInfo
    })

  },

  onShow() {

    this.setData({
      showInfoConfig:app.globalData.showInfoConfig
    })

  },
  onUnLoad() {

  },

  setContent(event) {
    this.setData({
      content: event.detail.value,
    })

    this.cursorPosition= event.detail.cursor
  },

  setTitle(event) {
    this.setData({
      title: event.detail.value
    })
  },

  onAnon(){
    
    this.setData({
      isAnon:true,
    })
  },
  cancelAnon(){
    this.setData({
      isAnon:false
    })
  },

  onChangeImage(event) {

    this.imageFiles=event.detail.all

    if(event.detail.all.length==1){
      wx.getImageInfo({
        src: event.detail.all[0],
        success:(info)=>{
          
          this.calculate(info.height,info.width)
        }
      })
    }
  },

  calculate(height, width){
    if(height>=width){
      var ratio=height/width
      if(height/width>2){
        this.imageMode="aspectFill"
        this.imgHeight = 360
        this.imgWidth = 180
      }else if(height/width>1.3){
        this.imageMode="aspectFill"
        this.imgHeight = 350
        this.imgWidth = 350 / ratio
      }else{
        this.imageMode="aspectFill"
        this.imgHeight = 320
        this.imgWidth = 320 / ratio
      }
    }else{
      var ratio=width/height
      if(ratio>2){
        this.imageMode="aspectFill"
        this.imgHeight = 250
        this.imgWidth = 500
      }else if(ratio>1.3){
        this.imageMode="aspectFill"
        this.imgWidth = 400
        this.imgHeight = 400/ratio
      }else{
        this.imageMode="aspectFill"
        this.imgWidth = 350
        this.imgHeight = 350/ratio
      }
    }
  },

  onTagTap(event) {
    
    const labelId = event.currentTarget.dataset.label
    const labels = this.data.labels

    const label = labels.find(item => {
      return item.categoryCode === labelId
    })
    const newLabels = labels.map((item, index) => {
      if (item.categoryCode !== labelId) {
        item.active = false;
      } else {
        item.active = true
      }
      return item;
    })

    this.setData({
      labels: newLabels,
      selectLabel: label,
      showPopup:false
    })
  },

  onChangeVideo() {
    wx.chooseMedia({
      count: 9,
      mediaType: ["video"],
      sourceType: ["album", "camera"],
      maxDuration: 60,
      camera: "back",
      success: (res) => {
        const videoRes = res.tempFiles[0]
        this.setData({
          video: {
            src: videoRes.tempFilePath,
            cover: videoRes.thumbTempFilePath,
            duration: videoRes.duration,
            height: videoRes.height,
            width: videoRes.width,
            size: videoRes.size,
          }
        })
      }
    })
  },

  onDelVideo() {
    this.setData({
      video: null
    })
  },

  submitTopic() {

    if(util.isForbidden()){
      return
    }

    const content = this.data.content

    if (!wxutil.isNotNull(content)) {
      
      wx.showToast({
        title: '内容不能为空',
        icon:'error'
      })

      return
    }

    if (this.data.selectLabel==null) {
      wx.showToast({
        title: '请选择话题分类',
        icon:'error'
      })

      return 
    }
   
    if(util.checkContentDuplicate(content)){
      wx.showModal({
        title: '检测到发布重复内容',
        content: '如恶意刷贴会被封号',
        showCancel:false,
        complete: (res) => {
          if (res.confirm) {
            
          }
        }
      })
      return
    }

    if(this.data.isVote){
      
      if(!wxutil.isNotNull(this.voteValidDays)){
      
        wx.showToast({
          title: '请输入有效期',
          icon:'none'
        })
        return
      }
      var valid = this.data.voteOptions.find(item=>!wxutil.isNotNull(item.optionContent))
      if(valid){
        wx.showToast({
          title: '请填满选项',
          icon:'none'
        })
        return
      }
    }else if(this.data.isLottery){
      console.log("this.lotteryConditions",this.data.lotteryConditions)
      if(!wxutil.isNotNull(this.data.lotteryConditions)){
        wx.showToast({
          title: '请输入抽奖条件',
          icon:'none'
        })
        return
      }

      if(this.data.lotteryPrizes.length==0){
        wx.showToast({
          title: '请输入奖品',
          icon:'none'
        })
        return
      } 

      var invalid = this.data.lotteryPrizes.find(item => !wxutil.isNotNull(item.prizeName) || !wxutil.isNotNull(item.prizeCount))
      if(invalid){
        wx.showToast({
          title: '请填写完整奖品信息',
          icon:'none'
        })
        return
      }

      if(!wxutil.isNotNull(this.data.lotteryEndDate)){
        wx.showToast({
          title: '请选择日期',
          icon:'none'
        })
        return
      }
      if(!wxutil.isNotNull(this.data.lotteryEndTime)){
        wx.showToast({
          title: '请选择时间',
          icon:'none'
        })
        return
      }
    }

    this.setData({
      loading:true
    })

    if(util.isPropertyValid(app.globalData.subscribeInfo, "NEW_COMMENT")){
      
      if(util.isPropertyValid(app.globalData.subscribeTimes, "NEW_COMMENT") && app.globalData.subscribeTimes?.NEW_COMMENT < 20){  

        wx.requestSubscribeMessage({
          tmplIds:[app.globalData.tmplIds["NEW_COMMENT"]],
          success(res) {
            if(res[app.globalData.tmplIds["NEW_COMMENT"]] == "accept"){
              app.globalData.subscribeTimes.NEW_COMMENT=app.globalData.subscribeTimes.NEW_COMMENT+1
            }else{
              app.getSubscribeInfo()
            }
          },
          fail(err) {
            
            app.getSubscribeInfo()
          }
        })
      }
      this.uploadImage()
    }else{

      util.dingyue(this.uploadImage, null, [app.globalData.tmplIds.NEW_COMMENT],"new_comment_subscribe_remind_timestamp")
    }
    
  },

  uploadImage() {
    if (this.imageFiles.length == 0) {
      this.uploadTopic()
      return;
    }
    const that = this;

    const userId=app.globalData.userInfo.userId
    var keyList = []
    this.keyList=keyList

    var now = new Date();
    var fileList = this.imageFiles.map(function(file,index) {
      var key = util.generateCosKey('article', file, index, now)

      keyList.push(key)

      return Object.assign(file, {  
        FilePath: file, 
        
        Bucket: 'campus-alliance-1316743522',
        Region: 'ap-shanghai',
        Key: key, 
        onTaskReady: function(taskId) {

        },

      });
    });

    cos.uploadFiles({
      files: fileList,
      SliceSize: 1024 * 1024 * 10,    
      onProgress: function (info) {

      },
      onFileFinish: function (err, data, options) {

      },
    }, function (err, data) {

        var length = data.files.length
        if (length == that.imageFiles.length) {
          that.ossImagePaths=[]   
          var isError=false
          
          for(var index =0;index<length;index++){
            var value = data.files[index]
            
            if(value.error){
              isError=true
              break
            }else{
              var location=value.data.Location
              location=location.replace("img.honghu.com","cdn.honghu.com");

              that.ossImagePaths = that.ossImagePaths.concat({"key":keyList[index],"url":location});
            
            }
          }
          if(isError){
            wx.showToast({
              title: '发布失败请重试'+value.error,
              icon:"error"
            })
            that.setData({
              loading:false
            })
            that.deleteTopicImage(keyList)
          }else{
            that.uploadTopic()
          }

        }else{
          wx.showToast({
            title: '发布失败',
            icon:"error"
          })
          
          that.deleteTopicImage(keyList)

          that.setData({
            loading:false
          })
        }
    });

  },

  async uploadTopic() {
    const categoryCode = this.data.selectLabel.categoryCode;
    var displayType="WORD"
    if(this.imageFiles.length > 0){
      displayType = "PICTURE"
    }

    var functionType="NORMAL"

    var imgUrlList = this.ossImagePaths
    if(imgUrlList.length==1){
      imgUrlList[0].imageMode=this.imageMode
      imgUrlList[0].height=this.imgHeight
      imgUrlList[0].width=this.imgWidth
    }
    
    var data = {
      "title":this.data.title,
      "content":this.data.content, 
      "categoryCode": categoryCode,
      "imgUrlList":imgUrlList,
      "anonymous": this.data.isAnon,
      "displayType":displayType,
      "functionType":functionType,
    }

    if(this.data.isVote){
      
      functionType="VOTE"
      var voteParam={
        canMultiSelect:this.data.canMultiSelect,
        voteValidDays:this.voteValidDays,
        voteOptionList:this.data.voteOptions,
        functionType:functionType,
      }
      Object.assign(data, voteParam)
    }else if(this.data.isLottery){
      functionType="LOTTERY"
      var lotteryParam={
        
        conditions:this.data.lotteryConditions,
        lotteryPrizeList:this.data.lotteryPrizes,
        functionType:functionType,
        lotteryEndTime:this.data.lotteryEndDate+" "+this.data.lotteryEndTime,
        
      }
      Object.assign(data, lotteryParam)
    }

    const res = await Topic.publish(data)

    if(res=="success"){

      if(this.fromPublishPage){
        app.globalData.fromPublishArticle=true;
        app.globalData.jumpTo="CATEGORY";
        app.globalData.categoryToGo=categoryCode;
        wx.switchTab({
          url: '/pages/topic/index',
          complete(){
            wx.showToast({
              title: '发布成功',
              icon:'none'
            })
          }
        })
      }else{
        let pages = getCurrentPages()

        if(pages[pages.length-2].labelId!=categoryCode){
          app.globalData.fromPublishArticle=true;
          app.globalData.jumpTo="CATEGORY";
          app.globalData.categoryToGo=categoryCode;
          wx.switchTab({
            url: '/pages/topic/index',
            complete(){
              wx.showToast({
                title: '发布成功',
                icon:'none'
              })
            }
          })
        }else{
          wx.setStorageSync("refreshCategoryTopics", true)
          wx.navigateBack({
            complete(){
              wx.showToast({
                title: '发布成功',
                icon:'none'
              })
            }
          })
        }
      }

      util.updatePostRecord(this.data.content)

      this.setData({
        loading:false
      })

    }else{
      this.setData({
        loading:false
      })
      
      if(res=="illegal"){
        wx.showToast({
          title: '内容违规',
          icon:'none'
        })
      }else{
        wx.showToast({
          title: '发布失败',
          icon:'none'
        })
      }

      if(this.keyList){
        this.deleteTopicImage(this.keyList)
      }
    }
  },

  async getAllCategory() {

    var categoryList=null;
    if(app.categoryList){
      categoryList=app.categoryList
    }else{
      categoryList = await Topic.getAllCategory()
    }
    if(categoryList){
      app.categoryList=categoryList
      var labels=JSON.parse(JSON.stringify(categoryList))  
      var categoryCode = this.categoryCode
      if(categoryCode){
        
        const label = labels.find(item => {
          return item.categoryCode === categoryCode
        })
        const newLabels = labels.map((item, index) => {
          if (item.categoryCode !== categoryCode) {
            item.active = false;
          } else {
            item.active = true
          }
          return item;
        })
        this.setData({
          labels: newLabels,
          selectLabel: label
        })
      }else{
        this.setData({
          labels: labels
        })
      }
    }

  },

  deleteTopicImage(keyList){
    if(keyList == null || keyList.length==0){
      
      return
    }

    var deleteList=[]
    for(var i=0;i<keyList.length;i++){
      
      deleteList.push({Key:keyList[i]})
    }
    const that =this
    cos.deleteMultipleObject({
      Bucket: 'campus-alliance-1316743522',
      Region: 'ap-shanghai',
      Objects: deleteList
    }, function(err, data) {
      
      that.keyList=null
    });
  },

  showPopup() {
    if(this.data.labels.length==0){
      this.getAllCategory()
    }

    this.setData({
      showPopup:true
    })
  },

  closePopup() {
    this.setData({ showPopup: false });
  },

  inputBlur(e){
    
    this.cursorPosition = e.detail.cursor
  },
  
  InputFocus(e) {

    this.setData({
      
      pickerVisiable: false,
      focus:true,
    })

    if(this.data.initKeyboardHeight===0){
      const initKeyboardHeight = wx.getStorageSync('initKeyboardHeight')
      if(initKeyboardHeight){
        this.setData({
          initKeyboardHeight:initKeyboardHeight,
        })
      }else {
        if(e.detail.height>150){  
          this.setData({
            initKeyboardHeight:e.detail.height,
          })
          wx.setStorageSync('initKeyboardHeight',e.detail.height)
        }
      }
    }
  },

  showEmoji() {

    this.setData({
      pickerVisiable: true,
      
      focus:false,
    })
  },

  showKeyBoard(){

    this.setData({
      focus:true,
      
      pickerVisiable:false,
    })
  },

  onSelect(event) {

    const emojiUrl = event.detail.emojiUrl
    const replaceText = event.detail.replace
    
    var content = this.data.content

    var cursorPosition=this.cursorPosition

    if(content==null){
      this.setData({
        content: replaceText,
      })
      this.cursorPosition=cursorPosition+replaceText.length
    }else{
      const newText=content.slice(0, cursorPosition)+replaceText+content.slice(cursorPosition)

      this.setData({
        content:newText,
      })
      this.cursorPosition=cursorPosition+replaceText.length
    }

  },

  onPageScroll :util.throttle(function (res) {

    this.setData({
      pickerVisiable: false,
      
      focus:false
    })
    
  },1000),

  blurblur(){
    
    this.setData({
      pickerVisiable: false,
      
      focus:false
    })
  },

  stopBlur(){
    
  },

  onTouchEnd(){
    
    this.setData({
      pickerVisiable: false,

    })
  },

  showVote(){
    this.setData({
      isVote:true,
      pickerVisiable: false,
      
      focus:false,
      isLottery:false,
    })
  },
  cancelVote(){
    this.setData({
      isVote:false
    })
  },

  showLottery(){
    this.setData({
      isLottery:true,
      pickerVisiable: false,
      
      focus:false,
      isVote:false,
    })
  },
  cancelLottery(){
    this.setData({
      isLottery:false
    })
  },

  addVoteOption(){
    var options = this.data.voteOptions
    if(options.length>=10){
      wx.showToast({
        title: '最多10个选项',
      })
      return
    }
    options.push({optionContent:''})
    this.setData({
      voteOptions: options,
    })

  },

  deleteOption(e){
    
    var options = this.data.voteOptions
    
    options.splice(e.currentTarget.dataset.index, 1);
    this.setData({
      voteOptions:options
    })
  },

  setVoteOptions(e){
    
    const index = e.currentTarget.dataset.index;
    const value = e.detail.value;

    const key = `voteOptions[${index}]`
    this.setData({
      [key]:{optionContent:value}
    })
  },

  addPrize(){
    var prizes = this.data.lotteryPrizes
    if(prizes.length>=10){
      wx.showToast({
        title: '最多10个奖品',
      })
      return
    }
    prizes.push({
      prizeName:'',
      prizeCount:'',
      prizeLevel: prizes.length + 1 
    })
    this.setData({
      lotteryPrizes: prizes,
    })
  },

  setLotteryPrizeName(e){
    var prizes = this.data.lotteryPrizes
    const index = e.currentTarget.dataset.index;
    const prizeName = e.detail.value;
    const key = `lotteryPrizes[${index}]`

    const prizeCount = prizes[index].prizeCount || ''
    const prizeLevel = prizes[index].prizeLevel
    
    this.setData({  
      [key]:{
        prizeName: prizeName,
        prizeCount: prizeCount,
        prizeLevel: prizeLevel
      }
    })
  },

  setLotteryPrizeCount(e){
    var prizes = this.data.lotteryPrizes
    const index = e.currentTarget.dataset.index;  
    const prizeCount = e.detail.value;
    const key = `lotteryPrizes[${index}]`

    const prizeName = prizes[index].prizeName || ''
    const prizeLevel = prizes[index].prizeLevel
    
    this.setData({  
      [key]:{
        prizeName: prizeName,
        prizeCount: prizeCount,
        prizeLevel: prizeLevel
      }
    })
  },

  setConditions(e){
    const value = e.detail.value;
    this.setData({
      lotteryConditions:value
    })
  },

  setLotteryEndDate(e){
    const value = e.detail.value;
    console.log("setLotteryEndDate",value)
    this.setData({
      lotteryEndDate: value
    })
  },

  setLotteryEndTime(e){
    const value = e.detail.value;
    console.log("setLotteryEndTime",value)
    this.setData({
      lotteryEndTime: value
    })
  },

  canMultiSelect(event){

    this.setData({
      canMultiSelect: event.detail.value
    })
  },

  setVoteValidDays(event){
    
    this.voteValidDays=event.detail.value
  },

  chooseFile(){
    wx.showToast({
      title: '敬请期待',
      icon:'none'
    })
  },

  chooseVoice(){
    wx.showToast({
      title: '敬请期待',
      icon:'none'
    })
  },

  cancelPosition(){
    this.latitude=null
    this.longitude=null
    this.setData({
      address:null,
      isPosition:false
    })
  },

})
