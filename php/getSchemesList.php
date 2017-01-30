<?php
/*bob*/	$dir = "C:\\programs\\httpd\\Apache2\\htdocs\\tte\\scheme_editor\\scheme_xmls";
	if($dh = opendir($dir))
	{
		while (($file = readdir($dh)) !== false) {
            if ($file != "." && $file != ".." && $file != ".svn") { 
				echo $file."\n";
			}
        }
	}
	closedir($dh);
?>