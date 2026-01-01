import api from "../config/api"
import wxutil from "../miniprogram_npm/@yyjeffrey/wxutil/index"
import { Paging } from "../utils/paging"

class Star {
  
  static async getStarUserPaging(param) {
    return new Paging(api.collectListAPI, param)
  }

  static async thumbUpOrCancel(params) {

    var res;
    try{
      var result = await wxutil.request.get(api.thumbUpAPI, params)
      if (result.statusCode === 200) {
        res = "success"
      }else{
        res=null
      }
    }catch(err){
      res=null
    }
    return res
  }

  static async thumbUpOrCancelArticleComment(params) {

    var res;
    try{
      var result = await wxutil.request.get(api.thumbUpArticleCommentAPI, params)
      if (result.statusCode === 200) {
        res = "success"
      }else{
        res=null
      }
    }catch(err){
      res=null
    }
    return res
  }

  static async collectArticleOrCancel(param) {

    var res;
    try{
      var result = await wxutil.request.get(api.collectArticleAPI, param)
      if (result.statusCode === 200) {
        res = "success"
      }else{
        res=null
      }
    }catch(err){
      res=null
    }
    return res
  }

  static async dingOrCancel(topicId) {

    var res;
    try{
      var result = await wxutil.request.get(api.dingAPI, {articleId: topicId})
      if (result.statusCode === 200) {
        res = "success"
      }else{
        res=null
      }
    }catch(err){
      res=null
    }
    return res
  }

}

export {
  Star
}
