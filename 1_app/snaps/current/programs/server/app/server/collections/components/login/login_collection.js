(function(){var LoginLog = new Meteor.Collection('c_login_log');

/*****************************************************************************/
/* LoginLog Collection : Query Methods */
/*****************************************************************************/
LoginLog.insertLoginSuccess = function (userId, session) {
    var doc = {
        f_userId: userId,
        f_session: session
    };

    LoginLog.insert(doc, function (error, result) {
        if (error) {
            AppLogger.db_exception_logger.error("exception occurred /LoginLog/insertLoginSuccess doc:" + AppCommon._toJSON(doc) + " error : " + error);
        }
    });
};

/*****************************************************************************/
/* LoginLog Collection : Permissions */
/*****************************************************************************/
LoginLog.allow({
    insert: function (userId, doc) {
        return false;
    },

    update: function (userId, doc, fieldNames, modifier) {
        return false;
    },

    remove: function (userId, doc) {
        return false;
    }
});

LoginLog.deny({
    insert: function (userId, doc) {
        return false;
    },

    update: function (userId, doc, fieldNames, modifier) {
        return false;
    },

    remove: function (userId, doc) {
        return false;
    }
});

_.extend(AppCollection, {
    LoginLog: LoginLog
});

})();
