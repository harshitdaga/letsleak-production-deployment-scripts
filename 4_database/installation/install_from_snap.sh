#!/bin/bash

# including properties needed for execution
source "./lib/deploy.properties";

#including helper functions to change color text etc..
source ./lib/helper.sh

#setting bg color to black
setBGColor 0	
setFGColor 2
setTitle "Starting installation process"

# creating db home path
V_DB_HOME_PATH=$DB_HOME"/"$MONGO_VERSION;

# removing the db home directory if existed
setInfo "Removing current db folder if existed @"$V_DB_HOME_PATH;
rm -fR $V_DB_HOME_PATH;
endInfo "[DONE]";


#creating the directory and untaring the snap
#++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
#NOTE : 
#	-C changes to the specified directory before unpacking (or packing). 
# 	--strip-components removes the specified number of directories from 
#	the filenames stored in the archive.
#Note that this is not really portable. GNU tar and at least some of the 
#BSD tars have the --strip-components option,but doesn't seem to exist 
#on other unix-like platforms.
#++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
setInfo "Extracting database installing  @"$V_DB_HOME_PATH"\n";
setFGColor 7
mkdir $V_DB_HOME_PATH && tar -zxvf $DB_PATH"/"$DB_SNAP -C $V_DB_HOME_PATH --strip-components 1;
setInfo "Database extraction"
endInfo "[DONE]";

#creating the data folder
setInfo "Creating data/db folder";
mkdir -p $V_DB_HOME_PATH"/data" $V_DB_HOME_PATH"/data/db";
endInfo "[DONE]";


#creating the log folder
setInfo "Creating log folder";
mkdir -p $V_DB_HOME_PATH"/log";
endInfo "[DONE]";

#exporting mongodb variables
#setInfo "Adding db and data dir"
#export DB_HOME=`pwd $V_DB_HOME_PATH"/bin"`;
#declare -x DB_DATA_DIRECTORY=`pwd $V_DB_HOME_PATH"/data/db"`;
#endInfo "[DONE]";

#setFGColor 7
#echo "DB_HOME="$DB_HOME;
#echo "DB_DATA_DIRECTORY="$DB_DATA_DIRECTORY;
#echo ""

#################################################
#reset all attributes
setTitle "DONE!"
resetColor