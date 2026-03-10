<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StorePaymentRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true; // We'll handle authorization in the controller or middleware
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            // For manual admin payments we allow either:
            // - enrollment_id (existing flow)
            // - user_id + course_id (new flow: no enrollment select in UI)
            'enrollment_id' => 'nullable|exists:enrollments,id',
            'user_id' => 'required_without:enrollment_id|exists:users,id',
            'course_id' => 'required_without:enrollment_id|exists:courses,id',
            'amount' => 'required|numeric|min:0',
            'month' => 'required|integer|min:1',
            'status' => 'nullable|in:pending,confirmed,rejected',
            'payment_proof' => 'nullable|string',
            'payment_date' => 'required|date',
            'admin_notes' => 'nullable|string|max:1000'
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'enrollment_id.required' => 'Enrollment ID is required',
            'enrollment_id.exists' => 'Selected enrollment does not exist',
            'user_id.required_without' => 'User ID is required when enrollment is not provided',
            'user_id.exists' => 'Selected user does not exist',
            'course_id.required_without' => 'Course/Parcours is required when enrollment is not provided',
            'course_id.exists' => 'Selected course/parcours does not exist',
            'amount.required' => 'Payment amount is required',
            'amount.numeric' => 'Payment amount must be a number',
            'amount.min' => 'Payment amount must be greater than or equal to 0',
            'month.required' => 'Payment month is required',
            'month.integer' => 'Payment month must be an integer',
            'month.min' => 'Payment month must be at least 1',
            'payment_date.required' => 'Payment date is required',
            'payment_date.date' => 'Payment date must be a valid date'
        ];
    }
}
