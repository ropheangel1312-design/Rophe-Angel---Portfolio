import React from 'react';

export type CatState = 'walking' | 'idle' | 'curious' | 'purring' | 'dragging' | 'falling' | 'landing';

export interface MikeySpriteProps {
  catState?: CatState;
  isBlinking?: boolean;
  pawStep?: number;
  facingLeft?: boolean;
  idPrefix?: string;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * MikeySprite — The Canonical Grey Tabby Cat SVG Illustration
 * 
 * Accurately renders Mikey with:
 * - Silver-to-slate grey gradient coat
 * - Dark charcoal tabby stripes (torso, tail, cheeks)
 * - Distinct grey tabby 'M' marking on forehead
 * - Soft silvery-cream underbelly, chest, and muzzle
 * - Almond emerald green-gold feline eyes with dark vertical pupils & white glints
 * - Cute pink nose and delicate white whiskers
 * - Expressive animated swishing tail and curious head tilts
 */
export const MikeySprite: React.FC<MikeySpriteProps> = ({
  catState = 'idle',
  isBlinking = false,
  pawStep = 0,
  facingLeft = false,
  idPrefix = 'cat_',
  className = '',
  style = {}
}) => {
  const bodyGradId = `${idPrefix}greyTabbyBodyGrad`;
  const creamGradId = `${idPrefix}greyTabbyCreamGrad`;
  const eyeGradId = `${idPrefix}greyTabbyEyeGrad`;

  return (
    <div
      style={{
        transform: `scaleX(${facingLeft ? -1 : 1})`,
        transformOrigin: 'center center',
        transition: catState === 'dragging' || catState === 'falling' ? 'none' : 'transform 0.22s ease-out',
        ...style
      }}
      className={`relative select-none ${className}`}
    >
      <div
        className={`w-full h-full relative ${
          catState === 'walking' ? 'animate-cat-stride' : ''
        } ${catState === 'purring' ? 'animate-cat-purr' : ''} ${
          catState === 'dragging' ? 'animate-cat-carried' : ''
        } ${catState === 'falling' ? 'animate-cat-falling' : ''} ${
          catState === 'landing' ? 'animate-cat-landing' : ''
        }`}
        style={{ transformOrigin: 'center bottom' }}
      >
        <svg
          viewBox="0 0 64 48"
          className="w-full h-full drop-shadow-[0_8px_20px_rgba(0,0,0,0.85)]"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
        <defs>
          {/* Primary Silver-to-Slate Grey Body Gradient */}
          <linearGradient id={bodyGradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#9CA2AA" />
            <stop offset="55%" stopColor="#787E8A" />
            <stop offset="100%" stopColor="#555B66" />
          </linearGradient>

          {/* Soft Silvery-Cream Chest & Muzzle Gradient */}
          <linearGradient id={creamGradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#F6F8FA" />
            <stop offset="100%" stopColor="#D9DDE3" />
          </linearGradient>

          {/* Emerald Green-Gold Eyes Gradient */}
          <linearGradient id={eyeGradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6BC24A" />
            <stop offset="100%" stopColor="#439A3C" />
          </linearGradient>
        </defs>

        {/* Back Paws */}
        <ellipse
          cx={pawStep === 1 || catState === 'dragging' ? '16' : '18'}
          cy={catState === 'dragging' || catState === 'falling' ? '41.5' : '43'}
          rx="4.2"
          ry="2.7"
          fill="#DCE1E7"
          stroke="#7E8590"
          strokeWidth="0.5"
        />
        <ellipse
          cx={pawStep === 3 || catState === 'dragging' ? '42' : '40'}
          cy={catState === 'dragging' || catState === 'falling' ? '41.5' : '43'}
          rx="4.2"
          ry="2.7"
          fill="#DCE1E7"
          stroke="#7E8590"
          strokeWidth="0.5"
        />

        {/* Animated Swishing Grey Tabby Tail with Charcoal Stripes */}
        <g
          className={
            catState === 'walking'
              ? 'animate-cat-tail-walk'
              : 'animate-cat-tail-idle'
          }
          style={{ transformOrigin: '12px 30px' }}
        >
          {/* Tail Base */}
          <path
            d={
              catState === 'falling'
                ? "M12 30 C 8 22, 5 14, 8 7 C 9 4, 12 5, 12 8 C 11 12, 12 18, 14 26"
                : "M12 30 C 6 26, 2 20, 4 13 C 5 9, 8 7, 9 10 C 8 13, 8 18, 14 26"
            }
            stroke="#787E8A"
            strokeWidth="4.2"
            strokeLinecap="round"
          />
          {/* Distinct Charcoal Tabby Tail Stripes */}
          <path d="M4 16 L7 18" stroke="#2B2F36" strokeWidth="2.6" strokeLinecap="round" />
          <path d="M6 21 L10 23" stroke="#2B2F36" strokeWidth="2.6" strokeLinecap="round" />
          {/* Dark slate tail tip */}
          <path d="M6 10 C 7 8, 9 8, 9 10" stroke="#202329" strokeWidth="4.2" strokeLinecap="round" />
        </g>

        {/* Main Cat Torso */}
        <ellipse
          cx="28"
          cy="31"
          rx="18"
          ry="11"
          fill={`url(#${bodyGradId})`}
        />

        {/* Charcoal Grey Tabby Stripes on Torso */}
        <path d="M20 22 Q 22 26 21 30" stroke="#2D3139" strokeWidth="2" strokeLinecap="round" />
        <path d="M26 21 Q 28 26 27 32" stroke="#2D3139" strokeWidth="2" strokeLinecap="round" />
        <path d="M32 21 Q 34 26 33 31" stroke="#2D3139" strokeWidth="2" strokeLinecap="round" />
        <path d="M38 23 Q 39 27 38 31" stroke="#2D3139" strokeWidth="2" strokeLinecap="round" />

        {/* Soft Silvery Underbelly & Chest */}
        <ellipse
          cx="31"
          cy="35"
          rx="12.5"
          ry="6.2"
          fill={`url(#${creamGradId})`}
        />

        {/* Front Paws */}
        <ellipse
          cx={pawStep === 0 ? '22' : '20'}
          cy={catState === 'dragging' || catState === 'falling' ? '42' : '43.5'}
          rx="4.4"
          ry="3"
          fill="#F4F6F9"
          stroke="#A2A9B2"
          strokeWidth="0.5"
        />
        <ellipse
          cx={pawStep === 2 ? '37' : '35'}
          cy={catState === 'dragging' || catState === 'falling' ? '42' : '43.5'}
          rx="4.4"
          ry="3"
          fill="#F4F6F9"
          stroke="#A2A9B2"
          strokeWidth="0.5"
        />

        {/* Cat Head Group */}
        <g
          className={
            catState === 'curious' || catState === 'dragging'
              ? 'animate-cat-head-curious'
              : 'animate-cat-head-idle'
          }
          style={{ transformOrigin: '42px 20px' }}
        >
          {/* Left Ear */}
          <polygon points="36,13 41,2 45,11" fill="#6E747F" />
          <polygon points="37.5,12 41,5 44,11" fill="#DE979C" />

          {/* Right Ear */}
          <polygon points="45,12 49,3 54,14" fill="#6E747F" />
          <polygon points="46.5,12 49.5,5.5 53,13" fill="#DE979C" />

          {/* Head Base (Silver-Slate Grey) */}
          <circle cx="44" cy="20" r="10" fill={`url(#${bodyGradId})`} />

          {/* Distinct Grey Tabby 'M' Marking on Forehead */}
          <path
            d="M40 13 L42 16 L44 14 L46 16 L48 13"
            stroke="#22252C"
            strokeWidth="1.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path d="M44 11 L44 13" stroke="#22252C" strokeWidth="1.4" strokeLinecap="round" />

          {/* Cheeks Tabby Stripes */}
          <path d="M37 20 L35 21" stroke="#2D3139" strokeWidth="1.3" strokeLinecap="round" />
          <path d="M37 22 L35 23" stroke="#2D3139" strokeWidth="1.3" strokeLinecap="round" />
          <path d="M51 20 L53 21" stroke="#2D3139" strokeWidth="1.3" strokeLinecap="round" />
          <path d="M51 22 L53 23" stroke="#2D3139" strokeWidth="1.3" strokeLinecap="round" />

          {/* Light Silver Muzzle */}
          <ellipse cx="44" cy="23.5" rx="5" ry="3.5" fill={`url(#${creamGradId})`} />

          {/* Cat Eyes */}
          {isBlinking || catState === 'purring' ? (
            // Happy curved blink lines
            <g stroke="#1C1F25" strokeWidth="1.5" strokeLinecap="round">
              <path d="M39.5 19 Q 41.5 17 43 19" />
              <path d="M46 19 Q 47.5 17 49.5 19" />
            </g>
          ) : (
            // Almond Green-Gold Eyes with dark vertical feline pupils & glint
            <g>
              {/* Left Eye */}
              <ellipse cx="41" cy="18.5" rx="2.3" ry="2.7" fill={`url(#${eyeGradId})`} />
              <ellipse cx="41.2" cy="18.5" rx="0.9" ry="2.2" fill="#12151B" />
              <circle cx="40.5" cy="17.4" r="0.75" fill="#FFFFFF" />

              {/* Right Eye */}
              <ellipse cx="47.5" cy="18.5" rx="2.3" ry="2.7" fill={`url(#${eyeGradId})`} />
              <ellipse cx="47.7" cy="18.5" rx="0.9" ry="2.2" fill="#12151B" />
              <circle cx="47" cy="17.4" r="0.75" fill="#FFFFFF" />
            </g>
          )}

          {/* Cute Pink Nose */}
          <polygon points="43.2,22 44.8,22 44,23.3" fill="#E68A94" />

          {/* Cat Mouth */}
          <path
            d="M42.5 23.8 Q 44 24.8 44 23.5 Q 44 24.8 45.5 23.8"
            stroke="#25282F"
            strokeWidth="0.85"
            strokeLinecap="round"
          />

          {/* Fine White Whiskers */}
          <g stroke="#FFFFFF" strokeWidth="0.7" strokeLinecap="round" opacity="0.95">
            <line x1="39" y1="23" x2="31" y2="21.5" />
            <line x1="39" y1="24.2" x2="32" y2="25" />
            <line x1="49" y1="23" x2="57" y2="21.5" />
            <line x1="49" y1="24.2" x2="56" y2="25" />
          </g>
        </g>
      </svg>
      </div>
    </div>
  );
};
