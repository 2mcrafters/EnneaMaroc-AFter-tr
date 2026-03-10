<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreEnrollmentRequest extends FormRequest
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
            'user_id' => 'required|exists:users,id',
            'course_id' => 'required|exists:courses,id',
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
            'user_id.required' => 'User ID is required',
            'user_id.exists' => 'Selected user does not exist',
            'course_id.required' => 'Course is required',
            'course_id.exists' => 'Selected course does not exist',
            'duration_months.integer' => 'Duration must be a number',
            'duration_months.min' => 'Duration must be at least 1 month',
            'duration_months.max' => 'Duration cannot exceed 12 months'
        ];
    }


}
