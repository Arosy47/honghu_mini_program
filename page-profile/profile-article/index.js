

const app = getApp();
import util from '../../utils/util.js'
import { Topic } from "../../models/topic"
import { Star } from "../../models/star"
Page({

  topicPaging:null,

  navigateIndex:null,
  navigategroupIndex:null,

  topicGroupIndex:null,
  topicIndex:null,

  refreshing:false,

  targetTopic:null,
  
  data: {
    topics:[],
    
    tabCur: 1,
    scrollLeft: 0,
    page: 1,
    timeDesc: "时间",
    nodata: false,
    loading: false,
    hasMore: true, 
    actionsShow:false,

    initLoading:true,
    type:1,

    styleMap: [{ visible: true, height: 0 }],
  },

  onLoad: async function (options) {
    let type = options.type;
    this.setData({
      type:type
    })

    this.current = 0
    this.observerList = []
    
    this.deviceHeight=app.globalData.windowHeight-app.globalData.navTop

    await this.initMyTopics(type)
  },

  onShow: function () {
    this.navigateIndex=null
    this.navigategroupIndex=null
  },

  onReady: function () {

  },
  
  onPullDownRefresh: async function () {
    this.initMyTopics(this.data.type)
  },

  onReachBottom: async function () {
    
    if(this.data.hasMore){
      const topicPaging = this.topicPaging
      this.setData({
        loading: true
      })
      await this.getMoreTopics(topicPaging)

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

  async initMyTopics(type) {
    const params = {
      userId: app.globalData.userInfo.userId,
    }
    this.current = 0
    this.data.topics=[]
   
    if(type == 1){
      const topicPaging = await Topic.getTopicUserPaging(params)
      this.topicPaging=topicPaging
      
      await this.getMoreTopics(topicPaging)
    }else if(type == 2){
      const topicPaging = await Topic.getCollectTopicPaging(params)
      this.topicPaging=topicPaging
      
      await this.getMoreTopics(topicPaging)
    }

    if(this.data.initLoading){
      this.setData({
        initLoading:false
      })
    }
  },

  async getMoreTopics(topicPaging) {
    const data = await topicPaging.getMore()
    
    if (!data) {
      return
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
    }else if (data.newList.length === 0) {
      
      this.setData({
        hasMore: false,
        loading: false,
        nodata: false,
      })
    }else{
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

  showActions(event) {
    const groupIndex = event.currentTarget.dataset.groupIndex
    const index = event.currentTarget.dataset.index
    const topic = this.data.topics[groupIndex][index]

    this.targetTopic=topic

    this.topicGroupIndex=groupIndex
    this.topicIndex=index

    var actions = [{
      name: "分享",
      color: "#666",
      openType: "share"
    },{
      name: "删除",
      color: "#d81e06"
    }]

    this.setData({ 
      actions:actions,
      actionsShow: true,
    });
  },

  actionClose() {
    this.setData({ actionsShow: false });
  },

  actionSelect(event) {

    if (event.detail.name === "分享") {

    } else if(event.detail.name === "删除") {
      this.deleteTopic()
    }
  },

  deleteTopic() {
    const topicIndex = this.topicIndex
    const topicGroupIndex = this.topicGroupIndex
    const topic = this.data.topics[topicGroupIndex][topicIndex]

    wx.showModal({
      title: '确定删除帖子？',
      content: '删除帖子操作不可撤销，且在一周内不可发布重复内容，请确认是否要删除帖子',
      complete: async (res) => {
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
        }
      }
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

  async vote(e){

    const groupIndex = e.currentTarget.dataset.groupIndex
    const index = e.currentTarget.dataset.index
    const topic = this.data.topics[groupIndex][index]

    topic.voteArticle.voteOptionList = e.detail.voteOptionList

  },

  async onJoinLottery(e) {
    const groupIndex = e.currentTarget.dataset.groupIndex
    const index = e.currentTarget.dataset.index
    const topic = this.data.topics[groupIndex][index]

    topic.lottery.participantCnt = e.detail.participantCnt
    topic.lottery.hasJoined = e.detail.hasJoined

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

  onShareAppMessage(options) {
  
    if(options.from=='button'){
      const topic = this.targetTopic
      return {
        title: topic.content,
        imageUrl: topic.imgUrlList?.length>0? "https://" + topic.imgUrlList[0].url:'',

        path: "/pages/topic/index?topicId=" + topic.id + "&shareUserId="+this.data.userId+ "&authorId="+topic.userId
      }
    }else if(options.from=='menu'){
      
      let title='生态圈'
      if(app.globalData.strollSchool?.name){
        title=app.globalData.strollSchool?.name
      }
      return {
        title: title,
        path: "/pages/topic/index"
      }
    }
  },

  onShareTab(event){
    const groupIndex = event.currentTarget.dataset.groupIndex
    const index = event.currentTarget.dataset.index
    const topic = this.data.topics[groupIndex][index]
    this.targetTopic=topic
  },

  onUnload(){
    this.observerList.forEach(observer => observer?.disconnect())
  },

})