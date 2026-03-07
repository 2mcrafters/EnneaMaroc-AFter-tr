<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Course extends Model
{
    protected $fillable = [
        'title',
        'description',
        'short_description',
        'image_url',
        'type',
        'duration_months',
        'sessions_per_month',
        'status'
    ];

    protected $casts = [
        'duration_months' => 'integer',
        'sessions_per_month' => 'integer',
    ];

    /**
     * Relation avec les groupes de cours
     */
    public function groups(): HasMany
    {
        return $this->hasMany(CourseGroup::class);
    }

    /**
     * Groupes actifs uniquement
     */
    public function activeGroups(): HasMany
    {
        return $this->hasMany(CourseGroup::class)->where('status', 'active');
    }

    /**
     * Relation avec les inscriptions
     */
    public function enrollments(): HasMany
    {
        return $this->hasMany(Enrollment::class);
    }

    /**
     * Inscriptions actives uniquement
     */
    public function activeEnrollments(): HasMany
    {
        return $this->hasMany(Enrollment::class)->where('status', 'active');
    }
}
