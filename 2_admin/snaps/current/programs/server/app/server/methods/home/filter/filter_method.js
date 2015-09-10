(function(){/*****************************************************************************/
/* Promo Methods */
/*****************************************************************************/
var log = AppLogger.getLogger(AppLogger.loggerName.FILTER);

var c_filter_data_log = new Meteor.Collection('c_filter_data_log');
var c_notification_inbox = new Meteor.Collection("c_notification_inbox");
var c_notification_instant = new Meteor.Collection("c_notification_instant");
var c_status_comment = new Meteor.Collection('c_status_comment');
var c_user_status_comment = new Meteor.Collection('c_user_status_comment');
var c_bucket = new Meteor.Collection('c_bucket');

Meteor.methods({
    '/filter/data': function (request) {
        log.debug("/filter/data", {request: request});
        var limit = request.data.limit * AppLimit.FILTER_STATUS;
        var data = request.data;
        var result = AppCollection.Filter.find(
            {"f_key": data.key},
            {
                limit: limit,
                sort: {
                    f_timestamp: -1
                }
            }
        );
        return result.fetch();
    },

    '/filter/resolve': function (request) {
        log.info("/filter/resolve", {request: request});
        var key = request.data.key;
        key = key.toUpperCase();
        var content = request.data.content;
        var action = request.data.action;
        action = action.toUpperCase();
        var result = "";
        var selector = {}, modifier = {};
        var f_data = content.f_data;
        _.extend(f_data,{f_filter_reason: request.data.reason, f_action: action});
        switch (key) {
            case "STATUS_MESSAGE" :
                if (_.isEqual(action, "VALID")) {
                    result = AppCollection.Status.insert(content.f_data);
                    log.info("/filter/resolve inserted to c_status", {result: result});
                }
                addInboxMessage({
                    userId: content.f_userId,
                    postId: result,
                    type: "FILTER_STATUS_REVIEWED",
                    paramObj: f_data
                });
                break;
            case "STATUS_COMMENT" :
                if (_.isEqual(action, "VALID")) {
                    result = c_status_comment.insert(content.f_data);
                    log.info("/filter/resolve inserted to c_status_comment", {result: result});

                    if(result){
                        modifier = {
                            $push: {
                                commentList: result
                            },
                            $setOnInsert: {
                                userId: content.f_data.f_userId,
                                postId: content.f_data.f_postId
                            }
                        };
                        selector = {
                            $and: [
                                {userId: content.f_data.f_userId},
                                {"postId": content.f_data.f_postId}
                            ]
                        };
                        var updateResult = c_user_status_comment.update(selector,modifier,{upsert:true});
                        if(updateResult == -1 ){
                            log.error("/filter/resolve insert fail to c_user_status_comment", {result: result});
                            c_status_comment.remove({_id: result});
                            ThrowError({code:"FILTER_STATUS_COMMENT",reason:"Error in comment insert in c_user_status_comment"});
                        }
                    }else {
                        log.error("/filter/resolve update fail to c_status_comment", {result: result});
                        ThrowError({code:"FILTER_STATUS_COMMENT",reason:"Error in comment insert in c_status_comment"});
                    }
                }
                addInboxMessage({
                    userId: content.f_userId,
                    postId: content.f_data.f_postId,
                    type: "FILTER_COMMENT_REVIEWED",
                    paramObj: f_data
                });
                break;
            case "BUCKET":
                var bucketAction = content.f_additional_info.f_action;
                if (_.isEqual(action, "VALID")) {
                    if(_.isEqual("ADD", bucketAction)){
                        result = c_bucket.insert(content.f_data);
                        if(result){
                           content.f_additional_info.f_bucketId = result;
                        }else {
                            log.error("/filter/resolve insert fail to c_bucket", {result: result});
                            ThrowError({code:"BUCKET",reason:"Error in comment insert in c_status_comment"});
                        }
                    }else if(_.isEqual("UPDATE",bucketAction)) {
                        selector = {
                            $and: [
                                {"_id": content.f_additional_info.f_bucketId},
                                {"f_userId": content.f_userId}
                            ]
                        };
                        modifier = {
                            $set: {
                                "f_bucket.f_desc": content.f_data.f_bucket.f_desc,
                                "f_bucket.f_access": content.f_data.f_bucket.f_access,
                                "f_bucket.f_isEditable": content.f_data.f_bucket.f_isEditable,
                                f_lastUpdated: new Date().getTime()
                            }
                        };
                        result = c_bucket.update(selector,modifier);
                        if(result == -1 ){
                            log.error("/filter/resolve update fail to c_bucket", {result: result});
                            ThrowError({code:"BUCKET",reason:"Error in comment insert in c_bucket"});
                        }
                    }
                }

                addInboxMessage({
                    userId: content.f_userId,
                    postId: "",
                    type: "FILTER_BUCKET_REVIEWED",
                    paramObj: _.extend(f_data, {f_bucketAction:bucketAction, f_bucketId : content.f_additional_info.f_bucketId})
                });
                break;
        }

        //mark request to log
        delete request.data.content.f_local_type;
        var logResult = c_filter_data_log.insert(_.extend(request.data.content, {f_admin_agent: request.agent.userId}));
        if(logResult){
            log.info("/filter/resolve removing from c_filter", {content: content});
            AppCollection.Filter.remove({_id : content._id});
        }
    }
});

function addInboxMessage(data) {
    log.info("addInboxMessage", {data: data});
    var doc = {
        f_userId: data.userId,
        f_postId: data.postId,
        f_type: data.type,
        f_paramObj: data.paramObj,
        f_archived : false,
        f_timestamp : Date.now()
    };

    c_notification_inbox.insert(doc, function (error, result) {
        if (error) {
            AppLogger.exception_logger.error("filterMethod NotificationInbox.send error occurred", {data: data, doc: doc});
            return;
        }
        updateInboxCount(doc.f_userId, 1);
    });
}

function updateInboxCount(userId, changeCount) {
    log.info("updateInboxCount", {userId: userId, changeCount:changeCount});
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

    c_notification_instant.update(selector, modifier, option, function (error, result) {
        if (error) {
            AppLogger.exception_logger.error("filterMethod /updateInboxCount update error occurred error:" + error,
                {userId: userId, changeCount: changeCount, time: new Date()});
            return;
        }
        if (result == 0 && changeCount > 0) {
            //means no row for userId with f_notify_type:INBOX present
            //insert a row
            var doc =
                c_notification_instant.insert({
                    "_id": userId,
                    f_notify_type: "INBOX",
                    f_inbox_count: 1,
                    f_timestamp: Date.now(),
                    f_lastUpdate: Date.now()
                }, function (error, result) {
                    if (error) {
                        AppLogger.exception_logger.error("filterMethod /updateInboxCount insert new row error occurred error:" + error,
                            {doc: doc, time: new Date()});
                        return;
                    }
                });
        }
    });
}

})();
