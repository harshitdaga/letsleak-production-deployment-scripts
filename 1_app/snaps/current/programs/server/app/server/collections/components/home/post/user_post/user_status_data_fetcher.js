(function(){/**
 * Created by harshit on 01/06/14.
 */
var log = AppLogger.getLogger(AppLogger.loggerName.STATUS_DAO_LOGGER);
var UserStatus = function UserStatus() {
};

UserStatus.prototype = {
    constructor: UserStatus
};

UserStatus.prototype.getCommentList = function (postId, userId) {
    log.debug("DataFetcher/UserStatus/getCommentList", {postId: postId, userId: userId});
    return AppCollection.UserStatusComment.find({
            $and: [
                {"userId": userId},
                {"postId": postId}
            ]
        }
    );
};

UserStatus.prototype._getStatusMetaUserList = function (postId) {
    var selector = {
        "statusLiked": { $in: [postId] }
    };
    var cursor = AppCollection.UserStatusMeta.find(selector,
        {
            fields: {statusLiked: 0}
        });
    var list = [];
    try {
        list = cursor.map(function (item) {
            return item._id;
        });
    } catch (error) {
        log.error("getUserList postId:" + postId + " error : " + error);
    }
    return list;
};

_.extend(AppDataFetcher, {
    UserStatus: new UserStatus()
});

})();
