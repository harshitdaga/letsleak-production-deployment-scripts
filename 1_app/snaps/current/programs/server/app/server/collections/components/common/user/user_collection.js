(function(){var User = new Meteor.Collection("c_user");
/*****************************************************************************/
/* User Collection : Query Methods */
/*****************************************************************************/
User.createAccount = function (user, inviteCode) {
    var result = null;
    if (AppDataFetcher.User.isUserNameExist(user._id)) {
        ThrowError(AppError.DB_DUPLICATE);
    }

    try {
        user._id = user._id.toLowerCase();
        _.extend(user,{
            f_inviteCode : inviteCode
        });
        result = User.insert(user);
        //Marking invitation as registered.
        var invitation_result = AppCollection.Invitation.markRegistered(inviteCode);
        return result;
    } catch (error) {
        AppLogger.db_exception_logger.error("exception occurred createAccount user:" + AppCommon._toJSON(user) + " inviteCode:" + inviteCode + " error : " + error);
        ThrowError(AppError.DB_ERROR);
    }
};

/*****************************************************************************/
/* User Collection : Permissions */
/*****************************************************************************/
User.allow({
    insert: function (UserId, doc) {
        return false;
    },

    update: function (UserId, doc, fieldNames, modifier) {
        return false;
    },

    remove: function (UserId, doc) {
        return false;
    }
});

User.deny({
    insert: function (UserId, doc) {
        return false;
    },

    update: function (UserId, doc, fieldNames, modifier) {
        return false;
    },

    remove: function (UserId, doc) {
        return false;
    }
});

_.extend(AppCollection, {
    User: User
});

})();
