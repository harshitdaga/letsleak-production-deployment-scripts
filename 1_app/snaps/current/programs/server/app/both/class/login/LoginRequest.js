(function(){function LoginResponse(userId, sessionKey) {
    this.userId = userId || null;
    this.sessionKey = sessionKey || null;
    this.isSuccess = false;
}

LoginResponse.prototype = {
    constructor: LoginResponse,
    toString: function () {
        return "[LoginResponse userId : " + this.userId + "sessionKey : " + this.sessionKey + " this.isSuccess:" + this.isSuccess + "]";
    }
};

_.extend(AppClass, {
    LoginResponse: LoginResponse
});


})();
