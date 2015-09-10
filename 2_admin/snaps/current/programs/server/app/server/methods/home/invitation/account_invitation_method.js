(function(){/*****************************************************************************/
/* Invitation Methods */
/*****************************************************************************/
var log = AppLogger.getLogger(AppLogger.loggerName.ACCOUNT_INVITE);

Meteor.methods({
    '/invitation/account/getPendingAccount': function (request) {
        log.debug("/getPendingAccount" , {request:request});
        var limit = request.data.limit * AppLimit.PENDING_INVITATION;
        var result = AppCollection.AccountInvitation.find(
            {
                $and : [
                    {"f_inviteSent" : { $ne : true} }
                ]
            },
            {
                limit: limit,
                sort : {
                    f_timestamp : -1
                }
            }
        );
        return result.fetch();
    },

    "/invitation/account/sendInvite": function (request) {
        sendEmail(request.data,request.agent.userId);
    },

    "/invitation/account/sendMultipleInvite": function (request) {
        var result = [];
        var error = "";
        _.forEach(request.data.invitationList, function (item) {
            try {
                sendEmail(item,request.agent.userId);
                result.push(item);
            } catch (e) {
                error = e;
            } finally {
            }
        });
        return {
            "success" : result,
            "error" : error
        }
    },

    "/invitation/account/resendInvite": function (request) {
        resendEmail(request.data,request.agent.userId);
    }
});

function sendEmail(mailObj,agent) {
    var emailId = mailObj.emailId;
    var inviteCode = mailObj.inviteCode;

    var email = new AppClass.Email();
    var data = {
        "emailId": emailId,
        "from" : "LetsLeak <no-reply@letsleak.com>",
        "replyTo" : "no-reply@letsleak.com",
        "subject"  : "LetsLeak sends you an invite!",
        "inviteCode": inviteCode,
    };
    log.info("sendEmail" , {data: data});
    var result = email.send(email.emailTemplates.ACCOUNT_INVITE, data);
    if (!(result instanceof Error)) {
        var selector = {
            $and: [
                {"_id": emailId},
                {"inviteCode": inviteCode}
            ]
        };
        var modifier = {
            $set: {
                "f_inviteSent" : true,
                "f_mailSentTime": Date.now(),
                "f_agent" : agent,
                "f_mail_resend_count" : 0
            }
        };
        result = AppCollection.AccountInvitation.update(selector, modifier);
            if (result != 1) {
                log.error("Error while updating account_invite after email send" , {emailId: emailId , inviteCode:inviteCode});
                ThrowError({code:"UpdateError", message:""});
            }
    }
}


function resendEmail(mailObj,agent) {
    var emailId = mailObj.emailId;
    var inviteCode = mailObj.inviteCode;

    var email = new AppClass.Email();
    var data = {
        "emailId": emailId,
        "from" : "LetsLeak <no-reply@letsleak.com>",
        "replyTo" : "no-reply@letsleak.com",
        "subject"  : "Reminder: LetsLeak sends you an invite!",
        "inviteCode": inviteCode
    };
    log.info("resendEmail" , {data: data});
    var result = email.send(email.emailTemplates.ACCOUNT_INVITE_RESENT, data);
    if (!(result instanceof Error)) {
        var selector = {
            $and: [
                {"_id": emailId},
                {"inviteCode": inviteCode}
            ]
        };
        var modifier = {
            $set: {
                "f_mailSentTime": Date.now(),
                "f_agent" : agent,
            },
            $inc : { "f_mail_resend_count" : 1 }
        };
        result = AppCollection.AccountInvitation.update(selector, modifier);
        if (result != 1) {
            log.error("Error while updating account_invite after resend" , {emailId: emailId , inviteCode:inviteCode});
            ThrowError({code:"UpdateError", message:""});
        }
    }
}

})();
