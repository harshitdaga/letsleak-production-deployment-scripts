(function(){/**
 * Created by harshit on 20/04/14.
 */
function Bucket(name, desc, access, isEditable, bucketId, action) {
    this.bucketId = bucketId || "";
    this.name = name.trim() || "";
    this.desc = desc.trim() || "";
    this.action = action || ""; //ADD or UPDATE
    this.isEditable = isEditable || false;
    if (!AppCommon._isEmpty(access)) {
        access = access.trim();
        access = access.toUpperCase();
    }
    //only be of type accessType, not keeping boolean as
    //later can introduce FRIENDS or some other kind of access also
    this.access = access || this.accessType.PUBLIC;

}

Bucket.prototype = {
    constructor: Bucket,
    accessType: {
        PRIVATE: "PRIVATE",
        PUBLIC: "PUBLIC"
    },

    toString: function () {
        return "[Bucket bucketId :" + this.bucketId +
            ", name :" + this.name +
            ", desc :" + this.desc +
            ", access :" + this.access +
            ", action :" + this.action +
            ", isEditable :" + this.isEditable + "]";
    },

    getId: function () {
        if (!AppCommon._isEmpty(this.bucketId)) {
            return this.bucketId.trim();
        }
        return this.name;
    },

    getName: function () {
        if (!AppCommon._isEmpty(this.name)) {
            return Spacebars.SafeString(this.name.trim()).string;
        }
        return this.name;
    },

    getDesc: function () {
        if (!AppCommon._isEmpty(this.desc)) {
            return Spacebars.SafeString(this.desc.trim()).string;
        }
        return this.desc;
    },

    getAccess: function () {
        if (!AppCommon._isEmpty(this.access) && this.isValidAccessType(this.access)) {
            return this.access;
        }
        return this.accessType.PUBLIC;
    },

    getAction: function () {
        return (!AppCommon._isEmpty(this.action) && this.isValidAction(this.action)) ? this.action : undefined;
    },

    isValidAction: function (action) {
        return action && ( _.isEqual(action.toLowerCase(), "update") || _.isEqual(action.toLowerCase(), "add"));
    },

    isValidAccessType: function (access) {
        return (_.isEqual(access, this.accessType.PRIVATE) || _.isEqual(access, this.accessType.PUBLIC));
    },

    isBucketEditable: function () {
        return this.isEditable ? true : false;
    },

    clone: function () {
        return new Bucket(this.name, this.desc, this.access, this.isEditable, this.bucketId, this.action);
    },

    equals: function (other) {
        if (!(other instanceof Bucket)) {
            return false;
        }

        return EJSON.stringify(this) == EJSON.stringify(other);
    },

    typeName: function () {
        return "Bucket";
    },

    toJSONValue: function () {
        return {
            name: this.name,
            desc: this.desc,
            access: this.access,
            bucketId: this.bucketId,
            action: this.action,
            isEditable: this.isEditable
        };
    }
};

EJSON.addType("Bucket", function (value) {
    return new Bucket(value.name, value.desc, value.access, value.isEditable, value.bucketId, value.action);
});

_.extend(AppClass, {
    Bucket: Bucket
});

})();
