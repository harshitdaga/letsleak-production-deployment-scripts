(function(){var StatusMeta = new Meteor.Collection('c_status_meta');

/*****************************************************************************/
/* StatusMeta Collection : Query Methods */
/*****************************************************************************/

/**
 * This function update/insert status meta information
 * to c_user_status_meta
 *  on successful insert c_status_meta is updated
 *
 * @param statusMeta
 * @param userId
 * @returns {*}
 */
StatusMeta.updateMeta = function (statusMeta, userId) {

    //inserting into c_user
    var result = AppCollection.UserStatusMeta._updatePostMeta(statusMeta._id, statusMeta.action, userId);
    if (result != -1) {
        result = this._updateMeta(statusMeta, userId);

        //if insertion/updation in c_status_meta fails delete the update of c_user_status_meta

        //Case : if action is DELETE and no document was found to be updated in c_status_meta
        //       then result will be '0' but no need to call delete for c_user_status_meta as postId
        //       are maintained as a set and if post id was not present in the set UserStatusMeta._updatePostMeta
        //       did no change to the row.

        //Case : if action is ADD and no document was found to be updated in c_status_meta
        //       then StatusMeta._updateMeta internally calls insert and result of insert
        //       statement is returned and if that is -1 means insert failed delete the
        //       information from c_user_status_meta also
        //       if action is ADD and document was found but error happened during update
        //       we get result as -1 delete the information from c_user_status_meta also
        if (result == -1) {
            AppCollection.UserStatusMeta._updatePostMeta(statusMeta._id, "DELETE", userId);
        }
    }

    if (result < 1) {
        AppLogger.db_exception_logger.error("/StatusMeta/updateMeta update post meta error for user :" + userId
            + " statusMeta:" + AppCommon._toJSON(statusMeta));
        ThrowError(AppError.DB_ERROR);
    }

    //Notification
    if(_.isEqual(statusMeta.action,"ADD")){
        var instantNotif = new AppClass.Notification.Instant();
        var data = {
            userId: userId,
            type: {
                name: instantNotif.type.POST_LIKE,
                action: statusMeta.action
            },
            message: {
                postId: statusMeta._id,
                timestamp: Date.now()
            }
        };
        instantNotif.process(data);
    }
    return result;
};

/**
 * This is a private function which update/insert status meta data
 * It first try to update the row however for the first time when
 * update returns '0' we insert the row by calling _insertMeta function.
 *
 * @param statusMeta
 * @param userId
 * @returns {*}
 * @private
 */
StatusMeta._updateMeta = function (statusMeta, userId) {
    var modifier = {};
    var action = statusMeta.action;
    var selector = {
        "_id": statusMeta._id
    };
    switch (action) {
        case "ADD" :
            modifier = {
                $inc: {likeCount: 1},
                $addToSet: {userId: userId}
            };
            selector = {
                $and: [
                    {"_id": statusMeta._id} ,
                    {userId: {$nin: [userId]} }
                ]
            };
            break;
        case "DELETE" :
            modifier = {
                $inc: {likeCount: -1},
                $pull: {userId: userId}
            };
            selector = {
                $and: [
                    {"_id": statusMeta._id} ,
                    {userId: {$in: [userId]} }
                ]
            };
            break;
    }

    var result = App.extensions._update(this, selector, modifier, false, userId);
    if (result == 0 && _.isEqual(action, "ADD")) {
        //implies this post need to be inserted
        result = this._insertMeta(statusMeta, userId);
    }
    return result;
};

/**
 * This is a private function which is called when update
 * finds no row for a post in c_status_meta collection.
 *
 * @param statusMeta
 * @param userId
 * @returns {*}
 * @private
 */
StatusMeta._insertMeta = function (statusMeta, userId) {
    var doc = {
        _id: statusMeta._id,
        userId: [userId],
        likeCount: 1
    };
    return App.extensions._insert(this, doc, userId);
};

StatusMeta.deleteMeta = function (statusMeta, userId) {
    console.error("StatusMeta.deleteMeta remove this method");
    /*this.statusMeta.action = "DELETE";
     var result = StatusMeta._updateMeta(statusMeta,userId);
     if(result == -1){
     AppLogger.db_exception_logger.error("/StatusMeta/deleteMeta delete post meta error for user :" + userId
     + " statusMeta:"+ AppCommon._toJSON(statusMeta) );
     ThrowError(AppError.DB_ERROR);
     }
     return result;*/
};

StatusMeta.getMetaCursor = function (idArray) {
    console.error("StatusMeta.getMetaCursor  move to data fetecher");
    var result = StatusMeta.find(
        {"_id": {$in: idArray} }
    );
    return result;
};

/*****************************************************************************/
/* StatusMeta Collection : Permissions */
/*****************************************************************************/
StatusMeta.allow({
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

StatusMeta.deny({
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
    StatusMeta: StatusMeta
});

})();
