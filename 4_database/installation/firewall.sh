#!/bin/bash
# Setting up firewall
#https://www.digitalocean.com/community/tutorials/how-to-setup-a-firewall-with-ufw-on-an-ubuntu-and-debian-cloud-server
#http://manpages.ubuntu.com/manpages/trusty/man8/ufw.8.html
#################################################

echo -ne "Enter APP PRIVATE IP [ENTER]: "
read V_APP_PRIVATE_IP

sudo ufw status

#sudo ufw allow www from <lb-ip>
sudo ufw allow from $V_APP_PRIVATE_IP to any port 80 proto tcp

sudo ufw enable

sudo ufw status verbose
