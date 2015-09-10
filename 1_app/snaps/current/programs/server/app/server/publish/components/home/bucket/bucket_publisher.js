(function(){/*****************************************************************************/
/* BucketPublisher Publish Functions
 /*****************************************************************************/

Meteor.publish('/bucket/user_bucket', function (data) {
    var self = this;
    //console.info("/bucket/user_bucket got a connection");
    var personalBucket = AppDataFetcher.Bucket.getUserCreatedBuckets(data.agent.userId);
    var followedBucket = AppDataFetcher.UserBucket.getFollowedBucket(data.agent.userId);

    //TODO exception occured for user with no bucket.
    return [personalBucket, followedBucket];
});

Meteor.publish("/bucket/editor_selection", function (data) {
    var self = this;
    //console.info("/bucket/editor_selection got a connection");
    return AppDataFetcher.Bucket.getEditorSelection();
});

Meteor.publish("/bucket/bucket_insight", function (request) {
    var self = this;
    //console.info("/bucket/bucket_insight got a connection");
    var bucketId = request.data.bucketIdList[0];
    //return AppDataFetcher.Bucket.getBucketDetails(bucketId, request.agent.userId);
    var c = AppDataFetcher.Bucket.getBucketDetails(bucketId, request.agent.userId);
    //console.log(bucketId + " : " + request.agent.userId + " : " + c.count());
    return c;
});

Meteor.publish("/bucket/bucket_insight/status", function (request) {
    var self = this;
    //console.log("/bucket/bucket_insight/status ... asking for status message");

    var bucketId = request.data.bucketId;
    var postIdList = request.data.postIdList;
    var limit = request.data.limit;
    if (limit > 0) {
        limit *= 5;
    }

    //If limit is less than the number of post in postIdList
    //then send only postId which fall under limit else send
    //the postIdList as it is.
    postIdList = _.first(postIdList, [limit]);
    var statusCursor = AppDataFetcher.Status.getPostCursor(postIdList);
    return statusCursor;

});

})();
