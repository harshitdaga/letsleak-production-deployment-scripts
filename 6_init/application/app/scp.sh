source "do_ip";
echo "Attempting SCP @"$IP;
scp init_app.sh username@$IP:;
