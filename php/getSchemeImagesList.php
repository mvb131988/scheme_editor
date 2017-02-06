<?php
/*bob*/	$dir = "/var/www/html/tte/scheme_editor/scheme_images";
	if($dh = opendir($dir))
	{
		while (($file = readdir($dh)) !== false) {
            if ($file != "." && $file != "..") { 
				echo $file."\n";
			}
        }
	}
	closedir($dh);
?>