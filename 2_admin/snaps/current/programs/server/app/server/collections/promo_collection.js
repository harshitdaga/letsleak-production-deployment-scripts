(function(){var Promo = new Meteor.Collection('c_promo_accounts');
_.extend(AppCollection, {
    Promo: Promo
});

Promo.addEmail = function (emailId, userId) {
    var doc = {
        "_id": emailId,
        "f_timestamp": Date.now(),
        "f_agent": userId,
        "f_mail_sent" : false
    };

    var result = App.extensions._update(this,{"_id":emailId},{$set:{"f_lastUpdated" : Date.now()}},false,userId);
    if(result == 0){
        result = App.extensions._insert(this,doc,userId);
    }else if(result == 1) {
        result = emailId;   //since insert will return the id of doc so making update/insert result as same on success
    }
    return result;
};

Promo.allow({
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

Promo.deny({
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

})();
