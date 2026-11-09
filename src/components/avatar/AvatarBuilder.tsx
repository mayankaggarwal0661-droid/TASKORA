'use client';

import React, { useState } from 'react';
import {
  AvatarBuilderConfig,
  AVATAR_PRESETS,
  getRandomAvatarConfig,
  DEFAULT_AVATAR_CONFIG,
  SKIN_TONES,
  HAIR_COLORS,
  CLOTHING_COLORS,
  BG_COLORS,
} from '@/features/avatar/avatar-generator';
import {
  Sparkles,
  Dices,
  RotateCcw,
  User,
  Scissors,
  Smile,
  Shirt,
  Glasses,
  Palette,
  Check,
} from 'lucide-react';

interface AvatarBuilderProps {
  config: AvatarBuilderConfig;
  onChange: (newConfig: AvatarBuilderConfig) => void;
}

type CategoryTab = 'base' | 'hair' | 'face' | 'clothes' | 'accessories' | 'backdrop';

export function AvatarBuilder({ config, onChange }: AvatarBuilderProps) {
  const [activeTab, setActiveTab] = useState<CategoryTab>('base');

  const update = <K extends keyof AvatarBuilderConfig>(key: K, value: AvatarBuilderConfig[K]) => {
    onChange({
      ...config,
      [key]: value,
    });
  };

  const handleRandomize = () => {
    onChange(getRandomAvatarConfig());
  };

  const handleReset = () => {
    onChange(DEFAULT_AVATAR_CONFIG);
  };

  const tabs: { id: CategoryTab; label: string; icon: React.ElementType }[] = [
    { id: 'base', label: 'Face & Skin', icon: User },
    { id: 'hair', label: 'Hair', icon: Scissors },
    { id: 'face', label: 'Expression', icon: Smile },
    { id: 'clothes', label: 'Clothing', icon: Shirt },
    { id: 'accessories', label: 'Accessories', icon: Glasses },
    { id: 'backdrop', label: 'Backdrop', icon: Palette },
  ];

  return (
    <div className="space-y-4">
      {/* Top Presets & Quick Actions Toolbar */}
      <div className="flex items-center justify-between gap-2 pb-2 border-b border-[#E7E0D5]">
        <div className="flex items-center gap-1.5 text-xs font-bold text-[#403B34]">
          <Sparkles className="w-3.5 h-3.5 text-[#718368]" />
          <span>Curated Presets</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleRandomize}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#EAF0E5] hover:bg-[#D9E8D3] text-[#557B5C] text-xs font-semibold transition-all cursor-pointer shadow-2xs"
            title="Randomize combination"
          >
            <Dices className="w-3.5 h-3.5" />
            <span>Randomize</span>
          </button>

          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#F0EBE2] hover:bg-[#E7E0D5] text-[#756E64] hover:text-[#403B34] text-xs font-semibold transition-all cursor-pointer"
            title="Reset to default"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Preset Pill Buttons */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {AVATAR_PRESETS.map((preset) => (
          <button
            key={preset.id}
            type="button"
            onClick={() => onChange(preset.config)}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap bg-white hover:bg-[#FBF9F5] border border-[#E7E0D5] hover:border-[#718368] text-[#403B34] transition-all cursor-pointer shadow-2xs shrink-0"
          >
            {preset.name}
          </button>
        ))}
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1 border-b border-[#E7E0D5]/80 scrollbar-none">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer shrink-0 ${
                isActive
                  ? 'bg-[#718368] text-white shadow-xs'
                  : 'text-[#756E64] hover:text-[#403B34] hover:bg-[#F0EBE2]'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Panels */}
      <div className="pt-2">
        {/* 1. Base & Skin */}
        {activeTab === 'base' && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#403B34] mb-2">Skin Tone</label>
              <div className="grid grid-cols-6 gap-2">
                {(Object.keys(SKIN_TONES) as AvatarBuilderConfig['skinTone'][]).map((tone) => (
                  <button
                    key={tone}
                    type="button"
                    onClick={() => update('skinTone', tone)}
                    style={{ backgroundColor: SKIN_TONES[tone].base }}
                    className={`h-10 rounded-xl border transition-all cursor-pointer flex items-center justify-center ${
                      config.skinTone === tone
                        ? 'ring-2 ring-[#718368] ring-offset-2 border-transparent scale-105'
                        : 'border-black/10 hover:scale-102'
                    }`}
                    title={tone}
                  >
                    {config.skinTone === tone && <Check className="w-4 h-4 text-[#403B34]" />}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#403B34] mb-2">Face Shape</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {(['oval', 'round', 'square', 'heart'] as AvatarBuilderConfig['faceShape'][]).map(
                  (shape) => (
                    <button
                      key={shape}
                      type="button"
                      onClick={() => update('faceShape', shape)}
                      className={`py-2 px-3 rounded-xl border text-xs font-semibold capitalize transition-all cursor-pointer ${
                        config.faceShape === shape
                          ? 'bg-[#EAF0E5] text-[#557B5C] border-[#718368]'
                          : 'bg-white hover:bg-[#FBF9F5] border-[#E7E0D5] text-[#403B34]'
                      }`}
                    >
                      {shape}
                    </button>
                  )
                )}
              </div>
            </div>
          </div>
        )}

        {/* 2. Hair */}
        {activeTab === 'hair' && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#403B34] mb-2">Hairstyle</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {(
                  [
                    'short',
                    'curly',
                    'fade',
                    'wavy',
                    'bob',
                    'bun',
                    'afro',
                    'bald',
                  ] as AvatarBuilderConfig['hairStyle'][]
                ).map((style) => (
                  <button
                    key={style}
                    type="button"
                    onClick={() => update('hairStyle', style)}
                    className={`py-2 px-3 rounded-xl border text-xs font-semibold capitalize transition-all cursor-pointer ${
                      config.hairStyle === style
                        ? 'bg-[#EAF0E5] text-[#557B5C] border-[#718368]'
                        : 'bg-white hover:bg-[#FBF9F5] border-[#E7E0D5] text-[#403B34]'
                    }`}
                  >
                    {style}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#403B34] mb-2">Hair Color</label>
              <div className="grid grid-cols-7 gap-2">
                {(Object.keys(HAIR_COLORS) as AvatarBuilderConfig['hairColor'][]).map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => update('hairColor', color)}
                    style={{ backgroundColor: HAIR_COLORS[color].main }}
                    className={`h-9 rounded-xl border transition-all cursor-pointer flex items-center justify-center ${
                      config.hairColor === color
                        ? 'ring-2 ring-[#718368] ring-offset-2 border-transparent scale-105'
                        : 'border-black/10 hover:scale-102'
                    }`}
                    title={color}
                  >
                    {config.hairColor === color && <Check className="w-4 h-4 text-white" />}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 3. Expression & Eyes */}
        {activeTab === 'face' && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#403B34] mb-2">Eye Style</label>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {(
                  ['friendly', 'almond', 'happy', 'focused', 'wink'] as AvatarBuilderConfig['eyeStyle'][]
                ).map((eye) => (
                  <button
                    key={eye}
                    type="button"
                    onClick={() => update('eyeStyle', eye)}
                    className={`py-2 px-2.5 rounded-xl border text-xs font-semibold capitalize transition-all cursor-pointer text-center ${
                      config.eyeStyle === eye
                        ? 'bg-[#EAF0E5] text-[#557B5C] border-[#718368]'
                        : 'bg-white hover:bg-[#FBF9F5] border-[#E7E0D5] text-[#403B34]'
                    }`}
                  >
                    {eye}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#403B34] mb-2">Eyebrows</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {(
                  ['natural', 'soft', 'expressive', 'bold'] as AvatarBuilderConfig['eyebrowStyle'][]
                ).map((brow) => (
                  <button
                    key={brow}
                    type="button"
                    onClick={() => update('eyebrowStyle', brow)}
                    className={`py-2 px-3 rounded-xl border text-xs font-semibold capitalize transition-all cursor-pointer ${
                      config.eyebrowStyle === brow
                        ? 'bg-[#EAF0E5] text-[#557B5C] border-[#718368]'
                        : 'bg-white hover:bg-[#FBF9F5] border-[#E7E0D5] text-[#403B34]'
                    }`}
                  >
                    {brow}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#403B34] mb-2">Mouth Expression</label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {(
                  ['smile', 'grin', 'calm', 'confident', 'openSmile'] as AvatarBuilderConfig['mouthStyle'][]
                ).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => update('mouthStyle', m)}
                    className={`py-2 px-2.5 rounded-xl border text-xs font-semibold capitalize transition-all cursor-pointer ${
                      config.mouthStyle === m
                        ? 'bg-[#EAF0E5] text-[#557B5C] border-[#718368]'
                        : 'bg-white hover:bg-[#FBF9F5] border-[#E7E0D5] text-[#403B34]'
                    }`}
                  >
                    {m === 'openSmile' ? 'Cheerful' : m}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 4. Clothing */}
        {activeTab === 'clothes' && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#403B34] mb-2">Clothing Style</label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {(
                  [
                    'crewneck',
                    'hoodie',
                    'collar',
                    'tshirt',
                    'turtleneck',
                  ] as AvatarBuilderConfig['clothingStyle'][]
                ).map((style) => (
                  <button
                    key={style}
                    type="button"
                    onClick={() => update('clothingStyle', style)}
                    className={`py-2 px-3 rounded-xl border text-xs font-semibold capitalize transition-all cursor-pointer ${
                      config.clothingStyle === style
                        ? 'bg-[#EAF0E5] text-[#557B5C] border-[#718368]'
                        : 'bg-white hover:bg-[#FBF9F5] border-[#E7E0D5] text-[#403B34]'
                    }`}
                  >
                    {style}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#403B34] mb-2">Clothing Color</label>
              <div className="grid grid-cols-7 gap-2">
                {(Object.keys(CLOTHING_COLORS) as AvatarBuilderConfig['clothingColor'][]).map(
                  (color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => update('clothingColor', color)}
                      style={{ backgroundColor: CLOTHING_COLORS[color].main }}
                      className={`h-9 rounded-xl border transition-all cursor-pointer flex items-center justify-center ${
                        config.clothingColor === color
                          ? 'ring-2 ring-[#718368] ring-offset-2 border-transparent scale-105'
                          : 'border-black/10 hover:scale-102'
                      }`}
                      title={color}
                    >
                      {config.clothingColor === color && <Check className="w-4 h-4 text-white" />}
                    </button>
                  )
                )}
              </div>
            </div>
          </div>
        )}

        {/* 5. Accessories */}
        {activeTab === 'accessories' && (
          <div className="space-y-4">
            <label className="block text-xs font-bold text-[#403B34] mb-2">Add-On Accessories</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {[
                { id: 'none', label: 'None' },
                { id: 'roundGlasses', label: 'Round Glasses' },
                { id: 'squareGlasses', label: 'Square Glasses' },
                { id: 'sunglasses', label: 'Dark Shades' },
                { id: 'beanie', label: 'Warm Beanie' },
                { id: 'headphones', label: 'Studio Headphones' },
              ].map((acc) => (
                <button
                  key={acc.id}
                  type="button"
                  onClick={() => update('accessory', acc.id as AvatarBuilderConfig['accessory'])}
                  className={`py-3 px-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                    config.accessory === acc.id
                      ? 'bg-[#EAF0E5] text-[#557B5C] border-[#718368]'
                      : 'bg-white hover:bg-[#FBF9F5] border-[#E7E0D5] text-[#403B34]'
                  }`}
                >
                  {acc.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 6. Backdrop */}
        {activeTab === 'backdrop' && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#403B34] mb-2">Backdrop Tone</label>
              <div className="grid grid-cols-6 gap-2">
                {(Object.keys(BG_COLORS) as AvatarBuilderConfig['bgColor'][]).map((bg) => (
                  <button
                    key={bg}
                    type="button"
                    onClick={() => update('bgColor', bg)}
                    style={{ backgroundColor: BG_COLORS[bg] }}
                    className={`h-10 rounded-xl border transition-all cursor-pointer flex items-center justify-center ${
                      config.bgColor === bg
                        ? 'ring-2 ring-[#718368] ring-offset-2 border-transparent scale-105'
                        : 'border-black/10 hover:scale-102'
                    }`}
                    title={bg}
                  >
                    {config.bgColor === bg && <Check className="w-4 h-4 text-[#403B34]" />}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#403B34] mb-2">Background Pattern</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {(['solid', 'radial', 'dots', 'rings'] as AvatarBuilderConfig['bgPattern'][]).map(
                  (pattern) => (
                    <button
                      key={pattern}
                      type="button"
                      onClick={() => update('bgPattern', pattern)}
                      className={`py-2 px-3 rounded-xl border text-xs font-semibold capitalize transition-all cursor-pointer ${
                        config.bgPattern === pattern
                          ? 'bg-[#EAF0E5] text-[#557B5C] border-[#718368]'
                          : 'bg-white hover:bg-[#FBF9F5] border-[#E7E0D5] text-[#403B34]'
                      }`}
                    >
                      {pattern}
                    </button>
                  )
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

