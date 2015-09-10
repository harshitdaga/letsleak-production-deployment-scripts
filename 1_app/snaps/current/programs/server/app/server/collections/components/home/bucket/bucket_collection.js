(function(){var Bucket = new Meteor.Collection('c_bucket');


/*****************************************************************************/
/* Bucket Collection : Query Methods */
/*****************************************************************************/
Bucket.addBucket = function (bucket, userId) {
    var timestamp = new Date().getTime();
    var data = {
        f_userId: userId,
        f_bucket: {
            f_name: bucket.name,
            f_desc: bucket.desc,
            f_access: bucket.access,
            f_isEditable: bucket.isEditable
        },
        f_followCount : 0,
        f_timestamp: timestamp,
        f_lastUpdated: timestamp,
        f_post_id_list : []
    };
    var result = App.extensions._insert(this, data, userId);
    if (result == -1) {
        ThrowError(AppError.DB_ERROR);
    }
    return result;
};

Bucket.updateBucket = function (bucket, userId) {
    var selector = {
        $and: [
            {"_id": bucket.bucketId},
            {"f_userId": userId}
        ]
    };
    var modifier = {
        $set: {
            "f_bucket.f_desc": bucket.getDesc(),
            "f_bucket.f_access": bucket.getAccess(),
            "f_bucket.f_isEditable": bucket.isBucketEditable(),
            f_lastUpdated: new Date().getTime()
        }
    };
    var result = App.extensions._update(this, selector, modifier, false, userId);
    //update should return atleast 1 entry (rather only 1 entry)
    if (result < 1) {
        if (result == 0) {
            AppLogger.db_exception_logger.error("/Bucket/updateBucket update bucket triggered for a bucket which is not present in db by user :" + userId
                + ", bucket:" + AppCommon._toJSON(bucket));
        }
        ThrowError(AppError.DB_ERROR);
    }

    return result;
};

Bucket._updateFollowCount = function(bucketId, action, userId){
    var selector = {"_id": bucketId};

    var modifier = {};
    switch (action) {
        case "FOLLOW" :
            modifier = {
                $inc: {f_followCount: 1}
            };

            break;
        case "UNFOLLOW" :
            modifier = {
                $inc: {f_followCount: -1}
            };

            break;
    }
    var result = App.extensions._update(this, selector, modifier, false, userId);
    return result;
};

Bucket.deleteBucket = function (bucketId, userId) {
    var selector = {
        $and: [
            {"_id": bucketId},
            {"f_userId": userId}
        ]
    };
    var result = App.extensions._remove(this, selector, userId);
    if (result < 1) {
        if (result == 0) {
            AppLogger.db_exception_logger.error("/Bucket/deleteBucket update bucket triggered for a bucket which is not present or owned by user :" + userId
                + ", bucketId:" + bucketId);
        }
        ThrowError(AppError.DB_ERROR);
    }
    //TODO remove the bucket from followers list also
    return result;
};

Bucket.addData = function (bucketDataRequest, userId) {
    var selector = {
        $and: [
            { "_id": { $in: bucketDataRequest.bucketIdList } },
            { "f_post_id_list": { $nin: [bucketDataRequest.getItemId()] }}
        ]
    };
    var modifier = {
        $push: {f_post_id_list: bucketDataRequest.getItemId()}
    };

    var result = App.extensions._update(this, selector, modifier, false, userId, true);
    if (result < 0) {
        /*if(result == 0) {
         AppLogger.db_exception_logger.error("/Bucket/addData add to bucket caused an exception by user :" + userId
         + ", bucketDataRequest:"+ AppCommon._toJSON(bucketDataRequest) );
         }*/
        ThrowError(AppError.DB_ERROR);
    }


    //Notification
    var instantNotif = new AppClass.Notification.Instant();
    var data = {
        userId: userId,
        type: {
            name: instantNotif.type.POST_ADDED_TO_BUCKET
        },
        message: {
            postId: bucketDataRequest.postId,
            bucketList: bucketDataRequest.bucketIdList,
            timestamp: Date.now()
        }
    };
    instantNotif.process(data);

    return result;
};

Bucket.removePost = function( bucketData, userId) {
    var selector = {
        $and : [
            {"f_userId" : userId},
            {"_id" : bucketData.bucketId},
            {"f_post_id_list" : {$in : [bucketData.postId]}}
        ]
    };

    var modifier = {
        $pull : {
            "f_post_id_list" : bucketData.postId
        }
    };

    var result = App.extensions._update(this, selector, modifier, false, userId);
    if(result!=1){
         AppLogger.db_exception_logger.error("/Bucket/removePost removing post from bucket return should have been 1  user :" + userId
         + ", bucketData:"+ AppCommon._toJSON(bucketData) + " result:"+result);
        ThrowError(AppError.DB_ERROR);
    }
    return result;
}

/*****************************************************************************/
/* Bucket Collection : Permissions */
/*****************************************************************************/
Bucket.allow({
    insert: function (userId, doc) {
        return false;
    },

    update: function (userId, doc, fieldNames, modifier) {
        return false;
    },

    remove: function (userId, doc) {
        return false;
    }
});

Bucket.deny({
    insert: function (userId, doc) {
        return false;
    },

    update: function (userId, doc, fieldNames, modifier) {
        return false;
    },

    remove: function (userId, doc) {
        return false;
    }
});

_.extend(AppCollection, {
    Bucket: Bucket
});

})();
