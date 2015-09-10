(function(){/*****************************************************************************/
/* Inbox Methods */
/*****************************************************************************/
var log = AppLogger.getLogger(AppLogger.loggerName.NOTIFICATION_LOGGER);

Meteor.methods(App.wrapMethods([AppInterceptor.ValidSession], [], {
    '/inbox': function (request) {
        log.info("/inbox", request);
        return AppDataFetcher.Notification.getInbox(request.agent.userId).fetch();
    },
    '/inbox/read' : function(request) {
        log.info("/inbox/read",request);
        return AppDAO.InboxDAO.markRead(request.data.mailId,request.agent.userId);
    }
}));

})();
