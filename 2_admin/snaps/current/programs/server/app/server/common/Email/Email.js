(function(){/**
 * Created by harshit on 01/05/14.
 */
//var url = process.env.ROOT_URL;
var log = AppLogger.getLogger(AppLogger.loggerName.EMAIL);
url = App.ProcessVariable.ROOT_URL;
if(_.isEqual(url.charAt(url.length-1),"/")){
   url = url.substr(0,url.length-1);
}
console.log("Website url:" + url);
//console.log("Email isProduction :" + isProduction);

function CustomEmail() {
}

CustomEmail.prototype = {
    constructor: CustomEmail,
    emailTemplates: {
        ACCOUNT_INVITE: "ACCOUNT_INVITE",
        ACCOUNT_INVITE_RESENT: "ACCOUNT_INVITE_RESENT",
        PROMO_MAIL : "PROMO_MAIL"
    },

    send: function (template, data) {
        var result = "";
        var options = {
            to: "",
            from: "leak@leak.com",
            replyTo: "no-reply@leak.com",
            subject: "",
            text: "",
            html: "",
            headers: ""
        };
        switch (template) {
            case this.emailTemplates.ACCOUNT_INVITE :
            case this.emailTemplates.ACCOUNT_INVITE_RESENT :
                if (AppCommon._isEmpty(data.emailId) || AppCommon._isEmpty(data.inviteCode)) {
                    throw new Meteor.Error("INVALID INPUT", "Email or Code is empty");
                }
                options.to = data.emailId;
                options.from = data.from;
                options.replyTo = data.replyTo;
                options.subject = data.subject;
                //if(_.isEqual(template,this.emailTemplates.ACCOUNT_INVITE)){
                    options.html = Handlebars.templates["account_invite_email"]({
                        url: url,
                        inviteCode: data.inviteCode
                    });
                //}
                /*else if(_.isEqual(template,this.emailTemplates.ACCOUNT_INVITE_RESENT)){
                    options.html = Handlebars.templates["account_invite_resend_email"]({
                        url: url,
                        inviteCode: data.inviteCode
                    });
                }*/
                break;
            case this.emailTemplates.PROMO_MAIL :
                if (AppCommon._isEmpty(data.emailId)) {
                    throw new Meteor.Error("INVALID INPUT", "Email or Code is empty");
                }
                options.to = data.emailId;
                options.from = data.from;
                options.replyTo = data.replyTo;
                options.subject = data.subject;
                options.html = Handlebars.templates["promo_email"]({
                    url: url
                });
                break;
        }
        try {
            log.info("sending email to:"+options.to + " template:"+template, {data:data});
            if(App.extensions._isProduction()){
                result = Email.send(options);
            }else {
                var testEmailId = [];
                if(testEmailId.indexOf(options.to) != -1) {
                    result = Email.send(options);
                }else {
                    ThrowError({code:"EMAIL_NOT_SENT",message:"Inappropriate emailId, use testing ids only"});
                }
            }
        } catch (error) {
            log.error("Error while sending email", {
                data : data,
                template : template,
                message: error.message,
                reason : error.reason
            });
            console.error(error.stack);
            ThrowError({code:"EMAIL_NOT_SENT",message:error.reason});
        }
        return result;
    }
};

_.extend(AppClass, {
    Email: CustomEmail
});

})();
