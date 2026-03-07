/**
 * Compresses an image file to reduce its size while maintaining reasonable quality
 */
export async function compressImage(
  file: File, 
  maxWidth: number = 800, 
  maxHeight: number = 600, 
  quality: number = 0.8
): Promise<string> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      // Calculate new dimensions while maintaining aspect ratio
      let { width, height } = img;
      
      if (width > height) {
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }
      }

      // Set canvas dimensions
      canvas.width = width;
      canvas.height = height;

      // Draw and compress
      ctx!.drawImage(img, 0, 0, width, height);
      
      // Convert to base64 with compression
      const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
      resolve(compressedDataUrl);
    };

    img.onerror = () => reject(new Error('Failed to load image'));

    // Create object URL from file
    img.src = URL.createObjectURL(file);
  });
}

/**
 * Gets the size of a base64 data URL in MB
 */
export function getDataUrlSizeMB(dataUrl: string): number {
  // Remove data URL prefix and calculate actual size
  const base64 = dataUrl.split(',')[1];
  const bytes = (base64.length * 3) / 4;
  return bytes / (1024 * 1024);
}

/**
 * Validates file type for image uploads
 */
export function isValidImageType(file: File): boolean {
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  return validTypes.includes(file.type);
}
