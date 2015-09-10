(function(){/**
 * Created by harshit
 */
var log = AppLogger.getLogger(AppLogger.loggerName.REPORT_PROBLEM_DAO_LOGGER);

function ReportDAO() {
}
ReportDAO.prototype.constructor = ReportDAO;

ReportDAO.prototype = {
    insertReport: function (data) {
        log.debug("insertReport", data);
        var result = AppCollection.Report.insertReport(data);
        var response = new AppClass.GenericResponse();
        response.format(result);
        log.debug("insertReport c_report response", {response: response, data:data});
        return response;
    }
};

_.extend(AppDAO, {
    ReportDAO: new ReportDAO()
});


})();
