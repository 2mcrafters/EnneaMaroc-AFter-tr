<?php
require __DIR__ . '/backend/vendor/autoload.php';
$app = require_once __DIR__ . '/backend/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Parcours;
use App\Models\ParcoursModule;

$data = [
    'decouvrir' => [
        [
            'order' => 1,
            'title' => 'Initiation et Découverte',
            'prerequis' => 'Aucun',
            'description' => "Ce module constitue la porte d’entrée dans l’Ennéagramme. Il introduit les fondements du modèle, son origine, sa philosophie et sa structure globale. Les participants découvrent les 9 types de personnalité, les 27 sous-types et les grands principes qui régissent le fonctionnement de l’ego. L’objectif est d’éveiller la curiosité, poser un cadre sécurisant et permettre une première reconnaissance de soi sans jugement ni étiquetage."
        ],
        [
            'order' => 2,
            'title' => 'Centres d’intelligence',
            'prerequis' => 'D1',
            'description' => "Ce module explore les trois centres d’intelligence : mental, émotionnel et instinctif. Il permet de comprendre comment chaque centre influence la perception du monde, la prise de décision et les réactions automatiques. Les participants apprennent à identifier leur centre dominant, leurs déséquilibres et les impacts sur leur communication et leurs relations. Ce travail favorise une lecture plus consciente de ses modes de fonctionnement internes."
        ],
        [
            'order' => 3,
            'title' => 'Instincts',
            'prerequis' => 'D1',
            'description' => "Ce module est consacré aux instincts fondamentaux (conservation, social, transmission/sexuel) et à leur rôle dans la personnalité. Il clarifie une confusion fréquente entre type et instinct, en mettant en lumière les motivations profondes liées à la survie, à l’appartenance et au lien. Les participants découvrent leur hiérarchie instinctive et prennent conscience de leurs priorités inconscientes et zones de tension."
        ],
        [
            'order' => 4,
            'title' => 'Lumière : Conscience claire de nos mécanismes inconscients',
            'prerequis' => 'D2 – D3',
            'description' => "Ce module vise à développer une conscience lucide des automatismes de l’ego. Il met en lumière les mécanismes inconscients, les croyances limitantes et les stratégies de protection propres à chaque profil. L’accent est mis sur les ressources, les talents naturels et les qualités essentielles lorsque la personnalité est alignée. Ce module ouvre un espace de responsabilité et de choix conscient."
        ],
        [
            'order' => 5,
            'title' => 'Ombre : Se libérer des fardeaux de l’ego',
            'prerequis' => 'D3',
            'description' => "Ce module aborde l’ombre psychique, les schémas répétitifs, les blessures et les pièges de l’ego. Il permet d’identifier les comportements compensatoires, les résistances au changement et les dynamiques d’auto-sabotage. Le travail proposé favorise l’acceptation, l’intégration et la transformation de l’ombre en levier de croissance intérieure."
        ],
        [
            'order' => 6,
            'title' => 'Profondeur : Être autonome dans le chemin d’évolution',
            'prerequis' => 'D3',
            'description' => "Ce module accompagne le participant vers une posture d’autonomie intérieure. Il met l’accent sur la responsabilité personnelle, la régulation émotionnelle et l’ancrage dans un chemin d’évolution durable. L’objectif est de sortir de la dépendance aux modèles extérieurs pour devenir acteur conscient de son propre développement."
        ]
    ],
    'approfondir' => [
        [
            'order' => 1,
            'title' => 'Ressemblance et confusion',
            'prerequis' => 'Niveau D',
            'description' => "Ce module traite des confusions typologiques fréquentes entre profils proches. Il affine la capacité de discernement en allant au-delà des comportements visibles pour accéder aux motivations profondes. Les participants développent une lecture plus fine de soi et des autres, réduisant les erreurs d’identification et les projections."
        ],
        [
            'order' => 2,
            'title' => 'Relations en Ennéagramme',
            'prerequis' => 'V1',
            'description' => "Ce module explore les dynamiques relationnelles entre les différents types. Il met en lumière les mécanismes d’attraction, de conflit, de complémentarité et de dépendance. Les participants apprennent à ajuster leur communication et à améliorer la qualité de leurs relations personnelles et professionnelles."
        ],
        [
            'order' => 3,
            'title' => 'Pathologie et ombres',
            'prerequis' => 'V1',
            'description' => "Ce module approfondit les déséquilibres psychiques, les fixations et les mécanismes pathologiques possibles de chaque type. Il permet de reconnaître les signaux de désalignement, les zones de rigidité et les risques de dérive. L’approche reste non médicale et orientée vers la prévention, la conscience et la transformation."
        ],
        [
            'order' => 4,
            'title' => 'Grand Panel & pistes de développement',
            'prerequis' => 'V2 – V3',
            'description' => "Ce module synthétise l’ensemble des connaissances acquises à travers un grand panel comparatif des types. Il met l’accent sur les pistes de développement, les mouvements d’intégration et de régression, ainsi que les leviers de transformation. Il permet une vision globale et structurée de l’Ennéagramme en action."
        ],
        [
            'order' => 5,
            'title' => 'Intégration : Ennéagramme et profils jungiens',
            'prerequis' => 'V2',
            'description' => "Ce module établit des ponts entre l’Ennéagramme et les typologies jungiennes. Il enrichit la compréhension de la personnalité en croisant les approches et en offrant une lecture multidimensionnelle de la psyché. Cette intégration renforce la pertinence de l’outil dans les contextes d’accompagnement et de formation."
        ],
        [
            'order' => 6,
            'title' => 'Retraite ennéagrammiste',
            'prerequis' => 'D4 – V2 – V3',
            'description' => "Ce module expérientiel propose une immersion profonde dans le travail intérieur. Il favorise l’intégration corporelle, émotionnelle et symbolique des apprentissages. La retraite permet un ralentissement, une introspection guidée et un ancrage durable des transformations vécues."
        ]
    ],
    'transmettre' => [
        [
            'order' => 1,
            'title' => 'Conduite et animation de panels',
            'prerequis' => 'Niveau V',
            'description' => "Ce module développe les compétences nécessaires pour animer des groupes, conduire des panels typologiques et créer des espaces d’échange sécurisés. Il aborde la posture de facilitateur, l’éthique et la gestion des dynamiques de groupe."
        ],
        [
            'order' => 2,
            'title' => 'Devenir profileur : Processus de l’entretien typologique',
            'prerequis' => 'M1',
            'description' => "Ce module forme à la conduite d’entretiens typologiques structurés. Il enseigne l’art du questionnement, de l’écoute profonde et de l’analyse des motivations inconscientes. Les participants apprennent à identifier un type avec rigueur et discernement."
        ],
        [
            'order' => 3,
            'title' => 'Superviser, co-développer : 5 cas pratiques filmés',
            'prerequis' => 'M2',
            'description' => "Ce module est centré sur la pratique supervisée. À travers des cas réels filmés, les participants affinent leur posture, reçoivent du feedback et développent leur capacité d’analyse et d’accompagnement dans des situations complexes."
        ],
        [
            'order' => 4,
            'title' => 'En croisant l’Ennéagramme et la thérapie brève',
            'prerequis' => 'D – V',
            'description' => "Ce module introduit l’articulation entre l’Ennéagramme et les approches de thérapie brève. Il propose des outils concrets, orientés solution, tout en respectant les limites éthiques de chaque pratique."
        ],
        [
            'order' => 5,
            'title' => 'Certification à la méthode Ennea-Pro HRH (Devenir formateur HRH)',
            'prerequis' => 'M2 – M4',
            'description' => "Ce module valide les compétences pédagogiques, éthiques et méthodologiques du participant. Il prépare à la transmission professionnelle de l’Ennéagramme dans les contextes RH, formation et accompagnement."
        ],
        [
            'order' => 6,
            'title' => 'Projet : Ancrer une approche adaptée à son public avec soutenance',
            'prerequis' => 'M4',
            'description' => "Ce module final consiste en la conception et la soutenance d’un projet personnel ou professionnel. Il permet d’ancrer l’Ennéagramme dans une pratique concrète, alignée avec le public cible et les valeurs du participant."
        ]
    ]
];

foreach ($data as $slug => $modules) {
    $parcours = Parcours::where('slug', $slug)->first();
    if (!$parcours) {
        echo "Parcours $slug not found!\n";
        continue;
    }
    
    echo "Updating Parcours: " . $parcours->title . "\n";
    
    foreach ($modules as $modData) {
        $module = ParcoursModule::where('parcours_id', $parcours->id)
            ->where('order', $modData['order'])
            ->first();
            
        if ($module) {
            $module->title = $modData['title'];
            $module->prerequis = $modData['prerequis'];
            $module->description = $modData['description'];
            // Also update details if it's empty or same as description
            $module->details = $modData['description']; 
            $module->save();
            echo "  - Updated Module " . $modData['order'] . ": " . $modData['title'] . "\n";
        } else {
            // Create if not exists (though we expect them to exist)
            ParcoursModule::create([
                'parcours_id' => $parcours->id,
                'order' => $modData['order'],
                'title' => $modData['title'],
                'prerequis' => $modData['prerequis'],
                'description' => $modData['description'],
                'details' => $modData['description'],
                'duration' => '2 JOURS', // Default
                'price' => '3500 MAD' // Default
            ]);
            echo "  - Created Module " . $modData['order'] . ": " . $modData['title'] . "\n";
        }
    }
}
