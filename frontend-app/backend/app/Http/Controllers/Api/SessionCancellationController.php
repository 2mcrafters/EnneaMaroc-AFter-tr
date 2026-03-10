<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SessionCancellation;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SessionCancellationController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $request->validate([
            'from' => 'nullable|date',
            'to' => 'nullable|date',
        ]);

        $query = SessionCancellation::query();
        if ($request->filled('from')) {
            $query->whereDate('session_date', '>=', $request->get('from'));
        }
        if ($request->filled('to')) {
            $query->whereDate('session_date', '<=', $request->get('to'));
        }

        $items = $query->orderBy('session_date', 'desc')->get();
        return response()->json(['success' => true, 'data' => $items]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'item_type' => 'required|string',
            'course_id' => 'nullable|integer',
            'parcours_id' => 'nullable|integer',
            'module_id' => 'nullable|integer',
            'revision_id' => 'nullable|integer',
            'course_group_index' => 'nullable|integer',
            'revision_modality_id' => 'nullable|integer',
            'day' => 'required|string',
            'time' => 'required|string',
            'session_date' => 'required|date',
        ]);

        $data['created_by'] = optional($request->user())->id;
        $cancellation = SessionCancellation::create($data);
        return response()->json(['success' => true, 'data' => $cancellation], 201);
    }

    public function destroy(int $id): JsonResponse
    {
        $c = SessionCancellation::findOrFail($id);
        $c->delete();
        return response()->json(['success' => true]);
    }
}
