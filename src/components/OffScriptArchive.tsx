import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Play, 
  Pause, 
  RotateCcw, 
  RotateCw, 
  SkipBack, 
  SkipForward, 
  Volume2, 
  VolumeX, 
  X, 
  Disc3,
  Music
} from 'lucide-react';
import { TextScramble } from './TextScramble';
import { domainAudio } from '../utils/audio';

export interface ArchiveCardItem {
  id: string;
  collection: 'grandstand' | 'on-repeat';
  title: string;
  artist?: string;
  descriptor: string;
  imageUrl?: string;
  fallbackUrl?: string;
  isQuoteOnly?: boolean;
  quote?: string;
  isSong?: boolean;
  audioUrl?: string;
}

// 01 — THE GRANDSTAND
// Dedicated quote card (only the quote) + 5 regular cards with personal descriptors.
const GRANDSTAND_ITEMS: ArchiveCardItem[] = [
  {
    id: 'grandstand-quote',
    collection: 'grandstand',
    title: '',
    descriptor: '',
    isQuoteOnly: true,
    quote: '“If through goes Hamilton, then so can you!”'
  },
  {
    id: 'grandstand-ferrari',
    collection: 'grandstand',
    title: 'Ferrari',
    descriptor: 'Favourite F1 Team',
    imageUrl: 'https://plain-apac-prod-public.komododecks.com/202610/22/DM6NX1g9Qh7b3QWLEtse/image.jpg',
    fallbackUrl: 'https://kommodo.ai/i/DM6NX1g9Qh7b3QWLEtse'
  },
  {
    id: 'grandstand-hamilton',
    collection: 'grandstand',
    title: 'Lewis Hamilton',
    descriptor: 'Favourite F1 Driver',
    imageUrl: 'https://plain-apac-prod-public.komododecks.com/202610/22/3WqZGt1Q1FUXDVokZg99/image.jpg',
    fallbackUrl: 'https://kommodo.ai/i/3WqZGt1Q1FUXDVokZg99'
  },
  {
    id: 'grandstand-barcelona',
    collection: 'grandstand',
    title: 'FC Barcelona',
    descriptor: 'Favourite Football Team',
    imageUrl: 'https://plain-apac-prod-public.komododecks.com/202610/22/Qp4CXb0EgEnDvX9GkYIk/image.jpg',
    fallbackUrl: 'https://kommodo.ai/i/Qp4CXb0EgEnDvX9GkYIk'
  },
  {
    id: 'grandstand-haaland',
    collection: 'grandstand',
    title: 'Erling Haaland',
    descriptor: 'Favourite Football Player',
    imageUrl: 'https://plain-apac-prod-public.komododecks.com/202610/22/IxXtIYnR3oOLUNVQyPyJ/image.jpg',
    fallbackUrl: 'https://kommodo.ai/i/IxXtIYnR3oOLUNVQyPyJ'
  },
  {
    id: 'grandstand-abu-dhabi',
    collection: 'grandstand',
    title: '2021 Abu Dhabi GP',
    descriptor: 'Favourite Race',
    imageUrl: 'https://plain-apac-prod-public.komododecks.com/202610/22/b8DFdxbOGUKWfF2POs57/image.jpg',
    fallbackUrl: 'https://kommodo.ai/i/b8DFdxbOGUKWfF2POs57'
  }
];

// 02 — ON REPEAT
// Malcolm Todd, Ado, YOASOBI, and the two playable Favourite Songs.
const ON_REPEAT_ITEMS: ArchiveCardItem[] = [
  {
    id: 'repeat-malcolm-todd',
    collection: 'on-repeat',
    title: 'Malcolm Todd',
    descriptor: 'Favourite Artist',
    imageUrl: 'https://plain-apac-prod-public.komododecks.com/202610/22/TF1ANMDjOQGJ4bLPXtdD/image.jpg',
    fallbackUrl: 'https://kommodo.ai/i/TF1ANMDjOQGJ4bLPXtdD'
  },
  {
    id: 'repeat-ado',
    collection: 'on-repeat',
    title: 'Ado',
    descriptor: 'Favourite Artist',
    imageUrl: 'https://plain-apac-prod-public.komododecks.com/202610/22/JAxjsGXdfII7xuMHBPtM/image.jpg',
    fallbackUrl: 'https://kommodo.ai/i/JAxjsGXdfII7xuMHBPtM'
  },
  {
    id: 'repeat-yoasobi',
    collection: 'on-repeat',
    title: 'YOASOBI',
    descriptor: 'Favourite Artist',
    imageUrl: 'https://plain-apac-prod-public.komododecks.com/202610/22/AWvqxVgYwI46jMpNRfgc/image.jpg',
    fallbackUrl: 'https://kommodo.ai/i/AWvqxVgYwI46jMpNRfgc'
  },
  {
    id: 'repeat-rosa-walton',
    collection: 'on-repeat',
    title: 'I Really Want to Stay at Your House',
    artist: 'Rosa Walton',
    descriptor: 'Favourite Song',
    isSong: true,
    audioUrl: 'https://www.image2url.com/r2/default/audio/1792668946074-844dd506-6596-4868-b965-fcf48adec352.mp3',
    imageUrl: 'https://plain-apac-prod-public.komododecks.com/202610/22/kCn0CIz4YAbW9AQt8Efm/image.jpg',
    fallbackUrl: 'https://kommodo.ai/i/kCn0CIz4YAbW9AQt8Efm'
  },
  {
    id: 'repeat-dean-martin',
    collection: 'on-repeat',
    title: 'Everybody Loves Somebody',
    artist: 'Dean Martin',
    descriptor: 'Favourite Song',
    isSong: true,
    audioUrl: 'https://www.image2url.com/r2/default/audio/1792670798296-10c2f2bf-b622-4cfd-b678-5f5dc5d9d542.mp3',
    imageUrl: 'https://plain-apac-prod-public.komododecks.com/202610/22/zsrizpVYSX0ADt9Z0kjj/image.jpg',
    fallbackUrl: 'https://kommodo.ai/i/zsrizpVYSX0ADt9Z0kjj'
  }
];

const SONG_ITEMS = ON_REPEAT_ITEMS.filter(it => it.isSong);

interface LiquidGlassCardProps {
  item: ArchiveCardItem;
  isReducedMotion: boolean;
  onSongClick?: (song: ArchiveCardItem) => void;
  isCurrentlyPlayingSong?: boolean;
}

const LiquidGlassCard: React.FC<LiquidGlassCardProps> = ({ 
  item, 
  isReducedMotion, 
  onSongClick,
  isCurrentlyPlayingSong
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({
    rotX: 0,
    rotY: 0,
    glareX: 50,
    glareY: 50,
    isHovered: false
  });

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isReducedMotion || e.pointerType === 'touch') return;
    const rect = e.currentTarget.getBoundingClientRect();
    if (!rect.width || !rect.height) return;

    const relX = (e.clientX - rect.left) / rect.width;
    const relY = (e.clientY - rect.top) / rect.height;

    const rotX = (0.5 - relY) * 18;
    const rotY = (relX - 0.5) * 18;

    setTilt({
      rotX,
      rotY,
      glareX: Math.round(relX * 100),
      glareY: Math.round(relY * 100),
      isHovered: true
    });
  };

  const handlePointerLeave = () => {
    setTilt({
      rotX: 0,
      rotY: 0,
      glareX: 50,
      glareY: 50,
      isHovered: false
    });
  };

  // Dedicated Quote-Only Card:
  // Strictly only the quote — no image, heading, label, icon, or other text.
  if (item.isQuoteOnly) {
    return (
      <div
        ref={cardRef}
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        className="w-[230px] sm:w-[260px] md:w-[280px] aspect-[4/5] rounded-2xl relative overflow-hidden shrink-0 transition-all duration-300 select-none flex items-center justify-center p-6 sm:p-8 cursor-default"
        style={{
          perspective: '1200px',
          transform: tilt.isHovered && !isReducedMotion
            ? `perspective(1200px) rotateX(${tilt.rotX.toFixed(2)}deg) rotateY(${tilt.rotY.toFixed(2)}deg) scale3d(1.03, 1.03, 1.03)`
            : 'perspective(1200px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)',
          transformStyle: 'preserve-3d',
          transition: tilt.isHovered ? 'transform 0.08s ease-out' : 'transform 0.4s ease-out, border-color 0.3s, box-shadow 0.3s',
          backgroundColor: 'rgba(255, 255, 255, 0.03)',
          borderWidth: '2px',
          borderStyle: 'solid',
          borderColor: tilt.isHovered ? '#E10600' : 'rgba(255, 255, 255, 0.12)',
          boxShadow: tilt.isHovered
            ? '0 25px 60px rgba(0,0,0,0.85), 0 0 35px rgba(225,6,0,0.4), inset 0 1px 1px rgba(255,255,255,0.2)'
            : '0 15px 40px rgba(0,0,0,0.7), inset 0 1px 1px rgba(255,255,255,0.1)'
        }}
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full bg-[radial-gradient(circle,_rgba(225,6,0,0.18)_0%,_transparent_70%)] pointer-events-none" />

        <div 
          className="absolute inset-0 pointer-events-none rounded-2xl transition-opacity duration-300 z-10"
          style={{
            opacity: tilt.isHovered ? 1 : 0,
            background: `radial-gradient(circle at ${tilt.glareX}% ${tilt.glareY}%, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0.03) 45%, transparent 70%)`
          }}
        />

        <p className="relative z-20 font-display text-xl sm:text-2xl md:text-3xl font-bold text-white tracking-tight leading-snug text-center">
          {item.quote}
        </p>
      </div>
    );
  }

  // Regular Card (Song cards are clickable; other regular cards are static)
  const isClickableSong = Boolean(item.isSong);

  return (
    <div
      ref={cardRef}
      onClick={() => {
        if (isClickableSong && onSongClick) {
          onSongClick(item);
        }
      }}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      role={isClickableSong ? 'button' : undefined}
      tabIndex={isClickableSong ? 0 : undefined}
      onKeyDown={(e) => {
        if (isClickableSong && onSongClick && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onSongClick(item);
        }
      }}
      className={`w-[230px] sm:w-[260px] md:w-[280px] aspect-[4/5] rounded-2xl relative overflow-hidden shrink-0 transition-all duration-300 select-none flex flex-col justify-end p-5 group ${
        isClickableSong ? 'cursor-pointer' : 'cursor-default'
      }`}
      style={{
        perspective: '1200px',
        transform: tilt.isHovered && !isReducedMotion
          ? `perspective(1200px) rotateX(${tilt.rotX.toFixed(2)}deg) rotateY(${tilt.rotY.toFixed(2)}deg) scale3d(1.03, 1.03, 1.03)`
          : 'perspective(1200px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)',
        transformStyle: 'preserve-3d',
        transition: tilt.isHovered ? 'transform 0.08s ease-out' : 'transform 0.4s ease-out, border-color 0.3s, box-shadow 0.3s',
        backgroundColor: 'rgba(255, 255, 255, 0.03)',
        borderWidth: '2px',
        borderStyle: 'solid',
        borderColor: isCurrentlyPlayingSong
          ? '#E10600'
          : tilt.isHovered 
            ? (isClickableSong ? '#E10600' : 'rgba(255, 255, 255, 0.3)')
            : 'rgba(255, 255, 255, 0.12)',
        boxShadow: isCurrentlyPlayingSong
          ? '0 25px 60px rgba(0,0,0,0.9), 0 0 35px rgba(225,6,0,0.5), inset 0 1px 1px rgba(255,255,255,0.25)'
          : tilt.isHovered
            ? '0 25px 60px rgba(0,0,0,0.85), 0 0 35px rgba(225,6,0,0.35), inset 0 1px 1px rgba(255,255,255,0.2)'
            : '0 15px 40px rgba(0,0,0,0.7), inset 0 1px 1px rgba(255,255,255,0.1)'
      }}
    >
      {/* Artwork Image Container */}
      <div className="absolute inset-0 overflow-hidden rounded-2xl">
        <img
          src={item.imageUrl}
          onError={(e) => {
            const target = e.currentTarget as HTMLImageElement;
            if (item.fallbackUrl && target.src !== item.fallbackUrl) {
              target.src = item.fallbackUrl;
            }
          }}
          alt={item.title}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 pointer-events-none brightness-90 group-hover:brightness-100"
        />
        {/* Editorial Legibility Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/45 to-transparent pointer-events-none" />
      </div>

      {/* Dynamic Liquid-Glass Glare Overlay */}
      <div 
        className="absolute inset-0 pointer-events-none rounded-2xl transition-opacity duration-300 z-10"
        style={{
          opacity: tilt.isHovered ? 1 : 0,
          background: `radial-gradient(circle at ${tilt.glareX}% ${tilt.glareY}%, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0.03) 45%, transparent 70%)`
        }}
      />

      {/* Playable Song Visual Cue (Top Right Badge) */}
      {isClickableSong && (
        <div className="absolute top-4 right-4 z-20">
          <div 
            className={`px-2.5 py-1 rounded-full backdrop-blur-md border text-[10px] font-mono tracking-wider flex items-center gap-1.5 transition-all shadow-md ${
              isCurrentlyPlayingSong
                ? 'bg-[#E10600] border-[#E10600] text-white shadow-[0_0_12px_rgba(225,6,0,0.8)]'
                : 'bg-black/60 border-white/20 text-neutral-300 group-hover:border-[#E10600] group-hover:text-white'
            }`}
          >
            {isCurrentlyPlayingSong ? (
              <>
                <span className="flex items-center gap-0.5 h-2.5">
                  <span className="w-0.5 h-2 bg-white animate-pulse" />
                  <span className="w-0.5 h-3 bg-white animate-bounce" />
                  <span className="w-0.5 h-1.5 bg-white animate-pulse" />
                </span>
                <span>PLAYING</span>
              </>
            ) : (
              <>
                <Play className="w-2.5 h-2.5 fill-current" />
                <span>PLAY</span>
              </>
            )}
          </div>
        </div>
      )}

      {/* Identifying Text & Subtle Personal Descriptor */}
      <div className="relative z-20">
        {item.artist && (
          <div className="text-[11px] font-mono text-[#E10600] font-semibold tracking-wide uppercase mb-0.5">
            {item.artist}
          </div>
        )}
        <h3 className="font-display text-lg sm:text-xl font-bold text-white tracking-tight leading-tight">
          {item.title}
        </h3>
        <div className="text-[11px] font-mono text-neutral-300 font-medium tracking-wide mt-1.5 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#E10600]" />
          <span>{item.descriptor}</span>
        </div>
      </div>
    </div>
  );
};

interface MiniMusicPlayerProps {
  currentSong: ArchiveCardItem;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
  onSeek: (seconds: number) => void;
  currentTime: number;
  duration: number;
  isMuted: boolean;
  onToggleMute: () => void;
}

const MiniMusicPlayer: React.FC<MiniMusicPlayerProps> = ({
  currentSong,
  isPlaying,
  onTogglePlay,
  onClose,
  onNext,
  onPrev,
  onSeek,
  currentTime,
  duration,
  isMuted,
  onToggleMute
}) => {
  const progressBarRef = useRef<HTMLDivElement>(null);
  const [isScrubbing, setIsScrubbing] = useState<boolean>(false);
  const [scrubPreviewTime, setScrubPreviewTime] = useState<number | null>(null);

  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return '0:00';
    const mins = Math.floor(secs / 60);
    const remainder = Math.floor(secs % 60);
    return `${mins}:${remainder.toString().padStart(2, '0')}`;
  };

  const handleSeekFromEvent = (e: React.MouseEvent<HTMLDivElement> | MouseEvent) => {
    const bar = progressBarRef.current;
    if (!bar || duration <= 0) return;
    const rect = bar.getBoundingClientRect();
    const clampedX = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const targetPercent = clampedX / rect.width;
    const targetTime = targetPercent * duration;
    onSeek(targetTime);
  };

  const handleProgressMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsScrubbing(true);
    handleSeekFromEvent(e);

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const bar = progressBarRef.current;
      if (!bar || duration <= 0) return;
      const rect = bar.getBoundingClientRect();
      const clampedX = Math.max(0, Math.min(moveEvent.clientX - rect.left, rect.width));
      const targetTime = (clampedX / rect.width) * duration;
      setScrubPreviewTime(targetTime);
    };

    const handleMouseUp = (upEvent: MouseEvent) => {
      setIsScrubbing(false);
      setScrubPreviewTime(null);
      handleSeekFromEvent(upEvent);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  const displayTime = scrubPreviewTime !== null ? scrubPreviewTime : currentTime;
  const progressPercent = duration > 0 ? Math.min(100, Math.max(0, (displayTime / duration) * 100)) : 0;

  return (
    <div 
      className="fixed bottom-5 sm:bottom-6 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-1.5rem)] sm:w-[500px] max-w-xl transition-all duration-300 animate-in fade-in slide-in-from-bottom-4"
    >
      <div className="relative w-full rounded-2xl bg-[#0A0A0A]/95 backdrop-blur-2xl border-2 border-white/20 p-4 sm:p-5 shadow-[0_25px_60px_rgba(0,0,0,0.95),0_0_35px_rgba(225,6,0,0.35),inset_0_1px_1px_rgba(255,255,255,0.2)]">
        
        {/* Subtle Ambient Red Glow */}
        <div className="absolute top-0 right-1/4 w-40 h-20 bg-[#E10600]/15 rounded-full blur-2xl pointer-events-none" />

        {/* Row 1: Album Art, Track Info & Close */}
        <div className="flex items-center gap-3.5 mb-3">
          {/* Album Art / Thumbnail */}
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl overflow-hidden border border-white/20 shrink-0 relative bg-black/60 shadow-md">
            <img 
              src={currentSong.imageUrl} 
              alt={currentSong.title} 
              className={`w-full h-full object-cover transition-transform duration-700 ${isPlaying ? 'scale-105' : ''}`}
            />
            {isPlaying && (
              <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                <Disc3 className="w-6 h-6 text-[#E10600] animate-spin" style={{ animationDuration: '4s' }} />
              </div>
            )}
          </div>

          {/* Title & Subtitle */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-[10px] font-mono text-[#E10600] font-bold uppercase tracking-wider">
                {currentSong.artist || 'FAVOURITE TRACK'}
              </span>
              <span className="text-neutral-500 text-xs">·</span>
              <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-wide">
                {currentSong.descriptor}
              </span>
            </div>
            <h4 className="font-display text-sm sm:text-base font-bold text-white tracking-tight truncate">
              {currentSong.title}
            </h4>
          </div>

          {/* Close Player Button */}
          <button
            onClick={onClose}
            aria-label="Close music player"
            className="p-2 rounded-lg bg-white/[0.06] hover:bg-white/[0.14] border border-white/10 text-neutral-400 hover:text-white transition-all cursor-pointer active:scale-95 shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Row 2: Progress Scrubber Timeline */}
        <div className="space-y-1 mb-3">
          <div 
            ref={progressBarRef}
            onMouseDown={handleProgressMouseDown}
            className="group relative w-full h-2 rounded-full bg-white/[0.08] hover:bg-white/[0.14] cursor-pointer transition-colors overflow-hidden"
          >
            {/* Played Fill Bar */}
            <div 
              className="h-full bg-[#E10600] relative rounded-full shadow-[0_0_8px_rgba(225,6,0,0.8)]"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* Timestamp row */}
          <div className="flex items-center justify-between text-[10px] font-mono text-neutral-400 px-0.5">
            <span>{formatTime(displayTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Row 3: Standard Playback Controls */}
        <div className="flex items-center justify-between pt-1 border-t border-white/[0.08]">
          {/* Left: Mute / Volume Button */}
          <button
            onClick={onToggleMute}
            aria-label={isMuted ? 'Unmute' : 'Mute'}
            className="p-2 rounded-lg bg-white/[0.04] hover:bg-white/[0.1] text-neutral-400 hover:text-white transition-colors cursor-pointer"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-[#E10600]" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {/* Center: Skip Prev, Seek -10s, Play/Pause, Seek +10s, Skip Next */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              onClick={onPrev}
              aria-label="Previous song"
              title="Previous song"
              className="p-2 rounded-lg hover:bg-white/[0.08] text-neutral-300 hover:text-white transition-colors cursor-pointer active:scale-95"
            >
              <SkipBack className="w-4 h-4" />
            </button>

            <button
              onClick={() => onSeek(Math.max(0, currentTime - 10))}
              aria-label="Rewind 10 seconds"
              title="Rewind 10s"
              className="p-2 rounded-lg hover:bg-white/[0.08] text-neutral-400 hover:text-white transition-colors cursor-pointer active:scale-95 text-xs font-mono"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            {/* Central Play/Pause Button */}
            <button
              onClick={onTogglePlay}
              aria-label={isPlaying ? 'Pause' : 'Play'}
              className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[#E10600] hover:bg-[#ff1e17] text-white flex items-center justify-center transition-all duration-200 cursor-pointer shadow-[0_0_15px_rgba(225,6,0,0.6)] active:scale-95 mx-1"
            >
              {isPlaying ? (
                <Pause className="w-5 h-5 fill-current" />
              ) : (
                <Play className="w-5 h-5 fill-current translate-x-0.5" />
              )}
            </button>

            <button
              onClick={() => onSeek(Math.min(duration, currentTime + 10))}
              aria-label="Forward 10 seconds"
              title="Forward 10s"
              className="p-2 rounded-lg hover:bg-white/[0.08] text-neutral-400 hover:text-white transition-colors cursor-pointer active:scale-95 text-xs font-mono"
            >
              <RotateCw className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={onNext}
              aria-label="Next song"
              title="Next song"
              className="p-2 rounded-lg hover:bg-white/[0.08] text-neutral-300 hover:text-white transition-colors cursor-pointer active:scale-95"
            >
              <SkipForward className="w-4 h-4" />
            </button>
          </div>

          {/* Right: Audio Frequency Indicator */}
          <div className="flex items-center gap-1 w-8 justify-end px-1" title="Playback active">
            {isPlaying ? (
              <span className="flex items-center gap-0.5 h-3">
                <span className="w-0.5 h-2 bg-[#E10600] animate-pulse" />
                <span className="w-0.5 h-3.5 bg-[#E10600] animate-bounce" />
                <span className="w-0.5 h-1.5 bg-[#E10600] animate-pulse" />
              </span>
            ) : (
              <Music className="w-3.5 h-3.5 text-neutral-600" />
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

interface OffScriptArchiveProps {
  isReducedMotion: boolean;
}

export const OffScriptArchive: React.FC<OffScriptArchiveProps> = ({ isReducedMotion }) => {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  const [activeCollection, setActiveCollection] = useState<'grandstand' | 'on-repeat'>('grandstand');

  // Drag interaction refs
  const isDraggingRef = useRef<boolean>(false);
  const startXRef = useRef<number>(0);
  const scrollLeftStartRef = useRef<number>(0);
  const hasMovedRef = useRef<boolean>(false);

  // --------------------------------------------------------------------------
  // MINI MUSIC PLAYER STATE & HTML AUDIO INSTANCE
  // --------------------------------------------------------------------------
  const [activeSong, setActiveSong] = useState<ArchiveCardItem | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [isPlayerMuted, setIsPlayerMuted] = useState<boolean>(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Ensure only one audio element exists and handles playback cleanly
  useEffect(() => {
    const audio = new Audio();
    audio.preload = 'metadata';
    audioRef.current = audio;

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleLoadedMetadata = () => {
      setDuration(audio.duration || 0);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
      domainAudio.setMiniPlayerPlaying(false);
    };

    const handleError = () => {
      setIsPlaying(false);
      domainAudio.setMiniPlayerPlaying(false);
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    return () => {
      audio.pause();
      domainAudio.setMiniPlayerPlaying(false);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
      audio.src = '';
    };
  }, []);

  // Play a designated song (pauses main BGM while playing)
  const playSong = useCallback((song: ArchiveCardItem) => {
    const audio = audioRef.current;
    if (!audio || !song.audioUrl) return;

    if (activeSong?.id === song.id && !audio.paused) {
      // Already playing this song -> pause
      audio.pause();
      setIsPlaying(false);
      domainAudio.setMiniPlayerPlaying(false);
      return;
    }

    // Switch song source if new song
    if (activeSong?.id !== song.id) {
      setActiveSong(song);
      audio.src = song.audioUrl;
      audio.currentTime = 0;
      setCurrentTime(0);
    }

    audio.muted = isPlayerMuted;
    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          setIsPlaying(true);
          domainAudio.setMiniPlayerPlaying(true);
        })
        .catch((err) => {
          console.warn('[OffScript] Playback deferred or blocked:', err);
          setIsPlaying(false);
          domainAudio.setMiniPlayerPlaying(false);
        });
    }
  }, [activeSong, isPlayerMuted]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio || !activeSong) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
      domainAudio.setMiniPlayerPlaying(false);
    } else {
      audio.play()
        .then(() => {
          setIsPlaying(true);
          domainAudio.setMiniPlayerPlaying(true);
        })
        .catch(() => {
          setIsPlaying(false);
          domainAudio.setMiniPlayerPlaying(false);
        });
    }
  };

  const closePlayer = () => {
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
    }
    setIsPlaying(false);
    setActiveSong(null);
    domainAudio.setMiniPlayerPlaying(false);
  };

  const seekAudio = (seconds: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = seconds;
    setCurrentTime(seconds);
  };

  const togglePlayerMute = () => {
    const audio = audioRef.current;
    if (!audio) return;
    const nextMute = !isPlayerMuted;
    setIsPlayerMuted(nextMute);
    audio.muted = nextMute;
  };

  const nextSong = () => {
    if (!activeSong) return;
    const currentIdx = SONG_ITEMS.findIndex(s => s.id === activeSong.id);
    const nextIdx = (currentIdx + 1) % SONG_ITEMS.length;
    playSong(SONG_ITEMS[nextIdx]);
  };

  const prevSong = () => {
    if (!activeSong) return;
    const currentIdx = SONG_ITEMS.findIndex(s => s.id === activeSong.id);
    const prevIdx = (currentIdx - 1 + SONG_ITEMS.length) % SONG_ITEMS.length;
    playSong(SONG_ITEMS[prevIdx]);
  };

  // --------------------------------------------------------------------------
  // TRACK SCROLL & COLLECTION SYNC
  // --------------------------------------------------------------------------
  const updateActiveCollectionFromScroll = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;

    const repeatAnchor = track.querySelector('[data-collection-anchor="on-repeat"]') as HTMLElement | null;
    if (!repeatAnchor) return;

    const threshold = repeatAnchor.offsetLeft - 120;
    if (track.scrollLeft >= threshold) {
      setActiveCollection('on-repeat');
    } else {
      setActiveCollection('grandstand');
    }
  }, []);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const handleScroll = () => {
      updateActiveCollectionFromScroll();
    };

    track.addEventListener('scroll', handleScroll, { passive: true });
    return () => track.removeEventListener('scroll', handleScroll);
  }, [updateActiveCollectionFromScroll]);

  // Convert vertical wheel to horizontal scroll inside reel without trapping page at boundaries
  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    const track = trackRef.current;
    if (!track) return;

    const maxScroll = track.scrollWidth - track.clientWidth;
    if (maxScroll <= 0) return;

    if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;

    const atStart = track.scrollLeft <= 2 && e.deltaY < 0;
    const atEnd = track.scrollLeft >= maxScroll - 2 && e.deltaY > 0;

    if (atStart || atEnd) return;

    e.preventDefault();
    track.scrollLeft += e.deltaY * 1.15;
  };

  // Pointer drag interactions
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    const track = trackRef.current;
    if (!track) return;

    isDraggingRef.current = true;
    hasMovedRef.current = false;
    startXRef.current = e.clientX;
    scrollLeftStartRef.current = track.scrollLeft;
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) return;
    const track = trackRef.current;
    if (!track) return;

    const dx = e.clientX - startXRef.current;
    if (Math.abs(dx) > 6) {
      hasMovedRef.current = true;
    }
    track.scrollLeft = scrollLeftStartRef.current - dx;
  };

  const handlePointerUp = () => {
    isDraggingRef.current = false;
  };

  const scrollToCollection = (coll: 'grandstand' | 'on-repeat') => {
    const track = trackRef.current;
    if (!track) return;

    const targetEl = track.querySelector(`[data-collection-anchor="${coll}"]`);
    if (targetEl) {
      const elLeft = (targetEl as HTMLElement).offsetLeft;
      track.scrollTo({
        left: elLeft - 24,
        behavior: isReducedMotion ? 'auto' : 'smooth'
      });
      setActiveCollection(coll);
    }
  };

  const scrollStep = (direction: 'left' | 'right') => {
    const track = trackRef.current;
    if (!track) return;
    const offset = direction === 'left' ? -340 : 340;
    track.scrollBy({ left: offset, behavior: isReducedMotion ? 'auto' : 'smooth' });
  };

  return (
    <section
      ref={sectionRef}
      id="off-script"
      className="relative w-full pt-10 pb-12 sm:pt-14 sm:pb-16 max-w-6xl mx-auto px-4 sm:px-6 lg:px-12 overflow-visible"
    >
      {/* ===================== SECTION HEADER ===================== */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6 sm:mb-8">
        <div>
          <div className="flex flex-wrap items-center gap-2 text-xs font-tech font-bold uppercase tracking-widest text-[#E10600] mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#E10600] shadow-[0_0_8px_rgba(225,6,0,0.8)]" />
            <span>09 // OFF-SCRIPT ARCHIVE</span>
            <span className="text-neutral-600">·</span>
            <span className="text-neutral-400 font-mono text-[11px]">PARALLAX REEL</span>
          </div>

          <TextScramble
            as="h2"
            text="OFF-SCRIPT ARCHIVE"
            triggerOnView={true}
            isReducedMotion={isReducedMotion}
            className="font-display text-3xl sm:text-5xl font-bold text-[#FFFFFF] tracking-tight block"
          />

          <p className="font-body text-xs sm:text-sm text-neutral-400 mt-1 max-w-xl">
            Trackside loyalties and uncurated rotations. Click any song card to launch playback.
          </p>
        </div>

        {/* Step Controls */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => scrollStep('left')}
            aria-label="Scroll left in archive"
            className="p-2 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-neutral-300 hover:text-white transition-all cursor-pointer active:scale-95"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => scrollStep('right')}
            aria-label="Scroll right in archive"
            className="p-2 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-neutral-300 hover:text-white transition-all cursor-pointer active:scale-95"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ===================== COLLECTION MILESTONE TABS ===================== */}
      <div className="flex items-center gap-2 mb-5 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => scrollToCollection('grandstand')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-tech font-bold tracking-wider transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
            activeCollection === 'grandstand'
              ? 'bg-[#E10600] text-white shadow-[0_0_12px_rgba(225,6,0,0.4)] border border-[#E10600]'
              : 'bg-white/[0.04] text-neutral-400 hover:text-white border border-white/[0.08]'
          }`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-white" />
          <span>01 // THE GRANDSTAND</span>
        </button>

        <button
          onClick={() => scrollToCollection('on-repeat')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-tech font-bold tracking-wider transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
            activeCollection === 'on-repeat'
              ? 'bg-[#E10600] text-white shadow-[0_0_12px_rgba(225,6,0,0.4)] border border-[#E10600]'
              : 'bg-white/[0.04] text-neutral-400 hover:text-white border border-white/[0.08]'
          }`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-white" />
          <span>02 // ON REPEAT</span>
        </button>

        <span className="text-[11px] font-mono text-neutral-500 ml-auto hidden sm:inline">
          Drag horizontally · Click song to listen
        </span>
      </div>

      {/* ===================== HORIZONTAL SCROLL REEL ===================== */}
      <div
        ref={trackRef}
        onWheel={handleWheel}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className="w-full overflow-x-auto overflow-y-hidden select-none cursor-grab active:cursor-grabbing pb-4 touch-pan-x scrollbar-none"
        style={{ scrollBehavior: isDraggingRef.current ? 'auto' : 'smooth' }}
      >
        <div className="inline-flex items-stretch gap-5 py-2">
          
          {/* ========================================================= */}
          {/* COLLECTION 01: THE GRANDSTAND                             */}
          {/* Dedicated Quote Card (only quote) + 5 Static Cards        */}
          {/* ========================================================= */}
          <div data-collection-anchor="grandstand" className="inline-flex items-stretch gap-5">
            {GRANDSTAND_ITEMS.map((item) => (
              <LiquidGlassCard
                key={item.id}
                item={item}
                isReducedMotion={isReducedMotion}
              />
            ))}
          </div>

          {/* Clean Vertical Glass Divider */}
          <div className="w-px bg-gradient-to-b from-transparent via-white/20 to-transparent my-6 shrink-0 mx-2" />

          {/* ========================================================= */}
          {/* COLLECTION 02: ON REPEAT                                  */}
          {/* Malcolm Todd, Ado, YOASOBI, and the 2 Playable Songs      */}
          {/* ========================================================= */}
          <div data-collection-anchor="on-repeat" className="inline-flex items-stretch gap-5">
            {ON_REPEAT_ITEMS.map((item) => (
              <LiquidGlassCard
                key={item.id}
                item={item}
                isReducedMotion={isReducedMotion}
                onSongClick={playSong}
                isCurrentlyPlayingSong={activeSong?.id === item.id && isPlaying}
              />
            ))}
          </div>

        </div>
      </div>

      {/* ===================== COMPACT LIQUID-GLASS MINI MUSIC PLAYER ===================== */}
      {activeSong && (
        <MiniMusicPlayer
          currentSong={activeSong}
          isPlaying={isPlaying}
          onTogglePlay={togglePlay}
          onClose={closePlayer}
          onNext={nextSong}
          onPrev={prevSong}
          onSeek={seekAudio}
          currentTime={currentTime}
          duration={duration}
          isMuted={isPlayerMuted}
          onToggleMute={togglePlayerMute}
        />
      )}
    </section>
  );
};
