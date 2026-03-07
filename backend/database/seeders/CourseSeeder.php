<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Course;

class CourseSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $courses = [
            [
                'title' => 'Allemand Niveau A1 - Débutant',
                'description' => 'Apprenez les bases de la langue allemande avec ce cours intensif niveau A1. Vous découvrirez l\'alphabet, les salutations, les présentations personnelles, les nombres, les couleurs, et les expressions de base pour la vie quotidienne. Ce cours vous permettra de vous familiariser avec la prononciation allemande et d\'acquérir le vocabulaire essentiel pour commencer à communiquer.',
                'short_description' => 'Cours d\'allemand pour débutants complets - Niveau A1 du CECR',
                'image_url' => 'https://images.unsplash.com/photo-1527866959252-deab85ef7d1b?q=80&w=2070&auto=format&fit=crop',
                'type' => 'in-person',
                'duration_months' => 4,
                'sessions_per_month' => 8,
                'status' => 'active'
            ],
            [
                'title' => 'Allemand Niveau A1 - Débutant (En ligne)',
                'description' => 'Version en ligne de notre cours A1 avec interaction en temps réel. Parfait pour ceux qui préfèrent apprendre depuis chez eux tout en bénéficiant d\'un enseignement de qualité. Cours interactifs avec exercices pratiques, vidéos et supports numériques.',
                'short_description' => 'Cours d\'allemand A1 en ligne avec interaction en temps réel',
                'image_url' => 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=2070&auto=format&fit=crop',
                'type' => 'online',
                'duration_months' => 4,
                'sessions_per_month' => 8,
                'status' => 'active'
            ],
            [
                'title' => 'Allemand Niveau A2 - Élémentaire',
                'description' => 'Développez vos compétences en allemand avec ce cours niveau A2. Approfondissez la grammaire de base, enrichissez votre vocabulaire et améliorez votre capacité à communiquer dans des situations familières. Abordez des sujets comme la famille, le travail, les loisirs et les voyages.',
                'short_description' => 'Perfectionnez vos bases en allemand - Niveau A2 du CECR',
                'image_url' => 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?q=80&w=2070&auto=format&fit=crop',
                'type' => 'in-person',
                'duration_months' => 5,
                'sessions_per_month' => 8,
                'status' => 'active'
            ],
            [
                'title' => 'Allemand Niveau A2 - Élémentaire (En ligne)',
                'description' => 'Cours A2 en ligne avec approche communicative. Développez votre aisance à l\'oral et à l\'écrit à travers des exercices pratiques et des mises en situation réelles.',
                'short_description' => 'Cours d\'allemand A2 en ligne avec méthode communicative',
                'image_url' => 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?q=80&w=2126&auto=format&fit=crop',
                'type' => 'online',
                'duration_months' => 5,
                'sessions_per_month' => 8,
                'status' => 'active'
            ],
            [
                'title' => 'Allemand Niveau B1 - Intermédiaire',
                'description' => 'Atteignez un niveau intermédiaire en allemand avec ce cours B1. Maîtrisez les structures grammaticales complexes, exprimez vos opinions, racontez des expériences et comprenez des textes plus élaborés. Préparez-vous aux examens officiels comme le Goethe-Zertifikat B1.',
                'short_description' => 'Cours d\'allemand intermédiaire - Niveau B1 du CECR',
                'image_url' => 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=2070&auto=format&fit=crop',
                'type' => 'in-person',
                'duration_months' => 6,
                'sessions_per_month' => 8,
                'status' => 'active'
            ],
            [
                'title' => 'Allemand Niveau B1 - Intermédiaire (En ligne)',
                'description' => 'Cours B1 en ligne avec focus sur l\'expression orale et la compréhension. Débats, présentations et discussions sur des sujets d\'actualité.',
                'short_description' => 'Cours d\'allemand B1 en ligne axé sur l\'expression orale',
                'image_url' => 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2071&auto=format&fit=crop',
                'type' => 'online',
                'duration_months' => 6,
                'sessions_per_month' => 8,
                'status' => 'active'
            ],
            [
                'title' => 'Allemand Niveau B2 - Intermédiaire Avancé',
                'description' => 'Perfectionnez votre allemand avec ce cours niveau B2. Abordez des sujets complexes, analysez des textes littéraires et journalistiques, exprimez des nuances d\'opinion et préparez-vous aux examens B2. Idéal pour les études ou le travail en pays germanophones.',
                'short_description' => 'Allemand avancé pour études et travail - Niveau B2 du CECR',
                'image_url' => 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?q=80&w=2086&auto=format&fit=crop',
                'type' => 'in-person',
                'duration_months' => 7,
                'sessions_per_month' => 6,
                'status' => 'active'
            ],
            [
                'title' => 'Allemand Niveau B2 - Intermédiaire Avancé (En ligne)',
                'description' => 'Cours B2 en ligne pour professionnels et étudiants. Focus sur l\'allemand des affaires et académique.',
                'short_description' => 'Allemand B2 en ligne - Business et académique',
                'image_url' => 'https://images.unsplash.com/photo-1553877522-43269d4ea984?q=80&w=2070&auto=format&fit=crop',
                'type' => 'online',
                'duration_months' => 7,
                'sessions_per_month' => 6,
                'status' => 'active'
            ],
            [
                'title' => 'Allemand Niveau C1 - Avancé',
                'description' => 'Atteignez un niveau avancé en allemand avec ce cours C1. Maîtrisez les subtilités de la langue, analysez des œuvres littéraires, participez à des débats complexes et rédigez des textes argumentatifs sophistiqués. Préparation aux examens C1.',
                'short_description' => 'Allemand avancé - Niveau C1 pour la maîtrise linguistique',
                'image_url' => 'https://images.unsplash.com/photo-1568667256549-094345857637?q=80&w=2015&auto=format&fit=crop',
                'type' => 'in-person',
                'duration_months' => 8,
                'sessions_per_month' => 6,
                'status' => 'active'
            ],
            [
                'title' => 'Allemand Niveau C2 - Maîtrise',
                'description' => 'Atteignez la maîtrise complète de l\'allemand avec ce cours niveau C2. Explorez la richesse de la langue allemande à travers la littérature, la philosophie et les médias. Développez une expression orale et écrite d\'un niveau quasi-natif.',
                'short_description' => 'Maîtrise complète de l\'allemand - Niveau C2 du CECR',
                'image_url' => 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?q=80&w=2070&auto=format&fit=crop',
                'type' => 'in-person',
                'duration_months' => 10,
                'sessions_per_month' => 4,
                'status' => 'active'
            ]
        ];

        foreach ($courses as $courseData) {
            Course::create($courseData);
        }
    }
}
