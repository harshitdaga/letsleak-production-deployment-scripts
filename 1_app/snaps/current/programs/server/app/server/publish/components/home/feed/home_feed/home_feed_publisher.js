(function(){/*****************************************************************************/
/* HomeFeed Publish Functions
 *       This publisher returns top 'x' feeds present in c_status collection
 *       irrespective of there category
 */
/*****************************************************************************/

//TODO check subscriber is authenticated or not
var feed_limit = 100;

//depreciate
/*Meteor.publish('home_feedq', function (param) {
    var self = this;
    //var connectionObj = self.connection;
    //console.log("home_feed got a connection");
    var mixFeed = AppCollection.Status.find(
        {
            $or: [
                {
                    "f_expires": false
                },
                {
                    "f_flagged" : false
                },
                {
                    $and: [
                        { "f_expires": true } ,
                        { "f_expiryTime": { $gte: Date.now() } }
                    ]
                }
            ]
        },
        {
            sort: { f_timeStamp: -1},
            limit: feed_limit
        }
    );
    return mixFeed;
});
*/

Meteor.publish('/home_feed/status_meta', function (request) {
    var self = this;
    //console.log("/home_feed/status_meta got a connection");

    //-- Status Message Meta Data --//
    var postMetaData = AppDataFetcher.StatusMeta.getPostArrayMetaData(request.data.postIdList);

    // -- User Status Message Meta Data -- //
    var userPostMetaData = AppCollection.UserStatusMeta.find({"_id": request.agent.userId});

    return [postMetaData, userPostMetaData];

});

})();
