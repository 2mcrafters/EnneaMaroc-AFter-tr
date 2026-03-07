<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ParcoursSession;
use Illuminate\Http\Request;

class ParcoursSessionController extends Controller
{
    public function index(Request $request)
    {
        $query = ParcoursSession::with(['module.parcours']);

        if ($request->has('start_date')) {
            $query->where('start_date', '>=', $request->start_date);
        }

        if ($request->has('end_date')) {
            $query->where('end_date', '<=', $request->end_date);
        }

        $sessions = $query->orderBy('start_date', 'asc')->get();
        return response()->json($sessions);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'parcours_module_id' => 'required|exists:parcours_modules,id',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after:start_date',
            'location' => 'nullable|string',
            'max_participants' => 'integer|min:1',
            'notes' => 'nullable|string',
        ]);

        $session = ParcoursSession::create($validated);
        return response()->json($session, 201);
    }

    public function update(Request $request, $id)
    {
        $session = ParcoursSession::findOrFail($id);

        $validated = $request->validate([
            'parcours_module_id' => 'exists:parcours_modules,id',
            'start_date' => 'date',
            'end_date' => 'date|after:start_date',
            'location' => 'nullable|string',
            'max_participants' => 'integer|min:1',
            'notes' => 'nullable|string',
        ]);

        $session->update($validated);
        return response()->json($session);
    }

    public function destroy($id)
    {
        $session = ParcoursSession::findOrFail($id);
        $session->delete();
        return response()->json(null, 204);
    }
}
