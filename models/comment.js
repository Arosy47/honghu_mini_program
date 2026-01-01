import api from "../config/api"
import wxutil from "../miniprogram_npm/@yyjeffrey/wxutil/index"
import { Paging } from "../utils/paging"

class Comment {

  static async getCommentTopicPaging(params) {
    return new Paging(api.articleCommentListApi, params, 1, 20)
  }

  static async getUserCommentPaging(params) {
    return new Paging(api.pageQueryUserCommentApi, params, 1, 20)
  }

  getCommentPaging

  static async getCommentReplyPaging(params) {
    return new Paging(api.commentReplyApi, params)
  }

  static async reportComment(params) {

    var res;
    try{
      var result = await wxutil.request.get(api.reportCommentAPI, params)
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

  static async reportOrganizationComment(params) {

    var res;
    try{
      var result = await wxutil.request.get(api.reportOrganizationCommentAPI, params)
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

  static async getOrganizationCommentPaging(params) {
    return new Paging(api.organizationCommentListApi, params)
  }

  static async getOrganizationInnerCommentPaging(params) {
    return new Paging(api.organizationInnerCommentListApi, params)
  }

  static async sendComment(data) {

    var res;
    try{
      var result = await wxutil.request.post(api.commentCreateAPI, data)
      if (result.statusCode === 200) {
        res = result.data  
      }else{
        if(result.data?.errMsg=="内容违规"){
          res="illegal"
        }else{
          res=null
        }
      }
    }catch(err){
      res=null
    }
    return res
  }

  static async sendOrganizationComment(data) {

    var res;
    try{
      var result = await wxutil.request.post(api.OrganizationCommentCreateAPI, data)
      if (result.statusCode === 200) {
        res = result.data
      }else{
        if(result.data?.errMsg=="内容违规"){
          res="illegal"
        }else{
          res=null
        }
      }
    }catch(err){
      res=null
    }
    return res
  }

  static async deleteComment(commentId) {

    var res;
    try{
      var result = await wxutil.request.get(api.deleteCommentAPI, {commentId:commentId})
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

  static async deleteOrganizationComment(commentId) {

    var res;
    try{
      var result = await wxutil.request.get(api.deleteOrganizationCommentAPI, {commentId:commentId})
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

  deleteOrganizationCommentAPI
}

export {
  Comment
}
