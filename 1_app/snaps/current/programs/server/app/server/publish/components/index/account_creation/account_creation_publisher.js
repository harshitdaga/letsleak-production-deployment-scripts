(function(){/*****************************************************************************/
/* AccountCreationPublisher Publish Functions
 /*****************************************************************************/

Meteor.publish('/createAccount/isRegistered', function (request) {
    var self = this;
    //console.log("/createAccount/isRegistered got a connection");
    //TODO its acting as reactive even though mention to be non-reactive
    //do a method call to know the same.
    var invitation = AppCollection.Invitation.getRecordViaInviteCode(request.data.inviteCode, false);
    //console.log(invitation);
    return invitation;
});

})();
