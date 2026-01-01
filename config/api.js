

const baseAPI = "https://honghu.com"
const socketAPI = "wss://honghu.com"

export default {
  baseAPI, 
  
  socketAPI: socketAPI, 
  
  subjectAPI: baseAPI + "/app/data/getAllOrganizationSubjects", 
  topicAPI: baseAPI + "/app/article/list", 
  searchArticleAPI: baseAPI + "/app/article/searchArticle", 

  topTen: baseAPI + "/app/article/topTen", 
  queryCategoryAPI: baseAPI + "/app/article/queryCategory", 
  getAllCategoryAPI: baseAPI + "/app/data/getAllCategory",

  getShowInfoConfigAPI: baseAPI + "/app/data/getShowInfoConfig", 
  
  getNavListAPI: baseAPI + "/app/data/getNavList", 
  getWxGroupQrCodeAPI: baseAPI + "/app/data/getWxGroupQrCode", 

  userTopicAPI: baseAPI + "/app/article/viewUserArticle", 
  collectListAPI: baseAPI + "/app/collect/listCollectArticle",
  topicDeleteAPI: baseAPI + "/app/article/deleteArticle", 
  cancelTopAPI: baseAPI + "/app/article/cancelTop", 

  topicReportAPI: baseAPI + "/app/article/complaint", 

  chatReportAPI: baseAPI + "/app/sixin/complaint", 
  anonymousChatReportAPI: baseAPI + "/app/randomChat/complaint", 

  organizationReportAPI: baseAPI + "/app/organization/complaint", 
  getAllOrganizationSubjectsAPI: baseAPI + "/app/data/getAllOrganizationSubjects", 

  voteAPI: baseAPI + "/app/article/vote",

  plusChatCntAPI: baseAPI + "/app/article/plusChatCnt",

  organizationAPI: baseAPI + "/app/organization/list", 
  myOrganizationAPI: baseAPI + "/app/organization/listMine",

  searchOrganizationAPI: baseAPI + "/app/organization/searchOrganization", 

  organizationDetailApi: baseAPI + "/app/organization/detail", 
  organizationPublishApi: baseAPI + "/app/organization/publish", 
  organizationJoinApi: baseAPI + "/app/organization/join", 
  outOrganizationAPI: baseAPI + "/app/organization/out",

  deleteOrganizationAPI: baseAPI + "/app/organization/delete",

  notificationAPI: baseAPI + "/app/notification/listNoticeMessage", 
  getSubscribeTimesAPI: baseAPI + "/app/notification/getSubscribeTimes", 

  sysNotificationsAPI: baseAPI + "/app/notification/getSysNotifications",   
  getNewestSystemNoticeApi: baseAPI + "/app/notification/getNewestSystemNotice", 

  getMatchChatUnreadCountApi: baseAPI + "/app/notification/getMatchChatUnreadCount", 

  updateAlreadyReadViolationNotificationAPI: baseAPI + "/app/notification/updateAlreadyReadViolationNotification",   
  
  createArticleApi: baseAPI + "/app/article/createArticle", 
  topicDetailApi: baseAPI + "/app/article/detail", 
  addViewCountApi:baseAPI+"/app/article/addViewCount",

  holeAPI: baseAPI + "hole/", 
  chatMsgListAPI: baseAPI + "/app/chat/msgList", 
  MatchChatMsgListAPI: baseAPI + "/app/chat/matchChatMsgList", 

  chatSessionListAPI: baseAPI + "/app/sixin/sessionList", 
  matchingQueueAPI: baseAPI + "/app/randomChat/matchingQueue", 
  addToQueueAPI:baseAPI + "/app/randomChat/addToQueue",
  removeFromQueueAPI:baseAPI + "/app/randomChat/removeFromQueue",
  deleteSessionApi: baseAPI + "/app/sixin/delSession",

  getUnreadCountAPI: baseAPI + "/app/notification/getUnreadCount",

  userChangeAPI: baseAPI + "/app/user/changeUserInfo", 

  privacySettingAPI:baseAPI + "/app/user/privacySetting", 
  userInfoAPI: baseAPI + "/app/user/userInfo", 

  userOtherInfoAPI: baseAPI + "/app/user/getUserOtherInfo", 

  certificatePhoneAPI:baseAPI + "/app/user/certificatePhone",
  authenticateAPI:baseAPI + "/app/user/authenticate",

  createSessionAPI:baseAPI + "/app/sixin/createSession",
  
  createRandomChatSessionAPI:baseAPI + "/app/randomChat/createSession",

  followingAPI: baseAPI + "following/", 
 
  deleteCommentAPI: baseAPI + "/app/comment/deleteComment",
  deleteOrganizationCommentAPI: baseAPI + "/app/organizationComment/deleteComment",

  reportCommentAPI: baseAPI + "/app/comment/complaint", 
  reportOrganizationCommentAPI: baseAPI + "/app/organizationComment/complaint", 
  
  articleCommentListApi: baseAPI + "/app/comment/listArticleComment", 

  pageQueryUserCommentApi: baseAPI + "/app/user/pageQueryUserComment", 

  organizationInnerCommentListApi: baseAPI + "/app/comment/listOrganizationInnerComment", 

  commentReplyApi: baseAPI + "/app/comment/listReply", 

  commentCreateAPI: baseAPI + "/app/comment/createComment",
  OrganizationCommentCreateAPI: baseAPI + "/app/organizationComment/createOrganizationComment",

  organizationCommentListApi: baseAPI + "/app/organizationComment/listOrganizationComment", 

  thumbUpAPI: baseAPI + "/app/article/thumbUpArticle", 
  
  thumbUpArticleCommentAPI: baseAPI + "/app/comment/thumbUpComment", 

  collectArticleAPI: baseAPI + "/app/article/collectArticleOrCancel", 
  
  dingAPI: baseAPI + "/app/article/dingArticle", 
  
  templateAPI: baseAPI + "template/", 

  ossAPI: baseAPI + "oss/", 
  chatAPI: socketAPI + "chat", 
  
  getCredentialAPI: baseAPI + "/app/cos/getCredential", 

  getPostPolicyAPI: baseAPI + "/app/cos/getPostPolicy", 

  banUserAPI:baseAPI + "/app/user/banUser",
  unbanUserAPI:baseAPI + "/app/user/unbanUser",

  blackUserAPI:baseAPI + "/app/user/blackUser",
  unblackUserAPI:baseAPI + "/app/user/unblackUser",

  isBlackedAPI:baseAPI + "/app/user/isBlacked",
  userPageingAPI:baseAPI + "/app/user/pageSearch",

}
