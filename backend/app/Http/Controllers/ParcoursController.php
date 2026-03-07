<?php

namespace App\Http\Controllers;

use App\Models\Parcours;
use App\Models\ParcoursModule;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ParcoursController extends Controller
{
    public function index()
    {
        $parcours = Parcours::with(['modules' => function ($query) {
            $query->orderBy('order', 'asc');
        }])->get();
        return response()->json($parcours);
    }

    public function show($slug)
    {
        // Try to find by slug first, then by ID if numeric
        $parcours = Parcours::where('slug', $slug)->with(['modules' => function ($query) {
            $query->orderBy('order', 'asc');
        }])->first();

        if (!$parcours && is_numeric($slug)) {
            $parcours = Parcours::where('id', $slug)->with(['modules' => function ($query) {
                $query->orderBy('order', 'asc');
            }])->firstOrFail();
        } else if (!$parcours) {
            abort(404);
        }

        return response()->json($parcours);
    }

    public function update(Request $request, $id)
    {
        $parcours = Parcours::findOrFail($id);

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'lieu' => 'nullable|string',
            'horaires' => 'nullable|string',
            'price' => 'nullable|string',
            'cta_link' => 'nullable|string',
            'modules' => 'array',
            'modules.*.title' => 'required|string',
        ]);

        DB::transaction(function () use ($parcours, $request) {
            $parcours->update($request->only([
                'title', 'description', 'lieu', 'horaires', 'price', 'cta_link'
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
                            'subtitle' => $moduleData['subtitle'] ?? null,
                            'description' => $moduleData['description'] ?? null,
                            'details' => $moduleData['details'] ?? null,
                            'icon' => $moduleData['icon'] ?? null,
                            'order' => $index,
                        ]);
                    } else {
                        $parcours->modules()->create([
                            'title' => $moduleData['title'],
                            'duration' => $moduleData['duration'] ?? null,
                            'subtitle' => $moduleData['subtitle'] ?? null,
                            'description' => $moduleData['description'] ?? null,
                            'details' => $moduleData['details'] ?? null,
                            'icon' => $moduleData['icon'] ?? null,
                            'order' => $index,
                        ]);
                    }
                }
            }
        });

        return response()->json($parcours->load('modules'));
    }
}
