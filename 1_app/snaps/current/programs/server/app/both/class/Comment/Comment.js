(function(){/**
 * Created by harshit on 19/04/14.
 */
function Comment(postId, comment, byAuthor, type, action) {
    //this._id = id || "";        //represent post id
    this.postId = postId || "";
    this.comment = comment || "";
    this.byAuthor = byAuthor || false;
    this.type = type || "pubic";    //comment type indicates is this a private comment or public comment
    this.action = action || "";
    if (!AppCommon._isEmpty(this.action) && _.isEqual(action, "DELETE")) {
        this.type = null;
        this.byAuthor = null;
    }
    this.commentId = "";      //represent comment id used when sending delete comment object
}

Comment.prototype = {
    constructor: Comment,
    toString: function () {
        return "[Comment postId:" + this.postId
            + ", comment:" + this.comment
            + ", byAuthor:" + this.byAuthor
            + ", type:" + this.type
            + ", action:" + this.action
            + ", commentId:" + this.commentId + "]";
    },

    actions: {
        ADD: "ADD",
        DELETE: "DELETE"
    }
};

_.extend(AppClass, {
    Comment: Comment
});

})();
