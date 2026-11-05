import type {
  SearchData,
  WebSearchResult,
  ImageSearchResult,
  VideoSearchResult,
  NewsSearchResult,
} from '../types';

const SEARCH_HISTORY_KEY = 'carule_search_history';

// Popular trending and technical topics for autocomplete & quick generation
const POPULAR_SUGGESTIONS = [
  'react 19 features and release date',
  'agentic ai browser architecture',
  'how do ai agents work in 2026',
  'tailwind css v4 upgrade guide',
  'vite vs turbopack benchmarks',
  'electron vs tauri for desktop apps',
  'deepseek r1 open source models',
  'chatgpt vs claude 3.7 sonnet',
  'nextjs 15 app router best practices',
  'typescript 5.8 features',
  'framer motion liquid layout animations',
  'dynamic island css concave fillets',
  'google search operators cheat sheet',
  'best agentic workflows for developers',
  'github trending repositories today',
  'huggingface open source llm leaderboards',
  'web assembly in modern browsers',
  'rust programming for beginners',
];

export const getSearchHistory = (): string[] => {
  try {
    const raw = localStorage.getItem(SEARCH_HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const saveSearchHistory = (query: string): void => {
  if (!query.trim()) return;
  try {
    const history = getSearchHistory();
    const filtered = [query.trim(), ...history.filter((q) => q.toLowerCase() !== query.trim().toLowerCase())].slice(0, 10);
    localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(filtered));
  } catch {
    // Ignore storage quota errors
  }
};

export const removeSearchHistoryItem = (query: string): string[] => {
  try {
    const history = getSearchHistory();
    const updated = history.filter((q) => q !== query);
    localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(updated));
    return updated;
  } catch {
    return [];
  }
};

// Autocomplete suggestions (combines local history + curated popular queries + Wikipedia opensearch)
export const getAutocompleteSuggestions = async (query: string): Promise<string[]> => {
  const clean = query.trim().toLowerCase();
  if (!clean) return getSearchHistory().slice(0, 5);

  const historyMatches = getSearchHistory().filter((item) =>
    item.toLowerCase().includes(clean)
  );

  const curatedMatches = POPULAR_SUGGESTIONS.filter((item) =>
    item.toLowerCase().includes(clean)
  );

  // Optional quick fetch to Wikipedia OpenSearch (CORS-friendly, no backend)
  let wikiSuggestions: string[] = [];
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 600);
    const res = await fetch(
      `https://en.wikipedia.org/w/api.php?action=opensearch&search=${encodeURIComponent(
        clean
      )}&limit=5&namespace=0&format=json&origin=*`,
      { signal: controller.signal }
    );
    clearTimeout(timeout);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data[1])) {
        wikiSuggestions = data[1].map((s: string) => s.toLowerCase());
      }
    }
  } catch {
    // Graceful offline fallback
  }

  const combined = Array.from(
    new Set([...historyMatches, ...curatedMatches, ...wikiSuggestions])
  );

  return combined.slice(0, 7);
};

// Generates high quality curated search results for any query
export const fetchSearchResults = async (query: string): Promise<SearchData> => {
  const cleanQuery = query.trim();
  saveSearchHistory(cleanQuery);

  const startTime = performance.now();

  // Try fetching live Wikipedia summary for instant knowledge card & AI overview
  let wikiData: {
    title?: string;
    extract?: string;
    description?: string;
    thumbnail?: string;
  } | null = null;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 1200);
    const res = await fetch(
      `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(cleanQuery)}`,
      { signal: controller.signal }
    );
    clearTimeout(timeout);
    if (res.ok) {
      const data = await res.json();
      if (data.type !== 'disambiguation' && data.extract) {
        wikiData = {
          title: data.title,
          extract: data.extract,
          description: data.description,
          thumbnail: data.thumbnail?.source,
        };
      }
    }
  } catch {
    // Offline / fallback mode
  }

  const durationSeconds = ((performance.now() - startTime + 180) / 1000).toFixed(2);
  const resultCount = (
    Math.floor(Math.random() * 800 + 400) * 1000000 +
    Math.floor(Math.random() * 900000)
  ).toLocaleString();

  // Web results synthesis
  const webResults: WebSearchResult[] = [
    {
      id: 'web-1',
      title: `${cleanQuery} - Official Documentation & Overview`,
      url: `https://www.carule.org/topic/${encodeURIComponent(cleanQuery)}`,
      displayUrl: `https://www.carule.org > topic > ${encodeURIComponent(cleanQuery)}`,
      snippet:
        wikiData?.extract ||
        `Comprehensive guide and documentation covering ${cleanQuery}. Explore core concepts, modern architecture, key features, step-by-step tutorials, and production best practices.`,
      date: 'Updated 2 days ago',
      sitelinks: [
        { title: 'Getting Started', url: '#' },
        { title: 'Architecture & API', url: '#' },
        { title: 'Examples & Demos', url: '#' },
        { title: 'Release Notes', url: '#' },
      ],
    },
    {
      id: 'web-2',
      title: `${cleanQuery} on GitHub - Open Source Repositories & Guides`,
      url: `https://github.com/topics/${encodeURIComponent(cleanQuery.toLowerCase().replace(/\s+/g, '-'))}`,
      displayUrl: `https://github.com > topics > ${cleanQuery.toLowerCase().replace(/\s+/g, '-')}`,
      snippet: `Explore curated open source projects, libraries, boilerplates, and developer tools related to ${cleanQuery}. Find community stars, active contributors, and latest commits.`,
      date: 'Yesterday',
    },
    {
      id: 'web-3',
      title: wikiData?.title
        ? `${wikiData.title} - Wikipedia`
        : `Understanding ${cleanQuery}: Deep Dive and Historical Analysis`,
      url: `https://en.wikipedia.org/wiki/${encodeURIComponent(cleanQuery)}`,
      displayUrl: `https://en.wikipedia.org > wiki > ${encodeURIComponent(cleanQuery)}`,
      snippet:
        wikiData?.extract?.slice(0, 220) ||
        `${cleanQuery} represents a significant evolution in technology and design. Read the comprehensive encyclopedic breakdown, origin story, key milestones, and global impact.`,
      date: 'May 2026',
    },
    {
      id: 'web-4',
      title: `Top 10 Best Practices and Pro Tips for ${cleanQuery} in 2026`,
      url: `https://dev.to/t/${encodeURIComponent(cleanQuery)}`,
      displayUrl: `https://dev.to > guide > ${cleanQuery.toLowerCase().replace(/\s+/g, '-')}-tips`,
      snippet: `Discover essential tips, performance optimizations, and pitfalls to avoid when working with ${cleanQuery}. Authored by senior engineers and community contributors.`,
      date: '4 days ago',
    },
    {
      id: 'web-5',
      title: `${cleanQuery}: Everything You Need to Know (Comprehensive Review)`,
      url: `https://www.theverge.com/tech/${encodeURIComponent(cleanQuery)}`,
      displayUrl: `https://www.theverge.com > tech > reviews`,
      snippet: `Our in-depth analysis of ${cleanQuery}. We test speed, user interface, real-world benchmarks, pros, cons, and compare it against industry standards.`,
      date: '1 week ago',
    },
    {
      id: 'web-6',
      title: `Stack Overflow Discussions & Common Issues with ${cleanQuery}`,
      url: `https://stackoverflow.com/questions/tagged/${encodeURIComponent(cleanQuery)}`,
      displayUrl: `https://stackoverflow.com > questions > tagged`,
      snippet: `Find answers to the most frequently asked technical questions, troubleshooting tips, edge cases, and code solutions for ${cleanQuery}.`,
      date: '3 hours ago',
    },
  ];

  // Images synthesis (curated high-res Unsplash links with query thematic context)
  const imageThemes = [
    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1534972195531-a756b1126f24?w=600&auto=format&fit=crop&q=80',
  ];

  const images: ImageSearchResult[] = imageThemes.map((imgUrl, idx) => ({
    id: `img-${idx + 1}`,
    title: `${cleanQuery} - High Resolution Visual Guide #${idx + 1}`,
    imageUrl: wikiData?.thumbnail && idx === 0 ? wikiData.thumbnail : imgUrl,
    sourceUrl: `https://unsplash.com/search/${encodeURIComponent(cleanQuery)}`,
    domain: idx === 0 && wikiData?.thumbnail ? 'wikipedia.org' : 'unsplash.com',
    dimensions: '1920 × 1080',
  }));

  // Videos synthesis
  const videos: VideoSearchResult[] = [
    {
      id: 'vid-1',
      title: `${cleanQuery} Complete Masterclass (Zero to Hero in 2026)`,
      url: `https://youtube.com/watch?v=mock1`,
      thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80',
      channel: 'TechCraft Academy',
      duration: '42:18',
      views: '1.4M views',
      uploadedAt: '3 weeks ago',
      snippet: `In this comprehensive masterclass, learn everything about ${cleanQuery}. Starting from the basics to advanced real-world implementations.`,
    },
    {
      id: 'vid-2',
      title: `Why Everyone is Talking About ${cleanQuery} Right Now`,
      url: `https://youtube.com/watch?v=mock2`,
      thumbnail: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=600&auto=format&fit=crop&q=80',
      channel: 'Future Tech Today',
      duration: '14:05',
      views: '620K views',
      uploadedAt: '5 days ago',
      snippet: `A breakdown of why ${cleanQuery} is transforming workflows, the key takeaways, and what developers need to know before adopting it.`,
    },
    {
      id: 'vid-3',
      title: `Build an Entire Project with ${cleanQuery} (Step by Step)`,
      url: `https://youtube.com/watch?v=mock3`,
      thumbnail: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&auto=format&fit=crop&q=80',
      channel: 'Code Pulse',
      duration: '28:50',
      views: '380K views',
      uploadedAt: '2 months ago',
      snippet: `Hands-on coding tutorial putting ${cleanQuery} into action. Full source code and architecture diagrams provided.`,
    },
    {
      id: 'vid-4',
      title: `${cleanQuery}: 5 Common Mistakes You Should Avoid`,
      url: `https://youtube.com/watch?v=mock4`,
      thumbnail: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=600&auto=format&fit=crop&q=80',
      channel: 'DevInsights',
      duration: '09:32',
      views: '215K views',
      uploadedAt: '1 week ago',
      snippet: `Avoid these 5 crucial pitfalls when working with ${cleanQuery}. Pro tips for production reliability.`,
    },
  ];

  // News synthesis
  const news: NewsSearchResult[] = [
    {
      id: 'news-1',
      title: `Major Breakthrough Announced in ${cleanQuery} Ecosystem`,
      url: `https://techcrunch.com/article/${encodeURIComponent(cleanQuery)}`,
      source: 'TechCrunch',
      timeAgo: '4 hours ago',
      snippet: `Key industry players unveiled new integration standards for ${cleanQuery}, enabling unprecedented automation and workflow velocity.`,
      imageUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&auto=format&fit=crop&q=80',
    },
    {
      id: 'news-2',
      title: `How ${cleanQuery} is Reshaping Modern Software Design in 2026`,
      url: `https://www.theverge.com/news/${encodeURIComponent(cleanQuery)}`,
      source: 'The Verge',
      timeAgo: '1 day ago',
      snippet: `A detailed report on how modern browsers and agentic platforms are adopting ${cleanQuery} principles to elevate user focus.`,
      imageUrl: 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=400&auto=format&fit=crop&q=80',
    },
    {
      id: 'news-3',
      title: `Industry Leaders Gather to Discuss the Future of ${cleanQuery}`,
      url: `https://www.reuters.com/technology/${encodeURIComponent(cleanQuery)}`,
      source: 'Reuters',
      timeAgo: '2 days ago',
      snippet: `At this year's global technology summit, leading researchers showcased real-world benchmarks proving a 40% performance gain with ${cleanQuery}.`,
    },
  ];

  // People Also Ask accordions
  const peopleAlsoAsk = [
    {
      question: `What is ${cleanQuery} and how does it work?`,
      answer:
        wikiData?.extract ||
        `${cleanQuery} is an integrated concept and toolset designed to solve key challenges in workflow automation, efficiency, and real-time interaction. It leverages modern architecture to provide seamless user experiences.`,
    },
    {
      question: `What are the primary benefits of using ${cleanQuery}?`,
      answer: `The primary benefits include increased productivity, streamlined workflows, reduced cognitive overhead, native cross-platform support, and seamless integration with modern developer tools.`,
    },
    {
      question: `Is ${cleanQuery} open source or free to use?`,
      answer: `Most core libraries and frameworks around ${cleanQuery} are released under permissive open source licenses (such as MIT or Apache 2.0), with extensive community-driven documentation and tooling available online.`,
    },
    {
      question: `What are the best alternatives to ${cleanQuery}?`,
      answer: `Depending on your use case, popular alternatives include classical modular frameworks, cloud-hosted SaaS suites, and specialized standalone CLI tools, each with their respective trade-offs in complexity and control.`,
    },
  ];

  // Related search pills
  const relatedSearches = [
    `${cleanQuery} tutorial`,
    `${cleanQuery} github`,
    `${cleanQuery} vs alternatives`,
    `${cleanQuery} architecture diagram`,
    `${cleanQuery} cheat sheet 2026`,
    `${cleanQuery} documentation`,
    `${cleanQuery} open source`,
    `${cleanQuery} best practices`,
  ];

  // AI Overview
  const aiOverview = {
    summary:
      wikiData?.extract ||
      `${cleanQuery} has emerged as an essential standard for modern high-performance systems. It provides robust capabilities for automation, reactive interfaces, and intelligent state orchestration.`,
    keyPoints: [
      `High efficiency and streamlined architecture tailored for responsive user environments.`,
      `Zero-config native compatibility with modern frontend frameworks and desktop runtimes.`,
      `Extensive community ecosystem with open-source tools, plugins, and production benchmarks.`,
    ],
    sources: [
      { name: 'Official Docs', url: `https://docs.carule.org/${encodeURIComponent(cleanQuery)}` },
      { name: 'Wikipedia', url: `https://en.wikipedia.org/wiki/${encodeURIComponent(cleanQuery)}` },
      { name: 'GitHub Topics', url: `https://github.com/topics/${encodeURIComponent(cleanQuery)}` },
    ],
  };

  // Knowledge Card (if Wikipedia returned an entity summary)
  const knowledgeCard = wikiData?.title
    ? {
        title: wikiData.title,
        subtitle: wikiData.description || 'Topic Overview',
        description: wikiData.extract || 'Comprehensive topic overview.',
        image: wikiData.thumbnail,
        attributes: [
          { label: 'Type', value: 'Encyclopedia Entry' },
          { label: 'Source', value: 'Wikipedia Open Data' },
          { label: 'Category', value: 'Technology & Science' },
        ],
      }
    : undefined;

  return {
    query: cleanQuery,
    stats: `About ${resultCount} results (${durationSeconds} seconds)`,
    aiOverview,
    knowledgeCard,
    results: webResults,
    images,
    videos,
    news,
    peopleAlsoAsk,
    relatedSearches,
  };
};

export const isSearchQueryUrl = (url: string): boolean => {
  if (!url) return false;
  if (url.startsWith('carule://search?q=')) return true;
  if (url.includes('google.com/search?') || url.includes('google.com/search/')) return true;
  return false;
};

export const extractSearchQuery = (url: string): string => {
  if (!url) return '';
  if (url.startsWith('carule://search?q=')) {
    return decodeURIComponent(url.replace('carule://search?q=', ''));
  }
  try {
    const parsed = new URL(url);
    const q = parsed.searchParams.get('q');
    if (q) return q;
  } catch {
    const match = url.match(/[?&]q=([^&]+)/);
    if (match) return decodeURIComponent(match[1].replace(/\+/g, ' '));
  }
  return url;
};
