<?php
/*Author: Sam Gershkovich 000801766
  Date: November 1, 2020
*/

try{
    $dbh = new PDO("mysql:host=localhost;dbname=000801766","root","");
}catch(Exception $e){
    die("ERROR. Couldn't get DB Connection. ".$e->getMessage());
}