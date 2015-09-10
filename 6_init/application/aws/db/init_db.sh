
#installing git : not needed as will build locally
sudo apt-get install --yes --force-yes git

#cloning the repo
git clone https://redace@bitbucket.org/redace/production_db.git db

touch install.log;

#setting permissions
chmod 744 db/ -R
cd db/installation
chmod 700 *.sh
chmod 700 lib

echo "(check logs @"$HOME"/install.log)";
echo "Installation in progress ... "
(./install.sh 2>&1) >> $HOME"/install.log" &
tail -f $HOME"/install.log"