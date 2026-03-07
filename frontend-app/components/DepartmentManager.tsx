import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../store';
import {
  fetchUserAccessibleDepartmentsAsync,
  selectUserAccessibleDepartments,
  selectDepartmentsLoading,
  selectDepartmentsError,
} from '../store/slices/departmentsSlice';

interface DepartmentCardProps {
  department: {
    id: number;
    name: string;
    description: string;
    color: string;
    icon?: string;
    functions: Array<{
      id: number;
      name: string;
      description: string;
      route?: string;
      icon?: string;
    }>;
  };
  onFunctionClick: (route: string) => void;
}

const DepartmentCard: React.FC<DepartmentCardProps> = ({ department, onFunctionClick }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* En-tête du département */}
      <div 
        className="p-4 text-white"
        style={{ backgroundColor: department.color }}
      >
        <div className="flex items-center gap-3">
          {department.icon && (
            <span className="text-2xl">{department.icon}</span>
          )}
          <div>
            <h3 className="text-lg font-semibold">{department.name}</h3>
            <p className="text-sm opacity-90">{department.description}</p>
          </div>
        </div>
      </div>

      {/* Liste des fonctions */}
      <div className="p-4">
        {department.functions.length === 0 ? (
          <p className="text-gray-500 text-sm italic">Aucune fonction accessible</p>
        ) : (
          <div className="space-y-2">
            {department.functions.map((func) => (
              <button
                key={func.id}
                onClick={() => func.route && onFunctionClick(func.route)}
                className="w-full text-left p-3 rounded-lg border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-colors group"
                disabled={!func.route}
              >
                <div className="flex items-center gap-3">
                  {func.icon && (
                    <span className="text-lg">{func.icon}</span>
                  )}
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 group-hover:text-gray-700">
                      {func.name}
                    </h4>
                    <p className="text-sm text-gray-600">{func.description}</p>
                  </div>
                  {func.route && (
                    <svg className="w-4 h-4 text-gray-400 group-hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

interface DepartmentManagerProps {
  className?: string;
}

export const DepartmentManager: React.FC<DepartmentManagerProps> = ({ className = '' }) => {
  const dispatch = useAppDispatch();
  const departments = useAppSelector(selectUserAccessibleDepartments);
  const loading = useAppSelector(selectDepartmentsLoading);
  const error = useAppSelector(selectDepartmentsError);
  const { user } = useAppSelector(state => state.auth);

  useEffect(() => {
    if (user?.role) {
      dispatch(fetchUserAccessibleDepartmentsAsync(user.role));
    }
  }, [dispatch, user?.role]);

  const handleFunctionClick = (route: string) => {
    window.location.hash = route;
  };

  if (loading) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
          <p className="text-gray-600">Chargement des départements...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`p-4 ${className}`}>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-red-800 font-medium">Erreur de chargement</span>
          </div>
          <p className="text-red-700 mt-1">{error}</p>
        </div>
      </div>
    );
  }

  if (departments.length === 0) {
    return (
      <div className={`p-8 text-center ${className}`}>
        <div className="text-gray-500">
          <svg className="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          <h3 className="text-lg font-medium mb-1">Aucun département accessible</h3>
          <p className="text-sm">Votre rôle ne donne accès à aucune fonction administrative.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Départements</h2>
        <p className="text-gray-600">
          Accédez aux fonctions de votre rôle : <span className="font-medium text-blue-600">{user?.role}</span>
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {departments.map((department) => (
          <DepartmentCard
            key={department.id}
            department={department}
            onFunctionClick={handleFunctionClick}
          />
        ))}
      </div>

      {/* Statistiques rapides */}
      <div className="mt-8 bg-gray-50 rounded-lg p-4">
        <h3 className="text-lg font-medium text-gray-900 mb-3">Résumé</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-blue-600">{departments.length}</div>
            <div className="text-sm text-gray-600">Départements</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-600">
              {departments.reduce((sum, dept) => sum + dept.functions.length, 0)}
            </div>
            <div className="text-sm text-gray-600">Fonctions</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-purple-600">
              {departments.filter(dept => dept.functions.some(f => f.route)).length}
            </div>
            <div className="text-sm text-gray-600">Avec accès</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-orange-600">{user?.role || 'N/A'}</div>
            <div className="text-sm text-gray-600">Votre rôle</div>
          </div>
        </div>
      </div>
    </div>
  );
};