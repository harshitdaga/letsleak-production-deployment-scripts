(function(){var log = AppLogger.getLogger(AppLogger.loggerName.INDEX_LOGGER);
function CreateAccountWrapper() {
}
CreateAccountWrapper.prototype = {
    constructor: CreateAccountWrapper
};

CreateAccountWrapper.prototype.error = {
    "INVALID_EMAIL": {
        code: "CA_101",
        message: "Email address is invalid"
    },
    "BLANK_ACCOUNT_NAME": {
        code: "CA_1001",
        message: "Account Name cannot be blank"
    },
    "ACCOUNT_NAME_SIZE": {
        code: "CA_102",
        message: "User name can be of minimum 3 & maximum of only 15 characters."
    },
    "ACCOUNT_NAME_INVALID": {
        code: "CA_103",
        message: "User name can only contain alphabets, digits or underscore."
    },
    "SHORT_PIN" : {
        code : "CA_107",
        message : "Use at least 5 characters for pin."
    },
    "ACCOUNT_NAME_EXIST": {
        code: "CA_108",
        message: "User name already in use"
    },
    "BLANK_SECURITY_PIN": {
        code: "CA_1003",
        message: "Should be of minimum 5 characters."
    },
    "INVALID_INVITE_CODE" : {
        code: "CA_1004",
        message : "Invite code is already used or invalid."
    }
};

CreateAccountWrapper.prototype.requestInvite = function (data) {
    var _self = this;
    log.info("CreateAccountWrapper.requestInvite", {data: data});
    var emailId = data.emailId;

    //TODO validate email is valid or not
    var isValidEmail = function () {
        //http://www.w3resource.com/javascript/form/email-validation.php
        var filter = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
        var result = filter.test(emailId);
        if (!result) {
            ThrowError(_self.error.INVALID_EMAIL);
        }
        return true;
    };

    if (isValidEmail()) {
        log.debug("CreateAccountWrapper.requestInvite valid email :" + emailId);
        var result = AppDAO.CreateAccountDAO.requestInvite(data);
        log.info("CreateAccountWrapper.requestInvite", {data: data, result: result});
        return result;
    }
};

CreateAccountWrapper.prototype.createAccount = function (data, inviteCode) {
    var _self = this;
    var username = data.username;
    log.info("CreateAccountWrapper.createAccount", {username: username});

    var isValidAccountRequest = function () {

        if (AppCommon._isEmpty(username)) {
            ThrowError(_self.error.BLANK_ACCOUNT_NAME);
        }
        if (username.length < 4 || username.length > 15) {
            ThrowError(_self.error.ACCOUNT_NAME_SIZE);
        }

        var regex = /^[a-zA-Z0-9_]+$/g;
        if (!regex.test(username)) {
            ThrowError(_self.error.ACCOUNT_NAME_INVALID);
        }

        var accountWrapper = new AppWrapper.AccountWrapper();

        accountWrapper.validatePassword(data.password);
        if (AppCommon._isEmpty(data.pin)) {
            ThrowError(_self.error.BLANK_SECURITY_PIN);
        } else {
            if (data.pin.length < 5) {
                ThrowError(_self.error.SHORT_PIN);
            }
        }

        var checkInviteCodeResponse = AppCollection.Invitation.isRegistered(inviteCode);
        if (checkInviteCodeResponse.isRegistered || !checkInviteCodeResponse.isVaild) {
            ThrowError(_self.error.INVALID_INVITE_CODE);
        }
        return true;
    };

    if (isValidAccountRequest()) {
        var accountWrapper = new AppWrapper.AccountWrapper();
        data.password = accountWrapper.getSecretKeyHash(data.password);
        data.pin = accountWrapper.getSecretKeyHash(data.pin);

        log.debug("CreateAccountWrapper.createAccount is valid account creation request");
        var result = AppDAO.CreateAccountDAO.createAccount(data, inviteCode);
        log.info("CreateAccountWrapper.createAccount", {username: username, result: result});
        return result;
    }
};

_.extend(AppWrapper, {
    CreateAccountWrapper: CreateAccountWrapper
});

})();
