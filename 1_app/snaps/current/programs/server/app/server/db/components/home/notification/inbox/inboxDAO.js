(function(){var log = AppLogger.getLogger(AppLogger.loggerName.NOTIFICATION_DAO_LOGGER);

function InboxDAO() {}
InboxDAO.prototype.constructor = InboxDAO;

InboxDAO.prototype = {
    markRead: function (mailId, userId) {
        log.info('InboxDAO.read', {mailId: mailId, userId: userId});
        var result = AppCollection.NotificationInbox.markRead(mailId, userId);

        var response = new AppClass.GenericResponse();
        if(result!= 1) {
            response.format(ReturnError(AppError.DB_ERROR));
        } else {
            response.format(result);
        }

        log.debug("InboxDAO.reportAbuse reporting result", {response: response, mailId: mailId, userId: userId});
        return response;
    }
};

_.extend(AppDAO, {
    InboxDAO: new InboxDAO()
});

})();
