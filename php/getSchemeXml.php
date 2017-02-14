<?php
	$scheme_name = $_POST['scheme_name'];
	
/*bob*/	$fh = fopen('/var/www/html/tte/scheme_editor/scheme_xmls/'.$scheme_name.'.xml', 'r');
/*bob*/	$xml_file = fread($fh, filesize('/var/www/html/tte/scheme_editor/scheme_xmls/'.$scheme_name.'.xml'));
	echo $xml_file;
	fclose($fh);
?>