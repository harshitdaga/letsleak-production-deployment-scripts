(function(){var NotificationInstant = new Meteor.Collection('c_notification_instant');

var log = AppLogger.getLogger(AppLogger.loggerName.NOTIFICATION_LOGGER);
/*****************************************************************************/
/* NotificationInstant Collection : Query Methods */
/*****************************************************************************/
/**
 *
 * @param userIdList
 * @param type : will be type.name from notification.process
 * @param message
 * @returns {*}
 */
NotificationInstant.send = function (userIdList, type, message) {
    var self = this;
    userIdList = _.compact(userIdList);
    userIdList = _.uniq(userIdList);

    var len = userIdList.length;
    var docTemplate = {
        f_userId: "",
        f_type: {
            f_name: type.name.toUpperCase(),
            f_action: !AppCommon._isEmpty(type.action) ? type.action.toUpperCase() : type.action
        },
        f_message: message,
        f_timestamp: new Date().getTime(),
        f_archived: false,
        f_notify_type: "INSTANT"
    };

    log.debug("/NotificationInstant/send", {userIdList: userIdList, type: type, message: message});

    /*
     If docTemplate.f_type.f_name == POST_LIKE || POST_COMMENT || BUCKET_FOLLOWED
     do an update with upsert == true
     */
    var i, result;
    var updateNotificationCase = ["POST_LIKE", "POST_COMMENT","BUCKET_FOLLOWED"];
    var userId = "";
    var selector = "";
    var modifier = "";
    if (updateNotificationCase.indexOf(docTemplate.f_type.f_name) != -1) {
        for (i = 0; i < len; i++) {
            result = 0;
            userId = userIdList[i];
            log.debug("/NotificationInstant/send", {userId: userId, doc:docTemplate});
            docTemplate.f_userId = userId;
            selector = {
                $and: [
                    {
                      "f_userId" : userId
                    },
                    {
                        "f_message.f_postId": docTemplate.f_message.f_postId
                    },
                    {
                        "f_type.f_name": docTemplate.f_type.f_name
                    },
                    {
                        "f_type.f_action": docTemplate.f_type.f_action
                    }
                ]
            };
            modifier = {
                $set: {
                    "f_timestamp": docTemplate.f_timestamp,
                    "f_archived": false,
                    "f_message": docTemplate.f_message
                }//,
                //$setOnInsert: docTemplate
            };

            result = App.extensions._update(self, selector, modifier, false, userId);
            if(result == 0 ) {
                result = App.extensions._insert(self, docTemplate, userId);
            }
        }
    } else {
        for (i = 0; i < len; i++) {
            userId = userIdList[i];
            docTemplate.f_userId = userIdList[i];
            result = App.extensions._insert(self, docTemplate, userId);
        }
    }
};

NotificationInstant.archive = function (data, userId) {
    //TODO move it to another table
    var selector = {
        $and: [
            {"_id": data.notificationId},
            {"f_userId": userId},
            {"f_notify_type": "INSTANT"}
        ]
    };
    var modifier = {
        $set: {
            f_archived: true
        }
    };
    NotificationInstant.update(selector, modifier, function (error, result) {
        if (error) {
            AppLogger.db_exception_logger.error("/NotificationInstant/archive update error occurred for [userId :" + userId
                + ", timestamp:" + new Date() + "]");

        }
    });
};

NotificationInstant.archiveAll = function (userId) {
    //TODO move it to another table
    var selector = {"f_userId": userId};
    var modifier = {
        $set: {
            f_archived: true
        }
    };
    var option = {
        multi: true
    };
    NotificationInstant.update(selector, modifier, option, function (error, result) {
        if (error) {
            AppLogger.db_exception_logger.error("/NotificationInstant/archiveAll update error occurred for [userId :" + userId
                + ", timestamp:" + new Date() + "]");
        }
    });
};

NotificationInstant.updateInboxCount = function (userId, changeCount) {
    var selector = {
        $and: [
            {"_id": userId},
            {f_notify_type: "INBOX"}
        ]};
    var modifier = {
        $set: {
            f_lastUpdate: Date.now()
        },
        $inc: {f_inbox_count: changeCount}
    };
    var option = {
        upsert: false
    };

    NotificationInstant.update(selector, modifier, option, function (error, result) {
        if (error) {
            AppLogger.db_exception_logger.error("/NotificationInstant/updateInboxCount update error occurred error:" + error,
                {userId: userId, changeCount: changeCount, time: new Date()});
            return;
        }
        if (result == 0 && changeCount > 0) {
            //means no row for userId with f_notify_type:INBOX present
            //insert a row
            var doc =
                NotificationInstant.insert({
                    "_id": userId,
                    f_notify_type: "INBOX",
                    f_inbox_count: 1,
                    f_timestamp: Date.now(),
                    f_lastUpdate: Date.now()
                }, function (error, result) {
                    if (error) {
                        AppLogger.db_exception_logger.error("/NotificationInstant/updateInboxCount insert new row error occurred error:" + error,
                            {doc: doc, time: new Date()});
                        return;
                    }
                });
        }
    });
};

/*****************************************************************************/
/* NotificationInstant Collection : Permissions */
/*****************************************************************************/
NotificationInstant.allow({
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

NotificationInstant.deny({
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
    NotificationInstant: NotificationInstant
});

})();
