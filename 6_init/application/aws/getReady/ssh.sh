source "ec2_ip";
echo "Attempting SSH @"$IP;
ssh -i devKP.pem ubuntu@$IP;