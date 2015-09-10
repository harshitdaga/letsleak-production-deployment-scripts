(function(){var ReportAbuse = new Meteor.Collection('c_report_abuse');
var log = AppLogger.getLogger(AppLogger.loggerName.REPORT_ABUSE_DAO_LOGGER);

/*****************************************************************************/
/* ReportAbuse Collection : Query Methods */
/*****************************************************************************/
ReportAbuse.insertAbuse = function (reportAbuse, userId) {
    var _self = this;
    var result = _self._updateAbuse(reportAbuse, userId);
    if (result > 0) {
        result = AppCollection.UserReportAbuse._insertAbuse(reportAbuse, userId);
        if (result == -1) {
            //Insert into c_user_report_abuse failed, revert the changes in c_report_abuse
            this._deleteAbuse(reportAbuse, userId);
        }
    }
    if (result < 1) {
        AppLogger.db_exception_logger.error("/ReportAbuse/insertAbuse error for user :" + userId
            + " reportAbuse:" + AppCommon._toJSON(reportAbuse));
        ThrowError(AppError.DB_ERROR);
    } else {
        //for updating local collection on client
        result = {
            postId: reportAbuse.postId,
            reasonCode: reportAbuse.reasonCode,
            timestamp: new Date().getTime(),
            action: reportAbuse.action
        };
    }

    //Notification
    var instantNotif = new AppClass.Notification.Instant();
    var data = {
        userId: userId,
        type: {
            name: instantNotif.type.REPORT_ABUSE,
            action: "ADD"
        },
        message: {
            postId: reportAbuse.postId,
            reason: reportAbuse.reasonCode,
            timestamp: Date.now()
        }
    };
    instantNotif.process(data);
    //notification inboxing should be running as a seperate event and user process should not be stuck
    Meteor.defer(function () {
        _self._checkAndInformAuthor(reportAbuse.postId);
    });
   return result;
};

ReportAbuse._updateAbuse = function (reportAbuse, userId) {
    var selector = {"_id": reportAbuse.postId};
    var modifier = {
        $addToSet: {f_reported_by_list: userId},
        $inc: {f_count: 1},
        $setOnInsert: {
            f_postType: reportAbuse.postType,
            f_warning_inbox_notify: false,
            f_under_review_inbox_notify: false
        }
    };
    return App.extensions._update(this, selector, modifier, true, userId);
};

ReportAbuse.deleteAbuse = function (reportAbuse, userId) {
    var result = this._deleteAbuse(reportAbuse, userId);
    if (result > 0) {
        result = AppCollection.UserReportAbuse._deleteAbuse(reportAbuse, userId);
        if (!result) {
            //Delete from c_user_report_abuse failed, revert the changes in c_report_abuse
            this._updateAbuse(reportAbuse, userId);
        }
    }

    if (result < 1) {
        AppLogger.db_exception_logger.error("/ReportAbuse/deleteAbuse error for user :" + userId
            + " reportAbuse:" + AppCommon._toJSON(reportAbuse));
        ThrowError(AppError.DB_ERROR);
    } else {
        //for updating local collection on client
        result = {
            postId: reportAbuse.postId,
            action: reportAbuse.action
        };
    }
    return result;
};

ReportAbuse._deleteAbuse = function (reportAbuse, userId) {
    var selector = {
        $and: [
            {
                "_id": reportAbuse.postId
            },
            {
                f_reported_by_list: { $in: [userId] }
            }
        ]
    };
    var modifier = {
        $pull: {f_reported_by_list: userId},
        $inc: {f_count: -1}
    };
    return App.extensions._update(this, selector, modifier, false, userId);
};


ReportAbuse._checkAndInformAuthor = function (postId) {
    var self = this;
    log.info("ReportAbuseWrapper._checkAndInformAuthor", {postId: postId});
    var raData = AppDataFetcher.ReportAbuse._getPostReport(postId);
    if (raData.f_count == App.ProcessVariable.REPORT_ABUSE_NOTIFICATION_COUNT || raData.f_count == App.ProcessVariable.REPORT_ABUSE_PUT_UNDER_REVIEW_COUNT) {
        var inboxNotif = new AppClass.Notification.Inbox();
        var data = {
            userId: "",
            postId: postId,
            type: "",
            paramObj: {}
        };

        var postData = AppDataFetcher.Status.getPost(postId);
        data.userId = postData.f_author;
        data.paramObj.raCount = raData.f_count;

        //setting modifier for updating the post coloum f_under_review_inbox_notify or  f_warning_inbox_notify
        var modifier = {};

        switch (raData.f_count) {
            case App.ProcessVariable.REPORT_ABUSE_NOTIFICATION_COUNT :
                if (raData.f_warning_inbox_notify) {
                    log.info("ReportAbuseWrapper._checkAndInformAuthor already inboxed f_warning_inbox_notify", {raData: raData});
                    return;
                }
                data.type = inboxNotif.types.REPORT_ABUSE_REVIEW_YOUR_POST;
                /*if (postData.f_message.length > 100) {
                    postData.f_message = postData.f_message.substring(0, 100) + "...";
                }*/
                modifier = {
                    $set: {
                        f_warning_inbox_notify: true
                    }
                };
                break;
            case App.ProcessVariable.REPORT_ABUSE_PUT_UNDER_REVIEW_COUNT :
                if (raData.f_under_review_inbox_notify) {
                    log.info("ReportAbuseWrapper._checkAndInformAuthor already inboxed f_under_review_inbox_notify", {raData: raData});
                    return;
                }
                data.type = inboxNotif.types.REPORT_ABUSE_POST_MOVED_UNDER_REVIEW_SYSTEM;
                modifier = {
                    $set: {
                        f_under_review_inbox_notify: true
                    }
                };
                break;
            default :
                log.error("ReportAbuseWrapper._checkAndInformAuthor some wrong count it should not enter here", {raData: raData});
                return;
        }
        data.paramObj.postMessage = postData.f_message;
        data.paramObj.color = postData.f_color;
        inboxNotif.process(data, function () {
            var selector = {"_id": postId};
            self.update(selector, modifier, function (error, result) {
                if (error) {
                    AppLogger.db_exception_logger.error("ReportAbuseWrapper._checkAndInformAuthor error while updating flags", {data: data});
                }
            });

            if(raData.f_count == App.ProcessVariable.REPORT_ABUSE_PUT_UNDER_REVIEW_COUNT) {
                AppCollection.Status.updateReviewStatus(postId);
            }
        });
    }
};

/*****************************************************************************/
/* ReportAbuse Collection : Permissions */
/*****************************************************************************/
ReportAbuse.allow({
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

ReportAbuse.deny({
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
    ReportAbuse: ReportAbuse
});

})();
