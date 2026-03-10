<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Parcours;
use App\Models\ParcoursModule;
use Illuminate\Support\Facades\Schema;

class ParcoursSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Schema::disableForeignKeyConstraints();
        Parcours::truncate();
        ParcoursModule::truncate();
        Schema::enableForeignKeyConstraints();

        // Découvrir
        $decouvrir = Parcours::create([
            'title' => 'Découvrir',
            'slug' => 'decouvrir',
            'description' => 'Cycle Fondamental – Les bases de l\'Ennéagramme',
            'photo' => '/assets/imgss001/coaching (16).jpg',
            'lieu' => 'Jnan Lemonie',
            'horaires' => '9h00 - 17h00',
            'price' => '2000 MAD / Module',
            'cta_link' => '/app/#/course/31',
        ]);

        $decouvrirModules = [
            [
                'title' => "Initiation et Découverte",
                'duration' => "2 JOURS",
                'subtitle' => "À la découverte de soi – Les 27 visages de la personnalité",
                'description' => "Ce module est une porte d'entrée vers la connaissance de soi grâce à l'Ennéagramme. Vous y découvrirez que nous fonctionnons avec des mécanismes profonds, des forces et des freins, ainsi qu'avec nos centres d'intelligence et nos instincts dominants.",
                'details' => "La méthode alterne apports théoriques, panels vivants et exercices pratiques, individuels et en groupe, dans un cadre bienveillant. Vous repartirez avec une carte claire du fonctionnement de votre personnalité. Un séminaire transformateur, aussi bien pour le développement personnel que pour les relations professionnelles.",
                'icon' => 'FaCompass',
            ],
            [
                'title' => "Centres d'intelligence",
                'duration' => "2 JOURS",
                'subtitle' => "Explorer vos trois intelligences",
                'description' => "Ce module vous invite à explorer vos trois intelligences : corporelle, émotionnelle et mentale. Vous découvrirez comment elles orientent vos décisions, vos émotions et vos comportements.",
                'details' => "Des panels vivants, exercices pratiques et mises en situation rendent l'expérience concrète et profonde. Vous apprendrez à reconnaître vos déséquilibres et à rééquilibrer vos centres pour plus d'alignement intérieur. Un séminaire puissant pour développer vos ressources, gagner en clarté et enrichir vos relations.",
                'icon' => 'FaBrain',
            ],
            [
                'title' => "Instincts",
                'duration' => "2 JOURS",
                'subtitle' => "Les trois forces vitales qui guident nos comportements",
                'description' => "Ce module explore les trois forces vitales qui guident nos comportements : préservation, social et tête-à-tête. Vous découvrirez votre instinct dominant, ses peurs associées et son impact sur vos choix de vie.",
                'details' => "Grâce à des panels, exercices et mises en situation, vous expérimenterez vos dynamiques instinctives. Vous apprendrez à rééquilibrer vos instincts pour retrouver harmonie et puissance intérieure. Un séminaire essentiel pour mieux comprendre vos élans profonds et enrichir vos relations.",
                'icon' => 'FaHeart',
            ],
            [
                'title' => "Lumière",
                'duration' => "2 JOURS",
                'subtitle' => "Conscience claire de nos mécanismes inconscients",
                'description' => "Ce module donne la lumière sur nos mécanismes limitants de l'ego. Les participants découvrent leurs Compulsions d'évitement, leurs Passions (émotions dominantes), leurs Fixations (schémas mentaux) et leur Attention première (filtre de perception).",
                'details' => "Des exercices pratiques, mises en situation et travaux en binômes rendent l'exploration concrète. Chacun prend conscience de ses automatismes et de la manière dont ils influencent ses relations.",
                'icon' => 'FaLightbulb',
            ],
            [
                'title' => "Ombre",
                'duration' => "2 JOURS",
                'subtitle' => "Se libérer des fardeaux de l'ego",
                'description' => "Ce module explore l'ego dans ses attachements et ses fragilités. Les participants étudient l'Orgueil, les Pathologies potentielles et les Mécanismes de défense de chaque type.",
                'details' => "Lien est fait avec les instincts et les chemins d'intégration intérieure. Panels, études de cas et exercices d'ancrage favorisent une prise de conscience profonde. Un séminaire de maturité pour transformer ses fragilités en leviers d'évolution.",
                'icon' => 'FaMoon',
            ],
            [
                'title' => "Profondeur",
                'duration' => "2 JOURS",
                'subtitle' => "Être Autonome dans le chemin d'évolution",
                'description' => "Ce module offre une entrée positive et concrète dans les dynamiques de l'Ennéagramme. Les participants découvrent les Vertus (idéal supérieur), leurs Forces principales (talents naturels).",
                'details' => "Une pédagogie vivante alterne apports, panels et exercices d'introspection. Chaque stagiaire identifie sa propre vertu, sa force et son mode d'attention. Un séminaire lumineux pour repartir avec une lecture valorisante et motivante de son type.",
                'icon' => 'FaGem',
            ],
        ];

        foreach ($decouvrirModules as $index => $module) {
            $decouvrir->modules()->create(array_merge($module, ['order' => $index]));
        }

        // Approfondir
        $approfondir = Parcours::create([
            'title' => 'Approfondir',
            'slug' => 'approfondir',
            'description' => 'Voyage intérieur – Mécanismes, Ombres et Potentiels',
            'photo' => '/assets/imgss001/coaching (15).jpg',
            'lieu' => 'Jnan Lemonie',
            'horaires' => '9h00 - 17h00',
            'price' => '2500 MAD / Module',
            'cta_link' => '/app/#/course/32',
        ]);

        $approfondirModules = [
            [
                'title' => "Module 1 : Ressemblance et confusion",
                'duration' => "2 JOURS",
                'subtitle' => "Approfondir : Voyage intérieur – Mécanismes, Ombres et Potentiels",
                'description' => "Ce module est l'expérience initiale du modèle de l'ennéagramme. Elle s'appuie sur des activités dans les 3 centres (mental, émotionnel, instinctif).",
                'details' => "Chacun repère à partir de vidéos, d'exercices variés et d'auto-observation, sa base de départ parmi les 9 possibles. Les résultats au questionnaire scientifiquement validé HPEI sont donnés en cours de séminaire, ainsi que la brochure « L'ennéagramme évolutif : les 9 bases ».",
                'icon' => 'FaCompass',
            ],
            [
                'title' => "Module 2 : Relations en Ennéagramme",
                'duration' => "2 JOURS",
                'subtitle' => "Approfondir : Voyage intérieur – Mécanismes, Ombres et Potentiels",
                'description' => "Ce module est l'expérience initiale du modèle de l'ennéagramme. Elle s'appuie sur des activités dans les 3 centres (mental, émotionnel, instinctif).",
                'details' => "Chacun repère à partir de vidéos, d'exercices variés et d'auto-observation, sa base de départ parmi les 9 possibles. Les résultats au questionnaire scientifiquement validé HPEI sont donnés en cours de séminaire, ainsi que la brochure « L'ennéagramme évolutif : les 9 bases ».",
                'icon' => 'FaUsers',
            ],
            [
                'title' => "Module 3 : Pathologie et ombres",
                'duration' => "2 JOURS",
                'subtitle' => "Approfondir : Voyage intérieur – Mécanismes, Ombres et Potentiels",
                'description' => "Ce module est l'expérience initiale du modèle de l'ennéagramme. Elle s'appuie sur des activités dans les 3 centres (mental, émotionnel, instinctif).",
                'details' => "Chacun repère à partir de vidéos, d'exercices variés et d'auto-observation, sa base de départ parmi les 9 possibles. Les résultats au questionnaire scientifiquement validé HPEI sont donnés en cours de séminaire, ainsi que la brochure « L'ennéagramme évolutif : les 9 bases ».",
                'icon' => 'FaMoon',
            ],
            [
                'title' => "Module 4 : Grand Panel & pistes de développements",
                'duration' => "2 JOURS",
                'subtitle' => "Approfondir : Voyage intérieur – Mécanismes, Ombres et Potentiels",
                'description' => "Ce module est l'expérience initiale du modèle de l'ennéagramme. Elle s'appuie sur des activités dans les 3 centres (mental, émotionnel, instinctif).",
                'details' => "Chacun repère à partir de vidéos, d'exercices variés et d'auto-observation, sa base de départ parmi les 9 possibles. Les résultats au questionnaire scientifiquement validé HPEI sont donnés en cours de séminaire, ainsi que la brochure « L'ennéagramme évolutif : les 9 bases ».",
                'icon' => 'FaLightbulb',
            ],
            [
                'title' => "Module 5 : Intégration — Ennéagramme et profils jungiens",
                'duration' => "2 JOURS",
                'subtitle' => "Approfondir : Voyage intérieur – Mécanismes, Ombres et Potentiels",
                'description' => "Ce module est l'expérience initiale du modèle de l'ennéagramme. Elle s'appuie sur des activités dans les 3 centres (mental, émotionnel, instinctif).",
                'details' => "Chacun repère à partir de vidéos, d'exercices variés et d'auto-observation, sa base de départ parmi les 9 possibles. Les résultats au questionnaire scientifiquement validé HPEI sont donnés en cours de séminaire, ainsi que la brochure « L'ennéagramme évolutif : les 9 bases ».",
                'icon' => 'FaGem',
            ],
            [
                'title' => "Module 6 : Retraite ennéagrammiste",
                'duration' => "5 JOURS",
                'subtitle' => "Approfondir : Voyage intérieur – Mécanismes, Ombres et Potentiels",
                'description' => "Ce module est l'expérience initiale du modèle de l'ennéagramme. Elle s'appuie sur des activités dans les 3 centres (mental, émotionnel, instinctif).",
                'details' => "Chacun repère à partir de vidéos, d'exercices variés et d'auto-observation, sa base de départ parmi les 9 possibles. Les résultats au questionnaire scientifiquement validé HPEI sont donnés en cours de séminaire, ainsi que la brochure « L'ennéagramme évolutif : les 9 bases ».",
                'icon' => 'FaPrayingHands',
            ],
        ];

        foreach ($approfondirModules as $index => $module) {
            $approfondir->modules()->create(array_merge($module, ['order' => $index]));
        }

        // Transmettre
        $transmettre = Parcours::create([
            'title' => 'Transmettre',
            'slug' => 'transmettre',
            'description' => 'Devenir Praticien Certifié',
            'photo' => '/assets/imgss001/freid (2).jpg',
            'lieu' => 'Jnan Lemonie',
            'horaires' => '9h00 - 17h00',
            'price' => '3000 MAD / Module',
            'cta_link' => '/app/#/course/33',
        ]);

        $transmettreModules = [
            [
                'title' => "Conduite et Animation de Panels",
                'duration' => "3 JOURS",
                'subtitle' => "À la maîtrise – Transmission et transformation",
                'description' => "Ce module est l'expérience initiale du modèle de l'ennéagramme. Elle s'appuie sur des activités dans les 3 centres (mental, émotionnel, instinctif). Chacun repère à partir de vidéos, d'exercices variés et d'auto-observation, sa base de départ parmi les 9 possibles. Les résultats au questionnaire scientifiquement validé HPEI sont donnés en cours de séminaire, ainsi que la brochure « L'ennéagramme évolutif : les 9 bases ».",
                'details' => "",
                'icon' => 'FaChalkboardTeacher',
            ],
            [
                'title' => "DEVENIR PROFILEUR : Processus de l’Entretien Typologique",
                'duration' => "3 JOURS",
                'subtitle' => "",
                'description' => "Ce module est l'expérience initiale du modèle de l'ennéagramme. Elle s'appuie sur des activités dans les 3 centres (mental, émotionnel, instinctif). Chacun repère à partir de vidéos, d'exercices variés et d'auto-observation, sa base de départ parmi les 9 possibles. Les résultats au questionnaire scientifiquement validé HPEI sont donnés en cours de séminaire, ainsi que la brochure « L'ennéagramme évolutif : les 9 bases ».",
                'details' => "",
                'icon' => 'FaUserCheck',
            ],
            [
                'title' => "Superviser, co-développer : 5 cas pratiques filmés",
                'duration' => "3 JOURS",
                'subtitle' => "",
                'description' => "Ce module est l'expérience initiale du modèle de l'ennéagramme. Elle s'appuie sur des activités dans les 3 centres (mental, émotionnel, instinctif). Chacun repère à partir de vidéos, d'exercices variés et d'auto-observation, sa base de départ parmi les 9 possibles. Les résultats au questionnaire scientifiquement validé HPEI sont donnés en cours de séminaire, ainsi que la brochure « L'ennéagramme évolutif : les 9 bases ».",
                'details' => "",
                'icon' => 'FaVideo',
            ],
            [
                'title' => "En croisant l’ennéagramme et la thérapie brève",
                'duration' => "3 JOURS",
                'subtitle' => "",
                'description' => "Ce module est l'expérience initiale du modèle de l'ennéagramme. Elle s'appuie sur des activités dans les 3 centres (mental, émotionnel, instinctif). Chacun repère à partir de vidéos, d'exercices variés et d'auto-observation, sa base de départ parmi les 9 possibles. Les résultats au questionnaire scientifiquement validé HPEI sont donnés en cours de séminaire, ainsi que la brochure « L'ennéagramme évolutif : les 9 bases ».",
                'details' => "",
                'icon' => 'FaHandHoldingHeart',
            ],
            [
                'title' => "Certification à la méthode Ennea-Pro HRH (Devenir formateur HRH)",
                'duration' => "3 JOURS",
                'subtitle' => "",
                'description' => "Ce module est l'expérience initiale du modèle de l'ennéagramme. Elle s'appuie sur des activités dans les 3 centres (mental, émotionnel, instinctif). Chacun repère à partir de vidéos, d'exercices variés et d'auto-observation, sa base de départ parmi les 9 possibles. Les résultats au questionnaire scientifiquement validé HPEI sont donnés en cours de séminaire, ainsi que la brochure « L'ennéagramme évolutif : les 9 bases ».",
                'details' => "",
                'icon' => 'FaCertificate',
            ],
            [
                'title' => "Projet : Ancrer une approche adaptée à son public avec soutenance",
                'duration' => "5 JOURS",
                'subtitle' => "",
                'description' => "Ce module est l'expérience initiale du modèle de l'ennéagramme. Elle s'appuie sur des activités dans les 3 centres (mental, émotionnel, instinctif). Chacun repère à partir de vidéos, d'exercices variés et d'auto-observation, sa base de départ parmi les 9 possibles. Les résultats au questionnaire scientifiquement validé HPEI sont donnés en cours de séminaire, ainsi que la brochure « L'ennéagramme évolutif : les 9 bases ».",
                'details' => "",
                'icon' => 'FaProjectDiagram',
            ],
        ];

        foreach ($transmettreModules as $index => $module) {
            $transmettre->modules()->create(array_merge($module, ['order' => $index]));
        }
    }
}
