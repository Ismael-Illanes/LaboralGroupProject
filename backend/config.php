<?php
$db_host = "localhost"; 
$db_user = "root";     
$db_pass = "";       
$db_name = "laboralgroupprojectdb"; 

$conn = new mysqli($db_host, $db_user, $db_pass, $db_name);

if ($conn->connect_error) {
    die("Error de conexión a la base de datos: " . $conn->connect_error);
}
?>