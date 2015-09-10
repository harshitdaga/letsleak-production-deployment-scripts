V_ENTITIY='lb/';
#installing git : not needed as will build locally
sudo apt-get install --yes --force-yes git

#cloning the repo
git clone https://dummy@bitbucket.org/dummy/production_lb.git $V_ENTITIY

#setting permissions
chmod 744 $V_ENTITIY -R
cd $V_ENTITIY
chmod 700 *.sh
chmod 700 lib

touch $HOME"/install.log";
echo "(check logs @"$HOME"/install.log)";
echo "Installation in progress ... "
(./install.sh 2>&1) >> $HOME"/install.log" &
tail -f $HOME"/install.log"
