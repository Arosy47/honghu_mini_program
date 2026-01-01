

import util from '../../utils/util.js'

const app = getApp()
Component({
  options: {
    styleIsolation: 'apply-shared'
  },
  
  properties: {
    session:Object,
    badge: {
      type: Number,
      value: 0
    },

    index:{
      type: Number,
      value: 0
    },

    isLongPressed:{
      type: Boolean,
      value: false
    },
  },

  data: {
    latestMsgTime: '',
    status:false
  },
 
  observers: {

  },

  methods: {
    
    async gotoChatRoom() {

      if(this.data.isLongPressed) return;

      if(util.isForbidden()){
        return
      }

      this.triggerEvent("gotoChatRoom", {toUserId:this.properties.session.toUserId, toUserName:this.properties.session.sessionName, toUserAvatar:this.properties.session.toUserAvatar})
    },

    delete(){
      return
      if(this.data.isLongPressed) return;
      this.setData({
        isLongPressed:true
      })

      setTimeout(()=>{
        this.setData({isLongPressed:false})
      },2000);

      this.triggerEvent("onDelete", {sessionId:this.properties.session.id})
    },

    touchS(e) {

      this.data.status = false
      
      this.data.startX = e.touches[0].clientX;
      this.data.startY = e.touches[0].clientY;
    },
    
    touchM(e) {

      var currentX = e.touches[0].clientX;
      var currentY = e.touches[0].clientY;
      const x = this.data.startX - currentX; 
      const y = Math.abs(this.data.startY - currentY); 

      if (x > 35 && y < 110) {

        this.setData({
          status:true
        })
        
      } else if (x < -35 && y < 110) {

        this.setData({
          status:false
        })
        
      }
    },

  }
})
