'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { UploadCloud, ZoomIn, ZoomOut, RotateCw, AlertCircle, X, RefreshCw } from 'lucide-react';
import { AvatarStorageService } from '@/features/profile/avatar-storage-service';

export interface PhotoCropResult {
  blob: Blob;
  dataUrl: string;
}

interface PhotoUploaderProps {
  onCropComplete: (result: PhotoCropResult | null) => void;
  isProcessing?: boolean;
}

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];

export function PhotoUploader({ onCropComplete }: PhotoUploaderProps) {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Cropper transform state
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [rotation, setRotation] = useState(0); // 0, 90, 180, 270

  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageElementRef = useRef<HTMLImageElement | null>(null);
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef({ x: 0, y: 0 });

  // Handle incoming file selection
  const handleFile = useCallback((file: File) => {
    setErrorMsg(null);

    if (!ALLOWED_MIME_TYPES.includes(file.type.toLowerCase())) {
      setErrorMsg('Unsupported format. Please select a JPG, PNG, or WebP image.');
      return;
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      setErrorMsg('File exceeds 5 MB limit. Please select a smaller photo.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (result) {
        setImageSrc(result);
        setZoom(1);
        setPan({ x: 0, y: 0 });
        setRotation(0);
      }
    };
    reader.onerror = () => {
      setErrorMsg('Failed to read image file. Please try again.');
    };
    reader.readAsDataURL(file);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const clearSelection = () => {
    setImageSrc(null);
    setErrorMsg(null);
    onCropComplete(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Generate cropped blob whenever transform adjustments occur
  const generateCrop = useCallback(async () => {
    const img = imageElementRef.current;
    if (!img) return;

    try {
      const natWidth = img.naturalWidth || img.width;
      const natHeight = img.naturalHeight || img.height;
      if (!natWidth || !natHeight) return;

      // Base square size
      const minDimension = Math.min(natWidth, natHeight);
      const cropWidth = minDimension / zoom;
      const cropHeight = minDimension / zoom;

      // Center offset + pan
      const centerX = natWidth / 2 - (pan.x * (minDimension / 200));
      const centerY = natHeight / 2 - (pan.y * (minDimension / 200));

      const startX = Math.max(0, Math.min(natWidth - cropWidth, centerX - cropWidth / 2));
      const startY = Math.max(0, Math.min(natHeight - cropHeight, centerY - cropHeight / 2));

      const result = await AvatarStorageService.cropImageToBlob(
        img,
        {
          x: startX,
          y: startY,
          width: cropWidth,
          height: cropHeight,
        },
        320
      );

      onCropComplete(result);
    } catch (err) {
      console.warn('[PhotoUploader] Crop calculation warning:', err);
    }
  }, [zoom, pan, onCropComplete]);

  // Pre-load image element for canvas cropping
  useEffect(() => {
    if (!imageSrc) {
      imageElementRef.current = null;
      return;
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = imageSrc;
    img.onload = () => {
      imageElementRef.current = img;
      generateCrop();
    };
  }, [imageSrc, generateCrop]);

  // Sync crop when zoom or pan changes
  useEffect(() => {
    if (imageElementRef.current) {
      generateCrop();
    }
  }, [generateCrop]);

  // Mouse / Touch Pan drag handlers
  const handlePointerDown = (e: React.PointerEvent) => {
    isDraggingRef.current = true;
    dragStartRef.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;
    const newX = e.clientX - dragStartRef.current.x;
    const newY = e.clientY - dragStartRef.current.y;
    // Bound the pan smoothly
    const clampedX = Math.max(-120, Math.min(120, newX));
    const clampedY = Math.max(-120, Math.min(120, newY));
    setPan({ x: clampedX, y: clampedY });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    isDraggingRef.current = false;
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {}
    generateCrop();
  };

  // Zoom control
  const handleZoomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setZoom(parseFloat(e.target.value));
  };

  useEffect(() => {
    if (imageSrc) {
      generateCrop();
    }
  }, [zoom, pan, rotation, generateCrop, imageSrc]);

  return (
    <div className="space-y-4">
      {/* Hidden Native File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/jpg"
        onChange={handleInputChange}
        className="hidden"
        id="taskora-photo-upload-input"
      />

      {/* Error alert if validation fails */}
      {errorMsg && (
        <div className="p-3 rounded-xl bg-[#F5E6E5] border border-[#B95750]/30 text-xs text-[#B95750] flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
          <button
            type="button"
            onClick={() => setErrorMsg(null)}
            className="ml-auto text-[#B95750] hover:text-[#913b35] p-0.5"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {!imageSrc ? (
        /* Empty State: File Dropzone */
        <div
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-[#E7E0D5] hover:border-[#718368] rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all bg-[#FBF9F5] hover:bg-[#F0EBE2]/40 group"
        >
          <div className="w-14 h-14 rounded-2xl bg-[#EAF0E5] text-[#718368] flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-2xs">
            <UploadCloud className="w-7 h-7" />
          </div>
          <p className="text-sm font-bold text-[#403B34]">Select a photo from your device</p>
          <p className="text-xs text-[#756E64] mt-1">Supports JPG, PNG, or WebP up to 5 MB</p>

          <button
            type="button"
            className="mt-4 px-4 py-2 rounded-xl bg-white border border-[#D9D0C3] hover:border-[#718368] text-[#403B34] text-xs font-semibold shadow-2xs group-hover:bg-[#FBF9F5] transition-all"
          >
            Browse Photo Library
          </button>
        </div>
      ) : (
        /* Active State: Interactive Cropper with Circular Mask */
        <div className="space-y-4">
          <div className="relative w-full max-w-[320px] mx-auto aspect-square rounded-2xl overflow-hidden bg-[#2C2825] border border-[#E7E0D5] shadow-inner select-none touch-none">
            {/* The draggable/scalable image canvas */}
            <div
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
              className="absolute inset-0 flex items-center justify-center cursor-move"
            >
              <img
                src={imageSrc}
                alt="Upload preview"
                draggable={false}
                style={{
                  transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom}) rotate(${rotation}deg)`,
                  transformOrigin: 'center center',
                  maxWidth: '100%',
                  maxHeight: '100%',
                  objectFit: 'contain',
                }}
                className="pointer-events-none transition-transform duration-75"
              />
            </div>

            {/* Circular Vignette Overlay */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              {/* Outer darkened mask with circular cutout */}
              <div
                className="w-full h-full"
                style={{
                  background: 'radial-gradient(circle 125px at center, transparent 124px, rgba(44, 40, 37, 0.6) 125px)',
                }}
              />
              {/* Profile Outline Ring */}
              <div className="absolute w-[250px] h-[250px] rounded-full border-2 border-white/80 shadow-sm pointer-events-none" />
            </div>

            {/* Reposition Hint Pill */}
            <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 pointer-events-none px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-xs text-[10px] font-medium text-white/90">
              Drag to reposition • Scroll/slider to zoom
            </div>
          </div>

          {/* Zoom and Transform Controls */}
          <div className="max-w-[320px] mx-auto space-y-3 pt-1">
            <div className="flex items-center gap-3">
              <ZoomOut className="w-4 h-4 text-[#756E64] shrink-0" />
              <input
                type="range"
                min="1"
                max="3"
                step="0.05"
                value={zoom}
                onChange={handleZoomChange}
                className="flex-1 accent-[#718368] cursor-pointer"
                aria-label="Zoom photo"
              />
              <ZoomIn className="w-4 h-4 text-[#718368] shrink-0" />
            </div>

            <div className="flex items-center justify-between gap-2 pt-1">
              <button
                type="button"
                onClick={() => setRotation((prev) => (prev + 90) % 360)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#F0EBE2] hover:bg-[#E7E0D5] text-[#403B34] text-xs font-semibold transition-colors cursor-pointer"
              >
                <RotateCw className="w-3.5 h-3.5" />
                <span>Rotate</span>
              </button>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#F0EBE2] hover:bg-[#E7E0D5] text-[#403B34] text-xs font-semibold transition-colors cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Replace</span>
              </button>

              <button
                type="button"
                onClick={clearSelection}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-[#B95750] hover:bg-[#F5E6E5] text-xs font-semibold transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
                <span>Cancel</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
