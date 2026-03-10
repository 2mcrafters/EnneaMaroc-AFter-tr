<?php

declare(strict_types=1);

$baseUrl = $argv[1] ?? 'http://127.0.0.1:8000';
$url = rtrim($baseUrl, '/') . '/api/parcours';

$json = @file_get_contents($url);
if ($json === false) {
    fwrite(STDERR, "Failed to fetch: {$url}\n");
    exit(1);
}

$data = json_decode($json, true);
if (!is_array($data)) {
    fwrite(STDERR, "Invalid JSON from: {$url}\n");
    exit(2);
}

foreach ($data as $p) {
    $slug = $p['slug'] ?? '';
    $parcoursPrice = $p['price'] ?? null;
    echo "PARCOURS {$slug}";
    if ($parcoursPrice !== null && $parcoursPrice !== '') {
        echo " (price={$parcoursPrice})";
    }
    echo "\n";

    $modules = $p['modules'] ?? [];
    if (!is_array($modules) || count($modules) === 0) {
        echo "  (no modules)\n";
        continue;
    }

    $sum = 0;
    foreach ($modules as $m) {
        $priceStr = $m['price'] ?? null;
        if (!is_string($priceStr) || trim($priceStr) === '') {
            continue;
        }
        $digits = preg_replace('/[^0-9]/', '', $priceStr) ?? '';
        $sum += (int) ($digits !== '' ? $digits : 0);
    }
    echo "  modules_total=" . number_format($sum, 0, '.', ' ') . " MAD\n";

    foreach ($modules as $m) {
        $title = $m['title'] ?? '';
        $order = $m['order'] ?? '';
        $icon = $m['icon'] ?? null;
        $subtitle = $m['subtitle'] ?? null;
        $description = $m['description'] ?? null;
        $details = $m['details'] ?? null;
        $price = $m['price'] ?? null;
        $place = $m['place'] ?? null;

        $descLen = is_string($description) ? strlen($description) : 0;
        $detailsLen = is_string($details) ? strlen($details) : 0;

        echo "  [order={$order}] {$title}\n";
        echo "    icon=" . ($icon ?? 'NULL') . " subtitle=" . ($subtitle ?? 'NULL') . " price=" . ($price ?? 'NULL') . " place=" . ($place ?? 'NULL') . "\n";
        echo "    description_len={$descLen} details_len={$detailsLen}\n";
    }
}
