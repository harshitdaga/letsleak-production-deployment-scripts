(function(){/*****************************************************************************/
/* Init : The Global Application Namespace
 File inside lib are loading first, as a result we will be using init file
 to initialize the namespace and other variables
 PS : if subfolders present then file inside them is loading first
 */
/*****************************************************************************/

//AppLogger.default_logger.info("[init.js] loading...");
App = {};
_.extend(App, {
});
AppInterceptor = {};
AppClass = {};
AppWrapper = {};
AppCollection = {};
AppDataFetcher = {};
AppDAO = {};
AppError = {
    "TECHNICAL_ERROR": {
        code: 101,
        message: "Technical Error"
    },

    //DB Common Error
    "DB_INVALID_OPERATION": {
        code: 103,
        message: "Operation your are trying to perform is invalid"
    },
    "DB_ERROR": {
        code: 104,
        message: "Technical Error occurred at db side "
    },
    "DB_DUPLICATE": {
        code: 105,
        message: "Duplicate Entry in db"
    }

};

App.extensions = {
    //if you don't provide a callback,
    // then insert blocks until the database acknowledges the write,
    // or throws an exception if something went wrong.
    _insert: function (collection, doc, userId) {
        var result = -1;
        try {
            result = collection.insert(doc);
        } catch (error) {
            AppLogger.db_exception_logger.error("[insert] exception occurred [collection:" + collection._prefix
                + ", userId:" + userId
                + ", doc:" + AppCommon._toJSON(doc)
                + ", error:" + error + "]");
        }
        return result;
    },


    _remove: function (collection, query, userId) {
        var result = -1;
        try {
            result = collection.remove(query);
        } catch (error) {
            AppLogger.db_exception_logger.error("[remove] exception occurred [collection:" + collection._prefix
                + ", userId:" + userId
                + ", query:" + AppCommon._toJSON(query)
                + ", error:" + error + "]");
        }
        return result;
    },

    _update: function (collection, selector, modifier, upsert, userId, opt_multi) {
        var result = -1;
        var options = {
            upsert: upsert
        };
        if (opt_multi) {
            _.extend(options, {
                multi: true
            });
        }

        if (AppCommon._isEmpty(selector)) {
            AppLogger.db_exception_logger.error("[update] exception occurred selector empty/undefined [collection:" + collection._prefix
                + ", userId:" + userId
                + ", selector:" + AppCommon._toJSON(selector)
                + ", modifier:" + AppCommon._toJSON(modifier)
                + ", upsert:" + upsert
                + ", error:" + error + "]");
            ThrowError(AppError.DB_INVALID_OPERATION);
        }
        try {
            result = collection.update(
                selector,
                modifier,
                options
            );
        } catch (error) {
            AppLogger.db_exception_logger.error("[update] exception occurred [collection:" + collection._prefix
                + ", userId:" + userId
                + ", selector:" + AppCommon._toJSON(selector)
                + ", modifier:" + AppCommon._toJSON(modifier)
                + ", upsert:" + upsert
                + ", error:" + error + "]");
        }
        return result;
    },

    _isProduction: function () {
        return !AppCommon._isEmpty(process.env.ENV_VARIABLE) && _.isEqual(process.env.ENV_VARIABLE.toUpperCase(), "PRODUCTION");
    }
};

App.ProcessVariable = {
    "ENV_VARIABLE" : process.env.ENV_VARIABLE || "DEV",
    "REPORT_ABUSE_NOTIFICATION_COUNT" : parseInt(process.env.REPORT_ABUSE_NOTIFICATION_COUNT) || 5,
    "REPORT_ABUSE_PUT_UNDER_REVIEW_COUNT" : parseInt(process.env.REPORT_ABUSE_PUT_UNDER_REVIEW_COUNT) || 6
};

})();
