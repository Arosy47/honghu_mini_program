
import { Topic } from "../../models/topic"
import { User } from "../../models/user"
import util from '../../utils/util.js'

const app = getApp()

Page({
  topicPaging: null,  
  data: {
    labels: [{"name":"最新","id":1}, {"name":"最热","id":2}],
    topics: [],
    users: [], 
    topTen: [],
    keyword: '',
    tabId: 1,
    userId: -1,
   
    admin: false, 
    hasMore: true, 
    loading: false, 
    currentPage:1,

    option: [
      { text: '动态', value: 'a' },
      { text: '热门', value: 'b' },
    
    ],
    value: 'a',
    categoryCode:"",
    categoryName:"所有板块",
    currentTab:'',
    searchType: 'post', 

    showPopup:false,

    categoryList:[],
    selectCategory:null,

    nodata: false,
    
    styleMap: [{ visible: true, height: 0 }],
  },

  onLoad(options) {
    this.current = 0
    this.observerList = []
    this.deviceHeight=app.globalData.windowHeight-app.globalData.navTop

    if(options.categoryCode){
      this.setData({
        keyword:options.keyword,
        categoryCode:options.categoryCode,
        categoryName:options.categoryName
      })
    }else{
      this.setData({
        keyword:options.keyword,
      })
      
      this.initTopics('')
    }

    this.getUserInfo()
    this.getAllCategory(this.data.categoryCode)
  },

  onShow() {
    this.getUserInfo()
  },

  onSearch() {
    
    const searchValue=this.data.keyword

    if (searchValue) {
      var history = wx.getStorageSync('article_search_history')
      if(Array.isArray(history)) {
        
        const index=history.indexOf(searchValue)
        if(index>-1){
          history.splice(index,1)
        }
        history.unshift(searchValue)
        if(history.length>12){
          history.pop()
        }
        wx.setStorageSync('article_search_history', history)
      } else {
        
        wx.setStorageSync('article_search_history', [searchValue])
      }

      if (this.data.searchType === 'post') {
        this.initTopics('')
        
      } else {
        this.pageQueryUser()
      }
    }
  },

  switchSearchType(e) {
    const type = e.currentTarget.dataset.type
    this.setData({
      searchType: type
    })
    
    if (this.data.keyword) {
      if (type === 'post') {
        this.initTopics('')
      } else {
        this.pageQueryUser()
      }
    }
  },

  async pageQueryUser(){
    wx.showLoading({
      title: '搜索中',
    })

    this.setData({
      nodata:false
    })
    this.current = 0
    this.data.userList=[]
    const params = {
      keyword: this.data.keyword,
      
    }

    const userPaging = await User.getUserPaging(params)
    
    this.userPaging=userPaging
    await this.getMoreUsers(userPaging)

    wx.hideLoading()
  },

  async getMoreUsers(userPaging) {
    const data = await userPaging.getMore()
    wx.hideLoading()
    if (!data) {
      return
    }

    if (data.page === 1) {
      if(data.newList.length === 0){
        this.setData({
          nodata: true,
          hasMore: false,
          loading: false,
          userList:[]
        })
      }else{
        var userList = []
        userList[0]=data.newList
        this.setData({
          userList:userList,
          styleMap: [{ visible: true, height: 0 }],
          
          loading:false,
          hasMore:data.hasMore,
          nodata: false,
        })
      }
    } else if (data.newList.length === 0) {
      this.setData({
        hasMore: false,
        loading: false,
        nodata: false,
      })
    }else {
      const key = `userList[${this.current}]`
      const styleKey = `styleMap[${this.data.styleMap.length}]`
      this.setData({
        [key]: data.newList,
        [styleKey]: {
          visible: true,
          height: 0
        },
        loading:false,
        hasMore:data.hasMore,
        nodata: false,
      })
    }
		this.current++
		wx.nextTick(() => {
			this.observeElement(this.current - 1)
		})
  },

  gotoUserProfile(e) {
    
    const userId = e.currentTarget.dataset.userId

    const url= "/page-profile/visiting-card/index?userId=" + userId 
    
    wx.navigateTo({
      url: url
    })
  },

  followUser(e) {
    
    e.stopPropagation()
    
    const userId = e.currentTarget.dataset.userId
    const index = e.currentTarget.dataset.index
    const user = this.data.users[index]

    if (this.data.userId === -1) {
      wx.showToast({
        title: '请先登录',
        icon: 'none'
      })
      return
    }

    const isFollowed = !user.isFollowed

    this.setData({
      [`users[${index}].isFollowed`]: isFollowed
    })

  },

  getUserInfo() {
    if (app.globalData.userInfo) {
      this.setData({
        userId: app.globalData.userInfo.userId,
        admin: app.globalData.userInfo.admin
      })
    } else {
      this.setData({
        userId: -1,
        admin: false
      })
    }
  },

  async initTopics(order) {

    wx.showLoading({
      title: '搜索中',
    })

    this.setData({
      nodata:false
    })
    this.current = 0
    this.data.topics=[]
    const params = {
      keyword: this.data.keyword,
      categoryCode:this.data.categoryCode,
      functionType:"",
      order:order
    }

    this.data.topics=[]
    const topicPaging = await Topic.searchArticle(params)
    
    this.topicPaging=topicPaging
    await this.getMoreTopics(topicPaging)

    wx.hideLoading()

  },

  async getMoreTopics(topicPaging) {
    const data = await topicPaging.getMore()
    wx.hideLoading()
    if (!data) {
      return
    }

    if (data.page === 1) {
      if(data.newList.length === 0){
        this.setData({
          nodata: true,
          hasMore: false,
          loading: false,
          topics:[]
        })
      }else{
        var topics = []
        topics[0]=data.newList
        this.setData({
          topics:topics,
          styleMap: [{ visible: true, height: 0 }],
          
          loading:false,
          hasMore:data.hasMore,
          articleNum: data.total,
          nodata: false,
        })
      }
    } else if (data.newList.length === 0) {
      this.setData({
        hasMore: false,
        loading: false,
        nodata: false,
      })
    }else {
      const key = `topics[${this.current}]`
      const styleKey = `styleMap[${this.data.styleMap.length}]`
      this.setData({
        [key]: data.newList,
        [styleKey]: {
          visible: true,
          height: 0
        },
        loading:false,
        hasMore:data.hasMore,
        articleNum: data.total,
        nodata: false,
      })
    }
		this.current++
		wx.nextTick(() => {
			this.observeElement(this.current - 1)
		})
  },

  gotoTopicDetail(event) {

    const groupIndex = event.currentTarget.dataset.groupIndex
    const index = event.currentTarget.dataset.index
    const topics = this.data.topics
    const topic = topics[groupIndex][index]

    wx.navigateTo({
      url: "/page-topic/topic-detail/index?topicId=" + topic.id
    })
  },

  async onReachBottom() {
    
    if(this.data.hasMore){
      const topicPaging = this.topicPaging
      this.setData({
        loading: true
      })
      await this.getMoreTopics(topicPaging)

    }
    
  },

  switchTab(e){
    let currentTab = e.currentTarget.dataset.index;

    this.setData({
      currentTab: currentTab
    })

    this.initTopics(currentTab)
  },

  showCategoryList(){
    
    this.setData({
      showPopup:true
    })
    
  },

  closePopup() {
    this.setData({ showPopup: false });
  },

  async getAllCategory(categoryCode) {

    var categoryList;
    if(app.categoryList){
      categoryList=app.categoryList
    }else{
      categoryList = await Topic.getAllCategory()
    }

    if(categoryList){
      app.categoryList=categoryList

      const category = categoryList.find(item => {
        return item.categoryCode === categoryCode
      })
  
      const newCategoryList = categoryList.map((item, index) => {
        if (item.categoryCode !== categoryCode) {
          item.active = false;
        } else {
          item.active = true
        }
        return item;
      })
  
      this.setData({
        categoryList: newCategoryList,
        selectCategory: category
      })

    }
   
  },

  onTagTap(event) {
    
    const categoryCode = event.currentTarget.dataset.categoryCode
    const categoryList = this.data.categoryList
    var selectCategory=null
    if(categoryCode=="ALL"){
      selectCategory=null
    }else{
      
      selectCategory = categoryList.find(item => {
        return item.categoryCode === categoryCode
      })
    }
    
    const newcategoryList = categoryList.map((item, index) => {
      if (item.categoryCode !== categoryCode) {
        item.active = false;
      } else {
        item.active = true
      }
      return item;
    })

    this.setData({
      showPopup:false
    })

    this.setData({
      categoryList: newcategoryList,
      selectCategory: selectCategory,
      categoryCode:selectCategory?selectCategory.categoryCode:"",
      categoryName:selectCategory?selectCategory.categoryName:"所有板块",
    })

    this.initTopics(this.data.currentTab)
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
