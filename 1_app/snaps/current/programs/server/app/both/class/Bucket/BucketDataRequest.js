(function(){/**
 * Created by harshit on 23/04/14.
 */

function BucketDataRequest(bucketIdList, postId, type) {
    bucketIdList = _.isArray(bucketIdList) ? bucketIdList : [bucketIdList];
    this.bucketIdList = bucketIdList || "";
    this.postId = postId || "";
    this.postType = type || "";
    this.limit = -1;
}

BucketDataRequest.prototype = {
    constructor: BucketDataRequest,

    itemType: {
        STATUS: "STATUS"
    },

    getBucketIdList: function () {
        /*if(!AppCommon._isEmpty(this.bucketIdList)){
         return Spacebars.SafeString(this.bucketIdList.trim()).string;
         }
         return this.bucketIdList;*/
    },

    getItemId: function () {
        if (!AppCommon._isEmpty(this.postId)) {
            return Spacebars.SafeString(this.postId.trim()).string;
        }
        return this.postId;
    },

    isValidType: function () {
        return this.postType === this.itemType.STATUS;
    },

    toString: function () {
        return "[BucketDataRequest bucketIdList:" + this.bucketIdList
            + ", postId:" + this.postId
            + ", postType:" + this.postType
            + ", limit:" + this.limit
            + " ]";
    },

    clone: function () {
        return new BucketDataRequest(this.bucketIdList, this.postId, this.postType, this.limit);
    },

    equals: function (other) {
        if (!(other instanceof BucketDataRequest)) {
            return false;
        }
        return EJSON.stringify(this) == EJSON.stringify(other);
    },

    typeName: function () {
        return "BucketDataRequest";
    },

    toJSONValue: function () {
        return {
            bucketIdList: this.bucketIdList,
            postId: this.postId,
            postType: this.postType,
            limit: this.limit
        };
    }
};

EJSON.addType("BucketDataRequest", function (value) {
    return new BucketDataRequest(value.bucketIdList, value.postId, value.postType, value.limit);
});


_.extend(AppClass, {
    BucketDataRequest: BucketDataRequest
});

})();
