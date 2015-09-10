(function(){var log = AppLogger.getLogger(AppLogger.loggerName.FORGOT_PASSWORD_LOGGER);
function ForgotPasswordWrapper() {
}
ForgotPasswordWrapper.prototype = {
    constructor: ForgotPasswordWrapper
};

ForgotPasswordWrapper.prototype.error = {
    "INCORRECT_PIN" : {
        code: "FP_1001",
        message : "Pin entered is incorrect."
    }
};

ForgotPasswordWrapper.prototype.resetForgotPassword = function (options) {
    var _self = this;
    log.debug("ForgotPasswordWrapper.resetForgotPassword options : " + AppCommon._toJSON(options));
    var username = options.username;

    var accountWrapper = new AppWrapper.AccountWrapper();
    if(accountWrapper.validateSecretKey(username,options.securityPin,"PIN")) {
        var data = {
            username: username,
            password: options.password
        };
        accountWrapper.validatePassword(data.password);
        log.debug("ForgotPasswordWrapper.resetForgotPassword is valid reset password request");
        data.password =  accountWrapper.getSecretKeyHash(data.password);
        var result = AppDAO.AccountDAO.changePassword(data, "ForgotPassword");
        log.info("ForgotPasswordWrapper.resetForgotPassword", {username: username, result: result});
        return result;

    } else {
        ThrowError(_self.error.INCORRECT_PIN);
    }
};

_.extend(AppWrapper, {
    ForgotPasswordWrapper: ForgotPasswordWrapper
});

})();
