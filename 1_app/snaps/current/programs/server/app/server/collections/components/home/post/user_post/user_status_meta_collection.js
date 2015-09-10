(function(){var UserStatusMeta = new Meteor.Collection('c_user_status_meta');

/*****************************************************************************/
/* UserStatusMeta Collection : Query Methods */
/*****************************************************************************/
UserStatusMeta._updatePostMeta = function (postId, action, userId) {
    var self = this;
    var selector = {
        "_id": userId
    };
    var modifier = "";
    switch (action) {
        case "ADD" :
            modifier = {
                $addToSet: {statusLiked: postId}
            };
            break;
        case "DELETE" :
            modifier = {
                $pull: {statusLiked: postId}
            };
            break;
    }
    return App.extensions._update(self, selector, modifier, true, userId);
};

/*****************************************************************************/
/* UserStatusMeta Collection : Permissions */
/*****************************************************************************/
UserStatusMeta.allow({
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

UserStatusMeta.deny({
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
    UserStatusMeta: UserStatusMeta
});

})();
