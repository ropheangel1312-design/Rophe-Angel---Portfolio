import React, { useState, useEffect, useRef } from 'react';
import { portfolioData } from '../data/portfolioData';
import { ProjectCard } from './ProjectCard';
import { 
  Sparkles, 
  ExternalLink, 
  Mail, 
  GraduationCap, 
  RotateCcw,
  ArrowUpRight,
  School,
  Calendar,
  Linkedin,
  Github,
  Instagram,
  Award,
  FileCheck,
  Code2,
  X,
  Maximize2,
  Terminal,
  Cpu,
  Globe,
  Brain,
  BarChart3,
  Layers,
  Workflow,
  GitBranch
} from 'lucide-react';

const getSkillIcon = (skillName: string) => {
  switch (skillName) {
    case 'Python':
      return Terminal;
    case 'Java':
      return Cpu;
    case 'JavaScript':
      return Code2;
    case 'Web Development':
      return Globe;
    case 'Artificial Intelligence (AI)':
      return Brain;
    case 'Prompt Engineering':
      return Sparkles;
    case 'Data Analysis':
      return BarChart3;
    case 'Software Development':
      return Layers;
    case 'API Integration':
      return Workflow;
    case 'Git and GitHub':
      return GitBranch;
    default:
      return Code2;
  }
};

interface PortfolioHomepageProps {
  onReplayIntro: () => void;
  isReducedMotion: boolean;
}

export const PortfolioHomepage: React.FC<PortfolioHomepageProps> = ({
  onReplayIntro,
  isReducedMotion
}) => {
  // State for certificate preview modal
  const [certModalOpen, setCertModalOpen] = useState(false);
  const [isCertClosing, setIsCertClosing] = useState(false);
  const certTimerRef = useRef<NodeJS.Timeout | null>(null);

  const openCertModal = () => {
    if (certTimerRef.current) clearTimeout(certTimerRef.current);
    setIsCertClosing(false);
    setCertModalOpen(true);
  };

  const closeCertModal = () => {
    if (isCertClosing) return;
    setIsCertClosing(true);
    certTimerRef.current = setTimeout(() => {
      setCertModalOpen(false);
      setIsCertClosing(false);
    }, 220);
  };

  // Clear timer on unmount
  useEffect(() => {
    return () => {
      if (certTimerRef.current) clearTimeout(certTimerRef.current);
    };
  }, []);

  // Esc key handler for certificate modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && certModalOpen && !isCertClosing) {
        closeCertModal();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [certModalOpen, isCertClosing]);

  // Lock body scroll when cert modal is open
  useEffect(() => {
    if (certModalOpen) {
      const originalStyle = window.getComputedStyle(document.body).overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalStyle;
      };
    }
  }, [certModalOpen]);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: isReducedMotion ? 'auto' : 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#101626] text-[#F7F0E6] flex flex-col font-body selection:bg-[#AFA0FF]/30 selection:text-[#A8E6D4]">
      
      {/* ===================== HERO SECTION ===================== */}
      <section 
        id="hero" 
        className="relative pt-14 pb-16 px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center text-center overflow-hidden border-b border-[#A8E6D4]/15"
      >
        {/* Subtle background supernatural aura with mint and lilac glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[540px] h-[540px] bg-[radial-gradient(circle,rgba(175,160,255,0.08)_0%,rgba(168,230,212,0.05)_40%,transparent_70%)] pointer-events-none -z-10" />

        {/* Small Domain Tag */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#101626]/90 border border-[#A8E6D4]/30 text-[11px] font-tech font-bold tracking-wider text-[#A8E6D4] mb-5 shadow-xs backdrop-blur-md">
          <span className="w-1.5 h-1.5 rounded-full bg-[#F6B86F] animate-pulse" />
          <span>DOMAIN EXPANSION: ETERNAL BUFFERING</span>
        </div>

        {/* Header brand name: Rophe Angel */}
        <h1 className="font-display text-3xl sm:text-5xl md:text-6xl font-black text-[#F7F0E6] tracking-tight max-w-3xl leading-tight">
          {portfolioData.identity.name}
        </h1>

        {/* Tagline */}
        <p className="font-tech text-base sm:text-xl text-[#AFA0FF] font-bold tracking-widest uppercase mt-2.5 mb-4">
          {portfolioData.identity.tagline}
        </p>

        {/* Introduction */}
        <p className="font-body text-sm sm:text-base text-[#F7F0E6]/85 max-w-xl leading-relaxed mb-7">
          {portfolioData.identity.shortIntro}
        </p>

        {/* Action Buttons — Liquid glass styling & subtle elevation */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          <button
            onClick={() => scrollTo('projects')}
            className="liquid-btn-primary w-full sm:w-auto px-6 py-2.5 rounded-xl font-tech text-sm font-bold tracking-wider uppercase focus:outline-hidden focus:ring-2 focus:ring-[#AFA0FF] cursor-pointer"
          >
            View Projects
          </button>

          <button
            onClick={() => scrollTo('about')}
            className="liquid-btn-secondary w-full sm:w-auto px-6 py-2.5 rounded-xl font-tech text-sm font-bold tracking-wider uppercase focus:outline-hidden focus:ring-2 focus:ring-[#AFA0FF] cursor-pointer"
          >
            About Me
          </button>
        </div>
      </section>

      {/* ===================== SECTION 1: ABOUT ME ===================== */}
      <section 
        id="about" 
        className="py-14 sm:py-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full border-b border-[#A8E6D4]/15"
      >
        <div className="flex items-center gap-2.5 mb-6">
          <div className="w-2 h-2 rounded-full bg-[#A8E6D4]" />
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#F7F0E6]">
            {portfolioData.about.heading}
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          
          {/* Bio Text Column */}
          <div className="lg:col-span-7 space-y-3.5">
            {portfolioData.about.bioParagraphs.map((paragraph, index) => (
              <p key={index} className="font-body text-xs sm:text-sm text-[#F7F0E6]/90 leading-relaxed">
                {paragraph}
              </p>
            ))}

            {/* Interests & Creative Spaces */}
            <div className="pt-2">
              <span className="text-[11px] font-tech font-bold text-[#A8E6D4] uppercase tracking-wider block mb-2">
                Interests & Exploration:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {portfolioData.about.interests.map((interest) => (
                  <span 
                    key={interest}
                    className="px-2.5 py-1 rounded-lg bg-[#101626]/85 border border-[#A8E6D4]/30 text-xs font-tech font-semibold text-[#F7F0E6] flex items-center gap-1 hover:border-[#AFA0FF] transition-colors"
                  >
                    <Sparkles className="w-2.5 h-2.5 text-[#F6B86F]" />
                    {interest}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Actual Photograph Column — Appropriately sized and aligned */}
          <div className="lg:col-span-5 flex flex-col items-center justify-start w-full lg:pt-1">
            <div className="relative p-2.5 sm:p-3 rounded-2xl bg-[#101626]/90 border border-[#A8E6D4]/40 shadow-xl w-full max-w-[340px] sm:max-w-[380px] lg:max-w-[400px] group backdrop-blur-md">
              <div className="relative aspect-square rounded-xl overflow-hidden bg-[#101626]/40">
                <img
                  src={portfolioData.about.photoUrl}
                  alt="Rophe Angel"
                  className="w-full h-full object-cover object-center rounded-lg transition-transform duration-500 group-hover:scale-102"
                />
              </div>

              <div className="mt-2.5 text-center text-[11px] font-tech text-[#F7F0E6]/70">
                Rophe Angel — Computer Science & Engineering
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ===================== SECTION 2: EDUCATION ===================== */}
      <section 
        id="education" 
        className="py-14 sm:py-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full border-b border-[#A8E6D4]/15"
      >
        <div className="mb-8">
          <div className="flex items-center gap-2.5 mb-1.5">
            <div className="w-2 h-2 rounded-full bg-[#A8E6D4]" />
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#F7F0E6]">
              {portfolioData.education.heading}
            </h2>
          </div>
          <p className="font-body text-xs sm:text-sm text-[#F7F0E6]/70">
            {portfolioData.education.subtitle}
          </p>
        </div>

        {/* Current College — Featured Entry with Liquid Glass */}
        <div className="mb-5">
          <div className="seance-panel rounded-2xl p-5 sm:p-6 border border-[#A8E6D4]/50 relative overflow-hidden shadow-lg">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#AFA0FF]/15 border border-[#AFA0FF]/50 text-[11px] font-tech font-bold uppercase tracking-wider text-[#AFA0FF]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#AFA0FF] animate-pulse" />
                Current College · {portfolioData.education.college.currentYear}
              </span>

              <div className="inline-flex items-center gap-1 text-[11px] font-tech font-bold text-[#A8E6D4] bg-[#101626]/80 px-2.5 py-0.5 rounded-md border border-[#A8E6D4]/30">
                <Calendar className="w-3 h-3" />
                <span>{portfolioData.education.college.duration}</span>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <div className="p-2.5 rounded-xl bg-[#101626] border border-[#A8E6D4]/40 text-[#A8E6D4] shrink-0 mt-0.5 hidden sm:block">
                <GraduationCap className="w-5 h-5" />
              </div>

              <div className="space-y-1.5">
                <h3 className="font-display text-lg sm:text-xl font-bold text-[#F7F0E6]">
                  {portfolioData.education.college.institution}
                </h3>

                <p className="font-tech text-xs sm:text-sm text-[#A8E6D4] font-bold tracking-wide">
                  {portfolioData.education.college.degree}
                </p>

                <p className="font-body text-xs sm:text-sm text-[#F7F0E6]/85 leading-relaxed max-w-3xl">
                  {portfolioData.education.college.description}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Secondary & Higher Secondary Schools — Compact Coordinated Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {portfolioData.education.schools.map((school, idx) => (
            <div 
              key={idx}
              className="seance-panel rounded-xl p-4 border border-[#A8E6D4]/20 flex items-start gap-3 hover:-translate-y-0.5 transition-all"
            >
              <div className="p-2 rounded-lg bg-[#101626] border border-[#A8E6D4]/30 text-[#A8E6D4] shrink-0 mt-0.5">
                <School className="w-4 h-4" />
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-tech font-bold uppercase tracking-wider text-[#AFA0FF]">
                  {school.level}
                </span>
                <h4 className="font-display text-sm sm:text-base font-bold text-[#F7F0E6]">
                  {school.institution}
                </h4>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ===================== SECTION 3: SKILLS ===================== */}
      <section 
        id="skills" 
        className="py-14 sm:py-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full border-b border-[#A8E6D4]/15"
      >
        <div className="mb-8">
          <div className="flex items-center gap-2.5 mb-1.5">
            <div className="w-2 h-2 rounded-full bg-[#F6B86F]" />
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#F7F0E6]">
              Skills
            </h2>
          </div>
          <p className="font-body text-xs sm:text-sm text-[#F7F0E6]/70">
            Core technical skills and technologies.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
          {portfolioData.skills.map((skill, index) => {
            const Icon = getSkillIcon(skill);
            return (
              <div 
                key={skill}
                className="seance-panel rounded-xl p-3.5 sm:p-4 border border-[#A8E6D4]/25 shadow-sm hover:border-[#AFA0FF] transition-all duration-300 group hover:-translate-y-0.5 hover:shadow-lg flex flex-col justify-between relative overflow-hidden"
              >
                {/* Subtle top gloss reflection */}
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#A8E6D4]/40 to-transparent pointer-events-none" />
                
                <div className="flex items-center justify-between mb-2.5">
                  <div className="p-2 rounded-lg bg-[#101626]/80 border border-[#A8E6D4]/20 text-[#A8E6D4] group-hover:text-[#AFA0FF] group-hover:border-[#AFA0FF]/40 transition-colors">
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="font-tech text-[10px] font-semibold text-[#A8E6D4]/50 group-hover:text-[#AFA0FF]/70 tracking-wider">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                </div>

                <div className="flex items-start gap-1.5 pt-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#F6B86F] mt-1.5 shrink-0" />
                  <h3 className="font-tech text-xs sm:text-sm font-semibold text-[#F7F0E6] group-hover:text-[#A8E6D4] transition-colors leading-snug">
                    {skill}
                  </h3>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ===================== SECTION 4: PROJECTS (ONLY 3: HUSH, Thadam, ICHNOVA) ===================== */}
      <section 
        id="projects" 
        className="py-14 sm:py-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full border-b border-[#A8E6D4]/15"
      >
        <div className="mb-8">
          <div className="flex items-center gap-2.5 mb-1.5">
            <div className="w-2 h-2 rounded-full bg-[#AFA0FF]" />
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#F7F0E6]">
              Projects
            </h2>
          </div>
          <p className="font-body text-xs sm:text-sm text-[#F7F0E6]/70">
            Three selected projects. Click any project card to view full details and interface screenshots.
          </p>
        </div>

        {/* 3 Project Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {portfolioData.projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      </section>

      {/* ===================== SECTION 5: EXPERIENCE (GradEarn belongs here) ===================== */}
      <section 
        id="experience" 
        className="py-14 sm:py-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full border-b border-[#A8E6D4]/15"
      >
        <div className="mb-8">
          <div className="flex items-center gap-2.5 mb-1.5">
            <div className="w-2 h-2 rounded-full bg-[#A8E6D4]" />
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#F7F0E6]">
              Experience
            </h2>
          </div>
          <p className="font-body text-xs sm:text-sm text-[#F7F0E6]/70">
            Founder role and practical operational experience.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {portfolioData.experience.map((exp) => (
            <div 
              key={exp.id}
              className="seance-panel rounded-2xl p-5 sm:p-6 border border-[#A8E6D4]/25 shadow-sm flex flex-col justify-between"
            >
              <div>
                {/* Header Badge & Duration */}
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                  <span className="text-[10px] font-tech font-bold uppercase tracking-wider text-[#A8E6D4] px-2.5 py-0.5 rounded-full bg-[#101626] border border-[#A8E6D4]/30">
                    {exp.typeOrDuration}
                  </span>
                  <span className="text-[11px] font-tech font-bold text-[#AFA0FF]">
                    {exp.dates}
                  </span>
                </div>

                {/* Role and Organization */}
                <h3 className="font-display text-lg sm:text-xl font-bold text-[#F7F0E6] mb-1">
                  {exp.role} <span className="text-[#AFA0FF]">— {exp.organization}</span>
                </h3>

                {/* Description */}
                <p className="font-body text-xs sm:text-sm text-[#F7F0E6]/85 leading-relaxed mb-4">
                  {exp.description}
                </p>

                {/* Responsibilities if GradEarn */}
                {exp.responsibilities && exp.responsibilities.length > 0 && (
                  <div className="mb-4 space-y-1.5">
                    <span className="text-[11px] font-tech font-bold uppercase text-[#A8E6D4] block mb-1">
                      Responsibilities:
                    </span>
                    {exp.responsibilities.map((resp, i) => (
                      <div key={i} className="flex items-start gap-1.5 text-xs text-[#F7F0E6]/80 font-body">
                        <span className="text-[#A8E6D4] font-bold">›</span>
                        <span>{resp}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Tools and workflows if Nissi Fresh */}
                {exp.toolsAndWorkflows && exp.toolsAndWorkflows.length > 0 && (
                  <div className="mb-4">
                    <span className="text-[11px] font-tech font-bold uppercase text-[#A8E6D4] block mb-1.5">
                      Tools & Workflows:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {exp.toolsAndWorkflows.map((t, i) => (
                        <span key={i} className="px-2 py-0.5 rounded-md bg-[#101626] border border-[#A8E6D4]/30 text-[11px] font-tech text-[#F7F0E6]/80">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Requirement 7: GradEarn links with both LinkedIn and Instagram */}
              {exp.id === 'gradearn' && exp.links && (
                <div className="pt-3 border-t border-[#A8E6D4]/15 mt-2 flex flex-wrap items-center gap-3">
                  {exp.links.map((lnk) => (
                    <a
                      key={lnk.url}
                      href={lnk.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-tech font-bold px-3 py-1.5 rounded-lg bg-[#101626] border border-[#A8E6D4]/30 hover:border-[#AFA0FF] text-[#F7F0E6] hover:text-[#AFA0FF] transition-all active:scale-95"
                    >
                      {lnk.type === 'linkedin' ? (
                        <Linkedin className="w-3.5 h-3.5 text-[#AFA0FF]" />
                      ) : (
                        <Instagram className="w-3.5 h-3.5 text-[#F6B86F]" />
                      )}
                      <span>{lnk.label}</span>
                      <ExternalLink className="w-3 h-3 opacity-60 ml-0.5" />
                    </a>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ===================== SECTION 6: ACHIEVEMENTS ===================== */}
      <section 
        id="achievements" 
        className="py-14 sm:py-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full border-b border-[#A8E6D4]/15"
      >
        <div className="mb-8">
          <div className="flex items-center gap-2.5 mb-1.5">
            <div className="w-2 h-2 rounded-full bg-[#AFA0FF]" />
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#F7F0E6]">
              Achievements
            </h2>
          </div>
          <p className="font-body text-xs sm:text-sm text-[#F7F0E6]/70">
            Competitions and hackathon recognitions.
          </p>
        </div>

        <div className="max-w-2xl">
          {portfolioData.achievements.map((item) => (
            <div 
              key={item.id}
              className="seance-panel rounded-2xl p-5 border border-[#A8E6D4]/25 flex items-start gap-3.5 shadow-sm hover:-translate-y-0.5 transition-all"
            >
              <div className="p-2.5 rounded-xl bg-[#101626] border border-[#AFA0FF]/40 text-[#AFA0FF] shrink-0 mt-0.5">
                <Award className="w-5 h-5" />
              </div>

              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-display text-base sm:text-lg font-bold text-[#F7F0E6]">
                    {item.title}
                  </h3>
                  <span className="px-2 py-0.5 rounded-md bg-[#AFA0FF]/20 border border-[#AFA0FF] text-[10px] font-tech font-bold uppercase text-[#AFA0FF]">
                    {item.recognition}
                  </span>
                </div>

                <p className="font-tech text-xs text-[#A8E6D4] font-semibold">
                  {item.organization}
                </p>

                <p className="font-body text-xs sm:text-sm text-[#F7F0E6]/80 leading-relaxed pt-1">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ===================== SECTION 7: CERTIFICATIONS ===================== */}
      <section 
        id="certifications" 
        className="py-14 sm:py-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full border-b border-[#A8E6D4]/15"
      >
        <div className="mb-8">
          <div className="flex items-center gap-2.5 mb-1.5">
            <div className="w-2 h-2 rounded-full bg-[#F6B86F]" />
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#F7F0E6]">
              Certifications
            </h2>
          </div>
          <p className="font-body text-xs sm:text-sm text-[#F7F0E6]/70">
            Verified course certifications and academic credentials.
          </p>
        </div>

        <div className="max-w-2xl">
          {portfolioData.certifications.map((cert) => (
            <div 
              key={cert.id}
              className="seance-panel rounded-2xl p-5 border border-[#A8E6D4]/25 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm"
            >
              <div className="flex items-start gap-3.5">
                <div className="p-2.5 rounded-xl bg-[#101626] border border-[#A8E6D4]/30 text-[#A8E6D4] shrink-0 mt-0.5">
                  <FileCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display text-base sm:text-lg font-bold text-[#F7F0E6]">
                    {cert.title}
                  </h3>
                  <div className="flex items-center gap-2 text-xs font-tech text-[#A8E6D4] mt-0.5">
                    <span>Provider: {cert.provider}</span>
                    <span>•</span>
                    <span className="text-[#F6B86F] font-semibold">Score: {cert.score}</span>
                  </div>
                  <span className="inline-block mt-2 text-[10px] font-tech text-[#AFA0FF] uppercase px-2.5 py-0.5 rounded-full bg-[#101626] border border-[#AFA0FF]/30">
                    {cert.status}
                  </span>
                </div>
              </div>

              {/* View Certificate Action Button with Liquid Glass */}
              <button
                onClick={openCertModal}
                className="liquid-btn-secondary w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-tech font-bold flex items-center justify-center gap-1.5 shrink-0 active:scale-95 cursor-pointer"
              >
                <span>View Certificate</span>
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* ===================== SECTION 8: CONTACT ===================== */}
      <section 
        id="contact" 
        className="py-14 sm:py-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full"
      >
        <div className="mb-8">
          <div className="flex items-center gap-2.5 mb-1.5">
            <div className="w-2 h-2 rounded-full bg-[#AFA0FF]" />
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#F7F0E6]">
              {portfolioData.contact.heading}
            </h2>
          </div>
          <p className="font-body text-xs sm:text-sm text-[#F7F0E6]/80">
            {portfolioData.contact.description}
          </p>
        </div>

        {/* 4 Compact Contact Links / Cards with Liquid Glass */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Email */}
          <a 
            href={`mailto:${portfolioData.contact.email}`}
            className="seance-panel rounded-2xl p-4 flex flex-col justify-between border border-[#A8E6D4]/25 hover:border-[#AFA0FF] transition-all hover:-translate-y-1 active:scale-98 group block focus:outline-hidden focus:ring-1 focus:ring-[#AFA0FF]"
          >
            <div>
              <div className="w-8 h-8 rounded-lg bg-[#101626] border border-[#A8E6D4]/30 flex items-center justify-center text-[#A8E6D4] mb-3 group-hover:border-[#AFA0FF] group-hover:text-[#AFA0FF] transition-colors">
                <Mail className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-tech font-bold uppercase tracking-wider text-[#A8E6D4] block mb-1">
                Email
              </span>
              <p className="font-body text-xs font-semibold text-[#F7F0E6] break-all group-hover:text-[#AFA0FF] transition-colors">
                {portfolioData.contact.email}
              </p>
            </div>
            <div className="mt-3 pt-2.5 border-t border-[#A8E6D4]/15 flex items-center justify-between text-[11px] font-tech font-bold text-[#A8E6D4] group-hover:text-[#AFA0FF] transition-colors">
              <span>Send Email</span>
              <ArrowUpRight className="w-3 h-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </div>
          </a>

          {/* LinkedIn */}
          <a 
            href={portfolioData.contact.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="seance-panel rounded-2xl p-4 flex flex-col justify-between border border-[#A8E6D4]/25 hover:border-[#AFA0FF] transition-all hover:-translate-y-1 active:scale-98 group block focus:outline-hidden focus:ring-1 focus:ring-[#AFA0FF]"
          >
            <div>
              <div className="w-8 h-8 rounded-lg bg-[#101626] border border-[#AFA0FF]/30 flex items-center justify-center text-[#AFA0FF] mb-3 group-hover:border-[#AFA0FF] transition-colors">
                <Linkedin className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-tech font-bold uppercase tracking-wider text-[#AFA0FF] block mb-1">
                LinkedIn
              </span>
              <p className="font-body text-xs font-semibold text-[#F7F0E6] group-hover:text-[#AFA0FF] transition-colors">
                Rophe Angel
              </p>
            </div>
            <div className="mt-3 pt-2.5 border-t border-[#A8E6D4]/15 flex items-center justify-between text-[11px] font-tech font-bold text-[#AFA0FF]">
              <span>Connect</span>
              <ExternalLink className="w-3 h-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </div>
          </a>

          {/* GitHub */}
          <a 
            href={portfolioData.contact.github}
            target="_blank"
            rel="noopener noreferrer"
            className="seance-panel rounded-2xl p-4 flex flex-col justify-between border border-[#A8E6D4]/25 hover:border-[#F6B86F] transition-all hover:-translate-y-1 active:scale-98 group block focus:outline-hidden focus:ring-1 focus:ring-[#F6B86F]"
          >
            <div>
              <div className="w-8 h-8 rounded-lg bg-[#101626] border border-[#F6B86F]/30 flex items-center justify-center text-[#F6B86F] mb-3 group-hover:border-[#F6B86F] transition-colors">
                <Github className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-tech font-bold uppercase tracking-wider text-[#F6B86F] block mb-1">
                GitHub
              </span>
              <p className="font-body text-xs font-semibold text-[#F7F0E6] group-hover:text-[#F6B86F] transition-colors">
                ropheangel1312-design
              </p>
            </div>
            <div className="mt-3 pt-2.5 border-t border-[#A8E6D4]/15 flex items-center justify-between text-[11px] font-tech font-bold text-[#F6B86F]">
              <span>View Profile</span>
              <ExternalLink className="w-3 h-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </div>
          </a>

          {/* Instagram — with verified profile URL and username @rophe.sys */}
          <a 
            href={portfolioData.contact.instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="seance-panel rounded-2xl p-4 flex flex-col justify-between border border-[#A8E6D4]/25 hover:border-[#A8E6D4] transition-all hover:-translate-y-1 active:scale-98 group block focus:outline-hidden focus:ring-1 focus:ring-[#A8E6D4]"
          >
            <div>
              <div className="w-8 h-8 rounded-lg bg-[#101626] border border-[#A8E6D4]/30 flex items-center justify-center text-[#A8E6D4] mb-3 group-hover:border-[#A8E6D4] transition-colors">
                <Instagram className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-tech font-bold uppercase tracking-wider text-[#A8E6D4] block mb-1">
                Instagram
              </span>
              <p className="font-body text-xs font-semibold text-[#F7F0E6] group-hover:text-[#A8E6D4] transition-colors">
                {portfolioData.contact.instagramHandle}
              </p>
            </div>
            <div className="mt-3 pt-2.5 border-t border-[#A8E6D4]/15 flex items-center justify-between text-[11px] font-tech font-bold text-[#A8E6D4]">
              <span>View Profile</span>
              <ExternalLink className="w-3 h-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </div>
          </a>

        </div>
      </section>

      {/* ===================== FOOTER ===================== */}
      <footer className="mt-auto py-6 px-4 sm:px-6 lg:px-8 border-t border-[#A8E6D4]/20 bg-[#101626]/95 text-xs font-tech text-[#F7F0E6]/70">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            <span className="text-[#A8E6D4] font-bold">Rophe Angel</span>
            <span className="mx-2">•</span>
            <span>Domain Expansion: Eternal Buffering</span>
          </div>

          <div className="flex items-center gap-5">
            <button
              onClick={onReplayIntro}
              className="flex items-center gap-1.5 text-[#AFA0FF] hover:text-[#A8E6D4] font-bold transition-all active:scale-95 focus:outline-hidden cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Replay Intro</span>
            </button>

            <button
              onClick={() => scrollTo('hero')}
              className="hover:text-[#A8E6D4] font-bold transition-colors active:scale-95 cursor-pointer"
            >
              Back to Top ↑
            </button>
          </div>
        </div>
      </footer>

      {/* ===================== CERTIFICATE PREVIEW MODAL / LIGHTBOX ===================== */}
      {certModalOpen && (
        <div
          className={`fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto ${
            isCertClosing ? 'animate-glass-backdrop-out' : 'animate-glass-backdrop-in'
          }`}
          role="dialog"
          aria-modal="true"
          aria-label="NPTEL Python for Data Science Certificate Preview"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeCertModal();
          }}
        >
          <div 
            className={`liquid-glass-modal-surface rounded-2xl max-w-2xl w-full p-4 sm:p-5 shadow-2xl relative my-auto text-left relative ${
              isCertClosing ? 'animate-glass-modal-out' : 'animate-glass-modal-in'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Subtle glossy reflection highlight overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-white/[0.08] via-white/[0.015] to-transparent pointer-events-none rounded-2xl" />
            <div className="absolute -top-20 -left-20 w-60 h-40 bg-gradient-to-br from-white/10 to-transparent rotate-12 pointer-events-none rounded-full blur-xl" />

            <div className="flex items-center justify-between pb-3 border-b border-[#A8E6D4]/20 mb-3 relative z-10 animate-stagger-1">
              <div>
                <span className="text-[10px] font-tech font-bold uppercase text-[#A8E6D4] tracking-wider">
                  NPTEL • Score: 68%
                </span>
                <h3 className="font-display text-lg sm:text-xl font-bold text-[#F7F0E6]">
                  Python for Data Science
                </h3>
              </div>
              <button
                onClick={closeCertModal}
                className="p-1.5 rounded-lg bg-[#101626]/80 border border-[#A8E6D4]/30 text-[#F7F0E6] hover:text-[#AFA0FF] hover:border-[#AFA0FF] transition-all active:scale-95 cursor-pointer"
                aria-label="Close certificate preview"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="rounded-xl overflow-hidden bg-[#101626]/90 border border-[#A8E6D4]/30 flex items-center justify-center max-h-[70vh] p-2 relative z-10 animate-stagger-2">
              <img
                src={portfolioData.certifications[0]?.imageUrl}
                alt="NPTEL Certificate - Python for Data Science - Score 68%"
                className="max-h-[65vh] w-auto object-contain mx-auto rounded-lg shadow-lg"
              />
            </div>

            <div className="mt-3 flex items-center justify-between text-xs font-tech text-[#F7F0E6]/70 relative z-10 animate-stagger-3">
              <span>Status: Certificate received</span>
              <button
                onClick={closeCertModal}
                className="px-3 py-1 rounded-lg bg-[#101626]/80 border border-[#A8E6D4]/30 text-xs font-tech text-[#F7F0E6] hover:border-[#AFA0FF] hover:text-[#AFA0FF] transition-all active:scale-95 cursor-pointer"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
