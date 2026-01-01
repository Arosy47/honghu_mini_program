import api from "../config/api"
import wxutil from "../miniprogram_npm/@yyjeffrey/wxutil/index"
import { Paging } from "../utils/paging"

class Topic {
  
  static async getTopicPaging(params) {
    return new Paging(api.topicAPI, params, 1, 16)   
  }

  static async searchArticle(params) {
    
    return new Paging(api.searchArticleAPI, params, 1, 20)
  }

  static async getShowInfoConfig(){
    var res;
    try{
      var result = await wxutil.request.get(api.getShowInfoConfigAPI)
      if (result.statusCode === 200) {
        res = result.data
      }else{
        res=null
      }
    }catch(err){

      res=null
    }
    return res

  }
  
  static async getNavList(){
    var res;
    try{
      var result = await wxutil.request.get(api.getNavListAPI)
      if (result.statusCode === 200) {
        res = result.data
      }else{
        res=null
      }
    }catch(err){

      res=null
    }
    return res

  }

  static async getWxGroupQrCode(){
    var res;
    try{
      var result = await wxutil.request.get(api.getWxGroupQrCodeAPI)
      if (result.statusCode === 200) {
        res = result.data
      }else{
        res=null
      }
    }catch(err){
      res=null
    }
    return res
    
  }

  static async publish(data) {
    
    var res;
    try{
      var result = await wxutil.request.post(api.createArticleApi, data)
      if (result.statusCode === 200) {
        
        res = 'success'
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

  static async topTen(param) {
    var res;
    try{
      var result = await wxutil.request.get(api.topTen,param)
      if (result.statusCode === 200) {
        res = result.data
      }else{
        res=null
      }
    }catch(err){
      
      res=null
    }
    return res

  }

  static async queryCategory(data) {
    var res;
    try{
      var result = await wxutil.request.get(api.queryCategoryAPI,data)
      if (result.statusCode === 200) {
        res = result.data
      }else{
        res=null
      }
    }catch(err){
      res=null
    }
    return res

  }

  static async getAllCategory() {
    
    var res;
    try{
      var result = await wxutil.request.get(api.getAllCategoryAPI)
      if (result.statusCode === 200) {
        res = result.data
      }else{
        res=null
      }
    }catch(err){
      res=null
    }
    return res

  }

  static async getCollectTopicPaging(params) {
    return new Paging(api.collectListAPI, params)
  }

  static async getTopicUserPaging(params) {
    return new Paging(api.userTopicAPI, params)
  }

  static async getUserOtherInfo(params) {
    var res;
    try{
      var result = await wxutil.request.get(api.userOtherInfoAPI, params)
      if (result.statusCode === 200) {
        res = result.data
      }else{
        res=null
      }
    }catch(err){
      res=null
    }
    return res

  }

  static async getTopicDetail(params) {

    var res;
    try{
      var result = await wxutil.request.get(api.topicDetailApi, params)
      if (result.statusCode === 200) {
        res = result.data
      }else{
        res="error"
      }
    }catch(err){
      res="error"
    }
    return res

  }

  static async addViewCount(params) {
    var res;
    try{
      var result = await wxutil.request.get(api.addViewCountApi, params)
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

  static async deleteTopic(articleId) {

    var res;
    try{
      var result = await wxutil.request.get(api.topicDeleteAPI, {articleId: articleId})
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

  static async cancelTop(articleId, schoolId) {
    var res;
    try{
      var result = await wxutil.request.get(api.cancelTopAPI, {articleId: articleId, schoolId: schoolId})
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

  static async reportTopic(params) {

    var res;
    try{
      var result = await wxutil.request.get(api.topicReportAPI, params)
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

  static async vote(params) {

    var res;
    try{
      var result = await wxutil.request.post(api.voteAPI, params)
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

  static async plusChatCnt(params) {
    
    var res;
    try{
      var result = await wxutil.request.get(api.plusChatCntAPI, params)
      
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

  static async endSecondHand(params) {
    return null
  }

}

export {
  Topic
}
