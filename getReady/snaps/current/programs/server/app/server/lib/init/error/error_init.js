(function(){/*
 function Error(errorCode, errorReason) {
 var error = new Meteor.Error();
 error.error = errorCode;
 error.reason = errorReason;
 error.message = errorReason;
 console.log("Error Thrown " + error.stack );
 return  error;
 };

 Error.prototype = {
 constructor : Error,
 throwError : function(code,reason){
 throw new Error(code,reason)
 }
 }
 ThrowError = function(errorCode, errorReason) {
 var error = new Meteor.Error();
 error.error = errorCode;
 error.reason = errorReason;
 error.message = errorReason;
 //console.log("Error Thrown error : "+ errorCode + " reason : " + errorReason +  error.stack );
 console.log("Error Thrown " + error.stack );
 throw  error;
 };
 */
ThrowError = function (param) {
    var error = new Meteor.Error();
    error.error = param.code;
    error.reason = param.reason || param.message;    //TODO change all the errors message to reason
    error.reason = param.message;
    //error.message = param.message + "[" +param.code + "]";
    //console.log("Error Thrown " + error.stack );
    throw  error;
};

ReturnError = function(param){
    var error = new Meteor.Error();
    error.error = param.code;
    error.reason = param.reason;
    error.message = param.message;
    return error;
}

})();
