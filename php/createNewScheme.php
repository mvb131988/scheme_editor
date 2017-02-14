<?php
/*bob*/	$dir = '/var/www/html/tte/scheme_editor/scheme_xmls/';
	$xml_name = $_POST['xml_name'];
	$img_path = $_POST['img_path'];
	
	$fh = fopen($dir.$xml_name.'.xml', 'w');
    fwrite($fh, '<scheme schemeTitle="'.$xml_name.'"><imagePath>'.$img_path.'</imagePath></scheme>');
	fclose($fh);
?>