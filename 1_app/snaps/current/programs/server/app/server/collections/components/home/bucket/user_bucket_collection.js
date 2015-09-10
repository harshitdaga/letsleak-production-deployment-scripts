(function(){var UserBucket = new Meteor.Collection('c_user_bucket');

/*
 * Add query methods like this:
 *  UserBucket.findPublic = function () {
 *    return UserBucket.find({is_public: true});
 *  }
 */
/*****************************************************************************/
/* UserBucket Collection : Query Methods */
/*****************************************************************************/
UserBucket.followBucket = function (bucketId, userId) {
    //TODO get this bucket remove if delete by user
    return this._updateBucket(bucketId, "FOLLOW", userId);
};

UserBucket.unFollowBucket = function (bucketId, userId) {
    return this._updateBucket(bucketId, "UNFOLLOW", userId);
};

UserBucket._updateBucket = function (bucketId, action, userId) {
    var selector = {
        f_userId: userId
    };
    var modifier = {};

    switch (action) {
        case 'FOLLOW' :
            modifier = {  $addToSet: {"f_bucket_id_list": bucketId} };
            break;
        case "UNFOLLOW" :
            modifier = {
                $pull: {"f_bucket_id_list": bucketId}
            };
            break;
    }
    var result = App.extensions._update(this, selector, modifier, true, userId);
    if (result < 1) {
        ThrowError(AppError.DB_ERROR);
    } else {
        var bucketResult = AppCollection.Bucket._updateFollowCount(bucketId, action, userId);
        //update should return 1 entry rather only 1 entry
        if(bucketResult < 1) {
            if (result == 0) {
                AppLogger.db_exception_logger.error("/Bucket/updateBucket update bucket triggered for a bucket which is not present in db by user :" + userId
                    + ", bucket:" + AppCommon._toJSON(bucketId));
            }
        }
    }

    //Notification
    if(_.isEqual("FOLLOW" ,action )){
        var instantNotif = new AppClass.Notification.Instant();
        var data = {
            userId: userId,
            type: {
                name: instantNotif.type.BUCKET_FOLLOWED,
                action: "FOLLOW"
            },
            message: {
                bucketId : bucketId,
                timestamp: Date.now()
            }
        };
        instantNotif.process(data);
    }

    return result;
};


UserBucket.getUserFollowingBucket = function (userId) {
    return UserBucket.find({
        "userId": userId
    });
};


UserBucket.getUserBucketsArray = function (userId) {
    var list_cursor = UserBucket.getUserBuckets(userId);
    var result_array = list_cursor.map(function (item) {
        return item._id;
    });

    return result_array;
};


/*****************************************************************************/
/* UserBucket Collection : Permissions */
/*****************************************************************************/
UserBucket.allow({
    insert: function (userId, doc) {
        return true;
    },

    update: function (userId, doc, fieldNames, modifier) {
        return true;
    },

    remove: function (userId, doc) {
        return true;
    }
});

UserBucket.deny({
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
    UserBucket: UserBucket
});

})();
