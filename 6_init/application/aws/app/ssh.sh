source "ec2_ip";
echo "Attempting SSH @"$IP;
ssh -i prodKP.pem ubuntu@$IP;