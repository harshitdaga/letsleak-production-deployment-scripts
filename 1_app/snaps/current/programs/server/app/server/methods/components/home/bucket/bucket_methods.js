(function(){/*****************************************************************************/
/* Bucket Methods */
/*****************************************************************************/
var log = AppLogger.getLogger(AppLogger.loggerName.BUCKET_LOGGER);

Meteor.methods(App.wrapMethods([AppInterceptor.ValidSession], [], {
    '/bucket/addUpdateBucket': function (request) {
        log.info("/addUpdateBucket", request);
        var bucketWrapper = new AppWrapper.BucketWrapper();
        return bucketWrapper.addUpdateBucket(request.data, request.agent);
    },

    '/bucket/delete': function (request) {
        log.info("/delete", request);
        var bucketWrapper = new AppWrapper.BucketWrapper();
        return bucketWrapper.deleteBucket(request.data, request.agent);
    },

    '/bucket/addToBucket': function (request) {
        log.info("/pourToBucket", request);
        var bucketWrapper = new AppWrapper.BucketWrapper();
        return bucketWrapper.addToBucket(request.data, request.agent);
    },

    '/bucket/followBucket': function (request) {
        log.info("/followBucket", request);
        var bucketWrapper = new AppWrapper.BucketWrapper();
        return bucketWrapper.followBucket(request.data, request.agent);
    },

    '/bucket/unFollowBucket': function (request) {
        log.info("/unFollowBucket", request);
        var bucketWrapper = new AppWrapper.BucketWrapper();
        return bucketWrapper.unFollowBucket(request.data, request.agent);
    },

    '/bucket/getUserBuckets': function (request) {
        //TODO : used in addToBucket , currently sending bucketlist using method call
        //to note : 1. if user is following a bucket and is public right now when u fetch and later becomes private handling that case
        //can handle in notification thing ... when recieve a notification about bucket update the same in local collection
        // 2. decide should keep a pub/sub here ? keeping in mind want to reduce pub/sub to avoid load.
        log.info("/getUserBuckets", request);
        var bucketWrapper = new AppWrapper.BucketWrapper();
        return bucketWrapper.getUserBuckets(request.data, request.agent);
    },

    '/bucket/getPostListWithLimit' : function(request){
        log.info("/getPostListWithLimit", request);
        var bucketWrapper = new AppWrapper.BucketWrapper();
        return bucketWrapper.getPostListWithLimit(request.data, request.agent.userId);
    },
    '/bucket/removePost' : function(request) {
        log.info("/removePost", request);
        var bucketWrapper = new AppWrapper.BucketWrapper();
        return bucketWrapper.removePost(request.data, request.agent.userId);
    }
}));

})();
