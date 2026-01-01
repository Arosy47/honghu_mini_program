
Component({
  options: {
    styleIsolation: 'apply-shared'
  },
  properties: {
    commentCount: {
      type: Number,
      value: 0
    },
    thumbUpCount: {
      type: Number,
      value: 0
    },
    collectCount: {
      type: Number,
      value: 0
    },
    viewCount: {
      type: Number,
      value: 0
    },
    hasComment: {
      type: Boolean,
      value: false
    },
    hasCollect: {
      type: Boolean,
      value: false
    },
    hasThumbUp: {
      type: Boolean,
      value: false
    },
    hasCollect: {
      type: Boolean,
      value: false
    },
    hasView: {
      type: Boolean,
      value: false
    },
    isDing: {
      type: Boolean,
      value: false
    },
    topicDetail:{
      type: Boolean,
      value: false
    },
   
  },

  data: {

    thumbUpAnimationData:{
      type:Object,
      value:null
    },
    commentAnimationData:{
      type:Object,
      value:null
    }
  },

  lifetimes:{
    attached: function() {
      this.thumbUpAnimation = wx.createAnimation({
        duration:250,
        timingFunction:'ease-in-out',
      })

      this.commentAnimation = wx.createAnimation({
        duration:250,
        timingFunction:'ease-in-out',
      })

    }
  },

  methods: {
    
    onCommentIconTap() {
      this.triggerEvent("commentIconTap", {}, { bubbles: true, composed: true })
    },

    onThumbUpIconTap() {
      
      this.thumbUpAnimation.scale(1).step({duration:0});

      const resetAnimationData=this.thumbUpAnimation.export()
      this.setData({
        thumbUpAnimationData:resetAnimationData
      },()=>{
        this.thumbUpAnimation.scale(0.8).step().scale(1.2).step().scale(1).step();
        this.setData({
          thumbUpAnimationData:this.thumbUpAnimation.export()
        })
      })

      this.triggerEvent("thumbUpIconTap", {}, { bubbles: false, composed: false })
    },

    onCollectIconTap() {
      
      this.commentAnimation.scale(1).step({duration:0});

      const resetAnimationData=this.commentAnimation.export()
      this.setData({
        commentAnimationData:resetAnimationData
      },()=>{
        this.commentAnimation.scale(0.8).step().scale(1.2).step().scale(1).step();
        this.setData({
          commentAnimationData:this.commentAnimation.export()
        })
      })
      this.triggerEvent("collectIconTap", {}, { bubbles: true, composed: true })
    },

    onViewIconTap() {
      this.triggerEvent("viewIconTap", {}, { bubbles: true, composed: true })
    },

    onDingIconTap() {
      this.triggerEvent("dingIconTap", {}, { bubbles: true, composed: true })
    },

    onShareTap(){
      this.triggerEvent("shareTab", {}, { bubbles: true, composed: true })

    },

  }
})
