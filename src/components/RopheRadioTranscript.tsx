import React from 'react';
import { Mic, Volume2 } from 'lucide-react';

interface RopheRadioTranscriptProps {
  isReducedMotion?: boolean;
  isChannelOpen?: boolean;
}

export const RopheRadioTranscript: React.FC<RopheRadioTranscriptProps> = () => {
  return (
    <div className="space-y-2.5">
      {/* Panel 1: Red — DRIVER // TRANSMISSION */}
      <div className="bg-[#111114] border border-[#E10600]/30 border-l-4 border-l-[#E10600] rounded-lg p-3 sm:p-4">
        <div className="flex items-center justify-between text-xs font-tech mb-1">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#E10600] shrink-0" />
            <span className="font-bold text-[#E10600] tracking-wider uppercase text-xs flex items-center gap-1.5">
              <Mic className="w-3 h-3 text-[#E10600]" />
              <span>DRIVER // TRANSMISSION</span>
            </span>
          </div>
          <span className="font-mono text-neutral-400 text-[11px] sm:text-xs tracking-wider uppercase">
            CH: 01 · RADIO LINK ACTIVE
          </span>
        </div>
        <p className="font-display font-black text-xl sm:text-2xl md:text-[26px] tracking-tight text-[#E10600] uppercase leading-snug mt-1 select-text">
          „MY SEAT IS FULL OF WATER“
        </p>
      </div>

      {/* Panel 2: White — PIT WALL // RACE ENGINEER */}
      <div className="bg-[#111114] border border-white/10 border-l-4 border-l-white rounded-lg p-3 sm:p-4">
        <div className="flex items-center justify-between text-xs font-tech mb-1">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-white shrink-0" />
            <span className="font-bold text-white tracking-wider uppercase text-xs flex items-center gap-1.5">
              <Volume2 className="w-3 h-3 text-neutral-300" />
              <span>PIT WALL // RACE ENGINEER</span>
            </span>
          </div>
          <span className="font-mono text-neutral-400 text-[11px] sm:text-xs tracking-wider uppercase">
            CH: 02 · ACKNOWLEDGED
          </span>
        </div>
        <p className="font-display font-black text-xl sm:text-2xl md:text-[26px] tracking-tight text-white uppercase leading-snug mt-1 select-text">
          „MUST BE THE WATER“
        </p>
      </div>
    </div>
  );
};
