<?php
echo "Backend Test Page\n";
echo "Time: " . date('Y-m-d H:i:s') . "\n";
echo "PHP Version: " . phpversion() . "\n";

if (file_exists('vendor/autoload.php')) {
    echo "✅ Composer autoload found\n";
} else {
    echo "❌ Composer autoload not found\n";
}

if (file_exists('.env')) {
    echo "✅ .env file found\n";
} else {
    echo "❌ .env file not found\n";
}
?>
