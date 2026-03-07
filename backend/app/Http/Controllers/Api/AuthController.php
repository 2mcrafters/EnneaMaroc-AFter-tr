<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        $token = $user->createToken('auth-token')->plainTextToken;

        return response()->json([
            'user' => $user,
            'token' => $token,
        ]);
    }

    public function register(Request $request)
    {
        $request->validate([
            'firstName' => 'required|string|max:255',
            'lastName' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8',
            'dob' => 'nullable|date',
            'city' => 'nullable|string|max:255',
            'phone' => 'nullable|string|max:255',
            'profilePicture' => 'nullable|string|max:500',
        ]);

        $user = User::create([
            'firstName' => $request->firstName,
            'lastName' => $request->lastName,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'dob' => $request->dob,
            'city' => $request->city,
            'phone' => $request->phone,
            'profilePicture' => $request->profilePicture ?: $this->generateDefaultAvatar($request->firstName, $request->lastName),
            'role' => 'student', // Par défaut student
        ]);

        $token = $user->createToken('auth-token')->plainTextToken;

        return response()->json([
            'user' => $user,
            'token' => $token,
        ], 201);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Logged out successfully',
        ]);
    }

    public function user(Request $request)
    {
        return response()->json($request->user());
    }

    public function updateProfile(Request $request)
    {
        $user = $request->user();

        $request->validate([
            'firstName' => 'sometimes|string|max:255',
            'lastName' => 'sometimes|string|max:255',
            'email' => 'sometimes|string|email|max:255|unique:users,email,' . $user->id,
            'dob' => 'sometimes|nullable|date',
            'city' => 'sometimes|nullable|string|max:255',
            'phone' => 'sometimes|nullable|string|max:255',
            'profilePicture' => 'sometimes|nullable|string|max:500',
        ]);

        $user->update($request->only([
            'firstName',
            'lastName', 
            'email',
            'dob',
            'city',
            'phone',
            'profilePicture'
        ]));

        return response()->json([
            'user' => $user->fresh(),
            'message' => 'Profile updated successfully'
        ]);
    }

    public function updateEmail(Request $request)
    {
        $user = $request->user();

        $request->validate([
            'currentPassword' => 'required|string',
            'newEmail' => 'required|string|email|max:255|unique:users,email,' . $user->id,
        ]);

        // Vérifier le mot de passe actuel
        if (!Hash::check($request->currentPassword, $user->password)) {
            throw ValidationException::withMessages([
                'currentPassword' => ['Current password is incorrect.'],
            ]);
        }

        $user->update([
            'email' => $request->newEmail
        ]);

        return response()->json([
            'user' => $user->fresh(),
            'message' => 'Email updated successfully'
        ]);
    }

    public function updatePassword(Request $request)
    {
        $user = $request->user();

        $request->validate([
            'currentPassword' => 'required|string',
            'newPassword' => 'required|string|min:8|confirmed',
        ]);

        // Vérifier le mot de passe actuel
        if (!Hash::check($request->currentPassword, $user->password)) {
            throw ValidationException::withMessages([
                'currentPassword' => ['Current password is incorrect.'],
            ]);
        }

        $user->update([
            'password' => Hash::make($request->newPassword)
        ]);

        return response()->json([
            'message' => 'Password updated successfully'
        ]);
    }

    public function updateProfilePicture(Request $request)
    {
        $user = $request->user();

        $request->validate([
            'profilePicture' => 'required|image|mimes:jpeg,png,jpg,gif|max:2048', // 2MB max
        ]);

        if ($request->hasFile('profilePicture')) {
            // Stocker la nouvelle image (chemin relatif dans storage/app/public/...)
            $imagePath = $request->file('profilePicture')->store('profile-pictures', 'public');

            // Supprimer l'ancienne image si elle existe, n'est pas un avatar généré et est différente
            if ($user->profilePicture 
                && !str_contains($user->profilePicture, 'dicebear.com')
                && $user->profilePicture !== $imagePath) {
                $oldAbsolutePath = public_path('storage/' . $user->profilePicture);
                if (is_file($oldAbsolutePath)) {
                    @unlink($oldAbsolutePath);
                }
            }

            $user->profilePicture = $imagePath; // on stocke seulement le chemin relatif
            $user->save();

            $fresh = $user->fresh();

            return response()->json([
                'user' => $fresh,
                'message' => 'Profile picture updated successfully'
            ]);
        }

        return response()->json([
            'message' => 'No file uploaded'
        ], 400);
    }

    private function generateDefaultAvatar(string $firstName, string $lastName): string
    {
        $initials = strtoupper(substr($firstName, 0, 1) . substr($lastName, 0, 1));
        // Générer un avatar avec initiales via DiceBear API
        return "https://api.dicebear.com/7.x/initials/svg?seed={$initials}&backgroundColor=86efac&textColor=166534";
    }
}
