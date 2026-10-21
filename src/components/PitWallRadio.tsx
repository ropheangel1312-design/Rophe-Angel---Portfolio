import React, { useState, useEffect, useRef } from 'react';
import { Radio, VolumeX, Volume2, AlertTriangle, CheckCircle, Wifi, RefreshCw } from 'lucide-react';
import { domainAudio } from '../utils/audio';

interface PitWallRadioProps {
  isReducedMotion: boolean;
  isMuted: boolean;
  onToggleMute?: () => void;
  onChannelOpened?: (isOpen: boolean) => void;
  isInView: boolean;
}

type RadioStatus = 'idle' | 'connecting' | 'transmitting' | 'open' | 'error' | 'muted-notice';

export const PitWallRadio: React.FC<PitWallRadioProps> = ({
  isReducedMotion,
  isMuted,
  onToggleMute,
  onChannelOpened,
  isInView
}) => {
  const [status, setStatus] = useState<RadioStatus>('idle');
  const [statusMessage, setStatusMessage] = useState<string>('SECURE PIT-TO-CAR TELEMETRY READY');
  const [isWaveformActive, setIsWaveformActive] = useState<boolean>(false);
  const isPlayingRef = useRef<boolean>(false);

  // If user scrolls away from Contact section while transmitting or connecting, stop and reset
  useEffect(() => {
    if (!isInView) {
      if (isPlayingRef.current || status === 'connecting' || status === 'transmitting') {
        domainAudio.stopRadioCheck(true);
        isPlayingRef.current = false;
        setStatus('idle');
        setStatusMessage('SECURE PIT-TO-CAR TELEMETRY READY');
        setIsWaveformActive(false);
        onChannelOpened?.(false);
      }
    }
  }, [isInView, status, onChannelOpened]);

  // If audio gets muted during active transmission, immediately stop and reset
  useEffect(() => {
    if (isMuted && (isPlayingRef.current || status === 'connecting' || status === 'transmitting')) {
      domainAudio.stopRadioCheck(true);
      isPlayingRef.current = false;
      setStatus('muted-notice');
      setStatusMessage('RADIO SILENCE // AUDIO IS MUTED');
      setIsWaveformActive(false);
      onChannelOpened?.(false);
    }
  }, [isMuted, status, onChannelOpened]);

  const handleRadioCheck = () => {
    // 1. Check if muted
    if (isMuted) {
      setStatus('muted-notice');
      setStatusMessage('RADIO SILENCE // AUDIO IS MUTED. PLEASE UNMUTE TO RECEIVE TRANSMISSION.');
      return;
    }

    // 2. Prevent overlapping transmissions
    if (isPlayingRef.current || status === 'connecting' || status === 'transmitting') {
      return;
    }

    isPlayingRef.current = true;
    setStatus('connecting');
    setStatusMessage('ESTABLISHING CONNECTION…');
    setIsWaveformActive(false);

    domainAudio.playRadioCheck({
      onStart: () => {
        setStatus('connecting');
        setStatusMessage('ESTABLISHING CONNECTION…');
      },
      onPlaying: () => {
        setStatus('transmitting');
        setStatusMessage('TRANSMITTING // PIT WALL TO DRIVER');
      },
      onEnded: () => {
        isPlayingRef.current = false;
        setStatus('open');
        setStatusMessage('CHANNEL OPEN // COMMS LINK VERIFIED');
        setIsWaveformActive(true);
        onChannelOpened?.(true);
      },
      onError: (err) => {
        isPlayingRef.current = false;
        setIsWaveformActive(false);
        if (err === 'muted') {
          setStatus('muted-notice');
          setStatusMessage('RADIO SILENCE // AUDIO IS MUTED.');
        } else {
          setStatus('error');
          setStatusMessage('COMMS LINK OFFLINE // TAP TO RETRY');
        }
        onChannelOpened?.(false);
      }
    });
  };

  const handleUnmuteAndPlay = () => {
    if (onToggleMute) {
      onToggleMute();
    }
    // Give audio manager a frame to unmute then trigger radio check
    setTimeout(() => {
      domainAudio.setMuted(false);
      handleRadioCheck();
    }, 50);
  };

  // Waveform telemetry bars configuration (26 frequency channels)
  const barCount = 26;
  const bars = Array.from({ length: barCount }, (_, i) => {
    // Parabolic bell curve for telemetry frequencies
    const norm = (i - barCount / 2) / (barCount / 2);
    const weight = 1 - norm * norm * 0.65;
    return weight;
  });

  return (
    <div 
      className="f1-card rounded-xl p-4 sm:p-5 mb-8 border border-white/[0.08] relative overflow-hidden transition-all shadow-xl"
      role="region"
      aria-label="Ferrari Pit Wall Radio Audio Telemetry"
    >
      {/* Background motorsport telemetry grid scanline accent */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[linear-gradient(rgba(255,255,255,0.8)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.8)_1px,transparent_1px)] bg-[size:16px_16px]" 
        aria-hidden="true"
      />

      {/* Header bar: Telemetry status & live channel frequency */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/[0.06] mb-4 text-xs font-tech">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded bg-white/[0.05] border border-white/[0.1] text-[#E10600]">
            <Radio className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <div className="font-bold text-[#FFFFFF] tracking-wider uppercase text-[11px] sm:text-xs flex items-center gap-2">
              <span>FERRARI PIT WALL RADIO</span>
              <span className="text-neutral-600">/</span>
              <span className="text-[#E10600]">COMMS TELEMETRY</span>
            </div>
            <div className="text-[10px] text-neutral-400 font-mono tracking-tight">
              FREQ: 446.006 MHz · ENCRYPTED DUAL-BAND
            </div>
          </div>
        </div>

        {/* Live Channel Status Badge */}
        <div className="flex items-center gap-2">
          <span 
            className={`w-2 h-2 rounded-full ${
              status === 'open' 
                ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]' 
                : status === 'connecting' || status === 'transmitting'
                ? 'bg-[#E10600] animate-ping'
                : status === 'error' || status === 'muted-notice'
                ? 'bg-amber-500'
                : 'bg-neutral-600'
            }`}
            aria-hidden="true"
          />
          <span className={`text-[11px] font-bold uppercase tracking-widest ${
            status === 'open' 
              ? 'text-emerald-400' 
              : status === 'connecting' || status === 'transmitting'
              ? 'text-[#E10600]'
              : status === 'error' || status === 'muted-notice'
              ? 'text-amber-400'
              : 'text-neutral-400'
          }`}>
            {status === 'open' 
              ? 'CHANNEL OPEN' 
              : status === 'connecting'
              ? 'CONNECTING…'
              : status === 'transmitting'
              ? 'TRANSMITTING'
              : status === 'muted-notice'
              ? 'MUTED'
              : status === 'error'
              ? 'OFFLINE'
              : 'STANDBY'}
          </span>
        </div>
      </div>

      {/* Middle row: Interactive Radio Check Button + Live Waveform Display */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
        
        {/* Radio Check Button */}
        <div className="md:col-span-5 flex flex-col gap-2">
          <button
            onClick={handleRadioCheck}
            disabled={status === 'connecting' || status === 'transmitting'}
            aria-busy={status === 'connecting' || status === 'transmitting'}
            className={`w-full py-3 px-4 rounded font-tech text-xs sm:text-sm font-bold tracking-widest uppercase inline-flex items-center justify-center gap-2.5 transition-all cursor-pointer focus:outline-hidden focus:ring-2 focus:ring-[#E10600] ${
              status === 'connecting' || status === 'transmitting'
                ? 'bg-neutral-800 text-neutral-400 border border-neutral-700 cursor-not-allowed opacity-80'
                : status === 'open'
                ? 'f1-btn-secondary border-emerald-500/40 hover:border-emerald-500 text-[#FFFFFF]'
                : status === 'error'
                ? 'f1-btn-secondary border-amber-500/40 text-amber-300'
                : 'f1-btn-primary'
            }`}
          >
            {status === 'connecting' || status === 'transmitting' ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-[#E10600]" />
                <span>{status === 'connecting' ? 'ESTABLISHING CONNECTION…' : 'TRANSMITTING…'}</span>
              </>
            ) : status === 'open' ? (
              <>
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                <span>RADIO CHECK VERIFIED</span>
              </>
            ) : status === 'error' ? (
              <>
                <RefreshCw className="w-4 h-4 text-amber-400" />
                <span>RETRY RADIO CHECK</span>
              </>
            ) : (
              <>
                <Wifi className="w-4 h-4 text-[#FFFFFF]" />
                <span>RADIO CHECK</span>
              </>
            )}
          </button>

          {/* Subtitle status readout */}
          <div className="text-[11px] font-tech text-neutral-400 flex items-center justify-between px-1">
            <span className="truncate">{statusMessage}</span>
            {status === 'open' && (
              <span className="text-emerald-400 font-semibold shrink-0">100% LINKED</span>
            )}
          </div>
        </div>

        {/* Telemetry Audio Waveform Panel */}
        <div className="md:col-span-7 bg-[#0A0A0A]/80 border border-white/[0.08] rounded-lg p-3 sm:p-3.5 flex flex-col justify-center gap-2">
          <div className="flex items-center justify-between text-[10px] font-tech text-neutral-400 uppercase tracking-wider">
            <span>PIT WALL AUDIO WAVEFORM</span>
            <span className="font-mono text-neutral-500">
              {isWaveformActive ? 'SIGNAL ACTIVE · 24-BIT' : 'CARRIER STANDBY'}
            </span>
          </div>

          {/* 26-Channel Dynamic Telemetry Waveform Bars */}
          <div 
            className="h-10 sm:h-12 flex items-center justify-between gap-1 px-1 overflow-hidden" 
            aria-hidden="true"
          >
            {bars.map((weight, i) => {
              // Active transmitting animation heights
              const isTransmitting = status === 'transmitting' || status === 'connecting';
              const isOpen = status === 'open' && isWaveformActive;

              let minH = 4;
              let maxH = 6;
              let animClass = '';
              let barColor = 'bg-neutral-800';

              if (isTransmitting) {
                minH = 8;
                maxH = Math.floor(weight * 36) + 6;
                barColor = i % 2 === 0 ? 'bg-[#E10600]' : 'bg-[#FFFFFF]';
                animClass = !isReducedMotion ? 'animate-pulse' : '';
              } else if (isOpen) {
                minH = 10;
                maxH = Math.floor(weight * 26) + 8;
                barColor = 'bg-gradient-to-t from-[#E10600] to-emerald-400';
              } else if (status === 'error' || status === 'muted-notice') {
                minH = 3;
                maxH = 3;
                barColor = 'bg-neutral-800';
              }

              const dynamicHeight = isOpen 
                ? `${Math.max(minH, maxH * (0.55 + 0.45 * Math.sin((i + Date.now() / 300) * 0.8)))}px`
                : isTransmitting
                ? `${Math.max(minH, maxH * (0.4 + 0.6 * Math.sin((i * 1.5 + Date.now() / 200))))}px`
                : `${minH}px`;

              return (
                <div
                  key={i}
                  className={`w-full rounded-xs transition-all duration-150 ${barColor} ${animClass}`}
                  style={{
                    height: dynamicHeight,
                    opacity: isOpen ? 0.95 : isTransmitting ? 0.85 : 0.4
                  }}
                />
              );
            })}
          </div>
        </div>

      </div>

      {/* Muted Warning Notification Banner (Displayed when visitor clicks while muted) */}
      {status === 'muted-notice' && (
        <div className="mt-3 p-2.5 rounded bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs font-tech flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <VolumeX className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Audio is currently muted. Unmute to hear the Pit Wall radio check and background music.</span>
          </div>
          {onToggleMute && (
            <button
              onClick={handleUnmuteAndPlay}
              className="px-2.5 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-100 font-bold uppercase tracking-wider text-[11px] border border-amber-500/40 cursor-pointer transition-all"
            >
              Unmute & Play
            </button>
          )}
        </div>
      )}
    </div>
  );
};
