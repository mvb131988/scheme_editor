<?php

	$delete_schemes = $_POST['delete_schemes'];
	$names = explode(' ', $delete_schemes);
	for($i=0; $i<count($names)-1; $i++)
	{
/*bob*/		unlink('C:\\programs\\httpd\\Apache2\\htdocs\\tte\\scheme_editor\\scheme_xmls\\'.$names[$i].'.xml');	
	}

?>