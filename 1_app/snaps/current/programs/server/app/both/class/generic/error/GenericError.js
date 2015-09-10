(function(){function Errors() {
    this.errorArray = [];
    this.length = 0;
    this.isEmpty = true;
}

Errors.prototype = {
    constructor: Errors,

    add: function (code, elemId) {
        this.errorArray[this.length] = {
            code: code,
            elemId: elemId
        };
        this.length += 1;
        this.isEmpty = false;
    },

    toString: function () {
        return "[Errors errorArray:" + AppCommon._toJSON(this.errorArray)
            + ", length:" + this.length
            + ", isEmpty:" + this.isEmpty + "]";
    },

    messages : {
        GENERIC : "Some error occurred. We are sorry for the trouble.\nIf problem persists, please <a target='_blank' href='/ContactUs'>Contact Us</a>",
        TECHNICAL : "Some technical error occurred. We are sorry for the trouble.\nIf problem persists, please <a target='_blank' href='/ContactUs'>Contact Us</a>."
    },

    //TODO remove this
    /*render: function (errorArray, templateId) {
        console.error("migrate this call to 'showBlockError'");
        this.showElementError(errorArray, templateId);
    },*/

    //TODO remove this
    /*remove: function (elemId, templateId) {
        console.error("migrate this call to 'removeBlockError'");
        this.removeElementError(elemId, templateId);
    },*/

    showElementError: function (errorArray, templateId) {
        if (!AppCommon._isEmpty(templateId)) {
            var parent = templateId;
            _.each(errorArray, function (error) {
                var errorText = $("#" + parent + " .error-text ." + error.code).html();
                var elemParent = $("#" + parent + " #" + error.elemId).parent();
                $(elemParent).find(".error-text").html(errorText).show();
                $("#" + parent + " #" + error.elemId + "Group").removeClass("has-success").addClass("has-error");
            });
        } else {
            alert(this.messages.GENERIC);
        }
    },

    removeElementError: function (elemId, templateId) {
        if (!AppCommon._isEmpty(templateId)) {
            var elemParent = $("#" + templateId + " #" + elemId).parent();
            $(elemParent).find(".error-text").html("").hide();
            $("#" + templateId + " #" + elemId + "Group").removeClass("has-error");
        } else {
            alert(this.messages.GENERIC);
        }
    },

    /**
     *
     * @param templateId
     * @param errorDiv
     * @param error : will be of form
     *                  String ex:"L_101"  or
     *                  Array of form : this.errorArray
     * @param opt_elemArray : optional element array
     */
    showBlockError: function (templateId, errorDiv, error, opt_elemArray) {
        var self = this;
        if (!AppCommon._isEmpty(templateId)) {
            var message = self.messages.GENERIC;
            if (error) {
                var errorArray = error;
                if (!_.isArray(error)) {
                    errorArray = [
                        {code: error}
                    ];
                }
                message = "";
                _.each(errorArray, function (item) {
                    message += $("#" + templateId + " .error-text ." + item.code).html();
                    message += '<br>';
                });
            }

            this._renderCustomBlock(templateId, errorDiv, message);
            //TODO can merge error.elemId if error is array with elemArray ...
            if (opt_elemArray && opt_elemArray.length > 0) {
                _.each(opt_elemArray, function (elemId) {
                    $("#" + templateId + " #" + elemId + "Group").addClass("has-error");
                });
            }
        } else {
            alert(self.messages.GENERIC);
        }
    },

    showCustomBlockError: function (templateId, errorDivPrefix, errorCode, opt_message) {
        var self = this;
        //TODO add in case still exist contact support
        if (AppCommon._isEmpty(errorDivPrefix)) {
            alert(self.messages.GENERIC);
        }

        if(!AppCommon._isEmpty(errorCode)){
            var invalidLoginError = ["I_L_101", "I_L_102", "I_L_103", "I_L_104"];
            if (invalidLoginError.indexOf(errorCode) != -1) {
                this.storeAndLogout();
                return;
            }
        }

        if(AppCommon._isEmpty(opt_message)){
            opt_message = $("#" + templateId + " .error-text ." + errorCode).html();
        }
        var message = opt_message || self.messages.TECHNICAL;
        this._renderCustomBlock(templateId, errorDivPrefix, message);
    },

    /**
     *
     * @param templateId
     * @param errorDivPrefix
     * @param errorCode
     * @param options : {
     *  errorCode : error code obtained from server or from client
     *  message : message to show in error block, message will precced errorCode message.
     *  fadeOutTime : timer after which message block will go away
     * }
     */
    showCustomFadeOutBlockError : function(templateId, errorDivPrefix,options){
        this.showCustomBlockError(templateId, errorDivPrefix, options["errorCode"], options["message"]);
        var fadeOutTime = options["fadeOutTime"] || 20000;
        $("#" + templateId + " #" + errorDivPrefix + "-generic-error").delay(fadeOutTime).fadeOut('fast');
    },

    _renderCustomBlock: function (templateId, errorDivPrefix, message) {
        var errorDOM = $("#" + templateId + " #" + errorDivPrefix + "-generic-error");
        errorDOM.html(genericErrorTemplate(message)).fadeIn();
    },

    storeAndLogout: function () {
        App.extensions._logout(true);
    }
};

function genericErrorTemplate(message) {
    var startDiv = '<div class="alert alert-danger">';
    var dismissButton = '<button type="button" class="close" data-dismiss="alert" aria-hidden="true">&times;</button>';
    var messageBox = '<span>' + message + '</span>';
    var endDiv = '</div>';
    return startDiv + dismissButton + messageBox + endDiv;
}



_.extend(AppClass, {
    GenericError: Errors
});

})();
