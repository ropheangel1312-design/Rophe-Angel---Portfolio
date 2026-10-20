import { PortfolioData } from '../types';

export const portfolioData: PortfolioData = {
  identity: {
    name: 'Rophe Angel',
    tagline: 'Computer Science & Engineering Student',
    shortIntro: "I'm a Computer Science and Engineering student who loves exploring tech, experimenting with AI, and turning random ideas into actual projects.",
    domainTitle: 'DOMAIN EXPANSION',
    domainSubtitle: 'ETERNAL BUFFERING'
  },
  about: {
    heading: 'About Me',
    photoUrl: 'https://cdn.phototourl.com/member/2026-10-20-376efeb6-5a53-4297-bb6b-0e252403f924.jpg',
    bioParagraphs: [
      "I'm Rophe Angel, a Computer Science and Engineering student who loves exploring tech, experimenting with AI, and turning random ideas into actual projects.",
      "I'm curious about a lot of things, and I usually end up trying them out just to see what I can create. Whether it's figuring out a new AI tool, working on a website, or troubleshooting something that refuses to cooperate, I enjoy learning by doing.",
      "Outside tech, I'm into music, anime, writing, F1, and pretty much anything that catches my interest. I like exploring different creative spaces and bringing my own ideas to life.",
      "Right now, I'm working on improving my coding and software development skills, getting better at debugging, and building projects that go beyond just looking good. My goal is to create things people can actually use, contribute to interesting projects, and find internships where I can learn from real-world experience.",
      "I'm also interested in entrepreneurship, so I'm excited to see where the things I build — and the ideas I can't stop thinking about — take me."
    ],
    interests: [
      'Software Development',
      'AI Experimentation',
      'Web Development',
      'Music',
      'Anime',
      'Writing',
      'Formula 1',
      'Entrepreneurship'
    ]
  },
  education: {
    heading: 'Education',
    subtitle: 'My academic journey so far.',
    college: {
      institution: 'St. Joseph’s Institute of Technology',
      degree: 'B.E. Computer Science and Engineering',
      duration: '2025–2029',
      currentYear: '2nd Year',
      description: 'Currently pursuing my undergraduate degree, building my foundation in computer science and exploring software development, AI tools, and personal projects.'
    },
    schools: [
      {
        institution: 'SBOA Matriculation Higher Secondary School',
        level: 'Class XII / Higher Secondary Education'
      },
      {
        institution: 'Spartan Matriculation Higher Secondary School',
        level: 'Class X / Secondary Education'
      }
    ]
  },
  skills: [
    'Python',
    'Java',
    'JavaScript',
    'Web Development',
    'Artificial Intelligence (AI)',
    'Prompt Engineering',
    'Data Analysis',
    'Software Development',
    'API Integration',
    'Git and GitHub'
  ],
  projects: [
    {
      id: 'hush',
      title: 'HUSH',
      category: 'Personal Project · Web Development · Music',
      description: 'HUSH is my personal music website, built to give my Spotify music its own space with a UI that feels like me. I created it to explore web development, Spotify API integration, browser playback, and website testing.',
      myContribution: 'UI development, feature implementation, Spotify integration, playback debugging, and website testing.',
      technologies: ['HTML', 'CSS', 'JavaScript', 'Spotify Web API', 'Spotify Web Playback SDK', 'Git', 'GitHub'],
      isLocalOnly: true,
      screenshots: [
        {
          url: 'https://cdn.phototourl.com/member/2026-10-20-1f881889-0f38-4ff2-8a60-30e1cace00bd.png',
          caption: 'HUSH Home / Top Artists',
          alt: 'HUSH personal music website home displaying top artists'
        },
        {
          url: 'https://cdn.phototourl.com/member/2026-10-20-a7557783-5319-4c35-b1ac-f5d74da5a9f4.png',
          caption: 'HUSH Liked Songs',
          alt: 'HUSH playback view showing liked songs tracklist'
        }
      ],
      links: []
    },
    {
      id: 'thadam',
      title: 'Thadam',
      category: 'Hackathon Team Project · AI · Public Fund Monitoring',
      description: 'Thadam is an AI-powered monitoring concept for the MPLAD Scheme. It aims to flag unusual spending, potential fraud, duplicate projects, cost overruns, and delays to support better monitoring of public funds and project progress.',
      myContribution: 'Research, presentation development, and frontend work as part of the team.',
      toolsExplored: ['Python', 'Claude', 'Salesforce', 'Agentforce'],
      isLocalOnly: false,
      screenshots: [
        {
          url: 'https://cdn.phototourl.com/member/2026-10-20-1a66bf57-00f3-4490-8e79-1315626ba6ed.png',
          caption: 'Thadam Public-Facing Landing Page',
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
    },
    {
      id: 'ichnova',
      title: 'ICHNOVA',
      category: 'Hackathon Team Project · Signal Analysis · Automation',
      description: 'ICHNOVA explores automating signal analysis from .IQ and .wav files. The proposed system focuses on extracting signal parameters and supporting tasks such as demodulation, de-interleaving, and error correction.',
      myContribution: 'Research, presentation development, and frontend work as part of the team.',
      toolsExplored: ['Python', 'Claude', 'Salesforce', 'Agentforce'],
      isLocalOnly: false,
      screenshots: [
        {
          url: 'https://cdn.phototourl.com/member/2026-10-20-f010881f-97b6-4900-bbec-91c085eea512.png',
          caption: 'ICHNOVA Landing Page',
          alt: 'ICHNOVA signal analysis platform hero and landing screen'
        },
        {
          url: 'https://cdn.phototourl.com/member/2026-10-20-727e22d6-c4ad-478a-8f69-77fbe0e70965.png',
          caption: 'ICHNOVA Signal-Monitoring Dashboard',
          alt: 'ICHNOVA signal monitoring dashboard showing spectral analysis and parameters'
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
    }
  ],
  experience: [
    {
      id: 'gradearn',
      role: 'Founder',
      organization: 'GradEarn',
      dates: 'October 2026 – Present',
      typeOrDuration: 'Student-focused venture',
      description: 'Building a student-focused venture that helps students explore freelancing, develop practical skills, build profiles and portfolios, find genuine client opportunities, and explore innovation and hackathons.',
      responsibilities: [
        'Research and opportunity exploration',
        'Service development',
        'Content strategy',
        'Growth planning'
      ],
      link: {
        label: 'Instagram',
        url: 'https://www.instagram.com/gradearn.in/'
      },
      links: [
        {
          label: 'LinkedIn',
          url: 'https://www.linkedin.com/company/gradearn/',
          type: 'linkedin'
        },
        {
          label: 'Instagram',
          url: 'https://www.instagram.com/gradearn.in/',
          type: 'instagram'
        }
      ]
    },
    {
      id: 'nissi-fresh',
      role: 'Intern',
      organization: 'Nissi Fresh Supermarket',
      dates: 'June – July 2026',
      typeOrDuration: '30-day internship',
      description: 'Gained practical experience in supermarket operations, including billing, barcode processes, spreadsheet use, inventory-related tasks, and customer assistance.',
      toolsAndWorkflows: [
        'GoFrugal',
        'Microsoft Excel',
        'Google Sheets',
        'Billing and barcode workflows',
        'Day-to-day store operations'
      ]
    }
  ],
  achievements: [
    {
      id: 'v-vortex',
      title: 'V-Vortex Hackathon',
      organization: 'Vellore Institute of Technology (VIT)',
      recognition: 'Honorable Mention',
      description: 'Recognition received for participation in the V-Vortex Hackathon.'
    }
  ],
  certifications: [
    {
      id: 'python-data-science',
      title: 'Python for Data Science',
      provider: 'NPTEL',
      status: 'Certificate received',
      score: '68%',
      imageUrl: 'https://cdn.phototourl.com/member/2026-10-20-04315b92-91ac-40ba-bcdc-02558f5ba6c9.png'
    }
  ],
  contact: {
    heading: 'Get in touch.',
    description: 'Want to connect or talk about a project? Reach out through any of these links.',
    email: 'ropheangel1312@gmail.com',
    linkedin: 'https://www.linkedin.com/in/rophe-angel-b8a051370/',
    github: 'https://github.com/ropheangel1312-design',
    instagramUrl: 'https://www.instagram.com/rophe.sys/',
    instagramHandle: '@rophe.sys'
  }
};
