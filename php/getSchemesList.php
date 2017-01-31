<?php
/*bob*/	$dir = "C:\\programs\\httpd\\Apache2\\htdocs\\tte\\scheme_editor\\scheme_xmls";
	if($dh = opendir($dir))
	{
		$output = "";
		while (($file = readdir($dh)) !== false) {
			if ($file != "." && $file != ".." && $file != ".svn") { 
				$output .= $file."\n";
			}
        }
		// remove last \n
		echo substr($output, 0, strlen($output)-1);
	}
	closedir($dh);
?>