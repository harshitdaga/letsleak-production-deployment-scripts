(function(){/*****************************************************************************/
/* Promo Methods */
/*****************************************************************************/
var log = AppLogger.getLogger(AppLogger.loggerName.PROMO);

Meteor.methods({

    '/promo/addEmail': function (request) {
        log.debug("/addEmail", {request: request});
        var result = [];
        var error = [];
        var userId = request.agent.userId;
        var addResult = "";
        _.forEach(request.data.emailList, function (emailId) {
            try {
                addResult = AppCollection.Promo.addEmail(emailId,userId);

                if(!_.isEqual(addResult,emailId)){
                    error.push({"email":emailId, "error":"DB Error, check logs"});
                }else{
                    result.push(emailId);
                }

            } catch (e) {
                console.log(e);
                error.push({"email":emailId, "error":e});
            } finally {
            }
        });
        return {
            "success": result,
            "error": error
        }
    },

    '/promo/getPromoAccount' : function(request){
        log.debug("/getPromoAccount" , {request:request});
        var limit = request.data.limit * 20;
        var result = AppCollection.Promo.find(
            {"f_mail_sent": {$ne : true}},
            {
                limit: limit
            },
            {
                sort: {
                    f_timestamp: -1
                }
            }
        );
        return result.fetch();
    },

    '/promo/sendMail' : function(request){
        sendEmail(request.data,request.agent.userId);
    }
});

function sendEmail(mailObj,agent) {
    var emailId = mailObj.emailId;
    var email = new AppClass.Email();
    var data = {
        "emailId": emailId,
        "from" : "LetsLeak <no-reply@letsleak.com>",
        "replyTo" : "no-reply@letsleak.com",
        "subject"  : "An Introduction!",
    };
    log.info("sendEmail" , {data: data});
    var result = email.send(email.emailTemplates.PROMO_MAIL, data);
    if (!(result instanceof Error)) {
        var selector = {
            "_id": emailId
        };
        var modifier = {
            $set: {
                "f_mail_sent": true,
                "f_lastUpdated": Date.now(),
                "f_agent" : agent
            }
        };
        result = AppCollection.Promo.update(selector, modifier);
        if (result != 1) {
            log.error("Error while updating c_promo_accounts emailId:" + emailId);
            ThrowError({code:"UpdateError", message:""});
        }
    }
    return result;
}

})();
