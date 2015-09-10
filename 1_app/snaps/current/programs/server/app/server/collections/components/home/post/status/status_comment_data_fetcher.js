(function(){/**
 * Created by harshit on 01/06/14.
 */
var log = AppLogger.getLogger(AppLogger.loggerName.STATUS_DAO_LOGGER);
var StatusComment = function StatusComment() {
};

StatusComment.prototype = {
    constructor: StatusComment
};

StatusComment.prototype.getPublicComment = function (postId, userId) {
    log.debug("DataFetcher/StatusComment/getComment", {postId: postId});
    return AppCollection.StatusComment.find(
        {
            $and: [
                {"f_postId": postId},
                {f_type: "PUBLIC"}
            ]
        },
        {
            sort: { f_timestamp: -1},
            fields: {f_userId: 0}
        }
    );
};


/**
 * Return cursor of private comments
 *  - if userId is not the post author will return only his/her private comments
 *  - if userId is post author will return all the private comments
 * @param postId
 * @param userId
 * @returns {*|Array}
 */
StatusComment.prototype.getPrivateComment = function (postId, userId) {
    log.debug("DataFetcher/StatusComment/getPrivateComment", {postId: postId});
    var selector = {
        $and: [
            {"f_postId": postId},
            {"f_userId": userId},
            {f_type: "PRIVATE"}
        ]
    };
    if (AppDataFetcher.Status.isAuthor(postId, userId)) {
        selector = {
            $and: [
                {"f_postId": postId},
                {f_type: "PRIVATE"}
            ]
        };
    }
    return AppCollection.StatusComment.find(
        selector,
        {
            sort: { f_timestamp: -1},
            fields: {f_userId: 0}
        }
    );
};

StatusComment.prototype.getComment = function (commentId, isUserIdRequired) {
    var options = {
        fields: {
            f_userId: 0
        }
    };
    if (isUserIdRequired) {
        options = {};
    }
    return AppCollection.StatusComment.findOne(
        {"_id": commentId},
        options
    );
};

/**
 * This is a private function to be used only as a helper
 * since it returns user list.
 * @param postId
 * @returns {Array}
 * @private
 */
StatusComment.prototype._getUserList = function (postId) {
    var selector = {"f_postId": postId};
    var cursor = AppCollection.StatusComment.find(selector,
        {fields: {f_userId: 1}
        });
    var list = [];
    try {
        list = cursor.map(function (item) {
            return item.f_userId;
        });
    } catch (error) {
        log.error("getUserList post_id:" + postId + " error : " + error);
    }

    return list;
};

_.extend(AppDataFetcher, {
    StatusComment: new StatusComment()
});

})();
