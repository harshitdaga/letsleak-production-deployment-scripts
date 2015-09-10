(function(){/**
 * Created by harshit on 01/05/14.
 */
var log = AppLogger.getLogger(AppLogger.loggerName.ACCOUNT_DAO_LOGGER);

function AccountDAO() {
}
AccountDAO.prototype.constructor = AccountDAO;

AccountDAO.prototype = {
    changePassword: function (data, actionFrom) {
        log.debug("changePassword", {username: data.username});
        var result = AppCollection.User.update(
            {"_id": data.username},
            {
                $set: {
                    "password": data.password,
                    "f_lastUpdate" : Date.now()
                }
            }
        );
        var response = new AppClass.GenericResponse();
        response.format(result);

        if(response.isSuccess){
            //Log this activity
            AppCollection.UserLog.log({
                userId : data.username,
                action : "Password changed via " + actionFrom,
                f_agent : "USER"
            });
        }
        log.info("changePassword c_user response", {response: response, data: data.username});
        return response;
    },

    changePin: function (data) {
        log.debug("changePin", {username: data.username});
        var result = AppCollection.User.update(
            {"_id": data.username},
            {
                $set: {
                    "pin": data.pin,
                    f_lastUpdate: Date.now()
                }
            }
        );
        var response = new AppClass.GenericResponse();
        response.format(result);
        if(response.isSuccess){
            //Log this activity
            AppCollection.UserLog.log({
                userId : data.username,
                action : "Pin changed via account settings",
                f_agent : "USER"
            });
        }
        log.info("changePin c_user response", {response: response, data: data.username});
        return response;
    }
};

_.extend(AppDAO, {
    AccountDAO: new AccountDAO()
});


})();
