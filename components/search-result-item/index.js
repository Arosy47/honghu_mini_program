
import util from '../../utils/util.js'

Component({

  properties: {
    topic: Object,
  },

  data: {
    imgUrl:null,
    richContent:null,
  },

  lifetimes: {
    attached	: function() {
      
      var topic =this.data.topic
      if(!topic){
        return
      }
      this.setData({
        
        richContent:util.replaceTextWithEmojiString(topic.content,"25px")
      })
      
      var imgUrlList = topic.imgUrlList
      if (imgUrlList && imgUrlList.length>0) {
        this.setData({
          imgUrl:'https://' + imgUrlList[0].url+'!article_small'
        }) 
        
      }
    }
  },
  observers: {
    topic: function(topic) {
      if (topic) {

        this.setData({
          richContent:util.replaceTextWithEmojiString(topic.content,"25px")
        })
        var imgUrlList = topic.imgUrlList
        if (imgUrlList && imgUrlList.length>0) {
          
          this.setData({
            imgUrl:'https://' + imgUrlList[0].url+'!article_small'
          }) 
        }else{
          this.setData({
            imgUrl:null
          }) 
        }
      }
    }
  },

  methods: {

    gotoTopicDetail() {

      this.triggerEvent("gotoTopicDetail", {}, { bubbles: true, composed: true })

    },

  }
})