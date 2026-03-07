<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Enrollment;
use App\Models\Parcours;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class EnrollmentController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): JsonResponse
    {
        try {
            // Eager load relationships including group and its course
            $query = Enrollment::with(['user', 'payments', 'course', 'session.module.parcours']);

            // Filter by status if provided
            if ($request->has('status') && $request->status !== 'all') {
                $query->where('status', $request->status);
            }

            // Filter by user ID
            if ($request->has('user_id')) {
                $query->where('user_id', $request->user_id);
            }

            // NOTE: current schema has no `course_id`. Filter by group instead.
            if ($request->has('group_id')) {
                $query->where('group_id', $request->group_id);
            }

            // Filter by enrollment date range
            if ($request->has('date_from')) {
                $query->where('enrolled_at', '>=', $request->date_from);
            }
            if ($request->has('date_to')) {
                $query->where('enrolled_at', '<=', $request->date_to);
            }

            // Search by user name or email
            if ($request->has('search')) {
                $searchTerm = $request->search;
                $query->whereHas('user', function ($q) use ($searchTerm) {
                    $q->where('firstName', 'like', "%{$searchTerm}%")
                      ->orWhere('lastName', 'like', "%{$searchTerm}%")
                      ->orWhere('email', 'like', "%{$searchTerm}%");
                });
            }

            // Order by enrollment date (newest first)
            $query->orderBy('enrolled_at', 'desc');

            // Paginate results
            $perPage = $request->get('per_page', 15);
            $enrollments = $query->paginate($perPage);

            return response()->json([
                'success' => true,
                'data' => $enrollments,
                'message' => 'Enrollments retrieved successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error retrieving enrollments: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'user_id' => 'required|exists:users,id',
            // NOTE: current database schema has no `course_id`. The enrollment is tied to a chosen group/session.
            // Keep accepting `course_id` in the payload for backward compatibility (frontend still sends it),
            // but we don't store it.
            'course_id' => 'sometimes|integer',
            'group_id' => 'required|integer|min:1',
            'duration_months' => 'sometimes|integer|min:1|max:12',
            'notes' => 'nullable|string|max:1000'
        ]);

        // Only courses are supported now

        try {
            DB::beginTransaction();

            // Check if user is already enrolled in this course
            $existingEnrollment = Enrollment::where('user_id', $request->user_id)
                ->where('group_id', $request->group_id)
                ->whereIn('status', ['pending_payment', 'pending_confirmation', 'active'])
                ->first();

            if ($existingEnrollment) {
                $existingEnrollment->load(['user', 'payments']);

                return response()->json([
                    'success' => true,
                    'data' => $existingEnrollment,
                    'message' => 'Enrollment already exists'
                ], 200);
            }

            // Get duration from course if not provided
            $durationMonths = $request->duration_months;
            if (!$durationMonths) {
                $durationMonths = 1;
            }

            // Create the enrollment
            $enrollment = Enrollment::create([
                'user_id' => $request->user_id,
                'group_id' => $request->group_id,
                'status' => 'pending_payment',
                'enrolled_at' => now(),
                'duration_months' => $durationMonths,
                'notes' => $request->notes
            ]);

            // Load relationships for response
            $enrollment->load(['user']);

            DB::commit();

            return response()->json([
                'success' => true,
                'data' => $enrollment,
                'message' => 'Enrollment created successfully'
            ], 201);

        } catch (\Exception $e) {
            DB::rollback();
            return response()->json([
                'success' => false,
                'message' => 'Error creating enrollment: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id): JsonResponse
    {
        try {
            $enrollment = Enrollment::with(['user', 'payments', 'course'])
                                   ->findOrFail($id);

            return response()->json([
                'success' => true,
                'data' => $enrollment,
                'message' => 'Enrollment retrieved successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Enrollment not found'
            ], 404);
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id): JsonResponse
    {
        $request->validate([
            'status' => 'sometimes|in:pending_payment,pending_confirmation,active,cancelled,completed',
            'group_id' => 'sometimes|integer|min:1', // Peut être modifié
            'duration_months' => 'sometimes|integer|min:1|max:12',
            'notes' => 'nullable|string|max:1000'
        ]);

        try {
            DB::beginTransaction();

            $enrollment = Enrollment::findOrFail($id);
            $enrollment->update($request->only(['status', 'group_id', 'duration_months', 'notes']));
            $enrollment->load(['user', 'payments']);

            DB::commit();

            return response()->json([
                'success' => true,
                'data' => $enrollment,
                'message' => 'Enrollment updated successfully'
            ]);

        } catch (\Exception $e) {
            DB::rollback();
            return response()->json([
                'success' => false,
                'message' => 'Error updating enrollment: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id): JsonResponse
    {
        try {
            $enrollment = Enrollment::findOrFail($id);
            
            // Check if enrollment has confirmed payments
            if ($enrollment->hasConfirmedPayments()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cannot delete enrollment with confirmed payments'
                ], 422);
            }

            $enrollment->delete();

            return response()->json([
                'success' => true,
                'message' => 'Enrollment deleted successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error deleting enrollment: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Activate an enrollment
     */
    public function activate(string $id): JsonResponse
    {
        try {
            $enrollment = Enrollment::findOrFail($id);
            
            $enrollment->update(['status' => 'active']);
            $enrollment->load(['user', 'payments']);
            return response()->json([
                'success' => true,
                'data' => $enrollment,
                'message' => 'Enrollment activated successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error activating enrollment: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Cancel an enrollment
     */
    public function cancel(string $id): JsonResponse
    {
        try {
            $enrollment = Enrollment::findOrFail($id);
            
            $enrollment->update(['status' => 'cancelled']);
            $enrollment->load(['user', 'payments']);

            return response()->json([
                'success' => true,
                'data' => $enrollment,
                'message' => 'Enrollment cancelled successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error cancelling enrollment: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get enrollments statistics
     */
    public function stats(): JsonResponse
    {
        try {
            $stats = [
                'total_enrollments' => Enrollment::count(),
                'active_enrollments' => Enrollment::where('status', 'active')->count(),
                'pending_payment' => Enrollment::where('status', 'pending_payment')->count(),
                'pending_confirmation' => Enrollment::where('status', 'pending_confirmation')->count(),
                'cancelled_enrollments' => Enrollment::where('status', 'cancelled')->count(),
                'completed_enrollments' => Enrollment::where('status', 'completed')->count(),
                'enrollments_this_month' => Enrollment::where('enrolled_at', '>=', now()->startOfMonth())->count(),
                // Legacy field removed in current schema
                'course_enrollments' => 0
            ];

            return response()->json([
                'success' => true,
                'data' => $stats,
                'message' => 'Enrollment statistics retrieved successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error retrieving statistics: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get user's enrollments
     */
    public function userEnrollments(string $userId): JsonResponse
    {
        try {
            $enrollments = Enrollment::with(['payments'])
                                   ->where('user_id', $userId)
                                   ->orderBy('enrolled_at', 'desc')
                                   ->get();

            return response()->json([
                'success' => true,
                'data' => $enrollments,
                'message' => 'User enrollments retrieved successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error retrieving user enrollments: ' . $e->getMessage()
            ], 500);
        }
    }
}
