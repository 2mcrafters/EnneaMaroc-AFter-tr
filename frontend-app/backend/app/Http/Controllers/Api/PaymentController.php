<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use App\Models\Enrollment;
use App\Models\User;
use App\Http\Requests\StorePaymentRequest;
use App\Http\Requests\AdminManualPaymentRequest;
use App\Http\Requests\UpdatePaymentRequest;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class PaymentController extends Controller
{
    /**
     * Admin manual payment: create payment for an existing student OR create a new student,
     * then create/reuse enrollment, then create payment.
     */
    public function adminManual(AdminManualPaymentRequest $request): JsonResponse
    {
        try {
            DB::beginTransaction();

            $mode = $request->mode;
            $status = $request->status ?? 'confirmed';

            /** @var User $user */
            if ($mode === 'new') {
                $student = (array) ($request->input('student') ?? []);

                // Create the student user (minimal fields); password is random (student can reset later if needed)
                $randomPassword = bin2hex(random_bytes(8));
                $user = User::create([
                    'firstName' => $student['firstName'] ?? '',
                    'lastName' => $student['lastName'] ?? '',
                    'email' => $student['email'] ?? '',
                    'phone' => $student['phone'] ?? null,
                    // Some installations use address/adresse; store what exists
                    'address' => $student['address'] ?? null,
                    'password' => Hash::make($randomPassword),
                    'role' => 'student',
                ]);
            } else {
                $user = User::findOrFail($request->user_id);
            }

            $courseId = $request->course_id;

            // Resolve/create enrollment
            $enrollment = Enrollment::where('user_id', $user->id)
                ->where('course_id', $courseId)
                ->first();

            if (!$enrollment) {
                $enrollment = Enrollment::create([
                    'user_id' => $user->id,
                    'course_id' => $courseId,
                    'status' => 'active',
                    'enrolled_at' => now(),
                ]);
            }

            // Duplicate check on enrollment/month
            $existingPayment = Payment::where('enrollment_id', $enrollment->id)
                ->where('month', $request->month)
                ->first();
            if ($existingPayment) {
                return response()->json([
                    'success' => false,
                    'message' => 'Payment for this month already exists for this enrollment'
                ], 422);
            }

            $payment = Payment::create([
                'enrollment_id' => $enrollment->id,
                'amount' => $request->amount,
                'month' => $request->month,
                'status' => $status,
                'payment_proof' => $request->payment_proof,
                'payment_date' => $request->payment_date,
                'admin_notes' => $request->admin_notes
            ]);

            $payment->load(['enrollment.user', 'enrollment.course', 'confirmedBy']);

            DB::commit();

            return response()->json([
                'success' => true,
                'data' => $payment,
                'message' => 'Manual payment created successfully'
            ], 201);
        } catch (\Exception $e) {
            DB::rollback();
            return response()->json([
                'success' => false,
                'message' => 'Error creating manual payment: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $query = Payment::with([
                'enrollment.user', 
                'enrollment.course', 
                'enrollment.session.module.parcours', 
                'confirmedBy'
            ]);

            // Filter by status if provided
            if ($request->has('status') && $request->status !== 'all') {
                $query->where('status', $request->status);
            }

            // Filter by enrollment ID if provided
            if ($request->has('enrollment_id')) {
                $query->where('enrollment_id', $request->enrollment_id);
            }

            // Filter by user ID through enrollment relationship
            if ($request->has('user_id')) {
                $query->whereHas('enrollment', function ($q) use ($request) {
                    $q->where('user_id', $request->user_id);
                });
            }

            // Filter by date range
            if ($request->has('date_from')) {
                $query->where('payment_date', '>=', $request->date_from);
            }
            if ($request->has('date_to')) {
                $query->where('payment_date', '<=', $request->date_to);
            }

            // Search by user name or admin notes
            if ($request->has('search')) {
                $searchTerm = $request->search;
                $query->where(function ($q) use ($searchTerm) {
                    $q->where('admin_notes', 'like', "%{$searchTerm}%")
                      ->orWhereHas('enrollment.user', function ($userQuery) use ($searchTerm) {
                          $userQuery->where('first_name', 'like', "%{$searchTerm}%")
                                   ->orWhere('last_name', 'like', "%{$searchTerm}%")
                                   ->orWhere('email', 'like', "%{$searchTerm}%");
                      });
                });
            }

            // Order by payment date (newest first)
            $query->orderBy('payment_date', 'desc');

            // Paginate results
            $perPage = $request->get('per_page', 15);
            $payments = $query->paginate($perPage);

            return response()->json([
                'success' => true,
                'data' => $payments,
                'message' => 'Payments retrieved successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error retrieving payments: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StorePaymentRequest $request): JsonResponse
    {
        try {
            DB::beginTransaction();

            // Resolve enrollment:
            // - If enrollment_id provided, use it
            // - Else, find/create enrollment for the given user_id + course_id
            $enrollmentId = $request->enrollment_id;
            if (!$enrollmentId) {
                $userId = $request->user_id;
                $courseId = $request->course_id;

                // Try to reuse an existing enrollment
                $enrollment = Enrollment::where('user_id', $userId)
                    ->where('course_id', $courseId)
                    ->first();

                // Create if missing (admin manual payment path)
                if (!$enrollment) {
                    $enrollment = Enrollment::create([
                        'user_id' => $userId,
                        'course_id' => $courseId,
                        'status' => 'active',
                        'enrolled_at' => now(),
                    ]);
                }

                $enrollmentId = $enrollment->id;
            }

            // Check if payment for this enrollment and month already exists
            $existingPayment = Payment::where('enrollment_id', $enrollmentId)
                                    ->where('month', $request->month)
                                    ->first();

            if ($existingPayment) {
                return response()->json([
                    'success' => false,
                    'message' => 'Payment for this month already exists for this enrollment'
                ], 422);
            }

            // Create the payment
            $payment = Payment::create([
                'enrollment_id' => $enrollmentId,
                'amount' => $request->amount,
                'month' => $request->month,
                'status' => $request->status ?? 'pending', // Default status
                'payment_proof' => $request->payment_proof,
                'payment_date' => $request->payment_date,
                'admin_notes' => $request->admin_notes
            ]);

            // Load relationships for response
            $payment->load(['enrollment.user', 'enrollment.course']);

            DB::commit();

            return response()->json([
                'success' => true,
                'data' => $payment,
                'message' => 'Payment created successfully'
            ], 201);

        } catch (\Exception $e) {
            DB::rollback();
            return response()->json([
                'success' => false,
                'message' => 'Error creating payment: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id): JsonResponse
    {
        try {
            $payment = Payment::with(['enrollment.user', 'enrollment.course', 'confirmedBy'])
                             ->findOrFail($id);

            return response()->json([
                'success' => true,
                'data' => $payment,
                'message' => 'Payment retrieved successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Payment not found'
            ], 404);
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdatePaymentRequest $request, string $id): JsonResponse
    {
        try {
            DB::beginTransaction();

            $payment = Payment::findOrFail($id);
            
            // If status is being changed to confirmed, add confirmation details
            if ($request->has('status') && $request->status === 'confirmed' && $payment->status !== 'confirmed') {
                $request->merge([
                    'confirmed_by' => Auth::id(),
                    'confirmed_at' => now()
                ]);
            }

            // If status is being changed from confirmed, remove confirmation details
            if ($request->has('status') && $request->status !== 'confirmed' && $payment->status === 'confirmed') {
                $request->merge([
                    'confirmed_by' => null,
                    'confirmed_at' => null
                ]);
            }

            $payment->update($request->validated());
            $payment->load(['enrollment.user', 'enrollment.course', 'confirmedBy']);

            DB::commit();

            return response()->json([
                'success' => true,
                'data' => $payment,
                'message' => 'Payment updated successfully'
            ]);

        } catch (\Exception $e) {
            DB::rollback();
            return response()->json([
                'success' => false,
                'message' => 'Error updating payment: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id): JsonResponse
    {
        try {
            $payment = Payment::findOrFail($id);
            $payment->delete();

            return response()->json([
                'success' => true,
                'message' => 'Payment deleted successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error deleting payment: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Confirm a payment
     */
    public function confirm(string $id): JsonResponse
    {
        try {
            $payment = Payment::findOrFail($id);
            
            if ($payment->status === 'confirmed') {
                return response()->json([
                    'success' => false,
                    'message' => 'Payment is already confirmed'
                ], 422);
            }

            $payment->confirm(Auth::user());
            $payment->load(['enrollment.user', 'confirmedBy']);

            return response()->json([
                'success' => true,
                'data' => $payment,
                'message' => 'Payment confirmed successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error confirming payment: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Reject a payment
     */
    public function reject(string $id): JsonResponse
    {
        try {
            $payment = Payment::findOrFail($id);
            
            if ($payment->status === 'rejected') {
                return response()->json([
                    'success' => false,
                    'message' => 'Payment is already rejected'
                ], 422);
            }

            $payment->reject();
            $payment->load(['enrollment.user']);

            return response()->json([
                'success' => true,
                'data' => $payment,
                'message' => 'Payment rejected successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error rejecting payment: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get payments statistics
     */
    public function stats(): JsonResponse
    {
        try {
            $stats = [
                'total_payments' => Payment::count(),
                'pending_payments' => Payment::where('status', 'pending')->count(),
                'confirmed_payments' => Payment::where('status', 'confirmed')->count(),
                'rejected_payments' => Payment::where('status', 'rejected')->count(),
                'total_amount' => Payment::where('status', 'confirmed')->sum('amount'),
                'monthly_revenue' => Payment::where('status', 'confirmed')
                                          ->where('created_at', '>=', now()->startOfMonth())
                                          ->sum('amount'),
                'payments_this_month' => Payment::where('created_at', '>=', now()->startOfMonth())->count()
            ];

            return response()->json([
                'success' => true,
                'data' => $stats,
                'message' => 'Payment statistics retrieved successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error retrieving statistics: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * List payments for a specific user (by user enrollments)
     */
    public function userPayments($userId): JsonResponse
    {
        try {
            $payments = Payment::with(['enrollment.user', 'confirmedBy'])
                ->whereHas('enrollment', function($q) use ($userId) {
                    $q->where('user_id', $userId);
                })
                ->orderByDesc('created_at')
                ->get();

            return response()->json([
                'success' => true,
                // Frontend service attend la clé "payments"
                'payments' => $payments,
                'count' => $payments->count(),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error retrieving user payments: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Upload payment proof file
     */
    public function uploadProof(Request $request, string $id): JsonResponse
    {
        try {
            $payment = Payment::findOrFail($id);
            
            // Validate the uploaded file
            $request->validate([
                'payment_proof' => 'required|file|mimes:jpeg,png,jpg,pdf|max:2048', // 2MB max
            ]);

            if ($request->hasFile('payment_proof')) {
                $file = $request->file('payment_proof');
                $filename = time() . '_' . $file->getClientOriginalName();
                $path = $file->storeAs('payment_proofs', $filename, 'public');
                
                // Update payment with file path
                $payment->update([
                    'payment_proof' => $path,
                ]);

                $payment->load(['enrollment.user', 'confirmedBy']);

                return response()->json([
                    'success' => true,
                    'data' => $payment,
                    'message' => 'Payment proof uploaded successfully'
                ]);
            }

            return response()->json([
                'success' => false,
                'message' => 'No file uploaded'
            ], 400);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error uploading payment proof: ' . $e->getMessage()
            ], 500);
        }
    }
}
