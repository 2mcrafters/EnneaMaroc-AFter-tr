<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ParcoursModule extends Model
{
    protected $fillable = ['parcours_id', 'title', 'duration', 'horaires', 'prerequis', 'subtitle', 'description', 'details', 'icon', 'order', 'price', 'place', 'reference'];

    public function parcours()
    {
        return $this->belongsTo(Parcours::class);
    }

    public function sessions()
    {
        return $this->hasMany(ParcoursSession::class);
    }

    /**
     * Alias for sessions to match the "Agenda" concept.
     */
    public function agenda()
    {
        return $this->sessions();
    }
}
