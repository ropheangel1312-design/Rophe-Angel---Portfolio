import { WipItem } from '../types';

export const wipData: WipItem[] = [
  {
    id: 'wip-asta-novara',
    number: '01',
    title: 'ASTA-NOVARA',
    tagline: 'Your life. Your progress. Your legend.',
    logoUrl: '/assets/logos/asta_novara.png',
    fallbackLogoUrl: 'https://plain-apac-prod-public.komododecks.com/202610/21/hTLqmC3ahmU6KO0Gp8YL/image.png',
    status: 'CONCEPT STAGE',
    shortTeaser: 'A real-world progression universe where genuine accomplishments shape a user\'s character, mastery, and evolving world.',
    role: 'Sole creator — original concept, product vision, and foundational project constitution.',
    visionStatement: 'Transforming tangible personal achievements, consistent discipline, and verified life milestones into an expansive personal mythos and enduring character mastery framework.',
    currentFocus: 'Defining progression systems, character identity, evidence principles, and long-term product architecture.',
    nextMilestones: [
      'Refine the initial MVP scope and progression mechanics.',
      'Define the first functional real-world verification and progression loop.',
      'Begin exploratory product architecture and interface prototyping.'
    ],
    atmosphericTheme: 'astral',
    statusClarification: 'ASTA-NOVARA is currently at the foundational concept and planning stage. There is no established implementation or functioning runtime yet; detailed internal mechanics and the full project constitution are intentionally kept within private development.'
  },
  {
    id: 'wip-lock-in',
    number: '02',
    title: 'LOCK IN',
    tagline: 'Locked. Loaded. Let\'s go.',
    logoUrl: '/assets/logos/lock_in.png',
    fallbackLogoUrl: 'https://plain-apac-prod-public.komododecks.com/202610/21/XAlrRG3xXwvmAPURJDoR/image.png',
    status: 'CONCEPT / MVP PLANNING',
    shortTeaser: 'A study companion concept connecting educational YouTube videos with personally selected soundtracks through a dedicated web experience and companion Chrome extension.',
    role: 'Creator — original concept, product direction, feature definition, and MVP planning.',
    visionStatement: 'A high-focus digital study environment engineered to blend educational lecture feeds with custom acoustic soundtracks via independent media stages and companion browser controls.',
    currentFocus: 'Planning the Study Room, independent media controls, persistent soundtrack library, and educational-video suggestions.',
    nextMilestones: [
      'Build the standalone web-based Study Room interface.',
      'Implement and test persistent client-side soundtrack libraries.',
      'Explore the companion Chrome extension after validating the core experience.'
    ],
    atmosphericTheme: 'studio',
    statusClarification: 'LOCK IN is currently conceptualized and in active MVP planning. Full audio mixing, persistent cross-session soundtrack storage, and companion extension capabilities are proposed architectural features that have not yet been implemented.'
  },
  {
    id: 'wip-mayday',
    number: '03',
    title: 'MAYDAY',
    tagline: 'Your academic life, under control.',
    category: 'EdTech · Productivity',
    startedDate: 'October 2026',
    logoUrl: '/assets/logos/mayday.svg',
    fallbackLogoUrl: '/assets/logos/mayday.svg',
    status: 'CONCEPT STAGE',
    shortTeaser: 'A college study companion concept designed to bring academic planning, focus sessions, subject management, and AI-assisted learning into one accessible experience.',
    role: 'Sole creator — concept vision, product requirements planning, and foundation architecture.',
    visionStatement: 'A college study companion concept engineered to streamline academic workflows by unifying daily priority dashboards, adaptive study planning, instant focus sessions, and AI-assisted learning into a single accessible, offline-first digital environment.',
    currentFocus: 'Product discovery and requirements planning, navigation structure, and offline-first backend architecture.',
    nextMilestones: [
      'Finalise the foundation specification and core data models.',
      'Design the zero-setup focus timer and adaptive academic dashboard interface.',
      'Prototype offline-first subject management with Firebase cloud synchronisation.',
      'Integrate AI study companion workflows for concept explanations and practice.'
    ],
    atmosphericTheme: 'academic',
    statusClarification: 'MAYDAY is currently in product discovery and requirements planning. Features described (adaptive study planning, focus timer, AI companion, and offline sync) are planned architectural capabilities and have not yet been implemented or verified.',
    documentationUrl: '/assets/aistudio/MAYDAY_Concept_Stage_Documentation_c994187e.pdf',
    plannedFeatures: [
      'Academic Dashboard — central home screen for daily priorities, upcoming exams, deadlines and progress',
      'Adaptive Study Planner — organise subjects, units, topics, exams and assignments with adaptive progress',
      'Focus Timer — start a focus session immediately without requiring upfront semester setup',
      'AI Study Companion — get explanations, ask questions and practise concepts with study materials',
      'Personalisation — dark-first design, solid-colour themes, custom backgrounds and profile avatars',
      'Offline-First Functionality — local data storage with optional cloud synchronisation planned',
      'Accessibility Protections — responsive layouts, reduced-motion preferences and adjustable typography'
    ]
  }
];
