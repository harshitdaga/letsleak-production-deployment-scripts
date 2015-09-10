(function(){/*****************************************************************************/
/* StatusMessage Publish Functions
 /*****************************************************************************/

//TODO
//1. authentication validation
//2. input validation

/**
 * This publisher sends an NON-REACTIVE post cursor to the client
 */
/*Meteor.publish('/post/status_message', function (request) {
 var self = this;
 var connectionObj = self.connection;
 //console.log("status_message got a connection");
 //return AppCollection.Status.getCursorForItem(request.data.post_id, request.agent.user_id);
 //return AppDataFetcher.Status.getPost(request.data.postId, request.agent.userId, false);
 var post =  AppDataFetcher.Status.getPost(request.data.postId);

 if(!AppCommon._isEmpty(post)) {
 if( !_.isEqual(request.agent.userId, post.f_author) ){
 post.f_author = "";
 }
 self.added("c_status",request.data.postId, post);
 }
 self.ready();

 self.onStop(function () {
 //console.log("connection stopped");
 });
 });*/


Meteor.publish('/status/status_message_extra', function (request) {
    //check(data._id , String);
    var self = this;
    //console.log("status_message_extra got a connection");

    //-- Status Message Meta Data --//
    var postMetaData = AppDataFetcher.StatusMeta.getPostMetaData(request.data.postId);

    //parameter isAuthor decides that request is from author of post and need to show all the comments public && private
    var commentList = AppDataFetcher.StatusComment.getPublicComment(request.data.postId, request.agent.userId);

    // -- User Status Message Meta Data -- //
    var userPostMetaData = AppCollection.UserStatusMeta.find({"_id": request.agent.userId});

    return [postMetaData, userPostMetaData, commentList /*reportAbuseData*/];
});


Meteor.publish('/status/user_comment_list', function (request) {
    var self = this;
    //console.log("user_comment_list got a connection");
    var userCommentList = AppDataFetcher.UserStatus.getCommentList(request.data.postId, request.agent.userId);
    var userPrivateCommentList = AppDataFetcher.StatusComment.getPrivateComment(request.data.postId, request.agent.userId);
    return [userCommentList, userPrivateCommentList];
});

})();
