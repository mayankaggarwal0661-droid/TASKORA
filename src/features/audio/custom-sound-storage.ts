// IndexedDB scoped audio asset storage for Taskora custom notification sounds
// Safely stores audio blobs scoped to the authenticated user's UID.

const DB_NAME = 'taskora_audio_store';
const DB_VERSION = 1;
const STORE_NAME = 'user_sounds';

export const MAX_AUDIO_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
export const SUPPORTED_AUDIO_TYPES = [
  'audio/mpeg',
  'audio/mp3',
  'audio/wav',
  'audio/wave',
  'audio/x-wav',
  'audio/ogg',
  'audio/vorbis',
  'audio/webm',
  'audio/aac',
  'audio/m4a',
  'audio/x-m4a',
];

interface AudioRecord {
  userId: string;
  name: string;
  type: string;
  size: number;
  dataUrl: string;
  updatedAt: string;
}

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB is not supported in this environment.'));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'userId' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error('Failed to open audio database.'));
  });
}

export class CustomSoundStorage {
  /**
   * Validate audio file type and size
   */
  public static validateAudioFile(file: File): { valid: boolean; error?: string } {
    if (!file) {
      return { valid: false, error: 'No audio file provided.' };
    }

    if (file.size > MAX_AUDIO_SIZE_BYTES) {
      const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
      return {
        valid: false,
        error: `Audio file is too large (${sizeMb} MB). Maximum supported size is 5 MB.`,
      };
    }

    const lowerName = file.name.toLowerCase();
    const hasValidExtension =
      lowerName.endsWith('.mp3') ||
      lowerName.endsWith('.wav') ||
      lowerName.endsWith('.ogg') ||
      lowerName.endsWith('.m4a') ||
      lowerName.endsWith('.aac') ||
      lowerName.endsWith('.webm');

    const isValidMime = file.type ? file.type.startsWith('audio/') || SUPPORTED_AUDIO_TYPES.includes(file.type) : false;

    if (!isValidMime && !hasValidExtension) {
      return {
        valid: false,
        error: 'Unsupported file format. Please upload an MP3, WAV, or OGG audio file.',
      };
    }

    return { valid: true };
  }

  /**
   * Save custom audio file to IndexedDB scoped strictly to user ID
   */
  public static async saveCustomAudio(
    userId: string,
    file: File
  ): Promise<{ success: boolean; dataUrl?: string; error?: string }> {
    const validation = this.validateAudioFile(file);
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }

    try {
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(new Error('Failed to read audio file.'));
        reader.readAsDataURL(file);
      });

      const db = await openDatabase();
      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);

        const record: AudioRecord = {
          userId: userId || 'guest',
          name: file.name,
          type: file.type || 'audio/mpeg',
          size: file.size,
          dataUrl,
          updatedAt: new Date().toISOString(),
        };

        const req = store.put(record);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error || new Error('Could not persist audio.'));
      });

      return { success: true, dataUrl };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Audio upload failed.';
      return { success: false, error: message };
    }
  }

  /**
   * Retrieve custom audio data URL for a specific user ID
   */
  public static async getCustomAudio(userId: string): Promise<string | null> {
    try {
      const db = await openDatabase();
      return new Promise<string | null>((resolve) => {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const req = store.get(userId || 'guest');

        req.onsuccess = () => {
          const rec = req.result as AudioRecord | undefined;
          resolve(rec?.dataUrl || null);
        };
        req.onerror = () => resolve(null);
      });
    } catch {
      return null;
    }
  }

  /**
   * Delete custom audio record for a specific user ID
   */
  public static async deleteCustomAudio(userId: string): Promise<boolean> {
    try {
      const db = await openDatabase();
      return new Promise<boolean>((resolve) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        const req = store.delete(userId || 'guest');

        req.onsuccess = () => resolve(true);
        req.onerror = () => resolve(false);
      });
    } catch {
      return false;
    }
  }
}
