<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class FileUploadController extends Controller
{
    public function uploadProfilePicture(Request $request)
    {
        $request->validate([
            'profile_picture' => 'required|image|mimes:jpeg,png,jpg,gif|max:2048', // Max 2MB
        ]);

        try {
            $file = $request->file('profile_picture');
            
            // Générer un nom unique pour le fichier
            $fileName = Str::uuid() . '.' . $file->getClientOriginalExtension();
            
            // Stocker le fichier dans le dossier public/storage/profile_pictures
            $path = $file->storeAs('profile_pictures', $fileName, 'public');
            
            // Retourner l'URL complète du fichier
            $url = asset('storage/' . $path);
            
            return response()->json([
                'success' => true,
                'url' => $url,
                'path' => $path,
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Upload failed: ' . $e->getMessage(),
            ], 500);
        }
    }
    
    public function deleteProfilePicture(Request $request)
    {
        $request->validate([
            'path' => 'required|string',
        ]);
        
        try {
            if (Storage::disk('public')->exists($request->path)) {
                Storage::disk('public')->delete($request->path);
            }
            
            return response()->json([
                'success' => true,
                'message' => 'File deleted successfully',
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Delete failed: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Upload d'un document (cours, devoirs, etc.)
     */
    public function uploadDocument(Request $request)
    {
        $request->validate([
            'document' => 'required|file|mimes:pdf,doc,docx,xls,xlsx,ppt,pptx,txt,zip|max:10240', // Max 10MB
            'type' => 'required|string|in:course,assignment,other',
        ]);

        try {
            $file = $request->file('document');
            $type = $request->input('type', 'other');
            
            // Générer un nom unique pour le fichier
            $fileName = Str::uuid() . '.' . $file->getClientOriginalExtension();
            
            // Stocker le fichier dans le dossier approprié
            $folder = "documents/{$type}";
            $path = $file->storeAs($folder, $fileName, 'public');
            
            // Retourner l'URL complète du fichier
            $url = asset('storage/' . $path);
            
            return response()->json([
                'success' => true,
                'url' => $url,
                'path' => $path,
                'type' => $type,
                'original_name' => $file->getClientOriginalName(),
                'size' => $file->getSize(),
                'message' => 'Document uploaded successfully',
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Upload failed: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Supprimer un document
     */
    public function deleteDocument(Request $request)
    {
        $request->validate([
            'path' => 'required|string',
        ]);

        try {
            $path = $request->input('path');
            
            // Vérifier que le fichier existe
            if (!Storage::disk('public')->exists($path)) {
                return response()->json([
                    'success' => false,
                    'message' => 'File not found',
                ], 404);
            }
            
            // Supprimer le fichier
            Storage::disk('public')->delete($path);
            
            return response()->json([
                'success' => true,
                'message' => 'Document deleted successfully',
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Delete failed: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Upload d'une image générique (parcours, blog, etc.)
     */
    public function uploadImage(Request $request)
    {
        try {
            // Log request details for debugging
            \Log::info('Upload Image Request', [
                'has_image' => $request->hasFile('image'),
                'folder' => $request->input('folder'),
                'all_files' => $request->allFiles(),
            ]);

            $validator = \Validator::make($request->all(), [
                'image' => 'required|image|mimes:jpeg,png,jpg,gif,webp|max:5120', // Max 5MB
                'folder' => 'nullable|string|regex:/^[a-zA-Z0-9_\-\/]+$/',
            ]);

            if ($validator->fails()) {
                \Log::error('Validation failed', ['errors' => $validator->errors()->toArray()]);
                return response()->json([
                    'success' => false,
                    'message' => 'The image failed to upload',
                    'errors' => $validator->errors()->toArray(),
                ], 422);
            }

            $file = $request->file('image');
            $folder = $request->input('folder', 'images');
            
            // Ensure folder exists
            $storagePath = storage_path('app/public/' . $folder);
            if (!file_exists($storagePath)) {
                mkdir($storagePath, 0755, true);
            }
            
            // Générer un nom unique pour le fichier
            $fileName = Str::uuid() . '.' . $file->getClientOriginalExtension();
            
            // Stocker le fichier
            $path = $file->storeAs($folder, $fileName, 'public');
            
            if (!$path) {
                \Log::error('Failed to store file', ['folder' => $folder, 'filename' => $fileName]);
                throw new \Exception('Failed to store file on disk');
            }
            
            \Log::info('File uploaded successfully', ['path' => $path]);
            
            // Retourner l'URL complète du fichier
            $url = asset('storage/' . $path);
            
            return response()->json([
                'success' => true,
                'url' => $url,
                'path' => $path,
            ]);
            
        } catch (\Exception $e) {
            \Log::error('Upload exception', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            return response()->json([
                'success' => false,
                'message' => 'Upload failed: ' . $e->getMessage(),
            ], 500);
        }
    }
}
