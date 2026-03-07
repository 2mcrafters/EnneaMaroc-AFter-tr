<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Payment extends Model
{
    protected $fillable = [
        'enrollment_id',
        'amount',
        'month',
        'status',
        'payment_proof',
        'payment_date',
        'admin_notes',
        'confirmed_by',
        'confirmed_at'
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'payment_date' => 'date',
        'confirmed_at' => 'datetime'
    ];

    /**
     * Get the enrollment that owns the payment.
     */
    public function enrollment(): BelongsTo
    {
        return $this->belongsTo(Enrollment::class);
    }

    /**
     * Get the admin user who confirmed this payment.
     */
    public function confirmedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'confirmed_by');
    }

    /**
     * Scope to get only confirmed payments.
     */
    public function scopeConfirmed($query)
    {
        return $query->where('status', 'confirmed');
    }

    /**
     * Scope to get only pending payments.
     */
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    /**
     * Check if payment is confirmed.
     */
    public function isConfirmed(): bool
    {
        return $this->status === 'confirmed';
    }

    /**
     * Check if payment is pending.
     */
    public function isPending(): bool
    {
        return $this->status === 'pending';
    }

    /**
     * Confirm the payment.
     */
    public function confirm(User $confirmedBy): void
    {
        $this->update([
            'status' => 'confirmed',
            'confirmed_by' => $confirmedBy->id,
            'confirmed_at' => now()
        ]);

        // Check if enrollment should be activated after payment confirmation
        $this->updateEnrollmentStatus();
    }

    /**
     * Reject the payment.
     */
    public function reject(): void
    {
        $this->update([
            'status' => 'rejected',
            'confirmed_by' => null,
            'confirmed_at' => null
        ]);

        // Check if enrollment status should be updated after payment rejection
        $this->updateEnrollmentStatusAfterRejection();
    }

    /**
     * Update enrollment status based on payment confirmation.
     */
    private function updateEnrollmentStatus(): void
    {
        $enrollment = $this->enrollment;
        
        if (!$enrollment) {
            return;
        }

        // If enrollment is pending payment and we just confirmed a payment, activate it
        if ($enrollment->status === 'pending_payment') {
            $enrollment->update(['status' => 'active']);
        }
        
        // If enrollment is pending confirmation and has at least one confirmed payment, activate it
        elseif ($enrollment->status === 'pending_confirmation' && $enrollment->hasConfirmedPayments()) {
            $enrollment->update(['status' => 'active']);
        }
    }

    /**
     * Update enrollment status after payment rejection.
     */
    private function updateEnrollmentStatusAfterRejection(): void
    {
        $enrollment = $this->enrollment;
        
        if (!$enrollment) {
            return;
        }

        // If enrollment is active but has no confirmed payments after this rejection, 
        // set it back to pending payment
        if ($enrollment->status === 'active' && !$enrollment->hasConfirmedPayments()) {
            $enrollment->update(['status' => 'pending_payment']);
        }
    }
}
