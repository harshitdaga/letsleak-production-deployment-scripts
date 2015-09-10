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
//http://pastebin.com/tyPJvUPW




})();
