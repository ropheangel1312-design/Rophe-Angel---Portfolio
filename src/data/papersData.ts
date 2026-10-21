import { PaperItem } from '../types';

export const papersData: PaperItem[] = [
  {
    id: 'paper-assure',
    number: '01',
    title: 'ASSURE: A Proposed Framework for Intelligent Tender Document Simplification and Requirement Extraction',
    logoUrl: '/assets/logos/assure.png',
    fallbackLogoUrl: 'https://plain-apac-prod-public.komododecks.com/202610/21/16j9p2UuioTEchXIDJfZ/image.png',
    paperUrl: '', // Preserved for direct Google Drive manuscript link when configured
    repositoryUrl: 'https://github.com/ropheangel1312-design/Assure---Demo.git',
    abstract: 'A conceptual document-intelligence framework exploring how complex procurement tenders could be transformed into structured requirements, supporting-document checklists, and source-traceable explanations.',
    category: 'Individual conceptual research',
    status: 'UNPUBLISHED',
    researchStage: 'Proposed framework; empirical evaluation pending',
    contribution: 'Conceptual research and proposed framework',
    limitations: [
      'Represented honestly as a proposed conceptual research framework.',
      'Pipeline and evaluation approach are conceptual and pending empirical benchmark validation.',
      'Not an experimentally validated or production-deployed system; no benchmark results or working capabilities are claimed beyond the theoretical model.'
    ]
  },
  {
    id: 'paper-jana-nayagan',
    number: '02',
    title: 'Jana Nayagan: Design and Prototype Development of an AI-Assisted Civic Complaint Management System',
    logoUrl: '/assets/logos/jana_nayagan.png',
    fallbackLogoUrl: 'https://plain-apac-prod-public.komododecks.com/202610/21/mA2JNZwjOy7nxFbAUUa9/image.png',
    paperUrl: '', // Preserved for direct Google Drive manuscript link when configured
    repositoryUrl: 'https://github.com/ropheangel1312-design/Jana-Nayagan.git',
    abstract: 'A civic-technology prototype exploring how citizen complaints, administrative workflows, location context, and AI-assisted analysis could be brought together in one web application.',
    category: 'Prototype study',
    status: 'UNPUBLISHED',
    researchStage: 'Frontend prototype; backend integration incomplete',
    contribution: 'Prototype development and research, represented according to the actual project and manuscript.',
    limitations: [
      'Backend integration is incomplete and end-to-end functionality has not been fully validated.',
      'UI rendering challenges were addressed, but this does not imply a complete or production-ready backend.',
      'AI-assisted text and image classification is an exploratory prototype, not an experimentally validated ML benchmark.',
      'Upload, map geocoding, and administrative triage workflows have not been validated for high-concurrency production.',
      'No completed user trials, municipal deployments, or real-world civic impact metrics are claimed.'
    ]
  },
  {
    id: 'paper-samay-saakshi',
    number: '03',
    title: 'SAMAY & SAAKSHI: A Novel Multi-Source Operational-Performance Proof Engine for MSME Receivables Recovery and Legal Enforcement',
    logoUrl: '/assets/logos/samay_saakshi.png',
    fallbackLogoUrl: 'https://plain-apac-prod-public.komododecks.com/202610/21/ZncxHiVFIF5JU72N4VfD/image.png',
    paperUrl: '', // Preserved for direct Google Drive manuscript link when configured
    // No repository URL for SAMAY & SAAKSHI per specification
    abstract: 'Team research exploring a proposed evidence-fusion framework for documenting transactions and supporting MSME receivables recovery.',
    category: 'Team research',
    status: 'UNPUBLISHED',
    researchStage: 'Proposed architecture; implementation and validation are not established',
    contribution: 'Research only',
    authors: [
      'Sri Raamanuja Dasan',
      'Kannan Y',
      'Rophe Angel',
      'Joyce Blessy'
    ],
    myRoleClarification: 'Research contribution only. Not the sole author, not the sole originator of the team project, and not responsible for building the complete architecture. The proposed evidence-fusion engine is theoretical and neither deployed nor experimentally validated.'
  }
];
