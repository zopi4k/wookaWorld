<?php
header('Content-Type: application/json');
date_default_timezone_set('UTC');
$timestamp = time();
$file = 'data.json';
$data = json_decode(file_get_contents($file), true);
$id = $_POST['id'];
$findId = false;
$counterData = 0;
foreach ($data as $key => &$entry) {
   $counterData++;
   if ($entry['id'] == $id) {
       $findId = true;
       foreach ($_POST as $k => $value) {
               $entry[$k] = $_POST[$k];
       }
       $entry['timestamp'] = $timestamp;
   }
   if ($entry['type'] == "player") {
       if (isset($entry['timestamp']) && ($timestamp - $entry['timestamp']) > 3) {
           unset($data[$key]);
       }
   }
}
if (!$findId) {
    $newEntry = $_POST;
    $newEntry['timestamp'] = $timestamp;
    $data[] = $newEntry;
}
if($counterData>1){
   file_put_contents($file, json_encode($data, JSON_PRETTY_PRINT));
}else{
   $new_file = 'data_new.json';
   $new_json_content = file_get_contents($new_file);
   file_put_contents($file, $new_json_content);
   // Compteur de bug
   $bug_file = 'data_compteur_bug.json';
   $bug_data = json_decode(file_get_contents($bug_file), true);
   $bug_count = (int)$bug_data[0]['bug'];
   $bug_data[0]['bug'] = $bug_count + 1;
   file_put_contents($bug_file, json_encode($bug_data, JSON_PRETTY_PRINT));
}
echo json_encode($data, JSON_PRETTY_PRINT);
?>