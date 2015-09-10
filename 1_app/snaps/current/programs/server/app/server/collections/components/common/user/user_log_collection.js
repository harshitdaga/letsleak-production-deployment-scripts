(function(){var UserLog = new Meteor.Collection('c_user_log');

/*
 * Add query methods like this:
 *  UserLog.findPublic = function () {
 *    return UserLog.find({is_public: true});
 *  }
 */
UserLog.log = function(data){
    var doc = {
        f_timestamp : Date.now(),
        f_userId : data.userId,
        f_action : data.action
    };

    App.extensions._insert(this,doc,data.userId);
};

UserLog.allow({
  insert: function (userId, doc) {
    return true;
  },

  update: function (userId, doc, fieldNames, modifier) {
    return true;
  },

  remove: function (userId, doc) {
    return true;
  }
});

UserLog.deny({
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
    UserLog: UserLog
});

})();
