
import { Notification } from "../../models/notification"
const app = getApp()
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
    topics: [],
    hasMore: true, 
    notifications:[],
    userInfo:null,
  },

  onLoad: async function (options) {
    
    let userId = options.userId;
    this.setData({
      userInfo:app.globalData.userInfo
    })

    await this.initSystemNotice()
  },

  onShow: function () {

  },

  onReady: function () {

  },
  
  onPullDownRefresh: async function () {

  },

  onReachBottom: async function () {

    const notificationPaging = this.notificationPaging
    this.setData({
      loading: true
    })
    
    await this.getMoreNotifications(notificationPaging)
    this.setData({
      loading: false
    })
  },

  gotoTopicDetail(event) {
    const index = event.currentTarget.dataset.index
    const topics = this.data.topics
    const topic = topics[index]
    let url = "/page-topic/topic-detail/index?"
    wx.navigateTo({
      url: url + "topicId=" + topic.id
    })
  },

  async initSystemNotice() {

    const notificationPaging = await Notification.getSysNotificationPaging()
    this.notificationPaging=notificationPaging
    await this.getMoreNotifications(notificationPaging)
  },

  async getMoreNotifications(notificationPaging) {
    const data = await notificationPaging.getMore()
    
    if (!data) {
      return
    }
    if (data.newList.length === 0) {
      if (data.page === 1) {
        this.setData({
          
          hasMore: false,
          loading: false,
          notifications:[]
        })
      }else{
        this.setData({
          hasMore: false,
          loading: false,
          
        })
      }
      return
    }
    
    if(this.data.topics.length==0){
      this.setData({
        notifications: data.accumulator,
        hasMore: data.hasMore,
        loading: false,
        
      })
    }else{
      const length=this.data.notifications.length
      const notificationsToAdd={}
      data.newList.forEach((item,index)=>{
        notificationsToAdd[`notifications[${length+index}]`]=item;
      })
      notificationsToAdd["hasMore"]=data.hasMore
      notificationsToAdd["loading"]=false
      this.setData(notificationsToAdd)
    }

  },

})
