<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasManyThrough;

class Parcours extends Model
{
    protected $fillable = ['title', 'slug', 'description', 'photo', 'lieu', 'horaires', 'price', 'price_ht', 'cta_link', 'is_active'];

    public function modules(): HasMany
    {
        return $this->hasMany(ParcoursModule::class);
    }

    /**
     * Sessions (agenda) for this parcours through its modules.
     *
     * This gives you a "calendar per parcours" WITHOUT creating a separate DB table.
     */
    public function sessions(): HasManyThrough
    {
        // agenda.parcours_module_id -> parcours_modules.id -> parcours.id
        return $this->hasManyThrough(
            ParcoursSession::class,
            ParcoursModule::class,
            'parcours_id',        // Foreign key on parcours_modules
            'parcours_module_id', // Foreign key on agenda
            'id',                 // Local key on parcours
            'id'                  // Local key on parcours_modules
        );
    }

    /**
     * Alias for sessions to match the "Agenda" concept.
     */
    public function agenda(): HasManyThrough
    {
        return $this->sessions();
    }
}
