<?php

// we use a file to keep track of our visitors.
$filename = "user_count.txt";

$target_dir = "../";
$path = $target_dir . $filename;

$fp = fopen($path, "r+") or die("Unable to open count file: $path");

// wait until we get the lock
while (true){
    if (flock($fp, LOCK_EX)) {  // acquire an exclusive lock
        $count = fgets($fp);
        $count = intval($count);
        $count++;
        $count=(string)$count;
        ftruncate($fp,0); // delete file contents
        rewind($fp); // rewind. forgot it.. cost me 1h
        fwrite($fp,"$count");
        fwrite($fp,"\n");
        fflush($fp);           // flush output before releasing the lock
        flock($fp, LOCK_UN);    // release the lock
        break;
    } 
    sleep(1);
}
fclose($fp);

// return in json format.
echo "{\"count\":$count}"
?>
