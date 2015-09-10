V_ENTITIY='db/';
#installing git : not needed as will build locally
sudo apt-get install --yes --force-yes git

#cloning the repo
git clone https://dummy@bitbucket.org/dummy/production_db.git $V_ENTITIY

touch install.log;

#setting permissions
chmod 744 $V_ENTITIY -R
cd $V_ENTITIY"installation"
chmod 700 *.sh
chmod 700 lib

echo "(check logs @"$HOME"/install.log)";
echo "Installation in progress ... "
(./install.sh 2>&1) >> $HOME"/install.log" &
tail -f $HOME"/install.log"