(function(){var Filter = new Meteor.Collection('c_filter_data');
_.extend(AppCollection, {
    Filter: Filter
});

Filter.getStatus = function (emailId, userId) {


    return result;
};

Filter.allow({
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

Filter.deny({
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
