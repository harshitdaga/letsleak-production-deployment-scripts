#!/bin/bash

#################################################
#	VARIABLES
#################################################
V_HOME_PATH=`echo $HOME`;
V_PROFILE_PATH=$V_HOME_PATH"/.profile";
V_ENTITY='lb';
V_LIB_PATH=$V_HOME_PATH"/"$V_ENTITY"/lib";
V_LIB_NGINX_MODULES=$V_LIB_PATH"/modules";

#################################################
# DOWNLOAD & UNTAR
#################################################
V_NGINX_VERSION="nginx-x.x.x";
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