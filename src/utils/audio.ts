/**
 * Web Audio API audio engine for Domain Expansion and Racing-Inspired Transition.
 * - Dialogue text blips for chibi character (Undertale-style retro blips).
 * - Cinematic build-up and Domain Expansion title impacts (strike + sub-bass).
 * - Rising synthetic engine-rev sweep (harmonic multi-oscillator motorsport sound).
 * - High-speed Doppler racing acceleration whoosh during transition.
 * - Clean resolution tone as the portfolio appears.
 * - Muted by default, safe against autoplay blocking, graceful cleanup.
 */

class DomainAudioEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = true;
  private lastBlipTime: number = 0;
  private activeNodes: (AudioNode | OscillatorNode | AudioBufferSourceNode)[] = [];

  constructor() {
    this.isMuted = true;
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
    } else {
      this.stopAll();
    }
  }

  public toggleMute(): boolean {
    this.setMuted(!this.isMuted);
    return this.isMuted;
  }

  public stopAll(): void {
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
    this.playRacingTransitionSpeedPass();
  }

  public playEnergyCharge(): void {
    this.playEngineRevAcceleration();
  }

  public playRacingSpeedPass(): void {
    this.playRacingTransitionSpeedPass();
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
