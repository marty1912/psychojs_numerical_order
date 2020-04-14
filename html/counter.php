<?php

// we use a file to keep track of our visitors.
$filename = "user_count.txt";

$target_dir = "../data/";
$path = $target_dir . $filename;

$fp = fopen($path, "r+") or die("Unable to open count file: $path");

    if (flock($fp, LOCK_EX)) {  // acquire an exclusive lock
        $count = fgets($fp);
        echo "before intval" . $count;
        $count = intval($count);
        echo "after intval". $count;
        $count++;
        $count=(string)$count;
        ftruncate($fp,0); // delete file contents
        rewind($fp);
        //fflush($fp);           // flush output before releasing the lock
        fwrite($fp,"$count");
        fwrite($fp,"\n");
        fflush($fp);           // flush output before releasing the lock
        flock($fp, LOCK_UN);    // release the lock
    } 
fclose($fp);

echo "[SERVER] count: $count"
?>
