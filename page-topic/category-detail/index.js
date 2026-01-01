
import { Star } from "../../models/star"
import { Topic } from "../../models/topic"
import { User } from "../../models/user"
import util from '../../utils/util.js'
const app = getApp()

Page({

  topicPaging: null,  

  targetTopic:null,
  isFirstLoaded:false,

  labelId: '',

  navigateIndex:null,
  navigategroupIndex:null,

  topicGroupIndex:null,
  topicIndex:null,

  data: {
    labels: [{"name":"最新","id":1}, {"name":"最热","id":2}],

    topics: [],
    topTen: [],

    labelName: '',
    bgPicture: '',
    articleNum: 0,
    introduction: '',
    tabId: 1,
    userId: -1,

    admin: false, 

    hasMore:true,
    loading: false, 
    currentPage:1,
    searchValue:'',
    active: '最新',
    stickTop:null,

    scrollDistence:0,
    order:"time",

    option: [
      { text: '动态', value: 'time' },
      { text: '热门', value: 'hot' },

    ],

    value: 'time',

    option2:[{ text: '', value: 'a' }],
    option3:[{ text: '', value: 'a' }],

    initLoading:true,
    nodata:false,

    showNavigate:false,
    showCategoryName:false,
    xiding:false,

    topicCount:0,

    styleMap: [{ visible: true, height: 0 }],

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
  },

  onLoad(options) {
    this.isFirstLoaded=true
    if(options.shareUserId){
      this.setData({
        shareUserId:options.shareUserId
      })
    }

     app.globalData.loginPromise.then(()=>{
      this.init(options)
    })
  },

  init(options){
    this.current = 0
    this.observerList = []
    this.deviceHeight=app.globalData.windowHeight-app.globalData.navTop
    this.setData({
      stickTop:app.globalData.CustomBar,

      navHeight: app.globalData.navHeight,
      navTop: app.globalData.navTop,

      userId: app.globalData.userInfo.userId,
      admin: app.globalData.userInfo.admin,

    })
    this.labelId=options.labelId
    this.createIntersectionObserver();

    this.initTopics("time",true)

    this.getTopInfo()

  },

  onUnload(){
    if(this.observer){
      this.observer.disconnect()
    }
    this.observerList.forEach(observer => observer?.disconnect())
  },

  createIntersectionObserver(){
    const that = this;
    
    const observer=wx.createIntersectionObserver(this,{thresholds:[0.95]});
    this.observer=observer

    this.observer.relativeToViewport({top:0}) 
    .observe('#top-trigger', (res)=>{

      if(res.intersectionRatio < 0.95) {
        that.setData({
          showNavigate: true,
        })
      }else{
        that.setData({showNavigate: false})
      }

    });

  },

  onShow() {
    this.navigateIndex=null
    this.navigategroupIndex=null

    this.reInitTopics()
  },

  reInitTopics() {
    if(this.isFirstLoaded){
      this.isFirstLoaded=false
      return
    }

    const refresh = wx.getStorageSync("refreshCategoryTopics")

    if (refresh==true) {
      wx.removeStorageSync("refreshCategoryTopics")
      this.initTopics("time",true)
      this.getTopInfo()
    } else {

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

  getUserInfo() {
    if (app.globalData.userInfo) {
      this.setData({
        userId: app.globalData.userInfo.userId,
        admin: app.globalData.userInfo.admin
      })
    } else {
      this.setData({
        userId: -1,
        admin: false
      })
    }
  },

  async initTopics(order,force) {

    this.current = 0
    this.data.topics=[]
    const params = {
      categoryCode: this.labelId,
      functionType:"",
      order:order
    }

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
          articleNum: data.total,
          nodata: false,
        })
      }
    } else if (data.newList.length === 0) {
      this.setData({
        hasMore: false,
        loading: false,
        nodata: false,
      })
    }else {
      const key = `topics[${this.current}]`
      const styleKey = `styleMap[${this.data.styleMap.length}]`
      this.setData({
        [key]: data.newList,
        [styleKey]: {
          visible: true,
          height: 0
        },
        loading:false,
        hasMore:data.hasMore,
        articleNum: data.total,
        nodata: false,
      })
    }
		this.current++
		wx.nextTick(() => {
			this.observeElement(this.current - 1)
		})

  },

  showActions(event) {
    const groupIndex = event.currentTarget.dataset.groupIndex
    const index = event.currentTarget.dataset.index

    const topic = this.data.topics[groupIndex][index]

    this.targetTopic=topic

    this.topicGroupIndex=groupIndex
    this.topicIndex=index

    var actions = [{
      name: "分享给朋友",
      color: "#666",
      openType: "share"
    }
    ,{
      name: "海报分享",
      color: "#666",
    }
    ]
    if(this.data.userId != topic.userId){
      const action = {
        name: "举报",
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

    if (event.detail.name === "分享给朋友") {

    }else if (event.detail.name === "海报分享") {
      this.gotoSharePoster()
    }else if (event.detail.name === "收藏" ||event.detail.name === "取消收藏" ) {
      this.collectTopic()

    }else if(event.detail.name === "举报") {
      this.reportTopic()
    }else if(event.detail.name === "删除") {
      this.deleteTopic()
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

  deleteTopic() {
    const topicIndex = this.topicIndex
    const topicGroupIndex = this.topicGroupIndex
    const topic = this.data.topics[topicGroupIndex][topicIndex]

    wx.showModal({
      title: '确定删除帖子？',
      content: '删除帖子操作不可撤销，且在一周内不可发布重复内容，请确认是否要删除帖子',
      complete: async(res) => {
        if (res.confirm) {
          const res = await Topic.deleteTopic(topic.id)
          if (res) {
            this.setData({
              [`topics[${topicGroupIndex}][${topicIndex}].hasDelete`]:true,
            })

            wx.showToast({
              title: '删除成功',
              icon: 'success'
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
        
        if (result.statusCode === 200) {
          const dingStatus = !topic.dingStatus
          this.setData({
            [`topics[${groupIndex}][${index}].dingStatus`]:dingStatus,
          })

        }
    }else{

    }
  },

  async onPullDownRefresh() {
    await this.initTopics(this.data.order, true)
    wx.stopPullDownRefresh()
    
    wx.vibrateShort()
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

  onShareTab(event){
    const groupIndex = event.currentTarget.dataset.groupIndex
    const index = event.currentTarget.dataset.index
    const topic = this.data.topics[groupIndex][index]
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
        title:"红狐生态圈-"+this.data.labelName,
        path: "/page-topic/category-detail/index?labelId="+this.labelId + "&shareUserId="+this.data.userId
      }
    }
  },

  async getTopInfo() {
    var data = {
      categoryCode:this.labelId
    }
    const result = await Topic.queryCategory(data)
       
    if(result){
      this.setData({
        
        bgPicture: result.bgPicture+'!article_small',
        labelName: result.categoryName,
        introduction: result.introduction
      })
    }

  },

  setSearchValue(event){
    this.setData({
      searchValue:event.detail.value
    })
  },

  onSearch() {
    if (this.data.searchValue) {
      const url = `../search-result/index?keyword=${this.data.searchValue}`+"&categoryCode="+this.labelId + "&categoryName="+this.data.labelName
      wx.navigateTo({
        url: url
      })

    }
  },

  onSearchTab() {
    const url = `../search-result/index?`
    wx.navigateTo({
      url: url+"categoryCode="+this.labelId + "&categoryName="+this.data.labelName
    })
  },

  onSearchTap() {
    const url = "/page-topic/search/search"
    wx.navigateTo({
      url: url
    })
  },

  back(){
    let pages = getCurrentPages(); 

    if (pages.length > 2){
      
      wx.navigateBack({
        delta: 1,
      });
    } else {
      
      wx.switchTab({
        url: '/pages/topic/index',
      });
    }
  },

  gotoPublish(){

    let url = "/page-topic/topic-edit/index?"
    wx.navigateTo({
      url: url + "categoryCode=" + this.labelId
    })

  },

  switchTab(e){
    let order = e.currentTarget.dataset.index;
    if(order==this.data.order){
      wx.pageScrollTo({
        scrollTop: 0,
        duration:300,
        success:()=>{
          this.setData({
            initLoading:true,
            nodata:false,
            styleMap: [{ visible: true, height: 0 }],
          })
          this.initTopics(order,true)
        }
      })

    }else{
      wx.pageScrollTo({
        scrollTop: 0,
        duration:300,
        success:()=>{
          this.setData({
            initLoading:true,
            nodata:false,
            order: order,
            styleMap: [{ visible: true, height: 0 }],
          })
          this.initTopics(order,true)
        }
      })

    }
  },

  async vote(event){

    const groupIndex = event.currentTarget.dataset.groupIndex
    const index = event.currentTarget.dataset.index
    const topic = this.data.topics[groupIndex][index]

    topic.voteArticle.peopleNum=event.detail.peopleNum
    topic.voteArticle.voteOptionList = event.detail.voteOptionList

  },

  async onJoinLottery(event) {

    const groupIndex = event.currentTarget.dataset.groupIndex
    const index = event.currentTarget.dataset.index
    const topic = this.data.topics[groupIndex][index]
   
    topic.lottery.participantCnt = event.detail.participantCnt
    topic.lottery.hasJoined = event.detail.hasJoined

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

})
