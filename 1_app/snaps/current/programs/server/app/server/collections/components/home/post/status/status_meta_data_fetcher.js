(function(){/**
 * Created by harshit on 01/06/14.
 */
var log = AppLogger.getLogger(AppLogger.loggerName.STATUS_DAO_LOGGER);
var StatusMeta = function StatusMeta() {
};

StatusMeta.prototype = {
    constructor: StatusMeta
};

StatusMeta.prototype.getPostMetaData = function (postId) {
    log.debug("DataFetcher/StatusMeta/getPostMetaData", {postId: postId});
    return AppCollection.StatusMeta.find(
        {"_id": postId},
        {fields: {userId: 0}}
    );
};

StatusMeta.prototype.getPostArrayMetaData = function (postIdList) {
    log.debug("DataFetcher/StatusMeta/getPostArrayMetaData", {postIdList: postIdList});
    return AppCollection.StatusMeta.find(
        {"_id": {$in: postIdList}},
        {fields: {userId: 0}}
    );
};


StatusMeta.prototype.getPostLikeCount = function (postId) {
    log.debug("DataFetcher/StatusMeta/getPostLikeCount", {postId: postId});
    return this.getPostMeta(postId).likeCount;
};

StatusMeta.prototype.getPostMeta = function (postId) {
    log.debug("DataFetcher/StatusMeta/getPostMeta", {postId: postId});
    return AppCollection.StatusMeta.findOne(
        {"_id": postId},
        {fields: {userId: 0}}
    );
};


_.extend(AppDataFetcher, {
    StatusMeta: new StatusMeta()
});

})();
