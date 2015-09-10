(function(){var UserStatusComment = new Meteor.Collection('c_user_status_comment');

UserStatusComment._updateCommentList = function (postId, commentId, userId) {
    var modifier = {
        $push: {
            commentList: commentId
        },
        $setOnInsert: {
            userId: userId,
            postId: postId
        }
    };
    var selector = {
        $and: [
            {userId: userId},
            {"postId": postId}
        ]
    };
    return App.extensions._update(this, selector, modifier, true, userId);
};

UserStatusComment._deleteComment = function (postId, commentId, userId) {
    var selector = {
        $and: [
            {userId: userId},
            {"postId": postId}
        ]
    };
    var modifier = {
        $pull: {commentList: commentId}
    };
    return App.extensions._update(this, selector, modifier, false, userId);
};

UserStatusComment.getCommentArray = function (user_id) {
    console.error("UserStatusComment.getCommentArray move to data fetcher");
    var userComment = this.getStatusComment(user_id);
    return AppCommon._isEmpty(userComment) ? undefined : userComment.commentList;
};

UserStatusComment.getStatusComment = function (user_id) {
    console.error(" UserStatusComment.getStatusComment move to data fetcher");
    return UserStatusComment.findOne({"_id": user_id});
};


UserStatusComment.allow({
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

UserStatusComment.deny({
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
    UserStatusComment: UserStatusComment
});

})();
