<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Http\Requests\StoreUserRequest;
use App\Http\Requests\UpdateUserRequest;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

class UserController extends Controller
{
    /**
     * Récupérer tous les utilisateurs (tous les rôles authentifiés)
     */
    public function index(Request $request): JsonResponse
    {
        // Tous les utilisateurs authentifiés peuvent voir la liste des utilisateurs
        // Utile pour que les étudiants voient leurs profs, les profs voient leurs étudiants, etc.
        
        $query = User::query();

        // Filtrer par rôle si spécifié
        if ($request->has('role')) {
            $query->where('role', $request->role);
        }

        // Filtrer par statut actif si spécifié (désactivé car colonne inexistante)
        // if ($request->has('active')) {
        //     $query->where('active', $request->boolean('active'));
        // }

        $users = $query->orderBy('created_at', 'desc')->get();

        return response()->json($users);
    }

    /**
     * Créer un nouvel utilisateur (admin/employee only)
     */
    public function store(StoreUserRequest $request): JsonResponse
    {
        $user = User::create([
            'firstName' => $request->firstName,
            'lastName' => $request->lastName,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => $request->role,
            'dob' => $request->dob,
            'city' => $request->city,
            'phone' => $request->phone,
            'profilePicture' => $request->profilePicture,
        ]);

        return response()->json($user, 201);
    }

    /**
     * Récupérer un utilisateur spécifique
     */
    public function show(Request $request, User $user): JsonResponse
    {
        // Vérifier les permissions
        $currentUser = $request->user();
        if (!in_array($currentUser->role, ['admin', 'employee']) && $currentUser->id !== $user->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        return response()->json($user);
    }

    /**
     * Mettre à jour un utilisateur
     */
    public function update(UpdateUserRequest $request, User $user): JsonResponse
    {
        // Seuls les admins peuvent modifier le rôle et le statut actif
        $currentUser = $request->user();
        if (!in_array($currentUser->role, ['admin']) && ($request->has('role') || $request->has('active'))) {
            return response()->json(['message' => 'Insufficient permissions'], 403);
        }

        // Préparer les données pour la mise à jour
        $updateData = $request->only([
            'firstName', 'lastName', 'email', 'role', 'dob',
            'city', 'phone', 'profilePicture' //, 'active'
        ]);
        
        // Traitement sécurisé du mot de passe
        if ($request->has('password') && !empty($request->password)) {
            $updateData['password'] = Hash::make($request->password);
        }

        $user->update($updateData);

        return response()->json($user);
    }

    /**
     * Supprimer un utilisateur (admin only)
     */
    public function destroy(Request $request, User $user): JsonResponse
    {
        // Vérifier les permissions
        if ($request->user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // Ne pas permettre la suppression de soi-même
        if ($request->user()->id === $user->id) {
            return response()->json(['message' => 'Cannot delete yourself'], 400);
        }

        $user->delete();

        return response()->json(['message' => 'User deleted successfully']);
    }

    /**
     * Mettre à jour le profil de l'utilisateur connecté
     */
    public function updateProfile(Request $request): JsonResponse
    {
        $user = $request->user();

        $validator = Validator::make($request->all(), [
            'firstName' => 'sometimes|string|max:255',
            'lastName' => 'sometimes|string|max:255',
            'email' => 'sometimes|string|email|max:255|unique:users,email,' . $user->id,
            'dob' => 'nullable|date',
            'city' => 'nullable|string|max:255',
            'phone' => 'nullable|string|max:20',
            'profilePicture' => 'nullable|string|max:500',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $user->update($request->only([
            'firstName', 'lastName', 'email', 'dob', 
            'city', 'phone', 'profilePicture'
        ]));

        return response()->json($user);
    }

    /**
     * Changer le mot de passe
     */
    public function changePassword(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'current_password' => 'required|string',
            'new_password' => 'required|string|min:8|confirmed',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $user = $request->user();

        // Vérifier le mot de passe actuel
        if (!Hash::check($request->current_password, $user->password)) {
            return response()->json([
                'message' => 'Current password is incorrect'
            ], 400);
        }

        // Mettre à jour le mot de passe
        $user->update([
            'password' => Hash::make($request->new_password)
        ]);

        return response()->json(['message' => 'Password updated successfully']);
    }

    /**
     * Rechercher des utilisateurs
     */
    public function search(Request $request): JsonResponse
    {
        // Vérifier les permissions
        if (!in_array($request->user()->role, ['admin', 'employee', 'prof'])) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $query = $request->get('q', '');
        $role = $request->get('role');

        $users = User::query()
            ->when($query, function ($q) use ($query) {
                $q->where(function ($subQuery) use ($query) {
                    $subQuery->where('firstName', 'LIKE', "%{$query}%")
                            ->orWhere('lastName', 'LIKE', "%{$query}%")
                            ->orWhere('email', 'LIKE', "%{$query}%");
                });
            })
            ->when($role, function ($q) use ($role) {
                $q->where('role', $role);
            })
            ->orderBy('firstName')
            ->get();

        return response()->json($users);
    }

    /**
     * Récupérer les statistiques des utilisateurs
     */
    public function stats(Request $request): JsonResponse
    {
        // Vérifier les permissions
        if (!in_array($request->user()->role, ['admin', 'employee'])) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $stats = [
            'total' => User::count(),
            'students' => User::where('role', 'student')->count(),
            'profs' => User::where('role', 'prof')->count(),
            'employees' => User::where('role', 'employee')->count(),
            'admins' => User::where('role', 'admin')->count(),
            // 'active' => User::where('active', true)->count(),
            // 'inactive' => User::where('active', false)->count(),
            'active' => User::count(), // Placeholder
            'inactive' => 0, // Placeholder
        ];

        return response()->json($stats);
    }

    /**
     * Récupérer les cours d'un enseignant
     */
    public function getTeacherCourses(Request $request, $teacherId): JsonResponse
    {
        // Cette méthode sera implémentée quand le modèle Course sera créé
        return response()->json(['message' => 'Course functionality not yet implemented'], 501);
    }

    /**
     * Récupérer les cours d'un étudiant
     */
    public function getStudentCourses(Request $request, $studentId): JsonResponse
    {
        // Cette méthode sera implémentée quand le modèle Course sera créé
        return response()->json(['message' => 'Course functionality not yet implemented'], 501);
    }
}