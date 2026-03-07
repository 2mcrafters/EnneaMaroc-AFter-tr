import React, { useState } from 'react';
import { authService } from '../services/authService';

const DebugUsersComponent: React.FC = () => {
    const [debugInfo, setDebugInfo] = useState<string>('');

    const checkAuthState = () => {
        const token = authService.getAuthToken();
        const isAuth = authService.isAuthenticated();
        const role = authService.getUserRole();

        const info = `
État d'authentification:
- Token: ${token ? token.substring(0, 20) + '...' : '❌ MANQUANT'}
- Authentifié: ${isAuth ? '✅ OUI' : '❌ NON'}
- Rôle: ${role || '❌ MANQUANT'}
        `;
        setDebugInfo(info);
    };

    const testFetchUsers = async () => {
        try {
            const token = authService.getAuthToken();
            if (!token) {
                setDebugInfo(prev => prev + '\n\n❌ Pas de token pour le test');
                return;
            }

            console.log('🧪 Test direct de /api/users...');
            
            const response = await fetch('/api/users', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                }
            });

            const info = `
Test Fetch Direct:
- Statut: ${response.status} ${response.statusText}
- Headers: ${JSON.stringify(Object.fromEntries(response.headers.entries()), null, 2)}
            `;

            if (response.ok) {
                const data = await response.json();
                setDebugInfo(prev => prev + '\n\n✅ Succès: ' + data.length + ' utilisateurs');
            } else {
                const errorText = await response.text();
                setDebugInfo(prev => prev + '\n\n❌ Erreur: ' + errorText);
            }
        } catch (error) {
            setDebugInfo(prev => prev + '\n\n❌ Exception: ' + String(error));
        }
    };

    const setTestToken = () => {
        localStorage.setItem('auth_token', '71|EstZnmW2NY3pRItFZyr8RV6O3BVUi8WATWkCHouvf860f79f');
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('userRole', 'admin');
        localStorage.setItem('user', JSON.stringify({
            id: 1,
            firstName: 'Admin',
            lastName: 'Test',
            email: 'admin@admin.com',
            role: 'admin'
        }));
        
        setDebugInfo('✅ Token de test défini !');
    };

    const clearAuth = () => {
        authService.clearAuthData();
        setDebugInfo('✅ Auth nettoyée !');
    };

    return (
        <div style={{ 
            padding: '20px', 
            border: '1px solid #ccc', 
            margin: '20px',
            backgroundColor: '#f9f9f9',
            borderRadius: '8px'
        }}>
            <h3>🔍 Debug: Fetch Users</h3>
            
            <div style={{ marginBottom: '10px' }}>
                <button onClick={checkAuthState} style={{ marginRight: '10px' }}>
                    Vérifier Auth
                </button>
                <button 
                    onClick={testFetchUsers} 
                    style={{ marginRight: '10px' }}
                >
                    Tester Fetch Users
                </button>
                <button onClick={setTestToken} style={{ marginRight: '10px' }}>
                    Token Test
                </button>
                <button onClick={clearAuth}>
                    Clear Auth
                </button>
            </div>

            <pre style={{ 
                backgroundColor: '#fff', 
                padding: '10px', 
                border: '1px solid #ddd',
                whiteSpace: 'pre-wrap',
                maxHeight: '300px',
                overflow: 'auto'
            }}>
                {debugInfo || 'Cliquez sur "Vérifier Auth" pour commencer...'}
            </pre>
        </div>
    );
};

export default DebugUsersComponent;