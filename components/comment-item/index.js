
import util from '../../utils/util.js'
import { Star } from "../../models/star"
const app = getApp()
Component({
  options: {
    styleIsolation: 'apply-shared'
  },
  properties: {
    comment: Object,

    isOwner: {
      type: Boolean,
      value: false
    },

    isOrganization:{
      type: Boolean,
      value: false
    },

    index:{
      type: Number,
      value: null
    },
    
    admin:{
      type: Boolean,
      value:false
    },

    topic:Object
  },

  data: {
    expand: false,  

    parentAnimationData:{
      type:Object,
      value:null
    },

    imgHeight:0,  
    imgWidth:0,
    imageMode:"heightFix",

    richContent:[], 
    replyList:[],
    subCommentList:[],
  },

  lifetimes: {
    attached: function() {

      this.parentAnimation = wx.createAnimation({
        duration:250,
        timingFunction:'ease-in-out',
      })

      this.replyAnimation = wx.createAnimation({
        duration:250,
        timingFunction:'ease-in-out',
      })
    }
  },

  observers: {
    comment: function(comment) {
      
      if (comment) {

        var richContent=[]
        if(comment.content!=null&&comment.content.length>0){
          
          richContent = util.replaceTextWithEmoji(comment.content,"25px")
          
        }

        if(comment.replyList){
          var subCommentList = [] 
          var replyList = [] 

          for(var i=0;i<comment.replyList.length;i++){
            var reply = comment.replyList[i]
            var richReplyContent=[]
            if(reply.content){
              
              richReplyContent = util.replaceTextWithEmoji(reply.content,"25px")
              
              if(reply.toUserNickName != '' && reply.replyCommentId != reply.parentCommentId){

                let textSize = util.rpx2px(25)+"px";
                var prefix=[
                  {
                    name:'span',
                    attrs:{
                      style:`color: #333333; font-size:${textSize}`
                      
                    },
                    children:[{
                      type:'text',
                      text:'回复',
                    }]
                  },
                  {
                    name:'span',
                    attrs:{
                      style:`font-size:${textSize};font-weight: normal;color: #aeaeae;margin-left:2px; margin-right:2px;`
                    },
                    children:[{
                      type:'text',
                      text: reply.toUserNickName+':'
                    }]
                  }
                ]

                richReplyContent=prefix.concat(richReplyContent)

                reply.richContent = richReplyContent
              }else{
                
                reply.richContent = richReplyContent
              }
            }

            if(i<Math.min(comment.replyList.length,2)){
              subCommentList.push(reply)
            }
            replyList.push(reply)
          }

          if(comment.replyList.length>2){
            this.setData({
              richContent:richContent,
              replyList:replyList,
              subCommentList:subCommentList,
              
            })
          }else{
            this.setData({
              richContent:richContent,
              replyList:replyList,
              subCommentList:subCommentList,
              expand:true
            })
          }
        }else{
          this.setData({
            richContent:richContent,
          })
        }

      }
    },
  },

  methods: {
    
    onCommentItemLongTap(e) {

      if(e.currentTarget.dataset.reply_type==1){
        this.triggerEvent("commentLongTap", { cid: e.currentTarget.dataset.cid, toUserId: e.currentTarget.dataset.to_user_id, nickName: e.currentTarget.dataset.nick_name, parentId: e.currentTarget.dataset.parent_id, commentText: e.currentTarget.dataset.comment_text, replyType: e.currentTarget.dataset.reply_type, parentIndex:this.data.index})
      }else{
        this.triggerEvent("commentLongTap", { cid: e.currentTarget.dataset.cid, toUserId: e.currentTarget.dataset.to_user_id, nickName: e.currentTarget.dataset.nick_name, parentId: e.currentTarget.dataset.parent_id, commentText: e.currentTarget.dataset.comment_text, replyType: e.currentTarget.dataset.reply_type, parentIndex:this.data.index, subIndex:e.currentTarget.dataset.sub_index})
      }
    },

    onCommentItemTap(e) {

      if(e.currentTarget.dataset.reply_type==1){
        this.triggerEvent("commentTap", { cid: e.currentTarget.dataset.cid, toUserId: e.currentTarget.dataset.to_user_id, nickName: e.currentTarget.dataset.nick_name, parentId: e.currentTarget.dataset.parent_id, commentText: e.currentTarget.dataset.comment_text, replyType: e.currentTarget.dataset.reply_type, parentIndex:this.data.index})
      }else{
        this.triggerEvent("commentTap", { cid: e.currentTarget.dataset.cid, toUserId: e.currentTarget.dataset.to_user_id, nickName: e.currentTarget.dataset.nick_name, parentId: e.currentTarget.dataset.parent_id, commentText: e.currentTarget.dataset.comment_text, replyType: e.currentTarget.dataset.reply_type, parentIndex:this.data.index, subIndex:e.currentTarget.dataset.sub_index})
      }
    },

    onDeleteTap() {
      this.triggerEvent("deleteTap", { commentId: this.data.comment.id })
    },

    onThumbUp(e) {

      const comment =  this.data.comment

      if(e.currentTarget.dataset.type == "parentComment"){

        if(comment.replyList){
          comment.replyList.map(item => item.thumbUpAnimationData=null)
        }
        
        this.setData({
          comment:comment
        })

        this.parentAnimation.scale(1).step({duration:0});
        const resetAnimationData=this.parentAnimation.export()
        this.setData({
          parentAnimationData:resetAnimationData
        },()=>{
          this.parentAnimation.scale(1.4).step().scale(1).step();
          this.setData({
            parentAnimationData:this.parentAnimation.export()
          })
        })
        
      }else if(e.currentTarget.dataset.type == "reply"){
        
        const index = e.currentTarget.dataset.index
        const replyList = comment.replyList
        replyList.map(item => item.thumbUpAnimationData=null)
        const reply = replyList[index]

        this.replyAnimation.scale(1).step({duration:0});
        const resetAnimationData=this.replyAnimation.export()
        reply.thumbUpAnimationData=resetAnimationData
        this.setData({
          comment: comment
        },()=>{
          this.replyAnimation.scale(1.4).step().scale(1).step();
          reply.thumbUpAnimationData=this.replyAnimation.export()
          this.setData({
            comment: comment
          })
        })

      }
     
      var thumbUpStatus;
      if(e.currentTarget.dataset.type == "parentComment"){
        
        const hasStar = comment.thumbUpStatus
        thumbUpStatus = !comment.thumbUpStatus
        var thumbUpCount = comment.thumbUpCount
        if (hasStar) {
          thumbUpCount--
        } else {
          thumbUpCount++
        }
        this.setData({
          'comment.thumbUpStatus':thumbUpStatus,
          'comment.thumbUpCount':thumbUpCount
        })

      }else if(e.currentTarget.dataset.type == "reply"){
        const index = e.currentTarget.dataset.index
        const replyList = comment.replyList
        const reply = replyList[index]

        const hasStar = reply.thumbUpStatus
        thumbUpStatus = !reply.thumbUpStatus
        var thumbUpCount = reply.thumbUpCount
        if (hasStar) {
          thumbUpCount--
        } else {
          thumbUpCount++
        }

        this.setData({
          [`comment.replyList[${index}].thumbUpStatus`]:thumbUpStatus,
          [`comment.replyList[${index}].thumbUpCount`]:thumbUpCount
        })

      }

      if(this.thumbArticleTimerId){
        
        clearTimeout(this.thumbArticleTimerId);
      }
      
      this.thumbArticleTimerId=setTimeout(async() => {
        var commentId= e.currentTarget.dataset.cid
        var userId = e.currentTarget.dataset.user_id
        
        const params= {
          articleId:this.data.topic.id,
          commentId: commentId,
          targetUserId: userId,
          thumbUpStatus:thumbUpStatus
        }
        const res = await Star.thumbUpOrCancelArticleComment(params)

      }, 2000);

    },

    onExpandTap() {
      
      var expand = this.data.expand
      
      this.setData({
        expand: !this.data.expand
      })

    },

    queryReply(cid) {
      this.triggerEvent("queryReply", {cid: cid})
    },

    onTabNickName(data){
      
      wx.navigateTo({
        url: "/page-profile/visiting-card/index?userId=" + data.currentTarget.dataset.user_id
      })
    },

    previewImage(event) {
       
      app.globalData.preImgStatus=true  
      
      const url = event.currentTarget.dataset.src+"!article_big"
      wx.previewImage({
        current: url,
        urls: [url]
      })
    },

  }
})
