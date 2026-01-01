

import { Topic } from "../../models/topic"
import { Star } from "../../models/star"
import { User } from "../../models/user"
import util from '../../utils/util.js'
const app = getApp()
Page({
  navigateIndex:null,

  data: {
    topTen:null,
    shareUserId:null,
  },

  onLoad(options) {
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
    if(app.topTen){
      var richTopTen=[]
      app.topTen.map(item=>{

        var len=38
        if(item.imgUrlList&&item.imgUrlList.length>0){
          len=30
        }
        var obj = JSON.parse(JSON.stringify(item))
        obj.content=util.replaceTextWithEmoji(util.formatText(item.content, len),"27px")
        richTopTen.push(obj)
      })
      this.setData({
        topTen: richTopTen
      })
    }else{
      this.topTen()
    }
  },

  onShow() {
    
  },

  async topTen() {
    const param = {
      period:"TOP_TEN_DAY"
      
    }
    const topTen = await Topic.topTen(param)
    if(topTen){
      var richTopTen=[]
      topTen.map(item=>{
        
        var obj = JSON.parse(JSON.stringify(item))
        var len=38
        if(item.imgUrlList&&item.imgUrlList.length>0){
          len=30
        }
        obj.content=util.replaceTextWithEmoji(util.formatText(item.content, len),"27px")
        richTopTen.push(obj)

      })

      this.setData({
        topTen: richTopTen
      })
    }
  },

  gotoTopicDetail(event) {
    
    const index = event.currentTarget.dataset.index

    var topics = this.data.topTen
    const topic = topics[index]

    wx.navigateTo({
      url: "/page-topic/topic-detail/index?topicId=" + topic.id
    })
  },

  async onThumbUpTap(event) {
    const index = event.currentTarget.dataset.index
    const topics = this.data.topTen
    const topic = topics[index]

    const hasStar = topic.thumbUpStatus
    const thumbUpStatus = !topic.thumbUpStatus
    var thumbUpCount = topic.thumbUpCount

    if (hasStar) {
      thumbUpCount--
    } else {
      thumbUpCount++
    }
    
    this.setData({
      [`topTen[${index}].thumbUpStatus`]:thumbUpStatus,
      [`topTen[${index}].thumbUpCount`]:thumbUpCount
    })

    if(this.timerId){
      clearTimeout(this.timerId);
    }
    this.timerId=setTimeout(async() => {
      
      const params = {
        articleId: topic.id,
        targetUserId: topic.userId,
        thumbUpStatus:topic.thumbUpStatus
      }
      const res = await Star.thumbUpOrCancel(params)
      if (res.statusCode === 200) {
         
      }

    }, 1500);

  },

  onPullDownRefresh() {

  },

  onShareAppMessage() {
    return {
      title:"红狐生态圈-十大热榜",
      path: "/page-topic/top-ten/index?shareUserId="+app.globalData.userInfo.userId
    }
  },

  back(){
    
    wx.switchTab({
      url: '/pages/topic/index',
    });
  },
})