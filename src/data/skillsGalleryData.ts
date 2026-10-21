export interface SkillCardData {
  id: string;
  number: string;
  title: string;
  tagline: string;
  shortDescription: string;
  graphicType: 'neural' | 'code' | 'research' | 'product' | 'creative' | 'operations';
  expanded: {
    overview: string;
    coreCompetencies: string[];
    methodsAndWorkflows: string[];
    productionTools: string[];
    featuredReferences?: {
      label: string;
      targetId: string;
      type: 'project' | 'paper' | 'venture';
    }[];
  };
}

export const skillsGalleryData: SkillCardData[] = [
  {
    id: 'ai-intelligent-systems',
    number: '01',
    title: 'AI & Intelligent Systems',
    tagline: 'Model orchestration & document intelligence',
    shortDescription: 'Engineering agentic workflows, contextual LLM pipelines, and multimodal document simplification architectures.',
    graphicType: 'neural',
    expanded: {
      overview: 'Focusing on practical generative AI integration, prompt synthesis, and document intelligence pipelines that transform unstructured content into actionable, verifiable data.',
      coreCompetencies: [
        'Agentic AI Workflows & Tool Calling',
        'Document Intelligence & Extraction Frameworks',
        'Context-Aware Prompt Engineering',
        'Multimodal Vision & Text Classification'
      ],
      methodsAndWorkflows: [
        'Retrieval-Augmented Context Synthesis',
        'Source-Traceable Requirement Extraction',
        'Local Model Prototyping (Ollama)',
        'Server-Side API Proxy Architecture'
      ],
      productionTools: [
        'Google Gemini 2.5 / 2.0 API',
        '@google/genai SDK',
        'Python',
        'Ollama',
        'LangChain',
        'REST & JSON-RPC'
      ],
      featuredReferences: [
        { label: 'ASSURE Research Framework', targetId: 'papers', type: 'paper' },
        { label: 'Jana Nayagan AI Civic Triage', targetId: 'papers', type: 'paper' }
      ]
    }
  },
  {
    id: 'software-development',
    number: '02',
    title: 'Software Development',
    tagline: 'Modern reactive architecture & web systems',
    shortDescription: 'Constructing robust full-stack applications with TypeScript, modern component lifecycles, and low-latency interaction pipelines.',
    graphicType: 'code',
    expanded: {
      overview: 'Building responsive, performant web applications with modular component architecture, strict type contracts, and compositor-accelerated visual systems.',
      coreCompetencies: [
        'Component Architecture & State Orchestration',
        'Full-Stack Node.js & Express Engineering',
        'TypeScript Interface Contracts',
        'Performance & Runtime Frame Optimization'
      ],
      methodsAndWorkflows: [
        'Strict Type-Safe Data Modeling',
        'Intersection & Resize Observer Systems',
        'Compositor-Only Motion Transitions',
        'Fluid Responsive Breakpoint Geometry'
      ],
      productionTools: [
        'React 19',
        'TypeScript',
        'Vite',
        'Tailwind CSS v4',
        'Node.js & Express',
        'Git & GitHub'
      ],
      featuredReferences: [
        { label: 'Engineering Portfolio', targetId: 'projects', type: 'project' },
        { label: 'Jana Nayagan Web Prototype', targetId: 'papers', type: 'paper' }
      ]
    }
  },
  {
    id: 'research-systems-thinking',
    number: '03',
    title: 'Research & Systems Thinking',
    tagline: 'Theoretical modeling & constraint analysis',
    shortDescription: 'Investigating evidence-fusion engines, multi-source validation, and theoretical systems architecture for legal and civic domains.',
    graphicType: 'research',
    expanded: {
      overview: 'Conducting academic and applied research on complex information workflows, architectural boundary constraints, and verifiable multi-party proof systems.',
      coreCompetencies: [
        'System Architecture Specification',
        'Multi-Source Evidence Fusion Concepts',
        'Academic Manuscript Composition',
        'Empirical Gap & Boundary Analysis'
      ],
      methodsAndWorkflows: [
        'Taxonomy Classification Modeling',
        'Operational Pipeline Verification',
        'Literature Review & Gap Identification',
        'Traceability Chain Synthesis'
      ],
      productionTools: [
        'LaTeX',
        'Overleaf',
        'Research Dossier Synthesis',
        'Technical Literature Review',
        'Markdown Documentation'
      ],
      featuredReferences: [
        { label: 'SAMAY & SAAKSHI Proof Engine', targetId: 'papers', type: 'paper' },
        { label: 'ASSURE Document Framework', targetId: 'papers', type: 'paper' }
      ]
    }
  },
  {
    id: 'product-thinking',
    number: '04',
    title: 'Product Thinking',
    tagline: 'Vision mapping & MVP iteration loops',
    shortDescription: 'Translating open-ended human challenges into structured product constitutions, user loops, and functional prototypes.',
    graphicType: 'product',
    expanded: {
      overview: 'Defining product boundaries, core feedback loops, and intuitive user journeys that deliver measurable utility before unnecessary complexity is introduced.',
      coreCompetencies: [
        'MVP Scoping & Feature Prioritization',
        'User Workflow & Friction Mapping',
        'Product Constitution & Principle Definition',
        'Rapid Iterative Prototyping'
      ],
      methodsAndWorkflows: [
        'First-Principles Scope Reduction',
        'Progression Loop Choreography',
        'Feedback-Driven UX Refinement',
        'Feature Boundary Governance'
      ],
      productionTools: [
        'Figma Concept Wireframes',
        'Product Specifications',
        'User Journey Blueprints',
        'Rapid UI Proof-of-Concepts'
      ],
      featuredReferences: [
        { label: 'ASTA-NOVARA Progression Lore', targetId: 'wip', type: 'project' },
        { label: 'LOCK IN Study Sanctuary', targetId: 'wip', type: 'project' }
      ]
    }
  },
  {
    id: 'creative-communication',
    number: '05',
    title: 'Creative Communication',
    tagline: 'Cinematic staging & interaction design',
    shortDescription: 'Synthesizing visual editorial poise, ambient sound staging, and immersive motion design to tell compelling technical stories.',
    graphicType: 'creative',
    expanded: {
      overview: 'Merging engineering precision with cinematic storytelling, sensory feedback, and typography to build distinctive, memorable digital experiences.',
      coreCompetencies: [
        'Editorial Typographic Hierarchy',
        'Spatial & 3D Interactive Design',
        'Ambient Audio Staging & Web Audio API',
        'Technical Storytelling & Art Direction'
      ],
      methodsAndWorkflows: [
        'Depth-Layered 3D Perspective Staging',
        'Micro-Interaction Latency Tuning',
        'Acoustic Feedback Choreography',
        'Visual Restraint & Anti-Slop Discipline'
      ],
      productionTools: [
        'CSS 3D Transforms',
        'Web Audio API Synthesizers',
        'Motion / Framer Motion',
        'Canvas2D & WebGL Shaders',
        'Figma'
      ],
      featuredReferences: [
        { label: 'Domain Expansion Cinematic', targetId: 'hero', type: 'project' },
        { label: 'Pit Wall Radio Console', targetId: 'contact', type: 'project' }
      ]
    }
  },
  {
    id: 'business-operations',
    number: '06',
    title: 'Business & Operations',
    tagline: 'Venture origination & operational execution',
    shortDescription: 'Launching student entrepreneurial platforms, managing client deliverables, and executing high-throughput retail operations.',
    graphicType: 'operations',
    expanded: {
      overview: 'Combining venture-building mindset with grounded operational execution, client stakeholder communication, and meticulous inventory management.',
      coreCompetencies: [
        'Venture Origination & Value Proposition',
        'Client Scoping & Project Deliverables',
        'Retail Workflow & Inventory Logistics',
        'Cross-Functional Stakeholder Communication'
      ],
      methodsAndWorkflows: [
        'Freelance Talent Pipeline Matching',
        'Checkout System Workflow Optimization',
        'Resource Planning & Milestone Pacing',
        'Operational Quality Control'
      ],
      productionTools: [
        'GradEarn Marketplace Workflow',
        'POS & Retail Inventory Workflows',
        'Client Contract Scoping',
        'Team Resource Coordination'
      ],
      featuredReferences: [
        { label: 'Founder of GradEarn', targetId: 'venture', type: 'venture' },
        { label: 'Operational Retail Management', targetId: 'experience', type: 'project' }
      ]
    }
  }
];
