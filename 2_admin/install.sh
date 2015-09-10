#!/bin/bash

#including helper functions to change color text etc..
source "./lib/helper.sh"

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
V_HOME_PATH=`echo $HOME`;
V_PROFILE_PATH=$V_HOME_PATH"/.profile";
setTitle "Reloading bash environment @"$V_HOME_PATH;
. $V_PROFILE_PATH

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
#echo "nodejs -v:"
#nodejs -v

#installing npm
#setTitle "Installing npm"
#sudo apt-get install --yes --force-yes npm

#installing nodejs-lecacy for debain else will be getting below error while installing fibers or other packages
#
#sh: 1: node: not found
#npm WARN This failure might be due to the use of legacy binary "node"
#npm WARN For further explanations, please read
#/usr/share/doc/nodejs/README.Debian
#npm ERR! weird error 127
#npm ERR! not ok code 0
#setTitle "Installing nodejs-legacy"
#sudo apt-get install nodejs-legacy

#installing fibers
#setTitle "Installing fibers@1.0.1"
#sudo npm install -g fibers@1.0.1
#npm install fibers@1.0.1

#setTitle "Installing packages"
#sudo npm install -g winston@0.7.3
#npm install -g winston@0.7.3

#installing meteor
#setTitle "Installing meteor"
#curl https://install.meteor.com/ | sh

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
V_NGINX_CONFIG_PATH=$V_HOME_PATH"/admin/lib/nginx.conf"
sudo cp /etc/nginx/nginx.conf /etc/nginx/nginx.conf_ori
sudo cp $V_NGINX_CONFIG_PATH /etc/nginx/

#setting the host ip in nginx.conf file
V_HOST_IP=`ec2metadata --public-ipv4`;
setTitle "replacing HOST_IP="$V_HOST_IP;
sudo sed -i 's/#HOST_IP#/'$V_HOST_IP'/' /etc/nginx/nginx.conf

#copying serverIndex files
setTitle "Copying serverIndex directory"
V_SERVER_DIR_PATH=$V_HOME_PATH"/admin/snaps/serverIndex"
sudo mv $V_SERVER_DIR_PATH /usr/share/nginx/html/
sudo chmod -R 755 /usr/share/nginx/html/serverIndex/
sudo chown -R root: /usr/share/nginx/html/serverIndex/


#doing npm install
V_SNAP_CURRENT_PATH=$V_HOME_PATH"/admin/snaps/current";
V_PROG_SERVER_PATH=$V_SNAP_CURRENT_PATH"/programs/server";
cd $V_PROG_SERVER_PATH
setTitle "npm install @"`pwd`
npm install

#going back to admin/snaps/current and running npm update to install packages
cd $V_SNAP_CURRENT_PATH;
setTitle "Running npm update @"`pwd`
npm update
npm install winston@0.7.3

#setting the environment variables
cd $V_HOME_PATH"/admin";
setTitle "Setting environment variables @"`pwd`
source "./lib/bash.properties"
echo "#METEOR ENVIRONMENT VARIABLES">>$V_PROFILE_PATH;
echo "export ROOT_URL="$ROOT_URL>>$V_PROFILE_PATH;
echo "export MONGO_URL="$MONGO_URL>>$V_PROFILE_PATH;
echo "export ENV_VARIABLE="$ENV_VARIABLE>>$V_PROFILE_PATH;
echo "export MAIL_URL="$MAIL_URL>>$V_PROFILE_PATH;

#log variables for nginx logs
echo "alias ERROR_NGINX_LOG='less /var/log/nginx/error.log'">>$V_PROFILE_PATH;
echo "alias ACCESS_NGINX_LOG='less /var/log/nginx/access.log'">>$V_PROFILE_PATH;
echo "alias NGINX_LOG='cd /var/log/nginx/'">>$V_PROFILE_PATH;

cat $V_PROFILE_PATH

setTitle "Reloading profile"
. $V_PROFILE_PATH;

#restarting passenger
#setTitle "Restarting passenger"
#touch /tmp/restart.txt

setTitle "Restarting nginx"
sudo service nginx restart

#open ports
setTitle "Open ports"
sudo netstat -ntlp | grep LISTEN

