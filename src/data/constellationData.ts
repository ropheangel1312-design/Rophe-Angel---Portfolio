export interface ConstellationNode {
  id: string;
  number: string;
  label: string;
  x: number; // normalized 0..1
  y: number; // normalized 0..1
  summary: string;
  explanation: string;
  methods: string[];
  toolsAndLanguages: string[];
  relatedProjects: {
    title: string;
    targetId: string;
    tag: string;
  }[];
  satelliteNodes: {
    label: string;
    angle: number; // in radians
    distance: number; // in pixels
  }[];
}

export const constellationNodes: ConstellationNode[] = [
  {
    id: 'ai-systems',
    number: '01',
    label: 'AI & Intelligent Systems',
    x: 0.22,
    y: 0.28,
    summary: 'Intelligent reasoning workflows, anomaly detection, and applied LLM tooling.',
    explanation: 'Exploring pragmatic artificial intelligence integrations—from prompt engineering and agentic workflows to automated signal anomaly detection in hackathon prototypes.',
    methods: [
      'Prompt Engineering',
      'API Integration & Orchestration',
      'Anomaly Detection Workflows',
      'Audio & Signal Classification'
    ],
    toolsAndLanguages: [
      'Python',
      'Claude API',
      'Salesforce Agentforce',
      'Hugging Face Spaces',
      'Signal Analysis (.IQ / .wav)'
    ],
    relatedProjects: [
      { title: 'ICHNOVA', targetId: 'projects', tag: 'Spectral Analysis' },
      { title: 'Thadam', targetId: 'projects', tag: 'Public Fund Anomaly Detection' },
      { title: 'ASSURE', targetId: 'papers', tag: 'Tender Extraction Framework' }
    ],
    satelliteNodes: [
      { label: 'Prompt Design', angle: 0.8, distance: 48 },
      { label: 'Signal DSP', angle: 2.3, distance: 54 },
      { label: 'Agentic Flows', angle: 4.1, distance: 46 }
    ]
  },
  {
    id: 'software-dev',
    number: '02',
    label: 'Software Development',
    x: 0.18,
    y: 0.68,
    summary: 'Modern web engineering, reactive interfaces, and production architectures.',
    explanation: 'Building responsive, accessible web software using modern JavaScript/TypeScript and component architectures. Focused on clean code, predictable state, and zero-latency interactions.',
    methods: [
      'Responsive Web Architecture',
      'Client-Side Media Streaming',
      'Component Lifecycle & State Management',
      'API Data Fetching & Caching'
    ],
    toolsAndLanguages: [
      'JavaScript (ES6+)',
      'TypeScript',
      'HTML5 & Modern CSS3',
      'Tailwind CSS',
      'Git & GitHub'
    ],
    relatedProjects: [
      { title: 'HUSH', targetId: 'projects', tag: 'Spotify Client Web App' },
      { title: 'Jana Nayagan', targetId: 'papers', tag: 'Civic Complaint Web App' }
    ],
    satelliteNodes: [
      { label: 'TypeScript', angle: 1.1, distance: 48 },
      { label: 'DOM Perf', angle: 3.2, distance: 52 },
      { label: 'State Sync', angle: 5.3, distance: 45 }
    ]
  },
  {
    id: 'research-systems',
    number: '03',
    label: 'Research & Systems Thinking',
    x: 0.50,
    y: 0.22,
    summary: 'Conceptual modeling, theoretical frameworks, and multidisciplinary research.',
    explanation: 'Deconstructing complex administrative, legal, and operational problems into structured conceptual frameworks—such as tender requirement extraction pipelines and evidence-fusion architectures.',
    methods: [
      'Conceptual Systems Modeling',
      'Literature & Domain Synthesis',
      'Problem Deconstruction',
      'Framework Specification'
    ],
    toolsAndLanguages: [
      'Academic Writing',
      'Architecture Diagrams',
      'Data Normalization Schemas',
      'Multi-Source Evidence Fusion'
    ],
    relatedProjects: [
      { title: 'ASSURE', targetId: 'papers', tag: 'Proposed Tender Framework' },
      { title: 'SAMAY & SAAKSHI', targetId: 'papers', tag: 'MSME Proof Engine' },
      { title: 'Jana Nayagan', targetId: 'papers', tag: 'Civic Architecture Study' }
    ],
    satelliteNodes: [
      { label: 'Modeling', angle: 0.4, distance: 50 },
      { label: 'Deconstruction', angle: 2.7, distance: 52 },
      { label: 'Evidence Fusion', angle: 4.8, distance: 48 }
    ]
  },
  {
    id: 'product-thinking',
    number: '04',
    label: 'Product Thinking',
    x: 0.80,
    y: 0.32,
    summary: 'Vision definition, progression mechanics, and milestone scoping.',
    explanation: 'Defining compelling product constitutions, user journey loops, and disciplined MVP scoping. Balancing high-concept creative ideas with clear milestones and executable roadmaps.',
    methods: [
      'MVP Scoping & Prioritization',
      'Progression Mechanics & Gamification',
      'User Experience Mapping',
      'Product Constitution Definition'
    ],
    toolsAndLanguages: [
      'Product Roadmaps',
      'UX Wireframing',
      'Feature Boundary Definition',
      'Milestone Tracking'
    ],
    relatedProjects: [
      { title: 'ASTA-NOVARA', targetId: 'wip', tag: 'Real-World Progression Universe' },
      { title: 'LOCK IN', targetId: 'wip', tag: 'Focused Study Room Concept' }
    ],
    satelliteNodes: [
      { label: 'MVP Scoping', angle: 1.4, distance: 52 },
      { label: 'Progression', angle: 3.6, distance: 48 },
      { label: 'Roadmapping', angle: 5.6, distance: 46 }
    ]
  },
  {
    id: 'business-ops',
    number: '05',
    label: 'Business & Operations',
    x: 0.82,
    y: 0.72,
    summary: 'Student entrepreneurship, retail inventory systems, and operational execution.',
    explanation: 'Direct experience founding a student freelancing venture (GradEarn) and managing real-world retail workflows, customer point-of-sale systems, barcode scanning, and inventory spreadsheets.',
    methods: [
      'Student Mentorship & Scoping',
      'Retail Workflow Coordination',
      'Inventory Tracking & Auditing',
      'Client Scoping & Negotiation'
    ],
    toolsAndLanguages: [
      'GradEarn Venture',
      'GoFrugal Retail POS',
      'Microsoft Excel / Sheets',
      'Barcode Systems'
    ],
    relatedProjects: [
      { title: 'GradEarn', targetId: 'venture', tag: 'Freelancing & Hackathon Venture' },
      { title: 'Nissi Fresh Operations', targetId: 'experience', tag: 'Retail Workflow Internship' }
    ],
    satelliteNodes: [
      { label: 'POS Workflows', angle: 1.8, distance: 50 },
      { label: 'Inventory', angle: 3.9, distance: 48 },
      { label: 'Venture Ops', angle: 5.8, distance: 46 }
    ]
  },
  {
    id: 'creative-comm',
    number: '06',
    label: 'Creative Communication',
    x: 0.50,
    y: 0.76,
    summary: 'Technical storytelling, editorial portfolio craft, and hackathon pitching.',
    explanation: 'Communicating technical systems clearly through high-craft editorial design, motorsport-inspired visual identity, pitch deck preparation, and hackathon presentation delivery.',
    methods: [
      'Technical Storytelling',
      'Editorial Design & Typography',
      'Pitch Deck Craftsmanship',
      'Interactive Portfolio Engineering'
    ],
    toolsAndLanguages: [
      'Presentation Design',
      'Visual Identity Systems',
      'Documentation Craft',
      'Formula 1 Aesthetic Styling'
    ],
    relatedProjects: [
      { title: 'Engineering Portfolio', targetId: 'hero', tag: 'Interactive Domain Sequence' },
      { title: 'ICHNOVA Pitch', targetId: 'projects', tag: 'Hackathon Judge Presentation' },
      { title: 'Thadam Brief', targetId: 'projects', tag: 'Research Brief & Pitch' }
    ],
    satelliteNodes: [
      { label: 'Storytelling', angle: 0.6, distance: 50 },
      { label: 'Visual Craft', angle: 2.5, distance: 48 },
      { label: 'Pitch Delivery', angle: 4.5, distance: 48 }
    ]
  }
];
