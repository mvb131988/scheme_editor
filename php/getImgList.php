<?php
	$element_type = $_POST['element_type'];	
	$dir;
	if($element_type == "di001"){
		$dir = "..\\..\\..\\hmi\\elements\\i\\di001\\img";
	}	
	if($element_type == "aq001"){
		$dir = "..\\..\\..\\hmi\\elements\\q\\aq001\\img";
	}
	if($element_type == "dq001"){
		$dir = "..\\..\\..\\hmi\\elements\\q\\dq001\\img";
	}	
	if($element_type == "link"){
		$dir = "..\\..\\..\\hmi\\elements\\q\\aq001\\img\\link";
	}		
	if($dh = opendir($dir))
	{
		while (($file = readdir($dh)) !== false) {
            if ($file != "." && $file != ".." && $file != ".svn" && (substr($file, -4) == ".png" || substr($file, -4) == ".gif" )) { 
				echo $dir."\\".$file."\n";
			}
        }
	}
	closedir($dh);
?>
