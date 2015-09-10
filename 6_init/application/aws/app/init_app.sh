
#installing git : not needed as will build locally
sudo apt-get install --yes --force-yes git

#cloning the repo
git clone https://dummy@bitbucket.org/dummy/production_app.git app
touch install.log
#setting permissions
chmod 744 app/ -R
cd app
chmod 700 *.sh
chmod 700 lib

#touch $HOME"/app/log/install.log";
echo "(check logs @"$HOME"/install.log)";
echo "Installation in progress ... "
#(./install.sh 2>&1) >> $HOME"/app/log/install.log" &
(./install.sh 2>&1) >> $HOME"/install.log" &
tail -f $HOME"/install.log"
