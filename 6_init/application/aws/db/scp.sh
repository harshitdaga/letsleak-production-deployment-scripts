source "ec2_ip";
echo "Attempting SCP @"$IP;
scp -i prodKP.pem init_db.sh ubuntu@$IP:;
