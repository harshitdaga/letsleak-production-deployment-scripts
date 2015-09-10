#!/bin/bash

V_HOME_PATH=`echo $HOME`;
V_PROFILE_PATH=$V_HOME_PATH"/.profile";


# Creating a user with admin privilages
#https://www.digitalocean.com/community/tutorials/initial-server-setup-with-ubuntu-14-04
#################################################
V_USER='hd'
V_USER_SSH="/home/$V_USER/.ssh";

adduser --gecos "" $V_USER
gpasswd -a $V_USER sudo
if [[ $? == 0 ]]; then
	mkdir $V_USER_SSH;
	touch $V_USER_SSH"/authorized_keys"
	chmod 700 $V_USER_SSH;
	chmod 600 $V_USER_SSH"/authorized_keys"
	#`cat .ssh/authorized_keys >> $V_USER_SSH/authorized_keys`
else
	echo "Adding user to group sudo failded! For user, $V_USER";
	exit;
fi 


# Setting up firewall
#https://www.digitalocean.com/community/tutorials/how-to-setup-a-firewall-with-ufw-on-an-ubuntu-and-debian-cloud-server
#################################################

sudo ufw status
sudo ufw disable

sudo ufw default deny incoming
sudo ufw default allow outgoing

sudo ufw allow ssh
sudo ufw show added
sudo ufw enable

sudo ufw status verbose



#log variables for nginx logs
echo "alias ERROR_NGINX_LOG='less /var/log/nginx/error.log'">>$V_PROFILE_PATH;
echo "alias ACCESS_NGINX_LOG='less /var/log/nginx/access.log'">>$V_PROFILE_PATH;
echo "alias NGINX_LOG='cd /var/log/nginx/'">>$V_PROFILE_PATH;
echo "alias CUSTOM_RESTART='service nginx stop;service nginx force-reload;service nginx start';">>$V_PROFILE_PATH;
echo 'echo "Reloading .profile"'>>$V_PROFILE_PATH;
. $V_PROFILE_PATH;
`. $V_PROFILE_PATH`;

cat $V_PROFILE_PATH
