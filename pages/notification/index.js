
import util from '../../utils/util.js'

import { Notification } from "../../models/notification"

const app = getApp()

Page({

  notificationPaging:null,
  sixinSessionPaging: null,  
  isProcessing:false,
  
  data: {
    labels: [{name: "点赞", id: 1}, {name: "评论", id: 3}, {name: "私信", id: 5}],
    labelId: 1,
    userId: -1,

    admin: false, 
    hasMore: true, 
    loading: false, 
    
    sixinSessionList:[],

    iconList: [{
      icon: 'markfill',
      color: 'orange',
      badge: 0,
      name: '评论',
      bindtap: "bindCommentNoticeList"
      }, {
        icon: 'likefill',
        color: 'red',
        badge: 0,
        name: '赞/收藏/赞赏',
        bindtap: "bindThumbUpNoticeList"
      }, 
      {
        icon: 'circlefill',
        color: 'yellow',
        badge: 0,
        name: '组局',
        bindtap: "bindOrganizationNoticeList"
      }, 

    ],
    newSysNoticeContent:"",

    isSubscribe:false,
    styleMap: [{ visible: true, height: 0 }],

    initLoading:true,
  },

  onLoad() {

    this.current = 0
		this.observerList = []

    app.globalData.loginPromise.then(()=>{
      this.init()
    })
  },

  init(){

    this.deviceHeight=app.globalData.windowHeight-app.globalData.navTop
  },

  async onShow() {
    this.getUserInfo()

    this.isProcessing=false
    
    this.initSixinSessionList()

    if(this.data.sixinSessionList.length==0){
      this.genAllUnreadCount()
      
      this.getNewSystemNotice()
    }else if(app.globalData.sixinNum>0||app.globalData.systemNoticeNum>0){
      this.genAllUnreadCount()
      wx.pageScrollTo({
        scrollTop: 0,
        duration:500,
        success:()=>{

          this.getNewSystemNotice()
        },
        fail:(e)=>{
            
        }
      })
    }else{
      await this.genAllUnreadCount()
      if(app.globalData.sixinNum>0||app.globalData.systemNoticeNum>0){
        wx.pageScrollTo({
          scrollTop: 0,
          duration:500,
          success:()=>{

            this.getNewSystemNotice()
          },
          fail:(e)=>{
              console.log("error",e)
          }
        })
      }
    }
  },

  updateRecentlyInfo(){
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

  getUserInfo() {
    if (this.data.userId==-1 && app.globalData.userInfo) {
      this.setData({
        userId: app.globalData.userInfo.userId,
        admin: app.globalData.userInfo.admin
      })
    }
  },

  async bindCommentNoticeList() {
    wx.navigateTo({
      url: '/page-notification/notification-list/index?type=' + JSON.stringify([3,4,11])
    })
  },

  async bindThumbUpNoticeList() {
    wx.navigateTo({
      url: '/page-notification/notification-list/index?type=' + JSON.stringify([1,2,5,50])
    })
  },

  async bindOrganizationNoticeList() {
    wx.navigateTo({
      url: '/page-notification/notification-list/index?type=' + JSON.stringify([12,13,14,15])
    })
  },

  async bindDeliveryNoticeList() {
    wx.navigateTo({
      url: '/page-notification/notification-list/index?type=' + JSON.stringify([21,22,23,24])
    })
  },

  gotoSystemNotice(){
    wx.navigateTo({
      url: "/page-notification/sys-notice-list/index?userId=" + this.data.userId,
    })
  },

  async initSixinSessionList() {
    this.current = 0 
    
    const sessionPaging = await Notification.getSixinSessionPaging()
    this.sixinSessionPaging=sessionPaging

    this.data.sixinSessionList=[]
    await this.getMoresixinSessionList(sessionPaging, true)

    if(this.data.initLoading){
      this.setData({
        initLoading:false
      })
    }
  },

  async getMoresixinSessionList(sixinSessionPaging, isInit) {
    const data = await sixinSessionPaging.getMore()

    if (!data) {
      return
    }

    if(isInit){
      
      this.data.sixinSessionList=[]
    }

    if (data.page === 1) {
      if(data.newList.length === 0){
        this.setData({
          hasMore: false,
          loading: false,
          sixinSessionList:[]
        })
      }else{
        var sixinSessionList = []
        sixinSessionList[0]=data.newList
        this.setData({
          sixinSessionList:sixinSessionList,
          styleMap: [{ visible: true, height: 0 }],
          loading:false,
          hasMore:data.hasMore,
        })
      }
    }else if (data.newList.length === 0) {
      this.setData({
        hasMore: false,
        loading: false,
        
      })
    } else {
      const key = `sixinSessionList[${this.current}]`
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

  async getNewSystemNotice(){
    const newSysNotice = await Notification.getNewSystemNotice()
    if(newSysNotice){
      this.setData({
        newSysNoticeContent:newSysNotice
      })
    }

  },

  async genAllUnreadCount() {

    const unreadCount = await Notification.getUnreadCount()
    if(!unreadCount){
      return
    }

    var iconList = this.data.iconList
    for(var i=2; i<iconList.length+2;i++){
      iconList[i-2].badge = unreadCount[i]
    }
    
    this.setData({
      iconList: iconList,
      unreadSystemCount:unreadCount[1]
    })
    app.globalData.sixinNum = unreadCount[0]
    app.globalData.systemNoticeNum = unreadCount[1]
    app.globalData.commentNum = unreadCount[2]
    app.globalData.thumbUpAndCollectNum = unreadCount[3]
    app.globalData.organizationNum = unreadCount[4]
    app.globalData.deliveryNum = unreadCount[5]

    this.updateRecentlyInfo()
  },

  async onReachBottom() {
    if(this.data.hasMore){
      const sixinSessionPaging = this.sixinSessionPaging
      this.setData({
        loading: true,
      })
      
      await this.getMoresixinSessionList(sixinSessionPaging, false)

    }
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

  ListTouchStart(e) {
    this.setData({
      ListTouchStart: e.touches[0].pageX
    })
  },

  ListTouchMove(e) {
    this.setData({
      ListTouchDirection: e.touches[0].pageX - this.data.ListTouchStart > 0 ? 'right' : 'left'
    })
  },

  ListTouchEnd(e) {
    if (this.data.ListTouchDirection == 'left') {
      this.setData({
        modalName: e.currentTarget.dataset.target
      })
    } else {
      this.setData({
        modalName: null
      })
    }
    this.setData({
      ListTouchDirection: null
    })
  },

  touchstart: function(e) {
    this.startTime = e.timeStamp;
  },
  touchend: function(e) {
    this.endTime = e.timeStamp;
  },

  async gotoChatRoom(event) {
    
    if(this.endTime  - this.startTime > 350) {
      
      return
    }

    if(this.isProcessing){
      
      return;
    }
  
    this.isProcessing=true
    
    const toUserId = event.detail.toUserId
    if (toUserId === null) {
      return
    }
    const toUser={
      userId:toUserId,
      avatar:{url:event.detail.toUserAvatar},
      nickName:event.detail.toUserName
    }
    const that = this
    const groupIndex=event.currentTarget.dataset.groupIndex
    const index=event.currentTarget.dataset.index
    wx.navigateTo({
      url: "/page-notification/chat-room/index?toUser=" + encodeURIComponent(JSON.stringify(toUser)),
      complete(res){
        that.isProcessing=false
        let unReadCount = that.data.sixinSessionList[groupIndex][index].unReadCount
        
        if(unReadCount>0){
          app.globalData.sixinNum -= unReadCount
        }
        that.setData({
          [`sixinSessionList[${groupIndex}][${index}].unreadCound`]:0
        })
      }
    })

  },

  deleteSession(event) {

    return
    
    const sessionId = event.detail.sessionId
    const that = this
    wx.showModal({
      title: '删除会话',
      content: '该操作会清除该私聊，并删除聊天记录',
      complete: async (res) => {
        if (res.cancel) {
          
        }
        if (res.confirm) {
          
          const res = await Notification.deleteSession({"sessionId":sessionId})
          if(res){
            
            that.initSixinSessionList()
          }
          
        }
      }
    })
  },
})
