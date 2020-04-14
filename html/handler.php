<?php

// get filename and sanitize it.
$filename= $_POST["filename"];
$filename= preg_replace(array('/\s/', '/\.[\.]+/', '/[^\w_\.\-]/'), array('_', '.', ''), $filename);
$filename = basename($filename);

// get data
$data = $_POST["data"];

$target_dir = "../data/";
$path = $target_dir . $filename;
$myfile = fopen( $path, "w") or die("Unable to open file!");
fwrite($myfile, $data);
fclose($myfile);

http_response_code(200);
echo "[SERVER] data saved. $filename"
?>
