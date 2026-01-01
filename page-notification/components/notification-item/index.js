
import util from '../../../utils/util.js'
Component({
  properties: {
    notification: Object,
    
    maxContentLen: {
      type: Number,
      value: 180
    },

    isLink: {
      type: Boolean,
      value: true
    },
    
    showDetail: {
      type: Boolean,
      value: false
    },
    
    showTags: {
      type: Boolean,
      value: false
    },
    
    autoplay: {
      type: Boolean,
      value: false
    },
    
  },
  lifetimes: {
  },
 
  observers: {
    notification: function(notification) {
      if (notification) {

        if(notification.avatar?.includes('anonymous')){
          
          this.setData({
            isAnon:true
          })
        }
        
        const newList = []
        if(notification.articleModel){
          
          const urlList = notification.articleModel.imgUrlList
          if (urlList) {
            for (let i in urlList) {
              newList.push('https://' + urlList[i].url+'!article_small')
            }
            
            this.setData({
              imgUrlList: newList,
            })
          }
          
        }else if(notification.organizationModel){
          const urlList = notification.organizationModel.imgUrlList
          if (urlList) {
            for (let i in urlList) {
              newList.push('https://' + urlList[i].url+'!article_small')
            }
            this.setData({
              imgUrlList: newList,
            })
          }
          
        }else if(notification.articleCommentModel){
          const url = notification.articleCommentModel.imgUrl
          if (url) {
            newList.push('https://' + url+'!article_small')
          }
          this.setData({
            imgUrlList: newList,
          })
        }else if(notification.organizationCommentModel){
          const url = notification.organizationCommentModel.imgUrl
          if (url) {
            newList.push('https://' + url+'!article_small')
          }
          this.setData({
            imgUrlList: newList,
          })
        }else if(notification.pickUpPackageModel){
          
        }else if(notification.userModel){

        }else if(notification.slideMatchCardModel){
          const urlList = notification.slideMatchCardModel.imgUrlList
          if (urlList) {
            for (let i in urlList) {
              newList.push('https://' + urlList[i].url+'!article_small')
            }
            this.setData({
              imgUrlList: newList,
            })
          }
        }

        if(notification.noticeType === 3||notification.noticeType === 4||notification.noticeType === 11){
          if(notification.content&&notification.content.length>0){
            
            this.setData({
              richContent : util.replaceTextWithEmoji(notification.content,"25px")
            })
          }
        }
      }
    }
  },

  data: {
    expand: false,  
    createTime: '',
    imgUrlList:[],
    richContent:[],

    isAnon:false,
  },
  methods: {
    
    onMoreIconTap() {
      this.triggerEvent("moreIconTap")
    },

    onTagTap(event) {
      this.triggerEvent("tagTap", { labelId: event.target.dataset.labelId })
    },

    onExpandTap() {
      const notification = this.data.notification
      notification.expand = !notification.expand

      this.setData({
        notification: notification
      })
    },

    gotoTopicDetail() {
      if (!this.data.isLink) {
        return
      }

      const notification = this.data.notification
      if(notification.noticeType == 1 || notification.noticeType == 2 ||notification.noticeType == 3){
        wx.navigateTo({
          url: "/page-topic/topic-detail/index?topicId=" + notification.articleId
        })
      }else if(notification.noticeType == 4){
        
        if(notification.articleCommentModel){
          wx.navigateTo({
            url: "/page-topic/topic-detail/index?topicId=" + notification.articleId
          })
        }else if(notification.organizationCommentModel){
          wx.navigateTo({
            url: "/page-organization/organization-detail/index?organizationId=" + notification.organizationId
          })
        }
      }else if(notification.noticeType == 5){
        
        wx.navigateTo({
          url: "/page-topic/topic-detail/index?topicId=" + notification.articleId
        })
      
      }else if(notification.noticeType == 11 || notification.noticeType == 12 ||notification.noticeType == 13 || notification.noticeType == 15){
        wx.navigateTo({
          url: "/page-organization/organization-detail/index?organizationId=" + notification.organizationId
        })
      }else if(notification.noticeType == 21 || notification.noticeType == 22 ||notification.noticeType == 23||notification.noticeType == 24){
        wx.navigateTo({
          url: "/page-task/task-detail/index?articleId=" + notification.articleModel.id
        })
      }else if(notification.noticeType == 50){
        wx.navigateTo({
          url: "/page-makefriend/card-detail/index?cardId=" + notification.slideMatchCardModel.id
        })
      }
    
    },

    doNothing() { }
  }
})
