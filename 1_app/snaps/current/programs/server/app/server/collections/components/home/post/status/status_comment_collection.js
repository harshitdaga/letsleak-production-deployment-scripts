(function(){var StatusComment = new Meteor.Collection('c_status_comment');

/*****************************************************************************/
/* Status Comment Collection : Query Methods */
/*****************************************************************************/

/**
 * This function first insert comment into c_status_comment
 * on successful insert c_user_status_comment is updated.
 *
 * @param comment
 * @param userId
 */
StatusComment.insertComment = function (comment, userId) {
    var result = this._insertComment(comment, userId);
    comment.commentId = result;
    if (result != -1) {
        result = AppCollection.UserStatusComment._updateCommentList(comment.postId, comment.commentId, userId);
        if (result == -1) {
            //insert into c_user_status_comment failed revert the insert comment operation also.
            this._deleteComment(comment, userId, false);
        }
    }
    if (result == -1) {
        AppLogger.db_exception_logger.error("/StatusComment/insertComment error for user :" + userId
            + " comment:" + AppCommon._toJSON(comment));
        ThrowError(AppError.DB_ERROR);
    }

    //Notification
    var instantNotif = new AppClass.Notification.Instant();
    var data = {
        userId: userId,
        type: {
            name: instantNotif.type.POST_COMMENT,
            action: "ADD"
        },
        message: {
            postId: comment.postId,
            type: comment.type,
            timestamp: Date.now()
        }
    };
    instantNotif.process(data);
    return comment.commentId;
};

StatusComment._insertComment = function (comment, userId) {
    var byAuthor = AppDataFetcher.Status.isAuthor(comment.postId, userId);
    var timestamp = new Date().getTime();
    var type = "PUBLIC";
    if (!byAuthor) {
        type = _.isEqual("PUBLIC", comment.type.toUpperCase()) ? "PUBLIC" : "PRIVATE";
    }
    var commentData = {
        f_postId: comment.postId,
        f_comment: comment.comment,
        f_byAuthor: byAuthor,
        f_type: type,
        f_timestamp: timestamp,
        f_userId: userId
    };
    return App.extensions._insert(this, commentData, userId);
};

StatusComment._deleteComment = function (comment, userId, verifyAndDelete) {
    var query = {
        _id: comment.commentId
    };
    if (verifyAndDelete) {
        var statusComment = AppDataFetcher.StatusComment.getComment(comment.commentId, true);
        if (AppCommon._isEmpty(statusComment)) {
            AppLogger.db_exception_logger.error("/StatusComment/_deleteComment invalid comment error for user :" + userId
                + " comment:" + AppCommon._toJSON(comment));
            ThrowError(AppError.DB_ERROR);
        }

        var commentAuthor = statusComment.f_userId;
        var isPostAuthor = AppDataFetcher.Status.isPostAuthor(comment.postId, userId);

        if (!(_.isEqual(commentAuthor, userId) || isPostAuthor)) {
            AppLogger.db_exception_logger.error("/StatusComment/_deleteComment invalid operation as user is not commentAuthor, neither postAuthor error for user :" + userId
                + " comment:" + AppCommon._toJSON(comment));
            ThrowError(AppError.DB_ERROR);
        }
    }
    return App.extensions._remove(this, query, userId);
};

/**
 *  This function will first check for whether operation is permissible or not
 * @param comment
 * @param userId
 * @returns {*}
 */
StatusComment.deleteComment = function (comment, userId) {
    var result = this._deleteComment(comment, userId);
    if (result != -1) {
        var userResult = AppCollection.UserStatusComment._deleteComment(comment.postId, comment.commentId, userId);
        if (userResult < 1) {
            //removal of comment from c_user_status_comment failed.
            AppLogger.db_exception_logger.error("/StatusComment/deleteComment error while UserStatusComment._updateCommentList for user :" + userId
                + " comment:" + AppCommon._toJSON(comment));
        }
    }
    if (result == -1) {
        AppLogger.db_exception_logger.error("/StatusComment/deleteComment error for user :" + userId
            + " comment:" + AppCommon._toJSON(comment));
        ThrowError(AppError.DB_ERROR);
    }
    return result;
};

/*****************************************************************************/
/* Status Comment Collection : Permissions */
/*****************************************************************************/
StatusComment.allow({
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

StatusComment.deny({
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
    StatusComment: StatusComment
});

})();
