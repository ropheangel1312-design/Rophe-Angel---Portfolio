import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { portfolioData } from '../data/portfolioData';
import { ProjectCard } from './ProjectCard';
import { VelocityMarquee } from './VelocityMarquee';
import { TextScramble } from './TextScramble';
import { PitWallRadio } from './PitWallRadio';
import { Magnetic } from './Magnetic';
import { CinematicEndCredits } from './CinematicEndCredits';
import { domainAudio } from '../utils/audio';
import { 
  ArrowDown,
  ArrowUpRight,
  ExternalLink,
  Mail,
  Linkedin,
  Github,
  Instagram,
  Briefcase,
  Terminal,
  Globe,
  Brain,
  Layers,
  Code2
} from 'lucide-react';

const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'Programming Languages':
      return Terminal;
    case 'Web Development':
      return Globe;
    case 'AI & API Integration':
      return Brain;
    case 'Developer Tools & Workflows':
      return Layers;
    default:
      return Code2;
  }
};

interface PortfolioHomepageProps {
  isReducedMotion: boolean;
  isMuted?: boolean;
  onToggleSound?: () => void;
}

export const PortfolioHomepage: React.FC<PortfolioHomepageProps> = ({
  isReducedMotion,
  isMuted = true,
  onToggleSound
}) => {
  const [isChannelOpen, setIsChannelOpen] = useState(false);
  const [isContactInView, setIsContactInView] = useState(false);
  const [showCredits, setShowCredits] = useState<boolean>(false);
  const contactSectionRef = useRef<HTMLElement | null>(null);
  const bottomTimerRef = useRef<NodeJS.Timeout | null>(null);
  const hasTriggeredCreditsRef = useRef<boolean>(false);

  // Automatically trigger end credits 3 seconds after visitor reaches the actual page bottom
  useEffect(() => {
    const clearTimer = () => {
      if (bottomTimerRef.current) {
        clearTimeout(bottomTimerRef.current);
        bottomTimerRef.current = null;
      }
    };

    const handleScrollOrResize = () => {
      // Trigger only once per visit; do nothing if credits are currently active
      if (hasTriggeredCreditsRef.current || showCredits) {
        clearTimer();
        return;
      }

      const scrollHeight = document.documentElement.scrollHeight;
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const clientHeight = window.innerHeight || document.documentElement.clientHeight;

      // True bottom detection: within 24px of bottom to handle fractional/retina scaling
      const distanceFromBottom = scrollHeight - (scrollTop + clientHeight);
      const isAtActualBottom = scrollHeight > clientHeight && distanceFromBottom <= 24;

      if (isAtActualBottom) {
        if (!bottomTimerRef.current) {
          bottomTimerRef.current = setTimeout(() => {
            if (!hasTriggeredCreditsRef.current) {
              hasTriggeredCreditsRef.current = true;
              clearTimer();
              setShowCredits(true);
            }
          }, 3000);
        }
      } else {
        // Visitor scrolled away from the bottom before 3s completed -> cancel countdown
        clearTimer();
      }
    };

    window.addEventListener('scroll', handleScrollOrResize, { passive: true });
    window.addEventListener('resize', handleScrollOrResize, { passive: true });

    return () => {
      clearTimer();
      window.removeEventListener('scroll', handleScrollOrResize);
      window.removeEventListener('resize', handleScrollOrResize);
    };
  }, [showCredits]);

  // Contact section viewport intersection observer:
  // Smoothly lowers BGM to 10% (0.03) when in view, and restores to base volume (0.30) when leaving
  useEffect(() => {
    const el = contactSectionRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (!entry) return;
        const visible = entry.isIntersecting;
        setIsContactInView(visible);
        domainAudio.setContactSectionActive(visible);
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -30px 0px',
      }
    );

    observer.observe(el);

    return () => {
      observer.disconnect();
      domainAudio.setContactSectionActive(false);
    };
  }, []);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: isReducedMotion ? 'auto' : 'smooth' });
    }
  };

  const cinematicEase = [0.16, 1, 0.3, 1] as const;

  return (
    <div className="min-h-screen bg-transparent text-[#FFFFFF] flex flex-col font-body selection:bg-[#E10600]/35 selection:text-[#FFFFFF] relative overflow-hidden">
      
      {/* ===================== HERO SECTION ===================== */}
      <section 
        id="hero" 
        className="relative min-h-[82vh] sm:min-h-[85vh] flex flex-col justify-center px-4 sm:px-6 lg:px-12 overflow-hidden"
      >
        <div className="max-w-5xl mx-auto w-full pt-14 pb-8 sm:pt-18 sm:pb-12 relative z-10 flex flex-col justify-center">
          
          <motion.div 
            className="w-full max-w-4xl"
            initial={!isReducedMotion ? { opacity: 0, y: 24 } : false}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.85, ease: cinematicEase }}
          >
            {/* Top Editorial Kicker (Zero-Pill Compliance) */}
            <div className="flex flex-wrap items-center gap-3 text-xs font-tech font-bold uppercase tracking-widest text-[#E10600] mb-4 sm:mb-5">
              <span className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-[#E10600] rounded-xs" />
                <span className="fx-lens" data-text="ENGINEERING PORTFOLIO">ENGINEERING PORTFOLIO</span>
              </span>
              <span aria-hidden="true" className="text-neutral-700">/</span>
              <span className="text-neutral-400">COMPUTER SCIENCE & ENGINEERING</span>
              <span aria-hidden="true" className="text-neutral-700">/</span>
              <span className="text-neutral-400">FOUNDER · GRADEARN</span>
            </div>

            {/* Velocity Marquee: Dynamic continuous typographic centerpiece */}
            <VelocityMarquee isReducedMotion={isReducedMotion} />

            {/* Concise Persona Statement */}
            <motion.div 
              className="max-w-2xl mb-7 sm:mb-8"
              initial={!isReducedMotion ? { opacity: 0 } : false}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.3, ease: cinematicEase }}
            >
              <p className="font-body text-base sm:text-lg text-neutral-300 leading-relaxed">
                Computer Science & Engineering student exploring artificial intelligence, modern web architecture, and production software. Driven by problem-solving, rapid iteration, and turning technical concepts into real working projects.
              </p>
            </motion.div>

            {/* Primary & Secondary CTAs with Magnetic Spring Pull */}
            <motion.div 
              className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4"
              initial={!isReducedMotion ? { opacity: 0, y: 16 } : false}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4, ease: cinematicEase }}
            >
              <Magnetic magneticDistance={140} strength={0.35}>
                <button
                  onClick={() => scrollTo('projects')}
                  className="f1-btn-primary px-8 py-4 rounded font-tech text-sm sm:text-base font-bold tracking-widest uppercase inline-flex items-center justify-center gap-3 cursor-pointer focus:outline-hidden focus:ring-2 focus:ring-[#E10600] group"
                >
                  <span>EXPLORE PROJECTS</span>
                  <ArrowDown className="w-4 h-4 group-hover:translate-y-1 transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]" />
                </button>
              </Magnetic>

              <Magnetic magneticDistance={140} strength={0.35}>
                <button
                  onClick={() => scrollTo('about')}
                  className="f1-btn-secondary px-7 py-4 rounded font-tech text-sm sm:text-base font-bold tracking-widest uppercase inline-flex items-center justify-center gap-2 cursor-pointer focus:outline-hidden focus:ring-1 focus:ring-neutral-500"
                >
                  <span>READ ABOUT ME</span>
                </button>
              </Magnetic>
            </motion.div>

            {/* Bottom Status Strip */}
            <div className="mt-10 sm:mt-12 pt-5 border-t border-white/[0.06] flex flex-wrap items-center justify-between gap-4 text-xs font-tech text-neutral-400">
              <div className="flex items-center gap-3">
                <span className="text-[#E10600] font-bold">STATUS //</span>
                <span className="text-[#FFFFFF]">Active Developer & Venture Founder</span>
              </div>
              <div className="flex items-center gap-4">
                <span>LOCATION // Chennai, India</span>
                <span className="text-neutral-700">|</span>
                <span>SPECIALISATION // Web & AI Systems</span>
              </div>
            </div>
          </motion.div>

        </div>
      </section>

      {/* ===================== SECTION 1: MINIMAL ABOUT ME ===================== */}
      <motion.section 
        id="about" 
        className="pt-8 pb-12 sm:pt-10 sm:pb-16 px-4 sm:px-6 lg:px-12 max-w-6xl mx-auto w-full"
        initial={!isReducedMotion ? { opacity: 0, y: 24 } : false}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.8, ease: cinematicEase }}
      >
        <div className="mb-6 sm:mb-8">
          <div className="text-xs font-tech font-bold uppercase tracking-widest text-[#E10600] mb-2">
            01 // PROFILE & BACKGROUND
          </div>
          <TextScramble
            as="h2"
            text="ABOUT ME"
            triggerOnView={true}
            isReducedMotion={isReducedMotion}
            className="font-display text-3xl sm:text-5xl font-bold text-[#FFFFFF] tracking-tight block"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Authentic Portrait Framing */}
          <div className="lg:col-span-5 relative group">
            <div className="relative rounded-xl overflow-hidden f1-card shadow-2xl">
              
              {/* Corner tech accents */}
              <div className="absolute top-3 left-3 z-20 flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-md text-[11px] font-tech text-[#FFFFFF] border border-white/[0.1] shadow-md">
                <span className="w-1.5 h-1.5 rounded-full bg-[#E10600]" />
                <span>ROPHE ANGEL</span>
              </div>

              <div className="aspect-4/5 w-full overflow-hidden bg-[#0A0A0A]">
                <img
                  src={portfolioData.about.photoUrl}
                  alt="Rophe Angel portrait"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover object-center filter contrast-105 brightness-95 group-hover:scale-103 transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
                />
              </div>

              <div className="p-4 bg-white/[0.03] backdrop-blur-md flex items-center justify-between text-xs font-tech text-neutral-400">
                <span>DEGREE: B.TECH CSE</span>
                <span className="text-[#E10600] font-semibold">EST. 2026</span>
              </div>
            </div>
          </div>

          {/* Concise 2-3 sentence introduction */}
          <div className="lg:col-span-7 space-y-6">
            <div className="f1-card rounded-xl p-6 sm:p-8 space-y-4">
              <span className="text-xs font-tech font-bold uppercase text-[#E10600] tracking-widest fx-lens" data-text="ENGINEERING PROFILE">
                ENGINEERING PROFILE
              </span>
              <p className="font-body text-base sm:text-lg text-neutral-200 leading-relaxed font-normal">
                {portfolioData.about.bio}
              </p>
            </div>

            {/* Focus areas */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {portfolioData.identity.focusAreas.map((area, i) => (
                <div 
                  key={i} 
                  className="p-3 rounded-lg bg-white/[0.04] backdrop-blur-md border border-white/[0.08] flex items-center gap-2 hover:border-[#E10600]/50 hover:bg-white/[0.07] transition-all shadow-[inset_0_1px_1px_rgba(255,255,255,0.06)]"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#E10600]" />
                  <span className="text-xs font-tech font-semibold tracking-wider text-[#FFFFFF] uppercase">
                    {area}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.section>

      {/* ===================== SECTION 2: TECHNICAL SKILLS ===================== */}
      <motion.section 
        id="skills" 
        className="pt-8 pb-12 sm:pt-10 sm:pb-16 px-4 sm:px-6 lg:px-12 max-w-6xl mx-auto w-full"
        initial={!isReducedMotion ? { opacity: 0, y: 24 } : false}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.8, ease: cinematicEase }}
      >
        <div className="mb-6 sm:mb-8">
          <div className="text-xs font-tech font-bold uppercase tracking-widest text-[#E10600] mb-2">
            02 // STACK & CAPABILITIES
          </div>
          <TextScramble
            as="h2"
            text="TECHNICAL EXPERTISE"
            triggerOnView={true}
            isReducedMotion={isReducedMotion}
            className="font-display text-3xl sm:text-5xl font-bold text-[#FFFFFF] tracking-tight block"
          />
          <p className="font-body text-xs sm:text-sm text-neutral-400 mt-1 max-w-xl">
            Practical development toolsets and production languages used in building systems.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {portfolioData.skills.map((categoryGroup, index) => {
            const Icon = getCategoryIcon(categoryGroup.category);
            return (
              <div 
                key={index}
                className="f1-card rounded-xl p-6 sm:p-7 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2.5 rounded-lg bg-white/[0.05] border border-white/[0.1] text-[#E10600] shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-display text-base sm:text-lg font-bold text-[#FFFFFF]">
                        {categoryGroup.category}
                      </h3>
                      <p className="text-xs font-body text-neutral-400">
                        {categoryGroup.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-2">
                    {categoryGroup.skills.map((skill, sIdx) => (
                      <span
                        key={sIdx}
                        className="px-3 py-1.5 rounded-lg bg-white/[0.04] backdrop-blur-xs text-xs font-tech tracking-wider text-neutral-200 border border-white/[0.08] hover:border-[#E10600]/60 hover:bg-white/[0.08] hover:text-[#FFFFFF] transition-all shadow-[inset_0_1px_1px_rgba(255,255,255,0.06)]"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </motion.section>

      {/* ===================== SECTION 3: PROJECT CASE STUDIES ===================== */}
      <motion.section 
        id="projects" 
        className="pt-8 pb-12 sm:pt-10 sm:pb-16 px-4 sm:px-6 lg:px-12 max-w-6xl mx-auto w-full"
        initial={!isReducedMotion ? { opacity: 0, y: 24 } : false}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.8, ease: cinematicEase }}
      >
        <div className="mb-6 sm:mb-8">
          <div className="text-xs font-tech font-bold uppercase tracking-widest text-[#E10600] mb-2">
            03 // TECHNICAL WORK
          </div>
          <TextScramble
            as="h2"
            text="FEATURED CASE STUDIES"
            triggerOnView={true}
            isReducedMotion={isReducedMotion}
            className="font-display text-3xl sm:text-5xl font-bold text-[#FFFFFF] tracking-tight block"
          />
          <p className="font-body text-xs sm:text-sm text-neutral-400 mt-1 max-w-xl">
            Detailed engineering breakdowns highlighting architectural decisions, technical problem-solving, and implementation details.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {portfolioData.projects.map((project, idx) => (
            <ProjectCard 
              key={project.id} 
              project={project} 
              index={idx} 
            />
          ))}
        </div>
      </motion.section>

      {/* ===================== SECTION 4: FOUNDER & VENTURE (GRADEARN) ===================== */}
      <motion.section 
        id="venture" 
        className="pt-8 pb-12 sm:pt-10 sm:pb-16 px-4 sm:px-6 lg:px-12 max-w-6xl mx-auto w-full"
        initial={!isReducedMotion ? { opacity: 0, y: 24 } : false}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.8, ease: cinematicEase }}
      >
        <div className="mb-6 sm:mb-8">
          <div className="text-xs font-tech font-bold uppercase tracking-widest text-[#E10600] mb-2">
            04 // VENTURE & ENTREPRENEURSHIP
          </div>
          <TextScramble
            as="h2"
            text="FOUNDER OF GRADEARN"
            triggerOnView={true}
            isReducedMotion={isReducedMotion}
            className="font-display text-3xl sm:text-5xl font-bold text-[#FFFFFF] tracking-tight block"
          />
          <p className="font-body text-xs sm:text-sm text-neutral-400 mt-1 max-w-xl">
            A student freelancing initiative designed to connect early-career talent with real client projects.
          </p>
        </div>

        <div className="f1-card rounded-2xl p-6 sm:p-10 shadow-2xl relative overflow-hidden">
          
          <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 mb-6 gap-4">
            <div>
              <span className="text-xs font-tech font-bold uppercase text-[#E10600] px-3 py-1 rounded-md bg-white/[0.04] border border-white/[0.08] shadow-[inset_0_1px_1px_rgba(255,255,255,0.06)] inline-block mb-2">
                {portfolioData.venture.badge}
              </span>
              <h3 className="font-display text-2xl sm:text-4xl font-bold text-[#FFFFFF]">
                {portfolioData.venture.title}
              </h3>
              <p className="text-sm font-tech text-neutral-400 mt-1">
                {portfolioData.venture.founderRole} · {portfolioData.venture.dates}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {portfolioData.venture.links.map((link, idx) => (
                <a
                  key={idx}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="f1-btn-secondary px-4 py-2 rounded text-xs font-tech tracking-wider uppercase inline-flex items-center gap-2 cursor-pointer"
                >
                  <span>{link.label}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <h4 className="text-xs font-tech font-bold uppercase tracking-wider text-neutral-400 mb-2">
                VENTURE MISSION
              </h4>
              <p className="font-body text-base sm:text-lg text-neutral-200 leading-relaxed max-w-3xl">
                {portfolioData.venture.mission}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
              {portfolioData.venture.pillars.map((pillar, pIdx) => (
                <div 
                  key={pIdx}
                  className="p-4 rounded-xl bg-white/[0.04] backdrop-blur-md border border-white/[0.08] hover:border-[#E10600]/50 hover:bg-white/[0.07] transition-all shadow-[inset_0_1px_1px_rgba(255,255,255,0.06)]"
                >
                  <div className="text-xs font-tech font-bold text-[#E10600] uppercase mb-1">
                    0{pIdx + 1} //
                  </div>
                  <h5 className="font-display text-sm font-bold text-[#FFFFFF] mb-2">
                    {pillar.title}
                  </h5>
                  <p className="font-body text-xs text-neutral-400 leading-relaxed">
                    {pillar.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

        </div>
      </motion.section>

      {/* ===================== SECTION 5: PRACTICAL EXPERIENCE (NPTEL & V-Vortex REMOVED) ===================== */}
      <motion.section 
        id="experience" 
        className="pt-8 pb-12 sm:pt-10 sm:pb-16 px-4 sm:px-6 lg:px-12 max-w-6xl mx-auto w-full"
        initial={!isReducedMotion ? { opacity: 0, y: 24 } : false}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.8, ease: cinematicEase }}
      >
        <div className="mb-6 sm:mb-8">
          <div className="text-xs font-tech font-bold uppercase tracking-widest text-[#E10600] mb-2">
            05 // WORKPLACE & OPERATIONS
          </div>
          <TextScramble
            as="h2"
            text="PRACTICAL EXPERIENCE"
            triggerOnView={true}
            isReducedMotion={isReducedMotion}
            className="font-display text-3xl sm:text-5xl font-bold text-[#FFFFFF] tracking-tight block"
          />
          <p className="font-body text-xs sm:text-sm text-neutral-400 mt-1 max-w-xl">
            Practical retail workflow management, customer checkout systems, and inventory operations.
          </p>
        </div>

        <div className="max-w-3xl">
          {portfolioData.operationalExperience.map((exp) => (
            <div 
              key={exp.id}
              className="f1-card rounded-xl p-6 sm:p-8 flex flex-col justify-between shadow-xl"
            >
              <div>
                <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-lg bg-white/[0.05] border border-white/[0.1] text-[#E10600] shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]">
                      <Briefcase className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-display text-xl sm:text-2xl font-bold text-[#FFFFFF]">
                        {exp.role}
                      </h3>
                      <p className="font-tech text-sm text-[#E10600] font-semibold">
                        {exp.organization}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-tech font-bold uppercase text-neutral-300 px-3 py-1 rounded-md bg-white/[0.04] border border-white/[0.08] shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]">
                      {exp.dates}
                    </span>
                    <span className="text-xs font-tech font-bold uppercase text-[#E10600] px-3 py-1 rounded-md bg-white/[0.04] border border-white/[0.08] shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]">
                      {exp.typeOrDuration}
                    </span>
                  </div>
                </div>

                <p className="font-body text-sm sm:text-base text-neutral-300 leading-relaxed mb-6">
                  {exp.description}
                </p>

                <div>
                  <div className="text-xs font-tech font-bold uppercase tracking-wider text-neutral-400 mb-2">
                    Workflows & Tools Applied:
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {exp.toolsAndWorkflows?.map((tool, idx) => (
                      <span 
                        key={idx}
                        className="px-3 py-1 rounded-lg bg-white/[0.04] text-xs font-tech text-neutral-300 border border-white/[0.08] hover:border-[#E10600]/40 hover:bg-white/[0.07] transition-all shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]"
                      >
                        {tool}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.section>

      {/* ===================== SECTION 6: CONTACT ===================== */}
      <motion.section 
        id="contact" 
        ref={contactSectionRef as any}
        className="pt-8 pb-12 sm:pt-10 sm:pb-14 px-4 sm:px-6 lg:px-12 max-w-6xl mx-auto w-full"
        initial={!isReducedMotion ? { opacity: 0, y: 24 } : false}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.8, ease: cinematicEase }}
      >
        <div className="mb-6 sm:mb-8">
          <div className="text-xs font-tech font-bold uppercase tracking-widest text-[#E10600] mb-2">
            06 // CHANNELS
          </div>
          <TextScramble
            as="h2"
            text="GET IN TOUCH"
            triggerOnView={true}
            isReducedMotion={isReducedMotion}
            className="font-display text-3xl sm:text-5xl font-bold text-[#FFFFFF] tracking-tight block"
          />
          <p className="font-body text-xs sm:text-sm text-neutral-400 mt-1 max-w-xl">
            {portfolioData.contact.description}
          </p>
        </div>

        {/* Unified ROPHE RADIO Console matching exact reference layout */}
        <div className="max-w-4xl w-full">
          <PitWallRadio 
            isReducedMotion={isReducedMotion}
            isMuted={isMuted}
            onToggleMute={onToggleSound}
            onChannelOpened={setIsChannelOpen}
            isInView={isContactInView}
          />

          {/* Subtle dedicated launch button right below the console */}
          <div className="mt-4 flex items-center justify-between flex-wrap gap-3">
            <button
              onClick={() => setShowCredits(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/[0.04] hover:bg-[#E10600]/15 border border-white/10 hover:border-[#E10600]/50 text-neutral-300 hover:text-white text-xs font-tech font-bold uppercase tracking-wider transition-all cursor-pointer active:scale-95 group shadow-sm"
              title="Experience the full-screen cinematic end credits sequence"
            >
              <span className="w-2 h-2 rounded-full bg-[#E10600] group-hover:shadow-[0_0_8px_rgba(225,6,0,0.8)]" />
              <span>ROLL CINEMATIC END CREDITS ⏵</span>
            </button>
            <span className="text-[11px] font-mono text-neutral-500">
              TRANSMISSION COMPLETE · SECTOR 03
            </span>
          </div>
        </div>
      </motion.section>

      {/* ===================== FOOTER ===================== */}
      <footer className="mt-auto py-6 sm:py-7 px-4 sm:px-6 lg:px-12 bg-transparent text-xs font-tech text-neutral-400">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img 
              src="/logo.png" 
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = 'https://plain-apac-prod-public.komododecks.com/202610/20/YZgT7SnpXc2zs3CnoXeZ/image.png';
              }}
              alt="Rophe Angel Racing Emblem" 
              className="h-6 w-auto object-contain"
            />
            <span className="text-[#E10600] font-bold">ROPHE ANGEL</span>
            <span className="text-neutral-700">/</span>
            <span>ENGINEERING PORTFOLIO</span>
          </div>

          <div className="flex items-center gap-6">
            <button
              onClick={() => setShowCredits(true)}
              className="hover:text-[#E10600] font-bold uppercase tracking-wider transition-colors active:scale-95 cursor-pointer text-neutral-400 hover:text-white"
            >
              End Credits ⏵
            </button>
            <button
              onClick={() => scrollTo('hero')}
              className="hover:text-[#E10600] font-bold uppercase tracking-wider transition-colors active:scale-95 cursor-pointer"
            >
              Back to Top ↑
            </button>
          </div>
        </div>
      </footer>

      {/* ===================== CINEMATIC FULL-SCREEN END CREDITS ===================== */}
      <CinematicEndCredits 
        isOpen={showCredits}
        onClose={() => setShowCredits(false)}
        isReducedMotion={isReducedMotion}
        isMuted={isMuted}
        onToggleSound={onToggleSound || (() => {})}
      />

    </div>
  );
};
