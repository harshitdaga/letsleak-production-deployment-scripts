(function(){var UserStatus = new Meteor.Collection('c_user_status');

//TODO try to remove this collection
/*****************************************************************************/
/* User Status Collection : Query Methods */
/*****************************************************************************/
/**
 * Internal function and is used by status collection for inserting
 * the userId => status
 * @param docId
 * @param userId
 * @returns {*}
 * @private
 */
UserStatus._updateUserStatus = function (docId, userId) {
    var self = this;
    var selector = {
        "_id": userId
    };
    var modifier = {
        $addToSet: { "f_status_id": docId}
    };
    return App.extensions._update(self, selector, modifier, true, userId);
};

/*****************************************************************************/
/* User Status Collection : Permissions */
/*****************************************************************************/
UserStatus.allow({
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

UserStatus.deny({
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
    UserStatus: UserStatus
});

})();
