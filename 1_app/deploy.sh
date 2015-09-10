git reset --hard
git pull

V_HOME_PATH=`echo $HOME`;
V_PROFILE_PATH=$V_HOME_PATH"/.profile";
. V_PROFILE_PATH;

sudo service nginx stop
sudo service nginx force-reload
sudo service nginx restart
sudo service nginx status