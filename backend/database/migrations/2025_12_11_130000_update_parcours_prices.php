<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        DB::table('parcours')->where('slug', 'decouvrir')->update([
            'price' => '3000',
            'price_ht' => '4000'
        ]);

        DB::table('parcours')->where('slug', 'approfondir')->update([
            'price' => '2600',
            'price_ht' => '3200'
        ]);

        DB::table('parcours')->where('slug', 'transmettre')->update([
            'price' => '3400',
            'price_ht' => '4500'
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // No reverse needed really, or could revert to old strings
    }
};
