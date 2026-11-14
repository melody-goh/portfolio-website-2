// All site content lives here. Everything below is placeholder copy:
// replace it with real material and the layout adapts on its own.

export const site = {
  name: 'Melody Goh',
  intro:
    'Business analytics, AI and machine learning. I turn untidy data into decisions people can act on.',
  tagline: 'Business analytics, AI and machine learning',
  email: 'hello@example.com',
  resume: 'resume.pdf',
  links: [
    { label: 'LinkedIn', hint: 'Profile', url: 'https://www.linkedin.com/' },
    { label: 'GitHub', hint: 'Code', url: 'https://github.com/' },
  ],
};

export interface Project {
  slug: string;
  title: string;
  kind: string;
  year: string;
  role: string;
  tools: string[];
  summary: string;
  sections: { heading: string; body: string[] }[];
}

const body = (subject: string): Project['sections'] => [
  {
    heading: 'Context',
    body: [
      `Placeholder. Describe who had the ${subject} problem, what it was costing them, and what a good answer would let them do differently.`,
      'Keep it to two short paragraphs. A reader should understand the stakes before they see any method.',
    ],
  },
  {
    heading: 'Approach',
    body: [
      'Placeholder. Walk through the data you had, the options you weighed and the one you chose. Name the trade-offs plainly.',
      'A chart, a schema or a short notebook excerpt belongs here.',
    ],
  },
  {
    heading: 'Outcome',
    body: [
      'Placeholder. State what changed and how you measured it. Add real figures only once you have them.',
    ],
  },
];

export const projects: Project[] = [
  {
    slug: 'churn-signals',
    title: 'Churn Signals',
    kind: 'Predictive modelling',
    year: '2025',
    role: 'Analyst and modeller',
    tools: ['Python', 'scikit-learn', 'SQL'],
    summary:
      'Placeholder summary. One sentence on the problem, one on the method, one on the result.',
    sections: body('customer churn'),
  },
  {
    slug: 'demand-forecast',
    title: 'Demand Forecast',
    kind: 'Time series',
    year: '2025',
    role: 'Lead analyst',
    tools: ['Python', 'Prophet', 'dbt'],
    summary:
      'Placeholder summary. One sentence on the problem, one on the method, one on the result.',
    sections: body('demand planning'),
  },
  {
    slug: 'pricing-lab',
    title: 'Pricing Lab',
    kind: 'Experimentation',
    year: '2024',
    role: 'Experiment design',
    tools: ['SQL', 'R', 'Tableau'],
    summary:
      'Placeholder summary. One sentence on the problem, one on the method, one on the result.',
    sections: body('pricing'),
  },
  {
    slug: 'support-triage',
    title: 'Support Triage',
    kind: 'Language models',
    year: '2024',
    role: 'ML engineer',
    tools: ['Python', 'PyTorch', 'LLM APIs'],
    summary:
      'Placeholder summary. One sentence on the problem, one on the method, one on the result.',
    sections: body('support routing'),
  },
  {
    slug: 'ops-dashboard',
    title: 'Ops Dashboard',
    kind: 'Business intelligence',
    year: '2023',
    role: 'BI developer',
    tools: ['Power BI', 'SQL', 'Excel'],
    summary:
      'Placeholder summary. One sentence on the problem, one on the method, one on the result.',
    sections: body('operations reporting'),
  },
];

export const skills = [
  {
    title: 'Analytics',
    items: ['SQL', 'Excel modelling', 'Tableau', 'Power BI', 'A/B testing', 'Forecasting'],
  },
  {
    title: 'Machine learning',
    items: ['Python', 'scikit-learn', 'PyTorch', 'Feature design', 'Evaluation', 'LLM apps'],
  },
  {
    title: 'Working with people',
    items: ['Stakeholder briefs', 'Data storytelling', 'Requirements', 'Workshops', 'Documentation', 'Mentoring'],
  },
];

export const roles = [
  {
    role: 'Most recent role',
    org: 'Organisation name',
    dates: '2025 to present',
    note: 'Placeholder. One line on scope and the result you are proudest of.',
  },
  {
    role: 'Previous role',
    org: 'Organisation name',
    dates: '2024 to 2025',
    note: 'Placeholder. One line on scope and the result you are proudest of.',
  },
  {
    role: 'Earlier role',
    org: 'Organisation name',
    dates: '2023 to 2024',
    note: 'Placeholder. One line on scope and the result you are proudest of.',
  },
];

export const outside = {
  note: 'Placeholder. A short note on what you do away from the data: what you play, make or follow, and what it gives you.',
  items: [
    { title: 'Music', meta: 'Placeholder', url: '' },
    { title: 'Second interest', meta: 'Placeholder', url: '' },
    { title: 'Third interest', meta: 'Placeholder', url: '' },
  ],
};
