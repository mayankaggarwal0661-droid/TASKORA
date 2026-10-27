// Web Audio API procedural sound engine - Zero external audio file dependencies
import { BuiltInSoundId } from '@/types/notification';

export interface SoundOption {
  id: BuiltInSoundId;
  name: string;
  description: string;
  durationLabel: string;
}

export const BUILT_IN_SOUNDS: SoundOption[] = [
  {
    id: 'soft-chime',
    name: 'Soft Chime',
    description: 'Warm harmonic acoustic chord with a gentle fade',
    durationLabel: '0.6s',
  },
  {
    id: 'gentle-bell',
    name: 'Gentle Bell',
    description: 'Resonant mindfulness bell with meditative 528 Hz overtone',
    durationLabel: '1.4s',
  },
  {
    id: 'digital-pop',
    name: 'Digital Pop',
    description: 'Brisk, upbeat bubble pop with clean acoustic curve',
    durationLabel: '0.1s',
  },
  {
    id: 'wooden-tap',
    name: 'Wooden Tap',
    description: 'Warm organic percussive strike with tactile presence',
    durationLabel: '0.1s',
  },
  {
    id: 'glass-sparkle',
    name: 'Glass Sparkle',
    description: 'Bright crystalline arpeggio that cuts through noise gently',
    durationLabel: '0.5s',
  },
  {
    id: 'calm-reminder',
    name: 'Calm Reminder',
    description: 'Ascending two-tone interval designed for serene focus',
    durationLabel: '0.4s',
  },
  {
    id: 'classic-alert',
    name: 'Classic Alert',
    description: 'Familiar dual-pulse chime with high clarity',
    durationLabel: '0.3s',
  },
  {
    id: 'silent',
    name: 'Silent (No Sound)',
    description: 'Visual alerts only — completely mutes audio playback',
    durationLabel: 'Muted',
  },
];

class SoundEngine {
  private ctx: AudioContext | null = null;
  private ambientSource: AudioNode | null = null;
  private ambientGain: GainNode | null = null;
  private ambientTimer: NodeJS.Timeout | null = null;
  private currentAmbientType: string = 'none';

  // Active preview sound tracking to guarantee no overlapping playback
  private activeOscillators: OscillatorNode[] = [];
  private activeAudioElement: HTMLAudioElement | null = null;

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  /**
   * Immediately stops any currently active notification or preview playback
   */
  public stopCurrentSound() {
    // 1. Stop web audio oscillators
    if (this.activeOscillators.length > 0) {
      this.activeOscillators.forEach((osc) => {
        try {
          osc.stop();
          osc.disconnect();
        } catch {}
      });
      this.activeOscillators = [];
    }

    // 2. Stop custom HTML audio element
    if (this.activeAudioElement) {
      try {
        this.activeAudioElement.pause();
        this.activeAudioElement.currentTime = 0;
        this.activeAudioElement.src = '';
      } catch {}
      this.activeAudioElement = null;
    }
  }

  /**
   * Tactile click sound for buttons and switches
   */
  public playClick(volume = 0.15) {
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(180, ctx.currentTime + 0.04);

      gain.gain.setValueAtTime(volume, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.04);
    } catch {}
  }

  /**
   * 1. Soft Chime: Warm, peaceful harmonic chord (F4, A4, C5, F5)
   */
  public playSoftChime(volume = 0.3) {
    const ctx = this.getContext();
    if (!ctx) return;
    this.stopCurrentSound();

    try {
      const freqs = [349.23, 440.0, 523.25, 698.46]; // F4, A4, C5, F5
      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        const start = ctx.currentTime + idx * 0.04;
        osc.frequency.setValueAtTime(freq, start);

        gain.gain.setValueAtTime(0.001, start);
        gain.gain.linearRampToValueAtTime(volume * 0.5, start + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.55);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(start);
        osc.stop(start + 0.6);
        this.activeOscillators.push(osc);
      });
    } catch {}
  }

  /**
   * 2. Gentle Bell: Tibetan 528 Hz Solfeggio resonance + warm harmonics
   */
  public playGentleBell(volume = 0.35) {
    const ctx = this.getContext();
    if (!ctx) return;
    this.stopCurrentSound();

    try {
      const harmonics = [528, 1056, 1584];
      harmonics.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime);

        const factor = 1 / (idx * 1.5 + 1);
        gain.gain.setValueAtTime(volume * factor * 0.7, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1.4);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start();
        osc.stop(ctx.currentTime + 1.45);
        this.activeOscillators.push(osc);
      });
    } catch {}
  }

  /**
   * 3. Digital Pop: Clean upbeat upward bubble pitch sweep
   */
  public playDigitalPop(volume = 0.3) {
    const ctx = this.getContext();
    if (!ctx) return;
    this.stopCurrentSound();

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(380, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1150, ctx.currentTime + 0.045);
      osc.frequency.exponentialRampToValueAtTime(700, ctx.currentTime + 0.09);

      gain.gain.setValueAtTime(0.001, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(volume * 0.8, ctx.currentTime + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.1);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.11);
      this.activeOscillators.push(osc);
    } catch {}
  }

  /**
   * 4. Wooden Tap: Organic percussive acoustic knock
   */
  public playWoodenTap(volume = 0.35) {
    const ctx = this.getContext();
    if (!ctx) return;
    this.stopCurrentSound();

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(320, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(140, ctx.currentTime + 0.05);

      gain.gain.setValueAtTime(volume * 0.85, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.07);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.08);
      this.activeOscillators.push(osc);
    } catch {}
  }

  /**
   * 5. Glass Sparkle: Crystalline shimmering arpeggio (C6, E6, G6, C7)
   */
  public playGlassSparkle(volume = 0.25) {
    const ctx = this.getContext();
    if (!ctx) return;
    this.stopCurrentSound();

    try {
      const notes = [1046.5, 1318.51, 1567.98, 2093.0];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        const start = ctx.currentTime + idx * 0.035;
        osc.frequency.setValueAtTime(freq, start);

        gain.gain.setValueAtTime(0.001, start);
        gain.gain.linearRampToValueAtTime(volume * 0.5, start + 0.015);
        gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.38);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(start);
        osc.stop(start + 0.4);
        this.activeOscillators.push(osc);
      });
    } catch {}
  }

  /**
   * 6. Calm Reminder: Gentle two-tone interval (A4 -> C#5)
   */
  public playCalmReminder(volume = 0.3) {
    const ctx = this.getContext();
    if (!ctx) return;
    this.stopCurrentSound();

    try {
      const tones = [
        { freq: 440.0, time: 0 },
        { freq: 554.37, time: 0.12 },
      ];

      tones.forEach(({ freq, time }) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'triangle';
        const start = ctx.currentTime + time;
        osc.frequency.setValueAtTime(freq, start);

        gain.gain.setValueAtTime(0.001, start);
        gain.gain.linearRampToValueAtTime(volume * 0.6, start + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.28);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(start);
        osc.stop(start + 0.32);
        this.activeOscillators.push(osc);
      });
    } catch {}
  }

  /**
   * 7. Classic Alert: Clean dual-pulse beep (880Hz)
   */
  public playClassicAlert(volume = 0.28) {
    const ctx = this.getContext();
    if (!ctx) return;
    this.stopCurrentSound();

    try {
      [0, 0.12].forEach((timeOffset) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        const start = ctx.currentTime + timeOffset;
        osc.frequency.setValueAtTime(880, start);

        gain.gain.setValueAtTime(0.001, start);
        gain.gain.linearRampToValueAtTime(volume * 0.7, start + 0.015);
        gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.09);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(start);
        osc.stop(start + 0.1);
        this.activeOscillators.push(osc);
      });
    } catch {}
  }

  /**
   * Play custom uploaded audio file (Data URL) safely
   */
  public playCustomAudio(dataUrl: string, volume = 0.7): Promise<void> {
    this.stopCurrentSound();
    if (!dataUrl || typeof window === 'undefined') return Promise.resolve();

    return new Promise((resolve) => {
      try {
        const audio = new Audio(dataUrl);
        audio.volume = Math.max(0, Math.min(1, volume));
        this.activeAudioElement = audio;

        audio.onended = () => {
          this.activeAudioElement = null;
          resolve();
        };
        audio.onerror = () => {
          this.activeAudioElement = null;
          resolve();
        };

        const playPromise = audio.play();
        if (playPromise !== undefined) {
          playPromise.catch(() => {
            this.activeAudioElement = null;
            resolve();
          });
        }
      } catch {
        resolve();
      }
    });
  }

  /**
   * Preview a sound by ID with volume and optional custom data URL
   */
  public async previewSound(
    soundId: BuiltInSoundId = 'soft-chime',
    volume = 0.7,
    customAudioDataUrl?: string | null
  ) {
    this.stopCurrentSound();
    if (soundId === 'silent') return;

    const normalizedVol = Math.max(0, Math.min(1, volume));

    if (soundId === 'custom' && customAudioDataUrl) {
      await this.playCustomAudio(customAudioDataUrl, normalizedVol);
      return;
    }

    switch (soundId) {
      case 'soft-chime':
        this.playSoftChime(normalizedVol);
        break;
      case 'gentle-bell':
        this.playGentleBell(normalizedVol);
        break;
      case 'digital-pop':
        this.playDigitalPop(normalizedVol);
        break;
      case 'wooden-tap':
        this.playWoodenTap(normalizedVol);
        break;
      case 'glass-sparkle':
        this.playGlassSparkle(normalizedVol);
        break;
      case 'calm-reminder':
        this.playCalmReminder(normalizedVol);
        break;
      case 'classic-alert':
        this.playClassicAlert(normalizedVol);
        break;
      default:
        this.playSoftChime(normalizedVol);
        break;
    }
  }

  /**
   * Main notification trigger entry point
   */
  public playNotificationSound(
    soundId: BuiltInSoundId = 'soft-chime',
    volume = 0.7,
    customAudioDataUrl?: string | null
  ) {
    if (soundId === 'silent') return;
    this.previewSound(soundId, volume, customAudioDataUrl).catch(() => {});
  }

  /**
   * Rich chord chime when a task is completed (C5 - G5 - C6)
   */
  public playTaskComplete(volume = 0.25) {
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.07);

        const startTime = ctx.currentTime + idx * 0.07;
        gain.gain.setValueAtTime(0.001, startTime);
        gain.gain.linearRampToValueAtTime(volume * 0.7, startTime + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.45);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + 0.5);
      });
    } catch {}
  }

  /**
   * Meditative bell chime when a focus session or break ends
   */
  public playSessionEnd(volume = 0.3) {
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const harmonics = [440, 880, 1320, 1760];
      harmonics.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime);

        const factor = 1 / (idx + 1);
        gain.gain.setValueAtTime(volume * factor, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1.8);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start();
        osc.stop(ctx.currentTime + 1.8);
      });
    } catch {}
  }

  /**
   * Ambient procedural noise engine for Focus Mode
   */
  public setAmbient(type: 'none' | 'rain' | 'binaural' | 'whitenoise' | 'forest', volume = 0.5) {
    this.stopAmbient();
    this.currentAmbientType = type;

    if (type === 'none') return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(Math.max(0.01, Math.min(1, volume)), ctx.currentTime);
      masterGain.connect(ctx.destination);
      this.ambientGain = masterGain;

      if (type === 'whitenoise') {
        const bufferSize = ctx.sampleRate * 2;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = (Math.random() * 2 - 1) * 0.2;
        }

        const noise = ctx.createBufferSource();
        noise.buffer = buffer;
        noise.loop = true;

        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(800, ctx.currentTime);

        noise.connect(filter);
        filter.connect(masterGain);
        noise.start();
        this.ambientSource = noise;
      } else if (type === 'rain') {
        const bufferSize = ctx.sampleRate * 2;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        let b0 = 0,
          b1 = 0,
          b2 = 0;
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          b0 = 0.99886 * b0 + white * 0.0555179;
          b1 = 0.99332 * b1 + white * 0.0750759;
          b2 = 0.969 * b2 + white * 0.153852;
          data[i] = (b0 + b1 + b2) * 0.12;
        }

        const rainSource = ctx.createBufferSource();
        rainSource.buffer = buffer;
        rainSource.loop = true;

        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(1200, ctx.currentTime);
        filter.Q.setValueAtTime(0.8, ctx.currentTime);

        rainSource.connect(filter);
        filter.connect(masterGain);
        rainSource.start();
        this.ambientSource = rainSource;
      } else if (type === 'binaural') {
        const merger = ctx.createChannelMerger(2);
        const oscL = ctx.createOscillator();
        const oscR = ctx.createOscillator();

        oscL.type = 'sine';
        oscL.frequency.setValueAtTime(216, ctx.currentTime);
        oscR.type = 'sine';
        oscR.frequency.setValueAtTime(224, ctx.currentTime);

        oscL.connect(merger, 0, 0);
        oscR.connect(merger, 0, 1);

        merger.connect(masterGain);
        oscL.start();
        oscR.start();

        this.ambientSource = {
          disconnect: () => {
            try {
              oscL.stop();
              oscR.stop();
              oscL.disconnect();
              oscR.disconnect();
              merger.disconnect();
            } catch {}
          },
        } as unknown as AudioNode;
      } else if (type === 'forest') {
        const bufferSize = ctx.sampleRate * 2;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = (Math.random() * 2 - 1) * 0.08;
        }

        const windSource = ctx.createBufferSource();
        windSource.buffer = buffer;
        windSource.loop = true;

        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(350, ctx.currentTime);

        windSource.connect(filter);
        filter.connect(masterGain);
        windSource.start();
        this.ambientSource = windSource;

        this.ambientTimer = setInterval(() => {
          if (this.currentAmbientType !== 'forest') return;
          try {
            const birdOsc = ctx.createOscillator();
            const birdGain = ctx.createGain();
            birdOsc.type = 'sine';
            const baseF = 2400 + Math.random() * 800;
            birdOsc.frequency.setValueAtTime(baseF, ctx.currentTime);
            birdOsc.frequency.exponentialRampToValueAtTime(baseF + 400, ctx.currentTime + 0.08);
            birdOsc.frequency.exponentialRampToValueAtTime(baseF, ctx.currentTime + 0.16);

            birdGain.gain.setValueAtTime(0.001, ctx.currentTime);
            birdGain.gain.linearRampToValueAtTime(volume * 0.15, ctx.currentTime + 0.04);
            birdGain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.2);

            birdOsc.connect(birdGain);
            birdGain.connect(masterGain);
            birdOsc.start();
            birdOsc.stop(ctx.currentTime + 0.22);
          } catch {}
        }, 3200);
      }
    } catch {}
  }

  public setAmbientVolume(volume: number) {
    if (this.ambientGain && this.ctx) {
      try {
        this.ambientGain.gain.setValueAtTime(
          Math.max(0, Math.min(1, volume)),
          this.ctx.currentTime
        );
      } catch {}
    }
  }

  public stopAmbient() {
    if (this.ambientTimer) {
      clearInterval(this.ambientTimer);
      this.ambientTimer = null;
    }
    if (this.ambientSource) {
      try {
        if (
          'stop' in this.ambientSource &&
          typeof (this.ambientSource as AudioBufferSourceNode).stop === 'function'
        ) {
          (this.ambientSource as AudioBufferSourceNode).stop();
        }
        this.ambientSource.disconnect();
      } catch {}
      this.ambientSource = null;
    }
    if (this.ambientGain) {
      try {
        this.ambientGain.disconnect();
      } catch {}
      this.ambientGain = null;
    }
    this.currentAmbientType = 'none';
  }
}

export const soundService = new SoundEngine();
