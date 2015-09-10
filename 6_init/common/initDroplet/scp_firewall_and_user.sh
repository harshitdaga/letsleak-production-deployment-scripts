source "do_ip";
echo "Attempting SCP @"$IP;
V_CURRENT_PATH=`pwd`;
V_COMMON_PATH=${V_CURRENT_PATH%/init/*}"/init/common";
scp $V_COMMON_PATH"/initDroplet/firewall_and_user.sh" root@$IP:;