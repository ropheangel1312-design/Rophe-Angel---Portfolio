import { PortfolioData } from '../types';

export const portfolioData: PortfolioData = {
  identity: {
    name: 'Rophe Angel',
    tagline: 'Computer Science & Engineering Student',
    shortIntro: 'Exploring modern software development, artificial intelligence, and interactive engineering through experimentation and real-world projects.',
    discipline: 'B.E. Computer Science & Engineering',
    focusAreas: ['Software Development', 'Artificial Intelligence', 'Web Architecture', 'API Integration']
  },
  about: {
    heading: 'About Me',
    photoUrl: 'https://cdn.phototourl.com/member/2026-10-20-376efeb6-5a53-4297-bb6b-0e252403f924.jpg',
    bio: "I'm a Computer Science and Engineering student at St. Joseph’s Institute of Technology exploring software development, AI, and modern web systems by actively building things. I learn best through hands-on experimentation, debugging real challenges, and turning ideas into usable software. Beyond engineering, I founded GradEarn to help fellow students bridge academia and practical proof-of-work.",
    highlights: [
      { label: 'Degree', value: 'B.E. Computer Science & Engineering' },
      { label: 'Institution', value: 'St. Joseph’s Institute of Technology' },
      { label: 'Role', value: 'Student Developer & Founder of GradEarn' },
      { label: 'Focus', value: 'AI Workflows, Web Development & Software Systems' }
    ],
    coreInterests: [
      'Software Development',
      'AI Experimentation',
      'Web Architecture',
      'Problem Solving',
      'Formula 1',
      'Entrepreneurship'
    ]
  },
  skills: [
    {
      category: 'Programming Languages',
      description: 'Core languages used for systems, scripting, and problem-solving.',
      skills: ['Python', 'Java', 'JavaScript']
    },
    {
      category: 'Web Development',
      description: 'Building clean, responsive, and accessible user interfaces.',
      skills: ['HTML5', 'CSS3', 'Modern JavaScript (ES6+)', 'Responsive UI Design']
    },
    {
      category: 'AI & API Integration',
      description: 'Exploring intelligent reasoning workflows and third-party APIs.',
      skills: ['Artificial Intelligence (AI)', 'Prompt Engineering', 'API Integration', 'Spotify Web API']
    },
    {
      category: 'Developer Tools & Workflows',
      description: 'Version control, software lifecycle, and data inspection.',
      skills: ['Git and GitHub', 'Software Development', 'Debugging Workflows', 'Data Analysis']
    }
  ],
  projects: [
    {
      id: 'hush',
      title: 'HUSH',
      category: 'Personal Project · Web Development · Music',
      overview: 'A personal music web application inspired by Spotify, built to give my music streaming its own custom space with focused UI and interactive player controls.',
      problem: 'Mainstream desktop streaming clients can feel cluttered with heavy algorithmic recommendations and social feeds. I wanted a personal web interface dedicated specifically to my top artists, liked tracks, and focused playback testing.',
      approach: [
        'Designed and implemented a responsive web interface from scratch using HTML5, modern CSS3, and JavaScript.',
        'Integrated the Spotify Web API to authenticate user accounts, fetch top artist catalogs, and retrieve liked tracks.',
        'Implemented the Spotify Web Playback SDK to enable in-browser track streaming directly inside the web client.',
        'Built client-side player controls including responsive track seek bars, playback toggles, and artist cards.'
      ],
      myContribution: 'Sole developer responsible for UI development, Spotify API and Web Playback SDK integration, browser-based playback debugging, and website testing.',
      technologies: ['HTML5', 'CSS3', 'JavaScript', 'Spotify Web API', 'Spotify Web Playback SDK', 'Git', 'GitHub'],
      toolsExplored: ['Spotify Developer Dashboard', 'Browser Web Audio API', 'OAuth 2.0 Web Flows'],
      challenges: 'Overcoming browser autoplay policies requiring initial user interaction, handling Spotify token refresh cycles, and synchronizing player state between browser and mobile devices.',
      outcome: 'A fully functional personal music streaming interface and testing ground for modern JavaScript audio and third-party REST API integrations.',
      isLocalOnly: true,
      screenshots: [
        {
          url: 'https://cdn.phototourl.com/member/2026-10-20-1f881889-0f38-4ff2-8a60-30e1cace00bd.png',
          caption: 'HUSH Top Artists Interface',
          alt: 'HUSH personal music web app showcasing top artist cards and navigation'
        },
        {
          url: 'https://cdn.phototourl.com/member/2026-10-20-a7557783-5319-4c35-b1ac-f5d74da5a9f4.png',
          caption: 'HUSH Liked Songs & Player View',
          alt: 'HUSH music player view displaying tracklist of liked songs'
        }
      ],
      links: []
    },
    {
      id: 'ichnova',
      title: 'ICHNOVA',
      category: 'Hackathon Team Project · Signal Processing · Automation',
      overview: 'An automated signal analysis platform that accelerates spectral parameter extraction from raw .IQ quadrature and audio .wav recordings.',
      problem: 'Manual identification and parameter extraction from high-bandwidth radio frequency captures is slow, labour-intensive, and prone to human error when handling complex modulations.',
      approach: [
        'Researched automated signal processing workflows for extracting frequency shifts, SNR, and modulation patterns from raw recordings.',
        'Assisted in integrating AI-guided reasoning workflows (Claude / Agentforce) to classify signal types and detect anomalies.',
        'Built the responsive frontend dashboard visualizing spectral activity, real-time telemetry, and signal properties.',
        'Structured the project documentation, system diagrams, and team presentation delivered to the hackathon judges.'
      ],
      myContribution: 'Research on signal parameters, presentation development, and frontend web dashboard implementation as part of the multidisciplinary team.',
      technologies: ['Python', 'Signal Analysis (.IQ / .wav)', 'Claude', 'Salesforce Agentforce', 'Web Dashboard'],
      toolsExplored: ['Python DSP Tools', 'Claude API', 'Salesforce Agentforce Studio'],
      challenges: 'Translating dense mathematical radio frequency characteristics into clear, readable frontend dashboard visualisations while maintaining low-latency updates.',
      outcome: 'Successfully presented and demonstrated prototype with live signal inspection and automated parameter summary generation.',
      isLocalOnly: false,
      screenshots: [
        {
          url: 'https://cdn.phototourl.com/member/2026-10-20-f010881f-97b6-4900-bbec-91c085eea512.png',
          caption: 'ICHNOVA Signal Analysis Portal',
          alt: 'ICHNOVA signal analysis platform landing page'
        },
        {
          url: 'https://cdn.phototourl.com/member/2026-10-20-727e22d6-c4ad-478a-8f69-77fbe0e70965.png',
          caption: 'ICHNOVA Signal-Monitoring Dashboard',
          alt: 'ICHNOVA real-time signal monitoring dashboard showing parameter metrics'
        }
      ],
      links: [
        {
          label: 'GitHub Repository',
          url: 'https://github.com/SomeNobody21112/ICHNOVA',
          type: 'github'
        },
        {
          label: 'Live Demo',
          url: 'https://ichnova.onrender.com/',
          type: 'demo'
        }
      ]
    },
    {
      id: 'thadam',
      title: 'Thadam',
      category: 'Hackathon Team Project · AI · Public Fund Monitoring',
      overview: 'An AI-assisted public fund monitoring platform designed for the MPLAD Scheme to flag potential spending anomalies, duplicate proposals, and project delays.',
      problem: 'Large-scale public development expenditures often lack accessible, real-time tracking, making it difficult for citizens and administrators to pinpoint overlapping projects or delayed timelines.',
      approach: [
        'Researched fund allocation structures and data schemas used in the MPLAD Scheme.',
        'Explored AI-assisted pattern recognition to highlight unusual budget allocations, repeated proposals in adjacent areas, and unexpected schedule deviations.',
        'Developed an interactive public transparency web portal with district-level filtering, expenditure breakdowns, and project milestones.',
        'Authored research briefs and led pitch preparation for the hackathon evaluation rounds.'
      ],
      myContribution: 'Research into public fund patterns, presentation development, and frontend UI implementation as part of the team.',
      technologies: ['Python', 'AI Anomaly Detection', 'Claude', 'Salesforce Agentforce', 'Interactive Web Portal'],
      toolsExplored: ['Python Analytics', 'Claude API', 'Hugging Face Spaces'],
      challenges: 'Normalising varied municipal expenditure records into a coherent schema suitable for automated anomaly detection while designing an interface accessible to both citizens and analysts.',
      outcome: 'Deployed live prototype on Hugging Face Spaces demonstrating transparent regional fund tracking and automated issue flagging.',
      isLocalOnly: false,
      screenshots: [
        {
          url: 'https://cdn.phototourl.com/member/2026-10-20-1a66bf57-00f3-4490-8e79-1315626ba6ed.png',
          caption: 'Thadam Public Transparency Portal',
          alt: 'Thadam public portal for MPLAD scheme tracking'
        },
        {
          url: 'https://cdn.phototourl.com/member/2026-10-20-7f77e496-1603-4179-827c-dc7e29718134.png',
          caption: 'Thadam Monitoring Dashboard',
          alt: 'Thadam monitoring dashboard highlighting fund allocation and analytics'
        }
      ],
      links: [
        {
          label: 'GitHub Repository',
          url: 'https://github.com/SomeNobody21112/Thadam',
          type: 'github'
        },
        {
          label: 'Live Demo',
          url: 'https://kannanyuvaraj-mplads.hf.space/',
          type: 'demo'
        }
      ]
    }
  ],
  venture: {
    badge: 'Founder / Venture',
    title: 'Building GradEarn',
    founderRole: 'Founder',
    dates: 'October 2026 – Present',
    tagline: 'Empowering students through freelancing guidance, portfolio craftsmanship, and hackathon coaching.',
    mission: 'GradEarn is a student-focused venture created to bridge the divide between theoretical coursework and practical earning. We guide university students to turn technical curiosity into verifiable proof-of-work, client engagements, and competitive hackathon entries.',
    pillars: [
      {
        title: 'Freelancing Guidance & Scoping',
        description: 'Mentoring students on client discovery, project scoping, contract negotiation, and delivering production-ready freelance work.'
      },
      {
        title: 'Portfolio & Communication Craft',
        description: 'Guiding students to construct compelling, evidence-backed engineering portfolios and articulate technical contributions confidently.'
      },
      {
        title: 'Innovation & Hackathon Coaching',
        description: 'Providing structured frameworks for rapid prototyping, problem selection, and pitch deck refinement in competitive tech hackathons.'
      }
    ],
    links: [
      {
        label: 'GradEarn on LinkedIn',
        url: 'https://www.linkedin.com/company/gradearn/',
        type: 'linkedin'
      },
      {
        label: 'GradEarn on Instagram',
        url: 'https://www.instagram.com/gradearn.in/',
        type: 'instagram'
      }
    ]
  },
  operationalExperience: [
    {
      id: 'nissi-fresh',
      role: 'Intern',
      organization: 'Nissi Fresh Supermarket',
      dates: 'June – July 2026',
      typeOrDuration: '30-day internship',
      description: 'Gained practical operational experience in retail workflow management, handling customer checkout systems, barcode tracking, and inventory spreadsheets.',
      toolsAndWorkflows: [
        'GoFrugal Retail POS',
        'Microsoft Excel',
        'Google Sheets',
        'Barcode Systems',
        'Inventory Audits'
      ]
    }
  ],
  achievements: [],
  certifications: [],
  contact: {
    heading: 'Get in Touch',
    description: 'Interested in collaborating, discussing a project, or exploring technical ideas? Reach out directly through any of the channels below.',
    email: 'ropheangel1312@gmail.com',
    linkedin: 'https://www.linkedin.com/in/rophe-angel-b8a051370/',
    github: 'https://github.com/ropheangel1312-design',
    instagramUrl: 'https://www.instagram.com/rophe.sys/',
    instagramHandle: '@rophe.sys'
  }
};
