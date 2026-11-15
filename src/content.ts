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
  /** A live site or repository. */
  link?: { label: string; url: string };
  /** Screenshots, shown under the summary. Paths are relative to public/. */
  gallery?: { src: string; alt: string; caption: string; device: 'phone' | 'browser'; span?: boolean }[];
  summary: string;
  sections: { heading: string; body: string[] }[];
}

export const projects: Project[] = [
  {
    slug: 'bitcoin-fraud-detection',
    title: 'Bitcoin Fraud Detection',
    kind: 'Machine learning, Kaggle',
    tools: ['Python', 'LightGBM', 'XGBoost', 'CatBoost'],
    link: { label: 'View the code on GitHub', url: 'https://github.com/melody-goh/bt4012-kaggle' },
    summary:
      'Predicting illicit Bitcoin transactions in future time steps with graph-based features and a temporally validated gradient-boosting ensemble, reaching a ROC-AUC of 0.949 on held-out data.',
    sections: [
      {
        heading: 'Problem',
        body: [
          'A Kaggle competition on the Elliptic Bitcoin transaction graph. Models learn from labelled transactions in time steps 1 to 35 and are scored by ROC-AUC on steps 36 to 49, so they have to hold up as patterns of fraud change.',
          'Each transaction comes with 165 numerical features.',
        ],
      },
      {
        heading: 'Approach',
        body: [
          'I added graph features that look upstream: the mean and standard deviation of eight key features across each transaction’s incoming neighbours, plus its in-degree and the number of visible sources.',
          'I trained and compared LightGBM, XGBoost and CatBoost with temporal validation, scoring each on ROC-AUC and PR-AUC so the comparison reflected how the models hold up over time.',
          'The final submission blends gradient-boosted models trained on different feature subsets, recency weightings and time windows, averaged on the logit scale.',
        ],
      },
      {
        heading: 'Result',
        body: [
          'The final submissions scored 0.954 ROC-AUC on the public leaderboard, and the ensemble reached 0.949 on a held-out evaluation set.',
        ],
      },
      {
        heading: 'Reproducibility',
        body: [
          'One script rebuilds both final submissions from the raw competition data in a few minutes on a laptop, matching the files submitted to Kaggle to about 15 decimal places.',
          'Every submission is logged with its rationale and the validation rule declared before the experiment ran.',
        ],
      },
    ],
  },
  {
    slug: 'vinyl-shelf',
    title: 'Vinyl Shelf',
    kind: 'AI retrieval',
    tools: ['PostgreSQL', 'pgvector', 'Embeddings', 'Batch pipelines'],
    link: { label: 'Try the demo', url: 'https://vinylshelf.pages.dev/' },
    summary:
      'A music discovery system over a curated catalogue of 150K vinyl albums. Hybrid semantic and keyword search reaches 0.91 Precision@10.',
    gallery: [
      {
        src: 'projects/vinyl-shelf/discover.webp',
        alt: 'Vinyl Shelf Discover view: a search for “moody 70s jazz with strings” showing Don Ellis’s Haiku, 1973, with its label, sound and similar artists.',
        caption: 'Search by describing a sound. “Moody 70s jazz with strings” brings up Don Ellis’s Haiku (1973).',
        device: 'browser',
        span: true,
      },
      {
        src: 'projects/vinyl-shelf/shelf.webp',
        alt: 'A record opened on the shelf: Miles Davis, Kind of Blue, with its tracklist, previews and pressing details.',
        caption: 'Each record opens like a sleeve, with its tracklist, previews and pressing details.',
        device: 'browser',
      },
      {
        src: 'projects/vinyl-shelf/library.webp',
        alt: 'The library: a grid of album covers with filters for genre, style, decade and colour.',
        caption: 'The library, filterable by genre, style, decade and colour.',
        device: 'browser',
      },
    ],
    sections: [
      {
        heading: 'The app',
        body: [
          'Vinyl Shelf turns a Discogs collection into a shelf you browse one record at a time: open a sleeve, read its liner notes, and thumb through the rest. Discover adds search by description, built on the retrieval system below.',
        ],
      },
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
    link: { label: 'Visit the live site', url: 'https://matcha-map-beta.vercel.app/' },
    gallery: [
      {
        src: 'projects/matcha-map/map.webp',
        alt: 'Matcha Map home screen: a map of Telok Ayer with price pins, filter chips and a café card.',
        caption: 'The map, with filters for grade, preparation, milk and price.',
        device: 'phone',
      },
      {
        src: 'projects/matcha-map/cafe.webp',
        alt: 'Café page for Hellu Coffee, showing its seal, address, hours and drink prices.',
        caption: 'A café page. Details that aren’t published are marked, not guessed.',
        device: 'phone',
      },
      {
        src: 'projects/matcha-map/seal-book.webp',
        alt: 'The seal book, empty, with a blind-embossed lotus seal and the next neighbourhood stamp.',
        caption: 'The seal book, with an uncollected seal blind-embossed.',
        device: 'phone',
      },
    ],
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
      'A real-time voice assistant that turns spoken requests into tasks and calendar events. Built end to end in 48 hours by a team of five at the Tech:Europe Stockholm AI Hackathon.',
    sections: [
      {
        heading: 'What it does',
        body: [
          'You speak; it acts. Audio streams over WebSocket to the OpenAI Realtime API, and the assistant turns requests into real actions: creating tasks, scheduling calendar events and answering follow-up questions in context.',
        ],
      },
      {
        heading: 'Build',
        body: [
          'As a cross-functional team of five, we built the whole stack in 48 hours: a FastAPI backend that handles LLM interactions, tool execution and API routing; n8n workflows that carry out the tasks; and a React and TypeScript frontend.',
          'Prompt pipelines and tool-calling logic translate natural language into structured actions across external services. Session-based memory keeps the conversation stateful, so a follow-up like “move it to Friday” knows what “it” is.',
        ],
      },
      {
        heading: 'Outcome',
        body: [
          'A working end-to-end prototype, from spoken request to completed task, delivered within the hackathon’s 48 hours.',
        ],
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
    link: { label: 'Visit the live site', url: 'https://nomster-13cf2.web.app/' },
    gallery: [
      {
        src: 'projects/nomster/maps.webp',
        alt: 'Nomster Maps page: restaurants near the user on a live Google map, with budget filters and sorting.',
        caption: 'Restaurants near you on a live Google map, with budget filters and sorting by rating or distance.',
        device: 'browser',
        span: true,
      },
      {
        src: 'projects/nomster/feed.webp',
        alt: 'Nomster community feed: a post of a pizza with likes, comments and a toggle between everyone and friends.',
        caption: 'The community feed, switchable between everyone and friends, with likes and comments.',
        device: 'browser',
      },
      {
        src: 'projects/nomster/share.webp',
        alt: 'Share Your Plate form: uploaded photos, restaurant details with address and Google rating, and five rating categories.',
        caption: 'Sharing a plate: photos, restaurant details from Google Maps, and ratings for taste, atmosphere, service and value.',
        device: 'browser',
      },
      {
        src: 'projects/nomster/foodprint.webp',
        alt: 'My FoodPrint page: a list of visited restaurants with ratings and visit dates, beside a Wish-to-Try tab.',
        caption: 'My FoodPrint: the places you’ve visited, beside a wish-to-try list.',
        device: 'browser',
        span: true,
      },
    ],
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
    title: 'Web development',
    items: ['React', 'Next.js', 'Vue.js', 'HTML and CSS', 'Firebase', 'Vite'],
  },
  {
    title: 'Backend and tools',
    items: ['FastAPI', 'Streamlit', 'REST APIs', 'WebSocket', 'Power Automate', 'Git'],
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
    title: 'Leadership and activities',
    entries: [
      {
        role: 'Head, Tembusu Thriftbusu',
        org: 'Tembusu College, NUS',
        dates: 'Oct 2023 to May 2025',
        note: 'Led a 220+ member student fashion sustainability initiative: external collaborations, community events and donation resales for charitable causes.',
      },
      {
        role: 'Marketing and UI/UX Design Executive',
        org: 'NUS Technopreneurship Society (StartIT)',
        dates: 'Sep 2023 to Apr 2024',
        note: 'Supported outreach through digital marketing, product messaging and user-facing content.',
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
  note: 'Away from data, I play music and follow fashion, especially the history of the great fashion houses. This site comes from that interest: its field of blue blocks is drawn from the set OMA/AMO built for Prada Men’s Spring/Summer 2012.',
  reference: {
    text: 'the set OMA/AMO built for Prada Men’s Spring/Summer 2012',
    url: 'https://www.prada.com/ww/en/pradasphere/fashion-shows/2012/ss-menswear.html',
  },
  groups: [
    {
      title: 'Languages',
      items: [
        { title: 'English', meta: 'Native' },
        { title: 'Chinese', meta: 'Native' },
        { title: 'German', meta: 'Advanced' },
        { title: 'Swedish', meta: 'Beginner' },
      ],
    },
    {
      title: 'Interests',
      items: [
        { title: 'Music', meta: 'Piano, electric guitar, electric bass, French horn' },
        { title: 'Fashion', meta: 'Fashion houses and fashion history' },
      ],
    },
  ],
};
