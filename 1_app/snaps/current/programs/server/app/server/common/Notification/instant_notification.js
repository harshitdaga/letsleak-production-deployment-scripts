(function(){/**
 * Created by harshit on 25/05/14.
 */

/*
 For a post we can have a c_post_watchers [type,watchers,author]
 where type=status
 watchers will be set of users who : commented , liked , report abused
 and in case of any notification to be raised, do it to all the watchers for  this post_id


 for bucket we need to inform who all are following bucket if a post is add
 and if someone follows we need to inform bucket author
 so start maintaining watchers in c_bucket itself.
 */

var log = AppLogger.getLogger(AppLogger.loggerName.NOTIFICATION_LOGGER);
function InstantNotification() {}
InstantNotification.prototype = {
    constructor: InstantNotification
};

InstantNotification.prototype.type = {
    'POST_LIKE': 'POST_LIKE',
    'POST_COMMENT': 'POST_COMMENT',
    'REPORT_ABUSE': 'REPORT_ABUSE',
    'POST_ADDED_TO_BUCKET': 'POST_ADDED_TO_BUCKET',
    'BUCKET_FOLLOWED' : 'BUCKET_FOLLOWED'
};

/**
 * This is the function which is used by any other component to raise a notification
 * @param userId
 * @param type : { name : notification name, action : ex: ADD,UPDATE,DELETE [option] }
 * @param message : JSON object as per the type of notification, no specific standard
 */
InstantNotification.prototype.process = function (data) {
    Meteor.defer(function () {
        _process(data);
    });
};

/*InstantNotification.prototype.process = function(userId, type, message){*/
function _process(data) {
    var userId = data.userId;
    var type = data.type;
    var message = data.message;

    if (AppCommon._isEmpty(userId) || AppCommon._isEmpty(type) || AppCommon._isEmpty(message)) {
        log.error("InstantNotification exception, something is coming as empty : [userId:" + userId
            + ", type:" + AppCommon._toJSON(type)
            + ", message" + AppCommon._toJSON(message) + "]");
        return;
    }

    switch (type.name) {
        case 'POST_COMMENT' :
            _postComment(userId, type, message);
            break;
        case 'POST_LIKE' :
            _postLike(userId, type, message);
            break;
        case 'REPORT_ABUSE' :
            _reportAbuse(userId, type, message);
            break;
        case 'POST_ADDED_TO_BUCKET' :
            _bucketPostAdded(userId, type, message);
            break;
        case 'BUCKET_FOLLOWED' :
            _bucketFollowed(userId, type, message);
            break;
        default :
            log.error("NO NOTIFICATION CASE DEFINED :" + userId + " type:" + AppCommon._toJSON(type) + " message" + AppCommon._toJSON(message));
            break;
    }
}


function _getPostWatchers(postId) {
    //get user list for likes/comments/report abuse
    var likesList = AppDataFetcher.UserStatus._getStatusMetaUserList(postId);
    var commentList = AppDataFetcher.StatusComment._getUserList(postId);

    //in-case either is undefined
    likesList = likesList || [];
    commentList = commentList || [];
    return _.union(likesList, commentList);
}

function _trimMessage(postMessage) {
    if (postMessage.length > 100) {
        postMessage = postMessage.substring(0, 100) + "...";
    }
    return postMessage;
}

function _getBucketWatchers(bucketId) {
    var followers = AppDataFetcher.UserBucket._getFollower(bucketId);
    return _.isUndefined(followers) ? [] : followers;
}

function _trimArray(array, itemTobeRemoved) {
    array = _.uniq(array);
    var itemindex = array.indexOf(itemTobeRemoved);
    if(itemindex!=-1){
        array.splice(itemindex, 1);      //remove the itemTobeRemoved
    }
    return array;
}

function _postLike(userId, type, message) {
    log.info("POST_LIKE", {userId: userId, type: type, message: message});
    if (_.isEqual("ADD", type.action.toUpperCase())) {
        var userList = _getPostWatchers(message.postId);
        var count = AppDataFetcher.StatusMeta.getPostLikeCount(message.postId);

        var post = AppDataFetcher.Status.getPost(message.postId);
        userList.push(post.f_author);               //add post author to userList

        var notify_message = {
            f_postId: message.postId,
            f_post_message: _trimMessage(post.f_message),
            f_post_like_count: count,
            f_event_timestamp: message.timestamp
        };

        AppCollection.NotificationInstant.send(_trimArray(userList, userId), type, notify_message);
    }
}

/**
 * Raise notification to who all
 *      posted a comment or
 *      liked it or
 *      report abuse or
 *      isAuthor
 *
 * @param userId
 * @param type
 * @param message
 * @private
 */
function _postComment(userId, type, message) {
    log.info("POST_COMMENT", {userId: userId, type: type, message: message});
    var userList = [];
    //send notification only to the author if private
    if (!_.isEqual(message.type, 'private')) {
        userList = _getPostWatchers(message.postId);
    }

    var post = AppDataFetcher.Status.getPost(message.postId);
    userList.push(post.f_author);               //add post author to userList
    var notify_message = {
        f_postId: message.postId,
        f_post_message: _trimMessage(post.f_message),
        f_comment_type: message.type,
        f_event_timestamp: message.timestamp,
        f_commentType : message.type.toUpperCase()
    };

    //remove the user who commented
    //Comment add are notified
    if (_.isEqual("ADD", type.action.toUpperCase())) {
        AppCollection.NotificationInstant.send(_trimArray(userList, userId), type, notify_message);
    }
}


function _reportAbuse(userId, type, message) {
    log.info("REPORT_ABUSE", {userId: userId, type: type, message: message});
    var userList = [];

    var post = AppDataFetcher.Status.getPost(message.postId);
    userList.push(post.f_author);               //add post author to userList

    var notify_message = {
        f_postId: message.postId,
        f_post_message: _trimMessage(post.f_message),
        f_reason_code: message.reason,
        f_event_timestamp: message.timestamp
    };

    //_trimArray(userList,userId);      //remove the user who reported

    AppCollection.NotificationInstant.send(userList, type, notify_message);
}

//Post deleted/removed from bucket are not notified.
function _bucketPostAdded(userId, type, message) {
    log.info("POST_ADDED_TO_BUCKET", {userId: userId, type: type, message: message});
    var userList = [];
    var post = AppDataFetcher.Status.getPost(message.postId);
    userList.push(post.f_author);               //add post author to userList

    _.each(message.bucketList, function (bucketId) {
        var bucket = AppDataFetcher.Bucket._getBucket(bucketId);
        //notification about post add to be sent for only public buckets
        if (_.isEqual(bucket.f_bucket.f_access, "PUBLIC")) {
            //console.log(userList);

            var bucketWatcher = _getBucketWatchers(bucketId);
            var postWatcher = _getPostWatchers(message.postId); //post followers added for notification
            userList = _.union(userList,bucketWatcher,postWatcher);
            userList.push(bucket.f_userId); //add bucket author to userList

            var notify_message = {
                f_postId: message.postId,
                f_post_message: _trimMessage(post.f_message),
                f_bucket_id: bucketId,
                f_bucket_name: bucket.f_bucket.f_name,
                f_event_timestamp: message.timestamp
            };
            AppCollection.NotificationInstant.send(_trimArray(userList, userId), type, notify_message);
        }
    });
}

function _bucketFollowed(userId, type, message) {
    log.info("BUCKET_FOLLOWED", {userId: userId, type: type, message: message});

    var bucket = AppDataFetcher.Bucket._getBucket(message.bucketId);
    var userList = [];
    userList.push(bucket.f_userId);             //add bucket author to userList
    var notify_message = {
        f_bucket_id: message.bucketId,
        f_bucket_name : bucket.f_bucket.f_name,
        f_event_timestamp: message.timestamp
    };
    AppCollection.NotificationInstant.send(userList, type, notify_message);
}

_.extend(AppClass.Notification, {
    Instant : InstantNotification
});

})();
