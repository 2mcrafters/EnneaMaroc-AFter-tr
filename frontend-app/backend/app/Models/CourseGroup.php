<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class CourseGroup extends Model
{
    protected $fillable = [
        'course_id',
    'title',
    'subtitle',
        'day',
        'time',
        'price',
        'instructor_id',
        'meeting_link',
        'capacity',
        'status',
        'month',
        'jour',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'capacity' => 'integer',
    ];

    /**
     * Relation avec le cours
     */
    public function course(): BelongsTo
    {
        return $this->belongsTo(Course::class);
    }

    /**
     * Relation avec l'instructeur
     */
    public function instructor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'instructor_id');
    }

    /**
     * Inscriptions pour ce groupe de cours
     */
    public function enrollments(): HasMany
    {
        return $this->hasMany(Enrollment::class, 'course_id', 'course_id')
                    ->whereJsonContains('group_data->group_id', $this->id);
    }

    /**
     * Inscriptions actives pour ce groupe
     */
    public function activeEnrollments(): HasMany
    {
        return $this->enrollments()->where('status', 'active');
    }

    /**
     * Vérifier si le groupe a encore de la place
     */
    public function hasCapacity(): bool
    {
        if (!$this->capacity) {
            return true; // Pas de limite de capacité
        }
        
        return $this->activeEnrollments()->count() < $this->capacity;
    }

    /**
     * Obtenir le nombre d'étudiants inscrits
     */
    public function getEnrolledStudentsCount(): int
    {
        return $this->activeEnrollments()->count();
    }
}
