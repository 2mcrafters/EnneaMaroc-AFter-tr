<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Database\Eloquent\Relations\HasMany;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, HasApiTokens;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'firstName',
        'lastName',
        'email',
        'password',
        'dob',
        'city',
        'phone',
        'profilePicture',
        'role',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'dob' => 'date',
        ];
    }

    /**
     * Accessor: return absolute URL for profilePicture if a relative path is stored
     */
    public function getProfilePictureAttribute($value)
    {
        if (!$value) {
            return $value;
        }
        // If already a full URL (e.g., dicebear or http), return as-is
        if (str_starts_with($value, 'http://') || str_starts_with($value, 'https://')) {
            return $value;
        }
        return asset('storage/' . ltrim($value, '/'));
    }

    /**
     * Relation avec les inscriptions de l'utilisateur
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

    /**
     * Paiements confirmés par cet administrateur
     */
    public function confirmedPayments(): HasMany
    {
        return $this->hasMany(Payment::class, 'confirmed_by');
    }

    /**
     * Groupes de cours où cet utilisateur est instructeur
     */
    public function taughtCourseGroups(): HasMany
    {
        return $this->hasMany(CourseGroup::class, 'instructor_id');
    }



    /**
     * Vérifier si l'utilisateur est un instructeur
     */
    public function isInstructor(): bool
    {
        return $this->role === 'instructor' || $this->role === 'admin';
    }

    /**
     * Vérifier si l'utilisateur est un administrateur
     */
    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }

    /**
     * Obtenir tous les cours enseignés par cet instructeur
     */
    public function getTaughtCourses()
    {
        return Course::whereHas('groups', function ($query) {
            $query->where('instructor_id', $this->id);
        })->get();
    }


}
