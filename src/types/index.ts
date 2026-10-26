export type IntroPhase = 
  | 'CHIBI_GREETING'
  | 'HOMEPAGE_REVEAL';

export interface ProjectLink {
  label: string;
  url: string;
  type: 'github' | 'demo' | 'instagram';
}

export interface ProjectScreenshot {
  url: string;
  caption: string;
  alt: string;
}

export interface ProjectItem {
  id: string;
  title: string;
  category: string;
  overview: string;
  problem: string;
  approach: string[];
  myContribution: string;
  technologies: string[];
  toolsExplored?: string[];
  challenges: string;
  outcome?: string;
  isLocalOnly?: boolean;
  screenshots: ProjectScreenshot[];
  links: ProjectLink[];
}

export interface SkillCategory {
  category: string;
  skills: string[];
  description: string;
}

export interface VenturePillar {
  title: string;
  description: string;
}

export interface VentureData {
  badge: string;
  title: string;
  founderRole: string;
  dates: string;
  tagline: string;
  mission: string;
  pillars: VenturePillar[];
  links: {
    label: string;
    url: string;
    type: 'linkedin' | 'instagram';
  }[];
}

export interface ExperienceItem {
  id: string;
  role: string;
  organization: string;
  dates: string;
  typeOrDuration: string;
  description: string;
  toolsAndWorkflows?: string[];
}

export interface AchievementItem {
  id: string;
  title: string;
  organization: string;
  recognition: string;
  description: string;
}

export interface CertificationItem {
  id: string;
  title: string;
  provider: string;
  status: string;
  score: string;
  imageUrl: string;
}

export interface PaperItem {
  id: string;
  number: string;
  title: string;
  logoUrl: string;
  fallbackLogoUrl: string;
  paperUrl?: string;
  repositoryUrl?: string;
  abstract: string;
  category: string;
  status: 'UNPUBLISHED';
  researchStage: string;
  contribution: string;
  limitations?: string[];
  authors?: string[];
  myRoleClarification?: string;
}

export interface WipItem {
  id: string;
  number: string;
  title: string;
  tagline: string;
  logoUrl: string;
  fallbackLogoUrl: string;
  status: string;
  category?: string;
  startedDate?: string;
  shortTeaser: string;
  role: string;
  visionStatement: string;
  currentFocus: string;
  nextMilestones: string[];
  atmosphericTheme: 'astral' | 'studio' | 'academic';
  statusClarification: string;
  documentationUrl?: string;
  plannedFeatures?: string[];
}

export interface PortfolioData {
  identity: {
    name: string;
    tagline: string;
    shortIntro: string;
    discipline: string;
    focusAreas: string[];
  };
  about: {
    heading: string;
    photoUrl: string;
    bio: string;
    highlights: {
      label: string;
      value: string;
    }[];
    coreInterests: string[];
  };
  skills: SkillCategory[];
  projects: ProjectItem[];
  venture: VentureData;
  operationalExperience: ExperienceItem[];
  achievements: AchievementItem[];
  certifications: CertificationItem[];
  contact: {
    heading: string;
    description: string;
    email: string;
    linkedin: string;
    github: string;
    instagramUrl: string;
    instagramHandle: string;
  };
}

