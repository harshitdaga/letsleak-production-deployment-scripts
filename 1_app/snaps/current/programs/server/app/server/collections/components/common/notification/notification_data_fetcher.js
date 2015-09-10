(function(){/**
 * Created by harshit on 01/06/14.
 */
var log = AppLogger.getLogger(AppLogger.loggerName.NOTIFICATION_LOGGER);
var Notification = function Notification() {
};

Notification.prototype = {
    constructor: Notification
};

Notification.prototype.getNotification = function (userId) {
    var selector = {
        $or :[
            {
                $and: [
                    {"f_userId": userId},
                    {"f_archived": false},
                    {"f_notify_type" : "INSTANT"}
                ]
            } ,
            {
                $and: [
                    {"_id": userId},
                    {"f_notify_type" : "INBOX"}
                ]
            }
        ]
    };
    var options = {
        fields: {
            f_userId: 0
        }
    };
    return AppCollection.NotificationInstant.find(selector, options);
};

Notification.prototype.getAllInstantNotification = function (userId) {
    var selector = {"f_userId": userId};
    var options = {
        sort : {
          "f_timestamp" : -1
        },
        limit: 20,
        fields: {
            f_userId: 0
        }
    };
    return AppCollection.NotificationInstant.find(selector, options);
};

Notification.prototype.getInbox = function(userId){
    var selector = {"f_userId" : userId};
    return AppCollection.NotificationInbox.find(selector);
}


_.extend(AppDataFetcher, {
    Notification: new Notification()
});

})();
