(function(){/*****************************************************************************/
/* ReportAbuse Methods */
/*****************************************************************************/
var log = AppLogger.getLogger(AppLogger.loggerName.REPORT_ABUSE_LOGGER);
Meteor.methods(App.wrapMethods([AppInterceptor.ValidSession], [], {
    '/reportAbuse': function (reqObject) {
        log.info("/reportAbuse", reqObject);
        var reportAbuseWrapper = new AppWrapper.ReportAbuseWrapper();
        return reportAbuseWrapper.reportAbuse(reqObject.data, reqObject.agent);
    },

    '/check' : function(postId){
        var reportAbuseWrapper = new AppWrapper.ReportAbuseWrapper();
        return reportAbuseWrapper._checkAndInformAuthor(postId);
    }
}));

})();
