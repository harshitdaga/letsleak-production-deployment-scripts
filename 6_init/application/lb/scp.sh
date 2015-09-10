source "do_ip";
echo "Attempting SCP @"$IP;
scp init_lb.sh username@$IP:;
