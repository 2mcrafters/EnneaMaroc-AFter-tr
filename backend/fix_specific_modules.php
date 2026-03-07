<?php

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\ParcoursModule;

echo "Starting specific module fix...\n";

$updates = [
    20 => [
        'name' => "Centres d'intelligence", // Updating title to standard quote if needed
        'description' => "Ce module vous invite à explorer vos trois intelligences : corporelle, émotionnelle et mentale. Vous découvrirez comment elles orientent vos décisions, vos émotions et vos comportements.",
        'details' => "Des panels vivants, exercices pratiques et mises en situation rendent l'expérience concrète et profonde. Vous apprendrez à reconnaître vos déséquilibres et à rééquilibrer vos centres pour plus d'alignement intérieur. Un séminaire puissant pour développer vos ressources, gagner en clarté et enrichir vos relations.",
        'horaires' => "9h-17h",
        'prerequis' => "D1",
        'price' => 3000
    ],
    22 => [
        'description' => "Ce module donne la lumière sur nos mécanismes limitants de l'ego. Les participants découvrent leurs Compulsions d'évitement, leurs Passions (émotions dominantes), leurs Fixations (schémas mentaux) et leur Attention première (filtre de perception).",
        'details' => "Des exercices pratiques, mises en situation et travaux en binômes rendent l'exploration concrète. Chacun prend conscience de ses automatismes et de la manière dont ils influencent ses relations.",
        'horaires' => "9h-17h",
        'prerequis' => "D3",
        'price' => 3000
    ],
    23 => [
        'description' => "Ce module explore l'ego dans ses attachements et ses fragilités. Les participants étudient l'Orgueil, les Pathologies potentielles et les Mécanismes de défense de chaque type.",
        'details' => "Lien est fait avec les instincts et les chemins d'intégration intérieure. Panels, études de cas et exercices d'ancrage favorisent une prise de conscience profonde. Un séminaire de maturité pour transformer ses fragilités en leviers d'évolution.",
        'horaires' => "9h-17h",
        'prerequis' => "D3",
        'price' => 3000
    ],
    24 => [
        'description' => "Ce module offre une entrée positive et concrète dans les dynamiques de l'Ennéagramme. Les participants découvrent les Vertus (idéal supérieur), leurs Forces principales (talents naturels).",
        'details' => "Une pédagogie vivante alterne apports, panels et exercices d'introspection. Chaque stagiaire identifie sa propre vertu, sa force et son mode d'attention. Un séminaire lumineux pour repartir avec une lecture valorisante et motivante de son type.",
        'horaires' => "9h-17h",
        'prerequis' => "D3",
        'price' => 3000,
        'lieu' => "Ferme J’nan Lemonie Sidi Yamani"
    ],
    29 => [
        'description' => "Ce module est l'expérience initiale du modèle de l'ennéagramme. Elle s'appuie sur des activités dans les 3 centres (mental, émotionnel, instinctif).",
        'details' => "Chacun repère à partir de vidéos, d'exercices variés et d'auto-observation, sa base de départ parmi les 9 possibles. Les résultats au questionnaire scientifiquement validé HPEI sont donnés en cours de séminaire, ainsi que la brochure « L'ennéagramme évolutif : les 9 bases ».",
        'horaires' => "9h-17h",
        'prerequis' => "V2",
        'price' => 3400
    ],
    // Duplicates - filling them to match the originals
    41 => [
        'name' => "Centres d'intelligence",
        'description' => "Ce module vous invite à explorer vos trois intelligences : corporelle, émotionnelle et mentale. Vous découvrirez comment elles orientent vos décisions, vos émotions et vos comportements.",
        'details' => "Des panels vivants, exercices pratiques et mises en situation rendent l'expérience concrète et profonde. Vous apprendrez à reconnaître vos déséquilibres et à rééquilibrer vos centres pour plus d'alignement intérieur. Un séminaire puissant pour développer vos ressources, gagner en clarté et enrichir vos relations.",
        'horaires' => "9h-17h",
        'prerequis' => "D1",
        'price' => 3000,
        'lieu' => "Ferme J’nan Lemonie Sidi Yamani"
    ],
    42 => [
        'description' => "Ce module donne la lumière sur nos mécanismes limitants de l'ego. Les participants découvrent leurs Compulsions d'évitement, leurs Passions (émotions dominantes), leurs Fixations (schémas mentaux) et leur Attention première (filtre de perception).",
        'details' => "Des exercices pratiques, mises en situation et travaux en binômes rendent l'exploration concrète. Chacun prend conscience de ses automatismes et de la manière dont ils influencent ses relations.",
        'horaires' => "9h-17h",
        'prerequis' => "D3",
        'price' => 3000,
        'lieu' => "Ferme J’nan Lemonie Sidi Yamani"
    ],
    43 => [
        'description' => "Ce module explore l'ego dans ses attachements et ses fragilités. Les participants étudient l'Orgueil, les Pathologies potentielles et les Mécanismes de défense de chaque type.",
        'details' => "Lien est fait avec les instincts et les chemins d'intégration intérieure. Panels, études de cas et exercices d'ancrage favorisent une prise de conscience profonde. Un séminaire de maturité pour transformer ses fragilités en leviers d'évolution.",
        'horaires' => "9h-17h",
        'prerequis' => "D3",
        'price' => 3000,
        'lieu' => "Ferme J’nan Lemonie Sidi Yamani"
    ],
    44 => [
        'description' => "Ce module offre une entrée positive et concrète dans les dynamiques de l'Ennéagramme. Les participants découvrent les Vertus (idéal supérieur), leurs Forces principales (talents naturels).",
        'details' => "Une pédagogie vivante alterne apports, panels et exercices d'introspection. Chaque stagiaire identifie sa propre vertu, sa force et son mode d'attention. Un séminaire lumineux pour repartir avec une lecture valorisante et motivante de son type.",
        'horaires' => "9h-17h",
        'prerequis' => "D3",
        'price' => 3000,
        'lieu' => "Ferme J’nan Lemonie Sidi Yamani"
    ],
    45 => [
        'description' => "Ce module est l'expérience initiale du modèle de l'ennéagramme. Elle s'appuie sur des activités dans les 3 centres (mental, émotionnel, instinctif).",
        'details' => "Chacun repère à partir de vidéos, d'exercices variés et d'auto-observation, sa base de départ parmi les 9 possibles. Les résultats au questionnaire scientifiquement validé HPEI sont donnés en cours de séminaire, ainsi que la brochure « L'ennéagramme évolutif : les 9 bases ».",
        'horaires' => "9h-17h",
        'prerequis' => "V2",
        'price' => 3400,
        'lieu' => "Ferme J’nan Lemonie Sidi Yamani"
    ]
];

foreach ($updates as $id => $data) {
    $module = ParcoursModule::find($id);
    if ($module) {
        echo "Updating Module ID {$id} ({$module->title})...\n";
        
        // Only update fields if they are empty or we want to enforce the value
        // For these specific ones, we enforce the values as requested
        $module->description = $data['description'];
        $module->details = $data['details'];
        $module->horaires = $data['horaires'];
        $module->prerequis = $data['prerequis'];
        $module->price = $data['price'];
        
        if (isset($data['name'])) {
             // Optional: normalize title if needed (e.g. removing curly quotes)
             // $module->title = $data['name']; 
        }

        $module->save();
        echo "  -> Updated successfully.\n";
    } else {
        echo "Module ID {$id} not found.\n";
    }
}

echo "Fix complete.\n";
