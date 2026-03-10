<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use App\Models\CourseGroup;

class CourseGroupUpdateController extends Controller
{
    public function update(Request $request, int $groupId)
    {
        $validator = Validator::make($request->all(), [
            'title' => 'nullable|string|max:255',
            'subtitle' => 'nullable|string|max:255',
        ]);
        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $group = CourseGroup::find($groupId);
        if (!$group) {
            return response()->json([
                'success' => false,
                'message' => 'Course group not found',
            ], 404);
        }

        // Authorization: admin & employee, or the assigned instructor
        $user = $request->user();
        if (!in_array($user->role, ['admin','employee']) && (int)$user->id !== (int)$group->instructor_id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized',
            ], 403);
        }

        if ($request->has('title')) $group->title = $request->input('title');
        if ($request->has('subtitle')) $group->subtitle = $request->input('subtitle');
        $group->save();

        return response()->json([
            'success' => true,
            'message' => 'Course group updated',
            'data' => $group,
        ]);
    }
}
