(function(){var UserReportAbuse = new Meteor.Collection('c_user_report_abuse');

/*****************************************************************************/
/* UserReportAbuse Collection : Query Methods */
/*****************************************************************************/
UserReportAbuse._insertAbuse = function (reportAbuse, userId) {
    var doc = {
        _id: reportAbuse.postId + "#" + userId,
        f_userId: userId,
        f_postId: reportAbuse.postId,
        f_postType: reportAbuse.postType.toUpperCase(),
        f_reasonCode: reportAbuse.reasonCode,
        f_timestamp: new Date().getTime()
    };
    return App.extensions._insert(this, doc, userId);
};

UserReportAbuse._deleteAbuse = function (reportAbuse, userId) {
    var selector = {
        _id: reportAbuse.postId + "#" + userId
    };
    return App.extensions._remove(this, selector, userId);
};

/*****************************************************************************/
/* UserReportAbuse Collection : Permissions */
/*****************************************************************************/
UserReportAbuse.allow({
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

UserReportAbuse.deny({
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
    UserReportAbuse: UserReportAbuse
});

})();
