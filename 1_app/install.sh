#!/bin/bash

#including helper functions to change color text etc..
source "./lib/helper/helper.sh"
source "./lib/helper/bash.properties"

V_HOME_PATH=`echo $HOME`;
V_PROFILE_PATH=$V_HOME_PATH"/.profile";
V_ENTITY='app';
V_LIB_PATH=$V_HOME_PATH"/"$V_ENTITY"/lib";
V_HOST_IP=`ifconfig eth0 | grep 'inet addr' | awk '{print substr($2,6);}'`;
#################################################

#Taking input for Load balancer ips
echo -ne "Enter LB PUBLIC IP [ENTER]: "
read V_LB_PUBLIC_IP
echo -ne "Enter LB PRIVATE IP [ENTER]: "
read V_LB_PRIVATE_IP

echo "[LB] PUBLIC_IP: "$V_LB_PUBLIC_IP" PRIVATE_IP: "$V_LB_PRIVATE_IP;

#################################################
setTitle "UBUNTU Version"
lsb_release -a

#upgrading the system
sudo apt-get --yes --force-yes upgrade

#https://github.com/creationix/nvm#install-script
#updating system
setTitle "Updating System"
sudo apt-get --yes --force-yes update

#installing basic libraries for nvp
setTitle "Installing basic packages for nvp"
sudo apt-get install --yes --force-yes build-essential libssl-dev

#installing nvm
setTitle "Installing nvm"
curl https://raw.githubusercontent.com/creationix/nvm/v0.14.0/install.sh | bash

#reloading bash environment to make nvm reflecting in same session
setTitle "Reloading bash environment @"$V_HOME_PATH;
. $V_PROFILE_PATH;
`. $V_PROFILE_PATH`;

setTitle "Listing all node versions"
nvm ls-remote

setTitle "Installing node 0.10.29"
nvm install 0.10.29

nvm use 0.10.29
nvm alias default 0.10.29
nvm use default

setTitle "Node Version"
echo "node -v:"
node -v


################################################

#installing passenger 
setTitle "Installing passenger"
sudo apt-key adv --keyserver keyserver.ubuntu.com --recv-keys 561F9B9CAC40B2F7
sudo apt-get install --yes --force-yes apt-transport-https ca-certificates
sudo apt-get --only-upgrade install --yes --force-yes apt-transport-https

#adding passenger installation enteries into sources.list
V_PLIST="/etc/apt/sources.list.d/passenger.list";
sudo rm -f $V_PLIST;
sudo touch $V_PLIST;

#sudo -- sh -c "echo '##### !!!! Only add ONE of these lines, not all of them !!!! #####' >>"$V_PLIST;
#sudo -- sh -c "echo '# Ubuntu 14.04' >>"$V_PLIST;
sudo -- sh -c "echo 'deb https://oss-binaries.phusionpassenger.com/apt/passenger trusty main' >>"$V_PLIST;
cat $V_PLIST;

sudo chown root: /etc/apt/sources.list.d/passenger.list
sudo chmod 600 /etc/apt/sources.list.d/passenger.list

setTitle "Updating system"
sudo apt-get --yes --force-yes update

#After installing passenger, need to install nginx extras
setTitle "Installing nginx extras"
sudo apt-get install --yes --force-yes nginx-extras passenger


################################################
#updating nginx config file
setTitle "Copying nginx.config"
sudo cp /etc/nginx/nginx.conf /etc/nginx/nginx.conf_ori
sudo cp $V_LIB_PATH"/nginx/nginx.conf" /etc/nginx/

#updating default
setTitle "Copying default"
sudo cp /etc/nginx/sites-available/default /etc/nginx/sites-available/default_ori
sudo cp $V_LIB_PATH"/nginx/default" /etc/nginx/sites-available

#adding ip-list directory
setTitle "Creating ip-list directory"
sudo mkdir /etc/nginx/ip-list
sudo cp $V_LIB_PATH"/nginx/allowips.conf" /etc/nginx/ip-list
sudo cp $V_LIB_PATH"/nginx/blockips.conf" /etc/nginx/ip-list
sudo cp $V_LIB_PATH"/nginx/blockips_all.conf" /etc/nginx/ip-list


#setting the host ip in nginx.conf / default file
setTitle "replacing HOST_IP="$V_HOST_IP;
sudo sed -i 's/#HOST_IP#/'$V_HOST_IP'/' /etc/nginx/nginx.conf
sudo sed -i 's/#HOST_IP#/'$V_HOST_IP'/' /etc/nginx/sites-available/default

#setting the LB ip in nginx.conf file
setTitle "replacing LB_PUBLIC_IP="$V_LB_PUBLIC_IP" LB_PRIVATE_IP="$V_LB_PRIVATE_IP;
sudo sed -i 's/#LB_PUBLIC_IP#/'$V_LB_PUBLIC_IP'/' /etc/nginx/nginx.conf;
sudo sed -i 's/#LB_PRIVATE_IP#/'$V_LB_PRIVATE_IP'/' /etc/nginx/nginx.conf;


#copying serverIndex files
setTitle "Copying serverIndex files"
sudo mv "$V_LIB_PATH/index/"* /usr/share/nginx/html/

################################################
#doing npm install
V_SNAP_CURRENT_PATH=$V_HOME_PATH"/"$V_ENTITY"/snaps/current";
V_PROG_SERVER_PATH=$V_SNAP_CURRENT_PATH"/programs/server";
cd $V_PROG_SERVER_PATH
setTitle "npm install @"`pwd`
npm install

#going back to app/snaps/current and running npm update to install packages
cd $V_SNAP_CURRENT_PATH;
setTitle "Running npm update @"`pwd`
npm update
npm install winston@0.7.3

################################################
#setting the environment variables
cd $V_HOME_PATH"/"$V_ENTITY;
setTitle "Setting environment variables @"`pwd`
echo "#METEOR ENVIRONMENT VARIABLES">>$V_PROFILE_PATH;
echo "export ROOT_URL="$ROOT_URL>>$V_PROFILE_PATH;
echo "export MONGO_URL="$MONGO_URL>>$V_PROFILE_PATH;
echo "export ENV_VARIABLE="$ENV_VARIABLE>>$V_PROFILE_PATH;
echo "export REPORT_ABUSE_NOTIFICATION_COUNT="$REPORT_ABUSE_NOTIFICATION_COUNT>>$V_PROFILE_PATH;
echo "export REPORT_ABUSE_PUT_UNDER_REVIEW_COUNT="$REPORT_ABUSE_PUT_UNDER_REVIEW_COUNT>>$V_PROFILE_PATH;

#log variables for nginx logs
echo "alias APP_LOG='cd $V_HOME_PATH/app/snaps/current/logs'">>$V_PROFILE_PATH;
echo "alias CUSTOM_RESTART='sudo service nginx stop; sudo service nginx force-reload;sudo service nginx start';">>$V_PROFILE_PATH;
echo 'echo "Reloading .profile"'>>$V_PROFILE_PATH;
cat $V_PROFILE_PATH

setTitle "Reloading profile"
. $V_PROFILE_PATH;
`. $V_PROFILE_PATH`;

#restarting passenger
#setTitle "Restarting passenger"
#touch /tmp/restart.txt

setTitle "Restarting nginx"
sudo service nginx restart

#open ports
setTitle "Open ports"
sudo netstat -ntlp | grep LISTEN

