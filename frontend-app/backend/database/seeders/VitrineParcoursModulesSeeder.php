<?php

namespace Database\Seeders;

use App\Models\Parcours;
use App\Models\ParcoursModule;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class VitrineParcoursModulesSeeder extends Seeder
{
    /**
     * Fill module fields (description/details/icon/price/place) from the existing Vitrine defaults.
     *
     * Matching strategy:
     * - Find Parcours by slug (decouvrir/approfondir/transmettre)
     * - Match modules by `order` (0..n-1). If not present, fallback to a fuzzy title match.
     *
     * This avoids creating duplicates; it only updates existing modules.
     */
    public function run(): void
    {
        $data = $this->getVitrineDefaults();

        $defaultPlace = "Ferme J'nan Lemonie — Sidi Yamani";
        $defaultTime = '9H – 17H';

        // Per-parcours default prices (will be applied only when current DB value is empty)
        $defaultPrices = [
            'decouvrir' => '3 000 MAD',
            'approfondir' => '3 800 MAD',
            'transmettre' => '3 400 MAD',
        ];

        DB::transaction(function () use ($data, $defaultPlace, $defaultTime, $defaultPrices) {
            foreach ($data as $slug => $modules) {
                $parcours = Parcours::where('slug', $slug)->with('modules')->first();

                if (!$parcours) {
                    $this->command?->warn("[VitrineParcoursModulesSeeder] Parcours not found for slug '{$slug}', skipping.");
                    continue;
                }

                $this->command?->info("[VitrineParcoursModulesSeeder] Updating modules for '{$slug}' (parcours_id={$parcours->id})");

                // Apply parcours-level defaults (vitrine pages show these at parcours level)
                if (empty($parcours->lieu)) {
                    $parcours->lieu = $defaultPlace;
                }
                if (empty($parcours->horaires)) {
                    $parcours->horaires = $defaultTime;
                }
                $parcours->save();

                $normalizedIndex = $parcours->modules
                    ->keyBy(fn (ParcoursModule $m) => $this->normalizeTitle((string) $m->title));

                foreach ($modules as $index => $moduleDefaults) {
                    $module = null;

                    // Try by order first when it's meaningful.
                    if ($parcours->modules->contains('order', $index)) {
                        $module = $parcours->modules->firstWhere('order', $index);
                    }

                    // Fallback: match by normalized title (accent/encoding insensitive)
                    if (!$module && !empty($moduleDefaults['title'])) {
                        $needle = $this->normalizeTitle((string) $moduleDefaults['title']);
                        $module = $normalizedIndex->get($needle);
                    }

                    // Fallback: loose contains match for cases like "Module 1 : ..." vs "Ressemblance et confusion"
                    if (!$module && !empty($moduleDefaults['title'])) {
                        $needle = $this->normalizeTitle((string) $moduleDefaults['title']);
                        $module = $parcours->modules->first(function (ParcoursModule $m) use ($needle) {
                            $hay = $this->normalizeTitle((string) $m->title);
                            return Str::contains($hay, $needle) || Str::contains($needle, $hay);
                        });
                    }

                    if (!$module) {
                        $this->command?->warn("  - Module not found at order={$index} (title='{$moduleDefaults['title']}'), skipping.");
                        continue;
                    }

                    $resolvedPrice = $moduleDefaults['price'] ?? null;
                    if ($resolvedPrice === null || $resolvedPrice === '') {
                        $resolvedPrice = $defaultPrices[$slug] ?? null;
                    }

                    $resolvedPlace = $moduleDefaults['place'] ?? null;
                    if ($resolvedPlace === null || $resolvedPlace === '') {
                        $resolvedPlace = $defaultPlace;
                    }

                    $details = $moduleDefaults['details'] ?? null;

                    $module->fill([
                        // Keep title in sync with content defaults when provided.
                        'title' => $moduleDefaults['title'] ?? $module->title,
                        'subtitle' => $moduleDefaults['subtitle'] ?? $module->subtitle,
                        'description' => $moduleDefaults['description'] ?? $module->description,
                        'details' => $details ?? $module->details,
                        'icon' => $moduleDefaults['icon'] ?? $module->icon,
                        // Apply defaults only when DB is empty to avoid overwriting manual edits.
                        'price' => $module->price ?: $resolvedPrice,
                        'place' => $module->place ?: $resolvedPlace,
                    ]);

                    $module->save();
                }

                // Persist parcours total price as sum of module prices
                $parcours->load('modules');
                $sum = 0;
                foreach ($parcours->modules as $m) {
                    $sum += $this->parsePriceToInt($m->price);
                }
                $parcours->price = $this->formatIntToMad($sum);
                $parcours->save();
            }
        });
    }

    /**
     * NOTE: This data is copied from the current Vitrine pages (Découvrir/Approfondir/Transmettre).
     * We store icon as the FontAwesome component name string (ex: FaCompass).
     */
    private function getVitrineDefaults(): array
    {
        return [
            'decouvrir' => [
                [
                    'title' => "Initiation et Découverte",
                    'duration' => '2 JOURS',
                    'subtitle' => "À la découverte de soi – Les 27 visages de la personnalité",
                    'description' => "Ce module est une porte d'entrée vers la connaissance de soi grâce à l'Ennéagramme. Vous y découvrirez que nous fonctionnons avec des mécanismes profonds, des forces et des freins, ainsi qu'avec nos centres d'intelligence et nos instincts dominants.",
                    'details' => "La méthode alterne apports théoriques, panels vivants et exercices pratiques, individuels et en groupe, dans un cadre bienveillant. Vous repartirez avec une carte claire du fonctionnement de votre personnalité. Un séminaire transformateur, aussi bien pour le développement personnel que pour les relations professionnelles.",
                    'icon' => 'FaCompass',
                ],
                [
                    'title' => "Centres d'intelligence",
                    'duration' => '2 JOURS',
                    'subtitle' => "Explorer vos trois intelligences",
                    'description' => "Ce module vous invite à explorer vos trois intelligences : corporelle, émotionnelle et mentale. Vous découvrirez comment elles orientent vos décisions, vos émotions et vos comportements.",
                    'details' => "Des panels vivants, exercices pratiques et mises en situation rendent l'expérience concrète et profonde. Vous apprendrez à reconnaître vos déséquilibres et à rééquilibrer vos centres pour plus d'alignement intérieur. Un séminaire puissant pour développer vos ressources, gagner en clarté et enrichir vos relations.",
                    'icon' => 'FaBrain',
                ],
                [
                    'title' => "Instincts",
                    'duration' => '2 JOURS',
                    'subtitle' => "Les trois forces vitales qui guident nos comportements",
                    'description' => "Ce module explore les trois forces vitales qui guident nos comportements : préservation, social et tête-à-tête. Vous découvrirez votre instinct dominant, ses peurs associées et son impact sur vos choix de vie.",
                    'details' => "Grâce à des panels, exercices et mises en situation, vous expérimenterez vos dynamiques instinctives. Vous apprendrez à rééquilibrer vos instincts pour retrouver harmonie et puissance intérieure. Un séminaire essentiel pour mieux comprendre vos élans profonds et enrichir vos relations.",
                    'icon' => 'FaHeart',
                ],
                [
                    'title' => "Lumière",
                    'duration' => '2 JOURS',
                    'subtitle' => "Conscience claire de nos mécanismes inconscients",
                    'description' => "Ce module donne la lumière sur nos mécanismes limitants de l'ego. Les participants découvrent leurs Compulsions d'évitement, leurs Passions (émotions dominantes), leurs Fixations (schémas mentaux) et leur Attention première (filtre de perception).",
                    'details' => "Des exercices pratiques, mises en situation et travaux en binômes rendent l'exploration concrète. Chacun prend conscience de ses automatismes et de la manière dont ils influencent ses relations.",
                    'icon' => 'FaLightbulb',
                ],
                [
                    'title' => "Ombre",
                    'duration' => '2 JOURS',
                    'subtitle' => "Se libérer des fardeaux de l'ego",
                    'description' => "Ce module explore l'ego dans ses attachements et ses fragilités. Les participants étudient l'Orgueil, les Pathologies potentielles et les Mécanismes de défense de chaque type.",
                    'details' => "Lien est fait avec les instincts et les chemins d'intégration intérieure. Panels, études de cas et exercices d'ancrage favorisent une prise de conscience profonde. Un séminaire de maturité pour transformer ses fragilités en leviers d'évolution.",
                    'icon' => 'FaMoon',
                ],
                [
                    'title' => "Profondeur",
                    'duration' => '2 JOURS',
                    'subtitle' => "Être Autonome dans le chemin d'évolution",
                    'description' => "Ce module offre une entrée positive et concrète dans les dynamiques de l'Ennéagramme. Les participants découvrent les Vertus (idéal supérieur), leurs Forces principales (talents naturels).",
                    'details' => "Une pédagogie vivante alterne apports, panels et exercices d'introspection. Chaque stagiaire identifie sa propre vertu, sa force et son mode d'attention. Un séminaire lumineux pour repartir avec une lecture valorisante et motivante de son type.",
                    'icon' => 'FaGem',
                ],
            ],
            'approfondir' => [
                [
                    'title' => 'Ressemblance et confusion',
                    'duration' => '2 JOURS',
                    'subtitle' => "Approfondir : Voyage intérieur – Mécanismes, Ombres et Potentiels",
                    'description' => "Ce module est l'expérience initiale du modèle de l'ennéagramme. Elle s'appuie sur des activités dans les 3 centres (mental, émotionnel, instinctif).",
                    'details' => "Chacun repère à partir de vidéos, d'exercices variés et d'auto-observation, sa base de départ parmi les 9 possibles. Les résultats au questionnaire scientifiquement validé HPEI sont donnés en cours de séminaire, ainsi que la brochure « L'ennéagramme évolutif : les 9 bases ».",
                    'icon' => 'FaCompass',
                ],
                [
                    'title' => 'Relations en Ennéagramme',
                    'duration' => '2 JOURS',
                    'subtitle' => "Approfondir : Voyage intérieur – Mécanismes, Ombres et Potentiels",
                    'description' => "Ce module est l'expérience initiale du modèle de l'ennéagramme. Elle s'appuie sur des activités dans les 3 centres (mental, émotionnel, instinctif).",
                    'details' => "Chacun repère à partir de vidéos, d'exercices variés et d'auto-observation, sa base de départ parmi les 9 possibles. Les résultats au questionnaire scientifiquement validé HPEI sont donnés en cours de séminaire, ainsi que la brochure « L'ennéagramme évolutif : les 9 bases ».",
                    'icon' => 'FaUsers',
                ],
                [
                    'title' => 'Pathologie et ombres',
                    'duration' => '2 JOURS',
                    'subtitle' => "Approfondir : Voyage intérieur – Mécanismes, Ombres et Potentiels",
                    'description' => "Ce module est l'expérience initiale du modèle de l'ennéagramme. Elle s'appuie sur des activités dans les 3 centres (mental, émotionnel, instinctif).",
                    'details' => "Chacun repère à partir de vidéos, d'exercices variés et d'auto-observation, sa base de départ parmi les 9 possibles. Les résultats au questionnaire scientifiquement validé HPEI sont donnés en cours de séminaire, ainsi que la brochure « L'ennéagramme évolutif : les 9 bases ».",
                    'icon' => 'FaMoon',
                ],
                [
                    'title' => 'Grand Panel & pistes de développements',
                    'duration' => '2 JOURS',
                    'subtitle' => "Approfondir : Voyage intérieur – Mécanismes, Ombres et Potentiels",
                    'description' => "Ce module est l'expérience initiale du modèle de l'ennéagramme. Elle s'appuie sur des activités dans les 3 centres (mental, émotionnel, instinctif).",
                    'details' => "Chacun repère à partir de vidéos, d'exercices variés et d'auto-observation, sa base de départ parmi les 9 possibles. Les résultats au questionnaire scientifiquement validé HPEI sont donnés en cours de séminaire, ainsi que la brochure « L'ennéagramme évolutif : les 9 bases ».",
                    'icon' => 'FaLightbulb',
                ],
                [
                    'title' => 'Intégration: ennéagramme et profils jungiens',
                    'duration' => '2 JOURS',
                    'subtitle' => "Approfondir : Voyage intérieur – Mécanismes, Ombres et Potentiels",
                    'description' => "Ce module est l'expérience initiale du modèle de l'ennéagramme. Elle s'appuie sur des activités dans les 3 centres (mental, émotionnel, instinctif).",
                    'details' => "Chacun repère à partir de vidéos, d'exercices variés et d'auto-observation, sa base de départ parmi les 9 possibles. Les résultats au questionnaire scientifiquement validé HPEI sont donnés en cours de séminaire, ainsi que la brochure « L'ennéagramme évolutif : les 9 bases ».",
                    'icon' => 'FaGem',
                ],
                [
                    'title' => 'Retraite ennéagrammiste',
                    'duration' => '5 JOURS',
                    'subtitle' => "Approfondir : Voyage intérieur – Mécanismes, Ombres et Potentiels",
                    'description' => "Ce module est l'expérience initiale du modèle de l'ennéagramme. Elle s'appuie sur des activités dans les 3 centres (mental, émotionnel, instinctif).",
                    'details' => "Chacun repère à partir de vidéos, d'exercices variés et d'auto-observation, sa base de départ parmi les 9 possibles. Les résultats au questionnaire scientifiquement validé HPEI sont donnés en cours de séminaire, ainsi que la brochure « L'ennéagramme évolutif : les 9 bases ».",
                    'icon' => 'FaPrayingHands',
                ],
            ],
            'transmettre' => [
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
            ],
        ];
    }

    private function normalizeTitle(string $s): string
    {
        $s = trim($s);
        if ($s === '') {
            return '';
        }

        // Lowercase + transliterate (remove accents) when possible.
        $s = mb_strtolower($s);
        $s = Str::ascii($s);

        // Normalize punctuation/whitespace.
        $s = preg_replace('/[^a-z0-9]+/i', ' ', $s) ?? $s;
        $s = preg_replace('/\s+/', ' ', $s) ?? $s;

        return trim($s);
    }

    private function parsePriceToInt(?string $price): int
    {
        if (!$price) {
            return 0;
        }

        $digits = preg_replace('/[^0-9]/', '', $price) ?? '';
        if ($digits === '') {
            return 0;
        }

        return (int) $digits;
    }

    private function formatIntToMad(int $amount): string
    {
        return number_format($amount, 0, '.', ' ') . ' MAD';
    }
}
