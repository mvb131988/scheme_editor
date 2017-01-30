<?php
	$element_type = $_POST['element_type'];	
	$dir;
	if($element_type == "di001"){
		$dir = "../hmi/elements/i/di001/img";
	}	
	if($element_type == "aq001"){
		$dir = "../hmi/elements/q/aq001/img";
	}
	if($element_type == "dq001"){
		$dir = "../hmi/elements/q/dq001/img";
	}		
	if($dh = opendir("../".$dir))
	{
		while (($file = readdir($dh)) !== false) {
            		if ($file != "." && $file != ".." && $file != ".svn") { 
				echo $dir."/".$file."/u.gif\n";
			}
        	}
	}
	closedir($dh);
?>
