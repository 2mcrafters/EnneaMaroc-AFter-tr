// Service de gestion des fichiers (upload, suppression)
import { BaseApiService } from './baseApi';

export interface UploadResponse {
  success: boolean;
  url?: string;
  path?: string;
  message?: string;
}

export interface DeleteFileResponse {
  success: boolean;
  message?: string;
}

class FileService extends BaseApiService {
  // Upload d'une photo de profil
  async uploadProfilePicture(file: File): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append('profile_picture', file);
    
    return this.makeUploadRequest<UploadResponse>('/upload/profile-picture', formData);
  }

  // Supprimer une photo de profil
  async deleteProfilePicture(path: string): Promise<DeleteFileResponse> {
    return this.makeRequest<DeleteFileResponse>('/upload/profile-picture', {
      method: 'DELETE',
      body: JSON.stringify({ path }),
    });
  }

  // Upload de documents (pour les cours, etc.)
  async uploadDocument(file: File, type: 'course' | 'assignment' | 'other' = 'other'): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append('document', file);
    formData.append('type', type);
    
    return this.makeUploadRequest<UploadResponse>('/upload/document', formData);
  }

  // Supprimer un document
  async deleteDocument(path: string): Promise<DeleteFileResponse> {
    return this.makeRequest<DeleteFileResponse>('/upload/document', {
      method: 'DELETE',
      body: JSON.stringify({ path }),
    });
  }

  // Upload d'une image générique
  async uploadImage(file: File, folder: string = 'images'): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('folder', folder);
    
    return this.makeUploadRequest<UploadResponse>('/upload/image', formData);
  }

  // Valider un fichier avant upload
  validateFile(file: File, options: {
    maxSize?: number; // en MB
    allowedTypes?: string[];
  } = {}): { valid: boolean; error?: string } {
    const { maxSize = 2, allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif'] } = options;
    
    // Vérifier la taille
    const sizeInMB = file.size / (1024 * 1024);
    if (sizeInMB > maxSize) {
      return {
        valid: false,
        error: `File size must be less than ${maxSize}MB`
      };
    }
    
    // Vérifier le type
    if (!allowedTypes.includes(file.type)) {
      return {
        valid: false,
        error: `File type not allowed. Allowed types: ${allowedTypes.join(', ')}`
      };
    }
    
    return { valid: true };
  }

  // Créer une preview d'image
  createImagePreview(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          resolve(e.target.result as string);
        } else {
          reject(new Error('Failed to read file'));
        }
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  }

  // Redimensionner une image (pour optimiser l'upload)
  async resizeImage(file: File, maxWidth: number = 800, maxHeight: number = 600, quality: number = 0.8): Promise<File> {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        // Calculer les nouvelles dimensions
        let { width, height } = img;
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width *= ratio;
          height *= ratio;
        }
        
        canvas.width = width;
        canvas.height = height;
        
        // Dessiner l'image redimensionnée
        ctx?.drawImage(img, 0, 0, width, height);
        
        // Convertir en blob puis en File
        canvas.toBlob((blob) => {
          if (blob) {
            const resizedFile = new File([blob], file.name, {
              type: file.type,
              lastModified: Date.now(),
            });
            resolve(resizedFile);
          } else {
            resolve(file); // Fallback vers le fichier original
          }
        }, file.type, quality);
      };
      
      img.src = URL.createObjectURL(file);
    });
  }
}

export const fileService = new FileService();