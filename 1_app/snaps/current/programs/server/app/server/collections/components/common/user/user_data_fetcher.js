(function(){/**
 * Created by harshit on 01/06/14.
 */
function User() {
}
User.prototype = {
    constructor: User
};

User.prototype.isUserNameExist = function (userId) {
    var result = this.getUser(userId);
    //_.isUndefined(result) == true means result is undefined ==> accountName is not present
    return !_.isUndefined(result);
};

User.prototype.getUser = function (userId) {
    return AppCollection.User.findOne({"_id": userId.toLowerCase()});
};

_.extend(AppDataFetcher, {
    User: new User()
});

})();
