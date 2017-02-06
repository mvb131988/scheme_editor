<?php
/*bob*/	$myFile = '/var/www/html/tte/scheme_editor/scheme_xmls/'.$_POST['scheme_name'].'.xml';
	echo $myFile;
	$fh = fopen($myFile, 'w');
   	fwrite($fh, $_POST['xml_config']);
	fclose($fh);
	
	$dom = new DOMDocument('1.0');
	$dom->preserveWhiteSpace = false;
	$dom->formatOutput = true;
	$dl = $dom->load($myFile); 
	$dom->save($myFile);
?>
