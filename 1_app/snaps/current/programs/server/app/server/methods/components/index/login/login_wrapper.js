(function(){var log = AppLogger.getLogger(AppLogger.loggerName.INDEX_LOGGER);
function LoginWrapper() {
}
LoginWrapper.prototype = {
    constructor: LoginWrapper
};

LoginWrapper.prototype.error = {
    "BLANK_USER_NAME_PASSWORD": {
        code: "L_101",
        message: "Username or Password cannot be blank"
    },
    "LOGIN_FAILED": {
        code: "L_103",
        message: "Login failure"
    },
    "INVALID_USERNAME": {
        code: "L_102",
        message: "Username is not present."
    },
    "CURRENT_PASSWORD_INVALID": {
        code: "L_102",
        message: "Current Password Invalid"
    }
};

/**
 * This function is used for login user
 * Client calls passwordExchange first followed by login call
 * This function then call matchPassword to verify the password.
 * If password matches means user is authenticated.
 *
 * Then creates a session key stores the same in login cache and db
 * and returns the login response back to the client
 *
 * @param options - username,M
 * @param connection
 * @returns {AppClass.LoginResponse}
 */
LoginWrapper.prototype.login = function (options, connection) {
    var _self = this;
    log.debug("LoginWrapper.login options : " + AppCommon._toJSON(options));
    var username = options.username;
    var loginResponse = new AppClass.LoginResponse(username);

    //validating the challenge solved by client
    var accountWrapper = new AppWrapper.AccountWrapper();
    if (accountWrapper.validateSecretKey(username,options.password,"PASSWORD")) {
        loginResponse = _self._doLogin(options);
    } else {
        ThrowError(_self.error.LOGIN_FAILED);
    }
    return loginResponse;
};

LoginWrapper.prototype._doLogin = function(options,connection){
    var username = options.username;
    var loginResponse = new AppClass.LoginResponse(username);

    //since password is correct, generate sessionkey
    var stampedLoginToken = Accounts._generateStampedLoginToken();
    var hashToken = Accounts._hashStampedToken(stampedLoginToken);
    var session = {
        key: hashToken.hashedToken,
        createOn: new Date().getTime(),
        expiry: null
    };

    loginResponse.session = session;
    log.info("LoginWrapper.login session established, now caching the same", {username:username,session:session});
    var cacheResult = AppClass.LoginCache.setSessionToCache(username, session);
    if (!cacheResult) {
        log.error("Session Key not able to cache",{username:username , session:session});
        ThrowError(AppError.TECHNICAL_ERROR);
    }
    log.info("LoginWrapper.login success", { response: loginResponse, username: username , connection: connection});

    //logging the attempt into db
    AppCollection.LoginLog.insertLoginSuccess(username, session);
    loginResponse.isSuccess = true;
    return loginResponse;
}

LoginWrapper.prototype.getSessionList = function (agent) {
    log.debug("LoginWrapper.getSessionList agent : " + AppCommon._toJSON(agent));
    return AppClass.LoginCache.getSessionListOfUser(agent.userId, agent.session);
};

LoginWrapper.prototype.logoutActiveSession = function (agent) {
    log.debug("LoginWrapper.logoutActiveSession agent : " + AppCommon._toJSON(agent));
    return AppClass.LoginCache.logoutActiveSession(agent.userId, agent.session);
};

LoginWrapper.prototype.logout = function (agent) {
    log.debug("LoginWrapper.logout agent : " + AppCommon._toJSON(agent));
    return AppClass.LoginCache.removeSessionFromCache(agent.userId, agent.session);
};

_.extend(AppWrapper, {
    LoginWrapper: LoginWrapper
});

})();
