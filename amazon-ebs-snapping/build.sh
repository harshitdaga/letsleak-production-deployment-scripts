#! /bin/bash
#Functions
setFGColor(){
	echo -n "$(tput setaf $1)"
}
setBGColor(){
	echo "$(tput setab $1)"	
}
resetColor(){
	echo -e "$(tput sgr0)"
}
info(){
	setFGColor $2
	echo $1 $3
}

#Block checks for an argument to be present
# can be -d : dev bundling / -p : production bundling
if [ $# -eq 0 ]; then
    info -e 1 "No arguments supplied"
    reset
    exit
else
	DEPLOY_ENV=$1	
	if [[ $DEPLOY_ENV == '-p' ]]; then
		echo "Preparing production bundling";
	elif [[ $DEPLOY_ENV == '-d' ]]; then
		echo "Preparing dev bundling";
	else
		info -e 1 "Invalid argument"
		reset
		exit 
	fi
fi

# including properties needed for execution
source "./lib/.build.properties";
source "./user.properties"

#setting bg color to black
setBGColor 0	
setFGColor 2
echo "Starting build process"
echo "======================"

#################################################
# checking is current_version file present or not
# if not create one
if [ ! -f $CURRENT_VERSION_FILE_PATH ]; then
	echo $VERSION > $CURRENT_VERSION_FILE_PATH
fi

#reading the current version 
CURRENT_VERSION=$(head -n 1 $CURRENT_VERSION_FILE_PATH);

# if building for production increase the build version by number given by user
if [ $DEPLOY_ENV == "-p" ]; then
	#let "VERSION += $VERSION_INC_COUNT"
	cat $CURRENT_VERSION_FILE_PATH >> $PREVIOUS_VERSION_FILE_PATH
	echo $CURRENT_VERSION + $VERSION_INC_COUNT | bc > $CURRENT_VERSION_FILE_PATH
fi

info -ne 3 "Reading current version for snapshot"
CURRENT_VERSION=$(head -n 1 $CURRENT_VERSION_FILE_PATH);
info -e 2 "\t[DONE]\nCurrent snapshot version :"$CURRENT_VERSION;
echo ""

#################################################
#checking if codebase directory is present or not
#if not then checkout the code under this dir
info -e 3 "Checking directories"
info -ne 3 "\t'$CODE_DIR'"
CODE_DIR_EXISTS=false
if [ ! -d $CODE_DIR ]; then
	info -e 1 "\t\t\t\t[NOT PRESENT]"
	info -ne 2 "\t\tcreating $CODE_DIR ... "
	mkdir $CODE_DIR
	info -e 2 "\t[DONE]"
else 
	CODE_DIR_EXISTS=true
	info -e 2 "\t\t\t\t[PRESENT]"
fi

CURRENT_BUNDLE_DIR=$BUNDLE_DIR"/"$CURRENT_VERSION
info -ne 3 "\t'$CURRENT_BUNDLE_DIR'"
if [ ! -d $CURRENT_BUNDLE_DIR ]; then
	info -e 1 "\t\t\t[NOT PRESENT]"
	info -ne 2 "\t\tcreating $CURRENT_BUNDLE_DIR ... "
	mkdir -p $CURRENT_BUNDLE_DIR
	info -e 2 "\t[DONE]"
else 
	info -e 2 "\t\t\t[PRESENT]"
fi

CURRENT_SNAPSHOT_DIR=$SNAPSHOT_DIR"/"$CURRENT_VERSION
info -ne 3 "\t'$CURRENT_SNAPSHOT_DIR'"
if [ ! -d $CURRENT_SNAPSHOT_DIR ]; then
	info -e 1 "\t\t\t[NOT PRESENT]"
	info -ne 2 "\t\tcreating $CURRENT_SNAPSHOT_DIR ... "
	mkdir -p $CURRENT_SNAPSHOT_DIR
	info -e 2 "\t[DONE]"
else 
	info -e 2 "\t\t\t[PRESENT]"
fi
echo ""

# #################################################
# # updating / checkout code from repository
# if [ $CODE_DIR_EXISTS = true ]; then
# 	#pull
# 	info -e 3 "Updating git repo"
# 	setFGColor 2
# 	git --git-dir=codebase/.git pull
# else
# 	#checking out repo
# 	info -e 3 "Checking out git repo"
# 	setFGColor 2
# 	git clone $GIT_PATH $CODE_DIR
# fi

# #This will print 0 if everything worked just fine. 
# #If for example the folder is not a git repository you will get the exit code 128.
# git_result=$?
# if [[ $git_result != 0 ]]; then
# 	info -e 1 "Some thing wrong happend please refer the above cause, fix it and re-run the script."
# 	echo "Try to remove the directory $CODE_DIR and re-run the script"
# 	reset
# 	exit
# fi
# echo ""

#################################################
# running demeteorizer for bundling
info "" 3 "Bundling up using demeteorizer"
setFGColor 2
cd $CODE_DIR"/"$METEOR_CODEBASE_PATH
#demeteorizer
cd -
echo "Moving Output to $CURRENT_BUNDLE_DIR"
rm -fR "./"$CURRENT_BUNDLE_DIR 
mv -f "./"$CODE_DIR"/"$METEOR_CODEBASE_PATH"/.demeteorized" "./"$CURRENT_BUNDLE_DIR

if [ $? != 0 ]; then
	info "" 1 "Error occurred while moving the demeteorized generated bundle."
	echo "Please fix the issue and re-run the script."
	reset
	exit
fi
echo ""

#################################################
# add .ebextensions to new bundle
info -ne 3 "Including .ebextensions"
cp -r $TEMPLATE_PATH".ebextensions" $CURRENT_BUNDLE_DIR
cp $TEMPLATE_PATH"package.json" $CURRENT_BUNDLE_DIR
info -e 2 "\t\t\t[DONE]"
echo ""

#################################################
# creating a zip file of the bundle
info -ne 3 "Creating snapshot for ebs"
ZIP_FILE=$ZIP_FILE_NAME"_"$CURRENT_VERSION".zip"
zip -r $ZIP_FILE $CURRENT_BUNDLE_DIR > ".dump"
zip -d $ZIP_FILE "__MACOSX/*" > ".dump"
info -e 2 "\t\t[DONE]"
info -e 2 "Snapshot ($ZIP_FILE) is available at $CURRENT_SNAPSHOT_DIR"
rm -f ".dump"
mv $ZIP_FILE $CURRENT_SNAPSHOT_DIR

#################################################
#reset all attributes
resetColor
echo "DONE!"


#Black	0
#Red	1
#Green	2
#Yellow	3
#Blue	4
#Magenta5
#Cyan	6
#White	7