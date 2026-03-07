<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use App\Models\CourseGroup;
use App\Models\RevisionModality;
use Illuminate\Support\Facades\Log;

class MeetingLinkController extends Controller
{
    /**
     * Update (or clear) meeting link for a course group.
     */
    public function updateCourseGroup(Request $request, $groupId)
    {
        $validator = Validator::make($request->all(), [
            'meeting_link' => 'nullable|string|max:255'
        ]);
        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $group = CourseGroup::find($groupId);
        if (!$group) {
            return response()->json([
                'success' => false,
                'message' => 'Course group not found'
            ], 404);
        }

        // Authorization: admin & employee, or the assigned instructor
        $user = $request->user();
        if (!in_array($user->role, ['admin','employee']) && $user->id !== (int)$group->instructor_id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 403);
        }

        $group->meeting_link = $request->meeting_link; // nullable allowed
        $group->save();

        return response()->json([
            'success' => true,
            'message' => 'Meeting link updated',
            'data' => $group
        ]);
    }

    /**
     * Update (or clear) meeting link for a revision modality.
     */
    public function updateRevisionModality(Request $request, $modalityId)
    {
        $validator = Validator::make($request->all(), [
            'meeting_link' => 'nullable|string|max:255'
        ]);
        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $modality = RevisionModality::find($modalityId);
        if (!$modality) {
            return response()->json([
                'success' => false,
                'message' => 'Revision modality not found'
            ], 404);
        }

        // Authorization: admin & employee, or the assigned instructor
        $user = $request->user();
        if (!in_array($user->role, ['admin','employee']) && $user->id !== (int)$modality->instructor_id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 403);
        }

        $modality->meeting_link = $request->meeting_link; // nullable allowed
        $modality->save();

        return response()->json([
            'success' => true,
            'message' => 'Meeting link updated',
            'data' => $modality
        ]);
    }
}
