<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\FileUploadController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\CourseController;

use App\Http\Controllers\Api\PaymentController;
use App\Http\Controllers\Api\EnrollmentController;
use App\Http\Controllers\Api\ConfirmationEmailController;
use App\Http\Controllers\Api\MeetingLinkController;
use App\Http\Controllers\Api\ParcoursController;
use App\Http\Controllers\Api\ParcoursSessionController;

// Routes d'authentification publiques
// Provide a friendly GET response for /api/login so visiting the route in a browser
// returns a clear JSON message instead of a MethodNotAllowed exception.
Route::get('/login', function () {
    return response()->json([
        'message' => 'This endpoint accepts POST requests. Send credentials with POST to /api/login.'
    ], 405);
});
Route::post('/login', [AuthController::class, 'login'])->name('login');
Route::post('/register', [AuthController::class, 'register']);

// Routes pour upload de fichiers (publiques pour l'inscription)
Route::post('/upload/profile-picture', [FileUploadController::class, 'uploadProfilePicture']);
Route::post('/upload/document', [FileUploadController::class, 'uploadDocument']);
Route::post('/upload/image', [FileUploadController::class, 'uploadImage']);

// Routes courses (legacy – migrated to parcours; stub returns empty data to avoid 500)
Route::get('/courses/search', fn() => response()->json(['success' => true, 'data' => [], 'message' => 'Migrated to parcours']));
Route::get('/courses/stats',  fn() => response()->json(['success' => true, 'data' => [], 'message' => 'Migrated to parcours']));
Route::get('/courses',        fn() => response()->json(['success' => true, 'data' => [], 'total' => 0, 'message' => 'Migrated to parcours']));
Route::get('/courses/{id}',   fn() => response()->json(['success' => false, 'message' => 'Not found – migrated to parcours'], 404));

// Routes publiques des parcours
Route::get('/parcours', [ParcoursController::class, 'index']);
Route::get('/parcours/{slug}', [ParcoursController::class, 'show']);
Route::get('/parcours-sessions', [ParcoursSessionController::class, 'index']);

// Routes protégées par Sanctum
Route::middleware('auth:sanctum')->group(function () {
    // Routes d'authentification
    Route::get('/user', [AuthController::class, 'user']);
    Route::put('/user/profile', [AuthController::class, 'updateProfile']);
    Route::put('/user/email', [AuthController::class, 'updateEmail']);
    Route::put('/user/password', [AuthController::class, 'updatePassword']);
    Route::post('/user/profile-picture', [AuthController::class, 'updateProfilePicture']);
    Route::post('/logout', [AuthController::class, 'logout']);

    // Routes de gestion des fichiers
    Route::delete('/upload/profile-picture', [FileUploadController::class, 'deleteProfilePicture']);
    Route::delete('/upload/document', [FileUploadController::class, 'deleteDocument']);

    // Routes de gestion des utilisateurs
    Route::get('/users/search', [UserController::class, 'search']);
    Route::get('/users/stats', [UserController::class, 'stats']);
    Route::apiResource('users', UserController::class);
    Route::put('/profile', [UserController::class, 'updateProfile']);
    Route::post('/change-password', [UserController::class, 'changePassword']);

    // Routes des enseignants et étudiants
    Route::get('/teachers/{id}/courses', [UserController::class, 'getTeacherCourses']);
    Route::get('/students/{id}/courses', [UserController::class, 'getStudentCourses']);

    // Routes de gestion des cours (création, modification, suppression - auth requise)
    Route::post('/courses', [CourseController::class, 'store']);
    Route::put('/courses/{id}', [CourseController::class, 'update']);
    Route::delete('/courses/{id}', [CourseController::class, 'destroy']);
    Route::post('/courses/{id}/enroll', [CourseController::class, 'enrollStudent']);
    Route::delete('/courses/{id}/unenroll', [CourseController::class, 'unenrollStudent']);
    Route::get('/courses/{id}/enrollments', [CourseController::class, 'getEnrollments']);

    // Routes des matières
    Route::apiResource('subjects', CourseController::class);



    // Routes des paiements
    Route::apiResource('payments', PaymentController::class);
    Route::post('/payments/admin-manual', [PaymentController::class, 'adminManual']);
    Route::post('/payments/{id}/confirm', [PaymentController::class, 'confirm']);
    Route::post('/payments/{id}/reject', [PaymentController::class, 'reject']);
    Route::post('/payments/{id}/upload-proof', [PaymentController::class, 'uploadProof']);
    Route::get('/payments-stats', [PaymentController::class, 'stats']);
    // Paiements d'un utilisateur spécifique
    Route::get('/users/{userId}/payments', [PaymentController::class, 'userPayments']);

    // Routes des inscriptions
    Route::apiResource('enrollments', EnrollmentController::class);
    // Confirmation popup form (email)
    Route::post('/enrollments/confirmation-email', [ConfirmationEmailController::class, 'send']);
    // Dev-only: quick SMTP test (no personal data)
    if (config('app.env') === 'local') {
        Route::post('/enrollments/confirmation-email/test', [ConfirmationEmailController::class, 'test']);
    }
    Route::post('/enrollments/{id}/activate', [EnrollmentController::class, 'activate']);
    Route::post('/enrollments/{id}/cancel', [EnrollmentController::class, 'cancel']);
    Route::get('/enrollments-stats', [EnrollmentController::class, 'stats']);
    Route::get('/users/{userId}/enrollments', [EnrollmentController::class, 'userEnrollments']);

    // Routes de gestion des parcours
    Route::post('/parcours', [ParcoursController::class, 'store']);
    Route::put('/parcours/{id}', [ParcoursController::class, 'update']);
    Route::delete('/parcours/{id}', [ParcoursController::class, 'destroy']);
    Route::apiResource('parcours-sessions', ParcoursSessionController::class)->except(['index']);

    // Meeting link updates (atomic)
    Route::patch('/course-groups/{groupId}/meeting-link', [MeetingLinkController::class, 'updateCourseGroup']);
    // Course group generic updates (title, subtitle)
    Route::patch('/course-groups/{groupId}', [\App\Http\Controllers\Api\CourseGroupUpdateController::class, 'update']);


    // Session status management
    Route::patch('/courses/{courseId}/groups/{groupIndex}/status', [\App\Http\Controllers\Api\SessionStatusController::class, 'toggleCourseGroupStatus']);
    Route::get('/courses/{courseId}/groups/status', [\App\Http\Controllers\Api\SessionStatusController::class, 'getCourseGroupsStatus']);

    // Session cancellations (per occurrence)
    Route::get('/session-cancellations', [\App\Http\Controllers\Api\SessionCancellationController::class, 'index']);
    Route::post('/session-cancellations', [\App\Http\Controllers\Api\SessionCancellationController::class, 'store']);
    Route::delete('/session-cancellations/{id}', [\App\Http\Controllers\Api\SessionCancellationController::class, 'destroy']);
});
