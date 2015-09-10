(function(){/*****************************************************************************/
/* Status Methods */
/*****************************************************************************/
var log = AppLogger.getLogger(AppLogger.loggerName.STATUS_LOGGER);

Meteor.methods(App.wrapMethods([AppInterceptor.ValidSession], [], {
    '/status/postStatus': function (reqObject) {
        log.info("/status/postStatus", reqObject);
        var statusWrapper = new AppWrapper.StatusWrapper();
        return statusWrapper.postStatus(reqObject.data, reqObject.agent);
    },

    '/status/updateMeta': function (reqObject) {
        log.info("/status/updateMeta", reqObject);
        var statusWrapper = new AppWrapper.StatusWrapper();
        return statusWrapper.updateMeta(reqObject.data, reqObject.agent);
    },

    '/status/postComment': function (reqObject) {
        log.info("/status/postComment", reqObject);
        var statusWrapper = new AppWrapper.StatusWrapper();
        return statusWrapper.postComment(reqObject.data, reqObject.agent);
    },

    '/status/deleteComment': function (reqObject) {
        log.info("/status/deleteComment", reqObject);
        var statusWrapper = new AppWrapper.StatusWrapper();
        return statusWrapper.deleteComment(reqObject.data, reqObject.agent);
    },

    '/status/getMessage': function (reqObject) {
        log.info("/post/post", reqObject);
        var statusWrapper = new AppWrapper.StatusWrapper();
        return statusWrapper.getStatusMessage(reqObject.data, reqObject.agent);
    },

    '/status/deletePost': function (reqObject) {
        log.info("/post/deletePost", reqObject);
        var statusWrapper = new AppWrapper.StatusWrapper();
        return statusWrapper.deletePost(reqObject.data, reqObject.agent);
    }

}));

})();
