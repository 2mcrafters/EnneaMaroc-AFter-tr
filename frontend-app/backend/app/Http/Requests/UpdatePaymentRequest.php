<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdatePaymentRequest extends FormRequest
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
            'amount' => 'sometimes|numeric|min:0',
            'month' => 'sometimes|integer|min:1',
            'status' => 'sometimes|in:pending,confirmed,rejected',
            'payment_proof' => 'nullable|string',
            'payment_date' => 'sometimes|date',
            'admin_notes' => 'nullable|string|max:1000'
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'amount.numeric' => 'Payment amount must be a number',
            'amount.min' => 'Payment amount must be greater than or equal to 0',
            'month.integer' => 'Payment month must be an integer',
            'month.min' => 'Payment month must be at least 1',
            'status.in' => 'Status must be pending, confirmed, or rejected',
            'payment_date.date' => 'Payment date must be a valid date'
        ];
    }
}
