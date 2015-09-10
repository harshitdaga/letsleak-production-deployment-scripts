(function(){/**
 * Created by harshit on 03/08/14.
 */

var log = AppLogger.getLogger(AppLogger.loggerName.NOTIFICATION_LOGGER);
function InboxNotification() {}

InboxNotification.prototype = {
    constructor: InboxNotification
};


InboxNotification.prototype.types = {
    "WELCOME" : "WELCOME",
    "REPORT_ABUSE_REVIEW_YOUR_POST": "REPORT_ABUSE_REVIEW_YOUR_POST",
    "REPORT_ABUSE_POST_MOVED_UNDER_REVIEW_SYSTEM": "REPORT_ABUSE_POST_MOVED_UNDER_REVIEW_SYSTEM"
};

InboxNotification.prototype.inboxType = {
    "INSERT_AND_SEND" : "INSERT_AND_SEND",
    "UPDATE_AND_SEND" : "UPDATE_AND_SEND"
};

InboxNotification.prototype.process = function (data,callback) {
    log.info("process initialing process", {data: data});

    var self = this;
    Meteor.defer(function() {
        if(_.isEqual(data.type, self.types.WELCOME)){
            _welcome(data);
        }else{
            _process(data);
        }
        callback && callback();
    });
};

function _welcome(data){
    AppCollection.NotificationInbox.send(data);
    return;
}

function _process(data) {
    var userId = data.userId;
    var type = data.type;
    var paramObj = data.paramObj;
    if (AppCommon._isEmpty(data.userId) ||
        AppCommon._isEmpty(data.postId) ||
        AppCommon._isEmpty(data.type) ||
        AppCommon._isEmpty(data.paramObj)) {
        log.error("Inbox exception, something is coming as empty" , {data: data});
        return;
    }
/*

    switch (data.inboxType) {
        case this.inboxType.INSERT_AND_SEND :
            AppCollection.NotificationInbox.updateAndSend(data);
            break;
        case this.inboxType.UPDATE_AND_SEND :
            AppCollection.NotificationInbox.insertAndSend(data);
            break;
        default :
            AppCollection.NotificationInbox.insertAndSend(data);
            break;
    }

*/

    AppCollection.NotificationInbox.send(data);
    return;
}

_.extend(AppClass.Notification, {
    Inbox: InboxNotification
});

})();
