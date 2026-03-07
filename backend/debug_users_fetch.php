<?php

require_once __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

echo "=== Debug: Problème de fetch users ===\n\n";

try {
    // Test 1: Vérifier la route et la méthode
    echo "1. Test de l'endpoint API directement:\n";
    
    // Simuler une requête authentifiée en créant un token
    $adminUser = \App\Models\User::where('role', 'admin')->first();
    
    if (!$adminUser) {
        // Créer un admin de test si nécessaire
        $adminUser = \App\Models\User::create([
            'firstName' => 'Admin',
            'lastName' => 'Test',
            'email' => 'admin@test.com',
            'password' => bcrypt('password'),
            'role' => 'admin'
        ]);
        echo "   ✓ Admin de test créé\n";
    }
    
    echo "   ✓ Admin trouvé: {$adminUser->firstName} {$adminUser->lastName} ({$adminUser->email})\n";
    
    // Test 2: Vérifier les utilisateurs dans la base
    $usersCount = \App\Models\User::count();
    echo "\n2. Utilisateurs en base de données:\n";
    echo "   ✓ Total: {$usersCount} utilisateurs\n";
    
    $usersByRole = \App\Models\User::selectRaw('role, COUNT(*) as count')
        ->groupBy('role')
        ->get();
    
    foreach ($usersByRole as $roleData) {
        echo "   - {$roleData->role}: {$roleData->count}\n";
    }
    
    // Test 3: Tester la logique du contrôleur
    echo "\n3. Test de la logique d'autorisation:\n";
    $allowedRoles = ['admin', 'employee'];
    $adminRole = $adminUser->role;
    $isAuthorized = in_array($adminRole, $allowedRoles);
    echo "   ✓ Rôle admin: {$adminRole}\n";
    echo "   ✓ Autorisé: " . ($isAuthorized ? 'OUI' : 'NON') . "\n";
    
    // Test 4: Simuler la récupération des users comme le contrôleur
    if ($isAuthorized) {
        echo "\n4. Test de récupération des utilisateurs:\n";
        $users = \App\Models\User::orderBy('created_at', 'desc')->get();
        echo "   ✓ Utilisateurs récupérés: {$users->count()}\n";
        
        foreach ($users->take(3) as $user) {
            echo "   - {$user->firstName} {$user->lastName} ({$user->role})\n";
        }
    }
    
    // Test 5: Générer un token pour les tests frontend
    echo "\n5. Token de test pour le frontend:\n";
    $token = $adminUser->createToken('test-token')->plainTextToken;
    echo "   ✓ Token généré: {$token}\n";
    echo "   📋 Pour tester dans le frontend:\n";
    echo "      localStorage.setItem('auth_token', '{$token}');\n";
    
} catch (\Exception $e) {
    echo "❌ Erreur: " . $e->getMessage() . "\n";
    echo "Stack trace:\n" . $e->getTraceAsString() . "\n";
}

echo "\n=== Solutions recommandées ===\n";
echo "1. 🔐 Authentification:\n";
echo "   - Vérifier que l'utilisateur est connecté\n";
echo "   - Vérifier que le token est valide\n";
echo "   - Vérifier les en-têtes Authorization\n\n";

echo "2. 🔑 Permissions:\n";
echo "   - Seuls admin/employee peuvent fetch les users\n";
echo "   - Vérifier le rôle de l'utilisateur connecté\n\n";

echo "3. 🔧 Debug frontend:\n";
echo "   - Ouvrir Console > Network dans le navigateur\n";
echo "   - Vérifier la requête vers /api/users\n";
echo "   - Vérifier l'en-tête Authorization: Bearer <token>\n\n";

echo "4. 💡 Test rapide:\n";
echo "   - Se connecter en tant qu'admin\n";
echo "   - Utiliser le token généré ci-dessus\n";
echo "   - Vérifier que fetchUsersAsync() fonctionne\n";

echo "\n=== Debug terminé ===\n";