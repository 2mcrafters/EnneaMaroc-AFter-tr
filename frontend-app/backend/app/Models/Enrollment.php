<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use App\Models\Parcours;
use App\Models\ParcoursSession;
use App\Models\Agenda;

class Enrollment extends Model
{
    protected $fillable = [
        'user_id',
        'group_id',
        'status',
        'enrolled_at',
        'duration_months',
        'notes'
    ];

    protected $casts = [
        'enrolled_at' => 'datetime'
    ];

    /**
     * Append the virtual group_data attribute to JSON output
     */
    protected $appends = ['group_data'];

    /**
     * Get the user that owns the enrollment.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the course/parcours for this enrollment.
     *
     * IMPORTANT: even if some code paths rely on `group_id`, the database still has
     * a `course_id` column (see migrations). We keep this relation so API responses
     * can expose the real chosen course/parcours title.
     */
    public function course(): BelongsTo
    {
        return $this->belongsTo(Parcours::class, 'course_id');
    }

    /**
     * Get the group associated with the enrollment.
     * Note: course_groups table was dropped. This relationship might be invalid if group_id refers to it.
     * If group_id now refers to ParcoursModule or Agenda, this should be updated.
     * For now, we disable it to prevent errors.
     */
    /*
    public function group(): BelongsTo
    {
        return $this->belongsTo(CourseGroup::class, 'group_id');
    }
    */

    // NOTE: enrollments may also be tied to a selected session/group via `group_id`.



    /**
     * Get all payments for this enrollment.
     */
    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class);
    }

    /**
     * Get confirmed payments for this enrollment.
     */
    public function confirmedPayments(): HasMany
    {
        return $this->hasMany(Payment::class)->where('status', 'confirmed');
    }

    /**
     * Get pending payments for this enrollment.
     */
    public function pendingPayments(): HasMany
    {
        return $this->hasMany(Payment::class)->where('status', 'pending');
    }

    /**
     * Check if enrollment has any confirmed payments.
     */
    public function hasConfirmedPayments(): bool
    {
        return $this->confirmedPayments()->exists();
    }

    /**
     * Get total amount paid for this enrollment.
     */
    public function getTotalPaidAmount(): float
    {
        return $this->confirmedPayments()->sum('amount');
    }

    /**
     * Get total amount pending for this enrollment.
     */
    public function getTotalPendingAmount(): float
    {
        return $this->pendingPayments()->sum('amount');
    }

    /**
     * Get the group data (CourseGroup) based on enrollment type
     * This replaces the old group_data column with a virtual attribute
     */
    public function getGroupDataAttribute()
    {
        // The legacy implementation relied on a `course_groups` table that no longer exists.
        // We keep the attribute for backward compatibility, but return null.
        return null;
    }

    /**
     * Get the course group data for this enrollment
     * @deprecated Use getGroupDataAttribute() instead
     */
    public function getGroupAttribute()
    {
        return $this->getGroupDataAttribute();
    }

    /**
     * Get the latest payment for this enrollment.
     */
    public function getLatestPayment()
    {
        return $this->payments()->orderBy('created_at', 'desc')->first();
    }

    /**
     * Check if enrollment is fully paid based on duration.
     */
    public function isFullyPaid(): bool
    {
        $expectedPayments = $this->duration_months ?? 1;
        $confirmedPayments = $this->confirmedPayments()->count();
        
        return $confirmedPayments >= $expectedPayments;
    }

    /**
     * Get missing payment months.
     */
    public function getMissingPaymentMonths(): array
    {
        $expectedMonths = range(1, $this->duration_months ?? 1);
        $paidMonths = $this->confirmedPayments()->pluck('month')->toArray();
        
        return array_diff($expectedMonths, $paidMonths);
    }

    /**
     * Scope to get active enrollments.
     */
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    /**
     * Scope to get enrollments for a specific course.
     */
    public function scopeForCourse($query, $courseId)
    {
        return $query->where('course_id', $courseId);
    }



    /**
     * Scope to get enrollments for a specific user.
     */
    public function scopeForUser($query, $userId)
    {
        return $query->where('user_id', $userId);
    }

    /**
     * Get the session/agenda associated with the enrollment.
     * We map `group_id` to the `agenda` table (ParcoursSession model).
     */
    public function session(): BelongsTo
    {
        return $this->belongsTo(Agenda::class, 'parcours_session_id');
    }
}
