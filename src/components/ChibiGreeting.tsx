import React, { useEffect, useState, useRef } from 'react';
import { domainAudio } from '../utils/audio';

interface ChibiGreetingProps {
  onComplete: () => void;
  onTypingComplete?: () => void;
  isReducedMotion: boolean;
}

export const ChibiGreeting: React.FC<ChibiGreetingProps> = ({ 
  onComplete, 
  onTypingComplete,
  isReducedMotion 
}) => {
  const [stage, setStage] = useState<'enter' | 'dissolve'>('enter');
  const [displayedText, setDisplayedText] = useState<string>('');
  const [isTyping, setIsTyping] = useState<boolean>(true);

  // Store stable callback refs so effect is completely decoupled from parent re-renders
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;
  const onTypingCompleteRef = useRef(onTypingComplete);
  onTypingCompleteRef.current = onTypingComplete;

  // Strict single-invocation guard: ensures greeting runs EXACTLY ONCE per sequence
  const hasInitiatedRef = useRef(false);

  // Exact required greeting
  const greetingText = "Hi and welcome! Feel free to explore my domain!";

  useEffect(() => {
    // Prevent duplicate triggers from parent re-render or state change
    if (hasInitiatedRef.current) return;
    hasInitiatedRef.current = true;

    if (isReducedMotion) {
      setDisplayedText(greetingText);
      setIsTyping(false);
      onTypingCompleteRef.current?.();
      const quickTimer = setTimeout(() => {
        setStage('dissolve');
        const completeTimer = setTimeout(() => onCompleteRef.current(), 220);
        return () => clearTimeout(completeTimer);
      }, 1000);
      return () => clearTimeout(quickTimer);
    }

    let index = 0;
    let timerId: NodeJS.Timeout | null = null;

    const typeNextChar = () => {
      index++;
      setDisplayedText(greetingText.slice(0, index));

      const currentChar = greetingText[index - 1];
      // Retro-RPG blip only for letters/numbers, skipping spaces and punctuation
      const isPunctuationOrSpace = /[\s!?,.'"]/.test(currentChar);
      if (currentChar && !isPunctuationOrSpace) {
        domainAudio.playTextBlip();
      }

      if (index < greetingText.length) {
        // Natural typing speed: 36ms per character with brief pauses at punctuation
        let delay = 36;
        if (currentChar === '!') {
          delay = 180; // Brief pause at exclamation mark
        } else if (currentChar === ',') {
          delay = 120; // Brief pause at comma
        }
        timerId = setTimeout(typeNextChar, delay);
      } else {
        // Typing is completely finished
        setIsTyping(false);
        // Signal that typing is finished so Skip Intro button can appear without re-triggering
        onTypingCompleteRef.current?.();

        // Keep complete greeting clearly readable for ~1.25s (~200ms faster than before)
        const holdTimer = setTimeout(() => {
          setStage('dissolve');
          // Smooth 0.25s dissolve before transition to void
          const completeTimer = setTimeout(() => {
            onCompleteRef.current();
          }, 250);
          return () => clearTimeout(completeTimer);
        }, 1250);

        timerId = holdTimer;
      }
    };

    // Short initial pause so character settles into view before typing starts
    const initialTimer = setTimeout(() => {
      typeNextChar();
    }, 150);

    return () => {
      clearTimeout(initialTimer);
      if (timerId) clearTimeout(timerId);
      domainAudio.stopAll();
    };
  }, [isReducedMotion]);

  return (
    <div 
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center p-4 sm:p-8 select-none transition-all duration-300 ${
        stage === 'dissolve' 
          ? 'opacity-0 scale-95 filter blur-xs' 
          : 'opacity-100 scale-100'
      }`}
      style={{
        backgroundColor: '#101626', // Deep midnight navy background
      }}
      role="region"
      aria-label="Welcome Greeting"
    >
      {/* Decorative anime grid in mint and lilac */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage: `
            radial-gradient(#F6B86F 1px, transparent 1px),
            linear-gradient(to right, rgba(168,230,212,0.12) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(175,160,255,0.1) 1px, transparent 1px)
          `,
          backgroundSize: '24px 24px, 48px 48px, 48px 48px'
        }}
      />

      {/* Subtle supernatural energy halo behind character in brand palette */}
      <div className="absolute w-[450px] h-[450px] rounded-full bg-[radial-gradient(circle,rgba(175,160,255,0.15)_0%,rgba(168,230,212,0.08)_45%,transparent_70%)] pointer-events-none -z-10" />

      {/* Main greeting composition */}
      <div className="relative z-10 flex flex-col md:flex-row items-center justify-center max-w-4xl w-full gap-6 md:gap-10">
        
        {/* Character Illustration (Rophe Angel) — Direct normal <img> element with object-fit: contain */}
        <div className="relative flex items-center justify-center min-w-[220px]">
          <img
            src="https://cdn.phototourl.com/member/2026-10-19-bbafa253-fa88-4173-b723-57ba3051548b.png"
            alt="Rophe Angel waving warmly in cozy streetwear"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = '/Waving_Anime_Girl_in_Cozy_Streetwear-removebg-preview.png';
            }}
            className="w-[200px] sm:w-[240px] md:w-[270px] h-auto object-contain drop-shadow-[0_10px_25px_rgba(16,22,38,0.9)] select-none"
            loading="eager"
            referrerPolicy="no-referrer"
          />
        </div>

        {/* Cyberpunk Dialogue Bubble with Liquid Glass */}
        <div className="w-full max-w-md relative">
          
          {/* Subtle speech arrow on desktop */}
          <div 
            className="hidden md:block absolute -left-3 top-1/2 -translate-y-1/2 w-0 h-0 border-y-[10px] border-y-transparent border-r-[12px] border-r-[rgba(16,22,38,0.9)] z-20"
          />

          <div 
            className="seance-panel rounded-2xl p-5 sm:p-6 border-2 border-[#A8E6D4]/40 shadow-2xl relative overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, rgba(16, 22, 38, 0.9) 0%, rgba(22, 30, 52, 0.8) 100%)',
              boxShadow: '0 12px 36px 0 rgba(0, 0, 0, 0.5), inset 0 1px 1px rgba(247, 240, 230, 0.15)'
            }}
          >
            {/* Top dialogue bar */}
            <div className="flex items-center justify-between pb-2 mb-3 border-b border-[#A8E6D4]/20">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#AFA0FF]" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#F6B86F]" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#A8E6D4]" />
              </div>
              <span className="text-xs font-tech font-bold text-[#A8E6D4] tracking-widest uppercase">
                COMM_LINK // ROPHE ANGEL
              </span>
            </div>

            {/* Typewritten Dialogue Message */}
            <div className="min-h-[70px] flex items-center">
              <p 
                className="font-cyber text-base sm:text-lg md:text-xl font-bold text-[#F7F0E6] leading-relaxed tracking-wide"
                style={{
                  textShadow: '0 0 12px rgba(175, 160, 255, 0.45)'
                }}
              >
                {displayedText}
                {isTyping && (
                  <span className="inline-block w-2.5 h-5 ml-1 bg-[#AFA0FF] align-middle animate-cyber-cursor shadow-[0_0_8px_#AFA0FF]" />
                )}
              </p>
            </div>

            {/* Bottom prompt indicator */}
            <div className="mt-3 pt-2 border-t border-[#A8E6D4]/15 flex items-center justify-between text-[11px] font-tech text-[#F7F0E6]/60">
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#A8E6D4] animate-ping" />
                <span>ONLINE</span>
              </span>
              <span className="tracking-wider uppercase text-[#F6B86F]">
                INITIATING DOMAIN
              </span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
