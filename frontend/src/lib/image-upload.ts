'use client';

import { apiClient } from '@/lib/api/client';
import { logger } from '@/lib/default-logger';

export interface ImageUploadResponse {
  success: boolean;
  data?: {
    filename: string;
    url: string;
    originalName: string;
    size: number;
  };
  message?: string;
  error?: string;
}

export interface UploadResult {
  url: string;
  filename: string;
  originalName: string;
  size: number;
}

export interface ImageCompressOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: 'jpeg' | 'png' | 'webp';
}

class ImageClient {
  async upload(file: File, compressOptions?: ImageCompressOptions): Promise<{ data?: UploadResult; error?: string }> {
    try {
      const validation = this.validateImage(file);
      if (!validation.valid) {
        return { error: validation.error };
      }

      let processedFile = file;
      if (compressOptions && file.size > 1024 * 1024) {
        try {
          processedFile = await this.compressImage(file, compressOptions);
        } catch (compressionError) {
          logger.warn('Image compression failed, using original file:', compressionError);
        }
      }

      const formData = new FormData();
      formData.append('image', processedFile);

      // Log file details for debugging
      logger.debug('Uploading image:', {
        name: processedFile.name,
        type: processedFile.type,
        size: processedFile.size,
      });

      try {
        const result = await apiClient.post<ImageUploadResponse>('/upload/image', formData);

        if (!result.success || !result.data) {
          logger.error('Upload response error:', result);
          return { error: result.message || 'Failed to upload image' };
        }

        return {
          data: {
            url: result.data.url,
            filename: result.data.filename,
            originalName: result.data.originalName,
            size: result.data.size,
          },
        };
      } catch (requestError) {
        logger.error('Request failed:', requestError);
        throw requestError;
      }
    } catch (error) {
      logger.error('Image upload failed:', error);
      return { error: this.getErrorMessage(error) || 'Failed to upload image' };
    }
  }

  async delete(filename: string): Promise<{ error?: string }> {
    try {
      if (!filename) {
        return { error: 'Filename is required for deletion' };
      }

      await apiClient.delete('/upload/image', { data: { filename } });
      return {};
    } catch (error) {
      logger.error('Image deletion failed:', error);
      return { error: this.getErrorMessage(error) || 'Failed to delete image' };
    }
  }

  private validateImage(file: File): { valid: boolean; error?: string } {
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

    if (!validTypes.includes(file.type)) {
      return {
        valid: false,
        error: 'Please select a valid image file (JPEG, PNG, GIF, or WebP)',
      };
    }

    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return {
        valid: false,
        error: 'Image file size must be less than 10MB',
      };
    }

    return { valid: true };
  }

  private compressImage(file: File, options: ImageCompressOptions = {}): Promise<File> {
    return new Promise((resolve, reject) => {
      const { maxWidth = 1920, maxHeight = 1080, quality = 0.8, format = 'jpeg' } = options;

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      if (!ctx) {
        reject(new Error('Failed to get canvas context'));
        return;
      }

      img.onload = () => {
        let { width, height } = img;

        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }

        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }

        canvas.width = width;
        canvas.height = height;

        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Failed to compress image'));
              return;
            }

            const compressedFile = new File(
              [blob],
              file.name.replace(/\.[^/.]+$/, `.${format === 'jpeg' ? 'jpg' : format}`),
              {
                type: `image/${format}`,
                lastModified: Date.now(),
              }
            );

            resolve(compressedFile);
          },
          `image/${format}`,
          quality
        );
      };

      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };

      img.src = URL.createObjectURL(file);
    });
  }

  async getImageDimensions(file: File): Promise<{ width: number; height: number }> {
    return new Promise((resolve, reject) => {
      const img = new Image();

      img.onload = () => {
        resolve({
          width: img.naturalWidth,
          height: img.naturalHeight,
        });
      };

      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };

      img.src = URL.createObjectURL(file);
    });
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  }

  private getErrorMessage(error: unknown): string | undefined {
    if (error instanceof Error) {
      logger.error('Detailed upload error:', {
        message: error.message,
        stack: error.stack,
        name: error.name,
      });

      if (error.message.includes('413')) {
        return 'Image file is too large. Please choose a smaller file.';
      } else if (error.message.includes('401')) {
        return 'Authentication failed. Please log in again.';
      } else if (error.message.includes('400')) {
        return 'Bad request: The server could not process the image. Check format and file integrity.';
      } else if (error.message.includes('network')) {
        return 'Network error. Please check your connection and try again.';
      }

      return error.message;
    }

    return undefined;
  }
}

export const imageClient = new ImageClient();
