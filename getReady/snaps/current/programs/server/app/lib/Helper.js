(function(){AppCommon = {};
AppCommon = {
    _isEmpty: function (value) {
        if (!_.isUndefined(value) && !_.isNull(value)) {

            //NUMBER
            if (_.isNumber(value)) {
                //isEmpty will return true;
                return _.isNaN(value);
            }

            //BOOLEAN
            if (_.isBoolean(value)) {
                return false;
            }

            //STRING
            if (_.isString(value)) {
                value = value.trim();
            }

            return _.isEmpty(value);
        }
        return true;
    },

    _toJSON: function (object) {
        if (!this._isEmpty(object)) {
            return JSON.stringify(object);
        }
    }
};

AppHelper = {};
AppHelper = {
    isVaildEmail : function(emailId){
        var filter = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
        return filter.test(emailId);
    }
};
//http://pastebin.com/tyPJvUPW




})();
