(function(){var Report = new Meteor.Collection('c_report');


/*****************************************************************************/
/* Report Collection : Query Methods */
/*****************************************************************************/
Report.insertReport = function (data) {
    _.extend(data,{
        "timestamp" : Date.now()
    });
    var result = App.extensions._insert(this, data);
    if (result == -1) {
        AppLogger.db_exception_logger.error("exception occurred Report.insertReport  error : " + error, data );
        ThrowError(AppError.DB_ERROR);
    }
    return result;
};

/*****************************************************************************/
/* Report Collection : Permissions */
/*****************************************************************************/

Report.allow({
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

Report.deny({
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
    Report: Report
});

})();
