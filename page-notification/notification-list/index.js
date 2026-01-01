
import util from '../../utils/util.js'
import { Notification } from "../../models/notification"

const app = getApp();

Page({
  notificationPaging:null,

  data: {
    
    tabCur: 1,
    scrollLeft: 0,
    page: 1,
    timeDesc: "时间",
    nodata: false,
    nomore: false,
    loading: true,
    hasMore: true, 
    notifications:[],
    initLoading:true,

    isSubscribe:false,
    subscribeTimes:null,
    styleMap: [{ visible: true, height: 0 }],

  },

  onLoad: async function (options) {
    
    this.current = 0
    this.observerList = []
    this.deviceHeight=app.globalData.windowHeight-app.globalData.navTop
    let type = options.type;
    const tpyeList = JSON.parse(type);

    const dataToSet={}

    if(tpyeList.includes(3)){
      app.globalData.commentNum=0

      dataToSet["noticeType"]="评论"
    }else if(tpyeList.includes(1)){
      app.globalData.thumbUpAndCollectNum=0

      dataToSet["noticeType"]="点赞收藏"
    }else if(tpyeList.includes(12)){
      app.globalData.organizationNum=0

      dataToSet["noticeType"]="组局"
    }else if(tpyeList.includes(21)){
      app.globalData.deliveryNum=0

      dataToSet["noticeType"]="任务"
    }

    let noticeType =this.data.noticeType
    if(!this.data.subscribeTimes){

      const that = this
      if(!app.globalData.subscribeTimes){
        app.getSubscribeTimes(()=>{
          
          let subscribeTimes=app.globalData.subscribeTimes.NEW_COMMENT
          if(noticeType=='评论'){
            subscribeTimes=app.globalData.subscribeTimes.NEW_COMMENT
          }else if(noticeType=='组局'){
            subscribeTimes=app.globalData.subscribeTimes.ORGANIZATION_SUCCESS
          }else if(noticeType=='任务'){
            subscribeTimes=app.globalData.subscribeTimes.DELIVERY_DELIVERED_STATUS
          }
          that.setData({
            subscribeTimes:subscribeTimes,
          })
        })
      }else{
        
        let subscribeTimes=app.globalData.subscribeTimes.NEW_COMMENT
        if(noticeType=='评论'){
          subscribeTimes=app.globalData.subscribeTimes.NEW_COMMENT
        }else if(noticeType=='组局'){
          subscribeTimes=app.globalData.subscribeTimes.ORGANIZATION_SUCCESS
        }else if(noticeType=='任务'){
          subscribeTimes=app.globalData.subscribeTimes.DELIVERY_DELIVERED_STATUS
        }
        dataToSet["subscribeTimes"]=subscribeTimes

        app.getSubscribeTimes(()=>{
          
          let subscribeTimes=app.globalData.subscribeTimes.NEW_COMMENT
          if(noticeType=='评论'){
            subscribeTimes=app.globalData.subscribeTimes.NEW_COMMENT
          }else if(noticeType=='组局'){
            subscribeTimes=app.globalData.subscribeTimes.ORGANIZATION_SUCCESS
          }else if(noticeType=='任务'){
            subscribeTimes=app.globalData.subscribeTimes.DELIVERY_DELIVERED_STATUS
          }
          that.setData({
            subscribeTimes:subscribeTimes,
          })
        })
      }
    }

    if(!app.globalData.subscribeInfo){
      const that = this
      app.getSubscribeInfo(()=>{
        
        if(app.globalData.subscribeInfo){
          if(
            (noticeType== '评论'&&app.globalData.subscribeInfo["NEW_COMMENT"])
            ||(noticeType== '组局'&&app.globalData.subscribeInfo["ORGANIZATION_SUCCESS"])
            ||(noticeType== '任务'&&app.globalData.subscribeInfo["DELIVERY_DELIVERED_STATUS"])){
            this.setData({
              isSubscribe:true
            })
          }
        }
      })
    }else{

      if(
        (noticeType== '评论'&&app.globalData.subscribeInfo["NEW_COMMENT"])
        ||(noticeType== '组局'&&app.globalData.subscribeInfo["ORGANIZATION_SUCCESS"])
        ||(noticeType== '任务'&&app.globalData.subscribeInfo["DELIVERY_DELIVERED_STATUS"])){
          dataToSet["isSubscribe"]=true
      }
    }
    this.setData(dataToSet)
    await this.initNotifications(type)
  },

  onShow: function () {

  },

  onReady: function () {

  },
  
  onPullDownRefresh: async function () {

  },

  onReachBottom: async function () {

    if(this.data.hasMore){
      const notificationPaging = this.notificationPaging
      this.setData({
        loading: true
      })
      await this.getMoreNotifications(notificationPaging)

    }
  },

  async initNotifications(type) {
    this.current = 0   
    this.notifications=[]
    const params = {
      noticeTypeList:type
    }
    const notificationPaging = await Notification.getNotificationPaging(params)
    this.notificationPaging=notificationPaging
    await this.getMoreNotifications(notificationPaging)

    if(this.data.initLoading){
      this.setData({
        initLoading:false
      })
    }
  },

  async getMoreNotifications(notificationPaging) {
    const data = await notificationPaging.getMore()
    
    if (!data) {
      return
    }

    if (data.page === 1) {
      if(data.newList.length === 0){
        this.setData({
          nodata: true,
          hasMore: false,
          loading: false,
          notifications:[]
        })
      }else{
        var notifications = []
        notifications[0]=data.newList
        this.setData({
          notifications:notifications,
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
      const key = `notifications[${this.current}]`
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
