(function(){/**
 * Created by harshit on 01/05/14.
 */
var log = AppLogger.getLogger(AppLogger.loggerName.INDEX_DAO_LOGGER);

function CreateAccountDAO() {
}
CreateAccountDAO.prototype.constructor = CreateAccountDAO;

CreateAccountDAO.prototype = {
    requestInvite: function (data) {
        log.debug("requestInvite", {data: data});
        var result = AppCollection.Invitation.addInvite(data.emailId);
        var response = new AppClass.GenericResponse();
        response.format(result);

        log.info("getInvite c_account_invitation response", {response: response, data: data});
        return response;
    },

    createAccount: function (data, inviteCode) {
        log.debug("createAccount", {username: data.username});

        data._id = data.username.toLowerCase().trim();
        delete data.username;
        var result = AppCollection.User.createAccount(data, inviteCode);
        var response = new AppClass.GenericResponse();
        response.format(result);

        log.info("createAccount c_user response", {response: response, username: data.username});
        return response;
    },

    changePassword: function (data) {
        log.debug("changePassword", {username: data.username});
        var result = AppCollection.User.update(
            {"_id": data.username},
            {
                $set: {"srp": data.srp}
            }
        );
        var response = new AppClass.GenericResponse();
        response.format(result);

        log.info("changePassword c_user response", {response: response, data: data});
        return response;
    }
};

_.extend(AppDAO, {
    CreateAccountDAO: new CreateAccountDAO()
});


})();
