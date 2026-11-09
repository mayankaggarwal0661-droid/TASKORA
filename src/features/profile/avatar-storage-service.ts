import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { app, isFirebaseConfigured } from '@/features/auth/firebase-config';

export interface AvatarUploadResult {
  success: boolean;
  url?: string;
  isCloudStorage?: boolean;
  error?: string;
}

/**
 * Service to manage profile picture uploads, Firebase Storage integration,
 * image cropping, and durable local storage fallback.
 */
export class AvatarStorageService {
  private static STORAGE_KEY_PREFIX = 'taskora_custom_avatar_';

  /**
   * Upload an avatar blob to Firebase Storage for an authenticated user.
   * If Firebase Storage is unconfigured or unavailable, cleanly falls back
   * to high-efficiency local data URI storage.
   */
  public static async uploadAvatar(
    userId: string,
    blob: Blob,
    fallbackDataUrl: string
  ): Promise<AvatarUploadResult> {
    if (!userId) {
      return { success: false, error: 'User identity is required.' };
    }

    // Always persist to local user cache immediately for instant, zero-latency rendering
    this.saveLocalAvatar(userId, fallbackDataUrl);

    // If Firebase is configured and user is not a guest, attempt Firebase Storage upload
    if (isFirebaseConfigured() && userId !== 'guest' && !userId.startsWith('guest_')) {
      try {
        const storage = getStorage(app);
        // Use a stable yet timestamped filename to allow caching while avoiding stale browser caches
        const filename = `avatar-${Date.now()}.jpg`;
        const storageRef = ref(storage, `profile-pictures/${userId}/${filename}`);

        const uploadResult = await uploadBytes(storageRef, blob, {
          contentType: 'image/jpeg',
          cacheControl: 'public,max-age=31536000',
          customMetadata: {
            uploadedBy: userId,
            uploadedAt: new Date().toISOString(),
          },
        });

        const downloadUrl = await getDownloadURL(uploadResult.ref);

        // Update local cache with canonical download URL
        this.saveLocalAvatar(userId, downloadUrl);

        return {
          success: true,
          url: downloadUrl,
          isCloudStorage: true,
        };
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        console.warn(
          '[AvatarStorageService] Firebase Storage upload unready or blocked. Using high-fidelity local profile storage:',
          msg
        );
        // Clean, graceful fallback: return the high quality local dataUrl
        return {
          success: true,
          url: fallbackDataUrl,
          isCloudStorage: false,
          error: `Saved locally. (Cloud storage note: ${msg})`,
        };
      }
    }

    // Guest or unconfigured mode
    return {
      success: true,
      url: fallbackDataUrl,
      isCloudStorage: false,
    };
  }

  /**
   * Remove custom avatar from storage and local cache
   */
  public static async removeAvatar(userId: string, currentUrl?: string | null): Promise<boolean> {
    this.clearLocalAvatar(userId);

    if (
      isFirebaseConfigured() &&
      userId &&
      userId !== 'guest' &&
      currentUrl &&
      currentUrl.includes('firebasestorage.googleapis.com')
    ) {
      try {
        const storage = getStorage(app);
        const storageRef = ref(storage, currentUrl);
        await deleteObject(storageRef).catch(() => {});
      } catch (err) {
        console.warn('[AvatarStorageService] Notice during remote avatar deletion:', err);
      }
    }

    return true;
  }

  /**
   * Cache avatar URL in localStorage scoped to user UID
   */
  public static saveLocalAvatar(userId: string, avatarUrl: string): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(`${this.STORAGE_KEY_PREFIX}${userId}`, avatarUrl);
    } catch (e) {
      console.warn('[AvatarStorageService] Local avatar storage warning:', e);
    }
  }

  /**
   * Get cached avatar URL for user UID
   */
  public static getLocalAvatar(userId: string): string | null {
    if (typeof window === 'undefined') return null;
    try {
      return localStorage.getItem(`${this.STORAGE_KEY_PREFIX}${userId}`);
    } catch {
      return null;
    }
  }

  /**
   * Clear cached avatar URL for user UID
   */
  public static clearLocalAvatar(userId: string): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.removeItem(`${this.STORAGE_KEY_PREFIX}${userId}`);
    } catch {}
  }

  /**
   * Crops, resizes, and compresses an image element to a high-quality circular-friendly square.
   */
  public static cropImageToBlob(
    img: HTMLImageElement,
    cropBox: { x: number; y: number; width: number; height: number },
    targetSize = 320
  ): Promise<{ blob: Blob; dataUrl: string }> {
    return new Promise((resolve, reject) => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = targetSize;
        canvas.height = targetSize;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          reject(new Error('Failed to create canvas 2D rendering context'));
          return;
        }

        // Use high-quality bicubic smoothing
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        // Fill with white background in case of transparent PNG/WebP
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, targetSize, targetSize);

        ctx.drawImage(
          img,
          cropBox.x,
          cropBox.y,
          cropBox.width,
          cropBox.height,
          0,
          0,
          targetSize,
          targetSize
        );

        const dataUrl = canvas.toDataURL('image/jpeg', 0.92);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve({ blob, dataUrl });
            } else {
              reject(new Error('Canvas toBlob conversion failed'));
            }
          },
          'image/jpeg',
          0.92
        );
      } catch (err) {
        reject(err);
      }
    });
  }
}

