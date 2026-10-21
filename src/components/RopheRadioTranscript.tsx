import React from 'react';
import { motion } from 'motion/react';
import { Radio, Mic, Volume2 } from 'lucide-react';

interface RopheRadioTranscriptProps {
  isReducedMotion?: boolean;
  isChannelOpen?: boolean;
}

export const RopheRadioTranscript: React.FC<RopheRadioTranscriptProps> = ({
  isReducedMotion = false,
  isChannelOpen = false,
}) => {
  // Waveform bar heights mimicking the reference image silhouette:
  // Steady baseline around 14-20px on the left, climbing to a peak around bar 14-17 (44-52px),
  // then settling to 16-24px on the right.
  const waveformProfile = [
    12, 18, 14, 20, 16, 22, 18, 20, 24, 18, 
    22, 26, 38, 48, 40, 32, 26, 22, 30, 24, 
    20, 26, 22, 24, 20, 26, 18, 14
  ];

  return (
    <div 
      className="relative rounded-xl p-5 sm:p-7 md:p-8 bg-[#070709] border border-[#E10600]/30 shadow-2xl overflow-hidden transition-all duration-300 hover:border-[#E10600]/60"
      role="region"
      aria-label="Rophe Radio Transcript"
    >
      {/* Background motorsport telemetry grid scanline accent */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-[0.035] bg-[linear-gradient(rgba(255,255,255,0.7)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.7)_1px,transparent_1px)] bg-[size:16px_16px]" 
        aria-hidden="true"
      />

      {/* Subtle corner telemetry crosshair markers */}
      <div className="absolute top-2 left-2 text-[9px] font-mono text-[#E10600]/40 pointer-events-none select-none">
        ┌ CH-01
      </div>
      <div className="absolute top-2 right-2 text-[9px] font-mono text-neutral-600 pointer-events-none select-none">
        REC // 446.006 MHz ┐
      </div>
      <div className="absolute bottom-2 left-2 text-[9px] font-mono text-neutral-600 pointer-events-none select-none">
        └ ENCRYPTED
      </div>
      <div className="absolute bottom-2 right-2 text-[9px] font-mono text-[#E10600]/40 pointer-events-none select-none">
        GP_SESSION ┘
      </div>

      {/* Header bar: Telemetry status badge */}
      <div className="flex items-center justify-between pb-4 border-b border-white/[0.08] mb-6">
        <div className="flex items-center gap-2 text-xs font-tech">
          <div className="p-1 rounded bg-[#E10600]/10 border border-[#E10600]/30 text-[#E10600]">
            <Radio className="w-3.5 h-3.5" />
          </div>
          <span className="font-bold text-neutral-300 tracking-wider uppercase text-[11px] sm:text-xs">
            RADIO TRANSCRIPT // COMMS ARCHIVE
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className={`w-1.5 h-1.5 rounded-full ${isChannelOpen ? 'bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]' : 'bg-[#E10600] animate-pulse'}`} />
          <span className="text-[10px] font-mono tracking-wider uppercase text-neutral-400">
            {isChannelOpen ? 'DECRYPTED // 100%' : 'STANDBY // READY'}
          </span>
        </div>
      </div>

      {/* Main Reference Layout Container */}
      <div className="space-y-6">
        
        {/* Typographic Title matching reference image */}
        <div>
          <div className="font-display text-4xl sm:text-6xl md:text-7xl font-black tracking-tight leading-[0.9] uppercase select-none">
            <span className="text-[#E10600] block drop-shadow-[0_2px_12px_rgba(225,6,0,0.3)]">
              ROPHE
            </span>
            <span className="text-[#FFFFFF] block mt-1 drop-shadow-[0_2px_12px_rgba(255,255,255,0.2)]">
              RADIO
            </span>
          </div>
        </div>

        {/* Audio Waveform Graphic Divider matching reference image */}
        <div className="pt-2 pb-1" aria-hidden="true">
          {/* Vertical Equalizer Sound Bars */}
          <div className="flex items-end justify-between gap-1 sm:gap-1.5 h-14 px-1">
            {waveformProfile.map((height, i) => (
              <motion.div
                key={i}
                className="w-full bg-[#E10600] rounded-t-xs"
                style={{ height: `${height}px` }}
                animate={!isReducedMotion ? {
                  scaleY: isChannelOpen ? [1, 1.25, 0.85, 1] : [1, 1.08, 0.94, 1],
                  opacity: isChannelOpen ? [0.85, 1, 0.8, 0.85] : 0.85
                } : undefined}
                transition={!isReducedMotion ? {
                  duration: 1.2 + (i % 5) * 0.2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: i * 0.04
                } : undefined}
              />
            ))}
          </div>

          {/* Solid Horizontal Baseline matching reference image */}
          <div className="w-full h-1 bg-[#E10600] shadow-[0_0_8px_rgba(225,6,0,0.6)] mt-0.5 rounded-full" />
        </div>

        {/* Radio Dialogue Transcript Lines matching reference image */}
        <div className="space-y-4 pt-2">
          
          {/* Line 1 (Driver transmission): „MY SEAT IS BROKEN“ in Ferrari Red */}
          <div className="group">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-mono tracking-wider uppercase text-[#E10600]/80 flex items-center gap-1.5">
                <Mic className="w-3 h-3 text-[#E10600]" />
                <span>DRIVER // TRANSMISSION</span>
              </span>
            </div>
            <p className="font-display font-black text-2xl sm:text-4xl md:text-5xl tracking-tight text-[#E10600] uppercase leading-tight select-text drop-shadow-[0_0_15px_rgba(225,6,0,0.25)]">
              „MY SEAT IS BROKEN“
            </p>
          </div>

          {/* Line 2 (Pit Wall response): „GO SIT IN A FERRARI THEN“ in White */}
          <div className="group pt-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-mono tracking-wider uppercase text-neutral-400 flex items-center gap-1.5">
                <Volume2 className="w-3 h-3 text-neutral-300" />
                <span>PIT WALL // RACE ENGINEER</span>
              </span>
            </div>
            <p className="font-display font-black text-2xl sm:text-4xl md:text-5xl tracking-tight text-[#FFFFFF] uppercase leading-tight select-text drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">
              „GO SIT IN A FERRARI THEN“
            </p>
          </div>

        </div>

      </div>

      {/* Bottom subtle telemetry readout bar */}
      <div className="mt-6 pt-3 border-t border-white/[0.06] flex flex-wrap items-center justify-between gap-2 text-[10px] font-mono text-neutral-500">
        <span>SOURCE: PIT WALL TELEMETRY LOG #044</span>
        <span className="text-neutral-400">STATUS: ARCHIVED & MONITORED</span>
      </div>
    </div>
  );
};
