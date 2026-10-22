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
import { Card3D } from './Card3D';

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

  // Four individual floating communications channels with F1 telemetry specs
  const contactChannels = [
    {
      id: 'email',
      kicker: 'CH // 01 · DIRECT',
      label: 'EMAIL DIRECT',
      value: portfolioData.contact.email,
      action: 'SEND MESSAGE',
      href: `mailto:${portfolioData.contact.email}`,
      icon: Mail,
      isExternal: false,
      protocol: 'PROTO: SMTP/TLS',
      signalRate: '99.8%',
      latency: '8ms',
      channelId: 'TX-01',
      statusText: 'UPLINK ARMED'
    },
    {
      id: 'linkedin',
      kicker: 'CH // 02 · NETWORK',
      label: 'LINKEDIN',
      value: 'Rophe Angel',
      action: 'CONNECT',
      href: portfolioData.contact.linkedin,
      icon: Linkedin,
      isExternal: true,
      protocol: 'PROTO: WSS/HTTPS',
      signalRate: '98.5%',
      latency: '14ms',
      channelId: 'TX-02',
      statusText: 'NET SYNCHRONIZED'
    },
    {
      id: 'github',
      kicker: 'CH // 03 · SOURCE',
      label: 'GITHUB',
      value: '@ropheangel1312',
      action: 'VIEW REPOS',
      href: portfolioData.contact.github,
      icon: Github,
      isExternal: true,
      protocol: 'PROTO: SSH/GIT',
      signalRate: '100%',
      latency: '11ms',
      channelId: 'TX-03',
      statusText: 'REPO PIPELINE'
    },
    {
      id: 'instagram',
      kicker: 'CH // 04 · DISPATCH',
      label: 'INSTAGRAM',
      value: portfolioData.contact.instagramHandle,
      action: 'FOLLOW UPDATES',
      href: portfolioData.contact.instagramUrl,
      icon: Instagram,
      isExternal: true,
      protocol: 'PROTO: TLS/FEED',
      signalRate: '97.9%',
      latency: '18ms',
      channelId: 'TX-04',
      statusText: 'MEDIA CARRIER'
    },
  ];

  return (
    <div className="w-full flex flex-col gap-8 sm:gap-10">
      
      {/* =========================================================================
          PART A: RADIO PANEL — ONE COHESIVE FLOATING 3D OBJECT
          Wrapped in Card3D with cursor-reactive tilt, specular glare,
          and internal layered depth (chassis, header, controls, dialogue plates).
          ========================================================================= */}
      <Card3D
        index={0}
        isReducedMotion={isReducedMotion}
        maxTilt={2.6}
        depth={12}
        glareColor="rgba(225, 6, 0, 0.12)"
        className="f1-card rounded-2xl relative p-4 sm:p-6 lg:p-7 shadow-[0_20px_50px_rgba(0,0,0,0.7)] overflow-visible font-body text-white selection:bg-[#E10600]/35 selection:text-white"
        role="region"
        aria-label="Rophe Radio Unified Pit Wall Console"
      >
        {/* Subtle background technical grid scanline pattern */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-[0.035] rounded-2xl bg-[linear-gradient(to_right,rgba(255,255,255,0.7)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.7)_1px,transparent_1px)] bg-[size:18px_18px]" 
          aria-hidden="true"
        />

        {/* 1. LAYERED CONSOLE HEADER (translateZ: 10px) */}
        <div 
          style={{ transform: !isReducedMotion ? 'translateZ(10px)' : undefined }}
          className="flex flex-wrap items-center justify-between gap-3 pb-3.5 mb-4 border-b border-white/[0.08] text-xs font-tech relative z-10"
        >
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#E10600] inline-block shrink-0 shadow-[0_0_8px_rgba(225,6,0,0.85)] animate-pulse" />
            <span className="font-bold text-white tracking-wider uppercase text-xs sm:text-sm">
              ROPHE RADIO // UNIFIED PIT WALL CONSOLE
            </span>
            <span className="text-neutral-600 hidden sm:inline">/</span>
            <span className="text-neutral-400 font-mono text-[11px] sm:text-xs hidden sm:inline">
              CONSOLE ID: RR-2026-F1
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <div className="px-2.5 py-0.5 rounded border border-emerald-500/40 bg-emerald-950/40 text-emerald-400 font-mono font-bold text-[11px] tracking-wider uppercase shadow-[0_0_8px_rgba(16,185,129,0.2)]">
              COMMS: VERIFIED
            </div>
            <span className="text-neutral-400 font-mono text-[11px] sm:text-xs">
              FREQ: 446.006 MHz
            </span>
          </div>
        </div>

        {/* 2. LAYERED RADIO-CONTROL DECK (translateZ: 15px) */}
        <div 
          style={{ transform: !isReducedMotion ? 'translateZ(15px)' : undefined }}
          className="bg-[#111114]/90 backdrop-blur-md border border-white/[0.1] rounded-xl p-2.5 sm:p-3 flex flex-wrap sm:flex-nowrap items-center justify-between gap-3 mb-4 relative z-10 shadow-[0_4px_20px_rgba(0,0,0,0.45)]"
        >
          {/* Left: Radio Check Button + Channel Armed Badge + Frequency */}
          <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap">
            <button
              onClick={handleRadioCheck}
              disabled={status === 'connecting' || status === 'transmitting'}
              className="bg-[#18181b] hover:bg-[#222226] border border-white/20 hover:border-[#E10600]/70 text-white rounded-lg px-3.5 py-1.5 inline-flex items-center gap-2 font-tech font-bold text-xs uppercase tracking-wider transition-all cursor-pointer disabled:opacity-80 disabled:cursor-not-allowed shrink-0 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-[#E10600] active:scale-95 shadow-[0_2px_8px_rgba(0,0,0,0.3)]"
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

            <div className="border border-white/10 bg-[#161619] px-2.5 py-1 rounded-md inline-flex items-center gap-1.5 shrink-0">
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
              className="bg-[#08080a] border border-white/[0.08] rounded-md px-3 py-1 flex items-center gap-1 sm:gap-1.5 h-8 shrink-0 overflow-hidden shadow-[inset_0_1px_2px_rgba(0,0,0,0.8)]"
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
              className="bg-[#18181b] hover:bg-[#222226] border border-white/20 hover:border-[#E10600]/70 text-[#E10600] rounded-lg p-2 cursor-pointer transition-all flex items-center justify-center shrink-0 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-[#E10600] active:scale-95 shadow-[0_2px_8px_rgba(0,0,0,0.3)]"
            >
              {isMuted ? (
                <VolumeX className="w-4 h-4 text-neutral-400" />
              ) : (
                <Volume2 className="w-4 h-4 text-[#E10600] animate-pulse" />
              )}
            </button>
          </div>
        </div>

        {/* 3. LAYERED DIALOGUE PLATES (translateZ: 20px) */}
        <div 
          style={{ transform: !isReducedMotion ? 'translateZ(20px)' : undefined }}
          className="space-y-3 relative z-10"
        >
          {/* Panel 1: Red — DRIVER // TRANSMISSION */}
          <div 
            className={`bg-[#111114]/90 backdrop-blur-md border border-[#E10600]/30 border-l-4 border-l-[#E10600] rounded-xl p-3.5 sm:p-4.5 transition-all duration-300 shadow-[0_4px_20px_rgba(0,0,0,0.45)] ${
              isDriverSpeaking 
                ? 'shadow-[0_0_32px_rgba(225,6,0,0.3)] border-[#E10600]/70' 
                : 'hover:border-[#E10600]/50'
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
            <p className="font-display font-black text-xl sm:text-2xl md:text-[26px] tracking-tight text-[#E10600] uppercase leading-snug mt-1 select-text drop-shadow-[0_0_14px_rgba(225,6,0,0.3)]">
              „MY SEAT IS FULL OF WATER“
            </p>
          </div>

          {/* Panel 2: White — PIT WALL // RACE ENGINEER */}
          <div 
            className={`bg-[#111114]/90 backdrop-blur-md border border-white/15 border-l-4 border-l-white rounded-xl p-3.5 sm:p-4.5 transition-all duration-300 shadow-[0_4px_20px_rgba(0,0,0,0.45)] ${
              isEngineerSpeaking 
                ? 'shadow-[0_0_32px_rgba(255,255,255,0.25)] border-white/50' 
                : 'hover:border-white/30'
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
            <p className="font-display font-black text-xl sm:text-2xl md:text-[26px] tracking-tight text-white uppercase leading-snug mt-1 select-text drop-shadow-[0_0_14px_rgba(255,255,255,0.22)]">
              „MUST BE THE WATER“
            </p>
          </div>
        </div>
      </Card3D>

      {/* =========================================================================
          PART B: CONTACT LINKS — FOUR INDIVIDUAL FLOATING 3D ELEMENTS
          Upgraded into a high-precision F1 communications interface.
          Featuring live carrier signal telemetry, cursor-following red reflection,
          illuminated borders, slow red light sweep, and channel-specific icon physics.
          ========================================================================= */}
      <div className="w-full">
        {/* Refined Header with Understated Live-Signal Indicator */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-tech mb-4.5 px-1 pb-3 border-b border-white/[0.08]">
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#E10600] opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#E10600] shadow-[0_0_8px_rgba(225,6,0,0.9)]" />
            </span>
            <span className="font-bold text-white tracking-widest uppercase text-xs sm:text-sm">
              DIRECT COMMUNICATIONS CHANNELS // TELEMETRY UPLINKS
            </span>
          </div>

          {/* Understated Live Telemetry & Carrier Status */}
          <div className="flex items-center gap-3 text-[11px] font-mono">
            <div className="flex items-center gap-2 bg-[#0d0d10] px-2.5 py-1 rounded-md border border-white/[0.08] text-neutral-300 shadow-[inset_0_1px_1px_rgba(255,255,255,0.06)]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_6px_rgba(52,211,153,0.9)]" />
              <span className="text-emerald-400 font-bold uppercase tracking-wider text-[10px]">
                CARRIER LOCKED
              </span>
              <span className="text-neutral-600">/</span>
              <span className="text-neutral-400 text-[10px]">
                446.006 MHz
              </span>
            </div>

            <div className="hidden sm:flex items-center gap-2 text-neutral-400 text-[11px]">
              <span className="text-neutral-600">|</span>
              <span className="text-neutral-400 tracking-wider">
                SNR: 99.4% · 4 CHANNELS ARMED
              </span>
            </div>
          </div>
        </div>

        {/* Four Independent Floating 3D Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-4.5">
          {contactChannels.map((channel, idx) => {
            const Icon = channel.icon;

            // Channel-specific icon physics on hover
            const getIconAnimationClass = (id: string) => {
              switch (id) {
                case 'email':
                  return 'group-hover:scale-115 group-hover:-translate-y-1 group-hover:-rotate-6';
                case 'linkedin':
                  return 'group-hover:scale-120 group-hover:rotate-6';
                case 'github':
                  return 'group-hover:scale-120 group-hover:-translate-y-1.5';
                case 'instagram':
                  return 'group-hover:scale-120 group-hover:rotate-12';
                default:
                  return 'group-hover:scale-115 group-hover:-translate-y-0.5';
              }
            };

            return (
              <Card3D
                key={channel.id}
                index={idx + 1}
                isReducedMotion={isReducedMotion}
                maxTilt={4.5}
                depth={12}
                glareColor="rgba(225, 6, 0, 0.18)"
                className="f1-card rounded-xl p-4 sm:p-5 flex flex-col justify-between h-full group transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1.5 border border-white/10 hover:border-[#E10600]/80 shadow-[0_12px_32px_rgba(0,0,0,0.6)] hover:shadow-[0_20px_48px_rgba(0,0,0,0.85),0_0_28px_rgba(225,6,0,0.22),inset_0_1px_2px_rgba(255,255,255,0.22)] relative overflow-hidden"
                onMouseMove={(e) => {
                  if (isReducedMotion) return;
                  const rect = e.currentTarget.getBoundingClientRect();
                  const x = ((e.clientX - rect.left) / rect.width) * 100;
                  const y = ((e.clientY - rect.top) / rect.height) * 100;
                  e.currentTarget.style.setProperty('--card-mouse-x', `${x.toFixed(1)}%`);
                  e.currentTarget.style.setProperty('--card-mouse-y', `${y.toFixed(1)}%`);
                }}
              >
                {/* 1. Cursor-Following Specular Red Reflection */}
                <div 
                  className="absolute inset-0 pointer-events-none rounded-[inherit] opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10"
                  style={{
                    background: 'radial-gradient(circle 190px at var(--card-mouse-x, 50%) var(--card-mouse-y, 50%), rgba(225, 6, 0, 0.28), rgba(225, 6, 0, 0.08) 42%, transparent 75%)'
                  }}
                  aria-hidden="true"
                />

                {/* 2. Slow Red Light Sweep across liquid glass surface */}
                {!isReducedMotion && (
                  <div 
                    className="absolute inset-y-0 -inset-x-full pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-red-sweep bg-gradient-to-r from-transparent via-[#E10600]/20 to-transparent z-10"
                    aria-hidden="true"
                  />
                )}

                {/* 3. Subtle background telemetry scanline weave */}
                <div 
                  className="absolute inset-0 pointer-events-none opacity-[0.035] group-hover:opacity-[0.06] transition-opacity duration-300 rounded-[inherit] bg-[linear-gradient(to_right,rgba(255,255,255,0.7)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.7)_1px,transparent_1px)] bg-[size:14px_14px]" 
                  aria-hidden="true"
                />

                {/* 4. Top Glass Specular Edge Light */}
                <div 
                  className="absolute top-0 inset-x-5 h-[1px] bg-gradient-to-r from-transparent via-white/25 to-transparent pointer-events-none group-hover:via-[#E10600]/80 transition-colors duration-300 z-10" 
                  aria-hidden="true"
                />

                <a
                  href={channel.href}
                  target={channel.isExternal ? '_blank' : undefined}
                  rel={channel.isExternal ? 'noopener noreferrer' : undefined}
                  className="flex flex-col justify-between h-full w-full rounded-lg focus:outline-hidden focus-visible:ring-2 focus-visible:ring-[#E10600] select-none relative z-10"
                  aria-label={`${channel.label}: ${channel.value}`}
                >
                  <div>
                    {/* Top row: Elevated Icon Pod + Ambient Carrier Status Indicator */}
                    <div className="flex items-center justify-between gap-3 mb-3.5">
                      <div 
                        style={{ transform: !isReducedMotion ? 'translateZ(16px)' : undefined }}
                        className="relative w-10 h-10 rounded-lg bg-white/[0.04] backdrop-blur-xs border border-white/10 flex items-center justify-center text-[#E10600] group-hover:border-[#E10600]/70 group-hover:bg-[#E10600]/15 group-hover:text-white group-hover:shadow-[0_0_18px_rgba(225,6,0,0.45)] transition-all duration-300 shadow-[inset_0_1px_1px_rgba(255,255,255,0.08)]"
                      >
                        <Icon className={`w-4 h-4 transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${getIconAnimationClass(channel.id)}`} />
                        
                        {/* Specific beacon flares for icon types */}
                        {channel.id === 'email' && (
                          <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-[#E10600] opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-ping" />
                        )}
                        {channel.id === 'linkedin' && (
                          <span className="absolute -bottom-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-sky-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-[0_0_6px_#38bdf8]" />
                        )}
                        {channel.id === 'github' && (
                          <span className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-1.5 h-0.5 bg-[#E10600] opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-[0_0_6px_#E10600]" />
                        )}
                        {channel.id === 'instagram' && (
                          <span className="absolute inset-0 rounded-lg border border-pink-500/0 group-hover:border-pink-500/40 group-hover:scale-120 transition-all duration-300 opacity-0 group-hover:opacity-100" />
                        )}
                      </div>

                      {/* Ambient Live Signal Indicator */}
                      <div 
                        style={{ transform: !isReducedMotion ? 'translateZ(10px)' : undefined }}
                        className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#0e0e11]/90 border border-white/[0.08] shadow-[inset_0_1px_1px_rgba(255,255,255,0.04)]"
                      >
                        <span className="relative flex h-1.5 w-1.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.9)]" />
                        </span>
                        <span className="font-mono text-[9px] text-emerald-400 font-bold uppercase tracking-wider">
                          {channel.channelId}
                        </span>
                      </div>
                    </div>

                    {/* Channel Kicker & Title */}
                    <div 
                      style={{ transform: !isReducedMotion ? 'translateZ(10px)' : undefined }}
                      className="flex items-center justify-between text-[10px] font-mono text-neutral-400 uppercase tracking-widest mb-1"
                    >
                      <span className="text-[#E10600] font-bold">{channel.kicker}</span>
                      <span className="text-neutral-500 text-[9px]">{channel.statusText}</span>
                    </div>

                    <div 
                      style={{ transform: !isReducedMotion ? 'translateZ(12px)' : undefined }}
                      className="text-[11px] font-tech font-bold uppercase text-neutral-300 tracking-wider mb-1"
                    >
                      {channel.label}
                    </div>

                    {/* Target Handle / Value */}
                    <div 
                      style={{ transform: !isReducedMotion ? 'translateZ(16px)' : undefined }}
                      className="font-tech font-bold text-white text-sm sm:text-base tracking-tight truncate group-hover:text-[#E10600] transition-colors"
                      title={channel.value}
                    >
                      {channel.value}
                    </div>

                    {/* Restrained Telemetry Details */}
                    <div 
                      style={{ transform: !isReducedMotion ? 'translateZ(12px)' : undefined }}
                      className="pt-2.5 mt-3 border-t border-white/[0.06] flex items-center justify-between text-[10px] font-mono text-neutral-400"
                    >
                      <span className="text-neutral-500 font-medium tracking-tight">
                        {channel.protocol}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span className="text-neutral-500 text-[9px]">{channel.latency}</span>
                        <span className="text-neutral-700">/</span>
                        <span className="text-[#E10600] font-bold text-[9px]">{channel.signalRate}</span>
                        
                        {/* 4 Micro RF Signal bars */}
                        <span className="inline-flex items-end gap-[1.5px] h-2.5 ml-0.5" aria-hidden="true">
                          <span className="w-0.5 h-1 bg-emerald-400/90 rounded-2xs" />
                          <span className="w-0.5 h-1.5 bg-emerald-400/90 rounded-2xs" />
                          <span className="w-0.5 h-2 bg-emerald-400/90 rounded-2xs" />
                          <span className="w-0.5 h-2.5 bg-emerald-400 rounded-2xs animate-pulse" />
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Action Footer with Arrow Indicator */}
                  <div 
                    style={{ transform: !isReducedMotion ? 'translateZ(14px)' : undefined }}
                    className="pt-3 mt-3 border-t border-white/[0.08] flex items-center justify-between text-xs font-tech font-bold text-[#E10600] uppercase tracking-wider group-hover:text-white transition-colors"
                  >
                    <span>{channel.action}</span>
                    <ArrowUpRight className="w-3.5 h-3.5 text-[#E10600] group-hover:text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                  </div>
                </a>
              </Card3D>
            );
          })}
        </div>
      </div>

    </div>
  );
};
