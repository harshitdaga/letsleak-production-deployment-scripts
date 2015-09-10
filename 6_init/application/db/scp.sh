source "do_ip";
echo "Attempting SCP @"$IP;
scp init_db.sh username@$IP:;
