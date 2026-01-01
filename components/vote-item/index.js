
import { Topic } from '../../models/topic.js'
import util from '../../utils/util.js'

Component({
  options: {
    styleIsolation: 'apply-shared'
  },

  properties: {
    voteArticle: Object,

    topicId:{
      type: Number,
      value: 0
    },
    
    detail:{
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

    voteTotalCount:{
      type: Number,
      value: 0
    },

    showww:{
      type: Boolean,
      value: false
    },
    
    expireTime:{
      type: String,
      value: null
    },
    peopleNum:{
      type: Number,
      value: null
    },
  },

  data: {
    tempSelectIndexList:[]
  },

  methods: {
    
    voteSelect(e) {

      var optionId=e.currentTarget.dataset.optionid
      var index = e.currentTarget.dataset.idx

      if(this.data.voteArticle.canMultiSelect){
        var status = this.data.voteOptionList[index].userVoteStatus

        this.setData({
          [`voteOptionList[${index}].userVoteStatus`]:!status,
        })

      }else{
        if(this.data.tempSelectIndexList.length>0){
          if(this.data.tempSelectIndexList[0]==index){

            return
          }else{
            
            this.setData({
              [`voteOptionList[${this.data.tempSelectIndexList[0]}].userVoteStatus`]:false,
              [`voteOptionList[${index}].userVoteStatus`]:true,
            })
            this.data.tempSelectIndexList=[]
            this.data.tempSelectIndexList.push(index);
          }
          
        }else{
          this.data.tempSelectIndexList.push(index);
          this.setData({
            [`voteOptionList[${index}].userVoteStatus`]:true,
          })
          
        }
      }
      
    },

    confirmVote:util.throttle(async function (e){

      if(Date.now() >this.data.voteArticle.expireTime){
        wx.showToast({
          title: '投票已结束',
          icon:'none'
        })
        return
      }
      var voteOptionList = this.data.voteOptionList
      var optionIdList = voteOptionList.filter(item=> item.userVoteStatus==true).map(item=>item.id)
      
      if(!optionIdList || optionIdList.length==0){
        wx.showToast({
          title: '请选择',
          icon:'none'
        })
        return
      }
      
      var voteTotalCount = this.data.voteTotalCount+optionIdList.length

      voteOptionList.map(item=>{
        if(item.userVoteStatus){
          var rate=((item.voteCount+1)/voteTotalCount)*100
          item.rate = rate.toFixed(2)+"%"
          item.rateValue = rate/100
          item.voteCount=item.voteCount+1
        }else{
          var rate=(item.voteCount/voteTotalCount)*100
          item.rate = rate.toFixed(2)+"%"
          item.rateValue = rate/100
        }
        
      })

      this.setData({
        voteOptionList:voteOptionList,
        userVoted:true,
        
        voteTotalCount:voteTotalCount,
        peopleNum:this.data.peopleNum+1
      })

      setTimeout(() => {
        this.setData({showww:true})
      }, 300);

      const data = {
        optionIdList:optionIdList,
        voteId:this.data.voteArticle.id,
        articleId:this.data.topicId,
      }
  
      var res = await Topic.vote(data);
      if(res){

        this.triggerEvent("vote", {"voteOptionList":voteOptionList,"peopleNum":this.data.peopleNum}, { bubbles: true, composed: true })
      }
    },1000),
  }
})