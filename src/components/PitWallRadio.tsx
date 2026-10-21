import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Volume2, 
  VolumeX, 
  RefreshCw, 
  Mail, 
  Linkedin, 
  Github, 
  Instagram, 
  ArrowUpRight 
} from 'lucide-react';
import { domainAudio } from '../utils/audio';
import { portfolioData } from '../data/portfolioData';

interface PitWallRadioProps {
  isReducedMotion: boolean;
  isMuted: boolean;
  onToggleMute?: () => void;
  onChannelOpened?: (isOpen: boolean) => void;
  isInView: boolean;
}

type RadioStatus = 'idle' | 'connecting' | 'transmitting' | 'open' | 'error';

export const PitWallRadio: React.FC<PitWallRadioProps> = ({
  isReducedMotion,
  isMuted,
  onToggleMute,
  onChannelOpened,
  isInView
}) => {
  const [status, setStatus] = useState<RadioStatus>('idle');
  const [currentTime, setCurrentTime] = useState<number>(0);
  const isPlayingRef = useRef<boolean>(false);

  // If user scrolls away from Contact section while transmitting or connecting, stop and reset
  useEffect(() => {
    if (!isInView) {
      if (isPlayingRef.current || status === 'connecting' || status === 'transmitting') {
        domainAudio.stopRadioCheck(true);
        isPlayingRef.current = false;
        setStatus('idle');
        setCurrentTime(0);
        onChannelOpened?.(false);
      }
    }
  }, [isInView, status, onChannelOpened]);

  // If audio gets muted during active transmission, immediately stop and reset
  useEffect(() => {
    if (isMuted && (isPlayingRef.current || status === 'connecting' || status === 'transmitting')) {
      domainAudio.stopRadioCheck(true);
      isPlayingRef.current = false;
      setStatus('idle');
      setCurrentTime(0);
      onChannelOpened?.(false);
    }
  }, [isMuted, status, onChannelOpened]);

  const handleRadioCheck = () => {
    // If muted, unmute and play so the transmission is immediately audible
    if (isMuted) {
      if (onToggleMute) {
        onToggleMute();
      }
      domainAudio.setMuted(false);
    }

    if (isPlayingRef.current || status === 'connecting' || status === 'transmitting') {
      return;
    }

    isPlayingRef.current = true;
    setStatus('connecting');
    setCurrentTime(0);

    domainAudio.playRadioCheck({
      onStart: () => {
        setStatus('connecting');
      },
      onPlaying: () => {
        setStatus('transmitting');
      },
      onTimeUpdate: (time) => {
        setCurrentTime(time);
      },
      onEnded: () => {
        isPlayingRef.current = false;
        setStatus('open');
        setCurrentTime(3.8);
        onChannelOpened?.(true);
      },
      onError: () => {
        isPlayingRef.current = false;
        setStatus('error');
        onChannelOpened?.(false);
      }
    });
  };

  const handleToggleVolume = () => {
    if (onToggleMute) {
      onToggleMute();
    } else {
      domainAudio.toggleMute();
    }
  };

  // Determine active speaker during transmission based on audio timing
  const isDriverSpeaking = status === 'transmitting' && currentTime < 1.85;
  const isEngineerSpeaking = status === 'transmitting' && currentTime >= 1.85;

  return (
    <div 
      className="bg-[#0b0b0e] border border-white/[0.08] rounded-xl relative p-4 sm:p-5 lg:p-6 shadow-2xl overflow-hidden font-body text-white selection:bg-[#E10600]/35 selection:text-white"
      role="region"
      aria-label="Rophe Radio Unified Pit Wall Console"
    >
      {/* Subtle background technical grid scanline pattern */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-[0.035] bg-[linear-gradient(to_right,rgba(255,255,255,0.7)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.7)_1px,transparent_1px)] bg-[size:18px_18px]" 
        aria-hidden="true"
      />

      {/* ===================== COMPACT CONSOLE HEADER ===================== */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 mb-3.5 border-b border-white/[0.08] text-xs font-tech relative z-10">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#E10600] inline-block shrink-0 shadow-[0_0_8px_rgba(225,6,0,0.8)]" />
          <span className="font-bold text-white tracking-wider uppercase text-xs sm:text-sm">
            ROPHE RADIO // UNIFIED PIT WALL CONSOLE
          </span>
          <span className="text-neutral-600 hidden sm:inline">/</span>
          <span className="text-neutral-400 font-mono text-[11px] sm:text-xs hidden sm:inline">
            CONSOLE ID: RR-2026-F1
          </span>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <div className="px-2.5 py-0.5 rounded border border-emerald-500/40 bg-emerald-950/40 text-emerald-400 font-mono font-bold text-[11px] tracking-wider uppercase">
            COMMS: VERIFIED
          </div>
          <span className="text-neutral-400 font-mono text-[11px] sm:text-xs">
            FREQ: 446.006 MHz
          </span>
        </div>
      </div>

      {/* ===================== SLIM RADIO-CONTROL BAR ===================== */}
      <div className="bg-[#111114] border border-white/[0.08] rounded-lg p-2 sm:p-2.5 flex flex-wrap sm:flex-nowrap items-center justify-between gap-3 mb-3 relative z-10">
        {/* Left: Radio Check Button + Channel Armed Badge + Frequency */}
        <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap">
          <button
            onClick={handleRadioCheck}
            disabled={status === 'connecting' || status === 'transmitting'}
            className="bg-[#18181b] hover:bg-[#202024] border border-white/20 hover:border-[#E10600]/60 text-white rounded px-3.5 py-1.5 inline-flex items-center gap-2 font-tech font-bold text-xs uppercase tracking-wider transition-all cursor-pointer disabled:opacity-80 disabled:cursor-not-allowed shrink-0 focus:outline-hidden focus:ring-1 focus:ring-[#E10600]"
          >
            {status === 'connecting' || status === 'transmitting' ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#E10600]" />
            ) : (
              <Play className="w-3 h-3 fill-[#E10600] text-[#E10600]" />
            )}
            <span>
              {status === 'transmitting' 
                ? 'TRANSMITTING' 
                : status === 'connecting' 
                ? 'CONNECTING…' 
                : 'RADIO CHECK'}
            </span>
          </button>

          <div className="border border-white/10 bg-[#161619] px-2.5 py-1 rounded inline-flex items-center gap-1.5 shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]" />
            <span className="font-tech font-bold text-[11px] text-neutral-200 tracking-wider uppercase">
              CHANNEL ARMED
            </span>
          </div>

          <span className="font-mono text-neutral-400 text-xs tracking-tight hidden md:inline">
            446.006 MHz
          </span>
        </div>

        {/* Right: Recessed Waveform Slot + Speaker Control */}
        <div className="flex items-center gap-2.5 ml-auto sm:ml-0 shrink-0">
          <div 
            className="bg-[#08080a] border border-white/[0.06] rounded px-3 py-1 flex items-center gap-1 sm:gap-1.5 h-8 shrink-0 overflow-hidden"
            aria-hidden="true"
          >
            {Array.from({ length: 16 }).map((_, i) => {
              const isWaveActive = status === 'transmitting' || (status === 'open' && !isMuted);
              return (
                <span
                  key={i}
                  className={`w-1.5 sm:w-2 h-1 rounded-full transition-all duration-150 ${
                    status === 'transmitting'
                      ? i % 2 === 0 ? 'bg-[#E10600]' : 'bg-white'
                      : status === 'open'
                      ? 'bg-emerald-400/80'
                      : 'bg-neutral-700/80'
                  }`}
                  style={
                    isWaveActive && !isReducedMotion
                      ? {
                          opacity: 0.4 + 0.6 * Math.abs(Math.sin((i * 0.7) + currentTime * 6)),
                          transform: `scaleY(${status === 'transmitting' ? 1 + 1.2 * Math.abs(Math.sin(i * 0.9 + currentTime * 8)) : 1})`
                        }
                      : undefined
                  }
                />
              );
            })}
          </div>

          <button
            onClick={handleToggleVolume}
            aria-label={isMuted ? 'Unmute radio audio' : 'Mute radio audio'}
            className="bg-[#18181b] hover:bg-[#202024] border border-white/20 hover:border-[#E10600]/60 text-[#E10600] rounded p-2 cursor-pointer transition-all flex items-center justify-center shrink-0 focus:outline-hidden focus:ring-1 focus:ring-[#E10600]"
          >
            {isMuted ? (
              <VolumeX className="w-4 h-4 text-neutral-400" />
            ) : (
              <Volume2 className="w-4 h-4 text-[#E10600]" />
            )}
          </button>
        </div>
      </div>

      {/* ===================== TWO CLEARLY SEPARATED DIALOGUE PANELS ===================== */}
      <div className="space-y-2.5 mb-3.5 relative z-10">
        
        {/* Panel 1: Red — DRIVER // TRANSMISSION */}
        <div 
          className={`bg-[#111114] border border-[#E10600]/30 border-l-4 border-l-[#E10600] rounded-lg p-3 sm:p-4 transition-all duration-200 ${
            isDriverSpeaking 
              ? 'shadow-[0_0_24px_rgba(225,6,0,0.22)] border-[#E10600]/60' 
              : 'hover:border-[#E10600]/45'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-tech mb-1">
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full bg-[#E10600] shrink-0 ${isDriverSpeaking ? 'animate-ping' : ''}`} />
              <span className="font-bold text-[#E10600] tracking-wider uppercase text-xs">
                DRIVER // TRANSMISSION
              </span>
            </div>
            <span className="font-mono text-neutral-400 text-[11px] sm:text-xs tracking-wider uppercase">
              CH: 01 · RADIO LINK ACTIVE
            </span>
          </div>
          <p className="font-display font-black text-xl sm:text-2xl md:text-[26px] tracking-tight text-[#E10600] uppercase leading-snug mt-1 select-text drop-shadow-[0_0_12px_rgba(225,6,0,0.25)]">
            „MY SEAT IS FULL OF WATER“
          </p>
        </div>

        {/* Panel 2: White — PIT WALL // RACE ENGINEER */}
        <div 
          className={`bg-[#111114] border border-white/10 border-l-4 border-l-white rounded-lg p-3 sm:p-4 transition-all duration-200 ${
            isEngineerSpeaking 
              ? 'shadow-[0_0_24px_rgba(255,255,255,0.18)] border-white/40' 
              : 'hover:border-white/25'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-tech mb-1">
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full bg-white shrink-0 ${isEngineerSpeaking ? 'animate-ping' : ''}`} />
              <span className="font-bold text-white tracking-wider uppercase text-xs">
                PIT WALL // RACE ENGINEER
              </span>
            </div>
            <span className="font-mono text-neutral-400 text-[11px] sm:text-xs tracking-wider uppercase">
              CH: 02 · ACKNOWLEDGED
            </span>
          </div>
          <p className="font-display font-black text-xl sm:text-2xl md:text-[26px] tracking-tight text-white uppercase leading-snug mt-1 select-text drop-shadow-[0_0_12px_rgba(255,255,255,0.18)]">
            „MUST BE THE WATER“
          </p>
        </div>

      </div>

      {/* ===================== COMPACT COMMUNICATIONS SECTION ===================== */}
      <div className="pt-2 relative z-10">
        <div className="flex items-center justify-between text-xs font-tech mb-2.5">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#E10600]" />
            <span className="font-bold text-white tracking-wider uppercase text-xs">
              DIRECT COMMUNICATIONS CHANNELS // TELEMETRY UPLINKS
            </span>
          </div>
          <span className="font-mono text-neutral-400 text-[11px] uppercase tracking-widest">
            4 CHANNELS MONITORED
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          
          {/* Email */}
          <a
            href={`mailto:${portfolioData.contact.email}`}
            className="bg-[#111114] border border-white/[0.08] hover:border-[#E10600]/50 rounded-xl p-3.5 sm:p-4 flex flex-col justify-between transition-all group shadow-sm hover:shadow-md cursor-pointer"
          >
            <div>
              <div className="w-9 h-9 rounded-lg bg-[#18181b] border border-white/10 flex items-center justify-center text-[#E10600] mb-3 group-hover:border-[#E10600]/40 transition-colors">
                <Mail className="w-4 h-4" />
              </div>
              <div className="text-[10px] font-tech font-bold uppercase text-neutral-400 tracking-wider">
                EMAIL DIRECT
              </div>
              <div className="font-tech font-bold text-white text-xs sm:text-sm tracking-tight truncate mt-0.5 group-hover:text-[#E10600] transition-colors">
                {portfolioData.contact.email}
              </div>
            </div>
            <div className="text-xs font-tech font-bold text-[#E10600] uppercase mt-3.5 flex items-center gap-1 group-hover:underline">
              <span>SEND MESSAGE</span>
              <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </div>
          </a>

          {/* LinkedIn */}
          <a
            href={portfolioData.contact.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[#111114] border border-white/[0.08] hover:border-[#E10600]/50 rounded-xl p-3.5 sm:p-4 flex flex-col justify-between transition-all group shadow-sm hover:shadow-md cursor-pointer"
          >
            <div>
              <div className="w-9 h-9 rounded-lg bg-[#18181b] border border-white/10 flex items-center justify-center text-[#E10600] mb-3 group-hover:border-[#E10600]/40 transition-colors">
                <Linkedin className="w-4 h-4" />
              </div>
              <div className="text-[10px] font-tech font-bold uppercase text-neutral-400 tracking-wider">
                LINKEDIN
              </div>
              <div className="font-tech font-bold text-white text-xs sm:text-sm tracking-tight truncate mt-0.5 group-hover:text-[#E10600] transition-colors">
                Rophe Angel
              </div>
            </div>
            <div className="text-xs font-tech font-bold text-[#E10600] uppercase mt-3.5 flex items-center gap-1 group-hover:underline">
              <span>CONNECT</span>
              <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </div>
          </a>

          {/* GitHub */}
          <a
            href={portfolioData.contact.github}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[#111114] border border-white/[0.08] hover:border-[#E10600]/50 rounded-xl p-3.5 sm:p-4 flex flex-col justify-between transition-all group shadow-sm hover:shadow-md cursor-pointer"
          >
            <div>
              <div className="w-9 h-9 rounded-lg bg-[#18181b] border border-white/10 flex items-center justify-center text-[#E10600] mb-3 group-hover:border-[#E10600]/40 transition-colors">
                <Github className="w-4 h-4" />
              </div>
              <div className="text-[10px] font-tech font-bold uppercase text-neutral-400 tracking-wider">
                GITHUB
              </div>
              <div className="font-tech font-bold text-white text-xs sm:text-sm tracking-tight truncate mt-0.5 group-hover:text-[#E10600] transition-colors">
                @ropheangel1312
              </div>
            </div>
            <div className="text-xs font-tech font-bold text-[#E10600] uppercase mt-3.5 flex items-center gap-1 group-hover:underline">
              <span>VIEW REPOS</span>
              <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </div>
          </a>

          {/* Instagram */}
          <a
            href={portfolioData.contact.instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[#111114] border border-white/[0.08] hover:border-[#E10600]/50 rounded-xl p-3.5 sm:p-4 flex flex-col justify-between transition-all group shadow-sm hover:shadow-md cursor-pointer"
          >
            <div>
              <div className="w-9 h-9 rounded-lg bg-[#18181b] border border-white/10 flex items-center justify-center text-[#E10600] mb-3 group-hover:border-[#E10600]/40 transition-colors">
                <Instagram className="w-4 h-4" />
              </div>
              <div className="text-[10px] font-tech font-bold uppercase text-neutral-400 tracking-wider">
                INSTAGRAM
              </div>
              <div className="font-tech font-bold text-white text-xs sm:text-sm tracking-tight truncate mt-0.5 group-hover:text-[#E10600] transition-colors">
                {portfolioData.contact.instagramHandle}
              </div>
            </div>
            <div className="text-xs font-tech font-bold text-[#E10600] uppercase mt-3.5 flex items-center gap-1 group-hover:underline">
              <span>FOLLOW UPDATES</span>
              <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </div>
          </a>

        </div>
      </div>
    </div>
  );
};
