import React from 'react';
import { DepartmentManager } from '../components/DepartmentManager';
import { useAppSelector } from '../store';

const AdminDepartmentsPage: React.FC = () => {
  const { isAuthenticated, user } = useAppSelector(state => state.auth);

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-6 py-8">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <h2 className="text-xl font-semibold text-yellow-800 mb-2">Accès restreint</h2>
          <p className="text-yellow-700">Vous devez être connecté pour accéder aux départements.</p>
        </div>
      </div>
    );
  }

  // Vérifier si l'utilisateur a accès aux fonctions administratives
  const hasAdminAccess = user?.role === 'admin' || user?.role === 'employee';

  return (
    <div className="container mx-auto px-6 py-8">
      {/* En-tête de la page */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-blue-100 rounded-lg">
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gestion des Départements</h1>
            <p className="text-gray-600">Organisation et accès aux fonctions par département</p>
          </div>
        </div>

        {/* Informations utilisateur */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white font-semibold">
                {user?.firstName?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
              </span>
            </div>
            <div>
              <p className="font-medium text-blue-900">
                {user?.firstName && user?.lastName 
                  ? `${user.firstName} ${user.lastName}` 
                  : user?.email
                }
              </p>
              <p className="text-blue-700 text-sm">
                Rôle: <span className="font-medium capitalize">{user?.role}</span>
                {hasAdminAccess && <span className="ml-2 text-xs bg-blue-200 px-2 py-1 rounded">Accès administrateur</span>}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Gestionnaire de départements */}
      <DepartmentManager className="mb-8" />

      {/* Aide et informations */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Comment utiliser les départements</h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-800 mb-2">🏢 Départements</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Chaque département regroupe des fonctions similaires</li>
              <li>• L'accès dépend de votre rôle utilisateur</li>
              <li>• Les couleurs aident à identifier rapidement chaque département</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-gray-800 mb-2">⚙️ Fonctions</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Cliquez sur une fonction pour y accéder directement</li>
              <li>• Seules les fonctions autorisées sont affichées</li>
              <li>• L'icône ➤ indique les fonctions accessibles</li>
            </ul>
          </div>
        </div>

        {/* Légende des rôles */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h4 className="font-medium text-gray-800 mb-3">Niveaux d'accès par rôle</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span className="text-gray-600"><strong>Admin:</strong> Accès complet</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
              <span className="text-gray-600"><strong>Employee:</strong> Gestion courante</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="text-gray-600"><strong>Prof:</strong> Fonctions pédagogiques</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
              <span className="text-gray-600"><strong>Student:</strong> Consultation</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDepartmentsPage;