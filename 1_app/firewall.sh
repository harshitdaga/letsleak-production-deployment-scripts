#!/bin/bash
# Setting up firewall
#https://www.digitalocean.com/community/tutorials/how-to-setup-a-firewall-with-ufw-on-an-ubuntu-and-debian-cloud-server
#https://help.ubuntu.com/community/UFW
#################################################

echo -ne "Enter LB PRIVATE IP [ENTER]: "
read V_LB_PRIVATE_IP

sudo ufw status

#sudo ufw allow www from <lb-ip>
sudo ufw allow from $V_LB_PRIVATE_IP to any port 80 proto tcp

sudo ufw enable

sudo ufw status verbose