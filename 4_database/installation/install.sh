#!/bin/bash

# ---------------------------------------------------------------------------------------------------
# installation instruction from http://docs.mongodb.org/manual/tutorial/install-mongodb-on-ubuntu/
# NOTE :
#	1. run MongoDB on 64-bit systems.
# ---------------------------------------------------------------------------------------------------

# including properties needed for execution
#source "./lib/deploy.properties";

MONGO_VERSION=2.4.11

#including helper functions to change color text etc..
source ./lib/helper.sh

#setting bg color to black
setBGColor 0	
setFGColor 2
setTitle "Starting installation process on ubuntu"


#import the key
setStartInfo "Importing the key";
sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv 7F0CEB10
setEndInfo "Importing the key";

#Create a list file for MongoDB
setStartInfo "Create a list file for MongoDB";
echo 'deb http://downloads-distro.mongodb.org/repo/ubuntu-upstart dist 10gen' | sudo tee /etc/apt/sources.list.d/mongodb.list
setEndInfo "Create a list file for MongoDB";

#Reload local package database.
setStartInfo "Reload local package database";
sudo apt-get update
setEndInfo "Reload local package database";


#Install mongodb package
#Latest version : sudo apt-get install -y mongodb-org
#Installing specific version
setStartInfo "Installing specific version version="$MONGO_VERSION;
#sudo apt-get install -y mongodb-org=$MONGO_VERSION mongodb-org-server=$MONGO_VERSION mongodb-org-shell=$MONGO_VERSION mongodb-org-mongos=$MONGO_VERSION mongodb-org-tools=$MONGO_VERSION
sudo apt-get install mongodb-10gen=$MONGO_VERSION
setEndInfo "Installing specific version version="$MONGO_VERSION;


#Although you can specify any available version of MongoDB, 
#apt-get will upgrade the packages when a newer version becomes available. 
#To prevent unintended upgrades, pin the package. To pin the version of 
#MongoDB at the currently installed version, issue the following command sequence:
setStartInfo "Pining the package";
#echo "mongodb-org hold" | sudo dpkg --set-selections
#echo "mongodb-org-server hold" | sudo dpkg --set-selections
#echo "mongodb-org-shell hold" | sudo dpkg --set-selections
#echo "mongodb-org-mongos hold" | sudo dpkg --set-selections
#echo "mongodb-org-tools hold" | sudo dpkg --set-selections

echo "mongodb-10gen hold" | sudo dpkg --set-selections
setEndInfo "Pining package";


#To start stop restart
#sudo service mongodb start/stop/restart


#reset all attributes
setStartInfo "MongoDB installed"
setFGColor 2
setStartInfo "Stopping the mongodb server to make configuration changes."
sudo service mongodb stop
#################################################

# ---------------------------------------------------------------------------------------------------
# ENVIRONMENT VARIABLE CHANGES
# ---------------------------------------------------------------------------------------------------

#Adding alias for log folder variable to 
V_HOME_PATH=`echo $HOME`;
V_PROFILE_PATH=$V_HOME_PATH"/.profile";
echo "#MONGODB ENVIRONMENT VARIABLES">>$V_PROFILE_PATH;
echo "alias MONGODB_LOG='cd /var/log/mongodb/'">>$V_PROFILE_PATH;
. $V_PROFILE_PATH;
setEndInfo "Setting alias in .profile";
setEndInfo "Reloading profile";

# ---------------------------------------------------------------------------------------------------
#http://docs.mongodb.org/manual/administration/production-notes/#recommended-configuration
# ---------------------------------------------------------------------------------------------------

setStartInfo "Kernel details.\nNOTE: it is recommended that you use Linux kernel version 2.6.36 or later."
uname -r
echo "Kernel_version.Major_revision_of_kernel.Minor_revision_of_kernel.Immediate_bug_fixing.generic"


#changing ulimit By default Amazon Linux uses ulimit settings that are not appropriate for MongoDB.
#http://docs.mongodb.org/ecosystem/platforms/amazon-ec2/
setStartInfo "Changing ulimit values"
sudo -- sh -c "echo 'soft nofile 64000' >> /etc/security/limits.conf";
sudo -- sh -c "echo 'hard nofile 64000' >> /etc/security/limits.conf";
sudo -- sh -c "echo 'soft nproc 32000' >> /etc/security/limits.conf";
sudo -- sh -c "echo 'hard nproc 32000' >> /etc/security/limits.conf";
setEndInfo "limits.conf"

sudo -- sh -c "echo 'soft nproc 32000' >> /etc/security/limits.d/90-nproc.conf";
sudo -- sh -c "echo 'hard nproc 32000' >> /etc/security/limits.d/90-nproc.conf";
setEndInfo "90-nproc.conf"


#checking the block device 
#Additionally, default read ahead settings on EC2 are not optimized for MongoDB. 
#As noted in the read-ahead settings from Production Notes, the settings should 
#be adjusted to read approximately 32 blocks (or 16 KB) of data. 
setEndInfo "Check block device"
df -T

setStartInfo "Expecting /dev/xvda1 to be the block device on Amazon, checking read-ahead setting value."
sudo blockdev --getra /dev/xvda1 

setStartInfo "The settings should be adjusted to read approximately 32 blocks (or 16 KB) of data"
sudo blockdev --setra 32 /dev/xvda1

setStartInfo "To make this change persistent across system boot"
echo 'ACTION=="add", KERNEL=="xvda1", ATTR{bdi/read_ahead_kb}="16"' | sudo tee -a /etc/udev/rules.d/85-ebs.rules


#Change the default TCP keepalive time to 300 seconds. See our troubleshooting page for details.
setStartInfo "Current Keep alive time"
cat /proc/sys/net/ipv4/tcp_keepalive_time

sudo -- sh -c "echo 300 > /proc/sys/net/ipv4/tcp_keepalive_time";

setEndInfo "keepalive time changed to 300 seconds"


# ---------------------------------------------------------------------------------------------------
# OPLOG ENABLING
# http://loosexaml.wordpress.com/2012/09/03/how-to-get-a-mongodb-oplog-without-a-full-replica-set/
# MongoDB oplog without a full replica set
#	The first setting, “replSet rs0″ tells you this will be a replica set node, 
#	which will allow you to run “rs.initiate()” from the mongo shell.  Doing so 
#	makes this into a single node replica set.  The name “rs0″ is complete arbitrary – call 
#	it whatever you want. 
# ---------------------------------------------------------------------------------------------------
setStartInfo "Adding replica set value to mongodb.conf";
sudo -- sh -c "echo replSet=rs0 >> /etc/mongodb.conf";
setEndInfo "replSet=rs0 added"

setStartInfo "Starting mongodb server"
sudo service mongodb status
sudo service mongodb start

setStartInfo "Initiating rs.initiate()"
mongo initOplog.js


setTitle "Installation ... DONE!"
setFGColor 1
echo "Make sure security group is properly configured for db instance!!!"
resetColor