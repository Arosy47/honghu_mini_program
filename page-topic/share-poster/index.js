import { Topic } from "../../models/topic"

import util from '../../utils/util.js'
const app = getApp()
Page({
  imagePath: '',
  history: [],
  future: [],
  isSave: false,
  userInfo:null,
  imgUrlList:[],
  coverImg:null,

  data: {
    template: {},
    customActionStyle: {
      border: {
        borderColor: '#1A7AF8',
      },
      scale: {
        textIcon: '/palette/switch.png',
        imageIcon: '/palette/scale.png',
      },
      delete: {
        icon: '/palette/close.png',
      },
    },
  },

  onLoad(options){
    
    this.type=options.type  
    if(this.type=='article'){
      var decodeStr = decodeURIComponent(options.topic);
      var article = JSON.parse(decodeStr)
      
      this.topicId=article.id
      this.authorUserId=article.userId
      this.authorNickName=article.anonymous?article.anonymousName:article.userNickName

      if(article.imgUrlList&&article.imgUrlList.length>0){
        this.content = util.formatText(article.content, 25)
      }else{
        this.content = util.formatText(article.content, 15*4+5)
      }

      this.imgUrlList = article.imgUrlList
      
      this.avatar = article.avatar
      this.categoryName='#'+article.categoryName
    }else if(this.type=='organization'){
      var decodeStr = decodeURIComponent(options.organization);
      var organization = JSON.parse(decodeStr)
      
      this.organizationId=organization.id
      this.authorUserId=organization.userId
      this.authorNickName=organization.userNickName

      if(organization.imgUrlList&&organization.imgUrlList.length>0){
        this.content = util.formatText(organization.content, 25)
      }else{
        this.content = util.formatText(organization.content, 15*4+5)
      }

      this.imgUrlList = organization.imgUrlList
      
      this.avatar = organization.avatar
      this.categoryName='快来加入我的局吧'
    }else if(this.type=='rank'){
      var decodeStr = decodeURIComponent(options.participant);
      var participant = JSON.parse(decodeStr)
      
      this.coverImg = options.coverImg
      this.participant=participant
      
      this.authorUserId=participant.userId
      this.authorNickName=participant.userNickName

      if(participant.imgUrlList&&participant.imgUrlList.length>0){
        this.content = util.formatText(participant.name, 25)
      }else{
        this.content = util.formatText(participant.name, 15*4+5)
      }

      this.imgUrlList = participant.imgUrlList
      
      this.avatar = participant.avatar
    }
  
    this.userInfo=app.globalData.userInfo
    this.getPageQrCode()
  },

  async getPageQrCode(){
    var params={}
    if(this.type=='article'){
      
      params={
        page:"pages/topic/index",
        scene:"topicId=" + this.topicId 

      }
    }else if(this.type=='organization'){
      params={
        page:"page-organization/organization-detail/index",
        
        scene:"orgId=" + this.organizationId + "&shareUId="+app.globalData.userInfo.userId

      }
    }else if(this.type=='rank'){
      
      params={
        page:"page-rank/rank-detail/index",
        
        scene:"id=" + this.participant.id 

      }
    }

    var res = await Topic.queryPageQrCode(params)
    if(res){
      
      this.qrCode=res
      this.handleStartDrawImg()
    }else{
      wx.showModal({
        title: '出错了',
        content: '',
        complete: (res) => {
          if (res.cancel) {
            
          }
      
          if (res.confirm) {
            
          }
        }
      })
    }
  },

  handleStartDrawImg() {
    wx.showLoading({
      title: '生成中'
    })
    var maxLength=5
    
    if(this.imgUrlList.length>0){
      maxLength=2
    }else{
      maxLength=5
    }
    
    var imgHeight=600
    this.setData({
      imgHeight:imgHeight,
    })

    let img1= this.imgUrlList.length>0?'https://'+this.imgUrlList[0]?.url+'!article_medium' : ''
    let img2= this.imgUrlList.length>1?'https://'+this.imgUrlList[1]?.url+'!article_medium' : ''

    if(this.type=='article'||this.type=='organization'){
      this.setData({
        
        imgDraw: {
          width: '621rpx',
          
          height: '830rpx',
          background: 'https://cdn.honghu.com/sysImg/shareTemplate.jpg',
          views: [
            {
              type: 'image',
              url: 'https://'+this.avatar+'!article_small',
              css: {
                top: '62rpx',
                left: '58rpx',
                
                width: '68rpx',
                height: '68rpx',
                borderRadius: '50%'
              },
            },
            {
              type: 'text',
              text: this.authorNickName,
              css: {
                top: '82rpx',
                fontSize: '26rpx',
                left: '138rpx',
                
                color: '#333333'
              }
            },
  
            {
              type: 'text',
              text: this.content,
              css: {
                top: '154rpx',
                left: '75rpx',

                width: '508rpx',
                
                lineHeight:'52rpx',
                fontWeight: 'bold',
                fontSize: '32rpx',
                color: '#333333'
              }
            },
            {
              type: 'image',
              url: img1,
              css: {
                top: '270rpx',
                left: '65rpx',
                
                width: '238rpx',
                height: '238rpx',
                borderRadius: '6rpx'
              },
            },
            {
              type: 'image',
              url: img2,
              css: {
                top: '270rpx',
                left: '315rpx',
                
                width: '238rpx',
                height: '238rpx',
                borderRadius: '6rpx'
              },
            },
  
            {
              type: 'text',
              text: this.imgUrlList.length>2? '共'+ this.imgUrlList.length + '图>>':'',
              css: {
                top: '522rpx',
                fontSize: '28rpx',
                left: '425rpx',
                
                fontWeight: 'bold',
                color: '#333333'
              }
            },
            {
              type: 'text',
              text: this.categoryName,
              css: {
                top: '545rpx',
                fontSize: '42rpx',
                left: '75rpx',

                fontWeight: 'bold',
                borderRadius: '16rpx',
                padding:'10rpx 20rpx 20rpx 20rpx',
                background:'#eb7a76',
                
                color: '#ffffff'
              }
            },
            {
              type: 'image',
              url: this.qrCode,
              css: {
                top: '608rpx',
                left: '330rpx',
                width: '130rpx',
                height: '130rpx'
              }
            }

          ]
        }
      })
    }else if(this.type=='rank'){
      this.setData({
        
        imgDraw: {
          width: '620rpx',
          
          height: '830rpx',

          background:'#ffffff',
          
          borderRadius: '30rpx',
          views: [
            {
              type: 'image',
              url: 'https://'+this.coverImg,
              css: {
                top: '0rpx',
                width: '620rpx',
                left: '0rpx',

                height: '238rpx',
                
              },
            },
            {
              type: 'text',
              text: this.content,
              css: {
                top: '154rpx',
                left: '75rpx',

                width: '508rpx',
                
                lineHeight:'52rpx',
                fontWeight: 'bold',
                fontSize: '32rpx',
                color: '#333333'
              }
            },
            {
              type: 'image',
              url: img1,
              css: {
                top: '270rpx',
                left: '65rpx',
                
                width: '238rpx',
                height: '238rpx',
                borderRadius: '6rpx'
              },
            },
            {
              type: 'image',
              url: img2,
              css: {
                top: '270rpx',
                left: '315rpx',
                
                width: '238rpx',
                height: '238rpx',
                borderRadius: '6rpx'
              },
            },
  
            {
              type: 'text',
              text: this.imgUrlList.length>2? '共'+ this.imgUrlList.length + '图>>':'',
              css: {
                top: '522rpx',
                fontSize: '28rpx',
                left: '425rpx',
                
                fontWeight: 'bold',
                color: '#333333'
              }
            },
            {
              type: 'text',
              text: "编号："+ this.participant.id,
              css: {
                top: '545rpx',
                left: '75rpx',
                
                fontSize: '28rpx',
                fontWeight: 'normal',
                color: '#333333',
                background:'#eb7a76',
                borderRadius: '10rpx',
                padding:'10rpx'
                
              }
            },
            {
              type: 'text',
              text: this.content,
              css: {
                top: '600rpx',
                left: '75rpx',
                
                fontSize: '42rpx',
                fontWeight: 'normal',
                color: '#333333'
                
              }
            },
            
            {
              type: 'text',
              text: "帅哥美女快来扫码帮我投票吧",
              css: {
                top: '720rpx',
                left: '50rpx',
                fontSize: '24rpx',
                fontWeight: 'light',
                color: '#8b8b8b'

              }
            },
            {
              type: 'image',
              url: this.qrCode,
              css: {
                top: '658rpx',
                left: '390rpx',
                width: '150rpx',
                height: '150rpx'
              }
            }
  
          ]
        }
      })
    }

  },
  onImgErr(e) {
    wx.hideLoading()
    wx.showToast({
      title: '生成分享图失败，请刷新页面重试'
    })
    
    this.triggerEvent('initData') 
  },

  onImgOK(e) {
    wx.hideLoading()
    this.setData({
      imagePath: e.detail.path,
      
    })
  },

  saveImage: util.throttle(async function () {
    
    if (this.data.imagePath && typeof this.data.imagePath === 'string') {
      
      this.isSave = false;
      const that =this
      wx.getSetting({
        success(res) {
  
          var writePhotosAlbum = res.authSetting['scope.writePhotosAlbum']
          if(writePhotosAlbum==false){ 
            wx.showModal({
              title: '',
              content: '保存图片需要您“添加到相册”权限，前往开启',
              complete: (res) => {
                if (res.cancel) {
                }
                if (res.confirm) {
                  wx.openSetting()
                }
              }
            })
          }else{
            wx.saveImageToPhotosAlbum({
              filePath: that.data.imagePath,
              fail(ee){
                console.log("ee",ee)
              },
              success(){
                wx.showToast({
                  title: '保存成功',
                })
              }
            });
          }
        },
        fail(e){
          method(param)
        }
      })
    }
  }, 1500),

});
