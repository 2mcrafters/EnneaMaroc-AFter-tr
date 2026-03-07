<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Parcours;
use App\Models\ParcoursModule;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ParcoursController extends Controller
{
    /**
     * Parse prices such as:
     *  - "3 000 MAD"
     *  - "3800 Dh TTC"
     *  - "4500"
     * and return a numeric amount (integer).
     */
    private function parsePriceToInt(?string $price): int
    {
        if (!$price) {
            return 0;
        }

        // Keep digits only (handles spaces, commas, currency suffixes, etc.)
        $digits = preg_replace('/[^0-9]/', '', $price) ?? '';
        if ($digits === '') {
            return 0;
        }

        // Prices in this project appear to be whole MAD amounts.
        return (int) $digits;
    }

    private function formatIntToMad(int $amount): string
    {
        // Format: 3000 -> "3 000 MAD"
        return number_format($amount, 0, '.', ' ') . ' MAD';
    }

    private function computeParcoursPriceFromModules(Parcours $parcours): string
    {
        $modules = $parcours->relationLoaded('modules') ? $parcours->modules : $parcours->modules()->get();
        $sum = 0;
        foreach ($modules as $m) {
            $sum += $this->parsePriceToInt($m->price ?? null);
        }

        return $this->formatIntToMad($sum);
    }

    public function index()
    {
        $parcours = Parcours::with(['modules' => function ($query) {
            $query->orderBy('order', 'asc')->with('sessions');
        }])->get();
        return response()->json($parcours);
    }

    public function show($slug)
    {
        // Try to find by slug first, then by ID if numeric
        $parcours = Parcours::where('slug', $slug)->with(['modules' => function ($query) {
            $query->orderBy('order', 'asc')->with('sessions');
        }])->first();

        if (!$parcours && is_numeric($slug)) {
            $parcours = Parcours::where('id', $slug)->with(['modules' => function ($query) {
                $query->orderBy('order', 'asc')->with('sessions');
            }])->firstOrFail();
        } else if (!$parcours) {
            abort(404);
        }

        return response()->json($parcours);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'slug' => 'required|string|max:255|unique:parcours,slug',
            'description' => 'nullable|string',
            'photo' => 'nullable|string',
            'lieu' => 'nullable|string',
            'horaires' => 'nullable|string',
            'price' => 'nullable|string',
            'price_ht' => 'nullable|string',
            'cta_link' => 'nullable|string',
            'modules' => 'array',
            'modules.*.title' => 'required|string',
        ]);

        $parcours = null;
        DB::transaction(function () use ($request, &$parcours) {
            $parcours = Parcours::create([
                'title' => $request->input('title'),
                'slug' => $request->input('slug'),
                'description' => $request->input('description'),
                'photo' => $request->input('photo'),
                'lieu' => $request->input('lieu', "Ferme J'nan Lemonie — Sidi Yamani"),
                'horaires' => $request->input('horaires'),
                'price' => $request->input('price'),
                'price_ht' => $request->input('price_ht'),
                'cta_link' => $request->input('cta_link'),
                'is_active' => true,
            ]);

            if ($request->has('modules')) {
                $modules = $request->input('modules');
                foreach ($modules as $index => $moduleData) {
                    $parcours->modules()->create([
                        'title' => $moduleData['title'],
                        'duration' => $moduleData['duration'] ?? null,
                        'horaires' => $moduleData['horaires'] ?? null,
                        'prerequis' => $moduleData['prerequis'] ?? null,
                        'subtitle' => $moduleData['subtitle'] ?? null,
                        'description' => $moduleData['description'] ?? null,
                        'details' => $moduleData['details'] ?? null,
                        'icon' => $moduleData['icon'] ?? null,
                        'price' => $moduleData['price'] ?? null,
                        'place' => $moduleData['place'] ?? null,
                        'order' => $index,
                    ]);
                }
            }

            // Ensure parcours.price is consistent: sum of module prices.
            // (If modules have no prices yet, this becomes "0 MAD".)
            $parcours->load('modules');
            $parcours->price = $this->computeParcoursPriceFromModules($parcours);
            $parcours->save();
        });

        if (!$parcours) {
            abort(500, 'Failed to create parcours');
        }

        return response()->json($parcours->load('modules'), 201);
    }

    public function update(Request $request, $id)
    {
        $parcours = Parcours::findOrFail($id);

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'photo' => 'nullable|string',
            'lieu' => 'nullable|string',
            'horaires' => 'nullable|string',
            'price' => 'nullable|string',
            'price_ht' => 'nullable|string',
            'cta_link' => 'nullable|string',
            'modules' => 'array',
            'modules.*.title' => 'required|string',
        ]);

        DB::transaction(function () use ($parcours, $request) {
            $parcours->update($request->only([
                'title', 'description', 'photo', 'lieu', 'horaires', 'price', 'price_ht', 'cta_link'
            ]));

            if ($request->has('modules')) {
                $inputModules = $request->input('modules');
                $existingModuleIds = $parcours->modules->pluck('id')->toArray();
                $inputModuleIds = array_filter(array_column($inputModules, 'id'));

                // Delete removed modules
                $modulesToDelete = array_diff($existingModuleIds, $inputModuleIds);
                ParcoursModule::destroy($modulesToDelete);

                foreach ($inputModules as $index => $moduleData) {
                    if (isset($moduleData['id']) && in_array($moduleData['id'], $existingModuleIds)) {
                        $module = ParcoursModule::find($moduleData['id']);
                        $module->update([
                            'title' => $moduleData['title'],
                            'duration' => $moduleData['duration'] ?? null,
                            'horaires' => $moduleData['horaires'] ?? null,
                            'prerequis' => $moduleData['prerequis'] ?? null,
                            'subtitle' => $moduleData['subtitle'] ?? null,
                            'description' => $moduleData['description'] ?? null,
                            'details' => $moduleData['details'] ?? null,
                            'icon' => $moduleData['icon'] ?? null,
                            'price' => $moduleData['price'] ?? null,
                            'place' => $moduleData['place'] ?? null,
                            'order' => $index,
                        ]);
                    } else {
                        $parcours->modules()->create([
                            'title' => $moduleData['title'],
                            'duration' => $moduleData['duration'] ?? null,
                            'horaires' => $moduleData['horaires'] ?? null,
                            'prerequis' => $moduleData['prerequis'] ?? null,
                            'subtitle' => $moduleData['subtitle'] ?? null,
                            'description' => $moduleData['description'] ?? null,
                            'details' => $moduleData['details'] ?? null,
                            'icon' => $moduleData['icon'] ?? null,
                            'price' => $moduleData['price'] ?? null,
                            'place' => $moduleData['place'] ?? null,
                            'order' => $index,
                        ]);
                    }
                }
            }

            // Ensure parcours.price is consistent: sum of module prices.
            $parcours->load('modules');
            $parcours->price = $this->computeParcoursPriceFromModules($parcours);
            $parcours->save();
        });

        return response()->json($parcours->load('modules'));
    }

    public function destroy($id)
    {
        $parcours = Parcours::findOrFail($id);
        
        DB::transaction(function () use ($parcours) {
            // Delete all associated modules first
            $parcours->modules()->delete();
            // Delete the parcours
            $parcours->delete();
        });

        return response()->json([
            'message' => 'Parcours supprimé avec succès',
            'success' => true
        ], 200);
    }
}
