(function(){/**
 * Created by harshit on 18/04/14.
 */
function StatusMeta(id, actionType) {
    this._id = id || "";
    this.action = actionType || "";
}

StatusMeta.prototype = {
    constructor: StatusMeta,
    actions: {
        "ADD": "ADD",
        "DELETE": "DELETE"
    }
};

_.extend(AppClass, {
    StatusMeta: StatusMeta
});

})();
