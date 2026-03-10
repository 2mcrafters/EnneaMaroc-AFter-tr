<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\RevisionModality;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class SessionStatusController extends Controller
{
    /**
     * Toggle status of a course group
     */
    public function toggleCourseGroupStatus(Request $request): JsonResponse
    {
        $request->validate([
            'course_id' => 'required|integer|exists:courses,id',
            'group_index' => 'required|integer|min:0',
            'status' => 'required|in:active,inactive'
        ]);

        try {
            $course = Course::findOrFail($request->course_id);
            $groups = $course->groups ?? [];
            
            if (!isset($groups[$request->group_index])) {
                return response()->json([
                    'success' => false,
                    'message' => 'Group not found'
                ], 404);
            }

            // Update the specific group status
            $groups[$request->group_index]['status'] = $request->status;
            
            // Update course with modified groups
            $course->update(['groups' => $groups]);

            return response()->json([
                'success' => true,
                'message' => 'Group status updated successfully',
                'data' => [
                    'course_id' => $course->id,
                    'group_index' => $request->group_index,
                    'status' => $request->status
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update group status: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Toggle status of a revision modality
     */
    public function toggleRevisionModalityStatus(Request $request): JsonResponse
    {
        $request->validate([
            'modality_id' => 'required|integer|exists:revision_modalities,id',
            'status' => 'required|in:active,inactive'
        ]);

        try {
            $modality = RevisionModality::findOrFail($request->modality_id);
            
            $modality->update(['status' => $request->status]);

            return response()->json([
                'success' => true,
                'message' => 'Modality status updated successfully',
                'data' => [
                    'modality_id' => $modality->id,
                    'status' => $request->status
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update modality status: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get status of all course groups for a specific course
     */
    public function getCourseGroupsStatus(int $courseId): JsonResponse
    {
        try {
            $course = Course::findOrFail($courseId);
            $groups = $course->groups ?? [];
            
            $groupsWithStatus = array_map(function($group, $index) {
                return [
                    'index' => $index,
                    'day' => $group['day'] ?? '',
                    'time' => $group['time'] ?? '',
                    'status' => $group['status'] ?? 'active'
                ];
            }, $groups, array_keys($groups));

            return response()->json([
                'success' => true,
                'data' => $groupsWithStatus
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to get course groups status: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get status of all revision modalities for a specific revision
     */
    public function getRevisionModalitiesStatus(int $revisionId): JsonResponse
    {
        try {
            $modalities = RevisionModality::where('revision_id', $revisionId)->get();
            
            $modalitiesWithStatus = $modalities->map(function($modality) {
                return [
                    'id' => $modality->id,
                    'delivery_type' => $modality->delivery_type,
                    'session_type' => $modality->session_type,
                    'day' => $modality->day,
                    'time' => $modality->time,
                    'status' => $modality->status
                ];
            });

            return response()->json([
                'success' => true,
                'data' => $modalitiesWithStatus
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to get revision modalities status: ' . $e->getMessage()
            ], 500);
        }
    }
}