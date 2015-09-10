(function(){function GenericResponse(status, message, data) {
    this.status = status || "";
    this.message = message || "";
    this.isSuccess = false;
}

GenericResponse.prototype = {
    constructor: GenericResponse,
    toString: function () {
        return "[GenericResponse status:" + this.status
            + ", message:" + AppCommon._toJSON(this.message)
            + ", isSuccess:" + this.isSuccess + "]";
    },

    setError: function (message) {
        this.status = "ERROR";
        this.message = message || "";
        this.isSuccess = false;
    },

    setSuccess: function (message, data) {
        this.status = "SUCCESS";
        this.message = message || "";
        this.isSuccess = true;
    },

    format: function (result) {
        this.setSuccess(result);
        if (result instanceof Meteor.Error) {
            this.setError(result);
        } else if (_.isUndefined(result) || _.isNull(result)) {
            this.setError("result is undefined");
        }
    }
};

_.extend(AppClass, {
    GenericResponse: GenericResponse
});

})();
