(function(){/*****************************************************************************/
/* NotificationPublisher Publish Functions
/*****************************************************************************/

Meteor.publish('notification_publisher', function () {
  // you can remove this if you return a cursor
  this.ready();
});


Meteor.publish('notification', function (data) {
    var self = this;
    //console.log("notification got a connection");
    return AppDataFetcher.Notification.getNotification(data.agent.userId);
});


Meteor.publish('/notification/all', function (data) {
    var self = this;
    //console.log("/notification/all got a connection");
    return AppDataFetcher.Notification.getAllInstantNotification(data.agent.userId);
});

})();
