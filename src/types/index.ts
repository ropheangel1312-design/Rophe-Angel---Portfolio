export type IntroPhase = 
  | 'CHIBI_GREETING'
  | 'DOMAIN_ANNOUNCEMENT'
  | 'DOMAIN_EXPANSION'
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
  description: string;
  myContribution: string;
  technologies?: string[];
  toolsExplored?: string[];
  isLocalOnly?: boolean;
  screenshots: ProjectScreenshot[];
  links: ProjectLink[];
}

export interface CollegeEducation {
  institution: string;
  degree: string;
  duration: string;
  currentYear: string;
  description: string;
}

export interface SchoolEducation {
  institution: string;
  level: string;
}

export interface EducationData {
  heading: string;
  subtitle: string;
  college: CollegeEducation;
  schools: SchoolEducation[];
}

export interface SkillGroup {
  category: string;
  skills: string[];
}

export interface ExperienceItem {
  id: string;
  role: string;
  organization: string;
  dates: string;
  typeOrDuration: string;
  description: string;
  responsibilities?: string[];
  toolsAndWorkflows?: string[];
  link?: {
    label: string;
    url: string;
  };
  links?: {
    label: string;
    url: string;
    type: 'instagram' | 'linkedin' | 'external';
  }[];
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

export interface PortfolioData {
  identity: {
    name: string;
    tagline: string;
    shortIntro: string;
    domainTitle: string;
    domainSubtitle: string;
  };
  about: {
    heading: string;
    photoUrl: string;
    bioParagraphs: string[];
    interests: string[];
  };
  education: EducationData;
  skills: string[];
  projects: ProjectItem[];
  experience: ExperienceItem[];
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
