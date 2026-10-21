import { PortfolioData } from '../types';

export const portfolioData: PortfolioData = {
  identity: {
    name: 'Rophe Angel',
    tagline: 'Computer Science & Engineering Student',
    shortIntro: 'Computer Science student building software, testing AI workflows, and figuring things out by actually writing the code.',
    discipline: 'B.E. Computer Science & Engineering',
    focusAreas: ['Software Development', 'Artificial Intelligence', 'Web Architecture', 'API Integration']
  },
  about: {
    heading: 'About Me',
    photoUrl: 'https://cdn.phototourl.com/member/2026-10-20-376efeb6-5a53-4297-bb6b-0e252403f924.jpg',
    bio: "I'm a Computer Science and Engineering student at St. Joseph’s Institute of Technology. I learn fastest when I take an idea, break it into pieces, and build something I can run on my screen. Most of my work sits around web development, AI APIs, and interactive systems. Outside of coursework, I started GradEarn to help other students turn what they study into actual projects and client work.",
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
      description: 'Languages I reach for to build tools, write scripts, or work through coursework.',
      skills: ['Python', 'Java', 'JavaScript']
    },
    {
      category: 'Web Development',
      description: 'Building frontends that feel responsive, look intentional, and hold up under real interaction.',
      skills: ['HTML5', 'CSS3', 'Modern JavaScript (ES6+)', 'Responsive UI Design']
    },
    {
      category: 'AI & API Integration',
      description: 'Hooking models and third-party APIs into apps where they actually solve something practical.',
      skills: ['Artificial Intelligence (AI)', 'Prompt Engineering', 'API Integration', 'Spotify Web API']
    },
    {
      category: 'Developer Tools & Workflows',
      description: 'Git, debugging, and terminal workflows that keep projects organized and reproducible.',
      skills: ['Git and GitHub', 'Software Development', 'Debugging Workflows', 'Data Analysis']
    }
  ],
  projects: [
    {
      id: 'hush',
      title: 'HUSH',
      category: 'Personal Project · Web Development · Music',
      overview: 'A personal music web app inspired by Spotify. I wanted a cleaner, distraction-free space for my favorite artists and a playground to test the Spotify Web Playback SDK.',
      problem: "Desktop streaming apps often feel cluttered with endless recommendation carousels and social feeds. I wanted a stripped-down interface focused purely on the music I actually play, while giving me a chance to see how Spotify's playback SDK behaves in the browser.",
      approach: [
        'Built a custom frontend from scratch using HTML5, modern CSS3, and JavaScript.',
        'Integrated Spotify Web API to handle account auth, fetch top artist catalogs, and pull liked tracks.',
        'Used the Spotify Web Playback SDK to stream tracks directly in the browser.',
        'Wired up client-side player controls including seek bars, playback toggles, and artist cards.'
      ],
      myContribution: 'Sole developer on this project. Handled the UI, Spotify API and Web Playback SDK integration, debugging audio playback in the browser, and local testing.',
      technologies: ['HTML5', 'CSS3', 'JavaScript', 'Spotify Web API', 'Spotify Web Playback SDK', 'Git', 'GitHub'],
      toolsExplored: ['Spotify Developer Dashboard', 'Browser Web Audio API', 'OAuth 2.0 Web Flows'],
      challenges: 'Browser autoplay policies were tricky—browsers block audio until the user clicks something. Handling token refreshes and keeping player state synced between my phone and browser took quite a bit of trial and error.',
      outcome: 'A working local music player and a solid hands-on lesson in OAuth web flows, browser audio APIs, and handling live playback state.',
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
      overview: 'A hackathon project exploring how to pull signal parameters from raw .IQ quadrature and .wav recordings without having to manually calculate them by hand every time.',
      problem: 'Manually extracting frequencies, noise ratios, and modulations from radio signal captures is slow, tedious, and easy to mess up. We wanted an automated pipeline that could process recordings and flag anomalies quickly.',
      approach: [
        'Researched signal processing workflows for extracting frequency shifts, SNR, and modulation patterns from raw recordings.',
        'Worked with teammates to integrate Claude and Agentforce reasoning workflows for signal classification.',
        'Built the responsive web dashboard visualizing spectral activity, real-time telemetry, and signal properties.',
        'Structured system diagrams, documentation, and the presentation deck delivered to hackathon judges.'
      ],
      myContribution: 'Researched signal parameters, built the frontend dashboard that visualizes spectral activity, and co-created the pitch presentation as part of our multidisciplinary team.',
      technologies: ['Python', 'Signal Analysis (.IQ / .wav)', 'Claude', 'Salesforce Agentforce', 'Web Dashboard'],
      toolsExplored: ['Python DSP Tools', 'Claude API', 'Salesforce Agentforce Studio'],
      challenges: 'Taking dense DSP numbers and turning them into charts that people could understand in seconds during a live judge demo, all without lagging the UI.',
      outcome: 'We demoed the prototype live at the hackathon, showing real-time signal inspection and automated parameter summaries.',
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
      overview: 'An AI-assisted tracking portal for MPLAD public fund expenditures, built to highlight potential spending anomalies, overlapping proposals, and stalled projects.',
      problem: 'Public development spending records are notoriously fragmented. Citizens and administrators usually have to dig through complex records to spot duplicate work or delayed expenditures across districts.',
      approach: [
        'Researched fund allocation structures and data schemas used in the MPLAD Scheme.',
        'Explored AI-assisted pattern checks to highlight unusual budget allocations, repeated proposals in adjacent areas, and delayed timelines.',
        'Built an interactive public transparency web portal with district-level filtering, expenditure breakdowns, and project milestones.',
        'Authored research briefs and led pitch preparation for the evaluation rounds.'
      ],
      myContribution: 'Researched public fund schemas, created the evaluation presentation, and built the frontend portal where users filter by district and inspect flagged anomalies.',
      technologies: ['Python', 'AI Anomaly Detection', 'Claude', 'Salesforce Agentforce', 'Interactive Web Portal'],
      toolsExplored: ['Python Analytics', 'Claude API', 'Hugging Face Spaces'],
      challenges: "Normalizing messy municipal fund records into a single schema that could feed our anomaly checks, while keeping the interface clear enough for someone who isn't a data analyst.",
      outcome: 'Deployed an interactive prototype on Hugging Face Spaces demonstrating regional expenditure filtering and automated anomaly flags.',
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
    tagline: 'Helping college students build real proof-of-work, tackle hackathons, and land freelance gigs.',
    mission: 'College coursework teaches fundamentals, but it rarely shows you how to land a real client or ship a project people actually use. I started GradEarn to help peers take what they learn in class, turn it into tangible work, and compete in hackathons with confidence.',
    pillars: [
      {
        title: 'Freelancing & Client Work',
        description: 'How to talk to clients, define project scope, set fair pricing, and deliver work that actually gets paid.'
      },
      {
        title: 'Portfolios & Technical Proof',
        description: 'Building evidence-backed portfolios that show what you actually coded instead of generic resume buzzwords.'
      },
      {
        title: 'Hackathons & Rapid Prototyping',
        description: 'Frameworks for picking a viable problem, building a functional MVP within 24–36 hours, and pitching clearly to judges.'
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
      description: 'Worked on the retail floor managing POS checkouts, scanning incoming stock, and reconciling physical inventory against spreadsheets.',
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
    description: 'Have an idea, want to collaborate on a hackathon project, or just talk tech? Drop me a message or find me on GitHub and LinkedIn.',
    email: 'ropheangel1312@gmail.com',
    linkedin: 'https://www.linkedin.com/in/rophe-angel-b8a051370/',
    github: 'https://github.com/ropheangel1312-design',
    instagramUrl: 'https://www.instagram.com/rophe.sys/',
    instagramHandle: '@rophe.sys'
  }
};
