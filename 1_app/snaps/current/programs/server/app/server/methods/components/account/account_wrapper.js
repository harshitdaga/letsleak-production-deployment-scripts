(function(){var log = AppLogger.getLogger(AppLogger.loggerName.ACCOUNT_LOGGER);
function AccountWrapper() {
}
AccountWrapper.prototype = {
    constructor: AccountWrapper
};

AccountWrapper.prototype.error = {
    "BLANK_CHANGE_REQUEST": {
        code: "A_101",
        message: "Change request data cannot be blank"
    },
    "INVALID_USERNAME": {
        code: "A_1001",
        message: "Username is not present"
    },
    "CURRENT_PASSWORD_INVALID": {
        code: "A_1002",
        message: "Current password entered is incorrect."
    },
    "INVALID_KEY" : {
        code : "A_1003",
        message : "Secrey key is invalid.Secret key can be password or pin"
    },
    "BLANK_PASSWORD": {
        code: "A_1004",
        message: "Password cannot be blank."
    },
    "INVALID_PASSWORD" : {
        code : "A_1005",
        message : "Your password should contain at least one letter and one number."
     },
    "SHORT_PASSWORD" : {
        code: "A_1006",
        message : "Use at least 8 characters for password."
    }
};

AccountWrapper.prototype.changePassword = function(request){
    var _self = this;
    var options = request.data;
    options.username = request.agent.userId;
    log.debug("AccountWrapper.changePassword options" + AppCommon._toJSON(options));
    var keyInPlainText = options.currentPassword;
    if (_self.validateSecretKey(options.username, keyInPlainText,"PASSWORD" )) {
        _self.validatePassword(options.password);
        var data = {
            username : options.username,
            password : _self.getSecretKeyHash(options.password)
        };
        var result = AppDAO.AccountDAO.changePassword(data, "AccountSetting");
        log.info("AccountWrapper.changePassword", {username: options.username, result: result});
        return result;
    }
};

AccountWrapper.prototype.changePin = function(request){
    var _self = this;
    var options = request.data;
    options.username = request.agent.userId;
    log.debug("AccountWrapper.changePin options : " + AppCommon._toJSON(options));
    var keyInPlainText = options.currentPassword;
    if (_self.validateSecretKey(options.username, keyInPlainText,"PASSWORD" )) {
        if (AppCommon._isEmpty(options.pin)) {
            ThrowError(_self.error.BLANK_CHANGE_REQUEST);
        }
        var data = {
            username : options.username,
            password : _self.getSecretKeyHash(options.pin)
        };
        var result = AppDAO.AccountDAO.changePin(data);
        log.info("AccountWrapper.changePin", {username: options.username, result: result});
        return result;
    }
};

/*
AccountWrapper.prototype.changePasswordorPin = function (options, requestType) {
    var _self = this;
    log.debug("AccountWrapper.changePasswordorPin options : " + AppCommon._toJSON(options));
    var username = options.username;

    requestType = requestType.toUpperCase();
    var keyInPlainText = "";
    switch(requestType){
        case "PASSWORD" :
            keyInPlainText = user.password;
            break;
        case "PIN" :
            keyInPlainText = user.pin;
            break;
        default :
            ThrowError(AppError.TECHNICAL_ERROR);
            break;
    }

    if (_self.validateSecretKey(username, keyInPlainText,requestType )) {
        var data = {
            username: username,
            srp: options.srp
        };
        var isValidChangePasswordRequest = function () {
            if (AppCommon._isEmpty(data.srp)) {
                ThrowError(_self.error.BLANK_CHANGE_REQUEST);
            } else {
                //srp is not undefined but identity/salt/verifier can be empty or blank
                if (AppCommon._isEmpty(data.srp.identity) || AppCommon._isEmpty(data.srp.salt) || AppCommon._isEmpty(data.srp.verifier)) {
                    log.error("AccountWrapper.changePasswordorPin Password field modified", {data: data});
                    ThrowError(AppError.TECHNICAL_ERROR);
                }
            }
            return true;
        };

        if (isValidChangePasswordRequest()) {
            log.debug("AccountWrapper.changePasswordorPin is valid reset password request");
            if (_.isEqual("password", requestType.toLowerCase())) {
                var result = AppDAO.AccountDAO.changePassword(data);
                log.info("AccountWrapper.changePasswordorPin", {username: username, result: result});
                return result;
            } else if (_.isEqual("pin", requestType.toLowerCase())) {
                var result = AppDAO.AccountDAO.changePin(data);
                log.info("AccountWrapper.changePasswordorPin", {username: username, result: result});
                return result;
            }

        }
    }
};*/

/* ################################################################### */
//                    Password Validation
/* ################################################################### */
AccountWrapper.prototype.validatePassword = function(password) {
    if (AppCommon._isEmpty(password)) {
        ThrowError(_self.error.BLANK_PASSWORD);
    } else {
        var regexPassword = /(?=.*[A-Za-z])(?=.*[0-9])[A-Za-z0-9]+/g;
        if (!regexPassword.test(password)) {
            ThrowError(_self.error.INVALID_PASSWORD);
        }
        if (password.length < 8) {
            ThrowError(_self.error.SHORT_PASSWORD);
        }
    }
    return true;
};


/* ################################################################### */
//      Generating and Validating Secret Key methods
/* ################################################################### */
//Password impleentation https://github.com/meteor/meteor/blob/devel/packages/accounts-password/password_server.js
//var bcrypt = Npm.require('bcrypt');
var bcrypt = NpmModuleBcrypt;
var bcryptHash = Meteor.wrapAsync(bcrypt.hash);
var bcryptCompare = Meteor.wrapAsync(bcrypt.compare);

AccountWrapper.prototype.getSecretKeyHash = function(secretKey){
    password = this._getSHAString(secretKey);
    return bcryptHash(secretKey, 10);
}

AccountWrapper.prototype._getSHAString = function(secretKey){
    if (typeof secretKey === "string") {
        secretKey = Package.sha.SHA256(secretKey);
    } else { // 'password' is an object
        if (secretKey.algorithm !== "sha-256") {
            throw new Error("Invalid password hash algorithm. " +
                "Only 'sha-256' is allowed.");
        }
        secretKey = secretKey.digest;
    }
    return secretKey;
};

AccountWrapper.prototype.validateSecretKey = function(userId,keyInPlainText,keyType){
    var _self = this;
    var user = AppDataFetcher.User.getUser(userId);
    if (!user){
        ThrowError(_self.error.INVALID_USERNAME);
    }

    keyType = keyType.toUpperCase();
    var keyHash = "";
    switch(keyType){
        case "PASSWORD" :
            keyHash = user.password;
            break;
        case "PIN" :
            keyHash = user.pin;
            break;
        default :
            ThrowError(AppError.TECHNICAL_ERROR);
        break;
    }
    if (! bcryptCompare(keyInPlainText, keyHash)) {
        ThrowError(_self.error.INVALID_KEY);
    }

    return true;
};

_.extend(AppWrapper, {
    AccountWrapper: AccountWrapper
});

})();
