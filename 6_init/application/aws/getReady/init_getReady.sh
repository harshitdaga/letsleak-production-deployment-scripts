
#installing git : not needed as will build locally
sudo apt-get install --yes --force-yes git

#cloning the repo
git clone https://dummy@bitbucket.org/dummy/production_getready.git getReady

#setting permissions
chmod 744 getReady/ -R
cd getReady
chmod 700 *.sh
chmod 700 lib

echo "DONE"
#touch $HOME"/getReady/log/install.log";
#echo "(check logs @"$HOME"/getReady/log/install.log)";
#echo "Installation in progress ... "
#(./install.sh 2>&1) >> $HOME"/getReady/log/install.log" &
#tail -f $HOME"/getReady/log/install.log"