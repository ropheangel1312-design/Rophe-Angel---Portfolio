/**
 * Web Audio API audio engine for Domain Expansion and Racing-Inspired Transition.
 * - Dialogue text blips for chibi character (Undertale-style retro blips).
 * - Cinematic build-up and Domain Expansion title impacts (strike + sub-bass).
 * - Rising synthetic engine-rev sweep (harmonic multi-oscillator motorsport sound).
 * - High-speed Doppler racing acceleration whoosh during transition.
 * - Clean resolution tone as the portfolio appears.
 * - Muted by default, safe against autoplay blocking, graceful cleanup.
 */

export const BGM_AUDIO_URL = 'https://www.image2url.com/r2/default/audio/1792573550904-dc5c4c13-e25b-4f85-b17f-f48569ce3e26.mp3';
export const RADIO_CHECK_AUDIO_URL = 'https://www.image2url.com/r2/default/audio/1792573478807-3a0c394a-1cb4-49f6-9bab-cbe17f779a60.m4a';
export const BOOSTED_RADIO_AUDIO_URL = '/audio/radio-check-boosted.m4a';

class DomainAudioEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false; // Default unmuted on fresh visit
  private lastBlipTime: number = 0;
  private activeNodes: (AudioNode | OscillatorNode | AudioBufferSourceNode)[] = [];
  private waterWaveNodes: (AudioNode | OscillatorNode | AudioBufferSourceNode)[] = [];
  private waterWaveGain: GainNode | null = null;

  // Background Music (BGM) Persistent Audio Instance
  private bgmAudio: HTMLAudioElement | null = null;
  private bgmBaseVolume: number = 0.30; // Configurable base volume ~30%
  private bgmContactVolume: number = 0.03; // ~10% of base volume (3%)
  private bgmFadeAnimId: number | null = null;
  private hasStartedBGM: boolean = false;
  private isInContactSection: boolean = false;

  // Pit Wall Radio Check Persistent Audio Instance
  private radioAudio: HTMLAudioElement | null = null;
  private isRadioPlaying: boolean = false;
  private radioSessionId: number = 0; // Incremented on cancel/restart to ignore stale events
  private gestureListenerAttached: boolean = false;

  constructor() {
    this.isMuted = false;
  }

  private initContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public setMuted(muted: boolean): void {
    this.isMuted = muted;
    if (!muted) {
      this.initContext();
      // Unmuting: update BGM & Radio mute properties
      if (this.bgmAudio) {
        this.bgmAudio.muted = false;
        // Resume playing BGM only if it was previously started
        if (this.hasStartedBGM) {
          this.bgmAudio.play().catch(() => {});
        }
      }
      if (this.radioAudio) {
        this.radioAudio.muted = false;
      }
    } else {
      this.stopAll();
      // Muting: immediately silence BGM and any active radio check
      if (this.bgmAudio) {
        this.bgmAudio.muted = true;
      }
      if (this.radioAudio) {
        this.radioAudio.muted = true;
        if (this.isRadioPlaying) {
          this.stopRadioCheck(true);
        }
      }
    }
  }

  public toggleMute(): boolean {
    this.setMuted(!this.isMuted);
    return this.isMuted;
  }

  /**
   * Initialize or retrieve the persistent BGM audio element.
   */
  private getBGMAudio(): HTMLAudioElement | null {
    if (typeof window === 'undefined') return null;
    if (!this.bgmAudio) {
      try {
        const audio = new Audio(BGM_AUDIO_URL);
        audio.loop = true;
        audio.preload = 'auto';
        audio.volume = this.isInContactSection ? this.bgmContactVolume : this.bgmBaseVolume;
        audio.muted = this.isMuted;
        audio.addEventListener('error', (e) => {
          console.warn('[PitWallAudio] Background music load warning:', e);
        });
        this.bgmAudio = audio;
      } catch (err) {
        console.warn('[PitWallAudio] Failed to instantiate BGM audio:', err);
      }
    }
    return this.bgmAudio;
  }

  /**
   * Start BGM following a user gesture or when audio is unmuted.
   */
  public startBGM(userInitiated: boolean = false): void {
    if (typeof window === 'undefined') return;
    const audio = this.getBGMAudio();
    if (!audio) return;

    // If music is already playing, do not restart it or duplicate
    if (!audio.paused && !audio.ended && audio.currentTime > 0) {
      return;
    }

    this.hasStartedBGM = true;
    audio.muted = this.isMuted;
    audio.volume = this.isInContactSection ? this.bgmContactVolume : this.bgmBaseVolume;

    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise.catch((err) => {
        // If autoplay blocked, attach one-time user gesture listener
        if (!this.gestureListenerAttached && !this.isMuted) {
          this.gestureListenerAttached = true;
          const unlock = () => {
            this.gestureListenerAttached = false;
            window.removeEventListener('pointerdown', unlock);
            window.removeEventListener('keydown', unlock);
            if (!this.isMuted && this.bgmAudio) {
              this.bgmAudio.play().catch(() => {});
            }
          };
          window.addEventListener('pointerdown', unlock, { once: true, passive: true });
          window.addEventListener('keydown', unlock, { once: true, passive: true });
        }
      });
    }
  }

  /**
   * Pause BGM and optionally reset time to start (used on intro replay)
   */
  public pauseBGM(resetTime: boolean = false): void {
    if (this.bgmAudio) {
      try {
        this.bgmAudio.pause();
        if (resetTime) {
          this.bgmAudio.currentTime = 0;
          this.hasStartedBGM = false;
        }
      } catch {
        // ignore
      }
    }
  }

  /**
   * Smoothly fade BGM volume to target over specified duration (default 800ms).
   * Cancels any in-flight fade so rapid transitions never conflict or leak.
   */
  public fadeBGMTo(targetVolume: number, durationMs: number = 800): void {
    if (typeof window === 'undefined') return;
    if (this.bgmFadeAnimId !== null) {
      cancelAnimationFrame(this.bgmFadeAnimId);
      this.bgmFadeAnimId = null;
    }

    const audio = this.getBGMAudio();
    if (!audio) return;

    if (this.isMuted) {
      audio.volume = Math.max(0, Math.min(1, targetVolume));
      return;
    }

    const startVolume = audio.volume;
    const startTime = performance.now();

    const step = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / durationMs);
      // Smooth cubic volume interpolation
      const currentVol = startVolume + (targetVolume - startVolume) * progress;
      audio.volume = Math.max(0, Math.min(1, currentVol));

      if (progress < 1) {
        this.bgmFadeAnimId = requestAnimationFrame(step);
      } else {
        this.bgmFadeAnimId = null;
        audio.volume = Math.max(0, Math.min(1, targetVolume));
      }
    };

    this.bgmFadeAnimId = requestAnimationFrame(step);
  }

  /**
   * Contact-section volume control:
   * Smoothly lowers BGM to 10% of base volume (0.03) when entering contact over 800ms.
   * Smoothly restores BGM to base volume (0.30) when leaving contact over 800ms.
   */
  public setContactSectionActive(isActive: boolean): void {
    if (this.isInContactSection === isActive) return;
    this.isInContactSection = isActive;

    const targetVolume = isActive ? this.bgmContactVolume : this.bgmBaseVolume;
    this.fadeBGMTo(targetVolume, 800);

    // If visitor leaves Contact while radio check is playing, immediately stop it
    if (!isActive && this.isRadioPlaying) {
      this.stopRadioCheck(true);
    }
  }

  /**
   * Initialize or retrieve the persistent Radio Check audio element.
   * Uses processed normalized/companded copy with fallback to original URL.
   */
  private getRadioAudio(): HTMLAudioElement | null {
    if (typeof window === 'undefined') return null;
    if (!this.radioAudio) {
      try {
        const audio = new Audio(BOOSTED_RADIO_AUDIO_URL);
        audio.preload = 'auto';
        audio.volume = 1.0;
        audio.muted = this.isMuted;
        audio.addEventListener('error', () => {
          console.warn('[PitWallAudio] Local boosted audio load warning, falling back to remote URL');
          audio.src = RADIO_CHECK_AUDIO_URL;
          audio.load();
        });
        this.radioAudio = audio;
      } catch (err) {
        console.warn('[PitWallAudio] Failed to instantiate Radio audio:', err);
      }
    }
    return this.radioAudio;
  }

  /**
   * Play the combined radio-check recording once.
   * Synchronizes interface strictly with native audio events ('playing', 'timeupdate', 'ended', 'error').
   */
  public playRadioCheck(callbacks?: {
    onStart?: () => void;
    onPlaying?: () => void;
    onTimeUpdate?: (currentTime: number, duration: number) => void;
    onEnded?: () => void;
    onError?: (err: string) => void;
    onCancel?: () => void;
  }): void {
    if (typeof window === 'undefined') return;

    if (this.isMuted) {
      callbacks?.onError?.('muted');
      return;
    }

    if (this.isRadioPlaying) {
      return; // Prevent overlapping transmissions
    }

    // Ensure BGM is ducked during transmission
    this.fadeBGMTo(this.bgmContactVolume, 400);

    const sessionId = ++this.radioSessionId;
    this.isRadioPlaying = true;
    callbacks?.onStart?.();

    const radio = this.getRadioAudio();
    if (!radio) {
      this.isRadioPlaying = false;
      callbacks?.onError?.('Radio audio unavailable');
      return;
    }

    radio.currentTime = 0;
    radio.muted = this.isMuted;
    radio.volume = 1.0;

    const cleanup = () => {
      radio.removeEventListener('playing', handlePlaying);
      radio.removeEventListener('timeupdate', handleTimeUpdate);
      radio.removeEventListener('ended', handleEnded);
      radio.removeEventListener('error', handleError);
    };

    const handlePlaying = () => {
      if (this.radioSessionId !== sessionId) {
        cleanup();
        return;
      }
      callbacks?.onPlaying?.();
    };

    const handleTimeUpdate = () => {
      if (this.radioSessionId !== sessionId) return;
      callbacks?.onTimeUpdate?.(radio.currentTime, radio.duration || 3.55);
    };

    const handleEnded = () => {
      cleanup();
      if (this.radioSessionId !== sessionId) return;
      this.isRadioPlaying = false;
      callbacks?.onEnded?.();
    };

    const handleError = (e: Event) => {
      cleanup();
      if (this.radioSessionId !== sessionId) return;
      this.isRadioPlaying = false;
      console.warn('[PitWallAudio] Radio check playback error:', e);
      callbacks?.onError?.('Transmission failed');
    };

    radio.addEventListener('playing', handlePlaying, { once: true });
    radio.addEventListener('timeupdate', handleTimeUpdate);
    radio.addEventListener('ended', handleEnded, { once: true });
    radio.addEventListener('error', handleError, { once: true });

    const playPromise = radio.play();
    if (playPromise !== undefined) {
      playPromise.catch((err) => {
        cleanup();
        if (this.radioSessionId !== sessionId) return;
        this.isRadioPlaying = false;
        console.warn('[PitWallAudio] Radio check play rejected:', err);
        callbacks?.onError?.(err?.message || 'Transmission blocked');
      });
    }
  }

  /**
   * Stop active radio check transmission and invalidate pending callbacks.
   */
  public stopRadioCheck(wasCancelled: boolean = true): void {
    this.radioSessionId++;
    this.isRadioPlaying = false;
    if (this.radioAudio) {
      try {
        this.radioAudio.pause();
        this.radioAudio.currentTime = 0;
      } catch {
        // ignore
      }
    }
    // Restore BGM smoothly back if not in contact, or keep ducked if still in contact
    const targetVolume = this.isInContactSection ? this.bgmContactVolume : this.bgmBaseVolume;
    this.fadeBGMTo(targetVolume, 600);
  }

  public getIsRadioPlaying(): boolean {
    return this.isRadioPlaying;
  }

  public stopAll(): void {
    this.stopWaterWave();
    if (!this.ctx) return;
    this.activeNodes.forEach(node => {
      try {
        if ('stop' in node && typeof (node as OscillatorNode).stop === 'function') {
          (node as OscillatorNode).stop();
        }
        node.disconnect();
      } catch {
        // ignore
      }
    });
    this.activeNodes = [];
  }

  /**
   * Dialogue typing blip for chibi character
   */
  public playTextBlip(): void {
    if (this.isMuted) return;
    const ctx = this.initContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    if (now - this.lastBlipTime < 0.034) return;
    this.lastBlipTime = now;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      osc.type = 'triangle';
      const baseFreq = 124 + (Math.random() * 6 - 3);
      osc.frequency.setValueAtTime(baseFreq, now);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1100, now);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.045, now + 0.002);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.024);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.026);
    } catch {
      // Graceful fallback
    }
  }

  /**
   * Subtle ambient cinematic drone behind chibi dialogue
   */
  public playSubtleIntroDrone(): void {
    if (this.isMuted) return;
    const ctx = this.initContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(55, now); // Low A1

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(180, now);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.025, now + 0.4);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      this.activeNodes.push(osc);
    } catch {
      // ignore
    }
  }

  /**
   * Title Stage 1: "DOMAIN EXPANSION" sharp resonant strike
   */
  public playDomainTitleImpact(): void {
    if (this.isMuted) return;
    const ctx = this.initContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(170, now);
      osc.frequency.exponentialRampToValueAtTime(50, now + 0.42);

      gain.gain.setValueAtTime(0.24, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.55);
      this.activeNodes.push(osc);
    } catch {
      // ignore
    }
  }

  /**
   * Title Stage 2: "ETERNAL BUFFERING" deep sub-bass cinematic slam
   */
  public playBufferingTitleImpact(): void {
    if (this.isMuted) return;
    const ctx = this.initContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;

      // Low frequency sub-bass swell
      const subOsc = ctx.createOscillator();
      const subGain = ctx.createGain();
      subOsc.type = 'sine';
      subOsc.frequency.setValueAtTime(115, now);
      subOsc.frequency.exponentialRampToValueAtTime(32, now + 0.7);

      subGain.gain.setValueAtTime(0.3, now);
      subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.85);

      subOsc.connect(subGain);
      subGain.connect(ctx.destination);
      subOsc.start(now);
      subOsc.stop(now + 0.9);
      this.activeNodes.push(subOsc);

      // Subtle metallic resonance chime
      const chime = ctx.createOscillator();
      const chimeGain = ctx.createGain();
      chime.type = 'triangle';
      chime.frequency.setValueAtTime(420, now);
      chime.frequency.exponentialRampToValueAtTime(160, now + 0.38);

      chimeGain.gain.setValueAtTime(0.06, now);
      chimeGain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

      chime.connect(chimeGain);
      chimeGain.connect(ctx.destination);
      chime.start(now);
      chime.stop(now + 0.5);
      this.activeNodes.push(chime);
    } catch {
      // ignore
    }
  }

  /**
   * Rising synthetic engine-rev soundscape:
   * Multi-oscillator harmonic build simulating a high-revving motorsport engine climbing toward redline.
   */
  public playEngineRevAcceleration(): void {
    if (this.isMuted) return;
    const ctx = this.initContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const duration = 1.2;

      // Primary engine harmonic oscillator (sawtooth)
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const engineGain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      osc1.type = 'sawtooth';
      osc2.type = 'triangle';

      // Pitch sweep: climbing from low idle (130Hz) up through high rpm rev (480Hz)
      osc1.frequency.setValueAtTime(130, now);
      osc1.frequency.exponentialRampToValueAtTime(480, now + duration * 0.85);

      // Slightly detuned second oscillator for rich chorus
      osc2.frequency.setValueAtTime(133, now);
      osc2.frequency.exponentialRampToValueAtTime(486, now + duration * 0.85);

      // Resonant filter climbing with the revs
      filter.type = 'lowpass';
      filter.Q.setValueAtTime(3.2, now);
      filter.frequency.setValueAtTime(280, now);
      filter.frequency.exponentialRampToValueAtTime(1600, now + duration * 0.85);

      // Envelope: swelling up and cutting at peak shift
      engineGain.gain.setValueAtTime(0.02, now);
      engineGain.gain.linearRampToValueAtTime(0.18, now + duration * 0.75);
      engineGain.gain.exponentialRampToValueAtTime(0.001, now + duration);

      osc1.connect(filter);
      osc2.connect(filter);
      filter.connect(engineGain);
      engineGain.connect(ctx.destination);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + duration);
      osc2.stop(now + duration);

      this.activeNodes.push(osc1, osc2);
    } catch {
      // ignore
    }
  }

  /**
   * High-speed racing streak transition pass:
   * Doppler frequency sweep + aerodynamic rushing whoosh + clean resolution tail
   */
  public playRacingTransitionSpeedPass(): void {
    if (this.isMuted) return;
    const ctx = this.initContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const duration = 0.95;

      // 1. Doppler engine streak pass (sharp frequency drop)
      const engine = ctx.createOscillator();
      const engineGain = ctx.createGain();
      engine.type = 'sawtooth';
      engine.frequency.setValueAtTime(620, now);
      engine.frequency.exponentialRampToValueAtTime(130, now + duration * 0.65);

      const engineFilter = ctx.createBiquadFilter();
      engineFilter.type = 'lowpass';
      engineFilter.frequency.setValueAtTime(1500, now);
      engineFilter.frequency.exponentialRampToValueAtTime(350, now + duration);

      engineGain.gain.setValueAtTime(0.02, now);
      engineGain.gain.linearRampToValueAtTime(0.16, now + 0.12);
      engineGain.gain.exponentialRampToValueAtTime(0.001, now + duration);

      engine.connect(engineFilter);
      engineFilter.connect(engineGain);
      engineGain.connect(ctx.destination);

      engine.start(now);
      engine.stop(now + duration);
      this.activeNodes.push(engine);

      // 2. Aerodynamic air rush noise buffer
      const bufferSize = Math.floor(ctx.sampleRate * duration);
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.35));
      }
      const noise = ctx.createBufferSource();
      noise.buffer = noiseBuffer;

      const airFilter = ctx.createBiquadFilter();
      airFilter.type = 'bandpass';
      airFilter.Q.setValueAtTime(1.5, now);
      airFilter.frequency.setValueAtTime(1100, now);
      airFilter.frequency.exponentialRampToValueAtTime(220, now + duration);

      const airGain = ctx.createGain();
      airGain.gain.setValueAtTime(0.2, now);
      airGain.gain.exponentialRampToValueAtTime(0.001, now + duration);

      noise.connect(airFilter);
      airFilter.connect(airGain);
      airGain.connect(ctx.destination);
      noise.start(now);
      this.activeNodes.push(noise);

      // 3. Clean resolution chime as portfolio reveals
      const chime = ctx.createOscillator();
      const chimeGain = ctx.createGain();
      chime.type = 'sine';
      chime.frequency.setValueAtTime(523.25, now + 0.45); // C5 note
      chime.frequency.exponentialRampToValueAtTime(659.25, now + 0.7); // E5

      chimeGain.gain.setValueAtTime(0.0001, now + 0.45);
      chimeGain.gain.linearRampToValueAtTime(0.05, now + 0.52);
      chimeGain.gain.exponentialRampToValueAtTime(0.0001, now + 1.1);

      chime.connect(chimeGain);
      chimeGain.connect(ctx.destination);
      chime.start(now + 0.45);
      chime.stop(now + 1.15);
      this.activeNodes.push(chime);
    } catch {
      // ignore
    }
  }

  public playRevealWhoosh(): void {
    this.playWaterWaveTransition();
  }

  public playEnergyCharge(): void {
    this.playEngineRevAcceleration();
  }

  public playRacingSpeedPass(): void {
    this.playWaterWaveTransition();
  }

  /**
   * Soft, natural water-wave sound effect for the liquid transition.
   * - Resembles a gentle wave washing in and receding with subtle watery ripples.
   * - Volume-restrained, elegant, atmospheric, zero abrupt clicks.
   * - Perfectly timed to transition duration (~1.25s).
   */
  public playWaterWaveTransition(durationSec: number = 1.25): void {
    if (this.isMuted) return;
    const ctx = this.initContext();
    if (!ctx) return;

    // Stop previous instance to prevent overlapping copies
    this.stopWaterWave();

    try {
      const now = ctx.currentTime;
      const sampleRate = ctx.sampleRate;
      const bufferSize = Math.floor(sampleRate * durationSec);

      // 1. Generate brownian/pink shaped noise buffer for gentle fluid wave body
      const noiseBuffer = ctx.createBuffer(1, bufferSize, sampleRate);
      const output = noiseBuffer.getChannelData(0);
      let lastOut = 0.0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        // Leaky integrator produces warm Brownian noise
        lastOut = (lastOut + 0.03 * white) / 1.03;
        output[i] = lastOut * 3.0;
      }

      const noiseSource = ctx.createBufferSource();
      noiseSource.buffer = noiseBuffer;

      // 2. Dual BiquadFilters to simulate wave washing in and receding
      const lowpass = ctx.createBiquadFilter();
      lowpass.type = 'lowpass';
      lowpass.Q.setValueAtTime(1.6, now);
      lowpass.frequency.setValueAtTime(160, now);
      lowpass.frequency.exponentialRampToValueAtTime(540, now + durationSec * 0.45);
      lowpass.frequency.exponentialRampToValueAtTime(130, now + durationSec);

      const crestBand = ctx.createBiquadFilter();
      crestBand.type = 'bandpass';
      crestBand.Q.setValueAtTime(1.1, now);
      crestBand.frequency.setValueAtTime(300, now);
      crestBand.frequency.linearRampToValueAtTime(620, now + durationSec * 0.48);
      crestBand.frequency.exponentialRampToValueAtTime(180, now + durationSec);

      // 3. Restrained gain envelope: smooth swell, no harsh peaks, clean fade-out
      const masterGain = ctx.createGain();
      this.waterWaveGain = masterGain;
      masterGain.gain.setValueAtTime(0.0001, now);
      masterGain.gain.linearRampToValueAtTime(0.075, now + durationSec * 0.38);
      masterGain.gain.setValueAtTime(0.075, now + durationSec * 0.52);
      masterGain.gain.exponentialRampToValueAtTime(0.0001, now + durationSec);

      noiseSource.connect(lowpass);
      lowpass.connect(crestBand);
      crestBand.connect(masterGain);
      masterGain.connect(ctx.destination);

      noiseSource.start(now);
      noiseSource.stop(now + durationSec + 0.05);
      this.waterWaveNodes.push(noiseSource, lowpass, crestBand, masterGain);

      // 4. Subtle, delicate secondary liquid ripple droplets around peak crest
      const rippleOffsets = [0.36, 0.52, 0.68];
      const rippleFreqs = [820, 1080, 720];

      rippleOffsets.forEach((relTime, idx) => {
        const rippleTime = now + durationSec * relTime;
        const osc = ctx.createOscillator();
        const rGain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(rippleFreqs[idx], rippleTime);
        osc.frequency.exponentialRampToValueAtTime(rippleFreqs[idx] * 0.72, rippleTime + 0.07);

        rGain.gain.setValueAtTime(0.0001, rippleTime);
        rGain.gain.linearRampToValueAtTime(0.01, rippleTime + 0.012);
        rGain.gain.exponentialRampToValueAtTime(0.0001, rippleTime + 0.08);

        osc.connect(rGain);
        rGain.connect(ctx.destination);
        osc.start(rippleTime);
        osc.stop(rippleTime + 0.09);
        this.waterWaveNodes.push(osc, rGain);
      });
    } catch {
      // Safe fallback if audio is blocked or context suspended
    }
  }

  /**
   * Immediately fades out and cleans up the water-wave sound so it never bleeds into other scenes.
   */
  public stopWaterWave(): void {
    if (this.waterWaveGain && this.ctx) {
      try {
        const now = this.ctx.currentTime;
        this.waterWaveGain.gain.cancelScheduledValues(now);
        this.waterWaveGain.gain.linearRampToValueAtTime(0.0001, now + 0.05);
      } catch {
        // ignore
      }
    }
    const nodesToClean = [...this.waterWaveNodes];
    this.waterWaveNodes = [];
    this.waterWaveGain = null;

    setTimeout(() => {
      nodesToClean.forEach(node => {
        try {
          if ('stop' in node && typeof (node as OscillatorNode).stop === 'function') {
            (node as OscillatorNode).stop();
          }
          node.disconnect();
        } catch {
          // ignore
        }
      });
    }, 60);
  }

  /**
   * Cat Purr — Warm, rhythmic low-frequency vibration
   * Triggered when Mikey is tapped/clicked without dragging.
   */
  public playCatPurr(): void {
    const ctx = this.initContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    if (now - this.lastBlipTime < 0.3) return; // Debounce rapid spam
    this.lastBlipTime = now;

    try {
      const duration = 1.35;

      // 1. Core purr tone (triangle wave around 138Hz to 124Hz)
      const carrier = ctx.createOscillator();
      carrier.type = 'triangle';
      carrier.frequency.setValueAtTime(138, now);
      carrier.frequency.exponentialRampToValueAtTime(124, now + duration);

      // 2. Amplitude modulation (LFO at ~24Hz creates rhythmic motor-like purr flutter)
      const lfo = ctx.createOscillator();
      lfo.type = 'sine';
      lfo.frequency.setValueAtTime(24, now);

      const modGain = ctx.createGain();
      modGain.gain.setValueAtTime(0.5, now);

      // 3. Lowpass filter for muffled feline warmth
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(360, now);

      // 4. Output gain envelope: gentle fade-in, steady purr, gentle fade-out
      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(0.001, now);
      masterGain.gain.linearRampToValueAtTime(0.12, now + 0.15);
      masterGain.gain.setValueAtTime(0.12, now + duration - 0.25);
      masterGain.gain.linearRampToValueAtTime(0.001, now + duration);

      // Routing: LFO modulates carrier gain
      lfo.connect(modGain.gain);
      carrier.connect(modGain);
      modGain.connect(filter);
      filter.connect(masterGain);
      masterGain.connect(ctx.destination);

      carrier.start(now);
      lfo.start(now);
      carrier.stop(now + duration);
      lfo.stop(now + duration);

      this.activeNodes.push(carrier, lfo);
    } catch {
      // Graceful fallback if Web Audio is restricted
    }
  }

  /**
   * Cat Hiss — Sibilant air-burst with shaped bandpass noise
   * Triggered once when Mikey is dragged and dropped upon release.
   */
  public playCatHiss(): void {
    const ctx = this.initContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const duration = 0.36;

      // Noise buffer for realistic breath/hiss
      const bufferSize = Math.floor(ctx.sampleRate * duration);
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        // High-frequency shaped noise
        data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize * 0.4);
      }

      const noise = ctx.createBufferSource();
      noise.buffer = noiseBuffer;

      // Bandpass filter centered at cat-hiss sibilant frequencies (~3200Hz - 4200Hz)
      const bandpass = ctx.createBiquadFilter();
      bandpass.type = 'bandpass';
      bandpass.Q.setValueAtTime(2.2, now);
      bandpass.frequency.setValueAtTime(3200, now);
      bandpass.frequency.linearRampToValueAtTime(4200, now + 0.08);
      bandpass.frequency.exponentialRampToValueAtTime(2600, now + duration);

      // Gain envelope: fast attack, sharp hiss body, clean decay
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.085, now + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

      noise.connect(bandpass);
      bandpass.connect(gain);
      gain.connect(ctx.destination);

      noise.start(now);
      noise.stop(now + duration);

      this.activeNodes.push(noise);
    } catch {
      // Graceful fallback
    }
  }
}

export const domainAudio = new DomainAudioEngine();
