<?php
echo 'http://'. $_SERVER['SERVER_NAME'] . $_SERVER['REQUEST_URI'];
// Affiche toutes les informations, comme le ferait INFO_ALL
phpinfo();

// Affiche uniquement le module d'information.
// phpinfo(8) fournirait les mêmes informations.
phpinfo(INFO_MODULES);

if (!function_exists('mysqli_init') && !extension_loaded('mysqli')) {
    echo 'We don\'t have mysqli!!!';
} else {
    mysqli_init();
    echo 'Phew we have it!';
}
mysqli_connect();
?>