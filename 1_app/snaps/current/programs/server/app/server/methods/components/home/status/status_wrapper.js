(function(){var log = AppLogger.getLogger(AppLogger.loggerName.STATUS_LOGGER);

function StatusWrapper() {
}
StatusWrapper.prototype = {
    constructor: StatusWrapper
};

StatusWrapper.prototype.error = {
    //Server error codes
    "INVALID_OBJECT": {
        code: "PS_1001",
        message: "Invalid request object."
    },
    "INVALID_CATEGORY": {
        code: "PS_1002",
        message: "Category selected is not provided as an option."
    },
    "INVALID_POST_ID": {
        code: "PS_1003",
        message: "Post with these details does not exist."
    },
    "UNDER_REVIEW": {
        code: "PS_1004",
        message: "Post is under review"
    },
    "POST_NO_LONGER_EXIST": {
        code: "PS_1005",
        message: "Post with these details no longer exist."
    },
    "SUSPECIOUS": {
        code: "PS_1006",
        message: "Post or comment seems to be suspicious, moved for manual review."
    },
    //Common UI & Server codes
    "BLANK_MESSAGE": {
        code: "PS_101",
        message: "Message cannot be blank"
    },
    "INVALID_MESSAGE_SIZE": {
        code: "PS_102",
        message: "Message size should be minimum of 10 words and maximum of 300 words."
    },
    "BLANK_CATEGORY": {
        code: "PS_103",
        message: "Atleast one category should be selected."
    },
    "EXPIRY_TIME_ZERO": {
        code: "PS_104",
        message: "Expiry time for a message cannot be '0'."
    },
    "INVALID_ACTION": {
        code: "PS_105",
        message: "Post action is not a valid one."
    },
    "UNDEFINED_ACTION": {
        code: "PS_106",
        message: "Action is not defined"
    },

    "BLANK_COMMENT": {
        code: "C_101",
        message: "Comment cannot be blank."
    },
    "COMMENTS_NOT_ALLOWED": {
        code: "C_102",
        message: "Post does not allow posting of comments."
    },
    "INVALID_COMMENT_SIZE": {
        code: "C_103",
        message: "Comment size should be maximum of 150 words."
    }
};

StatusWrapper.prototype.getCategory = function () {
    var category = [
        "personal",
        "media"
    ];
    var categoryMap = [];
    categoryMap["personal"] = 1;
    categoryMap["media"] = 2;

    return {
        category: category,
        categoryMap: categoryMap
    };
};

/**
 * This functions takes in statusmessage, performs validations
 * and then pass it to StatusDAO.insertStatus to insert the post
 * into collection
 *
 * @param statusMessage
 * @param agent
 * @returns {AppClass.GenericResponse|*}
 */
StatusWrapper.prototype.postStatus = function (statusMessage, agent) {
    var _self = this;
    log.debug("StatusWrapper.postStatus", {statusMessage: statusMessage, agent: agent});

    //validation at server side
    var isValidStatus = function (statusMessage) {
        log.debug("StatusWrapper.isValidStatus", statusMessage);
        if (!statusMessage) {
            ThrowError(_self.error.INVALID_OBJECT);
        }

        var message = statusMessage.message;

        if (AppCommon._isEmpty(message)) {
            ThrowError(_self.error.BLANK_MESSAGE);
        }

        var charCount = message.trim().length;
        if (charCount < 10 || charCount > 300) {
            ThrowError(_self.error.INVALID_MESSAGE_SIZE);
        }

        if (statusMessage.expiry.isExpiryMessage && statusMessage.expiry.timeInMilli <= 0) {
            ThrowError(_self.error.EXPIRY_TIME_ZERO);
        }

        if(!App.Filter.isValidStatement(message)){
            if(App.Filter.underReview(statusMessage,App.Filter.reviewType.STATUS_MESSAGE, agent.userId) == -1 ) {
                ThrowError(AppError.DB_ERROR);
            }
            ThrowError(_self.error.SUSPECIOUS);
        }

        log.debug("StatusWrapper.isValidStatus true", this.statusMessage);
        return true;
    };

    if (isValidStatus(statusMessage)) {
        log.debug("StatusWrapper.postStatus is valid status");
        return AppDAO.StatusDAO.insertStatus(statusMessage, agent);
    }
};

/**
 * This function is used to update the meta data related to post
 * which for now include : likes / unlike
 *
 * @param statusMeta
 * @param agent
 * @returns {*}
 */
StatusWrapper.prototype.updateMeta = function (statusMeta, agent) {
    log.info("StatusWrapper.updateMeta", {statusMeta: statusMeta, agent: agent});
    var _self = this;
    var _id = statusMeta._id;
    var action = statusMeta.action;

    //server side validation
    var isValidUpdate = function () {
        check(_id, String);
        if (!AppCommon._isEmpty(action)) {
            action = action.toUpperCase();
            if (!(_.isEqual(action, "ADD") || _.isEqual(action, "DELETE") )) {
                ThrowError(_self.error.INVALID_ACTION);
            }
        } else {
            ThrowError(_self.error.UNDEFINED_ACTION);
        }
        return true;
    };

    if (isValidUpdate()) {
        log.debug("StatusWrapper.updateMeta is valid update");
        var result = AppDAO.StatusDAO.updateMeta(statusMeta, agent);
        _.extend(result, {
            action: statusMeta.action,
            postId: statusMeta._id
        });
        log.info("StatusWrapper.updateMeta", {statusMeta: statusMeta, agent: agent.userId, result: result});
        return result;
    }
};

StatusWrapper.prototype.postComment = function (comment, agent) {
    log.info("StatusWrapper.postComment", {comment: comment, agent: agent});
    var _self = this;
    var message = comment.comment;
    var isValidComment = function () {
        if (AppCommon._isEmpty(comment.postId)) {
            ThrowError(_self.error.INVALID_OBJECT);
        }
        if (AppCommon._isEmpty(message)) {
            ThrowError(_self.error.BLANK_COMMENT);
        }
        if (message.length > 150) {
            ThrowError(_self.error.INVALID_COMMENT_SIZE);
        }
        if (!AppDataFetcher.Status.isCommentAllowed(comment.postId)) {
            ThrowError(_self.error.COMMENTS_NOT_ALLOWED);
        }
        if(!App.Filter.isValidStatement(message)){
            if(App.Filter.underReview(comment,App.Filter.reviewType.STATUS_COMMENT, agent.userId) == -1 ) {
                ThrowError(AppError.DB_ERROR);
            }
            ThrowError(_self.error.SUSPECIOUS);
        }

        return true;
    };

    if (isValidComment()) {
        log.debug("StatusWrapper.postComment is valid insert comment request");
        var result = AppDAO.StatusDAO.insertComment(comment, agent);
        log.info("StatusWrapper.postComment", {comment: comment, agent: agent.userId, result: result});
        return result;
    }
};

StatusWrapper.prototype.deleteComment = function (comment, agent) {
    log.info("StatusWrapper.deleteComment", {comment: comment, agent: agent});
    var _self = this;
    var postId = comment.postId;
    var commentId = comment.commentId;

    var isValidDelete = function () {
        if (AppCommon._isEmpty(postId) || AppCommon._isEmpty(commentId) || !_.isString(postId) || !_.isString(commentId)) {
            ThrowError(AppError.TECHNICAL_ERROR);
        }
        return true;
    };

    if (isValidDelete()) {
        log.debug("StatusWrapper.deleteComment is valid delete");
        var result = AppDAO.StatusDAO.deleteComment(comment, agent);
        log.info("StatusWrapper.deleteComment", {comment: comment, agent: agent.userId, result: result});
        return result;
    }
};


StatusWrapper.prototype.deletePost = function (data, agent) {
    log.info("StatusWrapper.deletePost", {data: data, agent: agent});
    var _self = this;
    var postId = data.postId;
    var userId = agent.userId;
    var isValidDelete = function () {
        if (AppCommon._isEmpty(postId) || !_.isString(postId)) {
            ThrowError(AppError.TECHNICAL_ERROR);
        }
        return true;
    };

    if (isValidDelete()) {
        log.debug("StatusWrapper.deletePost is valid delete");
        var result = AppDAO.StatusDAO.deletePost(postId, agent);
        log.info("StatusWrapper.deletePost", {postId: postId, agent: agent.userId, result: result});
        return result;
    }
};

/**
 * This function fetches the information related to status
 * checks if the user who asked is the author of post or not,
 *      If not then makes f_author to empty
 *
 * @param postId
 * @param agent
 * @returns {AppClass.GenericResponse}
 */
StatusWrapper.prototype.getStatusMessage = function (postId, agent) {
    log.info("/StatusWrapper/getStatusMessage", {postId: postId, agent: agent});
    var self = this;
    var post = AppDataFetcher.Status.getPost(postId);
    var response = new AppClass.GenericResponse();
    if (AppCommon._isEmpty(post) || post.f_is_deleted == true) {
        ThrowError(self.error.INVALID_POST_ID);
    }
    if (post.f_flagged === true) {
        ThrowError(self.error.UNDER_REVIEW);
    }
    if (post.f_expires == true && post.f_expiryTime <= Date.now()) {
        ThrowError(self.error.POST_NO_LONGER_EXIST);
    }
    if (!_.isEqual(agent.userId, post.f_author)) {
        post.f_author = "";
    }

    //adding report abuse data of user for the post
    post.reportAbuseData = "";
    var reportAbuseData = AppDataFetcher.ReportAbuse.getUserReport(postId, agent.userId);
    if (!AppCommon._isEmpty(reportAbuseData)) {
        post.reportAbuseData = reportAbuseData.fetch()[0];
    }
    response.format(post);
    return response;
};
_.extend(AppWrapper, {
    StatusWrapper: StatusWrapper
});

})();
