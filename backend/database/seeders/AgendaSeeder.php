<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Parcours;
use App\Models\ParcoursModule;
use App\Models\ParcoursSession;
use Carbon\Carbon;

class AgendaSeeder extends Seeder
{
    public function run()
    {
        // Clear existing data
        ParcoursSession::query()->delete();
        ParcoursModule::query()->delete();
        Parcours::query()->delete();

        $scheduleLevels = [
            [
                "id" => "niveau-1",
                "title" => "Niveau 1 – Découvrir : A la découverte de soi",
                "slug" => "decouvrir",
                "description" => "Retrouvez les parcours Découvrir.",
                "modules" => [
                    [
                        "code" => "D1",
                        "name" => "Initiation et Découverte",
                        "days" => 2,
                        "hours" => "9h-17h",
                        "prereq" => "-",
                        "price" => "3 000 €",
                        "sessions" => ["nov-25", "mars-26", "juil-26", "nov-26"],
                    ],
                    [
                        "code" => "D2",
                        "name" => "Centres d’intelligence",
                        "days" => 2,
                        "hours" => "9h-17h",
                        "prereq" => "D1",
                        "price" => "3 000 €",
                        "sessions" => ["déc-25", "avr-26", "août-26", "déc-26"],
                    ],
                    [
                        "code" => "D3",
                        "name" => "Instincts",
                        "days" => 2,
                        "hours" => "9h-17h",
                        "prereq" => "D1 - D2",
                        "price" => "3 000 €",
                        "sessions" => ["janv-26", "mai-26", "sept-26"],
                    ],
                    [
                        "code" => "D4",
                        "name" => "Lumière – Conscience claire de nos mécanismes inconscients",
                        "days" => 2,
                        "hours" => "9h-17h",
                        "prereq" => "D3",
                        "price" => "3 000 €",
                        "sessions" => ["fév-26", "juin-26", "oct-26"],
                    ],
                    [
                        "code" => "D5",
                        "name" => "Ombre – Se libérer des fardeaux de l’ego",
                        "days" => 2,
                        "hours" => "9h-17h",
                        "prereq" => "D3",
                        "price" => "3 000 €",
                        "sessions" => ["mars-26", "juil-26", "nov-26"],
                    ],
                    [
                        "code" => "D6",
                        "name" => "Profondeur – Être autonome dans le chemin d’évolution",
                        "days" => 2,
                        "hours" => "9h-17h",
                        "prereq" => "D3",
                        "price" => "3 000 €",
                        "sessions" => ["avr-26", "août-26", "déc-26"],
                    ],
                ],
            ],
            [
                "id" => "niveau-2",
                "title" => "Niveau 2 – Approfondir",
                "slug" => "approfondir",
                "description" => "Retrouvez les parcours Approfondir.",
                "modules" => [
                    [
                        "code" => "V1",
                        "name" => "Ressemblance et confusion",
                        "days" => 2,
                        "hours" => "9h-17h",
                        "prereq" => "D",
                        "price" => "3 400 €",
                        "sessions" => ["mai-26", "sept-26"],
                    ],
                    [
                        "code" => "V2",
                        "name" => "Relations en Ennéagramme",
                        "days" => 2,
                        "hours" => "9h-17h",
                        "prereq" => "V1",
                        "price" => "3 400 €",
                        "sessions" => ["juin-26", "oct-26"],
                    ],
                    [
                        "code" => "V3",
                        "name" => "Pathologie et ombres",
                        "days" => 2,
                        "hours" => "9h-17h",
                        "prereq" => "V1",
                        "price" => "3 400 €",
                        "sessions" => ["juil-26", "nov-26"],
                    ],
                    [
                        "code" => "V4",
                        "name" => "Grand Panel & pistes de développements",
                        "days" => 2,
                        "hours" => "9h-17h",
                        "prereq" => "V2 - V3",
                        "price" => "3 400 €",
                        "sessions" => ["août-26", "déc-26"],
                    ],
                    [
                        "code" => "V5",
                        "name" => "Intégration : Ennéagramme et profils jungiens",
                        "days" => 2,
                        "hours" => "9h-17h",
                        "prereq" => "V2",
                        "price" => "3 400 €",
                        "sessions" => ["sept-26", "janv-27"],
                    ],
                    [
                        "code" => "V6",
                        "name" => "Retraite enneagrammiste",
                        "days" => 5,
                        "hours" => "9h-17h",
                        "prereq" => "V2 - V3",
                        "price" => "8 500 €",
                        "sessions" => ["oct-26", "fév-27"],
                    ],
                ],
            ],
            [
                "id" => "niveau-3",
                "title" => "Niveau 3 – À la maîtrise",
                "slug" => "transmettre",
                "description" => "Retrouvez les parcours Transmettre.",
                "modules" => [
                    [
                        "code" => "M1",
                        "name" => "Conduite et Animation de Panels",
                        "days" => 3,
                        "hours" => "9h-17h",
                        "prereq" => "V",
                        "price" => "5 100 €",
                        "sessions" => ["nov-26", "mars-27"],
                    ],
                    [
                        "code" => "M2",
                        "name" => "DEVENIR PROFILEUR : Processus de l’Entretien Typologique",
                        "days" => 3,
                        "hours" => "9h-17h",
                        "prereq" => "M1",
                        "price" => "5 100 €",
                        "sessions" => ["déc-26", "avr-27"],
                    ],
                    [
                        "code" => "M3",
                        "name" => "Superviser, co-développer : 5 cas pratiques filmés",
                        "days" => 3,
                        "hours" => "9h-17h",
                        "prereq" => "M2",
                        "price" => "5 100 €",
                        "sessions" => ["janv-27"],
                    ],
                    [
                        "code" => "M4",
                        "name" => "En croisant l’ennéagramme et la thérapie brève",
                        "days" => 3,
                        "hours" => "9h-17h",
                        "prereq" => "B1 - B2 - B3",
                        "price" => "5 100 €",
                        "sessions" => ["fév-27"],
                    ],
                    [
                        "code" => "M5",
                        "name" => "Certification à la méthode Ennea-Pro HRH (Devenir formateur HRH)",
                        "days" => 3,
                        "hours" => "9h-17h",
                        "prereq" => "M2 - M4",
                        "price" => "5 100 €",
                        "sessions" => ["mars-27"],
                    ],
                    [
                        "code" => "M6",
                        "name" => "Projet : Ancrer une approche adaptée à son public avec soutenance",
                        "days" => 5,
                        "hours" => "9h-17h",
                        "prereq" => "M4",
                        "price" => "8 500 €",
                        "sessions" => ["avr-27"],
                    ],
                ],
            ],
        ];

        $months = [
            'janv' => 1, 'fév' => 2, 'mars' => 3, 'avr' => 4, 'mai' => 5, 'juin' => 6,
            'juil' => 7, 'août' => 8, 'sept' => 9, 'oct' => 10, 'nov' => 11, 'déc' => 12
        ];

        foreach ($scheduleLevels as $level) {
            $parcours = Parcours::create([
                'title' => $level['title'],
                'slug' => $level['slug'],
                'description' => $level['description'],
                'is_active' => true,
            ]);

            foreach ($level['modules'] as $modData) {
                $module = ParcoursModule::create([
                    'parcours_id' => $parcours->id,
                    'title' => $modData['name'],
                    'subtitle' => $modData['code'],
                    'duration' => $modData['days'] . ' jours',
                    'horaires' => $modData['hours'],
                    'prerequis' => $modData['prereq'],
                    'price' => trim(str_replace(['€', 'EUR'], '', $modData['price'])) . ' MAD',
                ]);

                foreach ($modData['sessions'] as $sessionStr) {
                    // Parse "nov-25"
                    $parts = explode('-', $sessionStr);
                    $monthName = $parts[0];
                    $yearShort = $parts[1];
                    $month = $months[$monthName];
                    $year = 2000 + intval($yearShort);

                    // Create a date (e.g., 1st of the month)
                    $startDate = Carbon::create($year, $month, 1, 9, 0, 0);
                    $endDate = $startDate->copy()->addDays($modData['days'])->setHour(17);

                    ParcoursSession::create([
                        'parcours_module_id' => $module->id,
                        'start_date' => $startDate,
                        'end_date' => $endDate,
                        'location' => 'Jnan Lemonie',
                        'max_participants' => 20,
                    ]);
                }
            }
        }
    }
}
