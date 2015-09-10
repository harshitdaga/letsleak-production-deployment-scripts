(function(){var Invitation = new Meteor.Collection('c_beta_account_invitation');
var log = AppLogger.getLogger(AppLogger.loggerName.INDEX_DAO_LOGGER);
/*****************************************************************************/
/* Invitation Collection : Query Methods */
/*****************************************************************************/

/**
 * Functions checks for an email id if not present or not registered then add and entry
 * to c_invitation table else throw DUPLICATE error
 * @param emailId
 * @returns {*}
 * ---------------------------------------------------------------------------------------
 */
Invitation.addInvite = function (emailId) {
    var code = generateInviteCode();
    var data = {
        _id: emailId,
        inviteCode: code,
        timeStamp: Date.now(),
        isRegistered: false
    };
    var result = null;
    var emailEntry = this.isEmailPresentOrRegistered(emailId);
    if (!emailEntry.isPresent /*|| (emailEntry.isPresent && !emailEntry.isRegistered)*/) {
        result = Invitation.update(
            {_id: emailId},
            data,
            { upsert: true}
        );
    } else {
        //Email id is already used to create an account
        log.error("Duplicate email id : " + emailId);
        ThrowError(AppError.DB_DUPLICATE);
    }
    return result;
};

/**
 * Function returns one row (if exist else undefinded) which matchs with given email id.
 * @param emailId
 * @returns c_invitation document
 * ---------------------------------------------------------------------------------------
 */
Invitation.getRecord = function (emailId) {
    return Invitation.findOne({"_id": emailId});
};

/**
 * This function checks for email id in c_invitation collection
 * If email is present and is Registered
 *      return isPresent : true, isRegistered : true
 * Else if email is present and is not Registered
 *      return isPresent : true, isRegistered : false
 * Else
 *      return isPresent : false, isRegistered : false
 * @param emailId
 * ---------------------------------------------------------------------------------------
 */
Invitation.isEmailPresentOrRegistered = function (emailId) {
    var response = {
        isPresent: false,
        isRegistered: false
    };

    var result = Invitation.findOne({"_id": emailId});
    if (!_.isUndefined(result)) {
        //we have this email id already in our records.
        response.isPresent = true;
        if (result.isRegistered) {
            response.isRegistered = true;
        }
    }
    return response;
};

Invitation.isRegistered = function (inviteCode) {
    var response = {
        isRegistered: null,
        isVaild: false
    };
    var result = Invitation.findOne({"inviteCode": inviteCode});
    if (!_.isUndefined(result)) {
        //we have this invite code used by some email id.
        response.isVaild = true;
        if (result.isRegistered) {
            response.isRegistered = true;
        } else {
            response.isRegistered = false;
        }
    }
    return response;
};

Invitation.getRecordViaInviteCode = function (inviteCode, isReactive) {
    if (isReactive) {
        return Invitation.find(
            {"inviteCode": inviteCode},
            {fields: {_id: 0, timeStamp: 0}}
        );
    } else {
        return Invitation.find(
            {"inviteCode": inviteCode},
            {reactive: false},
            {fields: {_id: 0, timeStamp: 0}}
        );
    }
};

Invitation.markRegistered = function (inviteCode) {
    var result = false;
    try {
        Invitation.update(
            {inviteCode: inviteCode},
            {
                $set: {"isRegistered": true}
            }
        );
        result = true;
    } catch (error) {
        /**
         * TODO do log this error as its important and need to be manually handled
         * in case account got registered and not maked as registred in c_invitation
         */
        console.error("error in marking registered");
        result = false;
    }

    return result;
};
/*****************************************************************************/
/* Invitation Collection : Permissions */
/*****************************************************************************/
Invitation.allow({
    insert: function (userId, doc) {
        return false;
    },

    update: function (userId, doc, fieldNames, modifier) {
        return false;
    },

    remove: function (userId, doc) {
        return false;
    }
});

Invitation.deny({
    insert: function (userId, doc) {
        return false;
    },

    update: function (userId, doc, fieldNames, modifier) {
        return false;
    },

    remove: function (userId, doc) {
        return false;
    }
});


function generateInviteCode() {
    return Meteor.uuid();
}
_.extend(AppCollection, {
    Invitation: Invitation
});

})();
