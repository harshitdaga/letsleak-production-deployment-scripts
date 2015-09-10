(function(){/**
 * Created by harshit on 20/04/14.
 */
var log = AppLogger.getLogger(AppLogger.loggerName.BUCKET_DAO_LOGGER);

function BucketDAO() {
}
BucketDAO.prototype.constructor = BucketDAO;

BucketDAO.prototype = {
    addBucket: function (bucket, agent) {
        log.debug("addBucket", {bucket: bucket, agent: agent});
        var result = AppCollection.Bucket.addBucket(bucket, agent.userId);
        var response = new AppClass.GenericResponse();
        response.format(result);
        log.debug("addBucket c_bucket response", {response: response, bucket: bucket, agent: agent});
        return response;
    },

    updateBucket: function (bucket, agent) {
        log.debug("updateBucket", {bucket: bucket, agent: agent});
        var result = AppCollection.Bucket.updateBucket(bucket, agent.userId);
        var response = new AppClass.GenericResponse();
        response.format(result);
        log.debug("updateBucket c_bucket response", {response: response, bucket: bucket, agent: agent});
        return response;
    },

    deleteBucket: function (bucketId, agent) {
        log.debug("deleteBucket", {bucketId: bucketId, agent: agent});
        var result = AppCollection.Bucket.deleteBucket(bucketId, agent.userId);
        var response = new AppClass.GenericResponse();
        response.format(result);
        log.debug("deleteBucket c_bucket response", {response: response, bucketId: bucketId, agent: agent});
        return response;
    },

    addToBucket: function (bucketDataRequest, agent) {
        log.debug("addToBucket", {bucketDataRequest: bucketDataRequest, agent: agent});
        var result = AppCollection.Bucket.addData(bucketDataRequest, agent.userId);
        var response = new AppClass.GenericResponse();
        response.format(result);
        log.debug("addToBucket c_bucket_data response", {response: response, bucketDataRequest: bucketDataRequest, agent: agent});
        return response;
    },

    followBucket: function (bucketId, agent) {
        log.debug("followBucket", {bucketId: bucketId, agent: agent});
        var result = AppCollection.UserBucket.followBucket(bucketId, agent.userId);
        var response = new AppClass.GenericResponse();
        response.format(result);
        log.debug("followBucket c_user_bucket response", {response: response, bucketId: bucketId, agent: agent});
        return response;
    },

    unFollowBucket: function (bucketId, agent) {
        log.debug("unFollowBucket", {bucketId: bucketId, agent: agent});
        var result = AppCollection.UserBucket.unFollowBucket(bucketId, agent.userId);
        var response = new AppClass.GenericResponse();
        response.format(result);
        log.debug("unFollowBucket c_user_bucket response", {response: response, bucketId: bucketId, agent: agent});
        return response;
    },

    removePost : function(data, userId) {
        log.debug("removePost", {data: data, userId: userId});
        var result = AppCollection.Bucket.removePost(data, userId);
        var response = new AppClass.GenericResponse();
        response.format(result);
        log.debug("removePost c_bucket response", {response: response, data: data, userId: userId});
        return response;
    }

};

_.extend(AppDAO, {
    BucketDAO: new BucketDAO()
});


})();
