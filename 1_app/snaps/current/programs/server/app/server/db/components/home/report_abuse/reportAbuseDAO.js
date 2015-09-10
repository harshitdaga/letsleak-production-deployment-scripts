(function(){var log = AppLogger.getLogger(AppLogger.loggerName.REPORT_ABUSE_DAO_LOGGER);

//TODO IMPORTANT TO LOG ALL REVERTING ACTIONS or FIND ALTERNATIVE WAY TO HANDLE SUCH CASE
function ReportAbuseDAO() {
}
ReportAbuseDAO.prototype.constructor = ReportAbuseDAO;

ReportAbuseDAO.prototype = {
    reportAbuse: function (reportAbuse, agent) {
        log.info('ReportAbuseDAO.reportAbuse', {reportAbuse: reportAbuse, agent: agent});
        var result = null;
        if (reportAbuse.action == "ADD") {
            result = AppCollection.ReportAbuse.insertAbuse(reportAbuse, agent.userId);
        } else if (reportAbuse.action == "DELETE") {
            result = AppCollection.ReportAbuse.deleteAbuse(reportAbuse, agent.userId);
        }

        log.debug("ReportAbuseDAO.reportAbuse reporting result", {result: result, reportAbuse: reportAbuse, agent: agent});
        var response = new AppClass.GenericResponse();
        response.format(result);
        return response;
    }
};

_.extend(AppDAO, {
    ReportAbuseDAO: new ReportAbuseDAO()
});

})();
