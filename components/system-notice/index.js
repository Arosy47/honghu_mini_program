
import util from '../../utils/util.js'

import { User } from "../../models/user"

const app = getApp()
Component({
  options: {
    styleIsolation: 'apply-shared'
  },
  
  properties: {
    
    badge: {
      type: Number,
      value: 0
    },

    index:{
      type: Number,
      value: 0
    },

    newSysNoticeContent:"终于等到你，在红狐生态圈记录自己"
  },

  data: {
    latestMsgTime: '',
    status:false
  },
 
  observers: {
  },

  methods: {
    
    async gotoSystemNotice() {
      const badge=this.properties.badge
      if(badge>0){
        app.globalData.systemNoticeNum -= badge
        this.setData({
          badge:0
        })
      }
      this.triggerEvent("gotoSystemNotice")
    },

    delete(){
      this.triggerEvent("onDelete")
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
