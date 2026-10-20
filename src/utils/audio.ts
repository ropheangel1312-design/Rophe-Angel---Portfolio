/**
 * Web Audio API audio engine for anime domain expansion effects.
 * - Realistic flame audio: soft ignition, rising fire whoosh, warm layered flame rush, and peak impact.
 * - Undertale-style soft dialogue text blips.
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

  public stopCrtHum(): void {
    this.stopAll();
  }

  /**
   * Undertale-style text-box dialogue blip:
   * Short, soft, retro-game electronic character blip.
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
      gain.gain.linearRampToValueAtTime(0.05, now + 0.002);
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
      osc.frequency.setValueAtTime(160, now);
      osc.frequency.exponentialRampToValueAtTime(48, now + 0.45);

      gain.gain.setValueAtTime(0.24, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.55);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.6);
      this.activeNodes.push(osc);
    } catch {
      // ignore
    }
  }

  /**
   * Title Stage 2: "ETERNAL BUFFERING" deep cinematic slam
   */
  public playBufferingTitleImpact(): void {
    if (this.isMuted) return;
    const ctx = this.initContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;

      // Warm low-frequency swell
      const subOsc = ctx.createOscillator();
      const subGain = ctx.createGain();
      subOsc.type = 'sine';
      subOsc.frequency.setValueAtTime(110, now);
      subOsc.frequency.exponentialRampToValueAtTime(32, now + 0.65);

      subGain.gain.setValueAtTime(0.32, now);
      subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.85);

      subOsc.connect(subGain);
      subGain.connect(ctx.destination);
      subOsc.start(now);
      subOsc.stop(now + 0.9);
      this.activeNodes.push(subOsc);

      // Warm harmonic overtone
      const chime = ctx.createOscillator();
      const chimeGain = ctx.createGain();
      chime.type = 'sine';
      chime.frequency.setValueAtTime(440, now);
      chime.frequency.exponentialRampToValueAtTime(180, now + 0.4);

      chimeGain.gain.setValueAtTime(0.08, now);
      chimeGain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

      chime.connect(chimeGain);
      chimeGain.connect(ctx.destination);
      chime.start(now);
      chime.stop(now + 0.55);
      this.activeNodes.push(chime);
    } catch {
      // ignore
    }
  }

  /**
   * Flame Ignition: Soft spark and warm flame catch
   */
  public playFlameEnergyCharge(): void {
    if (this.isMuted) return;
    const ctx = this.initContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const duration = 1.15;

      // 1. Soft organic fire ignition roar (filtered pink noise simulating burning air)
      const bufferSize = Math.floor(ctx.sampleRate * duration);
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = noiseBuffer.getChannelData(0);
      
      let lastOut = 0.0;
      for (let i = 0; i < bufferSize; i++) {
        // Pink noise filtering for warm organic flame roar
        const white = Math.random() * 2 - 1;
        lastOut = (lastOut * 0.95) + (white * 0.05);
        // Envelope: soft start, swell, warm sustain
        const env = Math.sin((i / bufferSize) * Math.PI);
        // Random micro-crackle simulating real burning embers
        const crackle = Math.random() < 0.02 ? (Math.random() * 0.8) : 0;
        data[i] = (lastOut * 2.8 + crackle) * env;
      }
      
      const noise = ctx.createBufferSource();
      noise.buffer = noiseBuffer;

      // Warm bandpass filter sweeping upward as fire spreads
      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.Q.setValueAtTime(1.6, now);
      filter.frequency.setValueAtTime(260, now);
      filter.frequency.exponentialRampToValueAtTime(850, now + duration * 0.85);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.01, now);
      gain.gain.linearRampToValueAtTime(0.26, now + duration * 0.65); // Strongest moment
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      noise.start(now);
      this.activeNodes.push(noise);

      // 2. Warm low-end fire rumble
      const rumble = ctx.createOscillator();
      const rumbleGain = ctx.createGain();
      rumble.type = 'sine';
      rumble.frequency.setValueAtTime(65, now);
      rumble.frequency.linearRampToValueAtTime(120, now + duration * 0.7);

      rumbleGain.gain.setValueAtTime(0.01, now);
      rumbleGain.gain.linearRampToValueAtTime(0.18, now + duration * 0.6);
      rumbleGain.gain.exponentialRampToValueAtTime(0.001, now + duration);

      rumble.connect(rumbleGain);
      rumbleGain.connect(ctx.destination);
      rumble.start(now);
      rumble.stop(now + duration);
      this.activeNodes.push(rumble);
    } catch {
      // ignore
    }
  }

  /**
   * Flame Peak: Deep, warm impact as the fire engulfs the screen
   */
  public playFlamePeakImpact(): void {
    if (this.isMuted) return;
    const ctx = this.initContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;

      // Warm flame impact punch (clean sub drop, not harsh)
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(125, now);
      osc.frequency.exponentialRampToValueAtTime(30, now + 0.6);

      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.75);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.8);
      this.activeNodes.push(osc);

      // Soft fiery rush burst
      const burstSize = Math.floor(ctx.sampleRate * 0.2);
      const burstBuffer = ctx.createBuffer(1, burstSize, ctx.sampleRate);
      const data = burstBuffer.getChannelData(0);
      for (let i = 0; i < burstSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (burstSize * 0.35));
      }
      const burst = ctx.createBufferSource();
      burst.buffer = burstBuffer;

      const burstFilter = ctx.createBiquadFilter();
      burstFilter.type = 'lowpass';
      burstFilter.frequency.setValueAtTime(800, now);

      const burstGain = ctx.createGain();
      burstGain.gain.setValueAtTime(0.14, now);

      burst.connect(burstFilter);
      burstFilter.connect(burstGain);
      burstGain.connect(ctx.destination);
      burst.start(now);
      this.activeNodes.push(burst);
    } catch {
      // ignore
    }
  }

  /**
   * Homepage Reveal: Soft, warm trailing whoosh as the flames part
   */
  public playRevealWhoosh(): void {
    if (this.isMuted) return;
    const ctx = this.initContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const duration = 0.8;

      const bufferSize = Math.floor(ctx.sampleRate * duration);
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.4));
      }
      const noise = ctx.createBufferSource();
      noise.buffer = noiseBuffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(950, now);
      filter.frequency.exponentialRampToValueAtTime(180, now + duration);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      noise.start(now);
      this.activeNodes.push(noise);
    } catch {
      // ignore
    }
  }

  // Backward compatibility aliases
  public playTitleImpact(): void {
    this.playDomainTitleImpact();
  }

  public playRingWhoosh(): void {
    this.playFlameEnergyCharge();
  }

  public playHomepageReveal(): void {
    this.playRevealWhoosh();
  }
}

export const domainAudio = new DomainAudioEngine();
