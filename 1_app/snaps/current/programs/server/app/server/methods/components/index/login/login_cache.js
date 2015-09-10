(function(){function LoginCache() {
    //Since we can have multiple session of user
    //Map will contain userId => list(sessionKey)
    this.sessionMap = {};
}
LoginCache.prototype = {
    constructor: LoginCache,

    error: {
        "BLANK_USER_NAME": {
            code: "I_L_101",
            message: "Username should not be blank."
        },
        "BLANK_SESSION_KEY": {
            code: "I_L_102",
            message: "Session key should not be blank."
        },
        "INVALID_SESSION": {
            code: "I_L_103",
            message: "Invalid session, please login again."
        },
        "SESSION_EXPIRED": {
            code: "I_L_104",
            message: "Session expired, please login again."
        }
    },
    /**
     * This method sets session into login cache.
     * If userId/sessionkey/timestamp is undefined return false without performing anything
     * @param userId
     * @param sessionKey
     * @returns {boolean}
     */

    /*
     {"sessionMap":
     {"accountname":
     [
     {"session":{"key":"lJqwog6n9aGogSvKRISFU9f8cqVudAp99YOs5eHCSRk=","createOn":1402831632684,"expiry":null},"timestamp":1402831632685},
     {"session":{"key":"n1ypquCZG99zFe6dpbvuHexSC4U5lX4b5NMWTKJdPrw=","createOn":1402831733551,"expiry":null},"timestamp":1402831733551}
     ]
     }
     }
     */
    setSessionToCache: function (userId, session) {
        if (!AppCommon._isEmpty(userId) && !AppCommon._isEmpty(session.key) && !AppCommon._isEmpty(session.createOn)) {
            userId = userId.toLowerCase();
            var sessionArray = this.sessionMap[userId];
            var data = {
                session: session,
                timestamp: new Date().getTime()
            };
            if (AppCommon._isEmpty(sessionArray)) {
                this.sessionMap[userId] = [data];
            }
            else {
                sessionArray.push(data);
                this.sessionMap[userId] = sessionArray;
            }
            AppLogger.default_logger.debug("LoginCache.setSessionToCache sessionMap", {sessionMap: this.sessionMap});
            return true;
        }
        AppLogger.default_logger.error("LoginCache.setSessionToCache Error in setting login cache", {userId: userId, session: session});
        return false;
    },

    removeSessionFromCache: function (user_id, session) {
        if (!AppCommon._isEmpty(user_id)) {
            AppLogger.default_logger.info("LoginCache.removeSessionFromCache", {user_id: user_id});
            var session_list = this.sessionMap[user_id];
            var item = "";
            if (!AppCommon._isEmpty(session_list)) {
                var len = session_list.length;
                for (var i = 0; i < len; i++) {
                    item = session_list[i];
                    if (item && _.isEqual(item.session, session)) {
                        session_list.splice(i, 1);
                        this.sessionMap[user_id] = session_list;
                        break;
                    }
                }
            }
            AppLogger.default_logger.info("LoginCache.removeSessionFromCache", {user_id: user_id, user_session_list: this.sessionMap[user_id]});
            return "Success";
        }
    },

    getSessionListOfUser: function (user_id, session) {
        if (!AppCommon._isEmpty(user_id)) {
            AppLogger.default_logger.info("LoginCache.getSessionMapOfUser", {user_id: user_id});
            var session_list = this.sessionMap[user_id];
            AppLogger.default_logger.debug("LoginCache.getSessionMapOfUser", {user_id: user_id, session_list: session_list});

            if (!AppCommon._isEmpty(session_list)) {
                var len = session_list.length;
                var result = [];
                var item = "";
                for (var i = 0; i < len; i++) {
                    item = session_list[i];
                    if (item && !_.isEqual(item.session, session)) {
                        result.push(item.timestamp);
                    }
                }
            }
            AppLogger.default_logger.info("LoginCache.getSessionMapOfUser", {user_id: user_id, result: result});
            return result;
        }
    },

    logoutActiveSession: function (userId, session) {
        if (!AppCommon._isEmpty(userId)) {
            AppLogger.default_logger.info("LoginCache.logoutActiveSession", {userId: userId});
            var item = "";
            var session_list = this.sessionMap[userId];

            if (!AppCommon._isEmpty(session_list)) {
                var len = session_list.length;
                for (var i = 0; i < len; i++) {
                    item = session_list[i];
                    if (item && _.isEqual(item.session, session)) {
                        this.sessionMap[userId] = [item];
                        break;
                    }
                }
            }
            AppLogger.default_logger.info("LoginCache.logoutActiveSession", {userId: userId, user_session_list: this.sessionMap[userId]});
        }
    },

    isValidSession: function (userId, session) {
        AppLogger.default_logger.debug("LoginCache.isValidSession", {userId: userId});
        var _self = this;
        if (AppCommon._isEmpty(userId)) {
            ThrowError(_self.error.BLANK_USER_NAME);
        }
        if (AppCommon._isEmpty(session) || AppCommon._isEmpty(session.key)) {
            ThrowError(_self.error.BLANK_SESSION_KEY);
        }

        userId = userId.toLowerCase();
        var session_list = this.sessionMap[userId];

        if (AppCommon._isEmpty(session_list)) {
            ThrowError(_self.error.INVALID_SESSION);
        }

        var len = session_list.length;
        for (var i = 0; i < len; i++) {
            if (session_list[i] && _.isEqual(session_list[i].session, session)) {
                return true;
            }
        }
        ThrowError(_self.error.INVALID_SESSION);
    }
};


_.extend(AppClass, {
    LoginCache: new LoginCache()
});

})();
