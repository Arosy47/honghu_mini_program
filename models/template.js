import api from "../config/api"
import wxutil from "../miniprogram_npm/@yyjeffrey/wxutil/index"

class Template {
  
  static async getTemplateId(title) {    
    var res;
    try{
      var result = await wxutil.request.get(api.templateAPI, { title: title })
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
}

export {
  Template
}
