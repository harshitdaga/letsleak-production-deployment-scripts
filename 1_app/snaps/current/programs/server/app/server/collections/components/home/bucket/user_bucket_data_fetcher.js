(function(){/**
 * Created by harshit on 09/06/14.
 */
var log = AppLogger.getLogger(AppLogger.loggerName.STATUS_DAO_LOGGER);
var UserBucket = function UserBucket() {
};

UserBucket.prototype = {
    constructor: UserBucket
};

UserBucket.prototype.getFollowedBucket = function (userId) {
    return AppCollection.UserBucket.find({"f_userId": userId});
};

UserBucket.prototype.getCreatedAndFollowedBucket = function (userId) {
    var followingBuckets = AppCollection.UserBucket.findOne({"f_userId": userId});
    var bucketIdArray = [];
    if (!AppCommon._isEmpty(followingBuckets)) {
        bucketIdArray = followingBuckets.f_bucket_id_list;
    }
    return AppDataFetcher.Bucket.getUserCreatedAndFollowingBucketDetails(bucketIdArray, userId, true);
};

UserBucket.prototype._getFollower = function (bucketId) {
    log.debug("/UserBucket/_getFollower", { bucketId: bucketId});
    var followers = AppCollection.UserBucket.find({
        "f_bucket_id_list": { $in: [bucketId]}
    }).map(function (item) {
            return item.f_userId;
        });
    return followers;
};



_.extend(AppDataFetcher, {
    UserBucket: new UserBucket()
});

})();
