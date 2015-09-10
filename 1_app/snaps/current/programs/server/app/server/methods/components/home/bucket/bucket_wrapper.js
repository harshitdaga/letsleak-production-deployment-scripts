(function(){var log = AppLogger.getLogger(AppLogger.loggerName.BUCKET_LOGGER);

function BucketWrapper() {
}
BucketWrapper.prototype = {
    constructor: BucketWrapper
};

BucketWrapper.prototype.error = {
    //server side errors
    "INVALID_OBJECT": {
        code: "B_1001",
        message: "Request Object is invalid."
    },
    "INVALID_ACCESS": {
        code: "B_1002",
        message: "Invalid Access."
    },
    "INVALID_BLANK": {
        code: "B_1003",
        message: "Invalid Action."
    },
    "SUSPECIOUS": {
        code: "B_1004",
        message: "Bucket name or description seems to be suspicious, moved for manual review."
    },

    //client validation failures
    "BLANK_BUCKET_NAME": {
        code: "B_101",
        message: "Bucket name cannot be blank."
    },
    "INVALID_BUCKET_NAME_LENGTH": {
        code: "B_102",
        message: "Bucket name cannot be more than 30 character in length."
    },
    "INVALID_BUCKET_NAME": {
        code: "B_103",
        message: "Bucket name can only contain alphabets or numbers."
    },
    "BLANK_BUCKET_DESC": {
        code: "B_104",
        message: "Bucket description cannot be blank."
    },
    "INVALID_BUCKET_DESC_LENGTH": {
        code: "B_105",
        message: "Bucket description can only be 150 character in length."
    },


    //server side errors
    "BLANK_POST_ID": {
        code: "AB_1001",
        message: "Post id should not be blank."
    },
    "BUCKET_STATE_CHANGED": {
        code: "AB_1002",
        message: "Seems like bucket creator changed the state to isEditable false, for the bucket which user is following."
    },
    //client validation failures
    "BLANK_BUCKET_LIST": {
        code: "AB_101",
        message: "For adding a post to bucket, atleast one bucket should be selected."
    }
};

BucketWrapper.prototype.addUpdateBucket = function (bucket, agent) {
    var _self = this;
    log.info("BucketWrapper.addUpdateBucket", {bucket: bucket, agent: agent});
    var bucketName = bucket.getName();
    var access = bucket.access;
    var bucketDesc = bucket.getDesc();
    var action = bucket.getAction();
    var bucketId = bucket.getId();

    var isValidBucket = function () {
        if (bucket instanceof AppClass.Bucket) {
            if (AppCommon._isEmpty(bucketName)) {
                ThrowError(_self.error.BLANK_BUCKET_NAME);
            }
            if (bucketName && bucketName.length > 50) {
                ThrowError(_self.error.INVALID_BUCKET_NAME_LENGTH);
            }
            if (bucketName && (bucketName != bucketName.match(/^[a-zA-Z0-9\s\.\*\!\&\'\,\-\?\(\)\:]+$/))) {
                ThrowError(_self.error.INVALID_BUCKET_NAME);
            }

            if (AppCommon._isEmpty(bucketDesc)) {
                ThrowError(_self.error.BLANK_BUCKET_DESC);
            }
            if (bucketDesc && bucketDesc.length > 150) {
                ThrowError(_self.error.INVALID_BUCKET_DESC_LENGTH);
            }

            if (!bucket.isValidAccessType(access)) {
                ThrowError(_self.error.INVALID_ACCESS);
            }
            if (AppCommon._isEmpty(action)) {
                ThrowError(_self.error.INVALID_ACTION);
            }

            //action wont be undefined as that condition is checked already above this
            if (_.isEqual(action.toUpperCase(), "UPDATE") && AppCommon._isEmpty(bucketId)) {
                ThrowError(_self.error.INVALID_OBJECT);
            }

            if(!App.Filter.isValidStatement(bucketDesc) || !App.Filter.isValidStatement(bucketName)){
                if(App.Filter.underReview(bucket,App.Filter.reviewType.BUCKET, agent.userId) == -1 ) {
                    ThrowError(AppError.DB_ERROR);
                }
                ThrowError(_self.error.SUSPECIOUS);
            }
        } else {
            ThrowError(_self.error.INVALID_OBJECT);
        }
        return true;
    };

    if (isValidBucket()) {
        log.debug("BucketWrapper.addUpdateBucket is valid bucket");
        var result = null;
        delete bucket.action;
        if (_.isEqual(action.toUpperCase(), "UPDATE")) {
            result = AppDAO.BucketDAO.updateBucket(bucket, agent);
        } else if (_.isEqual(action.toUpperCase(), "ADD")) {
            result = AppDAO.BucketDAO.addBucket(bucket, agent);
        }

        log.info("BucketWrapper.addUpdateBucket", {bucket: bucket, agent: agent.userId, result: result});
        return result;
    }
};

BucketWrapper.prototype.deleteBucket = function (bucketId, agent) {
    log.info("BucketWrapper.deleteBucket", {bucket_id: bucketId, agent: agent});
    var result = AppDAO.BucketDAO.deleteBucket(bucketId, agent);
    log.info("BucketWrapper.deleteBucket", {bucketId: bucketId, agent: agent.userId, result: result});
    return result;
};

BucketWrapper.prototype.addToBucket = function (bucketDataRequest, agent) {
    var _self = this;
    log.info("BucketWrapper.addToBucket", {bucketDataRequest: bucketDataRequest, agent: agent});

    var isValidAddToRequest = function () {
        //TODO check bucket id is of this user only IMPORTANT BUG
        if (bucketDataRequest instanceof AppClass.BucketDataRequest) {
            if (AppCommon._isEmpty(bucketDataRequest.bucketIdList)) {
                ThrowError(_self.error.BLANK_BUCKET_LIST);
            }
            if (!bucketDataRequest.isValidType()) {
                //type of message is not valid, technically should not happen
                ThrowError(_self.error.INVALID_OBJECT);
            }
            if (AppCommon._isEmpty(bucketDataRequest.getItemId())) {
                //no post is selected , technically it should not happen
                ThrowError(AppError.TECHNICAL_ERROR);
            }

            //check all the bucket are either created by or (is subscribed and is allowed to add) for this user
            var userBucketList = AppDataFetcher.UserBucket.getCreatedAndFollowedBucket(agent.userId);
            var userBucketListId = [];
            userBucketList = userBucketList.map(function (item) {
                userBucketListId.push(item._id);
                return {
                    _id: item._id,
                    f_bucket: {
                        f_name: item.f_bucket.f_name,
                        f_desc: item.f_bucket.f_desc,
                        f_access: item.f_bucket.f_access,
                        f_isEditable: item.f_bucket.f_isEditable
                    },
                    f_timestamp: item.f_timestamp,
                    f_lastUpdated: item.f_timestamp,
                    f_isUsersCreatedBucket: item.f_userId && _.isEqual(agent.userId, item.f_userId)
                };
            });
            userBucketListId = _.compact(userBucketListId);
            userBucketList = _.compact(userBucketList);
            var tmpIndex = -1;
            _.map(bucketDataRequest.bucketIdList, function (bucketId) {
                tmpIndex = userBucketListId.indexOf(bucketId);
                if (tmpIndex !== -1) {
                    if (!_.find(userBucketList, function (item) {
                        return _.isEqual(item._id, bucketId) &&
                            (item.f_isUsersCreatedBucket || ( item.f_bucket.f_isEditable) );
                    })) {
                        ThrowError(_self.error.BUCKET_STATE_CHANGED);
                    }
                } else {
                    //bucket is not present for this user
                    //technically this should not happen
                    ThrowError(AppError.TECHNICAL_ERROR);
                }
            });
        } else {
            ThrowError(_self.error.INVALID_OBJECT);
        }
        return true;
    };

    if (isValidAddToRequest()) {
        log.debug("BucketWrapper.addToBucket is valid bucket");
        var result = AppDAO.BucketDAO.addToBucket(bucketDataRequest, agent);
        log.info("BucketWrapper.addToBucket", {bucketDataRequest: bucketDataRequest, agent: agent.userId, result: result});
        return result;
    }
};

BucketWrapper.prototype.followBucket = function (bucketId, agent) {
    var _self = this;
    log.info("BucketWrapper.followBucket", {bucketId: bucketId, agent: agent});
    check(bucketId, String);
    var isValidRequest = function (statusMessage) {
        var bucketDetails = AppDataFetcher.Bucket._getBucket(bucketId);
        if(!AppCommon._isEmpty(bucketDetails)){
            if(_.isEqual(agent.userId,bucketDetails.f_userId)){
                log.error("BucketWrapper.followBucket user trying to follow its own bucket", {bucketId: bucketId, agent: agent.userId});
                ThrowError(AppError.TECHNICAL_ERROR);
            }
        }
        else {
            log.error("BucketWrapper.followBucket error in fetching buckt details", {bucketId: bucketId, agent: agent.userId});
            ThrowError(AppError.TECHNICAL_ERROR);
        }
        return true;
    };

    if(isValidRequest()){
        var result = AppDAO.BucketDAO.followBucket(bucketId, agent);
        log.info("BucketWrapper.followBucket", {bucketId: bucketId, agent: agent.userId, result: result});
        return result;
    }

};

BucketWrapper.prototype.unFollowBucket = function (bucketId, agent) {
    var _self = this;
    log.info("BucketWrapper.unFollowBucket", {bucketId: bucketId, agent: agent});
    check(bucketId, String);
    var isValidRequest = function (statusMessage) {
        var bucketDetails = AppDataFetcher.Bucket._getBucket(bucketId);
        if(!AppCommon._isEmpty(bucketDetails)){
            if(_.isEqual(agent.userId,bucketDetails.f_userId)){
                log.error("BucketWrapper.unFollowBucket user trying to unfollow its own bucket", {bucketId: bucketId, agent: agent.userId});
                ThrowError(AppError.TECHNICAL_ERROR);
            }
        }else {
            log.error("BucketWrapper.followBucket error in fetching buckt details", {bucketId: bucketId, agent: agent.userId});
            ThrowError(AppError.TECHNICAL_ERROR);
        }
        return true;
    };

    if(isValidRequest()){
        var result = AppDAO.BucketDAO.unFollowBucket(bucketId, agent);
        log.info("BucketWrapper.unFollowBucket", {bucketId: bucketId, agent: agent.userId, result: result});
        return result;
    }
};


BucketWrapper.prototype.getUserBuckets = function (data, agent) {
    var _self = this;
    log.info("BucketWrapper.getUserBuckets", {data: data, agent: agent});

    var result = AppDataFetcher.UserBucket.getCreatedAndFollowedBucket(agent.userId);
    var response = new AppClass.GenericResponse();
    response.format(result);

    log.debug("BucketWrapper.getUserBuckets c_user_bucket && c_bucket response", {response: response.isSuccess, agent: agent});
    if (response.isSuccess) {
        //ie result is a cursor
        var bucketArray = result.map(function (item) {
            if (item.f_bucket.f_isEditable || _.isEqual(data.callerAgent, "USER_BUCKET") || _.isEqual(agent.userId, item.f_userId)) {
                return {
                    _id: item._id,
                    f_bucket: {
                        f_name: item.f_bucket.f_name,
                        f_desc: item.f_bucket.f_desc,
                        f_access: item.f_bucket.f_access,
                        f_isEditable: item.f_bucket.f_isEditable
                    },
                    f_followCount : item.f_followCount,
                    f_postListCount: AppCommon._isEmpty(item.f_post_id_list) ? 0 : item.f_post_id_list.length,
                    f_timestamp: item.f_timestamp,
                    f_lastUpdated: item.f_timestamp,
                    f_isUsersCreatedBucket: item.f_userId && _.isEqual(agent.userId, item.f_userId)
                };
            }
        });
        bucketArray = _.omit(bucketArray, null);
        response.setSuccess(bucketArray);
    }
    log.info("BucketWrapper.getUserBuckets", {data: data, agent: agent.userId, response: response});
    return response;
};

BucketWrapper.prototype.getPostListWithLimit = function(data,userId){
    var self = this;
    log.info("BucketWrapper.getPostListWithLimit", {data: data, userId: userId});
    var bucket = AppDataFetcher.Bucket._getBucket(data.bucketId);

    if(!_.isEqual(bucket.f_userId, userId)){
        ThrowError(self.error.INVALID_ACCESS);
    }

    var postIdList = _.first(bucket.f_post_id_list, [data.limit]);
    postIdList = AppCommon._isEmpty(postIdList) ? [] : postIdList;  //to prevent exception in case bucket.f_post_id_list is initialized during bucket creation.
    var statusCursor = AppDataFetcher.Status.getPostCursor(postIdList);
    var response = new AppClass.GenericResponse();
    response.format({
        "bucket" : bucket,
        "postList" : statusCursor.fetch()
    });
    //TODO IMPORTANT send only is needed in post
    return response;
};

BucketWrapper.prototype.removePost = function(data,userId){
    var self = this;
    log.info("BucketWrapper.removePost", {data: data, userId: userId});
    if(AppCommon._isEmpty(data.postId) || AppCommon._isEmpty(data.bucketId) ) {
        ThrowError(self.INVALID_OBJECT);
    }

    var result = AppDAO.BucketDAO.removePost(data, userId);
    log.info("BucketWrapper.removePost", {bucketId: data.bucketId, userId: userId, result: result});
    return result;

};


_.extend(AppWrapper, {
    BucketWrapper: BucketWrapper
});

})();
