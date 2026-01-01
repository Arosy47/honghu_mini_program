
import wxutil from "../../miniprogram_npm/@yyjeffrey/wxutil/index"
import { Topic } from "../../models/topic"
import { Comment } from "../../models/comment"
import { Star } from "../../models/star"

import { User } from "../../models/user"
import util from '../../utils/util.js'
import {cos} from "../../utils/util"

const app = getApp()

Page({

  commentPaging:null,
  reportType:null,
  reportId:null,
  keyBoardListener:null,
  selectedCommentEvent:null,

  now_reply_type: 0, 
  now_parent_comment_id: 0, 
  now_reply_comment_id: 0, 
  topicId:null,

  imageMode:"aspectFill",
  imgHeight : 200, 
  imgWidth : 200, 

  refreshing:false,

  toUserNickName: null, 
  toUserId: null,

  cursorPos: 0, 
  
  data: {

    userId: -1,

    comment_list: [],

    totalCommentCount:0,

    focus: false, 
    maskShow:false,
    placeholder: '说点什么...', 
    placeholder2: '说点什么，让ta也认识看笔记的你', 
    comment_text: null, 

    stars: [],
   
    topic: {hasDelete:false}, 
  
    articleActionsShow:false,
    commentActionsShow: false,

    reportReasonShow: false,
    reportReasonList:
    [{
      name: '违反法律或违反校规',
    },
    {
      name: '传播低俗、色情、暴力',
    }, {
      name: '侮辱谩骂或钓鱼引战',
    },
    {
      name: '涉嫌商业牟利、营销引流',
    }, {
      name: '暴露隐私、人肉搜索',
    },
    {
      name: '令人感到不适的其他理由',
    }],

    sortShow:false,
    sortList:[{
      name: '按时间排序',
    },
    {
      name: '按热度排序',
    }],

    pickerVisiable: false,

    InputBottom: 0, 

    navigationHeight: app.globalData.CustomBar,

    initKeyboardHeight:0,
    emojiheight:0,

    safeAreaBottom:0,

    scrollViewReverse:false,
    
    loading:true,

    inputAutoSiza: { maxHeight: 100, minHeight: 10 },
    hasMore: true, 
    
    commentLoading:true,
    initCommentLoading:true,
    nodata:false,
    
    isSinglePage:null,

    order:"time",

    refreshText: '下拉刷新', 

    commentSubscribeTimes:null,
    isSubscribe:false, 

    imageFile: null,
    toptenCurrent:0,
    showInfoConfig:null,
  },

  onLoad(options) {

    if(app.isSinglePage){  
      this.setData({
        shareUserId:options.shareUserId,
        isSinglePage:true
      })
      this.topicId=options.topicId

      this.getTopicDetail()
      this.initComments()
      
      return
    }

    if(options.shareUserId){

      this.setData({
        shareUserId:options.shareUserId,
      })

    }

    app.globalData.loginPromise.then(()=>{
      this.init(options)
    })
  },

  init(options){

    const dataToSet={}

    if (this.data.userId==-1 && app.globalData.userInfo) {

      dataToSet["userId"]=app.globalData.userInfo.userId
      
    } 
   
    var windowHeight=null
    if(!app.globalData.nonTabBarPageWindowHeight){
      const systemInfo = wx.getWindowInfo()
      app.globalData.nonTabBarPageWindowHeight = systemInfo.windowHeight;
      windowHeight=systemInfo.windowHeight
    }else{
      windowHeight=app.globalData.nonTabBarPageWindowHeight
    }
    dataToSet["windowHeight"]=windowHeight
    dataToSet["stickTop"]=app.globalData.CustomBar
    dataToSet["navTop"]=app.globalData.navTop
    dataToSet["showInfoConfig"]=app.globalData.showInfoConfig

    var safeAreaBottom=this.data.safeAreaBottom
    
    if(app.globalData.safeArea){
      safeAreaBottom=windowHeight - app.globalData.safeArea.bottom
    }
    dataToSet["safeAreaBottom"]=safeAreaBottom

    var initKeyboardHeight=this.data.initKeyboardHeight
    
    const newInitKeyboardHeight = wx.getStorageSync('initKeyboardHeight')
    if(newInitKeyboardHeight){
      initKeyboardHeight=newInitKeyboardHeight
    }
    dataToSet["initKeyboardHeight"]=initKeyboardHeight

    const initfocus = options.focus
    var focus=this.data.focus
    var maskShow=this.data.maskShow
    var InputBottom=this.data.InputBottom
    
    if (initfocus) {
      focus=true
      maskShow=true
      
    }
    dataToSet["focus"]=focus
    dataToSet["maskShow"]=maskShow

    if(!app.globalData.subscribeTimes){
      
      const that = this
      app.getSubscribeTimes(()=>{
        
        that.setData({
          commentSubscribeTimes:app.globalData.subscribeTimes.NEW_COMMENT,
        })
      })
    }else{
      
      dataToSet["commentSubscribeTimes"]=app.globalData.subscribeTimes.NEW_COMMENT
    }

    if(!app.globalData.subscribeInfo){
      const that = this
      app.getSubscribeInfo(()=>{
        
        if(app.globalData.subscribeInfo&&app.globalData.subscribeInfo["NEW_COMMENT"]){
          that.setData({
            isSubscribe:true,
          })
        }
      })
    }else{
      if(app.globalData.subscribeInfo["NEW_COMMENT"]){
        dataToSet["isSubscribe"]=true
      }
    }

    if(options.topic){
      var decodeStr = decodeURIComponent(options.topic);
      var article = JSON.parse(decodeStr)

      dataToSet["topic"]=article
      dataToSet["loading"]=false
      this.toUserId= article.userId,
      this.toUserNickName= article.anonymous?article.anonymousName:article.userNickName,
      this.topicId=article.id
      
    }else{
      
      this.topicId=options.topicId
      
      this.getTopicDetail()
    }

    dataToSet["yasuoTopTen"] = app.yasuoTopTen
    this.setData(dataToSet)
    this.initComments()
    this.incrementViewIfNotInCooldown()

    const that = this
    const listener = function (res) { 
      console.log("handleKeyboardHeightChange",res.height)
      if(res.height>0){
        that.setData({
          InputBottom: res.height
        })

      }else{
        
        if(!that.data.pickerVisiable){
          that.setData({
            InputBottom:0
          })
        }
      }
    }
    this.keyBoardListener=listener
    wx.onKeyboardHeightChange(this.keyBoardListener)
  },

  incrementViewIfNotInCooldown(){
   
    const articleId=this.topicId
    Topic.addViewCount({articleId:articleId})

  },

  onShow() {
    
  },

  onUnload(){
    if(this.keyBoardListener){
      wx.offKeyboardHeightChange(this.keyBoardListener)
    }
  },

  async getTopicDetail() {

    const params = {
      id: this.topicId
    }
    const data = await Topic.getTopicDetail(params)
    
    if(data=="error"){
      this.setData({
        
        loading:false,
        initCommentLoading:false,
        refreshText: '刷新失败'
      })
      setTimeout(()=>{
        wx.stopPullDownRefresh({
          complete:()=>{
            this.setData({
              refreshText: '立即刷新'
            })
            this.refreshing=false
          }
        })
      }, 600)
      return
    }else if(data==null||data.hasDelete){

      this.setData({
        topic: data,

        loading:false,
        initCommentLoading:false   
      })
    }else{
      
      this.setData({
        topic: data,
        loading:false
      })
      this.toUserId= data.userId
      this.toUserNickName= data.anonymous?data.anonymousName:data.userNickName

    }

    if(this.refreshing){
      this.setData({
        refreshText: '刷新成功'
      })
      setTimeout(()=>{
        wx.stopPullDownRefresh({
          complete:()=>{
            this.setData({
              refreshText: '立即刷新'
            })
            this.refreshing=false
          }
        })
      }, 600)
    }

  },

  async initComments() {
    const params = {
      articleId: this.topicId,
      userId:this.data.userId,
      order:this.data.order,
    }
   
    this.data.comment_list=[]
    const commentPaging = await Comment.getCommentTopicPaging(params)
    this.commentPaging=commentPaging
    await this.getMoreComments(commentPaging)

    if(this.data.initCommentLoading){
      this.setData({
        initCommentLoading:false
      })
    }
  },

  async getMoreComments() {
    const data = await this.commentPaging.getMore()
   
    if (!data) {
      return
    }

    if (data.newList.length === 0) {
      if (data.page === 1) {
        this.setData({
          nodata: true,
          hasMore: false,
          commentLoading: false,
          comment_list:[]
        })
      }else{
        this.setData({
          hasMore: false,
          commentLoading: false,
          nodata:false
        })
      }
      return
    }

    if(this.data.comment_list.length==0){
      this.setData({
        comment_list: data.accumulator,
        hasMore: data.hasMore,
        commentLoading: false,
        nodata:false
      })
    }else{
      const length=this.data.comment_list.length
      const commentToAdd={}
      data.newList.forEach((item,index)=>{
        commentToAdd[`comment_list[${length+index}]`]=item;
      })
      commentToAdd["hasMore"]=data.hasMore
      commentToAdd["commentLoading"]=false
      commentToAdd["nodata"]=false
      this.setData(commentToAdd)
    }
    
  },

  async onReachBottom() {
    
    if(this.data.hasMore){
      const topicPaging = this.topicPaging
      this.setData({
        commentLoading: true
      })
      await this.getMoreComments(topicPaging)

    }
  },

  gotoCategory(event) {

    const labelId = event.detail.categoryCode

    var url = `/page-topic/category-detail/index?labelId=${labelId}`

    wx.navigateTo({
      url: url
    })

  },

  async onStarTap() {
    const topic = this.data.topic
    
    const res = await Star.starOrCancel(topic.id)
    if (res.statusCode === 200) {
      const hasStar = topic.has_star
      topic.has_star = !topic.has_star

      if (hasStar) {
        topic.star_count--
      } else {
        topic.star_count++
      }

      this.setData({
        topic: topic
      })
    }
  },

  showActions() {
    const articleActions=[{
      name: "分享给朋友",
      color: "#666",
      openType: "share"
      }
      ,{
        name: "海报分享",
        color: "#666",
      }
    ]
    if(this.data.topic.userId !== app.globalData.userInfo.userId) {
      const action = {
        name: "举报",
        color: "#666"
      }

      articleActions.push(action)
    }

    if (this.data.topic.userId === app.globalData.userInfo.userId || app.globalData.userInfo.userId==7777777) {
      const action = {
        name: "删除",
        color: "#d81e06"
      }
      articleActions.push(action)
    } 
    
    this.setData({ 
      articleActions: articleActions,
      articleActionsShow: true 
    });
  },

  reportTopic() {
    this.setData({ reportReasonShow: true });
    this.reportType="article"
    this.reportId=this.topicId
  },

  deleteTopic() {
    const that = this;
    wx.showModal({
      title: '确定删除帖子？',
      content: '删除帖子操作不可撤销，且在一周内不可发布重复内容，请确认是否要删除帖子',
      complete: async(res) => {
        if (res.cancel) {
          
        }
    
        if (res.confirm) {
          const res = await Topic.deleteTopic(that.data.topic.id)
          if (res) {

            wx.showToast({
              title: '删除成功',
              icon:"success",
              success:() => {
                
                const pages=getCurrentPages();
                const listPage=pages[pages.length-2];
                if(listPage&&typeof listPage.updateDeleteStatus==='function'){
                  listPage.updateDeleteStatus()
                }

                if(that.data.shareUserId){
                  wx.switchTab({
                    url: '/pages/topic/index',
                  });
                }else{
                  wx.navigateBack({
                    delta: 1,
                  });
                }

              }
            })
          } else {
            wx.showToast({
              title: '删除失败',
              icon:"error"
            })
          }

          if(that.data.topic.top){
            const res = await Topic.cancelTop(that.data.topic.id,that.data.topic.schoolId)
            if (res) {
              wx.showToast({
                title: '取消置顶成功',
                icon: 'success'
              })
            } else {
              wx.showToast({
                title: '取消置顶失败',
                icon:"error"
              })
            }
          }
        }
      }
    })
  
  },

  onCommentItemTap(event) {

    this.selectedCommentEvent=event
    var commentActions = [{
      name: "回复",
      color: "#666",
    }, {
      name: "复制",
      color: "#666"
    }]

    if(this.data.userId != event.detail.toUserId){
      const action = {
        name: "举报",
        color: "#666"
      }

      commentActions.push(action)

    }

    if (app.globalData.userInfo.userId === event.detail.toUserId || app.globalData.userInfo.userId==7777777) {
      const action = {
        name: "删除",
        color: "#d81e06"
      }
      commentActions.push(action)

    } 
    
    this.setData({ 
      onCommentActions: commentActions,
      commentActionsShow: true 
    });

  },

  reportReasonListClose() {
    this.setData({ reportReasonShow: false });
  },

  reportReasonSelect:util.throttle(async function(event) {

    const reportType = this.reportType
    const reportId = this.reportId

    if(reportType){
    if( reportType === "articleComment"){
      const param = {
        "articleCommentId":reportId,
        "reason":event.detail.name,
        "reportedUserId":this.selectedCommentEvent.detail.toUserId 
      }
      
      const res = await Comment.reportComment(param)
      if (res) {
        wx.showToast({
          title: '举报成功',
          icon:"success"
        })
      } else {
        wx.showToast({
          title: '请重试',
          icon:"error"
        })
      }
      
    }else if ( reportType === "article"){
      
      const param = {
        "articleId":reportId,
        "reason":event.detail.name,
        "reportedUserId":this.data.topic.userId
      }
      const res = await Topic.reportTopic(param)
      if (res) {
        wx.showToast({
          title: '举报成功',
          icon:"success"
        })
      } else {
        wx.showToast({
          title: '请重试',
          icon:"error"
        })
      }
    }
   }

  }, 1500),

  actionClose() {
    this.setData({ commentActionsShow: false });
  },

  actionSelect(event) {

    if (event.detail.name === "回复") {
      this.replyComment(this.selectedCommentEvent)
    } else if (event.detail.name === "复制") {
      wx.setClipboardData({
        data: this.selectedCommentEvent.detail.commentText,
        success(res){
          wx.showToast({
            title: '复制成功',
            icon:'none'
          })
        }
      })
    } else if(event.detail.name === "删除") {
      this.deleteComment()
    } else if(event.detail.name === "举报") {
      this.reportComment(this.selectedCommentEvent.detail.cid)
    }
  },

  sortOpen() {
    this.setData({ sortShow: true });
  },

  sortClose() {
    this.setData({ sortShow: false });
  },

  sortSelect(event) {

    if (event.detail.name === "按时间排序") {
      this.setData({
        order:"time"
      })
    } else if (event.detail.name === "按热度排序") {
      this.setData({
        order:"hot"
      })
    } 
    this.initComments()
  },

  reportComment(commentId) {
    this.setData({ reportReasonShow: true });

    this.reportType="articleComment"
    this.reportId=commentId
  },

  onCommentIconTap() {
    if(this.data.initKeyboardHeight>0){
      this.setData({
        focus: true,
        maskShow: true,
        InputBottom: this.data.initKeyboardHeight,
      })
    }else{
      this.setData({
        focus: true,
        maskShow: true,
      })
    }
    
  },

  setComment(event) {
    
    this.setData({
      comment_text: event.detail.value,
    })
    this.cursorPos=event.detail.cursor
  },

  deleteComment() {
    wx.showModal({
      title: '',
      content: '确定要删除该评论？',
      complete: async(res) => {
        if (res.cancel) {
        }
      
        if (res.confirm) {
          wx.showLoading({
            title: '删除中',
          })
          var detail = this.selectedCommentEvent.detail
          const res = await Comment.deleteComment(detail.cid)
          if (res) {

            if(detail.replyType==1){

              this.setData({
                [`comment_list[${detail.parentIndex}].hasDelete`]:true,
              })

            }else if(detail.replyType==2){

              var comment = this.data.comment_list[detail.parentIndex]
              comment.replyList[detail.subIndex].hasDelete=true
              this.setData({
                [`comment_list[${detail.parentIndex}]`]:comment,
              })
            }

            wx.hideLoading()

          } else {
            wx.hideLoading()
            wx.showToast({
              title: '删除失败请重试',
              icon:"error"
            })
          }
        }
      }
    })
    
  },

  onShareAppMessage(options) {
    if(util.shareAddScoreRestrictTimes()){
      User.shareAddScore()
      wx.showToast({
        title: '分享U币+1',
      })
    }

    const topic = this.data.topic
    var title=topic.content
    if(topic.functionType=='VOTE'){
      var indexList = []
      var optionList = topic.voteArticle.voteOptionList
      for(var i=0;i<optionList.length;i++){
        if(optionList[i].userVoteStatus==true){
          indexList.push(i+1)
        }
      }
     
      if(indexList.length>0){
        title="我在投票中选了"+indexList+",你选哪个呢？"
      }
    }
    
    return {
      title: title,

      path: "/pages/topic/index?topicId=" + topic.id + "&shareUserId="+this.data.userId + "&authorId="+topic.userId
    }
  },

  onShareTimeline() {
    if(util.shareAddScoreRestrictTimes()){
      User.shareAddScore()
      wx.showToast({
        title: '分享U币+1',
      })
    }

    const topic = this.data.topic
    return {
      title: topic.content,
      query: "topicId=" + topic.id+ "&shareUserId="+this.data.userId,
      
      imageUrl: topic.imgUrlList?.length>0? "https://" + topic.imgUrlList[0].url:'',
    }

  },

  async onThumbUpTap(event) {
    
    const topic = this.data.topic

    const hasStar = topic.thumbUpStatus
    const thumbUpStatus = !topic.thumbUpStatus
    var thumbUpCount = topic.thumbUpCount

    if (hasStar) {
      thumbUpCount--
    } else {
      thumbUpCount++
    }

    this.setData({
      'topic.thumbUpStatus':thumbUpStatus,
      'topic.thumbUpCount':thumbUpCount
    })

    const pages=getCurrentPages();
    const lastPage=pages[pages.length-2];
    if(lastPage&&typeof lastPage.updateThumbUp==='function'){
      
      lastPage.updateThumbUp(thumbUpStatus, thumbUpCount)
    }

    if(this.thumbArticleTimerId){
      
      clearTimeout(this.thumbArticleTimerId);
    }
    this.thumbArticleTimerId=setTimeout(async() => {

      const params = {
        articleId: topic.id,
        targetUserId: topic.userId,
        thumbUpStatus:topic.thumbUpStatus
      }
      const res = await Star.thumbUpOrCancel(params)

    }, 1500);
  },

  async onCollectTap(event) {
    const topic = this.data.topic

    const hasCollect = topic.collectStatus
    const collectStatus = !topic.collectStatus
    var collectCount = topic.collectCount

    if (hasCollect) {
      collectCount--
    } else {
      collectCount++
    }
    this.setData({
      'topic.collectStatus':collectStatus,
      'topic.collectCount':collectCount
    })

    const pages=getCurrentPages();
    const listPage=pages[pages.length-2];
    if(listPage&&typeof listPage.updateCollect==='function'){
      listPage.updateCollect(collectStatus, collectCount)
    }

    if(this.collectArticleTimerId){
      
      clearTimeout(this.collectArticleTimerId);
    }
    this.collectArticleTimerId=setTimeout(async() => {

      const params = {
        articleId: topic.id,
        targetUserId: topic.userId,
        collectStatus:topic.collectStatus
      }

      const res = await Star.collectArticleOrCancel(params)

    }, 2000);

  },

  async onDingTap(event) {
    const topic = this.data.topic

    if(topic.dingStatus == true){
      const result = await Star.dingOrCancel(topic.id)
      
      if (result) {
        topic.dingStatus = !topic.dingStatus
        this.setData({
          topic: topic
        })
      }
    }else{

    }
  },

  async onPullDownRefresh() {
    if (this.refreshing) {
      return;
    }
   
    this.refreshing=true
  
    this.getTopicDetail()
    this.initComments()
  },

  replyComment(e) {
    
    var cid = e.detail.cid; 
    var nickName = e.detail.nickName; 
    var parentId = e.detail.parentId; 
    var toUserId = e.detail.toUserId; 

    var replyType = e.detail.replyType; 
    this.setData({
        focus: true, 
        maskShow:true,
        placeholder: '回复' + nickName + '：', 

    })
    this.toUserId= toUserId
    this.toUserNickName= nickName 
    this.now_reply_comment_id= cid 
    this.now_parent_comment_id= parentId 
    this.now_reply_type= replyType 
  },

  onExpandReply(e){
    this.pageQueryReply(e.detail.cid)
  },

  async pageQueryReply(cid) {
    const params = {
      articleId: this.topicId,
      parentCommentId:cid
    }
    const replyPaging = await Comment.getCommentReplyPaging(params)
  
    await this.getMoreReplys(replyPaging,cid)
  },

  async getMoreReplys(replyPaging,cid) {
    const data = await replyPaging.getMore()
    if (!data) {
      return
    }

    var cList = this.data.comment_list
    for(var i=0;i<cList.length;i++){
      if(cList[i].id=== cid){

        this.setData({
          [`comment_list[${i}].replyList`]:data.accumulator,
        })
        break
      }
    } 
  },

  getTodayString(){

    const date = new Date();
    const year = date.getFullYear();
    const month = (date.getMonth()+1).toString().padStart(2,'0');
    const day = date.getDate().toString().padStart(2,'0');
    return `${year}-${month}-${day}`;
  },

  checkAndUpdateSceneLimit(scene, maxLimit){
    const today=this.getTodayString();
    
    var record=wx.getStorageSync('scoreTimes')||{};

    if(!record.date||record.date!=today){
      record={
        date:today,
        commentScoreTimes:0,   
        articleScoreTimes:0   
      }
    }
    if(record[scene]<maxLimit){
      record[scene]+=1
      wx.setStorageSync('scoreTimes', record)
      return true;
    }
    return false;

  },

  onCommentBtnTap() {

    if(util.isForbidden()){
      return
    }

    const content = this.data.comment_text
    if (!wxutil.isNotNull(content) && this.data.imageFile==null) {
      wx.showToast({
        title: '内容不能为空',
        icon:'none'
      })
      return
    }

    this.uploadImageAndSendComment(content)
  },
  
  uploadImageAndSendComment :util.throttle(function (content) {
    wx.showLoading({
      title: '回复中',
      mask:true
    })
  
    if (this.data.imageFile == null) {
      const param={
        content:content, 
        imgUrl:null, 
        type:"WORD"
      }
     
      this.remindSubscribeAndSendComment(param)
      return;
    }

    var key = util.generateCosKey('comment', this.data.imageFile, 0, new Date())

    const that =this

    cos.putObject(
      {
        Bucket: 'campus-alliance-1316743522',
        Region: 'ap-shanghai',
        Key: key,
        FilePath: this.data.imageFile,

      },
      (err, data) => {
        
        if (data) {
          var location=data.Location
          
          location=location.replace("img.honghu.com","cdn.honghu.com");

          var img={
            "key":key,
            "url":location,
            "imageMode":that.imageMode,
            "height":that.imgHeight,
            "width":that.imgWidth
          }

          const param={
            content:content, 
            imgUrl:img, 
            type:"PICTURE"
           }
          that.remindSubscribeAndSendComment(param)
          
        } else {
          wx.hideLoading()
          wx.showToast({
            title: '上传失败',
            icon:'error'
          })
          
          this.deleteCommentImage(key)
        }
      },
    );
  },2000),

  remindSubscribeAndSendComment(param){

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
    }else{
      
      util.dingyue(()=>{}, null, [app.globalData.tmplIds.NEW_COMMENT],'new_comment_subscribe_remind_timestamp')
    }
    this.sendComment(param)
  },

  async sendComment(param){
    const content=param.content
    const imgUrl=param.imgUrl
    const type=param.type
    
    this.setData({
      pickerVisiable: false,
      InputBottom: 0,
      maskShow: false,
      focus:false,
    })

    var parentCommentId = 0; 
    var replyCommentId = this.now_reply_comment_id; 
    
    if(replyCommentId != 0) {
      
      var reply_type = this.now_reply_type; 
      
    }
    
    if (reply_type == 1) {
      
      parentCommentId = this.now_reply_comment_id; 
    } else {
      
      parentCommentId = this.now_parent_comment_id; 
    }

    var anonymous=false
    if(this.data.topic.anonymous){

      anonymous=true
    }
   
    const data = {
      commentType:type,
      content: content,
      imgUrl: imgUrl,
      articleId: this.topicId, 
      userId:app.globalData.userInfo.userId,
      schoolId:this.data.topic.schoolId,

      toUserNickName: this.toUserNickName, 
      toUserId: this.toUserId,
      replyCommentId: replyCommentId,
      parentCommentId: parentCommentId,
      
      anonymous:anonymous
    }

    const res = await Comment.sendComment(data);
    
    if (res&&res!="illegal") {

      const commentList = this.data.comment_list
      if(replyCommentId != 0) {

        var userName=app.globalData.userInfo.nickName
        var avatar=app.globalData.userInfo.avatar?.url
        if(anonymous){
          if(app.globalData.userInfo.userId === this.data.topic.userId){
            userName=this.data.topic.userNickName
            avatar=this.data.topic.avatar
          }else{
            userName=app.globalData.userInfo.anonymousName
            avatar=app.globalData.userInfo.anonymousAvatar?.url
          }
        }

        const reply={
          id:res,
          commentType:type,
          
          content: content,
          imgUrl: imgUrl,
          articleId: this.topicId, 
          userId:app.globalData.userInfo.userId,
          avatar:avatar,
          userNickName: userName, 
          toUserNickName: this.toUserNickName, 
          toUserId: this.toUserId,
          replyCommentId: replyCommentId,
          parentCommentId: parentCommentId,
          createTime:"刚刚"
        }
  
        commentList.map((item,index)=>{
          if(item.id==parentCommentId){
            
            if(item.replyList){
              var newReplyList=item.replyList
              newReplyList.push(reply)
              this.setData({
                [`comment_list[${index}].replyList`]:newReplyList,
              })
            }else{
              this.setData({
                [`comment_list[${index}].replyList`]:[reply],
              })
            }
          }
        })

      }else{

        await this.initComments()

      }

      wx.hideLoading()

      const topic = this.data.topic
      
      topic.hasComment = true
      topic.commentCount++

      this.setData({
        topic: topic,
        comment_text: null,
        
        placeholder: "说说你的想法",
       
        InputBottom:0,

        nodata:false,
        imageFile:null
      })
      this.toUserNickName= topic.anonymous?topic.anonymousName:topic.userNickName
      
      this.toUserId= this.data.topic.userId
      this.now_reply_comment_id=0  
      this.now_parent_comment_id=0
      this.now_reply_type=0

      const pages=getCurrentPages();
      const listPage=pages[pages.length-2];
      if(listPage&&typeof listPage.updateCommentCount==='function'){
        listPage.updateCommentCount(topic.commentCount)
      }

      const success = this.checkAndUpdateSceneLimit('commentScoreTimes',5)
      if(success){
        wx.showToast({
          title: '评论成功U币+1',
          icon: "none"
        })
        
      }else{
        wx.showToast({
          title: '评论成功',
          icon: "none"
        })

      }
    } else {
      
      wx.hideLoading()
      if(res=="illegal"){
        wx.showToast({
          title: '内容违规',
          icon:'none'
        })
      }else{
        wx.showToast({
          title: '评论失败请重试',
          icon:"error"
        })
      }
      if(imgUrl){
        this.deleteCommentImage(imgUrl.key)
      }
    }
  },

  deleteCommentImage(key){
    if(key == null || key==""){
      
      return
    }
    cos.deleteObject({
      Bucket: 'campus-alliance-1316743522',
      Region: 'ap-shanghai',
      Key: key,  
    }, function(err, data) {
        
    });
  
  },

  getCommentText(e) {
    var val = e.detail.value;
    this.setData({
      comment_text: val
    })
  },

  articleActionClose() {
    this.setData({ articleActionsShow: false });
  },

  articleActionSelect(event) {

    if (event.detail.name === "分享给朋友") {

    }else if (event.detail.name === "海报分享") {
      this.gotoSharePoster()
    } else if(event.detail.name === "删除") {
      this.deleteTopic()
    } else if(event.detail.name === "举报") {
      this.reportTopic()
    }
  },

  gotoSharePoster(){
    let url = "/page-topic/share-poster/index?"
    
    wx.navigateTo({
      url: url +"type=article&" + "topic=" + encodeURIComponent(JSON.stringify(this.data.topic))
    })
  },
  
  InputBlur(e){
    this.cursorPos=e.detail.cursor
  },

  InputFocus(e) {

    this.setData({
      pickerVisiable: false,

    })

    if(this.data.initKeyboardHeight===0){
      const initKeyboardHeight = wx.getStorageSync('initKeyboardHeight')
      if(initKeyboardHeight){
        this.setData({
          initKeyboardHeight:initKeyboardHeight,
          
        })
      }else {
        this.setData({
          initKeyboardHeight:e.detail.height,
          
        })
        wx.setStorageSync('initKeyboardHeight',e.detail.height)
      }
    }

  },

  clickInput(){
    
    this.setData({
      focus:true,
      maskShow:true
    })
  },

  showEmoji() {
    if(this.data.initKeyboardHeight===0){
      
      wx.showToast({
        title: '请先点击输入框',
        icon:'none'
      })
      return
    }

    this.setData({
      pickerVisiable: true,
      maskShow:true,
      focus:false,

      InputBottom: this.data.initKeyboardHeight,

    })

  },

  showKeyBoard(){
    this.setData({
      focus:true,
      maskShow:true,
      pickerVisiable:false
    })
  },

  onSelect(event) {
    
    const emojiUrl = event.detail.emojiUrl
    const replaceText = event.detail.replace
    
    var content = this.data.comment_text

    const cursorPos = this.cursorPos
    if(content==null){
      this.setData({
        comment_text: replaceText,
      })
      this.cursorPos=cursorPos+replaceText.length
    }else{
      const newText=content.slice(0, cursorPos)+replaceText+content.slice(cursorPos)
      this.setData({
        
        comment_text:newText,
      })
      this.cursorPos=cursorPos+replaceText.length
    }

  },

  onClickHide() {
    this.setData({
      pickerVisiable: false,
      InputBottom: 0,
      maskShow: false,
      focus:false
    })
  },

  calculate(height, width){
    if(height>=width){
      var ratio=height/width
      if(height/width>2){
        this.imageMode="aspectFill"
        this.imgHeight = 180
        this.imgWidth = 90
      }else if(height/width>1.3){
        this.imageMode="aspectFill"
        this.imgHeight = 175
        this.imgWidth = 175 / ratio
      }else{
        this.imageMode="aspectFill"
        this.imgHeight = 160
        this.imgWidth = 160 / ratio
      }
    }else{
      var ratio=width/height
      if(ratio>2){
        this.imageMode="aspectFill"
        this.imgHeight = 125
        this.imgWidth = 250
      }else if(ratio>1.3){
        this.imageMode="aspectFill"
        this.imgWidth = 200
        this.imgHeight = 200/ratio
      }else{
        this.imageMode="widthFix"
        this.imgWidth = 175
        this.imgHeight = 175/ratio
      }
    }
  },

  selectImage(){

    const that=this

    wx.chooseMedia({
      count: 1,
      mediaType:['image'],
      
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        var tempFilePath=res.tempFiles[0].tempFilePath
        this.setData({
          imageFile:tempFilePath
        })

        wx.getImageInfo({
          src: tempFilePath,
          complete:(info)=>{

            if(info.height){
              this.calculate(info.height,info.width)
            }
          }
        }) 
      }

    });

  },

  removeSelectedImg(){
    this.setData({
      imageFile:null
    })
  },

  previewSelectedCommentImage(event) {
    
    app.globalData.preImgStatus=true  
    wx.previewImage({
      current: event.currentTarget.dataset.src,
      urls: [event.currentTarget.dataset.src]
    })
   },

  back(){

    if(this.data.shareUserId){
      wx.switchTab({
        url: '/pages/topic/index',
      });
    }else{
      wx.navigateBack({
        delta: 1,
      });
    }
  },

  async vote(e){

    const pages=getCurrentPages();
    const listPage=pages[pages.length-2];
    if(listPage&&typeof listPage.updateVoteInfo==='function'){
      listPage.updateVoteInfo(e.detail.voteOptionList,e.detail.peopleNum)
    }
  },

  async onJoinLottery(e) {
    const pages=getCurrentPages();
    const listPage=pages[pages.length-2];
    if(listPage&&typeof listPage.updateLotteryInfo==='function'){
      listPage.updateLotteryInfo(e.detail.participantCnt, e.detail.hasJoined)
    }
  },

  touchend(){
    this.setData({
      pickerVisiable: false,
      InputBottom: 0,
      maskShow: false,
      focus:false
    })
  },

  blurblur(){

    this.setData({
      pickerVisiable: false,
      InputBottom: 0,
      maskShow: false,
      focus:false
    })
  },

  async showGroupQrCode(){
     
    app.globalData.preImgStatus=true  
    const wxGroupQrCodeUrl = await Topic.getWxGroupQrCode()
    if(wxGroupQrCodeUrl){
      const url="https://"+wxGroupQrCodeUrl+'!article_big'
      wx.previewImage({
        current: url,
        urls: [url]
      })
    }else{
      wx.showToast({
        title: '请重试',
      })
    }
  },

    gotoChat:util.throttle(async function(event) {
    
    if(this.data.topic.userId === this.data.userId) {
      wx.showToast({
        title: '不能和自己聊天',
        icon: 'none'
      })
      return
    }

    if(this.data.topic.anonymous) {
      wx.showToast({
        title: '匿名用户无法私信',
        icon: 'none'
      })
      return
    }
    const publisher={
      userId:this.data.topic.userId,
      nickName:this.data.topic.userNickName,
      avatar:{'url':this.data.topic.avatar},
    }
    wx.navigateTo({
      url: "/page-notification/chat-room/index?toUser=" + encodeURIComponent(JSON.stringify(publisher)),
      success(){
       
      }
    })

    const param = {
      articleId:this.data.topic.id
    }
    Topic.plusChatCnt(param)
  },1500),

  async doEnd(){
    let topic = this.data.topic
    const param = {
      articleId:topic.id
    }
    const res = await Topic.endSecondHand(param)
    if(res=='success'){
      topic.secondHand.status=2
      this.setData({
        topic:topic
      })
    }else{
      wx.showToast({
        title: '网络异常',
        icon:'none'
      })
    }
  },

  gotoTopTen() {

    if(util.isPropertyValid(app.globalData.subscribeInfo, "HOT_ARTICLE")){
      
      if(util.isPropertyValid(app.globalData.subscribeTimes, "HOT_ARTICLE") && app.globalData.subscribeTimes?.HOT_ARTICLE < 10){  

        wx.requestSubscribeMessage({
          tmplIds:[app.globalData.tmplIds["HOT_ARTICLE"]],
          success(res) {
            
            if(res[app.globalData.tmplIds["HOT_ARTICLE"]] == "accept"){
              app.globalData.subscribeTimes.HOT_ARTICLE=app.globalData.subscribeTimes.HOT_ARTICLE+1
            }else{
              
              app.getSubscribeInfo()
            }
          },
          fail(err) {

            util.dingyue(()=>{}, null, [app.globalData.tmplIds.HOT_ARTICLE],'hot_article_subscribe_remind_timestamp',1)
          }
        })
      }
    }else{

      util.dingyue(()=>{}, null, [app.globalData.tmplIds.HOT_ARTICLE],'hot_article_subscribe_remind_timestamp',1)
    }

    wx.navigateTo({
      url: '/page-topic/top-ten/index'
    })
  },

  adLoad() {
    console.log('原生模板广告加载成功')
  },
  adError(err) {
    console.error('原生模板广告加载失败', err)
  },
  adClose() {
    console.log('原生模板广告关闭')
  },
})
