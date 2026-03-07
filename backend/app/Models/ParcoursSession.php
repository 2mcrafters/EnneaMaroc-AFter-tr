<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ParcoursSession extends Model
{
    protected $table = 'agenda';

    protected $fillable = [
        'parcours_module_id',
        'start_date',
        'end_date',
        'location',
        'max_participants',
        'current_participants',
        'notes'
    ];

    protected $casts = [
        'start_date' => 'datetime',
        'end_date' => 'datetime',
    ];

    public function module()
    {
        return $this->belongsTo(ParcoursModule::class, 'parcours_module_id');
    }
}
