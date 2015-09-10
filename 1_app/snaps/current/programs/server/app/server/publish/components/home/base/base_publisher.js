(function(){/*****************************************************************************/
/* BasePublisher Publish Functions
 These are required by every page user navigates to once user is logged in
 */
/*****************************************************************************/

//TODO
//1. authentication validation
//2. input validation
/*
 Meteor.publish('personal', function (data) {
 var self = this;
 //var connectionObj = self.connection;
 //console.log("personal got a connection" + toJSON(connectionObj))
 console.log("personal got a connection");

 var userStatus = AppCollection.UserStatus.find({"user_id" : data.user_id});

 var userStatusMeta =  AppCollection.UserStatusMeta.find({ "_id" : data.user_id });

 //TODO Can move to only comments section to avoid too many basic subscriptions
 var userStatusComment = AppCollection.UserStatusComment.find({"_id" : data.user_id});

 var userBucket = AppCollection.Bucket.find({"user_id" : data.user_id});
 return [userStatusMeta,userStatusComment,userBucket,userStatus];
 });
 */



Meteor.publish('userBucket', function (data) {
    var self = this;
    //console.log("userBucket got a connection");
    var userBucket = AppCollection.Bucket.find({"user_id": data.userId});
    return userBucket;
});

})();
