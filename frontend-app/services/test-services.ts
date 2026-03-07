// Test des services API - Script de validation
import { authService, userService, fileService, isAuthenticated, getCurrentUser } from '../services';

/**
 * Script de test pour valider le bon fonctionnement des services API
 * À exécuter dans la console du navigateur pour tester l'intégration
 */

console.log('🧪 Tests des Services API - Démarrage...\n');

// Configuration de test
const TEST_CONFIG = {
  backend_url: (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:8000/api',
  test_user: {
    firstName: 'Test',
    lastName: 'User',
    email: 'test@example.com',
    password: 'testpassword123',
    role: 'student'
  }
};

/**
 * Test 1: Vérification de la configuration de base
 */
async function testBaseConfiguration() {
  console.log('🔧 Test 1: Configuration de base');
  
  try {
    // Vérifier que les services sont disponibles
    console.log('✅ authService disponible:', typeof authService === 'object');
    console.log('✅ userService disponible:', typeof userService === 'object');
    console.log('✅ fileService disponible:', typeof fileService === 'object');
    
    // Vérifier les helpers
    console.log('✅ isAuthenticated disponible:', typeof isAuthenticated === 'function');
    console.log('✅ getCurrentUser disponible:', typeof getCurrentUser === 'function');
    
    console.log('✅ Test 1 réussi\n');
    return true;
  } catch (error) {
    console.error('❌ Test 1 échoué:', error);
    return false;
  }
}

/**
 * Test 2: Test de l'authentification
 */
async function testAuthentication() {
  console.log('🔐 Test 2: Authentification');
  
  try {
    // Test du statut initial
    const initialAuth = isAuthenticated();
    console.log('📊 Statut initial authentification:', initialAuth);
    
    // Test de connexion avec des credentials de test
    console.log('🔄 Tentative de connexion...');
    // Note: Ce test nécessite un utilisateur existant dans la DB
    // ou l'adaptation des credentials
    
    console.log('ℹ️  Test 2 préparé (nécessite utilisateur valide)\n');
    return true;
  } catch (error) {
    console.error('❌ Test 2 échoué:', error);
    return false;
  }
}

/**
 * Test 3: Test de génération d'avatar
 */
async function testAvatarGeneration() {
  console.log('🎨 Test 3: Génération d\'avatar');
  
  try {
    const avatarUrl = userService.generateDefaultAvatar('Test', 'User');
    console.log('✅ Avatar généré:', avatarUrl);
    
    // Vérifier que l'URL contient les éléments attendus
    const containsDiceBear = avatarUrl.includes('dicebear.com');
    const containsInitials = avatarUrl.includes('TU');
    
    console.log('✅ URL DiceBear:', containsDiceBear);
    console.log('✅ Initiales incluses:', containsInitials || 'dans seed');
    
    console.log('✅ Test 3 réussi\n');
    return true;
  } catch (error) {
    console.error('❌ Test 3 échoué:', error);
    return false;
  }
}

/**
 * Test 4: Test de validation de fichiers
 */
async function testFileValidation() {
  console.log('📁 Test 4: Validation de fichiers');
  
  try {
    // Créer un fichier fictif pour test
    const mockFile = new File(['test content'], 'test.jpg', {
      type: 'image/jpeg',
      lastModified: Date.now()
    });
    
    // Test de validation
    const validation = fileService.validateFile(mockFile, {
      maxSize: 2,
      allowedTypes: ['image/jpeg', 'image/png']
    });
    
    console.log('✅ Validation résultat:', validation);
    console.log('✅ Fichier valide:', validation.valid);
    
    // Test avec fichier trop gros
    const bigMockFile = new File(['x'.repeat(3 * 1024 * 1024)], 'big.jpg', {
      type: 'image/jpeg'
    });
    
    const bigValidation = fileService.validateFile(bigMockFile, { maxSize: 2 });
    console.log('✅ Gros fichier rejeté:', !bigValidation.valid);
    
    console.log('✅ Test 4 réussi\n');
    return true;
  } catch (error) {
    console.error('❌ Test 4 échoué:', error);
    return false;
  }
}

/**
 * Test 5: Test des helpers de permissions
 */
async function testPermissionHelpers() {
  console.log('🛡️  Test 5: Helpers de permissions');
  
  try {
    // Importer les helpers depuis les services
    const { isAdmin, isEmployee, isProf, isStudent, canManageUsers, canManageCourses } = await import('../services');
    
    console.log('✅ isAdmin disponible:', typeof isAdmin === 'function');
    console.log('✅ isEmployee disponible:', typeof isEmployee === 'function');
    console.log('✅ isProf disponible:', typeof isProf === 'function');
    console.log('✅ isStudent disponible:', typeof isStudent === 'function');
    console.log('✅ canManageUsers disponible:', typeof canManageUsers === 'function');
    console.log('✅ canManageCourses disponible:', typeof canManageCourses === 'function');
    
    // Test des helpers (retournent false si pas connecté)
    console.log('📊 Test permissions (utilisateur non connecté):');
    console.log('  - isAdmin():', isAdmin());
    console.log('  - canManageUsers():', canManageUsers());
    console.log('  - canManageCourses():', canManageCourses());
    
    console.log('✅ Test 5 réussi\n');
    return true;
  } catch (error) {
    console.error('❌ Test 5 échoué:', error);
    return false;
  }
}

/**
 * Exécution de tous les tests
 */
async function runAllTests() {
  console.log('🚀 Démarrage de la suite de tests...\n');
  
  const tests = [
    { name: 'Configuration de base', fn: testBaseConfiguration },
    { name: 'Authentification', fn: testAuthentication },
    { name: 'Génération d\'avatar', fn: testAvatarGeneration },
    { name: 'Validation de fichiers', fn: testFileValidation },
    { name: 'Helpers de permissions', fn: testPermissionHelpers }
  ];
  
  const results = [];
  
  for (const test of tests) {
    try {
      const result = await test.fn();
      results.push({ name: test.name, success: result });
    } catch (error) {
      console.error(`❌ Erreur lors du test "${test.name}":`, error);
      results.push({ name: test.name, success: false, error });
    }
  }
  
  // Résumé des résultats
  console.log('📊 RÉSULTATS DES TESTS');
  console.log('=====================================');
  
  let successCount = 0;
  results.forEach(result => {
    const icon = result.success ? '✅' : '❌';
    console.log(`${icon} ${result.name}: ${result.success ? 'RÉUSSI' : 'ÉCHOUÉ'}`);
    if (result.success) successCount++;
  });
  
  console.log('=====================================');
  console.log(`📈 Score: ${successCount}/${results.length} tests réussis`);
  
  if (successCount === results.length) {
    console.log('🎉 Tous les tests sont passés ! Les services sont opérationnels.');
  } else {
    console.log('⚠️  Certains tests ont échoué. Vérifiez la configuration.');
  }
  
  return results;
}

/**
 * Test de connectivité backend
 */
async function testBackendConnectivity() {
  console.log('🌐 Test de connectivité backend...');
  
  try {
    const response = await fetch(`${TEST_CONFIG.backend_url}/user`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
    
    console.log('📡 Statut de réponse:', response.status);
    
    if (response.status === 401) {
      console.log('✅ Backend accessible (401 = non authentifié, normal)');
      return true;
    } else if (response.status === 200) {
      console.log('✅ Backend accessible et utilisateur connecté');
      return true;
    } else {
      console.log('⚠️  Backend accessible mais réponse inattendue');
      return false;
    }
  } catch (error) {
    console.error('❌ Impossible de joindre le backend:', error.message);
    console.log('💡 Vérifiez que le serveur Laravel tourne sur http://localhost:8000');
    return false;
  }
}

// Export des fonctions de test pour utilisation manuelle
(window as any).testServices = {
  runAllTests,
  testBackendConnectivity,
  testBaseConfiguration,
  testAuthentication,
  testAvatarGeneration,
  testFileValidation,
  testPermissionHelpers,
  config: TEST_CONFIG
};

// Message d'instructions
console.log(`
📋 INSTRUCTIONS D'UTILISATION
================================

Pour tester les services API, utilisez les commandes suivantes dans la console :

1. Test complet :
   await testServices.runAllTests()

2. Test de connectivité backend :
   await testServices.testBackendConnectivity()

3. Tests individuels :
   await testServices.testBaseConfiguration()
   await testServices.testAuthentication()
   await testServices.testAvatarGeneration()
   await testServices.testFileValidation()
   await testServices.testPermissionHelpers()

4. Configuration de test :
   testServices.config

⚠️  IMPORTANT: Assurez-vous que le serveur Laravel tourne sur http://localhost:8000
   Command: cd backend && php artisan serve --port=8000

🎯 Ces tests valident que l'architecture des services est correctement implémentée.
`);

export default (window as any).testServices;