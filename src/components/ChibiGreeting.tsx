import React, { useEffect, useState, useRef } from 'react';
import { domainAudio } from '../utils/audio';
import { FastForward } from 'lucide-react';

interface ChibiGreetingProps {
  onComplete: () => void;
  onSkip?: () => void;
  onTypingComplete?: () => void;
  isReducedMotion: boolean;
}

export const ChibiGreeting: React.FC<ChibiGreetingProps> = ({ 
  onComplete, 
  onSkip,
  onTypingComplete,
  isReducedMotion 
}) => {
  const [stage, setStage] = useState<'enter' | 'dissolve'>('enter');
  const [displayedText, setDisplayedText] = useState<string>('');
  const [isTyping, setIsTyping] = useState<boolean>(true);

  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;
  const onTypingCompleteRef = useRef(onTypingComplete);
  onTypingCompleteRef.current = onTypingComplete;

  const hasInitiatedRef = useRef(false);

  // Exact iconic greeting dialogue
  const greetingText = "Hi and welcome! Feel free to explore my domain!";

  const hasFinishedRef = useRef(false);
  const activeTimerRef = useRef<NodeJS.Timeout | null>(null);

  const safeComplete = () => {
    if (hasFinishedRef.current) return;
    hasFinishedRef.current = true;
    if (activeTimerRef.current) {
      clearTimeout(activeTimerRef.current);
      activeTimerRef.current = null;
    }
    onCompleteRef.current();
  };

  useEffect(() => {
    if (hasInitiatedRef.current) return;
    hasInitiatedRef.current = true;

    if (isReducedMotion) {
      setDisplayedText(greetingText);
      setIsTyping(false);
      onTypingCompleteRef.current?.();
      activeTimerRef.current = setTimeout(() => {
        setStage('dissolve');
        activeTimerRef.current = setTimeout(() => safeComplete(), 180);
      }, 1000);
      return () => {
        if (activeTimerRef.current) clearTimeout(activeTimerRef.current);
      };
    }

    let index = 0;

    const typeNextChar = () => {
      if (hasFinishedRef.current) return;
      index++;
      setDisplayedText(greetingText.slice(0, index));

      const currentChar = greetingText[index - 1];
      const isPunctuationOrSpace = /[\s!?,.'"]/.test(currentChar);
      if (currentChar && !isPunctuationOrSpace) {
        domainAudio.playTextBlip();
      }

      if (index < greetingText.length) {
        let delay = 38;
        if (currentChar === '!') {
          delay = 180;
        } else if (currentChar === ',') {
          delay = 120;
        }
        activeTimerRef.current = setTimeout(typeNextChar, delay);
      } else {
        setIsTyping(false);
        onTypingCompleteRef.current?.();

        activeTimerRef.current = setTimeout(() => {
          setStage('dissolve');
          activeTimerRef.current = setTimeout(() => {
            safeComplete();
          }, 300);
        }, 1400);
      }
    };

    activeTimerRef.current = setTimeout(() => {
      typeNextChar();
    }, 200);

    return () => {
      if (activeTimerRef.current) clearTimeout(activeTimerRef.current);
    };
  }, [isReducedMotion]);

  const handleSkip = () => {
    if (hasFinishedRef.current) return;
    hasFinishedRef.current = true;
    if (activeTimerRef.current) {
      clearTimeout(activeTimerRef.current);
      activeTimerRef.current = null;
    }
    if (onSkip) {
      onSkip();
    } else {
      setStage('dissolve');
      activeTimerRef.current = setTimeout(() => {
        safeComplete();
      }, 150);
    }
  };

  return (
    <div 
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center p-4 sm:p-8 select-none transition-all duration-300 ${
        stage === 'dissolve' 
          ? 'opacity-0 scale-95 filter blur-xs pointer-events-none' 
          : 'opacity-100 scale-100'
      }`}
      style={{
        backgroundColor: '#0A0A0A',
      }}
      role="region"
      aria-label="Welcome Greeting"
    >
      {/* Subtle background telemetry grid */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-20 f1-telemetry-grid"
      />

      {/* Subtle red energy halo behind character */}
      <div className="absolute w-[460px] h-[460px] rounded-full bg-[radial-gradient(circle,rgba(225,6,0,0.16)_0%,transparent_70%)] pointer-events-none -z-10" />

      {/* Main greeting layout */}
      <div className="relative z-10 flex flex-col md:flex-row items-center justify-center max-w-4xl w-full gap-6 md:gap-10">
        
        {/* The Original Chibi Character Illustration */}
        <div className="relative flex items-center justify-center min-w-[220px]">
          <img
            src="/anime_ferrari_racing_girl_waving.png"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = 'https://plain-apac-prod-public.komododecks.com/202610/21/GPSa08uSkeSe4yG2qq6a/image.png';
            }}
            alt="Rophe Angel waving warmly in Ferrari racing jacket"
            className="w-[200px] sm:w-[240px] md:w-[270px] h-auto object-contain drop-shadow-[0_12px_36px_rgba(0,0,0,0.92)] select-none transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
            loading="eager"
          />
        </div>

        {/* Dialogue Box */}
        <div className="w-full max-w-md relative">
          
          <div 
            className="hidden md:block absolute -left-3 top-1/2 -translate-y-1/2 w-0 h-0 border-y-[10px] border-y-transparent border-r-[12px] border-r-[#141414] z-20"
          />

          <div 
            className="rounded-xl p-5 sm:p-6 border border-neutral-700 hover:border-[#E10600] transition-colors shadow-2xl relative overflow-hidden bg-[#121212]/95"
            style={{
              boxShadow: '0 16px 40px rgba(0, 0, 0, 0.8), inset 0 1px 1px rgba(255, 255, 255, 0.1)'
            }}
          >
            {/* Top dialogue bar */}
            <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-neutral-800">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#E10600]" />
                <span className="w-2.5 h-2.5 rounded-full bg-neutral-600" />
                <span className="w-2.5 h-2.5 rounded-full bg-neutral-800" />
              </div>
              <span className="text-xs font-tech font-bold text-[#E10600] tracking-widest uppercase">
                COMM_LINK · ROPHE ANGEL
              </span>
            </div>

            {/* Typewritten Dialogue Message */}
            <div className="min-h-[70px] flex items-center">
              <p 
                className="font-cyber text-base sm:text-lg md:text-xl font-bold text-[#FFFFFF] leading-relaxed tracking-wide"
                style={{
                  textShadow: '0 0 14px rgba(225, 6, 0, 0.35)'
                }}
              >
                {displayedText}
                {isTyping && (
                  <span className="inline-block w-2.5 h-5 ml-1 bg-[#E10600] align-middle animate-pulse shadow-[0_0_8px_#E10600]" />
                )}
              </p>
            </div>

            {/* Bottom prompt indicator */}
            <div className="mt-3 pt-2.5 border-t border-neutral-800 flex items-center justify-between text-[11px] font-tech text-neutral-400">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#E10600] animate-pulse" />
                <span>ONLINE</span>
              </span>
              <button
                onClick={handleSkip}
                className="tracking-wider uppercase text-[#E10600] font-semibold hover:underline cursor-pointer"
              >
                {isTyping ? 'CONNECTING...' : 'ENTER PORTFOLIO →'}
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
