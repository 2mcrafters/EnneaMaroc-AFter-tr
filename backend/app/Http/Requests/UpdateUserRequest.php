<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateUserRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        $currentUser = $this->user();
        $targetUser = $this->route('user');
        
        // Admins et employees peuvent modifier les utilisateurs
        if (in_array($currentUser->role, ['admin', 'employee'])) {
            // Empêcher les employés de modifier d'autres employés
            if ($currentUser->role === 'employee' && $targetUser->role === 'employee' && $currentUser->id !== $targetUser->id) {
                return false;
            }
            return true;
        }
        
        // Les utilisateurs peuvent modifier leur propre profil
        return $currentUser->id === $targetUser->id;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $userId = $this->route('user')->id;
        
        return [
            'firstName' => 'sometimes|string|max:255|regex:/^[a-zA-Z\s\-\'\.]+$/',
            'lastName' => 'sometimes|string|max:255|regex:/^[a-zA-Z\s\-\'\.]+$/',
            'email' => 'sometimes|string|email|max:255|unique:users,email,' . $userId,
            'password' => 'sometimes|string|min:8|regex:/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/',
            'role' => ['sometimes', Rule::in(['admin', 'employee', 'prof', 'student'])],
            'dob' => 'nullable|date|before:today|after:1900-01-01',
            'city' => 'nullable|string|max:255|regex:/^[a-zA-Z\s\-\'\.]+$/',
            'phone' => 'nullable|string|max:20|regex:/^[\+]?[0-9]{1,4}[\s\-\(\)]?[0-9]{2,4}[\s\-\(\)]?[0-9]{2,4}[\s\-\(\)]?[0-9]{0,6}$/',
            'profilePicture' => 'nullable|string|max:500|url',
            'active' => 'sometimes|boolean',
        ];
    }

    /**
     * Get custom messages for validator errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'firstName.regex' => 'First name can only contain letters, spaces, hyphens, apostrophes, and dots.',
            'lastName.regex' => 'Last name can only contain letters, spaces, hyphens, apostrophes, and dots.',
            'password.regex' => 'Password must contain at least one lowercase letter, one uppercase letter, and one digit.',
            'city.regex' => 'City name can only contain letters, spaces, hyphens, apostrophes, and dots.',
            'phone.regex' => 'Please provide a valid phone number format (e.g., +33123456789, 0123456789, +33 1 23 45 67 89).',
            'profilePicture.url' => 'Profile picture must be a valid URL.',
            'dob.before' => 'Date of birth must be before today.',
            'dob.after' => 'Date of birth must be after 1900.',
        ];
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        // Nettoyer et standardiser les données uniquement si elles sont présentes
        $cleanedData = [];
        
        if ($this->has('firstName')) {
            $cleanedData['firstName'] = trim($this->firstName);
        }
        
        if ($this->has('lastName')) {
            $cleanedData['lastName'] = trim($this->lastName);
        }
        
        if ($this->has('email')) {
            $cleanedData['email'] = strtolower(trim($this->email));
        }
        
        if ($this->has('city')) {
            $cleanedData['city'] = trim($this->city);
        }
        
        if ($this->has('phone')) {
            $cleanedData['phone'] = preg_replace('/[^\+\d]/', '', $this->phone);
        }
        
        $this->merge($cleanedData);
    }
}