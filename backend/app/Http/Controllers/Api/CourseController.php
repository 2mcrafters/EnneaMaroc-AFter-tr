<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\CourseGroup;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Schema;

class CourseController extends Controller
{
    /**
     * Récupérer tous les cours avec leurs groupes et instructeurs
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $query = Course::with(['groups.instructor']);
            
            // Filtres optionnels
            if ($request->has('type')) {
                $query->where('type', $request->type);
            }
            
            if ($request->has('status')) {
                $query->where('status', $request->status);
            } else {
                $query->where('status', 'active'); // Par défaut, seulement les cours actifs
            }

            // Recherche par titre ou description
            if ($request->has('search')) {
                $search = $request->search;
                $query->where(function($q) use ($search) {
                    $q->where('title', 'like', "%{$search}%")
                      ->orWhere('short_description', 'like', "%{$search}%");
                });
            }

            $courses = $query->orderBy('title')->get();

            return response()->json([
                'success' => true,
                'data' => $courses,
                'total' => $courses->count()
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching courses: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error fetching courses',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Créer un nouveau cours
     */
    public function store(Request $request): JsonResponse
    {
        try {
            // Support multipart FormData where 'groups' is a JSON string
            $rawGroups = $request->input('groups');
            if (is_string($rawGroups)) {
                $decoded = json_decode($rawGroups, true);
                if (json_last_error() === JSON_ERROR_NONE && is_array($decoded)) {
                    $request->merge(['groups' => $decoded]);
                }
            }
            $validator = Validator::make($request->all(), [
                'title' => 'required|string|max:255',
                'description' => 'required|string',
                'short_description' => 'required|string|max:500',
                'type' => 'required|in:in-person,online',
                'duration_months' => 'required|integer|min:1|max:24',
                'sessions_per_month' => 'required|integer|min:1|max:20',
                // Accept either previously uploaded relative path, raw base64 dataURI or an uploaded file field named image
                'image_url' => 'nullable|string',
                'image' => 'nullable|file|image|max:4096', // 4MB limit
                'groups' => 'required|array|min:1',
                'groups.*.title' => 'nullable|string|max:255',
                'groups.*.subtitle' => 'nullable|string|max:255',
                'groups.*.day' => 'nullable|string',
                'groups.*.time' => 'nullable|string',
                'groups.*.jour' => 'nullable|integer|min:1|max:31',
                'groups.*.month' => 'nullable|integer|min:1|max:12',
                'groups.*.price' => 'required|numeric|min:0',
                'groups.*.instructor_id' => 'nullable|exists:users,id',
                'groups.*.meeting_link' => 'nullable|string',
                'groups.*.capacity' => 'nullable|integer|min:1|max:100'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

        // Handle image upload with better error handling
        $storedImagePath = null;
        try {
            if ($request->hasFile('image')) {
                $file = $request->file('image');
                if ($file->isValid()) {
                    // Check file size (max 10MB)
                    if ($file->getSize() > 10 * 1024 * 1024) {
                        return response()->json([
                            'success' => false,
                            'message' => 'Image file too large. Maximum size is 10MB.'
                        ], 422);
                    }
                    $storedImagePath = $file->store('courses', 'public');
                    Log::info('Image uploaded successfully: ' . $storedImagePath);
                } else {
                    Log::error('Invalid file upload: ' . $file->getErrorMessage());
                    return response()->json([
                        'success' => false,
                        'message' => 'Invalid file upload: ' . $file->getErrorMessage()
                    ], 422);
                }
            } elseif ($request->filled('image_url') && str_starts_with($request->image_url, 'data:image')) {
                // Base64 data URI -> decode and store
                $data = $request->image_url;
                if (preg_match('/^data:image\/(png|jpg|jpeg|webp);base64,/', $data, $type)) {
                    $data = substr($data, strpos($data, ',') + 1);
                    $decoded = base64_decode($data);
                    if ($decoded === false) {
                        return response()->json([
                            'success' => false,
                            'message' => 'Invalid base64 image data'
                        ], 422);
                    }
                    $extension = $type[1] === 'jpeg' ? 'jpg' : $type[1];
                    $fileName = 'courses/' . uniqid('course_', true) . '.' . $extension;
                    Storage::disk('public')->put($fileName, $decoded);
                    $storedImagePath = $fileName;
                    Log::info('Base64 image processed successfully: ' . $storedImagePath);
                }
            } elseif ($request->filled('image_url')) {
                // Already a relative path coming from client (edit case)
                $storedImagePath = $request->image_url;
            }
        } catch (\Exception $ie) {
            Log::error('Course image upload failed: ' . $ie->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Image processing failed: ' . $ie->getMessage()
            ], 500);
        }            // Créer le cours
            $course = Course::create([
                'title' => $request->title,
                'description' => $request->description,
                'short_description' => $request->short_description,
                'type' => $request->type,
                'duration_months' => $request->duration_months,
                'sessions_per_month' => $request->sessions_per_month,
                'image_url' => $storedImagePath,
                'status' => 'active'
            ]);

            // Debug: log incoming groups payload
            Log::debug('Creating course groups payload', ['groups' => $request->groups]);

            // Créer les groupes
            foreach ($request->groups as $groupData) {
                // Prepare data array and handle DB schema variations
                $data = [
                    'course_id' => $course->id,
                    'title' => $groupData['title'] ?? null,
                    'subtitle' => $groupData['subtitle'] ?? null,
                    'day' => $groupData['day'] ?? '',
                    'time' => $groupData['time'] ?? '',
                    'price' => $groupData['price'] ?? 0,
                    'instructor_id' => $groupData['instructor_id'] ?? null,
                    'meeting_link' => $groupData['meeting_link'] ?? null,
                    'capacity' => $groupData['capacity'] ?? 20,
                    'status' => 'active'
                ];

                // If DB has jour/month columns, set them; otherwise, try to build a date column
                if (Schema::hasColumn('course_groups', 'jour') && Schema::hasColumn('course_groups', 'month')) {
                    $data['jour'] = isset($groupData['jour']) ? $groupData['jour'] : null;
                    $data['month'] = isset($groupData['month']) ? $groupData['month'] : null;
                } elseif (isset($groupData['jour']) && isset($groupData['month']) && Schema::hasColumn('course_groups', 'date')) {
                    // Build a full date using current year if only 'date' exists
                    $y = date('Y');
                    $mm = str_pad((string)$groupData['month'], 2, '0', STR_PAD_LEFT);
                    $dd = str_pad((string)$groupData['jour'], 2, '0', STR_PAD_LEFT);
                    $data['date'] = "{$y}-{$mm}-{$dd}";
                }

                CourseGroup::create($data);
            }

            // Retourner le cours avec ses groupes
            $course->load(['groups.instructor']);

            return response()->json([
                'success' => true,
                'message' => 'Course created successfully',
                'data' => $course
            ], 201);
        } catch (\Exception $e) {
            Log::error('Error creating course: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error creating course',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Récupérer un cours spécifique
     */
    public function show(Request $request, $courseId): JsonResponse
    {
        try {
            $course = Course::with(['groups.instructor'])->find($courseId);

            if (!$course) {
                return response()->json([
                    'success' => false,
                    'message' => 'Course not found'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => $course
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching course: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error fetching course',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Mettre à jour un cours
     */
    public function update(Request $request, $courseId): JsonResponse
    {
        try {
            $course = Course::find($courseId);

            if (!$course) {
                return response()->json([
                    'success' => false,
                    'message' => 'Course not found'
                ], 404);
            }

            // Support multipart FormData where 'groups' is a JSON string
            $rawGroups = $request->input('groups');
            if (is_string($rawGroups)) {
                $decoded = json_decode($rawGroups, true);
                if (json_last_error() === JSON_ERROR_NONE && is_array($decoded)) {
                    $request->merge(['groups' => $decoded]);
                }
            }
            $validator = Validator::make($request->all(), [
                'title' => 'required|string|max:255',
                'description' => 'required|string',
                'short_description' => 'required|string|max:500',
                'type' => 'required|in:in-person,online',
                'duration_months' => 'required|integer|min:1|max:24',
                'sessions_per_month' => 'required|integer|min:1|max:20',
                'image_url' => 'nullable|string',
                'image' => 'nullable|file|image|max:4096',
                'status' => 'nullable|in:active,inactive,completed',
                'groups' => 'required|array|min:1',
                'groups.*.title' => 'nullable|string|max:255',
                'groups.*.subtitle' => 'nullable|string|max:255',
                'groups.*.day' => 'nullable|string',
                'groups.*.time' => 'nullable|string',
                'groups.*.price' => 'required|numeric|min:0',
                'groups.*.instructor_id' => 'nullable|exists:users,id',
                'groups.*.meeting_link' => 'nullable|string',
                'groups.*.capacity' => 'nullable|integer|min:1|max:100'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            // Handle image upload/update with better error handling
            $storedImagePath = $course->image_url; // keep existing by default
            try {
                if ($request->hasFile('image')) {
                    $file = $request->file('image');
                    if ($file->isValid()) {
                        if ($file->getSize() > 10 * 1024 * 1024) {
                            return response()->json([
                                'success' => false,
                                'message' => 'Image file too large. Maximum size is 10MB.'
                            ], 422);
                        }
                        $storedImagePath = $file->store('courses', 'public');
                        Log::info('Image updated successfully: ' . $storedImagePath);
                    } else {
                        Log::error('Invalid file upload: ' . $file->getErrorMessage());
                        return response()->json([
                            'success' => false,
                            'message' => 'Invalid file upload: ' . $file->getErrorMessage()
                        ], 422);
                    }
                } elseif ($request->filled('image_url') && str_starts_with($request->image_url, 'data:image')) {
                    $data = $request->image_url;
                    if (preg_match('/^data:image\/(png|jpg|jpeg|webp);base64,/', $data, $type)) {
                        $data = substr($data, strpos($data, ',') + 1);
                        $decoded = base64_decode($data);
                        if ($decoded === false) {
                            return response()->json([
                                'success' => false,
                                'message' => 'Invalid base64 image data'
                            ], 422);
                        }
                        $extension = $type[1] === 'jpeg' ? 'jpg' : $type[1];
                        $fileName = 'courses/' . uniqid('course_', true) . '.' . $extension;
                        Storage::disk('public')->put($fileName, $decoded);
                        $storedImagePath = $fileName;
                        Log::info('Base64 image updated successfully: ' . $storedImagePath);
                    }
                } elseif ($request->filled('image_url')) {
                    $storedImagePath = $request->image_url; // may already be relative path
                }
            } catch (\Exception $ie) {
                Log::error('Course image update failed: ' . $ie->getMessage());
                return response()->json([
                    'success' => false,
                    'message' => 'Image processing failed: ' . $ie->getMessage()
                ], 500);
            }

            // Mettre à jour le cours
            $course->update([
                'title' => $request->title,
                'description' => $request->description,
                'short_description' => $request->short_description,
                'type' => $request->type,
                'duration_months' => $request->duration_months,
                'sessions_per_month' => $request->sessions_per_month,
                'image_url' => $storedImagePath,
                'status' => $request->status ?? $course->status
            ]);

            // Supprimer les anciens groupes et créer les nouveaux
            $course->groups()->delete();
            
            foreach ($request->groups as $groupData) {
                $data = [
                    'course_id' => $course->id,
                    'title' => $groupData['title'] ?? null,
                    'subtitle' => $groupData['subtitle'] ?? null,
                    'day' => $groupData['day'] ?? '',
                    'time' => $groupData['time'] ?? '',
                    'price' => $groupData['price'] ?? 0,
                    'instructor_id' => $groupData['instructor_id'] ?? null,
                    'meeting_link' => $groupData['meeting_link'] ?? null,
                    'capacity' => $groupData['capacity'] ?? 20,
                    'status' => 'active'
                ];

                if (Schema::hasColumn('course_groups', 'jour') && Schema::hasColumn('course_groups', 'month')) {
                    $data['jour'] = isset($groupData['jour']) ? $groupData['jour'] : null;
                    $data['month'] = isset($groupData['month']) ? $groupData['month'] : null;
                } elseif (isset($groupData['jour']) && isset($groupData['month']) && Schema::hasColumn('course_groups', 'date')) {
                    $y = date('Y');
                    $mm = str_pad((string)$groupData['month'], 2, '0', STR_PAD_LEFT);
                    $dd = str_pad((string)$groupData['jour'], 2, '0', STR_PAD_LEFT);
                    $data['date'] = "{$y}-{$mm}-{$dd}";
                }

                CourseGroup::create($data);
            }

            // Retourner le cours mis à jour
            $course->load(['groups.instructor']);

            return response()->json([
                'success' => true,
                'message' => 'Course updated successfully',
                'data' => $course
            ]);
        } catch (\Exception $e) {
            Log::error('Error updating course: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error updating course',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Supprimer un cours
     */
    public function destroy(Request $request, $courseId): JsonResponse
    {
        try {
            $course = Course::find($courseId);

            if (!$course) {
                return response()->json([
                    'success' => false,
                    'message' => 'Course not found'
                ], 404);
            }

            // Supprimer les groupes (cascade automatique avec la contrainte foreign key)
            $course->delete();

            return response()->json([
                'success' => true,
                'message' => 'Course deleted successfully'
            ]);
        } catch (\Exception $e) {
            Log::error('Error deleting course: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error deleting course',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Rechercher des cours
     */
    public function search(Request $request): JsonResponse
    {
        try {
            $query = $request->get('q', '');
            
            if (empty($query)) {
                return response()->json([
                    'success' => true,
                    'data' => [],
                    'total' => 0
                ]);
            }

            $courses = Course::with(['groups.instructor'])
                ->where('status', 'active')
                ->where(function($q) use ($query) {
                    $q->where('title', 'like', "%{$query}%")
                      ->orWhere('short_description', 'like', "%{$query}%")
                      ->orWhere('description', 'like', "%{$query}%");
                })
                ->orderBy('title')
                ->get();

            return response()->json([
                'success' => true,
                'data' => $courses,
                'total' => $courses->count()
            ]);
        } catch (\Exception $e) {
            Log::error('Error searching courses: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error searching courses',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Statistiques des cours
     */
    public function stats(): JsonResponse
    {
        try {
            $stats = [
                'total_courses' => Course::count(),
                'active_courses' => Course::where('status', 'active')->count(),
                'inactive_courses' => Course::where('status', 'inactive')->count(),
                'completed_courses' => Course::where('status', 'completed')->count(),
                'courses_by_type' => [
                    'in-person' => Course::where('type', 'in-person')->where('status', 'active')->count(),
                    'online' => Course::where('type', 'online')->where('status', 'active')->count()
                ],
                'total_groups' => CourseGroup::count(),
                'active_groups' => CourseGroup::where('status', 'active')->count()
            ];

            return response()->json([
                'success' => true,
                'data' => $stats
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching course stats: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error fetching course statistics',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}