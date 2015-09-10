var db = connect("localhost:27017/admin");
var status = db.serverStatus();

print("\n++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++");
print("Local time : " + status.localTime);
print("uptime : " + status.uptime);
print("uptime estimated : " + status.uptimeEstimate);
print("ok : " + status.ok);
print("++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++\n");


print("Doing Initiating Replica Set\n");
rs.initiate();

print("\n\n++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++\n");
print("Replica Set Configuration\n");
var output = rs.conf();
printjson(output);

print("Replica Set Status\n");
output = rs.status();
printjson(output);

//Creating user on local database
//http://blog.mongolab.com/2014/07/tutorial-scaling-meteor-with-mongodb-oplog-tailing/

//only for 2.4 version
db = db.getSiblingDB('admin')
db.addUser({user: "oplogger", pwd: "oplogger!12345", roles: [], otherDBRoles: {local: ["read"]}})


db.exit;