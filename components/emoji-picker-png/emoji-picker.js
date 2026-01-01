const emojis = require('../../utils/emoji-util')
const app=getApp()
Component({
  properties: {

    emojiheight:{
      type: Number,
      value: 0
    }
  },
  data: {

    scrollTop: 0,
    emojis:[],
  },

  lifetimes: {
    attached	: function() {

      if(app.globalData.emojiPickerCached.length<=0){
        let noAllCacheFlag=false
        let cacheEmojis=[]
        
        emojis.forEach(emoji => {
          
          const cachedSrc=wx.getStorageSync(emoji.src)
          if(cachedSrc){
            
            var cacheEmoji={
              id:emoji.id,
              src:cachedSrc,
              replace:emoji.replace,
            }
            cacheEmojis.push(cacheEmoji)
          }else{
            
            var cacheEmoji={
              id:emoji.id,
              src:emoji.src,
              replace:emoji.replace,
            }
            cacheEmojis.push(cacheEmoji)
            noAllCacheFlag=true
            
          }
          
        });

        if(noAllCacheFlag){
          app.cacheEmojis()
        }else{
          app.globalData.emojiPickerCached=cacheEmojis
        }

        this.setData({
          emojis:cacheEmojis
        })
      }else{
        this.setData({
          emojis:app.globalData.emojiPickerCached
        })
      }

    }

  },
  ready() {

  },
  methods: {

    chooseEmoji(event) {
      
      const emoji = event.currentTarget.dataset.emoji
      const replace = event.currentTarget.dataset.replace

      this.triggerEvent('onSelect', {emojiUrl:emoji,replace:replace})
    }
  }
})
