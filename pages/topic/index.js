

import { Star } from "../../models/star"
import { Topic } from "../../models/topic"
import { User } from "../../models/user"
import { Notification } from "../../models/notification"

import util from '../../utils/util.js'

const app = getApp()

const rpx2px = (rpx) => (rpx / 750) * app.globalData.windowWidth
const px2rpx = (px) => (px / app.globalData.windowWidth) * 750

var ctx=null
Page({

  topicPaging: null,  
  categoryCode: "",

  targetTopic:null,

  navigateIndex:null,
  navigategroupIndex:null,
  showInfoConfig:null,
  shareTopicId:null,

  topicGroupIndex:null,
  topicIndex:null,

  refreshing:false,
  observerList:[],
  data: {
   
    labels: [],
    buttons: [{text: '取消'}, {text: '确认'}],
    modules: [],
    topics: [],
    topTen: [],
    
    userId: -1,
    admin: false, 
    hasMore: true, 
    loading: false, 

    navList:[],

    showPopup:false,

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

    actionsShow:false,
    suoxiao:false,

    scrollTop:0,

    minLoadingTime:500,  
    refreshStartTime:null,

    initLoading:true,
    nodata:false,

    autoplay:true,

    refreshText: '下拉刷新', 
    styleMap: [{ visible: true, height: 0 }],

    showTab:false,

    mySchool:null,
    strollSchool:null,
    
    newMatchChatMsgNum:0,
  },

  onLoad(options) {

    if(options.topicId){
      this.shareTopicId=options.topicId
    }else if(options.scene){
      let getQueryString={}
      const strs = decodeURIComponent(options.scene).split('&');
      for(var i=0;i<strs.length;i++){
        getQueryString[strs[i].split('=')[0]] = unescape(strs[i].split('=')[1])
      }
      
      this.shareTopicId = getQueryString['topicId'] || '';
    }
    
    const res = wx.getWindowInfo()

    if(app.globalData.windowHeight!==res.windowHeight){
      
      app.globalData.windowHeight = res.windowHeight;
    }

    this.createIntersectionObserver();
    
    app.globalData.loginPromise.then(()=>{
      
      this.init(options)
    })
  },

  createIntersectionObserver(){
    
    const that = this;
    const observer=wx.createIntersectionObserver(this);
    this.observer=observer
    observer.relativeToViewport({top:-100}) 
    .observe('#top-trigger', (res)=>{
      
      if(res.intersectionRatio > 0) {
        that.setData({showTopTen: false})
      }else{
        that.setData({showTopTen: true})
      }
    })

  },

  init(options){
     
    this.current = 0
		this.observerList = []

    this.deviceHeight=app.globalData.windowHeight-app.globalData.navTop
    this.setData({
      stickTop:app.globalData.CustomBar,

      CustomBar: app.globalData.CustomBar,

    })
   
    this.getMatchChatUnreadCount()
    this.getShowInfoConfig()

    this.getNavList()
    this.initTopics()
    this.getUserInfo()
    this.topTen()

    if(!app.globalData.subscribeTimes){
      app.getSubscribeTimes()
    }
    if(!app.globalData.subscribeInfo){
      app.getSubscribeInfo()
    }

    if(options.shareUserId){
      if(options.shareUserId==this.data.userId){
        
        return
      }
      if(options.authorId&&this.data.userId==options.authorId){
        
        return
      }
      const data = {
        shareUserId:options.shareUserId,
        authorId:options.authorId?options.authorId:-1, 
      }

    }

  },

  onShow() {
    
    this.navigateIndex=null
    this.navigategroupIndex=null

    if(app.globalData.freshHome==true){
      app.globalData.freshHome=false

      this.setData({
        navList:[]
      })
      wx.pageScrollTo({
        scrollTop: 0,
        duration:500,
        success:()=>{
          wx.startPullDownRefresh()
          this.onPullDownRefresh()
        }
      })
      
    }

    app.globalData.loginPromise.then(()=>{
      
    })
    
    this.onShowHandle()    
  },

  onShowHandle: util.throttle(async function (e) {
    const that = this
    if(this.shareTopicId){
      let url = "/page-topic/topic-detail/index?topicId="+this.shareTopicId
      wx.navigateTo({
        url: url,
        complete(value){
          
          that.shareTopicId=null;
        }
      })
      return
    }

      if(app.globalData.fromPublishArticle){
      var url = null;
      if(app.globalData.jumpTo=="CATEGORY"){
        const categoryCode = app.globalData.categoryToGo
        url = `/page-topic/category-detail/index?labelId=${categoryCode}`
      }else if(app.globalData.jumpTo=="ORGANIZATION"){
        url= '/page-organization/organization/index'
      }
      
      await this.delay(600)

      wx.navigateTo({
        url: url,
        complete(value){
          
          app.globalData.fromPublishArticle=false;
          app.globalData.categoryToGo=null;
          app.globalData.jumpTo=null;
        }
      })

      return
    };
    
    this.setData({
      autoplay:true
    })

    if(app.globalData.articleNum>0){
      wx.setTabBarBadge({
        index: 0,
        text: app.globalData.articleNum+''
      })
    }

    this.updateUnreadCount()

    if(app.globalData.userInfo){
      this.getMatchChatUnreadCount()
      this.getShowInfoConfig()
      this.getNavList()
      if(!app.globalData.subscribeTimes){
        
        app.getSubscribeTimes()
      }
      if(!app.globalData.subscribeInfo){
        app.getSubscribeInfo()
      }
    }

  }, 1500),

  delay(milSec){
    return new Promise(resolve=>{
      setTimeout(resolve, milSec);
    })
  },
  updateUnreadCount(){
    const msgNum = app.globalData.sixinNum+app.globalData.systemNoticeNum+app.globalData.thumbUpAndCollectNum+app.globalData.commentNum+app.globalData.organizationNum+app.globalData.deliveryNum
    
    if(msgNum==0){
      wx.removeTabBarBadge({
        index: 3,
      })
    }else{
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
    
  },

  onHide(){
    if(app.globalData.preImgStatus ==true) {
      app.globalData.preImgStatus=false
      return;
    }
    
    this.setData({
      autoplay:false
    })
    
  },

  onUnload(){
     
    if(this.observer){
      this.observer.disconnect()
    }

    this.observerList.forEach(observer => observer?.disconnect())
  },

  getShowInfoConfig: util.throttle(async function (e) {
    if(this.showInfoConfig){

      return
    }

    const showInfoConfig = await Topic.getShowInfoConfig()
    if(showInfoConfig){
      this.showInfoConfig=showInfoConfig
      app.globalData.showInfoConfig=showInfoConfig

    }

  }, 1000), 

  getNavList: util.throttle(async function (e) {
    if(this.data.navList.length>0){
      return
    }
    const navList = await Topic.getNavList()
    if(navList){
      const blockedTitles = ['匹配交友','组局','任务','闲置交易']
      const filtered = navList.filter(item => blockedTitles.indexOf(item.title) === -1)
      this.setData({
        navList:filtered
      })
    }
  }, 1000), 

  onTabItemTap(e) { 
    
    if (this.tabClick) {

      if(app.globalData.articleNum>0){
        wx.removeTabBarBadge({
          index:0
        })
        app.globalData.articleNum=0
      }
      
      wx.pageScrollTo({
        scrollTop: 0,
        duration:500,
        success:()=>{
          wx.startPullDownRefresh()
          this.onPullDownRefresh()
        }
      })

    }
    this.tabClick = true
    setTimeout(() => {
      this.tabClick = false 
    }, 200)
  },

  getUserInfo() {
    if (app.globalData.userInfo) {

      this.setData({
        userId: app.globalData.userInfo.userId,
        admin: app.globalData.userInfo.admin,
        
      })
      this.userInfo=app.globalData.userInfo

    } else {
      this.setData({
        userId: -1,
        admin: false
      })
    }
  },

  async initTopics() {
    const params = {
      categoryCode: this.categoryCode,
      functionType:"NORMAL",
      order:"time"
    }
    this.current = 0   
    const topicPaging = await Topic.getTopicPaging(params)
    this.topicPaging = topicPaging
    
    await this.getMoreTopics(topicPaging, true)

    if(this.data.initLoading){
      this.setData({
        initLoading:false
      })
    }
    
  },

  async getMoreTopics(topicPaging, isInit) {
    
    const data = await topicPaging.getMore()

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
    
    if (!data) {
      return
    }

    if(isInit){
      
      this.data.topics=[]
    }
    
    if (data.page === 1) {
      if(data.newList.length === 0){
        this.setData({
          nodata: true,
          hasMore: false,
          loading: false,
          topics:[]
        })
      }else{
        var topics = []
        topics[0]=data.newList
        this.setData({
          topics:topics,
          styleMap: [{ visible: true, height: 0 }],
          
          loading:false,
          hasMore:data.hasMore,
          nodata: false,
        })
      }
    }else if (data.newList.length === 0) {
      this.setData({
        hasMore: false,
        loading: false,
        
      })
    } else {
      const key = `topics[${this.current}]`
      const styleKey = `styleMap[${this.data.styleMap.length}]`

      this.setData({
        [key]: data.newList,
        [styleKey]: {
          visible: true,
          height: 0
        },
        loading:false,
        hasMore:data.hasMore
      })
    }
    
		this.current++
		wx.nextTick(() => {
			this.observeElement(this.current - 1)
		})

  },

  getStrollSchool: util.throttle(async function (e) {
    return
  },500),

  async queryStrollSchool(){
    this.setData({ strollSchool: null })
  },

  gotoChooseStrollSchool(){
    return
  },

  async getMySchool(){
    if(app.globalData.userInfo.schoolId){

      let mySchool = wx.getStorageSync("my_school")
      
      if(!mySchool){
        let res = await School.queryMySchool()
        if(res!='err'){
          this.setData({
            mySchool:res,  
            
          })
          app.globalData.mySchool = res
          
          wx.setStorage({
            key:'my_school',
            data:res,
          });
        }else{
          
          const that= this
          setTimeout(()=>{
            
            that.getMySchool()
          }, 500)
        }
      }else{
        this.setData({
          mySchool:mySchool,
          
        })
        app.globalData.mySchool=mySchool
        
      }
    }else{

    }
  },

  async topTen() {
    const param = {
      period:"TOP_TEN_DAY"
      
    }
    const topTen = await Topic.topTen(param)
    if(topTen){
      var yasuoTopTenOne=[]
      var yasuoTopTenTwo=[]
      topTen.map(item=>{

        yasuoTopTenOne.push({
          content:util.replaceTextWithEmoji(util.formatText(item.content, 13),"27px"),
          viewCount:item.viewCount
        })
        yasuoTopTenTwo.push({
          content:util.replaceTextWithEmoji(util.formatText(item.content, 25),"27px"),
          viewCount:item.viewCount
        })

      })

      this.setData({
        
        yasuoTopTenOne:yasuoTopTenOne,
        yasuoTopTenTwo:yasuoTopTenTwo
      })
      app.topTen=topTen
      app.yasuoTopTen=yasuoTopTenTwo
    }
  },

  updateThumbUp(thumbUpStatus, thumbUpCount){
    
    if(this.navigateIndex != null && this.navigateIndex != undefined){ 
      
      this.setData({
        [`topics[${this.navigategroupIndex}][${this.navigateIndex}].thumbUpStatus`]:thumbUpStatus,
        [`topics[${this.navigategroupIndex}][${this.navigateIndex}].thumbUpCount`]:thumbUpCount
      })
      
    }
  },

  updateCollect(collectStatus, collectCount){
    if(this.navigateIndex != null && this.navigateIndex != undefined){
      this.setData({
        [`topics[${this.navigategroupIndex}][${this.navigateIndex}].collectStatus`]:collectStatus,
        [`topics[${this.navigategroupIndex}][${this.navigateIndex}].collectCount`]:collectCount
      })
    }
    
  },

  updateCommentCount(commentCount){
    
    if(this.navigateIndex != null && this.navigateIndex != undefined){
      this.setData({
        [`topics[${this.navigategroupIndex}][${this.navigateIndex}].commentCount`]:commentCount
      })
    }
  },

  updateDeleteStatus(){

    if(this.navigateIndex != null && this.navigateIndex != undefined){
      this.setData({
        [`topics[${this.navigategroupIndex}][${this.navigateIndex}].hasDelete`]:true
      })
    }
  },

  updateVoteInfo(voteOptionList, peopleNum){
    if(this.navigateIndex != null && this.navigateIndex != undefined){
      this.setData({
        [`topics[${this.navigategroupIndex}][${this.navigateIndex}].voteArticle.voteOptionList`]:voteOptionList,
        [`topics[${this.navigategroupIndex}][${this.navigateIndex}].voteArticle.peopleNum`]:peopleNum
      })
    }
  },

  updateLotteryInfo(participantCnt, hasJoined){
    if(this.navigateIndex != null && this.navigateIndex != undefined){
      this.setData({
        [`topics[${this.navigategroupIndex}][${this.navigateIndex}].lottery.participantCnt`]:participantCnt,
        [`topics[${this.navigategroupIndex}][${this.navigateIndex}].lottery.hasJoined`]:hasJoined
      })
    }
  },

  gotoCategory(event) {

    const categoryCode = event.detail.categoryCode

    var url = `/page-topic/category-detail/index?labelId=${categoryCode}`
    if(categoryCode=='SECOND_HAND_MARKET'){
      
    }

    wx.navigateTo({
      url: url
    })
  },

  showActions(event) {
    
    const groupIndex = event.currentTarget.dataset.groupIndex
    const index = event.currentTarget.dataset.index
   
    const topic = this.data.topics[groupIndex][index]

    this.targetTopic=topic

    this.topicGroupIndex=groupIndex
    this.topicIndex=index

    var opt = topic.collectStatus==true?"取消收藏":"收藏"
    var actions = [{
      name: "分享",
      color: "#666",
      openType: "share"
    },
    {
      name: "海报分享",
      color: "#666",
    },
    {
      name: opt,
      color: "#666",
    }]

    if(this.data.userId != topic.userId){
      const action = {
        name: "举报",
        subname: '涉恐、暴恐、谣言等',
        color: "#666"
      }

      actions.push(action)

    }

    if (this.data.userId === topic.userId || this.data.userId==7777777) {
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

    const topic = this.targetTopic
    
    wx.navigateTo({
      url: url +"type=article&" + "topic=" + encodeURIComponent(JSON.stringify(topic))
    })
  },

  collectTopic(){
    const topics = this.data.topics
    const topicIndex = this.topicIndex
    const topicGroupIndex = this.topicGroupIndex
    
    const topic = topics[topicGroupIndex][topicIndex]

    const hasCollect = topic.collectStatus
    const collectStatus = !topic.collectStatus
    var collectCount = topic.collectCount

    if (hasCollect) {
      collectCount--
    } else {
      collectCount++
    }
    
    this.setData({
      [`topics[${topicGroupIndex}][${topicIndex}].collectStatus`]:collectStatus,
      [`topics[${topicGroupIndex}][${topicIndex}].collectCount`]:collectCount
    })

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

  deleteTopic() {
    
    const topicIndex = this.topicIndex
    const topicGroupIndex = this.topicGroupIndex
    const topic = this.data.topics[topicGroupIndex][topicIndex]
  
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

            this.setData({
              [`topics[${topicGroupIndex}][${topicIndex}].hasDelete`]:true,
            })
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

  reportTopic() {
    this.setData({ reportReasonShow: true });
  },

  reportReasonListClose() {
    this.setData({ reportReasonShow: false });
  },

  reportReasonSelect:util.throttle(async function(event) {
    const topicIndex = this.topicIndex
    const topicGroupIndex = this.topicGroupIndex

    const topic = this.data.topics[topicGroupIndex][topicIndex]

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

  gotoTopicDetail(event) {

    const groupIndex = event.currentTarget.dataset.groupIndex
    const index = event.currentTarget.dataset.index
    const topics = this.data.topics
    const topic = topics[groupIndex][index]
    let url = "/page-topic/topic-detail/index?"

    if (event.type === "commentIconTap") {
      url += "focus=true&"
    }
 
    this.navigategroupIndex=groupIndex
    this.navigateIndex=index

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
    }

    wx.navigateTo({
      url: url + "topic=" + encodeURIComponent(JSON.stringify(topic))
    })
  },

  async onThumbUpTap(event) {
    
    const groupIndex = event.currentTarget.dataset.groupIndex
    const index = event.currentTarget.dataset.index

    var thumbUpStatus= event.detail.thumbUpStatus
    var thumbUpCount= event.detail.thumbUpCount
    
    this.setData({
      [`topics[${groupIndex}][${index}].thumbUpStatus`]:thumbUpStatus,
      [`topics[${groupIndex}][${index}].thumbUpCount`]:thumbUpCount
    })

  },

  async onDingTap(event) {
    const groupIndex = event.currentTarget.dataset.groupIndex
    const index = event.currentTarget.dataset.index
    const topics = this.data.topics
    const topic = topics[groupIndex][index]

    if(topic.userId==this.data.userId){
      
      return
    }
    if(topic.dingStatus == true){
      const result = await Star.dingOrCancel(topic.id)
      
      if (result) {
        const dingStatus = !topic.dingStatus
        this.setData({
          [`topics[${groupIndex}][${index}].dingStatus`]:dingStatus,
        })
      }
    }else{

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

  onSearchTap() {
    const url = "/page-topic/search/search"
    wx.navigateTo({
      url: url
    })
  },

  async onPullDownRefresh() {
    
    wx.removeTabBarBadge({
      index:0
    })

    if (this.refreshing) {
      return;
    }

    this.refreshing=true
  
    await this.initTopics()

    this.topTen()
  },

  async onReachBottom() {
    if(this.data.hasMore){
      const topicPaging = this.topicPaging
      this.setData({
        loading: true
      })
      await this.getMoreTopics(topicPaging, false)

    }
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
      
      let title='生态圈'
      if(this.data.strollSchool?.name){
        title=this.data.strollSchool?.name
      }
      return {
        title: title,
        path: "/pages/topic/index?shareUserId="+this.data.userId
      }
    }
  },

  onShareTab(event){
    const groupIndex = event.currentTarget.dataset.groupIndex
    const index = event.currentTarget.dataset.index
    const topic = this.data.topics[groupIndex][index]
    this.targetTopic=topic
  },

  nav(e) {

    if(util.isForbidden()){
      return
    }

    const index = e.currentTarget.dataset.index
    
    const path = this.data.navList[index].path

    wx.navigateTo({
      url: path,
      fail(e) {

      }
    })
  },

  showPopup() {
    this.setData({
      showPopup:true
    })
  },
  closePopup() {
    this.setData({ showPopup: false });
  },

  async vote(event){

    const groupIndex = event.currentTarget.dataset.groupIndex
    const index = event.currentTarget.dataset.index
    const topic = this.data.topics[groupIndex][index]

    topic.voteArticle.peopleNum=event.detail.peopleNum
    topic.voteArticle.voteOptionList = event.detail.voteOptionList

  },

  async onJoinLottery(event) {
  },

	observeElement(index, isImmediate = false) {
		const observer = wx.createIntersectionObserver(this, { initialRatio: 0 })
		
		isImmediate ?
			(
				this.observeBorder(observer, index, isImmediate)
				&& this.observerList.splice(index, 1, observer)
			) :
			wx.nextTick(() => {
				this.observeBorder(observer, index, isImmediate)
				this.observerList.splice(index, 1, observer)
			})
	},
	
	observeBorder(observer = null, index) {
    
		const callback = (visible, height) => {
      
			if (this.data.styleMap[index] && this.data.styleMap[index].visible !== visible) {
				const key = `styleMap[${index}]`
				this.setData({
					[key]: {
						visible: visible,
						height: height
					}
				})
				this.observerList[index].disconnect()
			}
		}
		observer.relativeToViewport({
			top: this.deviceHeight * 2,
			bottom: this.deviceHeight * 2
		})
			.observe(`#selection-${index}`, ({ intersectionRatio, boundingClientRect }) => {
				const visible = intersectionRatio !== 0;
				
				callback(visible, boundingClientRect.height)
			})
  },
  
	manualCheck(scrollTop) {
    
		let height = 0,
			showIndex = 1
		
		for (let index = 0; index < this.data.styleMap.length; index++) {
      height += this.data.styleMap[index].height;

			if (height < scrollTop + this.deviceHeight * 2) {
        
				showIndex = index;
				continue;
			}
		}

    const showIndexs = [showIndex - 1, showIndex, showIndex + 1]
    
		showIndexs.forEach(visibleIndex => {
			this.data.styleMap[visibleIndex] && (this.data.styleMap[visibleIndex].visible || this.observeElement(visibleIndex, true))
		})
	},

  onPageScroll: util.throttle(async function (e) {
    
    this.manualCheck(e.scrollTop);
  },500),

  getMatchChatUnreadCount: util.throttle(async function (e) {
   
    const res = await Notification.getMatchChatUnreadCount()
    if(res!=null){
      app.globalData.newMatchChatMsgNum=res
      this.setData({
        newMatchChatMsgNum:res
      })
    }
  }, 1000), 

  gotoTaskDetail(e) {
  },

  gotoBannerDetail(e){
  },

  async getAdRecommend() {
  },

  closeMask() {
  },

  gotoAdDetail() {
  },

})

