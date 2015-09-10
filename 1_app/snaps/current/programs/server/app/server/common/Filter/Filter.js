(function(){var Filter = function Filter() {
    this.wordList = [];
};
var log = AppLogger.default_logger;

Filter.prototype = {
    constructor: Filter,
    types: {
        "WORDS": "WORDS"
    },
    reviewType : {
        "STATUS_MESSAGE" : "STATUS_MESSAGE",
        "STATUS_COMMENT" : "STATUS_COMMENT",
        "BUCKET" : "BUCKET"
    },
    //this function is called at server started up, see the call at bottom of file
    init: function () {
        var self = this;
        var reqObj = {
            data: {
                type: self.types.WORDS
            },
            agent: {
                userId: "server"
            }
        };
        return reloadFromDb(reqObj);
    },

    isValidStatement: function (line) {
        var result = false;
        if (!AppCommon._isEmpty(line)) {
            var str = line.replace(/[^a-z]/gi, '');
            str = AppCommon._isEmpty(str) ? str : str.toLowerCase();
            result = _.find(this.wordList, function (item) {
                return str.indexOf(item) != -1;
            });
            result = AppCommon._isEmpty(result) ? true : false;
        } else {
            result = true;
        }
        return result;
    },

    underReview : function(obj, key, userId){
        var self = this;
        var doc = {};
        key = key.toUpperCase();    //cannot be blank
        log.info("underReview", {obj:obj, key:key, userId:userId});
        switch (key) {
            case self.reviewType.STATUS_MESSAGE :
                var expires = obj.expiry.isExpiryMessage;
                var expiryTime = _.isNumber(obj.expiry.timeInMilli) ? obj.expiry.timeInMilli : 0;
                expiryTime = Date.now() + expiryTime;
                doc = {
                    f_key : key,
                    f_data : {
                        f_message: obj.message,
                        f_timestamp: new Date().getTime(),
                        f_isCommentAllowed: obj.isCommentAllowed,
                        f_color: obj.bgColor,
                        f_author: userId,
                        f_expires: obj.expiry.isExpiryMessage,
                        f_expiryTime: expires ? expiryTime : -1,
                        f_under_review : false,
                        f_flagged : false
                    },
                    f_userId : userId,
                    f_timestamp: Date.now()
                };
                break;
            case self.reviewType.STATUS_COMMENT :
                var byAuthor = AppDataFetcher.Status.isAuthor(obj.postId, userId);
                var type = "PUBLIC";
                if (!byAuthor) {
                    type = _.isEqual("PUBLIC", obj.type.toUpperCase()) ? "PUBLIC" : "PRIVATE";
                }
                doc = {
                    f_key : key,
                    f_data : {
                        f_postId: obj.postId,
                        f_comment: obj.comment,
                        f_byAuthor: byAuthor,
                        f_type: type,
                        f_timestamp: Date.now(),
                        f_userId: userId
                    },
                    f_userId : userId,
                    f_timestamp: Date.now()
                };
                break;
            case self.reviewType.BUCKET :
                doc = {
                    f_key : key,
                    f_data : {
                        f_userId: userId,
                        f_bucket: {
                            f_name: obj.name,
                            f_desc: obj.desc,
                            f_access: obj.access,
                            f_isEditable: obj.isEditable
                        },
                        f_followCount : 0,
                        f_timestamp: Date.now(),
                        f_lastUpdated: Date.now(),
                        f_post_id_list : []
                    },
                    f_additional_info : {
                        f_action : obj.getAction(),
                        f_bucketId : obj.bucketId
                    },
                    f_userId : userId,
                    f_timestamp: Date.now()
                };
                break;
            default :
                log.error("underReview key type is invalid", {obj:obj, key:key, userId:userId});
                ThrowError(AppError.TECHNICAL_ERROR);
                break;
        }
        return c_filter_data.underReview(doc,userId);
    },

    _setWordList: function (wordList) {
        log.info("_setWordlist", {wordList: wordList, currentList: this.wordList});
        var tmpWordList = _.union(wordList, this.wordList);
        tmpWordList = _.compact(wordList);
        //NOTE : Always the words should be in lower case!
        tmpWordList = _.map(tmpWordList,function(item){ return item.toLowerCase(); });
        this.wordList = tmpWordList;
        log.info("Updated wordList", {wordList : this.wordList});
    }
};

/*****************************************************************************/
/* Collection  */
/*****************************************************************************/
var c_filter_meta = new Meteor.Collection("c_filter_meta");
var c_filter_data = new Meteor.Collection("c_filter_data");
/*****************************************************************************/
/* Collection functions */
/*****************************************************************************/
c_filter_meta.getList = function(type) {
    if (!AppCommon._isEmpty(type)) {
        type = type.toUpperCase();
        switch (type) {
            case  App.Filter.types.WORDS :
                var result = c_filter_meta.find({_id: App.Filter.types.WORDS});
                return AppCommon._isEmpty(result) ? [] : result.fetch()[0];
                break;
            default :
                log.default_logger.error("c_filter_meta.fetch invalid type", {type:type});
                break;
        }
    } else {
        log.default_logger.error("c_filter_meta.fetch fetch from Database failed", {type:type});
    }
};

c_filter_data.underReview = function(doc,userId){
    return App.extensions._insert(c_filter_data,doc,userId);

}
/*****************************************************************************/
/* Exposed Method */
/*****************************************************************************/


/*****************************************************************************/
/* Exposed API */
/*****************************************************************************/
Meteor.methods(App.wrapMethods([], [], {
    '/fetch/reload': function (reqObject) {
        reloadFromDb(reqObject);
    }
}));


var reloadFromDb = function(reqObject) {
    log.info("/fetch/reload", reqObject);
    var type = reqObject.data.type;
    if (!AppCommon._isEmpty(type)) {
        type = type.toUpperCase();
        var wordList = c_filter_meta.getList(type);
        wordList = wordList.f_list;
        switch (type) {
            case App.Filter.types.WORDS:
                if (!AppCommon._isEmpty(wordList)) {
                    //filter word list cannot be empty anytime
                    App.Filter._setWordList(wordList);
                } else {
                    ThrowError(AppError.TECHNICAL_ERROR);
                    log.error("Filtered list is coming as null or empty", reqObject);
                }
                break;
            default :
                ThrowError(AppError.TECHNICAL_ERROR);
                break;
        }
    }
    return "SUCCESS";
}

App.Filter = new Filter();

//loading the filtered words
App.Filter.init();

})();
