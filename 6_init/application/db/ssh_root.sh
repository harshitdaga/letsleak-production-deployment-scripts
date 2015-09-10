source "do_ip";
echo "Attempting SSH @"$IP;
V_CURRENT_PATH=`pwd`;
V_COMMON_PATH=${V_CURRENT_PATH%/init/*}"/init/common";
ssh root@$IP;