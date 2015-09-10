(function(){/*****************************************************************************/
/* Invitation Methods */
/*****************************************************************************/
var log = AppLogger.getLogger(AppLogger.loggerName.STATS);

Meteor.methods({
    '/stats/account/getInvitedAccounts': function (request) {
        log.debug("/account/getInvitedAccounts" , {request:request});
        var limit = request.data.limit * AppLimit.STATS_ACCOUNT;
        var result = AppCollection.AccountInvitation.find(
                    {"f_inviteSent" : true },
            {
                limit: limit,
                sort : {
                    f_timestamp : -1
                }
            }
        );
        return result.fetch();
    }
});

})();
