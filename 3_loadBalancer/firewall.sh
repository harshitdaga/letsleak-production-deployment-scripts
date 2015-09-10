#!/bin/bash

# Setting up firewall
#https://www.digitalocean.com/community/tutorials/how-to-setup-a-firewall-with-ufw-on-an-ubuntu-and-debian-cloud-server
#https://help.ubuntu.com/community/UFW
#################################################

sudo ufw status
sudo ufw disable

sudo ufw default deny incoming
sudo ufw default allow outgoing

sudo ufw allow ssh
sudo ufw allow 80/tcp

sudo ufw show added
sudo ufw enable

sudo ufw status verbose