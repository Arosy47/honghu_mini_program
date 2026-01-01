
import util from '../../../utils/util.js'
Component({
  options: {
    styleIsolation: 'apply-shared'
  },

  properties: {
    notification: Object,
    
    maxContentLen: {
      type: Number,
      value: 180
    },
    
    isOwner: {
      type: Boolean,
      value: false
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

  observers: {
    notification: function(notification) {
      if (notification) {

        const newList = []
        if(notification.articleModel){
          
          const urlList = notification.articleModel.imgUrlList
          if (urlList) {
            for (let i in urlList) {
              newList.push('https://' + urlList[i].url)
            }
            
            this.setData({
              imgUrlList: newList,
              tesImg:newList[0]
            })
          }
          
        }else if(notification.organizationModel){
          const urlList = notification.organizationModel.imgUrlList
          if (urlList) {
            for (let i in urlList) {
              newList.push('https://' + urlList[i].url)
            }
          }
          this.setData({
            imgUrlList: newList,
          })
        }else if(notification.articleCommentModel){
          const url = notification.articleCommentModel.imgUrl
          if (url) {
            newList.push('https://' + url)
          }
          this.setData({
            imgUrlList: newList,
          })
        }else if(notification.organizationCommentModel){
          const url = notification.organizationCommentModel.imgUrl
          if (url) {
            newList.push('https://' + url)
          }
          this.setData({
            imgUrlList: newList,
          })
        }else if(notification.pickUpPackageModel){
          
        }else if(notification.userModel){

        }
      }
    }
  },

  data: {
    expand: false,  
    createTime: '',
    imgUrlList:[],
    tesImg:''
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

    doNothing() { }
  }
})
