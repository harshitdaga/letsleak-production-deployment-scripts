(function(){/*****************************************************************************/
/* Create Account Methods */
/*****************************************************************************/

var log = AppLogger.getLogger(AppLogger.loggerName.INDEX_LOGGER);

Meteor.methods({
    '/createAccount/requestInvite': function (request) {
        log.info("/createAccount/requestInvite", request);
        var createAccountWrapper = new AppWrapper.CreateAccountWrapper();
        return createAccountWrapper.requestInvite(request.data);
    }
    /*
     '/createAccount/isRegistered' : function(request){
     log.info("/createAccount/isRegistered", request);
     var createAccountWrapper = new AppWrapper.CreateAccountWrapper();
     return createAccountWrapper.isRegistered(request.data);
     },


     '/createAccount/isAccountNameExist' : function(request){
     log.info("/createAccount/isAccountNameExist", request);
     var createAccountWrapper = new AppWrapper.CreateAccountWrapper();
     return createAccountWrapper.isAccountNameExist(request[0]);
     },
     */

});

})();
