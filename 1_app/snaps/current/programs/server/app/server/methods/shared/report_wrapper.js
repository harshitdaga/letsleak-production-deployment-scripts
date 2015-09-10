(function(){var log = AppLogger.getLogger(AppLogger.loggerName.REPORT_PROBLEM_LOGGER);
function ReportWrapper() {
}
ReportWrapper.prototype = {
    constructor: ReportWrapper,
    options : {
        "FORGOT_USERNAME" : "forgotUsername",
        "FORGOT_SECURITY_PIN" : "forgotSecurityPin",
        "QUESTION" : "questions"
    },
    isValidOption : function(value){
        var result = false;
        var self = this;
        _.each(self.options, function(op){
            if(_.isEqual(op,value)){
                result = true;
            }
        });
        return result;
    }
};

ReportWrapper.prototype.error = {
    "BLANK_CHANGE_REQUEST": {
        code: "R_1001",
        message: "Change request data cannot be blank"
    },
    "INVALID_OPTION" : {
        code: "R_1002",
        message: "Options selected is not valid."
    },
    "INVALID_USERNAME": {
        code: "R_1003",
        message: "Username is not present"
    },

    "BLANK_USERNAME_EMAIL_FIELD": {
        code: "R_1004",
        message: "Field cannot be blank"
    },
    BLANK_QUESTION_CONTENT_FIELD :{
        code: "R_1005",
        message: "Content cannot be blank"
    },
    INAPPROPRIATE_LENGTH_OF_CONTENT : {
        code: "R_1006",
        message: "Content is too short or too long"
    },
    "INVALID_EMAIL" : {
        code: "R_102",
        message: "Invalid email address"
    }

};

ReportWrapper.prototype.report = function(request){
    var self = this;
    log.info("ReportWrapper.report options ",request);

    //check optionSelected is valid or not
    //check usernameOremail valid and questionsContent !empty
    var isValidRequest = function () {
        if(AppCommon._isEmpty(request)){
            log.info("ReportWrapper.report Error occurred in processing report error:" + AppCommon._toJSON(self.error.BLANK_CHANGE_REQUEST) ,request);
            ThrowError(self.error.BLANK_CHANGE_REQUEST);
        }
        if(!self.isValidOption(request.optionSelected)){
            log.info("ReportWrapper.report Error occurred in processing report error:" + AppCommon._toJSON(self.error.INVALID_OPTION) ,request);
            ThrowError(self.error.INVALID_OPTION);
        }
        if(AppCommon._isEmpty(request.usernameOremail)){
            log.info("ReportWrapper.report Error occurred in processing report error:" + AppCommon._toJSON(self.error.BLANK_USERNAME_EMAIL_FIELD) ,request);
            ThrowError(self.error.BLANK_USERNAME_EMAIL_FIELD);
        }else{
            switch (request.optionSelected){
                case self.options.FORGOT_SECURITY_PIN:
                case self.options.FORGOT_USERNAME:
                    if(!AppHelper.isVaildEmail(request.usernameOremail)){
                        log.info("ReportWrapper.report Error occurred in processing report error:" + AppCommon._toJSON(self.error.INVALID_EMAIL) ,request);
                        ThrowError(self.error.INVALID_EMAIL);
                    }
                    break;
                case  self.options.QUESTION :
                    if(!AppDataFetcher.User.isUserNameExist(request.usernameOremail)){
                        log.info("ReportWrapper.report Error occurred in processing report error:" + AppCommon._toJSON(self.error.INVALID_USERNAME) ,request);
                        ThrowError(self.error.INVALID_USERNAME);
                    }
                    break;
            }
        }
        if(_.isEqual(self.options.QUESTION,request.optionSelected)) {
            if(AppCommon._isEmpty(request.questionsContent)){
                log.info("ReportWrapper.report Error occurred in processing report error:" + AppCommon._toJSON(self.error.BLANK_QUESTION_CONTENT_FIELD) ,request);
                ThrowError(self.error.BLANK_QUESTION_CONTENT_FIELD);
            }else {
                var len = request.questionsContent.length;
                if(len<15 || len>150){
                    log.info("ReportWrapper.report Error occurred in processing report error:" + AppCommon._toJSON(self.error.INAPPROPRIATE_LENGTH_OF_CONTENT) ,request);
                    ThrowError(self.error.INAPPROPRIATE_LENGTH_OF_CONTENT);
                }
            }
        }
        return true;
    };

    if(isValidRequest()){
        log.debug("ReportWrapper.report is valid");
        return AppDAO.ReportDAO.insertReport(request);
    }
};

_.extend(AppWrapper, {
    ReportWrapper: ReportWrapper
});

})();
