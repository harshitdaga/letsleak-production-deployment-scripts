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
setInfo(){
	setFGColor 3
	echo -ne $1
}
setErrorInfo(){
	setFGColor 1
	echo -e $1	
}
endInfo(){
	setFGColor 2
	echo -e "\t\t\t..."$1
	echo ""
}
setTitle(){
	setFGColor 3
	echo ""
	echo "--------------------------------------------"
	echo $1
	echo "--------------------------------------------"
}





#Black	0
#Red	1
#Green	2
#Yellow	3
#Blue	4
#Magenta5
#Cyan	6
#White	7