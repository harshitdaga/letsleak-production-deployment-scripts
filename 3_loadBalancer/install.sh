#!/bin/bash

#################################################
#	VARIABLES
#################################################
V_HOME_PATH=`echo $HOME`;
V_PROFILE_PATH=$V_HOME_PATH"/.profile";
V_ENTITY='lb';
V_HOST_IP=`ifconfig eth0 | grep 'inet addr' | awk '{print substr($2,6);}'`;
V_LIB_PATH=$V_HOME_PATH"/"$V_ENTITY"/lib";
V_LIB_NGINX_MODULES=$V_LIB_PATH"/modules";
V_LIB_NGINX_FILES=$V_LIB_PATH"/nginx";
V_NGNIX_PATH="/usr/local/nginx";

#################################################
#	INCLUDE
#################################################
#including helper functions to change color text etc..
source "./lib/helper.sh"

#################################################
#	SYSTEM UPDATE
#################################################
setTitle "UBUNTU Version"
lsb_release -a

#upgrading the system
sudo apt-get --yes --force-yes upgrade

#https://github.com/creationix/nvm#install-script
#updating system
setTitle "Updating System"
sudo apt-get --yes --force-yes update

#https://www.digitalocean.com/community/tutorials/how-to-compile-nginx-from-source-on-a-centos-6-4-x64-vps
#Modules http://wiki.nginx.org/Nginx3rdPartyModules
sudo apt-get --yes --force-yes install build-essential zlib1g-dev libpcre3-dev libssl-dev libxslt1-dev libxml2-dev libgd2-xpm-dev libgeoip-dev libgoogle-perftools-dev libperl-dev
#################################################
#	DOWNLOADING MODULE
#################################################
#https://bitbucket.org/nginx-goodies/nginx-sticky-module-ng
setTitle "Downloading Module nginx-sticky-module-ng";
git clone https://bitbucket.org/nginx-goodies/nginx-sticky-module-ng.git $V_LIB_NGINX_MODULES"/nginx-sticky-module-ng";

#################################################
# DOWNLOAD & UNTAR
#################################################
V_NGINX_VERSION="nginx-1.6.2";
wget http://nginx.org/download/$V_NGINX_VERSION.tar.gz
tar -xzf $V_NGINX_VERSION.tar.gz
ln -sf $V_NGINX_VERSION nginx

#################################################
#	CONFIGURE & INSTALL
#################################################
cd nginx;
./configure \
--with-http_gzip_static_module        \
--with-http_stub_status_module        \
--with-http_ssl_module                \
--with-pcre                           \
--with-file-aio                       \
--with-http_realip_module             \
--with-ipv6                           \
--with-debug   						  \
--with-pcre-jit 					  \
--with-http_addition_module     	  \
--with-http_dav_module  			  \
--with-http_geoip_module        	  \
--with-http_image_filter_module 	  \
--with-http_spdy_module 			  \
--with-http_sub_module  			  \
--with-http_xslt_module 			  \
--with-mail     					  \
--with-mail_ssl_module  			  \
--without-http_scgi_module            \
--without-http_uwsgi_module           \
--without-http_fastcgi_module         \
--add-module=$V_LIB_NGINX_MODULES"/nginx-sticky-module-ng"

sudo make
sudo make install

#Adding script to init.d
cp $V_LIB_NGINX_FILES"/nginx.init" /etc/init.d/nginx

# made executable so that we can use it via 'service nginx '
chmod +x /etc/init.d/nginx

#################################################
#	OVERRIDING DEFAULT FILES
#################################################
#updating nginx config file
setTitle "Copying nginx.config"
V_NGNIX_CONF_PATH=$V_NGNIX_PATH"/conf";
sudo cp $V_NGNIX_CONF_PATH"/nginx.conf" $V_NGNIX_CONF_PATH"/nginx.conf_ori"
sudo cp $V_LIB_PATH"/nginx/nginx.conf" $V_NGNIX_CONF_PATH;

#adding ip-list directory
setTitle "Creating ip-list directory"
sudo mkdir $V_NGNIX_CONF_PATH"/ip-list";
sudo cp $V_LIB_PATH"/nginx/allowips.conf" $V_NGNIX_CONF_PATH"/ip-list"
sudo cp $V_LIB_PATH"/nginx/blockips.conf" $V_NGNIX_CONF_PATH"/ip-list"
sudo cp $V_LIB_PATH"/nginx/blockips_all.conf" $V_NGNIX_CONF_PATH"/ip-list"

#updating default
setTitle "Copying default"
sudo mkdir $V_NGNIX_CONF_PATH"/sites-available";
sudo cp $V_LIB_PATH"/nginx/default" $V_NGNIX_CONF_PATH/sites-available

#setting the host ip in nginx.conf file
setTitle "replacing HOST_IP="$V_HOST_IP;
sudo sed -i 's/#HOST_IP#/'$V_HOST_IP'/' $V_NGNIX_CONF_PATH/nginx.conf
sudo sed -i 's/#HOST_IP#/'$V_HOST_IP'/' $V_NGNIX_CONF_PATH/sites-available/default

#copying serverIndex files
setTitle "Copying serverIndex files"
sudo mv "$V_LIB_PATH/indexFiles/"* $V_NGNIX_PATH/html/


#setting the environment variables
cd $V_HOME_PATH"/"$V_ENTITY;
setTitle "Setting environment variables @"`pwd`
#log variables for nginx logs
echo "alias NGINX_LOG='cd /usr/local/nginx/logs'">>$V_PROFILE_PATH;
echo "alias CUSTOM_RESTART='service nginx stop; service nginx start';">>$V_PROFILE_PATH;
echo "echo 'Reloading .profile'">>$V_PROFILE_PATH;

cat $V_PROFILE_PATH
setTitle "Reloading profile"
. $V_PROFILE_PATH;


setTitle "Restarting nginx"
sudo service nginx restart

#open ports
setTitle "Open ports"
sudo netstat -ntlp | grep LISTEN