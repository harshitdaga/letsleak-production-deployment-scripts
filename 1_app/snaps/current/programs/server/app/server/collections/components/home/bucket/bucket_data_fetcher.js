(function(){/**
 * Created by harshit on 09/06/14.
 */
var log = AppLogger.getLogger(AppLogger.loggerName.BUCKET_DAO_LOGGER);
var Bucket = function Bucket() {
};

Bucket.prototype.prototype = {
    constructor: Bucket
};

Bucket.prototype.getEditorSelection = function () {
    log.debug("/Bucket/getEditorSelection");
    var selectionLimit = 20;
    var editorSelection = AppCollection.Bucket.find({
        "f_bucket.f_access": "PUBLIC"
    }, {
        sort: { f_timestamp: -1},
        limit: selectionLimit,
        fields: { f_userId: 0}
    });

//    if(editorSelection.count() < 1) {
//        return null;
//    }
    return editorSelection;
};

Bucket.prototype.getUserCreatedBuckets = function (userId) {
    log.debug("/Bucket/getUserCreatedBuckets" , {userId:userId});
    return AppCollection.Bucket.find({"f_userId": userId});
};

Bucket.prototype.getUserCreatedAndFollowingBucketDetails = function (followBucketIdList, userId, isUserIdSentBackInResult) {
    var options = {};
    if (!isUserIdSentBackInResult) {
        options = {
            f_userId: 0
        }
    }
    return AppCollection.Bucket.find(
        {
            $or: [
                {
                    $and: [
                        {"_id": { $in: followBucketIdList} },
                        {"f_bucket.f_access": "PUBLIC"}
                    ]
                },
                {"f_userId": userId }
            ]
        },
        {
            fields: options
        }
    );
};

Bucket.prototype.getBucketDetails = function (bucketId, userId) {
    return AppCollection.Bucket.find(
        {
            $and: [
                {"_id": bucketId},
                {
                    $or: [
                        {"f_userId": userId},
                        {"f_bucket.f_access": "PUBLIC"}
                    ]
                }
            ]
        },
        {
            fields: {
                f_userId: 0
            }
        }
    )
};

Bucket.prototype._getBucket = function (bucketId) {
    return AppCollection.Bucket.findOne({
        "_id": bucketId
    });
};
_.extend(AppDataFetcher, {
    Bucket: new Bucket()
});

})();
