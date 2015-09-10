(function(){/*****************************************************************************/
/* Login Methods */
/*****************************************************************************/

var log = AppLogger.getLogger(AppLogger.loggerName.INDEX_LOGGER);

Meteor.methods({
    '/login': function (request) {
        log.info("/login", {userId:request.username,connection:this.connection});
        var loginWrapper = new AppWrapper.LoginWrapper();
        return loginWrapper.login(request, this.connection);
    }
});

Meteor.methods(App.wrapMethods([AppInterceptor.ValidSession], [], {
    '/login/getSessionList': function (request) {
        log.info("/getSessionList", request);
        var loginWrapper = new AppWrapper.LoginWrapper();
        return loginWrapper.getSessionList(request.agent);
    },
    '/logoutActiveSession': function (request) {
        log.info("/getSessionList", request);
        var loginWrapper = new AppWrapper.LoginWrapper();
        return loginWrapper.logoutActiveSession(request.agent);
    },
    '/logout': function (request) {
        log.info("/logout", request);
        var loginWrapper = new AppWrapper.LoginWrapper();
        return loginWrapper.logout(request.agent);
    }
}));

})();
