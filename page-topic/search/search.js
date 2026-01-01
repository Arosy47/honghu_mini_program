

import { Topic } from "../../models/topic"

const app = getApp()
Page({

  data: {
    labels: [],
    searchValue:'',
    topTen:[],

    searchHistory:[],  
  },

  onLoad(options) {
    this.loadCategorys()

    if(app.topTen){
      this.setData({
        topTen: app.topTen
      })
    }else{
      this.topTen()
    }
  },

  async topTen() {
    const param = {
      period:"TOP_TEN_DAY"
      
    }
    const topTen = await Topic.topTen(param)
    if(topTen){
      this.setData({
        topTen: topTen
      })
    }
    
  },

  onReady() {

  },

  onShow() {
    var history = wx.getStorageSync('article_search_history')
    if(Array.isArray(history)){
      this.setData({
        searchHistory:history
      })
    }
   
  },

  onHide() {

  },

  onUnload() {

  },

  onPullDownRefresh() {

  },

  onReachBottom() {

  },

  async loadCategorys() {

    if(app.categoryList){
      this.setData({
        labels: app.categoryList
      })
    }else{
      const categoryList = await Topic.getAllCategory()
      if(categoryList){
        this.setData({
          labels: categoryList
        })
        app.categoryList=categoryList
      }
    }
  },

  onTagTap(event) {

    const label = event.currentTarget.dataset.label
    
    const url = `/page-topic/category-detail/index?labelId=${label.categoryCode}&labelName=${label.categoryName}`
    wx.navigateTo({
      url: url
    })
  },

  onSearch() {
    
    const searchValue=this.data.searchValue
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

      const url = `/page-topic/search-result/index?keyword=${searchValue}`
      wx.navigateTo({
        url: url
      })
    }
  },

  gotoDetail(event){

    const id = event.currentTarget.dataset.id
    wx.navigateTo({
      url: "/page-topic/topic-detail/index?topicId=" + id
    })
  },

  clearHistory(){
    this.setData({
      searchHistory:[]
    })
    wx.setStorageSync('article_search_history', [])
  },

  historySearch(event){
    
    const searchValue=event.currentTarget.dataset.value
    var history = wx.getStorageSync('article_search_history')
    if(Array.isArray(history)) {
      const index=history.indexOf(searchValue)
      if(index>-1){
        history.splice(index,1)
      }
      history.unshift(searchValue)
      wx.setStorageSync('article_search_history', history)
    } else {
      
      wx.setStorageSync('article_search_history', [searchValue])
    }

    const url = `/page-topic/search-result/index?keyword=${searchValue}`
    wx.navigateTo({
      url: url
    })

  }
})