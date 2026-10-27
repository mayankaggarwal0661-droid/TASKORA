'use client';

import React, { useState, useRef, useCallback } from 'react';
import { useTaskora } from '@/context/TaskoraContext';
import { useAuth } from '@/context/AuthContext';
import { BuiltInSoundId } from '@/types/notification';
import { soundService, BUILT_IN_SOUNDS } from '@/features/audio/sound-service';
import { CustomSoundStorage, MAX_AUDIO_SIZE_BYTES } from '@/features/audio/custom-sound-storage';
import { Button } from '@/components/ui/Button';
import {
  Volume2,
  VolumeX,
  Play,
  Square,
  Upload,
  Trash2,
  Check,
  Music,
  FileAudio,
  AlertCircle,
  Sparkles,
} from 'lucide-react';

export function NotificationSoundSettings() {
  const {
    notificationSettings,
    updateNotificationSettings,
    customSoundDataUrl,
    refreshCustomSound,
    addToast,
  } = useTaskora();

  const { user, isGuest } = useAuth();
  const authUid = user?.uid || (isGuest ? 'guest' : null);

  const selectedSoundId = notificationSettings.soundId || 'soft-chime';
  const volume = notificationSettings.soundVolume ?? 0.7;
  const isSilentMode = selectedSoundId === 'silent';

  // Preview state
  const [playingPreviewId, setPlayingPreviewId] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Stop currently playing sound and clear preview state
  const handleStopPreview = useCallback(() => {
    soundService.stopCurrentSound();
    setPlayingPreviewId(null);
  }, []);

  // Preview specific sound
  const handlePreviewSound = async (soundId: BuiltInSoundId) => {
    if (playingPreviewId === soundId) {
      handleStopPreview();
      return;
    }

    handleStopPreview();

    if (soundId === 'silent') {
      addToast({
        title: 'Silent Mode',
        message: 'No audio will play for notifications while Silent is selected.',
        type: 'info',
      });
      return;
    }

    setPlayingPreviewId(soundId);
    try {
      await soundService.previewSound(
        soundId,
        volume,
        soundId === 'custom' ? customSoundDataUrl : null
      );
    } catch {
      // Audio preview error caught gracefully
    } finally {
      // Auto-reset preview icon after standard audio duration
      const durationMs =
        soundId === 'gentle-bell'
          ? 1500
          : soundId === 'soft-chime'
          ? 700
          : soundId === 'glass-sparkle'
          ? 600
          : 500;
      setTimeout(() => {
        setPlayingPreviewId((current) => (current === soundId ? null : current));
      }, durationMs);
    }
  };

  // Select sound
  const handleSelectSound = (soundId: BuiltInSoundId) => {
    handleStopPreview();
    updateNotificationSettings({ soundId });
    soundService.playClick();
    addToast({
      title: 'Sound Updated',
      message: soundId === 'silent' ? 'Notification audio muted.' : `Selected ${soundId.replace('-', ' ')}.`,
      type: 'info',
    });
  };

  // Volume slider change
  const handleVolumeChange = (newVol: number) => {
    updateNotificationSettings({ soundVolume: newVol });
  };

  // Test sound button
  const handleTestSound = () => {
    handlePreviewSound(selectedSoundId);
  };

  // Upload custom sound
  const processUploadedFile = async (file: File) => {
    setUploadError(null);
    setIsUploading(true);

    const validation = CustomSoundStorage.validateAudioFile(file);
    if (!validation.valid) {
      setUploadError(validation.error || 'Invalid audio file.');
      setIsUploading(false);
      return;
    }

    const saveResult = await CustomSoundStorage.saveCustomAudio(authUid || 'guest', file);
    setIsUploading(false);

    if (saveResult.success) {
      await refreshCustomSound();
      updateNotificationSettings({
        soundId: 'custom',
        customSound: {
          name: file.name,
          type: file.type || 'audio/mpeg',
          size: file.size,
          uploadedAt: new Date().toISOString(),
        },
      });

      addToast({
        title: 'Custom Sound Uploaded',
        message: `"${file.name}" is now your active notification chime.`,
        type: 'success',
      });

      // Preview new custom sound
      if (saveResult.dataUrl) {
        soundService.playCustomAudio(saveResult.dataUrl, volume);
      }
    } else {
      setUploadError(saveResult.error || 'Failed to save audio file.');
      addToast({
        title: 'Upload Failed',
        message: saveResult.error || 'Could not save audio file.',
        type: 'error',
      });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processUploadedFile(file);
    }
    // Reset file input so re-selecting same file works
    if (e.target) e.target.value = '';
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processUploadedFile(file);
    }
  };

  const handleRemoveCustomSound = async () => {
    handleStopPreview();
    await CustomSoundStorage.deleteCustomAudio(authUid || 'guest');
    await refreshCustomSound();

    // Fallback to soft chime if active sound was custom
    updateNotificationSettings({
      soundId: selectedSoundId === 'custom' ? 'soft-chime' : selectedSoundId,
      customSound: null,
    });

    addToast({
      title: 'Custom Sound Removed',
      message: 'Reverted to default built-in sound.',
      type: 'info',
    });
  };

  return (
    <div id="notification-sounds" className="p-6 rounded-2xl bg-white border border-[#E7E0D5] shadow-sm space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#E7E0D5]">
        <div>
          <h3 className="text-base font-bold text-[#403B34] tracking-tight flex items-center gap-2">
            <Volume2 className="w-4 h-4 text-[#718368]" />
            Notification Sounds
          </h3>
          <p className="text-xs text-[#756E64] mt-0.5">
            Choose a built-in harmonic chime, adjust volume, or upload your own audio file.
          </p>
        </div>

        {/* Volume & Test Controls */}
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={handleTestSound}
            className="flex items-center gap-1.5 text-xs"
            disabled={isSilentMode}
            title={isSilentMode ? 'Sound is currently muted (Silent mode)' : 'Test selected sound'}
          >
            {playingPreviewId === selectedSoundId ? (
              <Square className="w-3.5 h-3.5 text-[#B95750] fill-current" />
            ) : (
              <Play className="w-3.5 h-3.5 text-[#718368] fill-current" />
            )}
            <span>{playingPreviewId === selectedSoundId ? 'Stop' : 'Test Sound'}</span>
          </Button>
        </div>
      </div>

      {/* Volume Slider Card */}
      <div className="p-4 rounded-xl bg-[#FBF9F5] border border-[#E7E0D5] space-y-2">
        <div className="flex items-center justify-between text-xs font-semibold text-[#403B34]">
          <span className="flex items-center gap-2">
            {isSilentMode || volume === 0 ? (
              <VolumeX className="w-4 h-4 text-[#968D81]" />
            ) : (
              <Volume2 className="w-4 h-4 text-[#718368]" />
            )}
            <span>Alert Volume</span>
          </span>
          <span className="font-mono text-[#756E64]">
            {isSilentMode ? 'Muted (Silent)' : `${Math.round(volume * 100)}%`}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={volume}
            disabled={isSilentMode}
            onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
            className="w-full h-2 bg-[#E7E0D5] rounded-lg appearance-none cursor-pointer accent-[#718368] disabled:opacity-40 disabled:cursor-not-allowed"
            aria-label="Notification sound volume"
          />
        </div>
      </div>

      {/* Built-in Sound Library Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="block text-xs font-semibold text-[#756E64] uppercase tracking-wider">
            Built-in Sound Library
          </label>
          <span className="text-[11px] text-[#968D81]">8 Synthesized Audio Options</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {BUILT_IN_SOUNDS.map((sound) => {
            const isSelected = selectedSoundId === sound.id;
            const isPreviewing = playingPreviewId === sound.id;

            return (
              <div
                key={sound.id}
                className={`p-3.5 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                  isSelected
                    ? 'bg-[#EAF0E5] border-[#718368]/50 shadow-xs'
                    : 'bg-[#FBF9F5] border-[#E7E0D5] hover:border-[#D9D0C3]'
                }`}
              >
                {/* Select Radio Area */}
                <button
                  type="button"
                  onClick={() => handleSelectSound(sound.id)}
                  className="flex items-start gap-3 flex-1 min-w-0 text-left cursor-pointer focus:outline-none"
                  aria-label={`Select ${sound.name}`}
                >
                  <div
                    className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                      isSelected
                        ? 'border-[#718368] bg-[#718368] text-white'
                        : 'border-[#D9D0C3] bg-white'
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-[#403B34] truncate">
                        {sound.name}
                      </span>
                      <span className="text-[10px] text-[#968D81] font-mono shrink-0">
                        {sound.durationLabel}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#756E64] mt-0.5 line-clamp-1">
                      {sound.description}
                    </p>
                  </div>
                </button>

                {/* Preview Button */}
                {sound.id !== 'silent' ? (
                  <button
                    type="button"
                    onClick={() => handlePreviewSound(sound.id)}
                    className={`p-2 rounded-lg transition-all shrink-0 cursor-pointer ${
                      isPreviewing
                        ? 'bg-[#B95750] text-white'
                        : 'bg-white hover:bg-[#F0EBE2] text-[#718368] border border-[#E7E0D5]'
                    }`}
                    title={isPreviewing ? 'Stop audio preview' : `Preview ${sound.name}`}
                    aria-label={isPreviewing ? `Stop ${sound.name}` : `Preview ${sound.name}`}
                  >
                    {isPreviewing ? (
                      <Square className="w-3.5 h-3.5 fill-current" />
                    ) : (
                      <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                    )}
                  </button>
                ) : (
                  <span className="text-[10px] font-semibold text-[#968D81] uppercase tracking-wider px-2 py-1 bg-white rounded border border-[#E7E0D5]">
                    Mute
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Custom Audio Upload Section */}
      <div className="pt-4 border-t border-[#E7E0D5] space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-bold text-[#403B34] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#B88762]" />
              Custom Sound File
            </h4>
            <p className="text-xs text-[#756E64] mt-0.5">
              Upload an audio file from your device (MP3, WAV, or OGG up to 5 MB).
            </p>
          </div>
        </div>

        {/* Existing Custom Sound Card */}
        {notificationSettings.customSound && customSoundDataUrl ? (
          <div
            className={`p-4 rounded-xl border transition-all flex items-center justify-between gap-3 ${
              selectedSoundId === 'custom'
                ? 'bg-[#EAF0E5] border-[#718368]/50 shadow-xs'
                : 'bg-[#FBF9F5] border-[#E7E0D5]'
            }`}
          >
            <button
              type="button"
              onClick={() => handleSelectSound('custom')}
              className="flex items-start gap-3 flex-1 min-w-0 text-left cursor-pointer"
            >
              <div
                className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                  selectedSoundId === 'custom'
                    ? 'border-[#718368] bg-[#718368] text-white'
                    : 'border-[#D9D0C3] bg-white'
                }`}
              >
                {selectedSoundId === 'custom' && <Check className="w-3 h-3 stroke-[3]" />}
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <FileAudio className="w-3.5 h-3.5 text-[#718368]" />
                  <span className="text-xs font-bold text-[#403B34] truncate">
                    {notificationSettings.customSound.name}
                  </span>
                  <span className="text-[10px] text-[#968D81] font-mono">
                    ({(notificationSettings.customSound.size / 1024).toFixed(0)} KB)
                  </span>
                </div>
                <p className="text-[11px] text-[#756E64] mt-0.5">
                  Saved securely in your browser storage for this account.
                </p>
              </div>
            </button>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => handlePreviewSound('custom')}
                className={`p-2 rounded-lg transition-all cursor-pointer ${
                  playingPreviewId === 'custom'
                    ? 'bg-[#B95750] text-white'
                    : 'bg-white hover:bg-[#F0EBE2] text-[#718368] border border-[#E7E0D5]'
                }`}
                title="Preview custom sound"
                aria-label="Preview custom sound"
              >
                {playingPreviewId === 'custom' ? (
                  <Square className="w-3.5 h-3.5 fill-current" />
                ) : (
                  <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                )}
              </button>

              <button
                type="button"
                onClick={handleRemoveCustomSound}
                className="p-2 text-[#968D81] hover:text-[#B95750] rounded-lg hover:bg-[#F5E6E5] transition-colors cursor-pointer"
                title="Remove custom audio"
                aria-label="Remove custom audio"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ) : (
          /* Drag and Drop Upload Zone */
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragOver(true);
            }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={handleDrop}
            className={`p-6 rounded-xl border-2 border-dashed text-center transition-all cursor-pointer ${
              isDragOver
                ? 'border-[#718368] bg-[#EAF0E5]/50'
                : 'border-[#D9D0C3] hover:border-[#718368]/60 bg-[#FBF9F5]'
            }`}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="audio/mp3,audio/mpeg,audio/wav,audio/wave,audio/ogg,audio/vorbis,audio/m4a,audio/aac,.mp3,.wav,.ogg,.m4a"
              onChange={handleFileChange}
              className="hidden"
            />

            <Upload className="w-8 h-8 text-[#968D81] mx-auto mb-2" />
            <p className="text-xs font-semibold text-[#403B34]">
              {isUploading ? 'Validating and saving audio...' : 'Click to upload or drag & drop an audio file'}
            </p>
            <p className="text-[11px] text-[#756E64] mt-1">
              Supports MP3, WAV, or OGG up to 5 MB
            </p>
          </div>
        )}

        {/* Validation Error Banner */}
        {uploadError && (
          <div className="p-3 rounded-xl bg-[#F5E6E5] border border-[#B95750]/30 text-[#B95750] text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{uploadError}</span>
          </div>
        )}
      </div>
    </div>
  );
}
