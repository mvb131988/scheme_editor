<?php
/*bob*/	$dir = "C:\\programs\\httpd\\Apache2\\htdocs\\tte\\scheme_editor\\scheme_images";
	if($dh = opendir($dir))
	{
		$output = "";
		while (($file = readdir($dh)) !== false) {
            if (substr($file, 0, 1) != "." && $file != "..") { 
				$output .= $file."\n";
			}
        }
		// remove last \n
		echo substr($output, 0, strlen($output)-1);
	}
	closedir($dh);
?>