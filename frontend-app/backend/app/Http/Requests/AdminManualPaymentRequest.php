<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class AdminManualPaymentRequest extends FormRequest
{
    public function authorize(): bool
    {
        $user = $this->user();
        if (!$user) return false;
        return in_array($user->role, ['admin', 'employee']);
    }

    public function rules(): array
    {
        return [
            // Student creation / selection
            'mode' => 'required|in:select,new',

            // When selecting existing student
            'user_id' => 'required_if:mode,select|exists:users,id',

            // When creating new student
            'student.firstName' => 'required_if:mode,new|string|max:255',
            'student.lastName' => 'required_if:mode,new|string|max:255',
            'student.email' => 'required_if:mode,new|email|max:255|unique:users,email',
            'student.phone' => 'nullable|string|max:20',
            'student.address' => 'nullable|string|max:500',

            // Payment target
            'course_id' => 'required|exists:courses,id',

            // Payment data
            'amount' => 'required|numeric|min:0',
            'month' => 'required|integer|min:1',
            'status' => 'nullable|in:pending,confirmed,rejected',
            'payment_date' => 'required|date',
            'admin_notes' => 'nullable|string|max:1000',
            'payment_proof' => 'nullable|string|max:255',
        ];
    }

    protected function prepareForValidation(): void
    {
        // Normalize mode/strings
        $this->merge([
            'mode' => strtolower(trim((string) $this->mode)),
        ]);
    }
}
