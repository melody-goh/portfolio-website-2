// Site content. Everything the page shows is defined here.

export const site = {
  name: 'Melody Goh',
  intro:
    'Business Analytics at NUS, specialising in machine learning. I build the pipelines, models and dashboards that turn untidy data into decisions.',
  email: 'melodygohxn@gmail.com',
  resume: 'resume.pdf',
  links: [
    { label: 'LinkedIn', hint: 'Profile', url: 'https://www.linkedin.com/in/melodygohxn' },
    { label: 'GitHub', hint: 'Code', url: 'https://github.com/melody-goh' },
  ],
};

export interface Project {
  slug: string;
  title: string;
  kind: string;
  year?: string;
  role?: string;
  tools: string[];
  /**
   * Share of the work each tool carried, in percent, in the same order as
   * `tools`. Optional: without it the care label lists the tools only.
   * Example: toolShare: [60, 25, 15]
   */
  toolShare?: number[];
  summary: string;
  sections: { heading: string; body: string[] }[];
}

export const projects: Project[] = [
  {
    slug: 'bitcoin-fraud-detection',
    title: 'Bitcoin Fraud Detection',
    kind: 'Machine learning',
    tools: ['LightGBM', 'XGBoost', 'CatBoost', 'Graph features'],
    summary:
      'Classifying illicit Bitcoin transactions with graph-based features and a temporally validated gradient-boosting ensemble, reaching a ROC-AUC of 0.949 on held-out data.',
    sections: [
      {
        heading: 'Problem',
        body: [
          'Flag illicit transactions in a Bitcoin transaction network, where each transaction comes with 165 numerical features and the patterns of fraud shift over time.',
        ],
      },
      {
        heading: 'Approach',
        body: [
          'I extracted graph-based features from the transaction network, adding upstream transaction information to the existing feature set.',
          'I trained and compared LightGBM, XGBoost and CatBoost with temporal validation, scoring each on ROC-AUC and PR-AUC so the comparison reflected how the models hold up as transaction patterns change.',
        ],
      },
      {
        heading: 'Result',
        body: [
          'The final ensemble combines the graph features, complementary feature subsets and temporal weighting. It reached a ROC-AUC of 0.949 on a held-out evaluation set.',
        ],
      },
    ],
  },
  {
    slug: 'vinyl-shelf',
    title: 'Vinyl Shelf',
    kind: 'AI retrieval',
    tools: ['PostgreSQL', 'pgvector', 'Embeddings', 'Batch pipelines'],
    summary:
      'A music discovery system over a curated catalogue of 150K vinyl albums. Hybrid semantic and keyword search reaches 0.91 Precision@10.',
    sections: [
      {
        heading: 'Data',
        body: [
          'A batch ingestion pipeline streams, cleans and classifies millions of Discogs release records into a curated catalogue of 150K vinyl albums, published as versioned datasets for retrieval.',
          'Background jobs are resumable, records are schema-validated, and data retention respects each source licence.',
        ],
      },
      {
        heading: 'Retrieval',
        body: [
          'Each album has a 384-dimensional embedding stored in PostgreSQL with pgvector and an HNSW index, so search can combine semantic similarity with keyword matching.',
        ],
      },
      {
        heading: 'Evaluation',
        body: [
          'On 30 manually labelled queries, hybrid retrieval reached 0.91 Precision@10, against 0.79 for semantic search alone and 0.76 for keyword search alone.',
        ],
      },
    ],
  },
  {
    slug: 'matcha-map',
    title: 'Matcha Map',
    kind: 'Product design',
    tools: ['Next.js', 'TypeScript', 'React', 'CSS Modules', 'SVG', 'Python'],
    summary:
      'A field guide to Singapore’s matcha: a phone-first web app mapping 50 matcha cafés and home cafés, with a seal book for collecting the spots you visit.',
    sections: [
      {
        heading: 'The guide',
        body: [
          'Every listing comes from current food guides and is geocoded by postal code. Each spot shows what is actually known about its matcha: grade, origin, how it is prepared, prices and hours.',
          'Anything that isn’t published is marked as unknown rather than guessed.',
        ],
      },
      {
        heading: 'The seal book',
        body: [
          'To encourage exploring, the app borrows the Japanese tradition of goshuin, the seal books kept at temples. Logging a cup presses that café’s own seal into your book, and completing a neighbourhood earns a collectible stamp.',
        ],
      },
      {
        heading: 'Visual language',
        body: [
          'The design draws on celadon porcelain and relief-carved ornament: a hairline-engraved SVG ornament system, five seal inks, and blind-embossed seals for spots not yet collected. When you log a visit, a short animation gathers dots into a lotus before the seal stamps down.',
        ],
      },
      {
        heading: 'Next',
        body: [
          'Live Google Maps, a Supabase database, and an automated listings pipeline using the Google Places API, scraping and AI extraction.',
        ],
      },
    ],
  },
  {
    slug: 'voice-assistant',
    title: 'Voice AI Assistant',
    kind: 'Hackathon, Stockholm',
    tools: ['OpenAI Realtime API', 'FastAPI', 'React', 'TypeScript', 'WebSocket', 'n8n'],
    summary:
      'A real-time voice assistant that turns spoken requests into tasks and calendar events. Built end to end in 48 hours with a team of five at the Tech:Europe Stockholm AI Hackathon.',
    sections: [
      {
        heading: 'What it does',
        body: [
          'The assistant streams audio over WebSocket to the OpenAI Realtime API, then creates tasks, schedules calendar events and answers in context.',
        ],
      },
      {
        heading: 'Build',
        body: [
          'I engineered the FastAPI backend that handles LLM interactions, tool execution and API routing, with n8n workflows for task automation and a React and TypeScript frontend.',
          'Prompt pipelines and tool-calling logic translate natural language into structured actions across external services. Session-based memory keeps the conversation stateful.',
        ],
      },
      {
        heading: 'Outcome',
        body: ['A working end-to-end prototype, delivered within the 48 hours of the hackathon.'],
      },
    ],
  },
  {
    slug: 'approval-controls',
    title: 'Approval Controls',
    kind: 'Hackathon, top 5 finalist',
    tools: ['React', 'TypeScript', 'LLM APIs'],
    summary:
      'An AI-enabled, no-code platform that turns a CFO’s approval requirements into configurable workflows. Top 5 finalist at the Light x Lovable x McKinsey Finance Hackathon.',
    sections: [
      {
        heading: 'Problem',
        body: [
          'The MVP translates a CFO’s approval requirements into configurable workflows with transaction thresholds, escalation rules and risk controls, without anyone writing code.',
        ],
      },
      {
        heading: 'Build',
        body: [
          'A rule-based validation engine and a scenario simulator model approval routing, processing timelines and control risks across financial workflows, using vendor and transaction data brought in through APIs.',
        ],
      },
    ],
  },
  {
    slug: 'nomster',
    title: 'Nomster',
    kind: 'Full-stack web app',
    role: 'Frontend lead',
    tools: ['Vue.js', 'Firebase', 'Google Maps API'],
    summary:
      'A community-driven food discovery platform where people share reviews, follow each other and curate their own dining lists. Built with Vue.js and Firebase in an agile Scrum team.',
    sections: [
      {
        heading: 'The product',
        body: [
          'Nomster is a social platform for finding food: users post reviews, follow friends, and keep personalised lists of places to eat, with location-based recommendations through the Google Maps API.',
        ],
      },
      {
        heading: 'My part',
        body: [
          'I led frontend development of the core user flows: authentication, the activity feed, profiles and list management, with a responsive interface that works across devices.',
          'I also built key social and discovery features, including review posting, friend-following and the map-based recommendations.',
        ],
      },
      {
        heading: 'Data and real time',
        body: [
          'Firebase Authentication handles user management, and the Realtime Database carries posts, likes and comments so they appear for everyone as they happen.',
        ],
      },
      {
        heading: 'Delivery',
        body: [
          'The team worked in Scrum sprints, sharing feature development and testing, and deployed the app on Firebase Hosting.',
        ],
      },
    ],
  },
];

export const skills = [
  {
    title: 'Programming',
    items: ['Python (Pandas, NumPy, scikit-learn)', 'SQL', 'R', 'Java', 'JavaScript', 'TypeScript'],
  },
  {
    title: 'Data and analytics',
    items: ['Apache Spark', 'Microsoft Fabric', 'Databricks', 'Power BI', 'Tableau', 'MySQL'],
  },
  {
    title: 'AI and machine learning',
    items: ['LLM application development', 'Feature engineering', 'Model evaluation'],
  },
  {
    title: 'Frameworks and tools',
    items: ['FastAPI', 'Streamlit', 'React', 'Firebase', 'REST APIs', 'WebSocket', 'Power Automate', 'Git'],
  },
];

export interface Entry {
  role: string;
  org: string;
  dates: string;
  note: string;
}

export const experience: { title: string; entries: Entry[] }[] = [
  {
    title: 'Work',
    entries: [
      {
        role: 'Data Analyst Intern, Data and Cloud Consulting',
        org: 'KPMG Singapore',
        dates: 'Jul 2026 to present',
        note: 'Enterprise data migration on Microsoft Fabric, Spark and SQL: modelling 300K+ records, validating and reconciling them across a medallion architecture, and building Power BI reporting for stakeholders.',
      },
      {
        role: 'Data Analytics and Quality Assurance Intern',
        org: 'CathPrint AB',
        dates: 'Sep 2025 to Jul 2026',
        note: 'Built a human-in-the-loop document automation pipeline that removed 75% of manual processing, and a Power BI audit dashboard that sped up corrective resolution by 45%.',
      },
      {
        role: 'Business Analytics and Development Intern',
        org: 'Embio Medical AB',
        dates: 'Aug 2025 to Jul 2026',
        note: 'Built a research intelligence tool in Python and Streamlit that scores new biomedical research by embedding relevance and summarises it with an LLM. Led the rebuild of the company website.',
      },
      {
        role: 'Project Analyst',
        org: '180 Degrees Consulting Singapore',
        dates: 'Jan 2025 to May 2025',
        note: 'Analysed donor acquisition funnels and segments for a client. Three of the resulting recommendations were adopted for immediate implementation.',
      },
    ],
  },
  {
    title: 'Leadership',
    entries: [
      {
        role: 'Head, Tembusu Thriftbusu',
        org: 'Tembusu College, NUS',
        dates: 'Oct 2023 to May 2025',
        note: 'Led a 220+ member student fashion sustainability initiative: external collaborations, community events and donation resales for charitable causes.',
      },
    ],
  },
  {
    title: 'Education',
    entries: [
      {
        role: 'BSc (Hons) Business Analytics',
        org: 'National University of Singapore',
        dates: 'Aug 2023 to May 2027',
        note: 'Machine Learning Analytics specialisation, Minor in Statistics. GPA 4.44 / 5.',
      },
      {
        role: 'NUS Overseas Colleges, Stockholm',
        org: 'KTH Royal Institute of Technology',
        dates: 'Aug 2025 to Jul 2026',
        note: 'Year-long programme combining startup internships with coursework in business, innovation and entrepreneurship.',
      },
    ],
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
