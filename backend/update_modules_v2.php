<?php

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Parcours;
use App\Models\ParcoursModule;

// Data from the prompt
$data = [
    'decouvrir' => [
        [
            'reference' => 'D1',
            'title' => 'Initiation et Découverte',
            'subtitle' => 'Niveau 1 – Découverte de soi : Les 27 visages de la personnalité',
            'description' => 'Ce module constitue la porte d’entrée dans l’Ennéagramme. Il introduit les fondements du modèle, son origine, sa philosophie et sa structure globale. Les participants découvrent les 9 types de personnalité, les 27 sous-types et les grands principes qui régissent le fonctionnement de l’ego. L’objectif est d’éveiller la curiosité, poser un cadre sécurisant et permettre une première reconnaissance de soi sans jugement ni étiquetage.',
            'prerequis' => 'Aucun',
            'duration' => '2 JOURS',
            'price_ht' => 3500,
            'price_ttc' => 4200,
        ],
        [
            'reference' => 'D2',
            'title' => 'Centres d’intelligence',
            'subtitle' => 'Explorer vos trois intelligences',
            'description' => 'Ce module explore les trois centres d’intelligence : mental, émotionnel et instinctif. Il permet de comprendre comment chaque centre influence la perception du monde, la prise de décision et les réactions automatiques. Les participants apprennent à identifier leur centre dominant, leurs déséquilibres et les impacts sur leur communication et leurs relations. Ce travail favorise une lecture plus consciente de ses modes de fonctionnement internes.',
            'prerequis' => 'D1',
            'duration' => '2 JOURS',
            'price_ht' => 3500,
            'price_ttc' => 4200,
        ],
        [
            'reference' => 'D3',
            'title' => 'Instincts',
            'subtitle' => 'Les trois forces vitales qui guident nos comportements',
            'description' => 'Ce module est consacré aux instincts fondamentaux (conservation, social, transmission/sexuel) et à leur rôle dans la personnalité. Il clarifie une confusion fréquente entre type et instinct, en mettant en lumière les motivations profondes liées à la survie, à l’appartenance et au lien. Les participants découvrent leur hiérarchie instinctive et prennent conscience de leurs priorités inconscientes et zones de tension.',
            'prerequis' => 'D1',
            'duration' => '2 JOURS',
            'price_ht' => 3500,
            'price_ttc' => 4200,
        ],
        [
            'reference' => 'D4',
            'title' => 'Lumière : Conscience claire de nos mécanismes inconscients',
            'subtitle' => 'Conscience claire de nos mécanismes inconscients',
            'description' => 'Ce module vise à développer une conscience lucide des automatismes de l’ego. Il met en lumière les mécanismes inconscients, les croyances limitantes et les stratégies de protection propres à chaque profil. L’accent est mis sur les ressources, les talents naturels et les qualités essentielles lorsque la personnalité est alignée. Ce module ouvre un espace de responsabilité et de choix conscient.',
            'prerequis' => 'D2 – D3',
            'duration' => '2 JOURS',
            'price_ht' => 3500,
            'price_ttc' => 4200,
        ],
        [
            'reference' => 'D5',
            'title' => 'Ombre : Se libérer des fardeaux de l’ego',
            'subtitle' => 'Se libérer des fardeaux de l\'ego',
            'description' => 'Ce module aborde l’ombre psychique, les schémas répétitifs, les blessures et les pièges de l’ego. Il permet d’identifier les comportements compensatoires, les résistances au changement et les dynamiques d’auto-sabotage. Le travail proposé favorise l’acceptation, l’intégration et la transformation de l’ombre en levier de croissance intérieure.',
            'prerequis' => 'D3',
            'duration' => '2 JOURS',
            'price_ht' => 3500,
            'price_ttc' => 4200,
        ],
        [
            'reference' => 'D6',
            'title' => 'Profondeur : Être autonome dans le chemin d’évolution',
            'subtitle' => 'Être Autonome dans le chemin d\'évolution',
            'description' => 'Ce module accompagne le participant vers une posture d’autonomie intérieure. Il met l’accent sur la responsabilité personnelle, la régulation émotionnelle et l’ancrage dans un chemin d’évolution durable. L’objectif est de sortir de la dépendance aux modèles extérieurs pour devenir acteur conscient de son propre développement.',
            'prerequis' => 'D3',
            'duration' => '2 JOURS',
            'price_ht' => 3500,
            'price_ttc' => 4200,
        ],
    ],
    'approfondir' => [
        [
            'reference' => 'V1',
            'title' => 'Ressemblance et confusion',
            'subtitle' => 'Niveau 2 – Voyage intérieur : Mécanismes, ombres et potentiels',
            'description' => 'Ce module traite des confusions typologiques fréquentes entre profils proches. Il affine la capacité de discernement en allant au-delà des comportements visibles pour accéder aux motivations profondes. Les participants développent une lecture plus fine de soi et des autres, réduisant les erreurs d’identification et les projections.',
            'prerequis' => 'Niveau D',
            'duration' => '2 JOURS',
            'price_ht' => 3500,
            'price_ttc' => 4200,
        ],
        [
            'reference' => 'V2',
            'title' => 'Relations en Ennéagramme',
            'subtitle' => 'Niveau 2 – Voyage intérieur : Mécanismes, ombres et potentiels',
            'description' => 'Ce module explore les dynamiques relationnelles entre les différents types. Il met en lumière les mécanismes d’attraction, de conflit, de complémentarité et de dépendance. Les participants apprennent à ajuster leur communication et à améliorer la qualité de leurs relations personnelles et professionnelles.',
            'prerequis' => 'V1',
            'duration' => '2 JOURS',
            'price_ht' => 3500,
            'price_ttc' => 4200,
        ],
        [
            'reference' => 'V3',
            'title' => 'Pathologie et ombres',
            'subtitle' => 'Niveau 2 – Voyage intérieur : Mécanismes, ombres et potentiels',
            'description' => 'Ce module approfondit les déséquilibres psychiques, les fixations et les mécanismes pathologiques possibles de chaque type. Il permet de reconnaître les signaux de désalignement, les zones de rigidité et les risques de dérive. L’approche reste non médicale et orientée vers la prévention, la conscience et la transformation.',
            'prerequis' => 'V1',
            'duration' => '2 JOURS',
            'price_ht' => 3500,
            'price_ttc' => 4200,
        ],
        [
            'reference' => 'V4',
            'title' => 'Grand Panel & pistes de développement',
            'subtitle' => 'Niveau 2 – Voyage intérieur : Mécanismes, ombres et potentiels',
            'description' => 'Ce module synthétise l’ensemble des connaissances acquises à travers un grand panel comparatif des types. Il met l’accent sur les pistes de développement, les mouvements d’intégration et de régression, ainsi que les leviers de transformation. Il permet une vision globale et structurée de l’Ennéagramme en action.',
            'prerequis' => 'V2 – V3',
            'duration' => '2 JOURS',
            'price_ht' => 3500,
            'price_ttc' => 4200,
        ],
        [
            'reference' => 'V5',
            'title' => 'Intégration : Ennéagramme et profils jungiens',
            'subtitle' => 'Niveau 2 – Voyage intérieur : Mécanismes, ombres et potentiels',
            'description' => 'Ce module établit des ponts entre l’Ennéagramme et les typologies jungiennes. Il enrichit la compréhension de la personnalité en croisant les approches et en offrant une lecture multidimensionnelle de la psyché. Cette intégration renforce la pertinence de l’outil dans les contextes d’accompagnement et de formation.',
            'prerequis' => 'V2',
            'duration' => '2 JOURS',
            'price_ht' => 3500,
            'price_ttc' => 4200,
        ],
        [
            'reference' => 'V6',
            'title' => 'Retraite ennéagrammiste',
            'subtitle' => 'Niveau 2 – Voyage intérieur : Mécanismes, ombres et potentiels',
            'description' => 'Ce module expérientiel propose une immersion profonde dans le travail intérieur. Il favorise l’intégration corporelle, émotionnelle et symbolique des apprentissages. La retraite permet un ralentissement, une introspection guidée et un ancrage durable des transformations vécues.',
            'prerequis' => 'D4 – V2 – V3',
            'duration' => '5 JOURS',
            'price_ht' => 3500,
            'price_ttc' => 4200,
        ],
    ],
    'transmettre' => [
        [
            'reference' => 'M1',
            'title' => 'Conduite et animation de panels',
            'subtitle' => 'Niveau 3 – Maîtrise : Transmission et transformation',
            'description' => 'Ce module développe les compétences nécessaires pour animer des groupes, conduire des panels typologiques et créer des espaces d’échange sécurisés. Il aborde la posture de facilitateur, l’éthique et la gestion des dynamiques de groupe.',
            'prerequis' => 'Niveau V',
            'duration' => '3 JOURS',
            'price_ht' => 4000,
            'price_ttc' => 4800,
        ],
        [
            'reference' => 'M2',
            'title' => 'Devenir profileur : Processus de l’entretien typologique',
            'subtitle' => 'Niveau 3 – Maîtrise : Transmission et transformation',
            'description' => 'Ce module forme à la conduite d’entretiens typologiques structurés. Il enseigne l’art du questionnement, de l’écoute profonde et de l’analyse des motivations inconscientes. Les participants apprennent à identifier un type avec rigueur et discernement.',
            'prerequis' => 'M1',
            'duration' => '3 JOURS',
            'price_ht' => 4000,
            'price_ttc' => 4800,
        ],
        [
            'reference' => 'M3',
            'title' => 'Superviser, co-développer : 5 cas pratiques filmés',
            'subtitle' => 'Niveau 3 – Maîtrise : Transmission et transformation',
            'description' => 'Ce module est centré sur la pratique supervisée. À travers des cas réels filmés, les participants affinent leur posture, reçoivent du feedback et développent leur capacité d’analyse et d’accompagnement dans des situations complexes.',
            'prerequis' => 'M2',
            'duration' => '3 JOURS',
            'price_ht' => 4000,
            'price_ttc' => 4800,
        ],
        [
            'reference' => 'M4',
            'title' => 'En croisant l’Ennéagramme et la thérapie brève',
            'subtitle' => 'Niveau 3 – Maîtrise : Transmission et transformation',
            'description' => 'Ce module introduit l’articulation entre l’Ennéagramme et les approches de thérapie brève. Il propose des outils concrets, orientés solution, tout en respectant les limites éthiques de chaque pratique.',
            'prerequis' => 'D – V',
            'duration' => '3 JOURS',
            'price_ht' => 4000,
            'price_ttc' => 4800,
        ],
        [
            'reference' => 'M5',
            'title' => 'Certification à la méthode Ennea-Pro HRH (Devenir formateur HRH)',
            'subtitle' => 'Niveau 3 – Maîtrise : Transmission et transformation',
            'description' => 'Ce module valide les compétences pédagogiques, éthiques et méthodologiques du participant. Il prépare à la transmission professionnelle de l’Ennéagramme dans les contextes RH, formation et accompagnement.',
            'prerequis' => 'M2 – M4',
            'duration' => '3 JOURS',
            'price_ht' => 4000,
            'price_ttc' => 4800,
        ],
        [
            'reference' => 'M6',
            'title' => 'Projet : Ancrer une approche adaptée à son public avec soutenance',
            'subtitle' => 'Niveau 3 – Maîtrise : Transmission et transformation',
            'description' => 'Ce module final consiste en la conception et la soutenance d’un projet personnel ou professionnel. Il permet d’ancrer l’Ennéagramme dans une pratique concrète, alignée avec le public cible et les valeurs du participant.',
            'prerequis' => 'M4',
            'duration' => '5 JOURS',
            'price_ht' => 6000,
            'price_ttc' => 7200,
        ],
    ],
];

foreach ($data as $slug => $modules) {
    $parcours = Parcours::where('slug', $slug)->first();
    if (!$parcours) {
        echo "Parcours not found: $slug\n";
        continue;
    }

    echo "Updating Parcours: " . $parcours->title . "\n";

    foreach ($modules as $index => $moduleData) {
        // Find by reference if possible, or by order (assuming order is preserved)
        // Since we added reference column, we can try to find by reference OR update by index.
        // But wait, if we are changing references or titles, finding by them is hard.
        // Let's assume we are updating existing modules in order.
        
        // Actually, let's try to find by reference first if it exists, otherwise by title (fuzzy), otherwise create?
        // The previous script might have already set references.
        
        $module = ParcoursModule::where('parcours_id', $parcours->id)
            ->where('reference', $moduleData['reference'])
            ->first();

        if (!$module) {
             // Fallback: try to find by title (maybe partial match) or just take the one at that index?
             // Taking by index is risky if IDs are not sequential.
             // Let's try to find by title.
             $module = ParcoursModule::where('parcours_id', $parcours->id)
                ->where('title', 'like', '%' . substr($moduleData['title'], 0, 10) . '%')
                ->first();
        }
        
        if (!$module) {
            // Create new
            $module = new ParcoursModule();
            $module->parcours_id = $parcours->id;
            echo "  Creating new module: " . $moduleData['reference'] . "\n";
        } else {
            echo "  Updating module: " . $module->id . " (" . $moduleData['reference'] . ")\n";
        }

        $module->title = $moduleData['title'];
        $module->subtitle = $moduleData['subtitle'];
        $module->description = $moduleData['description'];
        $module->details = $moduleData['description']; // Using description as details for now as per previous pattern
        $module->prerequis = $moduleData['prerequis'];
        $module->duration = $moduleData['duration'];
        $module->price = $moduleData['price_ht']; // Map price_ht to price
        // $module->price_ttc = $moduleData['price_ttc']; // Column does not exist
        $module->reference = $moduleData['reference'];
        
        // Preserve icon, place, etc if not specified? 
        // The prompt didn't specify icons, so we keep existing ones or defaults.
        
        $module->save();
    }
}

echo "Done.\n";
