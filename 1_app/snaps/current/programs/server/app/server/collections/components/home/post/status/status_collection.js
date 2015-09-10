(function(){var Status = new Meteor.Collection('c_status');

var StatusCollectionPages = new Meteor.Pagination(Status, {
    onReloadPage1: true,
    infinite: true,
    perPage: 20,
    dataMargin: 1,
    sort: {
        f_timestamp: -1
    },
    filters: {
        $and : [
            { "f_flagged" : false },
            {"f_is_deleted" : {$ne : true}} ,
            {
                $or : [
                    {
                        "f_expires" : false
                    },
                    {
                        $and: [
                            { "f_expires": true } ,
                            { "f_expiryTime": { $gte:  new Date().getTime() } }
                        ]
                    }
                ]
            }
        ]
    }
});
/*****************************************************************************/
/* Status Collection : Query Methods */
/*****************************************************************************/
Status.insertStatus = function (statusMessage, userId) {
    //insert status in c_status and on success insert the docId in c_user_status
    var docId = this._insertStatus(statusMessage, userId);
    var result = AppCollection.UserStatus._updateUserStatus(docId, userId);
    if (result == -1) {
        //inserting docId failed revert status insertion
        this._deleteStatus(docId, userId);
        ThrowError(AppError.DB_ERROR);
    }
    return result;
};

Status._insertStatus = function (statusMessage, userId) {
    var self = this;
    var timestamp = new Date().getTime();
    var expires = statusMessage.expiry.isExpiryMessage;
    var expiryTime = _.isNumber(statusMessage.expiry.timeInMilli) ? statusMessage.expiry.timeInMilli : 0;
    expiryTime = timestamp + expiryTime;
    if (expiryTime <= 0 && expires) {
        AppLogger.db_exception_logger.error("/Status/_insertStatus expiryTime validation error for user :" + userId
            + " statusMessage:" + AppCommon._toJSON(statusMessage));
        ThrowError(AppError.DB_ERROR);
    }

    if (!expires) {
        expiryTime = -1;
    }
    var data = {
        f_message: statusMessage.message,
        f_timestamp: new Date().getTime(),
        f_isCommentAllowed: statusMessage.isCommentAllowed,
        f_color: statusMessage.bgColor,
        f_author: userId,
        f_expires: statusMessage.expiry.isExpiryMessage,
        f_expiryTime: expiryTime,
        f_under_review : false,
        f_flagged : false
    };
    var result = App.extensions._insert(self, data, userId);
    if (result == -1) {
        ThrowError(AppError.DB_ERROR);
    }
    return result;
};

Status._deleteStatus = function (docId, userId) {
    var result = App.extensions._delete(this, {"_id": docId}, userId);
    if (result == -1) {
        ThrowError(AppError.DB_ERROR);
    }
    return result;
};

Status.deletePost = function(postId, userId){
    var selector = {
        $and : [
            {_id : postId},
            {f_author : userId},
            {f_is_deleted : {$ne : true}}
        ]
    };
    var modifier = {
        $set : {
            f_is_deleted : true,
            f_deleted_timestamp : Date.now()
        }
    };
    var result = App.extensions._update(this, selector, modifier, false, userId);
    if(result!=1){
        AppLogger.db_exception_logger.error("/Status/deletePost deletePost operation not permitted for postId : "+postId
            + " by user :" + userId +" result:"+result);
        ThrowError(AppError.DB_ERROR);
    }
    return result;
};

Status.updateReviewStatus = function(postId){
    var selector = {"_id" : postId};
    var modifier = {
        $set : {
            f_under_review : true,
            f_flagged : true
        }
    };
    var result = App.extensions._update(this, selector, modifier);
};

/*****************************************************************************/
/* Status Collection : Permissions */
/*****************************************************************************/
Status.allow({
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

Status.deny({
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
    Status: Status
});

})();
