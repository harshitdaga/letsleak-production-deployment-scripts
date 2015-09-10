(function(){function StatusMessage(message, isCommentAllowed, bgColor, expiry) {
    this.message = message;
    this.isCommentAllowed = isCommentAllowed || false;
    this.bgColor = bgColor || "white";
    this.expiry = expiry;
}

StatusMessage.prototype = {
    constructor: StatusMessage,

    toString: function () {
        return "[StatusMessage message:" + this.message
            + " ,isCommentAllowed:" + this.isCommentAllowed
            + " ,bgColor:" + this.bgColor
            + " ,expiry:" + AppCommon._toJSON(this.expiry) + "]";
    }
};

_.extend(AppClass, {
    StatusMessage: StatusMessage
});

})();
