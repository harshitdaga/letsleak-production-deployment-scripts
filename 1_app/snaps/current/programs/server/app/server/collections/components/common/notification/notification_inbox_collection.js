(function(){NotificationInbox = new Meteor.Collection("c_notification_inbox");

/*****************************************************************************/
/* NotificationInbox Collection : Query Methods */
/*****************************************************************************/

/**
 * doc format example
 *  "_id" : "2tLbFhMD4GFYAdPbv",
     "f_archived" : false,
     "f_timestamp" : 1407400247220,
     "f_userId" : "testaccount_2",
     "f_postId" : "sf53d965619a0f0ed5d569fd91",
     "f_type" : "REPORT_ABUSE_REVIEW_YOUR_POST",
     "f_paramObj" : {
        ....
     }
 *
 * @param data
 */
NotificationInbox.send = function(data){
    data.f_archived = false;
    data.f_timestamp = Date.now();

    data.f_userId = data.userId;
    data.f_postId = data.postId;
    data.f_type = data.type;
    data.f_paramObj = data.paramObj;

    delete data.userId;
    delete data.postId;
    delete data.type;
    delete data.paramObj;

   /* var selecctor = {
        $and : [
            {"f_type" : data.f_type},
            {"f_postId" : data.f_postId},
            {"f_userId" : data.f_userId}
        ]
    };

    var modifier = {
        $set : {
            "f_archived" : false,
            "f_paramObj.raCount" : data.raCount,
            "f_lastUpdate" : data.f_timestamp
        },
        $setOnInsert: {
            "f_timestamp" : data.f_timestamp
        }
    };

    var options = {
        upsert : true
    }*/

    NotificationInbox.insert(/*selector,modifier,options*/data,function(error,result){
        if (error) {
            AppLogger.db_exception_logger.error("NotificationInbox.send error occurred",{data : data});
            return;
        }
        AppCollection.NotificationInstant.updateInboxCount(data.f_userId,1);
    });
};

NotificationInbox.markRead = function(mailId,userId){
    var selector = {
       $and : [
           { "_id" : mailId},
           {"f_userId" : userId}
       ]
    };
    var modifier = {
        $set : {
            "f_archived" : true,
            "f_lastUpdate" : Date.now()
        }
    };
    var result = App.extensions._update(this,selector,modifier,false,userId);
    if(result== 1){
        //decreasing the count from instant notification collection
        AppCollection.NotificationInstant.updateInboxCount(userId,-1);
    }
    return result;
};

/*****************************************************************************/
/* NotificationInbox Collection : Permissions */
/*****************************************************************************/
NotificationInbox.allow({
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

NotificationInbox.deny({
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
    NotificationInbox: NotificationInbox
});

})();
