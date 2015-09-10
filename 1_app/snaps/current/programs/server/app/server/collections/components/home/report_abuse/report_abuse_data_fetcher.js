(function(){/**
 * Created by harshit on 01/06/14.
 */
var log = AppLogger.getLogger(AppLogger.loggerName.REPORT_ABUSE_DAO_LOGGER);
var ReportAbuse = function ReportAbuse() {
};

ReportAbuse.prototype = {
    constructor: ReportAbuse
};

ReportAbuse.prototype.getUserReport = function (postId, userId) {
    log.debug("DataFetcher/ReportAbuse/getUserReport", {postId: postId});
    return AppCollection.UserReportAbuse.find({
        "_id": postId + "#" + userId
    });
};

ReportAbuse.prototype._getPostReport = function (postId) {
    log.debug("DataFetcher/ReportAbuse/getPostReport", {postId: postId});
    return AppCollection.ReportAbuse.findOne(
        {"_id": postId},
        {fields: { f_reported_by_list: 0}}
    );
};

_.extend(AppDataFetcher, {
    ReportAbuse: new ReportAbuse()
});

})();
