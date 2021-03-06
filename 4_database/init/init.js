db.c_status.ensureIndex( { f_timestamp:-1,f_expires:1 , f_flagged:1 , f_is_deleted:1, f_expiryTime:-1} );
db.c_status.ensureIndex( { f_timestamp:-1, f_author:1 });

db.c_status_comment.ensureIndex({f_timestamp:-1,f_postId:1, f_type:1, f_userId:1});

db.c_user_status_comment.ensureIndex({postId:1 , userId:1});

db.c_notification_instant.ensureIndex({f_userId:1,f_archived:1, f_notify_type:1, f_timestamp:-1});

db.c_notification_inbox.ensureIndex({f_userId:1});

db.c_bucket.ensureIndex({"f_bucket.f_access":1,f_timestamp : -1});
db.c_bucket.ensureIndex({"f_bucket.f_access":1,f_timestamp : -1,f_userId:1});

db.c_user_bucket.ensureIndex({f_userId:1});


//creating collection
db.createCollection("c_filter_meta");
db.createCollection("c_filter_data");
db.createCollection("c_filter_data_log");