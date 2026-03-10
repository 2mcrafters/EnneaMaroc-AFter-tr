<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SessionCancellation extends Model
{
    use HasFactory;

    protected $fillable = [
        'item_type',            // 'course', 'parcours', etc.
        'course_id',
        'parcours_id',
        'module_id',
        'course_group_index',   // index in course->groups array
        'day',                  // e.g., 'Mondays'
        'time',                 // e.g., '09:00 - 10:00'
        'session_date',         // date of the occurrence (YYYY-MM-DD)
        'created_by',
    ];
}
