#!/bin/bash

# including properties needed for execution
source "./lib/helper/config.properties";

#including helper functions to change color text etc..
source "./lib/helper/helper.sh"

#setting bg color to black
setBGColor 0	
setFGColor 2

#Variables
#################################################
V_VERSION_LOG='versionLog.txt'; 
V_BASE_PATH=`pwd`;
V_LIB_PATH=$V_BASE_PATH"/lib";
#Block checks for an argument to be present
# can be -d : dev bundling / -p : production bundling
if [ $# -eq 0 ]; then
    setErrorInfo "No arguments supplied, help: -d or -p"
    reset
    exit
else
	V_DEPLOY_ENV=$1	
	if [[ $V_DEPLOY_ENV == '-p' ]]; then
		setTitle "Preparing production bundling";
		V_BUILD_TYPE="PRODUCTION";
	elif [[ $V_DEPLOY_ENV == '-d' ]]; then
		setTitle "Preparing dev bundling";
		V_BUILD_TYPE="DEV";
	else
		setErrorInfo "Invalid argument"
		reset
		exit 
	fi
fi

#reading the current version 
#################################################
V_CURRENT_VERSION=$(head -n 1 $CURRENT_VERSION_FILE_PATH);

# if building for production increase the build version by number given in config file
if [ $V_DEPLOY_ENV == "-p" ]; then
	cat $CURRENT_VERSION_FILE_PATH >> $PREVIOUS_VERSION_FILE_PATH
	echo $V_CURRENT_VERSION + $VERSION_INC_COUNT | bc > $CURRENT_VERSION_FILE_PATH
fi

setInfo "Reading current version for snapshot"
V_CURRENT_VERSION=$(head -n 1 $CURRENT_VERSION_FILE_PATH);
setInfo "\nCurrent snapshot version : "$V_CURRENT_VERSION;
endInfo "[DONE]";


#checking if codebase directory is present or not
#if not then checkout the code
#################################################
setTitle "Checking directories"
setInfo "Checking codebase @'$CODE_DIR'"
V_CODE_DIR_EXISTS=false
if [ ! -d $CODE_DIR ]; then
	setErrorInfo "\t\t[NOT PRESENT]"
	setInfo "creating $CODE_DIR \t"
	mkdir -p $CODE_DIR
	endInfo "[DONE]"
else 
	V_CODE_DIR_EXISTS=true
	endInfo "[PRESENT]"
fi

#setInfo "Deleting bundle @'$BUNDLE_DIR'"
#rm -fR $BUNDLE_DIR;
#endInfo "[DONE]";
	
#Moving the current version to old 
#and new app bundle will be deployed in current using below code
if [ "$(ls -A $CURRENT_DIR)" ]; then
	setInfo "Removing app from $CURRENT_DIR"
	mv $CURRENT_DIR $HOME'/.Trash';
	endInfo "[DONE]";	
else
	setInfo "Ntn to remove from @"$CURRENT_DIR;
	endInfo "[DONE]";	
fi

# updating / checkout code from repository
# #################################################
setTitle "Processing repo";
if [ $V_CODE_DIR_EXISTS = true ]; then
	#pull
	setInfo "Updating git repo"
	endInfo "[STARTING]"
	setFGColor 2
	cd $CODE_DIR
	git pull origin master
	git clean -df
	cd - >> /dev/null
else
	#checking out repo
	echo "Checking out git repo"
	setFGColor 2
	git clone $GIT_PATH $CODE_DIR
fi

#This will print 0 if everything worked just fine. 
#If for example the folder is not a git repository you will get the exit code 128.
git_result=$?
if [[ $git_result != 0 ]]; then
	setErrorInfo "\nSome thing wrong happend please refer the above cause, fix it and re-run the script."
	echo "Try to remove the directory $CODE_DIR and re-run the script"
	reset
	exit
fi
echo ""


# running demeteorizer for bundling
#################################################
setTitle "Building"
setInfo "Bundling up using demeteorizer"
endInfo "[STARTING]"
setFGColor 2
cd $CODE_DIR"/"$METEOR_CODEBASE_PATH

V_METEOR_VERSION=$(head -n 1 .meteor/release);
V_METEOR_VERSION=`echo ${V_METEOR_VERSION/*@/}`;

demeteorizer -a LetsLeak -r $V_METEOR_VERSION;

setTitle "Adding git info in logs"
V_VERSION_LOG_FILE=$V_LIB_PATH"/"$V_VERSION_LOG;
`echo "$V_BUILD_TYPE BUILD" >> $V_VERSION_LOG_FILE`
`echo -------------------------------------------------- >> $V_VERSION_LOG_FILE`
`echo VERSION $V_CURRENT_VERSION >> $V_VERSION_LOG_FILE`
`echo DATE >> $V_VERSION_LOG_FILE`
`DATE >> $V_VERSION_LOG_FILE`
`echo "" >> $V_VERSION_LOG_FILE`
`echo GIT COMMIT >> $V_VERSION_LOG_FILE`
`git log --graph --decorate=no -n 1 >> $V_VERSION_LOG_FILE`
`echo "" >> $V_VERSION_LOG_FILE`
`echo "" >> $V_VERSION_LOG_FILE`


cd -
setInfo "\nMoving Output to "$CURRENT_DIR;
mv -f $CODE_DIR"/"$METEOR_CODEBASE_PATH"/.demeteorized/" $CURRENT_DIR

if [ $? != 0 ]; then
	setErrorInfo "\nError occurred while moving the demeteorized generated bundle."
	echo "Please fix the issue and re-run the script."
	reset
	exit
fi

mkdir -p $CURRENT_DIR"/tmp";
touch $CURRENT_DIR"/tmp/restart.txt";
mkdir -p $CURRENT_DIR"/logs";
touch $CURRENT_DIR"/logs/logs.txt"
chmod 755 $CURRENT_DIR;

endInfo ["DONE"];
#################################################
#reset all attributes
setTitle "DONE!"
resetColor