(function(){/**
 * Created by harshit on 01/06/14.
 */
var log = AppLogger.getLogger(AppLogger.loggerName.STATUS_DAO_LOGGER);
var Status = function Status() {
};

Status.prototype = {
    constructor: Status
};

Status.prototype.getPost = function (postId) {
    log.debug("DataFetcher/Status/getPost", {postId: postId});
    return AppCollection.Status.findOne(
        {"_id": postId}
    );
};

Status.prototype.isCommentAllowed = function (postId) {
    log.debug("DataFetcher/Status/getPost", {postId: postId});
    var message = this.getPost(postId);
    if (!AppCommon._isEmpty(message)) {
        return message.f_isCommentAllowed ? true : false;
    }
    return false;
};

Status.prototype.getAuthor = function (postId) {
    var message = this.getPost(postId);
    if (!AppCommon._isEmpty(message)) {
        return message.f_author.toLowerCase();
    }
    return undefined;
};

Status.prototype.isAuthor = function (postId, userId) {
    var postAuthor = this.getAuthor(postId);
    return _.isEqual(postAuthor, userId.toLowerCase());
};


/**
 * Used by Bucket publisher
 * @param postIdArray
 * @returns cursor
 */
Status.prototype.getPostCursor = function (postIdArray) {
    return AppCollection.Status.find(
        {
            "_id": {$in: postIdArray}
        },
        {
            fields: {f_author: 0}
        }
    );
};

_.extend(AppDataFetcher, {
    Status: new Status()
});

})();
