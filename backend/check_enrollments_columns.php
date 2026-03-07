<?php

/**
 * Quick schema check for the enrollments table.
 * Run: php check_enrollments_columns.php
 */

$host = getenv('DB_HOST') ?: '127.0.0.1';
$port = getenv('DB_PORT') ?: '3306';
$db   = getenv('DB_DATABASE') ?: 'enneagrame';
$user = getenv('DB_USERNAME') ?: 'root';
$pass = getenv('DB_PASSWORD') ?: '';

try {
    $pdo = new PDO(
        "mysql:host={$host};port={$port};dbname={$db};charset=utf8mb4",
        $user,
        $pass,
        [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
    );

    echo "=== ENROLLMENTS TABLE COLUMNS ===\n";
    $stmt = $pdo->query("DESCRIBE enrollments");
    foreach ($stmt as $row) {
        echo "- {$row['Field']}\t{$row['Type']}\n";
    }
} catch (Throwable $e) {
    echo "Error: " . $e->getMessage() . "\n";
    exit(1);
}
