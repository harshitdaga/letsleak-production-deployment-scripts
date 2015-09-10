
#installing git : not needed as will build locally
sudo apt-get install --yes --force-yes git

#cloning the repo
git clone https://dummy@bitbucket.org/dummy/production_admin.git admin

#setting permissions
chmod 744 admin/ -R
cd admin
chmod 700 *.sh
chmod 700 lib

#touch $HOME"/app/log/install.log";
echo "(check logs @"$HOME"/admin/log/install.log)";
echo "Installation in progress ... "
(./install.sh 2>&1) >> $HOME"/admin/log/install.log" &
tail -f $HOME"/admin/log/install.log"
