(function(){var log = AppLogger.getLogger(AppLogger.loggerName.REPORT_ABUSE_LOGGER);

function ReportAbuseWrapper() {
}
ReportAbuseWrapper.prototype = {
    constructor: ReportAbuseWrapper
};

ReportAbuseWrapper.prototype.error = {
    "UNDEFINED_ACTION": {
        code: "RA_101",
        message: "Undefined Action"
    },
    "BLANK_REASON": {
        code: "RA_102",
        message: "Reason cannot be blank"
    },
    "BLANK_TYPE": {
        code: "RA_103",
        message: "Blank post type"
    },
    "INVALID_REASON": {
        code: "RA_104",
        message: "Invalid reason."
    }

};

ReportAbuseWrapper.prototype.reportAbuse = function (reportAbuse, agent) {
    log.info("ReportAbuseWrapper.deleteComment", {reportAbuse: reportAbuse, agent: agent});
    var _self = this;
    var action = reportAbuse.action; //ADD / DELETE

    check(reportAbuse.postId, String);
    if (!reportAbuse) {
        ThrowError(AppError.TECHNICAL_ERROR);
    }
    if (AppCommon._isEmpty(action) || !( (_.isEqual(action.toUpperCase(), "DELETE") || (_.isEqual(action.toUpperCase(), "ADD")) ) )) {
        ThrowError(_self.error.UNDEFINED_ACTION);
    }
    if (_.isEqual(action.toUpperCase(), "ADD") && AppCommon._isEmpty(reportAbuse.reasonCode)) {
        ThrowError(_self.error.BLANK_REASON);
    }
    if (AppCommon._isEmpty(reportAbuse.postType)) {
        ThrowError(_self.error.BLANK_TYPE);
    }

    if (_.isEqual(action.toUpperCase(), "ADD") && _.isUndefined(AppClass.ReportAbuse.getMessage(reportAbuse.reasonCode))) {
        ThrowError(_self.error.INVALID_REASON);
    }

    log.debug("ReportAbuseWrapper.reportAbuse reporting");
    var result = AppDAO.ReportAbuseDAO.reportAbuse(reportAbuse, agent);
    log.info("ReportAbuseWrapper.deleteComment", {reportAbuse: reportAbuse, agent: agent.user_id, result: result});

    return result;
};

_.extend(AppWrapper, {
    ReportAbuseWrapper: ReportAbuseWrapper
});

})();
