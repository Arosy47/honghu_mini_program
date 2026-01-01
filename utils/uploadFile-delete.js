

import api from "../config/api"

var uploadFile = function (type, tempFilePaths) {
  
  var camSafeUrlEncode = function (str) {
    return encodeURIComponent(str)
      .replace(/!/g, '%21')
      .replace(/'/g, '%27')
      .replace(/\(/g, '%28')
      .replace(/\)/g, '%29')
      .replace(/\*/g, '%2A');
  };

  // 获取签名
  var getAuthorization = function (options, callback) {
    const header = {'Content-Type':'application/json'};
    header['authorization'] = wx.getStorageSync('userToken')

    wx.request({
      method: 'GET',
      // 替换为自己服务端地址 获取post上传签名
      url: api.getPostPolicyAPI,
      data: options,
      dataType: 'json',
      header: header,
      success: function (result) {
        console.log("reeee",result)
        var data = result.data;
        if (data.statusCode==200) {
          callback(data.data);
        } else {
          wx.showModal({
            title: '临时密钥获取失败',
            content: JSON.stringify(data),
            showCancel: false,
          });
        }
      },
      error: function (err) {
        wx.showModal({
          title: '临时密钥获取失败',
          content: JSON.stringify(err),
          showCancel: false,
        });
      },
    });
  };
    
   /**
   * prefix: 请求 cos 的 url
   * filePath: 小程序选择上传的文件路径
   * key: 上传到 cos 的路径
   * formData: 服务端返回的鉴权参数
   */
  var postFile = function ({ prefix, filePath, key, formData }) {
    console.log("formData",formData)
    var requestTask = wx.uploadFile({
      url: prefix,
      name: 'file',
      filePath: filePath,
      formData: formData,
      success: function (res) {
        var url = prefix + '/' + camSafeUrlEncode(key).replace(/%2F/g, '/');
        if (res.statusCode === 200) {
          wx.showModal({ title: '上传成功', content: url, showCancel: false });
        } else {
          console.log("res",res)
          wx.showModal({
            title: '上传失败',
            content: JSON.stringify(res),
            showCancel: false,
          });
        }
        console.log(res.header['x-cos-request-id']);
        console.log(res.statusCode);
        console.log(url);
      },
      fail: function (res) {
        console.log("res",res)
        wx.showModal({
          title: '上传失败',
          content: JSON.stringify(res),
          showCancel: false,
        });
      },
    });
    requestTask.onProgressUpdate(function (res) {
      console.log('正在进度:', res);
    });
  };

  // 上传文件
  var uploadFile = function (filePaths) {
    filePaths.map(filePath=>{
      var extIndex = filePath.lastIndexOf('.');
      var fileExt = extIndex >= -1 ? filePath.substr(extIndex + 1) : '';
      // 传入文件后缀名，服务端生成带签名的 url
    })
    
    getAuthorization({ type: type, ext: fileExt }, function (AuthData) {
      // 确认AuthData格式是否正确
      console.log(AuthData);
      // 请求用到的参数
      var prefix = 'https:
      var key = AuthData.cosKey; 
      var formData = {
        key: key,
        success_action_status: 200,
        'Content-Type': '',
        'q-sign-algorithm': AuthData.qSignAlgorithm,
        'q-ak': AuthData.qAk,
        'q-key-time': AuthData.qKeyTime,
        'q-signature': AuthData.qSignature,
        policy: AuthData.policy,
      };
      if (AuthData.securityToken)
        formData['x-cos-security-token'] = AuthData.securityToken;
      postFile({ prefix, filePath, key, formData });
    });
  };

  uploadFile(tempFilePaths);

};

module.exports = {
  uploadFile
}