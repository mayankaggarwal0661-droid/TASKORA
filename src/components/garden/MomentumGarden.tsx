'use client';

import React, { useState, useMemo, useReducer } from 'react';
import { useTaskora } from '@/context/TaskoraContext';
import { GardenService, GardenPlant, GardenState } from '@/features/garden/garden-service';
import { soundService } from '@/features/audio/sound-service';
import { Leaf, Zap, Flame, ChevronDown, ChevronUp, Sparkles, Eye, EyeOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface MomentumGardenProps {
  compact?: boolean;
}

// SVG plant illustrations using CSS & SVG, fully Warm Neutral palette
function PlantIllustration({ plant, animationsEnabled }: { plant: GardenPlant; animationsEnabled: boolean }) {
  const pct = plant.growthProgressPercent;
  const sage = '#718368';
  const clay = '#B88762';
  const cream = '#F7F4EE';
  const taupe = '#D9D0C3';

  const stemHeight = Math.max(20, Math.round((pct / 100) * 60));
  const leafCount = pct >= 20 ? (pct >= 50 ? (pct >= 85 ? 4 : 3) : 2) : (pct >= 5 ? 1 : 0);
  // At 0%, always show a tiny sprout nub
  const showSproutNub = pct < 5;

  return (
    <svg
      viewBox="0 0 80 100"
      className="w-full h-full"
      aria-hidden="true"
      role="img"
    >
      {/* Pot */}
      <path d="M22 85 L24 95 L56 95 L58 85 Z" fill="#C49a6c" />
      <rect x="20" y="78" width="40" height="8" rx="3" fill="#A97535" />
      <rect x="22" y="80" width="36" height="4" rx="2" fill="#B88762" />

      {/* Soil */}
      <ellipse cx="40" cy="78" rx="18" ry="4" fill="#8B6914" />
      <ellipse cx="40" cy="77" rx="16" ry="3" fill="#A97535" opacity="0.6" />

      {/* Main stem */}
      <rect
        x="38.5"
        y={86 - stemHeight}
        width="3"
        height={stemHeight}
        rx="1.5"
        fill={sage}
        opacity="0.9"
      />

      {/* Sprout nub for brand new plants */}
      {showSproutNub && (
        <>
          <ellipse cx="40" cy={86 - stemHeight + 2} rx="5" ry="4" fill={sage} opacity="0.5" />
          <path d="M37 82 Q40 72 43 82" fill={sage} opacity="0.4" />
        </>
      )}

      {/* Leaves - staggered */}
      {Array.from({ length: leafCount }).map((_, i) => {
        const yPos = 86 - stemHeight + (stemHeight / leafCount) * i + 4;
        const side = i % 2 === 0 ? 1 : -1;
        const xStart = 40;
        const xEnd = xStart + side * 14;
        const leafColor = i === leafCount - 1 ? '#557B5C' : sage;
        return (
          <motion.path
            key={i}
            d={`M${xStart} ${yPos} Q${xStart + side * 8} ${yPos - 6} ${xEnd} ${yPos - 2} Q${xStart + side * 6} ${yPos + 3} ${xStart} ${yPos}`}
            fill={leafColor}
            opacity="0.85"
            initial={animationsEnabled ? { scale: 0, originX: xStart, originY: yPos } : false}
            animate={animationsEnabled ? { scale: 1 } : false}
            transition={{ delay: i * 0.12, duration: 0.4 }}
          />
        );
      })}

      {/* Flower/blossom for blooming/mature stages */}
      {plant.stage === 'blooming' && (
        <>
          <circle cx="40" cy={86 - stemHeight} r="5" fill="#F4EBD9" />
          <circle cx="40" cy={86 - stemHeight} r="3" fill={clay} />
        </>
      )}
      {plant.stage === 'mature' && (
        <>
          {[-8, -5, 0, 5, 8].map((ox, i) => (
            <ellipse
              key={i}
              cx={40 + ox}
              cy={86 - stemHeight - (i === 2 ? 8 : 5)}
              rx="3.5"
              ry="5"
              fill={i === 2 ? '#C49a6c' : clay}
              opacity="0.85"
              transform={`rotate(${i * 18 - 36} ${40 + ox} ${86 - stemHeight - 5})`}
            />
          ))}
          <circle cx="40" cy={86 - stemHeight - 4} r="3.5" fill="#A97535" />
        </>
      )}
    </svg>
  );
}

// Dewdrop ambient SVG element
function DewDrop({ x, y, delay }: { x: number; y: number; delay: number }) {
  return (
    <motion.ellipse
      cx={x} cy={y} rx="2" ry="3"
      fill="#718368" opacity="0.15"
      animate={{ y: [0, 4, 0], opacity: [0.15, 0.3, 0.15] }}
      transition={{ duration: 3, repeat: Infinity, delay, ease: 'easeInOut' }}
    />
  );
}

// Stage label
const stageMeta: Record<GardenPlant['stage'], { label: string; color: string }> = {
  sprout: { label: 'Sprouting', color: 'text-[#968D81]' },
  growing: { label: 'Growing', color: 'text-[#718368]' },
  blooming: { label: 'Blooming', color: 'text-[#A97535]' },
  mature: { label: 'Mature', color: 'text-[#557B5C]' },
};

export function MomentumGarden({ compact = false }: MomentumGardenProps) {
  const { tasks, focusSessions, routines } = useTaskora();
  const [animationsEnabled, setAnimationsEnabled] = useState(true);
  const [expanded, setExpanded] = useState(true); // always expanded by default

  const garden: GardenState = useMemo(
    () => GardenService.calculateGarden(tasks, focusSessions, routines),
    [tasks, focusSessions, routines]
  );

  return (
    <div className="rounded-2xl bg-white border border-[#E7E0D5] shadow-xs overflow-hidden">
      {/* Garden Header */}
      <div className="p-5 border-b border-[#E7E0D5] flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-[#EAF0E5] flex items-center justify-center shrink-0">
            <Leaf className="w-5 h-5 text-[#718368]" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-[#403B34] tracking-tight">Momentum Garden</h3>
              <span className="text-[10px] font-bold bg-[#EAF0E5] text-[#557B5C] border border-[#718368]/30 px-2 py-0.5 rounded-full uppercase tracking-wider">
                Lv {garden.level}
              </span>
            </div>
            <p className="text-xs text-[#756E64] truncate">{garden.levelTitle}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Reduce-motion toggle */}
          <button
            type="button"
            onClick={() => {
              soundService.playClick();
              setAnimationsEnabled(prev => !prev);
            }}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#F0EBE2] border border-[#E7E0D5] text-[11px] font-semibold text-[#756E64] hover:text-[#403B34] transition-colors cursor-pointer"
            title={animationsEnabled ? 'Disable garden animations (reduced motion)' : 'Enable garden animations'}
            aria-label={animationsEnabled ? 'Disable animations' : 'Enable animations'}
          >
            {animationsEnabled ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{animationsEnabled ? 'Animations On' : 'Static Mode'}</span>
          </button>

          {/* Expand/Collapse */}
          <button
            type="button"
            onClick={() => {
              soundService.playClick();
              setExpanded(prev => !prev);
            }}
            className="p-1.5 rounded-lg text-[#968D81] hover:text-[#403B34] hover:bg-[#F0EBE2] transition-colors cursor-pointer"
            aria-label={expanded ? 'Collapse garden' : 'Expand garden'}
          >
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            key="garden-expanded"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            {/* Growth message */}
            <div className="px-5 pt-4 pb-2 text-xs text-[#756E64] italic border-b border-[#E7E0D5]/70">
              <Sparkles className="w-3 h-3 text-[#718368] inline mr-1.5 mb-0.5" />
              {garden.ambientState.growthMessage}
            </div>

            {/* 3 Plants Row */}
            <div className="grid grid-cols-3 gap-4 p-5">
              {garden.plants.map(plant => {
                const stage = stageMeta[plant.stage];
                return (
                  <div key={plant.id} className="flex flex-col items-center gap-3">
                    {/* Plant Illustration */}
                    <div
                      className="relative w-full aspect-square max-w-[100px] mx-auto"
                      aria-label={`${plant.name}: ${plant.stage} stage, ${plant.growthProgressPercent}% grown`}
                    >
                      {/* Ambient dewdrops */}
                      {animationsEnabled && garden.ambientState.dewDropsCount > 0 && (
                        <svg
                          viewBox="0 0 80 100"
                          className="absolute inset-0 w-full h-full pointer-events-none"
                        >
                          {Array.from({ length: Math.min(3, garden.ambientState.dewDropsCount) }).map((_, i) => (
                            <DewDrop
                              key={i}
                              x={20 + i * 20}
                              y={60 + i * 8}
                              delay={i * 0.8}
                            />
                          ))}
                        </svg>
                      )}
                      <PlantIllustration plant={plant} animationsEnabled={animationsEnabled} />
                    </div>

                    {/* Plant Info */}
                    <div className="text-center space-y-1 w-full">
                      <p className="text-xs font-bold text-[#403B34] leading-tight line-clamp-1">{plant.name}</p>
                      <p className="text-[10px] text-[#968D81] italic">{plant.species}</p>

                      {/* Progress bar */}
                      <div className="w-full bg-[#F0EBE2] h-1.5 rounded-full overflow-hidden border border-[#E7E0D5]">
                        <motion.div
                          initial={animationsEnabled ? { width: 0 } : false}
                          animate={{ width: `${plant.growthProgressPercent}%` }}
                          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                          className="h-full rounded-full bg-[#718368]"
                        />
                      </div>

                      <div className="flex items-center justify-between text-[10px]">
                        <span className={`font-semibold ${stage.color}`}>{stage.label}</span>
                        <span className="text-[#968D81] font-mono">{plant.growthProgressPercent}%</span>
                      </div>

                      <p className="text-[10px] text-[#756E64] pt-0.5">{plant.metricValue}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Growth Stats Footer */}
            <div className="px-5 pb-5 grid grid-cols-3 gap-3 border-t border-[#E7E0D5] pt-4">
              <div className="text-center">
                <div className="text-base font-bold text-[#403B34]">{garden.completedTasksCount}</div>
                <div className="text-[10px] text-[#756E64] flex items-center justify-center gap-0.5">
                  <Sparkles className="w-2.5 h-2.5 text-[#718368]" />
                  Tasks Done
                </div>
              </div>
              <div className="text-center">
                <div className="text-base font-bold text-[#403B34]">{garden.focusMinutesTotal}m</div>
                <div className="text-[10px] text-[#756E64] flex items-center justify-center gap-0.5">
                  <Zap className="w-2.5 h-2.5 text-[#718368]" />
                  Focus Logged
                </div>
              </div>
              <div className="text-center">
                <div className="text-base font-bold text-[#403B34]">{garden.activeStreaksTotal}</div>
                <div className="text-[10px] text-[#756E64] flex items-center justify-center gap-0.5">
                  <Flame className="w-2.5 h-2.5 text-[#A97535]" />
                  Streak Days
                </div>
              </div>
            </div>

            {/* Growth not awarded for unrecorded events note */}
            <div className="px-5 pb-4">
              <p className="text-[10px] text-[#968D81] text-center italic">
                Garden growth is calculated only from actual recorded completions, focus sessions, and routine check-ins. No fabricated counters.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
