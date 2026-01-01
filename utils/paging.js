import wxutil from "../miniprogram_npm/@yyjeffrey/wxutil/index"
const defaultPage = 1
const defaultSize = 10

class Paging {
  url
  params
  page
  size
  hasMore = true
  locker = false
  accumulator = []
  token = ''

  constructor(url, params = {}, page = defaultPage, size = defaultSize) {
    this.url = url
    this.page = page
    this.size = size
    this.params = params
    this.token = wx.getStorageSync('userToken')
  }

  async getMore() {
    
    if (!this.hasMore) {
       
      return
    }
    if (!this._getLocker()) {
      
      return
    }
    try{
      const data = await this._getData()

      return data
    }finally{

      this._releaseLocker()
      
    }
  }

  async _getData() {
    var res;
    try{
      const params = this._getMergeParams()
      const result = await wxutil.request.get(this.url, params, {
        authorization:this.token
      })
      if (result.statusCode === 200) {
        
        res = result
      }else{
        res=null
      }
    }catch(err){
      res=null
    }
    if(!res){
      return null
    }

    if (res.data.dataList.length < this.size) {
      this.hasMore = false
    }
    
    this.accumulator = this.accumulator.concat(res.data.dataList)
    this.page++

    return {
      hasMore: this.hasMore,
      items: res.data,
      accumulator: this.accumulator,
      total: res.data.paginator.total,
      newList:res.data.dataList,
      page: this.page-1
    }
  }

  async getMoreUp() {
    
    if (!this.hasMore) {
       
      return
    }
    if (!this._getLocker()) {
      return
    }

    try{
      const data = await this._getDataUp()
      return data
    }finally{

      this._releaseLocker()
    }
  }

  async _getDataUp() {
    const params = this._getMergeParams()
    
    const res = await wxutil.request.get(this.url, params, {
      authorization:this.token
    })

    if (res.statusCode !== 200) {
      wx.showToast({
        title: '查询出错',
        icon:"error"
      })
      return null
    }
    
    if (res.data.dataList.length < this.size) {
      this.hasMore = false
    }

    let chatList = res.data.dataList
    chatList.reverse()
    this.accumulator = chatList.concat(this.accumulator),
    this.page++

    return {
      hasMore: this.hasMore,
      items: res.data,
      accumulator: this.accumulator,
      page: this.page-1
    }
  }

  _getMergeParams() {
    this.params = Object.assign(this.params, { pageNum: this.page, pageSize:this.size })
    return this.params
  }

  _getLocker() {
    if (this.locker) {
      return false
    }
    this.locker = true
    return true
  }

  _releaseLocker() {
    this.locker = false
  }
}

export {
  Paging
}
