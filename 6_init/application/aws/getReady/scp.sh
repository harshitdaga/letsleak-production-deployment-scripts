source "ec2_ip";
echo "Attempting SCP @"$IP;
scp -i devKP.pem init_getReady.sh ubuntu@$IP:;
