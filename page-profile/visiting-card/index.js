
import { User } from "../../models/user"

import { Topic } from "../../models/topic"
import { Star } from "../../models/star"
import util from '../../utils/util.js'
const app = getApp()
Page({
  userTopicPaging: null,  
  userCollectPaging: null,  
  commentPaging: null,  
  navigateIndex:null,
  observer:null,
  userId:null,
  data: {
    user: {avatar:'', nickName:''},
    topics: [],

    userTopics:[],
    userCollects:[],
    comments: [],
    tabIndex: 0,  
    tabsTop: 300, 
    genderText: "Ta", 
    
    userTopicHasMore: true, 
    hasMoreComment: true, 
    userCollectHasMore: true, 

    hasMore:true,

    tabsFixed: false, 
    loading: false,
    selfUserId:-1,

    userCollectScrollTop:0,
    userTopicScrollTop:0,
    
    showTop:false,
    selectTab:"article",
   
    swiper_height:0,

    navigateBackChat:false,

    initLoading: true,
    articleNodata:false,
    collectNodata:false,
    
    reportReasonShow: false,
    reportReasonList:
    [{
      name: '违反法律或违反校规',
    },
    {
      name: '传播低俗、色情、暴力',
    }, 
    {
      name: '侮辱谩骂或钓鱼引战',
    },
    {
      name: '涉嫌商业牟利、营销引流',
    }, 
    {
      name: '暴露隐私、人肉搜索',
    },
    {
      name: '令人感到不适的其他理由',
    }],

    showPopup:false,
    isBanSixin:false,
    isBanLookme:false,
  },

  onLoad(options) {
    this.createIntersectionObserver();
    this.setData({
      
      selfUserId: app.globalData.userInfo.userId,
      navigateBackChat:options.chatting==="true",  
      navHeight: app.globalData.navHeight,

    })

    this.userId=options.userId
    
    this.getUserInfo(options.userId)
    this.isBlacked()
  },

  createIntersectionObserver(){
    const that = this;
    const observer=wx.createIntersectionObserver(this,{thresholds:[0.26,0.98]});
    this.observer=observer
    observer.relativeToViewport() 
    .observe('#top-trigger', (res)=>{
      
      if(res.intersectionRatio < 0.26) {
        that.setData({tabsFixed: true})
      }else{
        that.setData({tabsFixed: false})
      }

      if(res.intersectionRatio < 0.98) {
        that.setData({showNavigate: true})
      }else{
        that.setData({showNavigate: false})
      }
    })
  },

  onShow() {
    this.navigateIndex=null
    if (!this.data.user?.userId) {
      return
    }
    this.getUserInfo(this.data.user.userId, false)
   
  },

  onUnload(){
    if(this.observer){
      this.observer.disconnect()
    }
  },

  async getUserInfo(userId, loadPage = true) {
    const user = await User.getUserInfo(userId)
    
    if (user) {
      this.setData({
        user: user
      })

      if (loadPage) {
        this.initUserCollects(userId)
        this.initUserTopics(userId)
      }
    }else{
      wx.showToast({
        title: '网络异常',
        icon:'error'
      })
    }
  },

  updateThumbUp(thumbUpStatus, thumbUpCount){
    
    if(this.data.selectTab=="article"){
      this.setData({
        [`userTopics[${this.navigateIndex}].thumbUpStatus`]:thumbUpStatus,
        [`userTopics[${this.navigateIndex}].thumbUpCount`]:thumbUpCount
      })
    }else if(this.data.selectTab=="collect"){
      this.setData({
        [`userCollects[${this.navigateIndex}].thumbUpStatus`]:thumbUpStatus,
        [`userCollects[${this.navigateIndex}].thumbUpCount`]:thumbUpCount
      })
    }
  },

  updateCollect(collectStatus, collectCount){
    if(this.data.selectTab=="article"){
      this.setData({
        [`userTopics[${this.navigateIndex}].collectStatus`]:collectStatus,
        [`userTopics[${this.navigateIndex}].collectCount`]:collectCount
      })
    }else if(this.data.selectTab=="collect"){
      this.setData({
        [`userCollects[${this.navigateIndex}].collectStatus`]:collectStatus,
        [`userCollects[${this.navigateIndex}].collectCount`]:collectCount
      })
    }
  },

  updateCommentCount(commentCount){

    if(this.data.selectTab=="article"){
      this.setData({
        [`userTopics[${this.navigateIndex}].commentCount`]:commentCount,
      })
    }else if(this.data.selectTab=="collect"){
      this.setData({
        [`userCollects[${this.navigateIndex}].commentCount`]:commentCount,
      })
    }

  },
  updateDeleteStatus(){
    
    if(this.data.selectTab=="article"){
      this.setData({
        [`userTopics[${this.navigateIndex}].hasDelete`]:true,
      })
    }else if(this.data.selectTab=="collect"){
      this.setData({
        [`userCollects[${this.navigateIndex}].hasDelete`]:true,
      })
    }
  },

  updateVoteInfo(voteOptionList, peopleNum){
    if(this.data.selectTab=="article"){
      this.setData({
        [`userTopics[${this.navigateIndex}].voteArticle.voteOptionList`]:voteOptionList,
        [`userTopics[${this.navigateIndex}].voteArticle.peopleNum`]:peopleNum
      })
    }else if(this.data.selectTab=="collect"){
      this.setData({
        [`userCollects[${this.navigateIndex}].voteArticle.voteOptionList`]:voteOptionList,
        [`userCollects[${this.navigateIndex}].voteArticle.peopleNum`]:peopleNum
      })
    }
  },

  updateLotteryInfo(participantCnt, hasJoined){

    if(this.data.selectTab=="article"){
      this.setData({
        [`userTopics[${this.navigateIndex}].lottery.participantCnt`]:participantCnt,
        [`userTopics[${this.navigateIndex}].lottery.hasJoined`]:hasJoined
      })
    }else if(this.data.selectTab=="collect"){
      this.setData({
        [`userCollects[${this.navigateIndex}].lottery.participantCnt`]:participantCnt,
        [`userCollects[${this.navigateIndex}].lottery.hasJoined`]:hasJoined
      })
    }

  },

  async initUserTopics(userId) {
    const params = {
      userId: userId,
    }
    const topicPaging = await Topic.getTopicUserPaging(params)

    this.userTopicPaging=topicPaging
    
    await this.getMoreUserTopics(topicPaging)
    if(this.data.initLoading){
      this.setData({
        initLoading:false
      })
    }
  },

  async getMoreUserTopics(userTopicPaging) {
    const data = await userTopicPaging.getMore()
    if (!data) {
      return
    }
    
    if (data.newList.length === 0) {
      if (data.page === 1) {
        this.setData({
          articleNodata: true,
          userTopicHasMore: false,
          loading: false,
          userTopics:[]
        })
      }else{
        this.setData({
          userTopicHasMore: false,
          loading: false,
          articleNodata:false   
        })
      }
    }else if(this.data.userTopics.length==0){
      this.setData({
        userTopics: data.accumulator,
        userTopicHasMore: data.hasMore,
        loading: false,
        articleNodata:false 
      })
    }else{
      const length=this.data.userTopics.length
      const topicToAdd={}
      data.newList.forEach((item,index)=>{
        topicToAdd[`userTopics[${length+index}]`]=item;
      })
      topicToAdd["userTopicHasMore"]=data.hasMore
      topicToAdd["loading"]=false
      topicToAdd["articleNodata"]=false
      this.setData(topicToAdd)
    }

    this.autoHeight()
  },

  async initUserCollects(userId) {
    const params = {
      userId: userId,
    }
    const userCollectPaging = await Star.getStarUserPaging(params)

    this.userCollectPaging=userCollectPaging
    await this.getMoreUserCollects(userCollectPaging)
    if(this.data.initLoading){
      this.setData({
        initLoading:false
      })
    }
  },

  async getMoreUserCollects(userCollectPaging) {
    const data = await userCollectPaging.getMore()
    if (!data) {
      return
    }
    if (data.newList.length === 0) {
      if (data.page === 1) {
        this.setData({
          collectNodata: true,
          userCollectHasMore: false,
          loading: false,
          userCollects:[]
        })
      }else{
        this.setData({
          userCollectHasMore: false,
          loading: false,
          collectNodata:false
        })
      }
      return
    }
    
    if(this.data.userCollects==null){
      this.setData({
        userCollects: data.accumulator,
        userCollectHasMore: data.hasMore,
        loading: false,
        collectNodata:false
      })
    }else{
      const length=this.data.userCollects.length
      const topicToAdd={}
      data.newList.forEach((item,index)=>{
        topicToAdd[`userCollects[${length+index}]`]=item;
      })
      topicToAdd["userCollectHasMore"]=data.hasMore
      topicToAdd["loading"]=false
      topicToAdd["collectNodata"]=false
      this.setData(topicToAdd)
    }

    this.autoHeight()
  },

  onFollowTap() {

  },

  gotoChatRoom(){
    
    if(this.data.navigateBackChat){
      wx.navigateBack()
    }else{

        let tmpUser=this.data.user
        if(tmpUser.admin || tmpUser.userId==5717750 || tmpUser.userId==2848551 || tmpUser.userId==8041839 || tmpUser.userId==7039319){
            tmpUser.userId=7777777
        }
      wx.navigateTo({
        url: "/page-notification/chat-room/index?toUser=" + encodeURIComponent(JSON.stringify(tmpUser)),
      })
    }
   
  },
  
  gotoTopicDetail(event) {
    
    const index = event.currentTarget.dataset.index

    var topics = this.data.userTopics
    if(this.data.selectTab=="collect"){
      topics = this.data.userCollects
    }
    
    const topic = topics[index]
    let url = "/page-topic/topic-detail/index?"

    if (event.type === "commentIconTap") {
      url += "focus=true&"
    }

    this.navigateIndex=index

    wx.navigateTo({

      url: url + "topic=" + encodeURIComponent(JSON.stringify(topic))
      
    })
  },

  changeTabs(event) {
    this.setData({
      selectTab:event.detail.activeKey,
    })
    this.autoHeight()

  },

  autoHeight() {
    
    let {
      selectTab
    } = this.data;

    wx.createSelectorQuery().in(this)
    .select('#end' + selectTab).boundingClientRect()
    .select('#start' + selectTab).boundingClientRect().exec(rect => {
          
          let _space = rect[0].top - rect[1].top;

          if(_space < 500){
            _space=500
          }
          this.setData({
            swiper_height: _space
          });
        })
  },

  changeTabsSecondary(event){

    this.setData({
      selectTab:event.detail.activeKey
    })
  },

  async onReachBottom() {
    const selectTab = this.data.selectTab
    this.setData({
      loading: true
    })
    if (selectTab === "article") {
      await this.getMoreUserTopics(this.userTopicPaging)
    }

    else if (selectTab === "collect") {
      await this.getMoreUserCollects(this.userCollectPaging)
    }
    this.setData({
      loading: false
    })
  },

  async onReachBottomScrollView() {
    const selectTab = this.data.selectTab
    this.setData({
      loading: true
    })
    if (selectTab === "article") {
      await this.getMoreUserTopics(this.userTopicPaging)
    }

    else if (selectTab === "collect") {
      await this.getMoreUserCollects(this.userCollectPaging)
    }
    this.setData({
      loading: false
    })
  },

  onShareTab(event){
    const index = event.currentTarget.dataset.index
    var topics = this.data.userTopics
    if(this.data.selectTab=="collect"){
      topics = this.data.userCollects
    }
    const topic = topics[index]
    this.targetTopic=topic
  },

  onShareAppMessage(options) {
    
    if(util.shareAddScoreRestrictTimes()){
      User.shareAddScore()
      wx.showToast({
        title: '分享U币+1',
      })
    }

    if(options.from=='button'){
      const topic = this.targetTopic
      
      return {
        title: topic.content,
        
        imageUrl: topic.imgUrlList?.length>0? "https://" + topic.imgUrlList[0].url:'',
        path: "/pages/topic/index?topicId=" + topic.id + "&shareUserId="+this.data.userId+ "&authorId="+topic.userId
      }
    }else if(options.from=='menu'){
      return {
        title: "红狐生态圈",
        path: "/pages/topic/index"
      }
    }

  },

  lookUserInfo(){
    wx.navigateTo({
      url: '/page-profile/visiting-card/user-info/index?userInfo='+JSON.stringify(this.data.user),
    })
  },

  async onThumbUpTap(event) {

    const index = event.currentTarget.dataset.index

    var thumbUpStatus= event.detail.thumbUpStatus
    var thumbUpCount= event.detail.thumbUpCount
 
    if(this.data.selectTab=="article"){
      this.setData({
        [`userTopics[${index}].thumbUpStatus`]:thumbUpStatus,
        [`userTopics[${index}].thumbUpCount`]:thumbUpCount
      })
    }else{
      this.setData({
        [`userCollects[${index}].thumbUpStatus`]:thumbUpStatus,
        [`userCollects[${index}].thumbUpCount`]:thumbUpCount
      })
    }

  },

  async vote(e){

    const index = e.currentTarget.dataset.index
    var topic = this.data.userTopics[index]

    if(this.data.selectTab=="collect"){
      topic = this.data.userCollects[index]
    }
    topic.voteArticle.voteOptionList = e.detail.voteOptionList

  },

  async onJoinLottery(e) {

    const index = e.currentTarget.dataset.index
    var topic = this.data.userTopics[index]

    if(this.data.selectTab=="collect"){
      topic = this.data.userCollects[index]
    }
   
    topic.lottery.participantCnt = e.detail.participantCnt
    topic.lottery.hasJoined = e.detail.hasJoined

  },

  showActions(event) {
    const index = event.currentTarget.dataset.index
    
    var topics = this.data.userTopics
    if(this.data.selectTab=="collect"){
      topics = this.data.userCollects
    }
    const topic = topics[index]
    this.targetTopic=topic
    this.topicIndex=index

    var actions = [{
      name: "分享",
      color: "#666",
      openType: "share"
    }]
    
    if(this.data.selfUserId != topic.userId){
      const action = {
        name: "举报",
        color: "#666"
      }
      actions.push(action)

    }
    
    if (this.data.selfUserId === topic.userId || this.data.selfUserId==7777777) {
      const action = {
        name: "删除",
        color: "#d81e06"
      }
    
      actions.push(action)
      
    } 

    this.setData({ 
      actions:actions,
      actionsShow: true,
    });
  },

  actionClose() {
    this.setData({ actionsShow: false });
  },

  actionSelect(event) {
    if (event.detail.name === "收藏" ||event.detail.name === "取消收藏" ) {
      this.collectTopic()
    }else if (event.detail.name === "分享") {
    } else if(event.detail.name === "删除") {
      this.deleteTopic()
    } else if(event.detail.name === "举报") {
      this.reportTopic()
    }
  },

  deleteTopic() {
    const topicIndex = this.topicIndex
    var topics = this.data.userTopics
    if(this.data.selectTab=="collect"){
      topics = this.data.userCollects
    }
    const topic = topics[topicIndex]
    const that =this
    wx.showModal({
      title: '确定删除帖子？',
      content: '删除帖子操作不可撤销，且在一周内不可发布重复内容，请确认是否要删除帖子',
      complete: async(res) => {
        if (res.cancel) {
        }
        if (res.confirm) {
          const res = await Topic.deleteTopic(topic.id)
          if (res) {
            wx.showToast({
              title: '删除成功',
              icon: 'success'
            })

            if(this.data.selectTab=="article"){
              this.setData({
                [`userTopics[${this.topicIndex}].hasDelete`]:true,
              })
            }else if(this.data.selectTab=="collect"){
              this.setData({
                [`userCollects[${this.topicIndex}].hasDelete`]:true,
              })
            }
          } else {
            wx.showToast({
              title: '删除失败',
              icon:"error"
            })
          }

          if(topic.top){
            const res = await Topic.cancelTop(topic.id,topic.schoolId)
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
  
  collectTopic(){
    const topicIndex = this.topicIndex
    var topics = this.data.userTopics
    if(this.data.selectTab=="collect"){
      topics = this.data.userCollects
    }
    const topic = topics[topicIndex]

    const hasCollect = topic.collectStatus
    const collectStatus = !topic.collectStatus
    var collectCount = topic.collectCount

    if (hasCollect) {
      collectCount--
    } else {
      collectCount++
    }

    if(this.data.selectTab=="article"){
      this.setData({
        [`userTopics[${this.navigateIndex}].collectStatus`]:collectStatus,
        [`userTopics[${this.navigateIndex}].collectCount`]:collectCount
      })
    }else if(this.data.selectTab=="collect"){
      this.setData({
        [`userCollects[${this.navigateIndex}].collectStatus`]:collectStatus,
        [`userCollects[${this.navigateIndex}].collectCount`]:collectCount
      })
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

  reportTopic() {
    this.setData({ reportReasonShow: true });
  },

  reportReasonListClose() {
    this.setData({ reportReasonShow: false });
  },

  reportReasonSelect:util.throttle(async function(event) {
    const topicIndex = this.topicIndex
    var topics = this.data.userTopics
    if(this.data.selectTab=="collect"){
      topics = this.data.userCollects
    }
    const topic = topics[topicIndex]

    const param = {
      "articleId":topic.id,
      "reason":event.detail.name,
      "reportedUserId":topic.userId
    }
    const res = await Topic.reportTopic(param)
    if (res) {
      wx.showToast({
        title: '举报成功',
      })
    } else {
      wx.showToast({
        title: '请重试',
      })
    }
   
  }, 1500),

  moreAction(){
    
    this.setData({
      showPopup:true
    })
  },
  
  closePopup() {
    this.setData({ showPopup: false });
  },

  banSixin(){
    this.setData({
      isBanSixin:!this.data.isBanSixin
     
    })
  },

  banLookme(){
    this.setData({
      isBanLookme:!this.data.isBanLookme
    })
  },

  banUser(){
    wx.showModal({
      title: '确定要封禁该用户吗',
      content: '',
      complete: async(res) => {
       
        if (res.confirm) {
          const param={
            userId:this.userId
          }
          const res = await User.banUser(param)
          
          if (res=="success") {
            this.setData({
              'user.accountStatus':"禁止编辑"
            })
          }else{
            wx.showToast({
              title: '网络异常',
              icon:'error'
            })
          }
        }
      }
    })
  },
  
  unbanUser(){
    wx.showModal({
      title: '确定解封吗',
      content: '',
      complete: async(res) => {
        if (res.confirm) {
          const param={
            userId:this.userId
          }
          const res = await User.unbanUser(param)
          
          if (res=="success") {
            this.setData({
              'user.accountStatus':"正常"
            })
          }else{
            wx.showToast({
              title: '网络异常',
              icon:'error'
            })
          }
        }
      }
    })
  },

  async isBlacked(){
    const res = await User.isBlacked({
      "targetUserId":this.userId,
    })

    if(res=='error'){
      wx.showToast({
        title: '网络超时',
        icon:'error'
      })
    }else{
      this.setData({
        isBlacked:res
      })
    }
  },

  blackUser(){
    wx.showModal({
      title: '确定要拉黑该用户吗',
      content: '',
      complete: async(res) => {
       
        if (res.confirm) {
          this.closePopup()
          const param={
            targetUserId:this.userId
          }
          const res = await User.blackUser(param)
          
          if (res=="success") {
            this.setData({
              isBlacked:true
            })
          }else{
            wx.showToast({
              title: '网络异常',
              icon:'error'
            })
          }
        }
      }
    })
  },
  
  unblackUser(){
    this.closePopup()
    wx.showModal({
      title: '确定解除拉黑吗',
      content: '',
      complete: async(res) => {
        if (res.confirm) {
          const param={
            targetUserId:this.userId
          }
          const res = await User.unblackUser(param)
          
          if (res=="success") {
            this.setData({
              isBlacked:false
            })
          }else{
            wx.showToast({
              title: '网络异常',
              icon:'error'
            })
          }
        }
      }
    })
  },

})
