
import util from '../../utils/util.js'

import { Star } from "../../models/star"
import { Topic } from '../../models/topic.js'
const app=getApp()
Component({
  
  options: {
    styleIsolation: 'apply-shared'
  },
  externalClasses: ["topic-item-class"],
  properties: {
    topic: Object,
    
    maxContentLen: {
      type: Number,
      value: 1
    },
    
    isOwner: {
      type: Boolean,
      value: false
    },
    
    isLink: {
      type: Boolean,
      value: true
    },
    
    showFold: {
      type: Boolean,
      value: false
    },
    
    showTags: {
      type: Boolean,
      value: true
    },
    
    autoplay: {
      type: Boolean,
      value: false
    },

    detail:{
      type: Boolean,
      value: false
    },

    showTop:{
      type: Boolean,
      value: false
    },

    userVoted:{
      type: Boolean,
      value: false
    },

    isEnd:{
      type: Boolean,
      value: false
    },

    voteOptionList:Array,
    voteTotalCount:0,

    lineHeight: {
      type: String,
      value: '42'
    },
    
    line: {
      type: String,
      value: '4'
    },

    admin:{
      type: Boolean,
      value:false
    },

    hasJoined: {
      type: Boolean, 
      value: false
    }
,
    
  },
  lifetimes: {
    attached	: function() {

      if(!this.data.detail){
        
        this.handleContentArea()
      }

      this.data.restrictHeight= util.rpx2px(4*42)

      var topic =this.data.topic
      if(!topic){
        return
      }
      if(this.data.detail){
        this.setData({
          richContent:util.replaceTextWithEmoji(topic.content,"27px")
        })
      }else{
        this.setData({
          richContent:util.replaceTextWithEmoji(topic.content,"25px")
        })
      }
      
      var imgUrlList = topic.imgUrlList
      
      if (imgUrlList && imgUrlList.length > 0) {
        
        let cosParam = "!article_medium"
        if(imgUrlList.length>1){
          cosParam="!article_small"
        }

        var newList=[]
        for (let url in imgUrlList) {
          newList.push('https://' + imgUrlList[url].url+cosParam)
        }
        if(imgUrlList.length==1){

          this.setData({
            imageMode:imgUrlList[0].imageMode,
            imgHeight : imgUrlList[0].height,
            imgWidth : imgUrlList[0].width,

            imgUrlList: newList,
          })
        }else{
          this.setData({
            imgUrlList: newList,
          })
        }
      }
    }
  },
  observers: {
    topic: function(topic) {
      
      if (topic) {

        if(this.data.detail){
          this.setData({
            richContent:util.replaceTextWithEmoji(topic.content,"27px")
          })
        }else{
          this.setData({
            richContent:util.replaceTextWithEmoji(topic.content,"25px")
          })
          
          this.handleContentArea()
        }

        var imgUrlList = topic.imgUrlList
        
        if (imgUrlList) {
          let cosParam = "!article_medium"
          if(imgUrlList.length>1){
            cosParam="!article_small"
          }
          var newList=[]
          for (let url in imgUrlList) {
            newList.push('https://' + imgUrlList[url].url+cosParam)
          }
          if(imgUrlList.length==1){

            this.setData({
              imageMode:imgUrlList[0].imageMode,
              imgHeight : imgUrlList[0].height,
              imgWidth : imgUrlList[0].width,

              imgUrlList: newList,
            })
          }else{
            this.setData({
              imgUrlList: newList,
            })
          }
        }

        if(topic.functionType=='VOTE'){
          var voteOptionList=topic.voteArticle.voteOptionList

          voteOptionList=[...voteOptionList];
          let voteTotalCount = voteOptionList.reduce((sum, option)=> sum+option.voteCount,0)
          
          voteOptionList.map(item=>{
            if(voteTotalCount==0){
              item.rate="0.00%"
              item.rateValue = rate/100
            }else{
              var rate=(item.voteCount/voteTotalCount)*100
              item.rate = rate.toFixed(2)+"%"
              item.rateValue = rate/100
            }
          })

          var userVoted=false
          for(let option of topic.voteArticle.voteOptionList){
            
            if(option.userVoteStatus){
              userVoted=true
              break;
            }
          }
          this.setData({
            expireTime:this.getFormatTime(topic.voteArticle.expireTime),
            voteTotalCount:voteTotalCount,
            voteOptionList:voteOptionList,
            isEnd:Date.now() >topic.voteArticle.expireTime,
            peopleNum:topic.voteArticle.peopleNum,
            userVoted:userVoted
          })

          if(userVoted){
            
            setTimeout(() => {
              this.setData({showww:true})
            }, 300);
          }
        }else if(topic.functionType=='LOTTERY'){

          this.setData({
            isEnd:Date.now() >= topic.lottery.endTime && topic.lottery.status==2,
            isLottering:Date.now() >= topic.lottery.endTime && topic.lottery.status!=2,
            hasJoined:topic.lottery.hasJoined,
            lotteryEndTime:this.getFormatTime(topic.lottery.endTime),

          })
        }else if(topic.functionType=='SECOND_HAND_MARKET'){
          
          this.setData({
            showTags:false,
            chatCnt:topic.secondHand?.chatCnt?topic.secondHand.chatCnt:0
          })
        }
        
      }
    }
  },

  data: {
    onExpand: false,  
    createTime: '',
    imgUrlList:[],

    imgHeight:0,  
    imgWidth:0,
    imageMode:"",

    tempSelectIndexList:[],

    multiSelectedCount:0,

    showww:false,
    peopleNum:null,

    richContent:[],
    isHasShowMore: false, 

    restrictHeight: 4*42/2,
  },
  methods: {
    
    onMoreIconTap() {
      this.triggerEvent("moreIconTap")
    },

    onTagTap(event) {
      this.triggerEvent("tagTap", {categoryCode:event.target.dataset.category})
    },

    onExpandTap() {
      this.setData({
        onExpand: !this.data.onExpand
      })
    },

    gotoTopicDetail() {
      if (!this.data.isLink) {
        return
      }

      this.triggerEvent("viewIconTap", {}, { bubbles: true, composed: true })

    },

    getFormatTime(timeStamp) {
      
      return util.formatTimeMinute(new Date(timeStamp))
    },

    previewImage(event) {
       
      app.globalData.preImgStatus=true  
      var previewList=[]
      this.data.imgUrlList.map(url=>{
        previewList.push(url.split("!")[0]+"!article_big")
      })

      wx.previewImage({
        current: previewList[event.currentTarget.dataset.index],
        urls: previewList
      })

    },

    doNothing() { },

    checkTextOverflow(){

    },

    handleContentArea() {
      const query = this.createSelectorQuery()
      query.select('#more-text-yan').boundingClientRect(res => {

        if (res.height > this.data.restrictHeight) {
          this.setData({
            isHasShowMore: true,
            
          })
        } else {
          this.setData({
            isHasShowMore: false,
            
          })
        }
        
      }).exec()
    },

    async onThumbUpTap(event) {
      
      if(this.data.detail){
        this.triggerEvent("thumbUpIconTap")
        return
      }

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
        [`topic.thumbUpStatus`]:thumbUpStatus,
        [`topic.thumbUpCount`]:thumbUpCount
      })

      this.triggerEvent("thumbUpIconTap", {"thumbUpStatus":thumbUpStatus,"thumbUpCount":thumbUpCount})

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

      }, 1500);

    },

    copy(value){
      
      wx.setClipboardData({
        data: value.currentTarget.dataset.content+"",
        success(res){
          wx.showToast({
            title: '内容已复制',
            icon:'none'
          })
        },
        fail(e){
          
        }
      })
    },

  }
})
