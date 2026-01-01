

const app = getApp();
import util from '../../utils/util.js'
import { Comment } from "../../models/comment"
import { Star } from "../../models/star"
Page({

  refreshing:false,

  data: {
    commentList:[],
    
    page: 1,
    timeDesc: "时间",
    nodata: false,
    loading: false,
    hasMore: true, 
    actionsShow:false,

    initLoading:true,
    
    styleMap: [{ visible: true, height: 0 }],
  },

  onLoad: function (options) {
    this.current = 0
    this.observerList = []
    this.deviceHeight=app.globalData.windowHeight-app.globalData.navTop
    
    this.initMyComments()
  },

  onShow: function () {
  },

  onPullDownRefresh: async function () {
    this.initMyComments()
  },

  onReachBottom: async function () {
    
    if(this.data.hasMore){
      const commentPaging = this.commentPaging
      this.setData({
        loading: true
      })
      await this.getMoreComments(commentPaging)

    }
  },

  gotoArticleDetail(event) {
    const groupIndex = event.currentTarget.dataset.groupIndex
    const index = event.currentTarget.dataset.index
    const commentList = this.data.commentList
    const comment = commentList[groupIndex][index]
  
    let url = "/page-topic/topic-detail/index?"
    wx.navigateTo({
      url: url + "topicId=" + comment.articleId
    })
  },

  async initMyComments() {
    const params = {
      userId: app.globalData.userInfo.userId,
    }
    this.current = 0
    this.data.commentList=[]
   
    const commentPaging = await Comment.getUserCommentPaging(params)
    this.commentPaging=commentPaging
    
    await this.getMoreComments(commentPaging)

    if(this.data.initLoading){
      this.setData({
        initLoading:false
      })
    }
  },

  async getMoreComments(commentPaging) {
    const data = await commentPaging.getMore()
    
    if (!data) {
      return
    }

    if (data.page === 1) {
      if(data.newList.length === 0){
        this.setData({
          nodata: true,
          hasMore: false,
          loading: false,
          commentList:[]
        })
      }else{
        var commentList = []
        commentList[0]=data.newList
        this.setData({
          commentList:commentList,
          styleMap: [{ visible: true, height: 0 }],
          
          loading:false,
          hasMore:data.hasMore,
          articleNum: data.total,
          nodata: false,
        })
      }
    }else if (data.newList.length === 0) {
      
      this.setData({
        hasMore: false,
        loading: false,
        nodata: false,
      })
    }else{
      const key = `commentList[${this.current}]`
      const styleKey = `styleMap[${this.data.styleMap.length}]`
  
      this.setData({
        [key]: data.newList,
        [styleKey]: {
          visible: true,
          height: 0
        },
        loading:false,
        hasMore:data.hasMore
      })
    }

    this.current++
		wx.nextTick(() => {
			this.observeElement(this.current - 1)
		})
  },

	observeElement(index, isImmediate = false) {
		const observer = wx.createIntersectionObserver(this, { initialRatio: 0 })
		
		isImmediate ?
			(
				this.observeBorder(observer, index, isImmediate)
				&& this.observerList.splice(index, 1, observer)
			) :
			wx.nextTick(() => {
				this.observeBorder(observer, index, isImmediate)
				this.observerList.splice(index, 1, observer)
			})
	},
	
	observeBorder(observer = null, index) {
    
		const callback = (visible, height) => {
			if (this.data.styleMap[index] && this.data.styleMap[index].visible !== visible) {
				const key = `styleMap[${index}]`
				this.setData({
					[key]: {
						visible: visible,
						height: height
					}
				})
				this.observerList[index].disconnect()
			}
		}
		observer.relativeToViewport({
			top: this.deviceHeight * 2,
			bottom: this.deviceHeight * 2
		})
			.observe(`#selection-${index}`, ({ intersectionRatio, boundingClientRect }) => {
				const visible = intersectionRatio !== 0;
				
				callback(visible, boundingClientRect.height)
			})
  },
  
	manualCheck(scrollTop) {
		let height = 0,
			showIndex = 1
		
		for (let index = 0; index < this.data.styleMap.length; index++) {
      height += this.data.styleMap[index].height;
			if (height < scrollTop + this.deviceHeight * 2) {
				showIndex = index;
				continue;
			}
		}
		
    const showIndexs = [showIndex - 1, showIndex, showIndex + 1]
    
		showIndexs.forEach(visibleIndex => {
			this.data.styleMap[visibleIndex] && (this.data.styleMap[visibleIndex].visible || this.observeElement(visibleIndex, true))
		})
	},

  onPageScroll: util.throttle(async function (e) {
    
    this.manualCheck(e.scrollTop);
  },500),

  onUnload(){
    this.observerList.forEach(observer => observer?.disconnect())
  },
})