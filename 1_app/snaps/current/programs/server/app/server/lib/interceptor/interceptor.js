(function(){var log = AppLogger.interceptor_logger;

//AppInterceptor = {};
function ValidSession(request) {
    if(App.extensions._isProduction()){
        log.info("ValidSession", {agent: request.agent});
        if(App.extensions._isProduction()){
            AppClass.LoginCache.isValidSession(request.agent.userId,request.agent.session);
        }
        request.agent.userId = request.agent.userId.toLowerCase();
        log.info("is ValidSession", {agent: request.agent});
    }
}

_.extend(AppInterceptor, {
    ValidSession: ValidSession
});

})();
