'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTaskora } from '@/context/TaskoraContext';
import { useAuth } from '@/context/AuthContext';
import {
  AvatarBuilderConfig,
  DEFAULT_AVATAR_CONFIG,
  AvatarSvg,
  avatarConfigToSvgDataUri,
} from '@/features/avatar/avatar-generator';
import { AvatarBuilder } from './AvatarBuilder';
import { PhotoUploader, PhotoCropResult } from './PhotoUploader';
import { AvatarStorageService } from '@/features/profile/avatar-storage-service';
import { Sparkles, UploadCloud, X, Trash2, CheckCircle2, User } from 'lucide-react';

export function AvatarCustomizerModal() {
  const { isAvatarModalOpen, closeAvatarModal, userProfile, updateProfile, addToast } = useTaskora();
  const { user, updateUserPhoto } = useAuth();

  const [activeMode, setActiveMode] = useState<'create' | 'upload'>('create');
  const [builderConfig, setBuilderConfig] = useState<AvatarBuilderConfig>(DEFAULT_AVATAR_CONFIG);
  const [croppedPhoto, setCroppedPhoto] = useState<PhotoCropResult | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Initialize builder configuration from saved profile if available
  useEffect(() => {
    if (isAvatarModalOpen) {
      if (userProfile.avatarConfig) {
        try {
          // eslint-disable-next-line react-hooks/set-state-in-effect
          setBuilderConfig({
            ...DEFAULT_AVATAR_CONFIG,
            ...(userProfile.avatarConfig as unknown as AvatarBuilderConfig),
          });
        } catch {}
      }
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCroppedPhoto(null);
    }
  }, [isAvatarModalOpen, userProfile]);

  if (!isAvatarModalOpen) return null;

  const currentUserId = user?.uid || 'guest';
  const hasCustomAvatar = Boolean(userProfile.avatarUrl);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      if (activeMode === 'create') {
        // Option A: Save Illustrated Vector Avatar
        const svgDataUri = avatarConfigToSvgDataUri(builderConfig);
        AvatarStorageService.saveLocalAvatar(currentUserId, svgDataUri);

        updateProfile({
          avatarUrl: svgDataUri,
          avatarType: 'custom',
          avatarConfig: builderConfig as unknown as Record<string, string>,
        });
        await updateUserPhoto(svgDataUri);

        addToast({
          title: 'Avatar Created! ✨',
          message: 'Your illustrated avatar is now live across your workspace.',
          type: 'success',
        });
      } else {
        // Option B: Save Uploaded Photo
        if (!croppedPhoto) {
          addToast({
            title: 'No Photo Selected',
            message: 'Please choose and crop a photo before saving.',
            type: 'warning',
          });
          setIsSaving(false);
          return;
        }

        const uploadResult = await AvatarStorageService.uploadAvatar(
          currentUserId,
          croppedPhoto.blob,
          croppedPhoto.dataUrl
        );

        const finalUrl = uploadResult.url || croppedPhoto.dataUrl;

        updateProfile({
          avatarUrl: finalUrl,
          avatarType: 'upload',
        });
        await updateUserPhoto(finalUrl);

        addToast({
          title: 'Photo Uploaded! 📷',
          message: uploadResult.isCloudStorage
            ? 'Profile picture saved and synced to your cloud account.'
            : 'Profile picture saved successfully to your workspace.',
          type: 'success',
        });
      }

      closeAvatarModal();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to save avatar';
      addToast({
        title: 'Save Failed',
        message: msg,
        type: 'error',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemoveAvatar = async () => {
    setIsSaving(true);
    try {
      await AvatarStorageService.removeAvatar(currentUserId, userProfile.avatarUrl);
      updateProfile({
        avatarUrl: '',
        avatarType: 'default',
        avatarConfig: undefined,
      });
      await updateUserPhoto(null);

      addToast({
        title: 'Custom Avatar Removed',
        message: 'Reverted to default profile initials.',
        type: 'info',
      });
      closeAvatarModal();
    } catch (err) {
      console.warn('Remove avatar notice:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closeAvatarModal}
          className="fixed inset-0 bg-[#403B34]/40 backdrop-blur-xs"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 10 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-2xl bg-white rounded-3xl border border-[#E7E0D5] shadow-2xl overflow-hidden my-auto z-10 flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="px-6 py-4.5 border-b border-[#E7E0D5] flex items-center justify-between bg-[#FBF9F5]/70 shrink-0">
            <div>
              <h2 className="text-lg font-bold text-[#403B34] tracking-tight">
                Change Profile Picture
              </h2>
              <p className="text-xs text-[#756E64] mt-0.5">
                Design an illustrated avatar or upload a personal photo.
              </p>
            </div>

            <button
              type="button"
              onClick={closeAvatarModal}
              className="p-1.5 text-[#968D81] hover:text-[#403B34] hover:bg-[#F0EBE2] rounded-xl transition-colors cursor-pointer"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="px-6 pt-4 shrink-0">
            <div className="flex rounded-2xl bg-[#F0EBE2] p-1 border border-[#E7E0D5] text-xs font-semibold">
              <button
                type="button"
                onClick={() => setActiveMode('create')}
                className={`flex-1 py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  activeMode === 'create'
                    ? 'bg-white text-[#403B34] shadow-xs'
                    : 'text-[#756E64] hover:text-[#403B34]'
                }`}
              >
                <Sparkles className="w-4 h-4 text-[#718368]" />
                <span>Create Your Avatar</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveMode('upload')}
                className={`flex-1 py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  activeMode === 'upload'
                    ? 'bg-white text-[#403B34] shadow-xs'
                    : 'text-[#756E64] hover:text-[#403B34]'
                }`}
              >
                <UploadCloud className="w-4 h-4 text-[#718368]" />
                <span>Upload Photo</span>
              </button>
            </div>
          </div>

          {/* Modal Body: Two-Column Composition on Desktop */}
          <div className="p-6 overflow-y-auto flex-1 space-y-6 sm:space-y-0 sm:grid sm:grid-cols-12 sm:gap-6">
            {/* Left Preview Column */}
            <div className="sm:col-span-5 flex flex-col items-center justify-start text-center border-b sm:border-b-0 sm:border-r border-[#E7E0D5] pb-6 sm:pb-0 sm:pr-6">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#968D81] mb-2.5">
                Live Profile Preview
              </span>

              {/* Large circular avatar preview */}
              <div className="relative w-36 h-36 rounded-full overflow-hidden ring-4 ring-[#E7E0D5] shadow-md bg-[#EAF0E5] flex items-center justify-center my-2">
                {activeMode === 'create' ? (
                  <AvatarSvg config={builderConfig} size={144} />
                ) : croppedPhoto ? (
                  <img
                    src={croppedPhoto.dataUrl}
                    alt="Cropped profile preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-[#968D81]">
                    <User className="w-12 h-12 text-[#718368]/60" />
                    <span className="text-[10px] mt-1 font-medium">Awaiting photo</span>
                  </div>
                )}
              </div>

              {/* Size context previews */}
              <div className="mt-3 flex items-center gap-3 justify-center">
                <div className="flex flex-col items-center gap-1">
                  <div className="w-8 h-8 rounded-full ring-2 ring-[#E7E0D5] overflow-hidden bg-[#EAF0E5] flex items-center justify-center shadow-2xs">
                    {activeMode === 'create' ? (
                      <AvatarSvg config={builderConfig} size={32} />
                    ) : croppedPhoto ? (
                      <img src={croppedPhoto.dataUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-xs font-bold text-[#718368]">T</span>
                    )}
                  </div>
                  <span className="text-[9px] text-[#968D81]">Navbar</span>
                </div>

                <div className="flex flex-col items-center gap-1">
                  <div className="w-10 h-10 rounded-full ring-2 ring-[#E7E0D5] overflow-hidden bg-[#EAF0E5] flex items-center justify-center shadow-2xs">
                    {activeMode === 'create' ? (
                      <AvatarSvg config={builderConfig} size={40} />
                    ) : croppedPhoto ? (
                      <img src={croppedPhoto.dataUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-sm font-bold text-[#718368]">T</span>
                    )}
                  </div>
                  <span className="text-[9px] text-[#968D81]">Dropdown</span>
                </div>
              </div>

              <div className="mt-4 px-3 py-1.5 rounded-full bg-[#EAF0E5] text-[#557B5C] text-[10px] font-semibold flex items-center gap-1.5">
                <CheckCircle2 className="w-3 h-3 text-[#718368]" />
                <span>
                  {activeMode === 'create' ? 'Illustrated Vector' : 'Device Photo'}
                </span>
              </div>
            </div>

            {/* Right Options Column */}
            <div className="sm:col-span-7">
              {activeMode === 'create' ? (
                <AvatarBuilder config={builderConfig} onChange={setBuilderConfig} />
              ) : (
                <PhotoUploader onCropComplete={setCroppedPhoto} isProcessing={isSaving} />
              )}
            </div>
          </div>

          {/* Footer Controls */}
          <div className="px-6 py-4 border-t border-[#E7E0D5] bg-[#FBF9F5]/70 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3 shrink-0">
            <div>
              {hasCustomAvatar && (
                <button
                  type="button"
                  onClick={handleRemoveAvatar}
                  disabled={isSaving}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#B95750] hover:text-[#913b35] py-2 px-3 rounded-xl hover:bg-[#F5E6E5] transition-colors cursor-pointer disabled:opacity-50"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Restore Default Avatar</span>
                </button>
              )}
            </div>

            <div className="flex items-center gap-2.5 justify-end">
              <button
                type="button"
                onClick={closeAvatarModal}
                disabled={isSaving}
                className="py-2.5 px-4 rounded-xl border border-[#D9D0C3] hover:border-[#718368] text-xs font-semibold text-[#403B34] bg-white hover:bg-[#FBF9F5] transition-all cursor-pointer shadow-2xs"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleSave}
                disabled={isSaving || (activeMode === 'upload' && !croppedPhoto)}
                className="py-2.5 px-5 rounded-xl bg-[#718368] hover:bg-[#5F7157] text-white text-xs font-bold transition-all cursor-pointer shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isSaving ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Saving Changes...</span>
                  </>
                ) : (
                  <span>Save Changes</span>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
