<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateEnrollmentRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'status' => 'sometimes|in:pending_payment,pending_confirmation,active,cancelled,completed',
            'group_data' => 'nullable|array',
            'duration_months' => 'sometimes|integer|min:1|max:12',
            'notes' => 'nullable|string|max:1000'
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'status.in' => 'Status must be one of: pending_payment, pending_confirmation, active, cancelled, completed',
            'duration_months.integer' => 'Duration must be a number',
            'duration_months.min' => 'Duration must be at least 1 month',
            'duration_months.max' => 'Duration cannot exceed 12 months'
        ];
    }
}
