(function(){/*****************************************************************************/
/* Account Methods */
/*****************************************************************************/

var log = AppLogger.getLogger(AppLogger.loggerName.ACCOUNT_LOGGER);

Meteor.methods(App.wrapMethods([AppInterceptor.ValidSession], [], {
    '/account/changePin': function (request) {
        var self = this;
        log.info("/account/changePin", request);
        var accountWrapper = new AppWrapper.AccountWrapper();
        return accountWrapper.changePin(request, self.connection, "password");
    },

    '/account/changePassword': function (request) {
        var self = this;
        log.info("/account/changePin", request);
        var accountWrapper = new AppWrapper.AccountWrapper();
        return accountWrapper.changePassword(request, "pin");
    },
}));

})();
