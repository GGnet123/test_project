<?php
$conn_string = "host=postgres dbname=".$_ENV['POSTGRES_DB']." user=".$_ENV['POSTGRES_USER']." password=" . $_ENV['POSTGRES_PASSWORD'];
return pg_connect($conn_string);