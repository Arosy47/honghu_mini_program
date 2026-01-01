import api from "../config/api"
import wxutil from "../miniprogram_npm/@yyjeffrey/wxutil/index"
import { Paging } from "../utils/paging"

class AnonymousChat {

  static async getMsgPaging(params) {
    return new Paging(api.MatchChatMsgListAPI, params, 1,20)
  }

  static async report(params) {

    var res;
    try{
      var result = await wxutil.request.get(api.anonymousChatReportAPI, params)
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
  AnonymousChat
}
