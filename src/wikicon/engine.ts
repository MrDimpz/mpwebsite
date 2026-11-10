import type { ArchivePuzzleItem, GameMode, RoundState } from './types';

const STOPLIST = new Set([
  'a', 'an', 'the',
  'and', 'or', 'but',
  'of', 'in', 'on', 'at', 'to', 'for', 'with', 'by', 'as', 'from',
  'is', 'are', 'was', 'were', 'be', 'been', 'being',
  'it', 'its', 'this', 'that', 'these', 'those',
  'all', 'both', 'each', 'every', 'some', 'any', 'no', 'not',
  'i', 'me', 'my', 'mine', 'we', 'us', 'our', 'ours',
  'you', 'your', 'yours', 'he', 'him', 'his', 'she', 'her', 'hers',
  'they', 'them', 'their', 'theirs', 'which', 'who', 'whom', 'whose',
  'into', 'over', 'after', 'before', 'between', 'under', 'through', 'during',
]);

export function normalizeWikiWord(s: string): string {
  return String(s || '')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]/gu, '');
}

function stripDisambiguator(s: string): string {
  return String(s || '').replace(/\s*\([^)]*\)\s*$/, '').trim();
}

interface CuratedArticle {
  date: string;
  title: string;
  category: string;
  difficulty: 'Standard' | 'Challenging' | 'Expert';
  quote: string;
  fallbackParagraphs: string[];
  semanticRelated: Record<string, number>;
}

export const CURATED_ARTICLES: CuratedArticle[] = [
  {
    date: '2026-10-31',
    title: 'Aurora',
    category: 'Planetary Physics & Space',
    difficulty: 'Standard',
    quote:
      'An aurora is a natural light display in the sky, predominantly seen in high-latitude regions around the Arctic and Antarctic.',
    fallbackParagraphs: [
      "An aurora, sometimes referred to as polar lights, northern lights, or southern lights, is a natural light display in Earth's sky, predominantly seen in high-latitude regions around the Arctic and Antarctic. Auroras display dynamic patterns of brilliant lights that appear as curtains, rays, spirals, or dynamic flickers covering the entire sky.",
      'Auroras are the result of disturbances in the magnetosphere caused by the solar wind. Major disturbances result from enhancements in the speed of the solar wind from coronal holes and coronal mass ejections. These disturbances alter the trajectories of charged particles in the magnetospheric plasma.',
      'The resulting ionization and excitation of atmospheric constituents emit light of varying color and complexity. The form of the aurora, occurring within bands around both polar regions, is also dependent on the amount of acceleration imparted to the precipitating particles, mostly electrons and protons.',
    ],
    semanticRelated: {
      aurora: 1, polar: 4, magnetosphere: 7, solar: 9, northern: 12, arctic: 15, sky: 18, light: 22,
      wind: 28, plasma: 34, electrons: 41, atmosphere: 48, magnetic: 55, sun: 64, earth: 72,
      night: 85, glow: 96, radiation: 115, ionosphere: 130, borealis: 3, australis: 5,
      curtains: 140, particles: 52, protons: 60, coronal: 38, space: 90, astronomy: 110,
    },
  },
  {
    date: '2026-10-30',
    title: 'Octopus',
    category: 'Marine Biology',
    difficulty: 'Standard',
    quote:
      'Octopuses are soft-bodied, eight-limbed molluscs that inhabit coral reefs, pelagic waters, and the seabed.',
    fallbackParagraphs: [
      'An octopus is a soft-bodied, eight-limbed mollusc of the order Octopoda. The order consists of some 300 species and is grouped within the class Cephalopoda with squids, cuttlefish, and nautiloids. Like other cephalopods, an octopus is bilaterally symmetric with two eyes and a beaked mouth at the center point of the eight limbs.',
      'The soft body can radically alter its shape, enabling octopuses to squeeze through small gaps. They trail their eight appendages behind them as they swim. The siphon is used both for respiration and for locomotion, by expelling a jet of water. Octopuses have a complex nervous system and excellent sight, and are among the most intelligent and behaviorally diverse of all invertebrates.',
      'Octopuses inhabit various regions of the ocean, including coral reefs, pelagic waters, and the seabed; some live in the intertidal zone and others at abyssal depths. Most species grow quickly, mature early, and are short-lived. Strategies to defend themselves against predators include the expulsion of ink, the use of camouflage and threat displays, and the ability to jet quickly through the water.',
    ],
    semanticRelated: {
      octopus: 1, squid: 4, cephalopod: 6, tentacle: 8, mollusc: 12, ocean: 16, marine: 22,
      camouflage: 29, ink: 33, sea: 39, coral: 45, reef: 50, water: 58, intelligent: 66,
      invertebrate: 74, siphon: 82, arms: 91, beak: 105, predator: 120, biology: 145,
    },
  },
  {
    date: '2026-10-29',
    title: 'Espresso',
    category: 'Culinary Arts & Chemistry',
    difficulty: 'Standard',
    quote:
      'Espresso is a concentrated coffee-brewing method of Italian origin in which pressurized hot water is forced through finely ground coffee beans.',
    fallbackParagraphs: [
      'Espresso is a coffee-brewing method of Italian origin, in which a small amount of nearly boiling water is forced under pressure through finely ground coffee beans. Espresso can be made with a wide variety of coffee beans and roast degrees. Espresso is the most common way of making coffee in southern Europe, especially in Italy, Spain, and Portugal.',
      'The result is a concentrated coffee with a thicker consistency than coffees brewed by other methods, a crema foam on top, and a higher concentration of suspended and dissolved solids. Because of the pressurized brewing process, the flavors and chemicals in a typical cup of espresso are very concentrated.',
      'Espresso is also the base for several other coffee drinks, such as caffè latte, cappuccino, macchiato, caffè mocha, flat white, and caffè Americano. Espresso has more caffeine per unit volume than most coffee beverages, but because the usual serving size is much smaller, the total caffeine content is less than a mug of standard drip-brewed coffee.',
    ],
    semanticRelated: {
      espresso: 1, coffee: 2, barista: 5, cappuccino: 7, caffeine: 10, crema: 14, italian: 18,
      roast: 23, beans: 27, latte: 31, brew: 36, pressure: 44, cup: 55, drink: 68, mocha: 75,
    },
  },
  {
    date: '2026-10-28',
    title: 'Lighthouse',
    category: 'Maritime Architecture',
    difficulty: 'Standard',
    quote:
      'A lighthouse is a tower, building, or other type of physical structure designed to emit light from a system of lamps and lenses to serve as a navigational aid.',
    fallbackParagraphs: [
      'A lighthouse is a tower, building, or other type of physical structure designed to emit light from a system of lamps and lenses and to serve as a beacon for navigational aid, for maritime pilots at sea or on inland waterways. Lighthouses mark dangerous coastlines, hazardous shoals, reefs, rocks, and safe entries to harbors.',
      'Once widely used, the number of operational lighthouses has declined due to the expense of maintenance and the advent of electronic navigational systems. In a lighthouse, the source of light is called the lamp and the light is concentrated by the lens or optic, historically engineered using the Fresnel lens.',
      'Originally lit by open fires and later candles or whale oil lamps, the Argand hollow-wick lamp and parabolic reflector were introduced in the late 18th century. Today, automated electric beacons and GPS satellite navigation have largely replaced resident lighthouse keepers across the globe.',
    ],
    semanticRelated: {
      lighthouse: 1, beacon: 3, maritime: 6, tower: 9, coast: 12, harbor: 15, ship: 19,
      navigation: 24, lens: 30, sea: 35, fresnel: 42, sailors: 49, ocean: 56, reef: 65,
    },
  },
  {
    date: '2026-10-27',
    title: 'Golden Gate Bridge',
    category: 'Civil Engineering',
    difficulty: 'Challenging',
    quote:
      'The Golden Gate Bridge is a suspension bridge spanning the Golden Gate, the one-mile-wide strait connecting San Francisco Bay and the Pacific Ocean.',
    fallbackParagraphs: [
      'The Golden Gate Bridge is a suspension bridge spanning the Golden Gate, the one-mile-wide strait connecting San Francisco Bay and the Pacific Ocean. The structure links the U.S. city of San Francisco, California—the northern tip of the San Francisco Peninsula—to Marin County, carrying both U.S. Route 101 and California State Route 1 across the strait.',
      'The bridge is one of the most internationally recognized symbols of San Francisco and California. It was initially designed by engineer Joseph Strauss in 1917. At the time of its opening in 1937, it was both the longest and the tallest suspension bridge in the world, with a main span of 4,200 feet and a total height of 746 feet.',
      'Painted in a distinctive International Orange sealant to enhance visibility in thick Pacific fog and protect the steel cables from salt-air corrosion, the Golden Gate Bridge remains a landmark of modern civil engineering.',
    ],
    semanticRelated: {
      golden: 2, gate: 3, bridge: 1, suspension: 5, california: 9, francisco: 11, pacific: 16,
      strait: 21, steel: 28, cables: 34, bay: 40, orange: 47, engineering: 54, span: 62,
    },
  },
  {
    date: '2026-10-26',
    title: 'Photosynthesis',
    category: 'Biochemistry & Botany',
    difficulty: 'Challenging',
    quote:
      'Photosynthesis is a biological process used by plants, algae, and certain bacteria to convert light energy into chemical energy.',
    fallbackParagraphs: [
      'Photosynthesis is a system of biological processes by which photosynthetic organisms, such as most plants, algae, and cyanobacteria, convert light energy, typically from sunlight, into the chemical energy necessary to fuel their metabolism. Photosynthesis usually refers to oxygenic photosynthesis, a process that produces oxygen.',
      'Photosynthetic organisms store the chemical energy so produced within intracellular organic compounds, especially carbohydrates like sugars, synthesized from carbon dioxide and water. Most plants, algae, and cyanobacteria perform photosynthesis inside specialized organelles called chloroplasts using the green pigment chlorophyll.',
      'Photosynthesis is critical for the existence of the vast majority of life on Earth. It is the way in which virtually all energy in the biosphere becomes available to living things, producing the atmospheric oxygen required by aerobic organisms.',
    ],
    semanticRelated: {
      photosynthesis: 1, chlorophyll: 3, chloroplast: 5, plant: 8, sunlight: 11, oxygen: 14,
      carbon: 18, energy: 22, leaf: 26, algae: 31, biology: 38, sugar: 45, glucose: 50,
    },
  },
  {
    date: '2026-10-25',
    title: 'Black Hole',
    category: 'Astrophysics & Relativity',
    difficulty: 'Expert',
    quote:
      'A black hole is a region of spacetime where gravity is so strong that nothing, including light or other electromagnetic waves, has enough energy to escape.',
    fallbackParagraphs: [
      'A black hole is a region of spacetime where gravity is so strong that nothing, including light and other electromagnetic waves, contains enough energy to escape its event horizon. The theory of general relativity predicts that a sufficiently compact mass can deform spacetime to form a black hole.',
      'The boundary of no escape is called the event horizon. Although it has a great effect on the fate and circumstances of an object crossing it, it has no locally detectable features according to general relativity. In many ways, a black hole acts like an ideal black body, as it reflects no light.',
      'Black holes of stellar mass form when massive stars collapse at the end of their life cycle in a supernova explosion. Supermassive black holes of millions of solar masses exist at the centers of most galaxies, including Sagittarius A* at the core of the Milky Way.',
    ],
    semanticRelated: {
      black: 2, hole: 1, gravity: 4, horizon: 6, relativity: 9, spacetime: 12, star: 16,
      singularity: 20, galaxy: 25, mass: 30, einstein: 36, supernova: 42, light: 48,
    },
  },
  {
    date: '2026-10-24',
    title: 'Origami',
    category: 'Traditional Arts & Geometry',
    difficulty: 'Standard',
    quote:
      'Origami is the Japanese art of paper folding, transforming a flat square sheet of paper into a finished sculpture without cuts or glue.',
    fallbackParagraphs: [
      'Origami is the Japanese art of paper folding. In modern usage, the word origami is often used as an inclusive term for all folding practices, regardless of their culture of origin. The goal is to transform a flat square sheet of paper into a finished sculpture through folding and sculpting techniques.',
      'Modern origami practitioners generally discourage the use of cuts, glue, or markings on the paper. A small number of basic origami folds can be combined in a variety of ways to make intricate designs. The best-known origami model is the Japanese paper crane.',
      'Beyond ceremonial and artistic traditions, mathematical origami principles are widely applied in modern aerospace engineering, such as folding solar panel arrays for space telescopes, surgical stents, and automotive airbag deployment.',
    ],
    semanticRelated: {
      origami: 1, paper: 3, folding: 4, crane: 7, japanese: 10, crease: 15, square: 21,
      sculpture: 28, geometry: 35, art: 42, sheet: 50, craft: 58,
    },
  },
];

export function getArchiveList(): ArchivePuzzleItem[] {
  return CURATED_ARTICLES.map((a) => ({
    date: a.date,
    title: a.title,
    category: a.category,
    difficulty: a.difficulty,
    wordCount: a.fallbackParagraphs.join(' ').split(/\s+/).length,
    completed: false,
  }));
}

async function fetchWikipediaArticle(titleOrRandom?: string): Promise<{
  title: string;
  category: string;
  quote: string;
  paragraphs: string[];
}> {
  const curated = CURATED_ARTICLES.find(
    (a) => titleOrRandom && a.title.toLowerCase() === titleOrRandom.toLowerCase()
  );

  const targetTitle =
    titleOrRandom ||
    CURATED_ARTICLES[Math.floor(Math.random() * CURATED_ARTICLES.length)].title;

  try {
    const url = `https://en.wikipedia.org/w/api.php?action=parse&page=${encodeURIComponent(
      targetTitle
    )}&prop=text|categories&formatversion=2&format=json&redirects=1&origin=*`;
    const res = await fetch(url, {
      signal: AbortSignal.timeout(3500),
    });
    if (res.ok) {
      const json = (await res.json()) as {
        parse?: {
          title?: string;
          text?: string;
        };
      };
      if (json.parse && json.parse.text) {
        const cleanTitle = stripDisambiguator(json.parse.title || targetTitle);
        const rawHtml = json.parse.text;

        const cleaned = rawHtml
          .replace(/<style[\s\S]*?<\/style>/gi, '')
          .replace(/<script[\s\S]*?<\/script>/gi, '')
          .replace(/<table[\s\S]*?<\/table>/gi, '')
          .replace(/<figure[\s\S]*?<\/figure>/gi, '')
          .replace(/<sup[\s\S]*?<\/sup>/gi, '')
          .replace(
            /<div[^>]*class="[^"]*(?:hatnote|thumb|gallery|reflist|shortdescription)[^"]*"[^>]*>[\s\S]*?<\/div>/gi,
            ''
          );

        const paragraphs: string[] = [];
        const pRe = /<p\b[^>]*>([\s\S]*?)<\/p>/gi;
        let m: RegExpExecArray | null;
        let totalChars = 0;
        while ((m = pRe.exec(cleaned)) !== null) {
          const text = m[1]
            .replace(/<[^>]+>/g, '')
            .replace(/&nbsp;/gi, ' ')
            .replace(/&amp;/gi, '&')
            .replace(/&quot;/gi, '"')
            .replace(/&#39;/gi, "'")
            .replace(/\[\d+\]/g, '')
            .replace(/\s+/g, ' ')
            .trim();
          if (text.length < 60) continue;
          if (/^Coordinates:/i.test(text) || /^Cite error:/i.test(text)) continue;
          paragraphs.push(text);
          totalChars += text.length;
          if (paragraphs.length >= 3 || totalChars >= 1100) break;
        }

        if (paragraphs.length >= 1) {
          return {
            title: cleanTitle,
            category: curated?.category || 'Wikipedia Featured Discovery',
            quote: curated?.quote || paragraphs[0].split('. ').slice(0, 2).join('. ') + '.',
            paragraphs,
          };
        }
      }
    }
  } catch {
    // Fallback to curated article below
  }

  const fallback =
    curated || CURATED_ARTICLES[Math.floor(Math.random() * CURATED_ARTICLES.length)];
  return {
    title: fallback.title,
    category: fallback.category,
    quote: fallback.quote,
    paragraphs: fallback.fallbackParagraphs,
  };
}

const LETTER_POOL =
  'EEEEEEEEEEEEAAAAAAAAAIIIIIIIIIOOOOOOOONNNNNNRRRRRRSSSSSSTTTTTTLLLLUUUUDDDDGGGBBCCMMPPFFHHVVWWYYKJXQZ';

function getNeighbors(idx: number, rows: number, cols: number): number[] {
  const r = Math.floor(idx / cols);
  const c = idx % cols;
  const out: number[] = [];
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      if (dr === 0 && dc === 0) continue;
      const nr = r + dr;
      const nc = c + dc;
      if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
        out.push(nr * cols + nc);
      }
    }
  }
  return out;
}

function shuffleArray<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function placeSnakeWord(
  word: string,
  cells: (string | null)[],
  rows: number,
  cols: number
): number[] | null {
  const upper = word.toUpperCase();
  const total = rows * cols;
  const starts: number[] = [];
  for (let i = 0; i < total; i++) {
    if (cells[i] === upper[0]) starts.push(i);
  }
  const blanks: number[] = [];
  for (let i = 0; i < total; i++) {
    if (cells[i] === null) blanks.push(i);
  }
  const candidates = [...shuffleArray(starts), ...shuffleArray(blanks)];

  for (let attempt = 0; attempt < Math.min(candidates.length, 45); attempt++) {
    const startIdx = candidates[attempt];
    const path = [startIdx];
    const used = new Set([startIdx]);
    let ok = true;

    for (let li = 1; li < upper.length; li++) {
      const prev = path[path.length - 1];
      const wanted = upper[li];
      const neighbors = shuffleArray(getNeighbors(prev, rows, cols));
      let chosen = -1;
      for (const n of neighbors) {
        if (!used.has(n) && cells[n] === wanted) {
          chosen = n;
          break;
        }
      }
      if (chosen === -1) {
        for (const n of neighbors) {
          if (!used.has(n) && cells[n] === null) {
            chosen = n;
            break;
          }
        }
      }
      if (chosen === -1) {
        ok = false;
        break;
      }
      path.push(chosen);
      used.add(chosen);
    }

    if (ok) {
      for (let i = 0; i < upper.length; i++) {
        cells[path[i]] = upper[i];
      }
      return path;
    }
  }
  return null;
}

function buildWikirecGrid(
  titleWords: string[],
  articleWordsFreq: Map<string, number>,
  rows: number,
  cols: number
) {
  const cells: (string | null)[] = new Array(rows * cols).fill(null);
  const targets: {
    id: string;
    word: string;
    norm: string;
    length: number;
    tier: 'TITLE' | 'PYRAMID_1' | 'PYRAMID_2' | 'PYRAMID_3';
    revealed: boolean;
    closeness: number;
    hintLetters: string[];
    path: number[];
    finder?: {
      username: string;
      displayName: string;
      avatar: string;
      platform: 'web' | 'tiktok' | 'youtube' | 'discord';
    };
  }[] = [];

  const placedNorms = new Set<string>();
  for (const tw of titleWords) {
    const norm = normalizeWikiWord(tw);
    if (norm.length < 3 || norm.length > 10 || placedNorms.has(norm)) continue;
    const path = placeSnakeWord(norm, cells, rows, cols);
    if (path) {
      placedNorms.add(norm);
      targets.push({
        id: `target-${norm}`,
        word: tw.toUpperCase(),
        norm,
        length: norm.length,
        tier: 'TITLE',
        revealed: false,
        closeness: 0,
        hintLetters: new Array(norm.length).fill(''),
        path,
      });
    }
  }

  const sortedCandidates = Array.from(articleWordsFreq.entries())
    .filter(
      ([w]) =>
        w.length >= 4 &&
        w.length <= 8 &&
        !placedNorms.has(w) &&
        !STOPLIST.has(w) &&
        !/^\d/.test(w)
    )
    .sort((a, b) => b[1] - a[1] || b[0].length - a[0].length)
    .map(([w]) => w);

  const pyramidTiers: (
    | 'PYRAMID_1'
    | 'PYRAMID_2'
    | 'PYRAMID_2'
    | 'PYRAMID_3'
    | 'PYRAMID_3'
    | 'PYRAMID_3'
  )[] = ['PYRAMID_1', 'PYRAMID_2', 'PYRAMID_2', 'PYRAMID_3', 'PYRAMID_3', 'PYRAMID_3'];

  let tierIdx = 0;
  for (const cand of sortedCandidates) {
    if (tierIdx >= pyramidTiers.length) break;
    const path = placeSnakeWord(cand, cells, rows, cols);
    if (path) {
      placedNorms.add(cand);
      targets.push({
        id: `target-${cand}`,
        word: cand.toUpperCase(),
        norm: cand,
        length: cand.length,
        tier: pyramidTiers[tierIdx],
        revealed: false,
        closeness: 0,
        hintLetters: new Array(cand.length).fill(''),
        path,
      });
      tierIdx++;
    }
  }

  const finalCells = cells.map(
    (c) => c || LETTER_POOL[Math.floor(Math.random() * LETTER_POOL.length)]
  );

  return {
    rows,
    cols,
    cells: finalCells,
    targets,
    bonusWordsFound: [] as {
      word: string;
      finder: string;
      platform: 'web' | 'tiktok' | 'youtube' | 'discord';
      points: number;
    }[],
  };
}

function computeWordCloseness(guessNorm: string, targetNorm: string): number {
  if (guessNorm === targetNorm) return 100;
  const gChars = new Set(guessNorm.split(''));
  const tChars = targetNorm.split('');
  let shared = 0;
  for (const c of tChars) {
    if (gChars.has(c)) shared++;
  }
  let score = Math.round((shared / Math.max(1, tChars.length)) * 65);
  if (guessNorm[0] === targetNorm[0]) score += 18;
  if (guessNorm.length === targetNorm.length) score += 12;
  return Math.min(95, score);
}

export type WikiconRoundMode = RoundState['mode'];

export interface InternalWikiconRound {
  roundId: string;
  mode: WikiconRoundMode;
  isDaily: boolean;
  dailyDate?: string;
  articleTitle: string;
  articleCategory: string;
  articleSummaryQuote: string;
  titleTokens: {
    index: number;
    text: string;
    norm: string;
    length: number;
    revealed: boolean;
    foundBy?: {
      username: string;
      avatar: string;
      platform: 'web' | 'tiktok' | 'youtube' | 'discord';
    };
  }[];
  paragraphs: {
    id: number;
    type: 'word' | 'space';
    text: string;
    norm: string;
    length: number;
    isStop: boolean;
    isNumber: boolean;
    digitCount: number;
    isTitleWord: boolean;
    revealed: boolean;
    foundBy?: {
      username: string;
      avatar: string;
      platform: 'web' | 'tiktok' | 'youtube' | 'discord';
    };
  }[][];
  wordFreq: Map<string, number>;
  semanticRanks: Map<string, number>;
  revealedSet: Set<string>;
  totalWords: number;
  revealedWordsCount: number;
  guessCount: number;
  solved: boolean;
  solvedBy?: {
    username: string;
    displayName: string;
    avatar: string;
    platform: 'web' | 'tiktok' | 'youtube' | 'discord';
  };
  topRankCards: any[];
  recentTicker: any[];
  leaderboard: Map<string, any>;
  lastAnnouncement: any | null;
  gridBoard: ReturnType<typeof buildWikirecGrid>;
  startedAt: number;
}

export async function createNewWikiconRound(opts: {
  mode?: WikiconRoundMode;
  isDaily?: boolean;
  dailyDate?: string;
  customTitle?: string;
}): Promise<InternalWikiconRound> {
  const mode = opts.mode || 'WIKICONTEXTO';
  const isDaily = !!opts.isDaily;
  const dailyDate = opts.dailyDate || '2026-10-31';

  let targetArticleTitle = opts.customTitle;
  if (isDaily && !targetArticleTitle) {
    const found = CURATED_ARTICLES.find((a) => a.date === dailyDate) || CURATED_ARTICLES[0];
    targetArticleTitle = found.title;
  }

  const articleData = await fetchWikipediaArticle(targetArticleTitle);
  const curatedMatch = CURATED_ARTICLES.find(
    (a) => a.title.toLowerCase() === articleData.title.toLowerCase()
  );

  const rawTitleWords = articleData.title.split(/\s+/).filter(Boolean);
  const titleNormsSet = new Set<string>();
  const titleTokens = rawTitleWords.map((tw, idx) => {
    const norm = normalizeWikiWord(tw);
    if (norm) titleNormsSet.add(norm);
    return {
      index: idx,
      text: tw,
      norm,
      length: tw.length,
      revealed: false,
    };
  });

  let tokenIdCounter = 1;
  let totalWords = 0;
  let revealedWordsCount = 0;
  const wordFreq = new Map<string, number>();

  const sourceParagraphs =
    mode === 'WIKIWORD_QUOTE' ? [articleData.quote] : articleData.paragraphs;

  const paragraphs = sourceParagraphs.map((paraText) => {
    const tokens: InternalWikiconRound['paragraphs'][0] = [];
    const collapsed = paraText.replace(/(\d),(?=\d)/g, '$1');
    const re = /([\p{L}\p{N}\p{M}]+(?:'[\p{L}]+)?)|([^\p{L}\p{N}\p{M}]+)/gu;
    let m: RegExpExecArray | null;
    while ((m = re.exec(collapsed)) !== null) {
      if (m[1]) {
        const word = m[1];
        const norm = normalizeWikiWord(word);
        const isStop = STOPLIST.has(norm);
        const isNumber = /^\d/.test(norm);
        const digitCount = (norm.match(/\d/g) || []).length;
        const isTitleWord = titleNormsSet.has(norm);

        if (!isStop) {
          totalWords++;
          wordFreq.set(norm, (wordFreq.get(norm) || 0) + 1);
        } else {
          revealedWordsCount++;
        }

        tokens.push({
          id: tokenIdCounter++,
          type: 'word',
          text: word,
          norm,
          length: isTitleWord ? 8 : word.length,
          isStop,
          isNumber,
          digitCount,
          isTitleWord,
          revealed: isStop,
        });
      } else {
        tokens.push({
          id: tokenIdCounter++,
          type: 'space',
          text: m[2],
          norm: '',
          length: m[2].length,
          isStop: true,
          isNumber: false,
          digitCount: 0,
          isTitleWord: false,
          revealed: true,
        });
      }
    }
    return tokens;
  });

  const semanticRanks = new Map<string, number>();
  titleTokens.forEach((tt, idx) => {
    semanticRanks.set(tt.norm, idx + 1);
  });

  if (curatedMatch) {
    for (const [w, r] of Object.entries(curatedMatch.semanticRelated)) {
      const n = normalizeWikiWord(w);
      if (!semanticRanks.has(n)) semanticRanks.set(n, r);
    }
  }

  const sortedArticleWords = Array.from(wordFreq.entries()).sort(
    (a, b) => b[1] - a[1] || b[0].length - a[0].length
  );
  let nextRank = 10;
  for (const [norm] of sortedArticleWords) {
    if (!semanticRanks.has(norm)) {
      while (Array.from(semanticRanks.values()).includes(nextRank)) {
        nextRank++;
      }
      semanticRanks.set(norm, nextRank++);
    }
  }

  const rows = mode === 'WIKIWORD_QUOTE' ? 5 : 7;
  const cols = 7;
  const gridBoard = buildWikirecGrid(rawTitleWords, wordFreq, rows, cols);

  return {
    roundId: `round_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    mode,
    isDaily,
    dailyDate: isDaily ? dailyDate : undefined,
    articleTitle: articleData.title,
    articleCategory: articleData.category,
    articleSummaryQuote: articleData.quote,
    titleTokens,
    paragraphs,
    wordFreq,
    semanticRanks,
    revealedSet: new Set<string>(STOPLIST),
    totalWords,
    revealedWordsCount,
    guessCount: 0,
    solved: false,
    topRankCards: [],
    recentTicker: [],
    leaderboard: new Map(),
    lastAnnouncement: null,
    gridBoard,
    startedAt: Date.now(),
  };
}

export function serializeWikiconRound(round: InternalWikiconRound): RoundState {
  return {
    roundId: round.roundId,
    mode: round.mode,
    isDaily: round.isDaily,
    dailyDate: round.dailyDate,
    articleTitle: round.solved ? round.articleTitle : 'REDACTED ARTICLE',
    articleCategory: round.articleCategory,
    articleSummaryQuote: round.solved ? round.articleSummaryQuote : undefined,
    titleTokens: round.titleTokens.map((t) => ({
      index: t.index,
      text: t.revealed || round.solved ? t.text : '•'.repeat(Math.min(Math.max(t.length, 4), 9)),
      norm: t.revealed || round.solved ? t.norm : '',
      length: t.length,
      revealed: t.revealed || round.solved,
      foundBy: t.foundBy,
    })),
    paragraphs: round.paragraphs.map((para) =>
      para.map((tok) => ({
        id: tok.id,
        type: tok.type,
        text: tok.revealed || round.solved ? tok.text : '',
        norm: tok.revealed || round.solved ? tok.norm : '',
        length: tok.length,
        isStop: tok.isStop,
        isNumber: tok.isNumber,
        digitCount: tok.digitCount,
        isTitleWord: tok.isTitleWord,
        revealed: tok.revealed || round.solved,
        foundBy: tok.foundBy,
      }))
    ),
    totalWords: round.totalWords,
    revealedWordsCount: round.revealedWordsCount,
    guessCount: round.guessCount,
    solved: round.solved,
    solvedBy: round.solvedBy,
    topRankCards: round.topRankCards,
    recentTicker: round.recentTicker,
    leaderboard: Array.from(round.leaderboard.values())
      .sort((a, b) => b.score - a.score)
      .slice(0, 15),
    lastAnnouncement: round.lastAnnouncement,
    gridBoard: {
      rows: round.gridBoard.rows,
      cols: round.gridBoard.cols,
      cells: round.gridBoard.cells,
      targets: round.gridBoard.targets.map((t) => ({
        id: t.id,
        word: t.revealed || round.solved ? t.word : t.hintLetters.map((l) => l || '•').join(''),
        norm: t.revealed || round.solved ? t.norm : '',
        length: t.length,
        tier: t.tier,
        revealed: t.revealed || round.solved,
        closeness: t.closeness,
        hintLetters: t.hintLetters,
        path: t.revealed || round.solved ? t.path : [],
        finder: t.finder,
      })),
      bonusWordsFound: round.gridBoard.bonusWordsFound,
    },
    startedAt: round.startedAt,
  };
}

function evaluateSemanticRankLocal(
  wordNorm: string,
  round: InternalWikiconRound
): { rank: number; similarity: number } {
  if (round.semanticRanks.has(wordNorm)) {
    const r = round.semanticRanks.get(wordNorm)!;
    const sim = Math.max(15, Math.min(99, Math.round(100 - Math.log10(Math.max(1, r)) * 26)));
    return { rank: r, similarity: r === 1 ? 100 : sim };
  }
  const titleNorm = normalizeWikiWord(round.articleTitle);
  const closeness = computeWordCloseness(wordNorm, titleNorm);
  const heuristicRank = Math.max(
    120,
    Math.min(4800, Math.round(3500 - closeness * 32 + ((wordNorm.charCodeAt(0) || 97) * 17) % 400))
  );
  round.semanticRanks.set(wordNorm, heuristicRank);
  return { rank: heuristicRank, similarity: Math.max(8, Math.min(72, closeness)) };
}

const TITLE_WORD_BONUSES = [50000, 40000, 30000, 20000];

export function handleWikiconGuess(
  round: InternalWikiconRound,
  rawGuess: string,
  player: {
    username: string;
    displayName: string;
    avatar: string;
    platform: 'web' | 'tiktok' | 'youtube' | 'discord';
    cosmeticTitle?: string;
  }
) {
  const guessNorm = normalizeWikiWord(rawGuess);
  if (!guessNorm || guessNorm.length < 1 || STOPLIST.has(guessNorm)) {
    return { valid: false, reason: 'stop_or_short' };
  }

  round.guessCount++;
  const alreadyRevealed = round.revealedSet.has(guessNorm);

  let titleMatched = false;
  let newlyFoundTitleIndex = -1;
  const previouslyFoundTitles = round.titleTokens.filter((t) => t.revealed).length;

  for (const tt of round.titleTokens) {
    if (tt.norm === guessNorm && !tt.revealed) {
      tt.revealed = true;
      tt.foundBy = {
        username: player.username,
        avatar: player.avatar,
        platform: player.platform,
      };
      titleMatched = true;
      newlyFoundTitleIndex = previouslyFoundTitles;
    }
  }

  let occurrencesRevealed = 0;
  if (!alreadyRevealed) {
    for (const para of round.paragraphs) {
      for (const tok of para) {
        if (tok.type === 'word' && tok.norm === guessNorm && !tok.revealed) {
          tok.revealed = true;
          tok.length = tok.text.length;
          tok.foundBy = {
            username: player.username,
            avatar: player.avatar,
            platform: player.platform,
          };
          occurrencesRevealed++;
          round.revealedWordsCount++;
        }
      }
    }
    if (occurrencesRevealed > 0 || titleMatched) {
      round.revealedSet.add(guessNorm);
    }
  }

  let gridTargetHit = false;
  for (const gt of round.gridBoard.targets) {
    if (!gt.revealed) {
      if (gt.norm === guessNorm) {
        gt.revealed = true;
        gt.closeness = 100;
        gt.hintLetters = gt.word.split('');
        gt.finder = {
          username: player.username,
          displayName: player.displayName,
          avatar: player.avatar,
          platform: player.platform,
        };
        gridTargetHit = true;
      } else {
        const c = computeWordCloseness(guessNorm, gt.norm);
        if (c > gt.closeness) {
          gt.closeness = c;
          if (c >= 60 && !gt.hintLetters[0]) {
            gt.hintLetters[0] = gt.word[0];
          }
        }
      }
    }
  }

  const { rank, similarity } = evaluateSemanticRankLocal(guessNorm, round);

  let pointsEarned = 0;
  let rarity: 'COMMON' | 'UNCOMMON' | 'RARE' | 'ULTRA' | 'TITLE' = 'COMMON';

  if (titleMatched) {
    rarity = 'TITLE';
    const bonus =
      TITLE_WORD_BONUSES[Math.min(newlyFoundTitleIndex, TITLE_WORD_BONUSES.length - 1)];
    pointsEarned += bonus + occurrencesRevealed * 1500;
  } else if (occurrencesRevealed > 0 || gridTargetHit) {
    const isNumber = /^\d/.test(guessNorm);
    if (isNumber) {
      const d = guessNorm.length;
      const numTable: Record<number, number> = { 1: 500, 2: 1000, 3: 5000, 4: 10000 };
      pointsEarned = numTable[d] || Math.min(200000, 10000 * Math.pow(2, d - 4));
      rarity = d >= 4 ? 'RARE' : 'UNCOMMON';
    } else {
      if (rank <= 25 || guessNorm.length >= 9) {
        rarity = 'ULTRA';
        pointsEarned = 12000 + occurrencesRevealed * 800 + guessNorm.length * 250;
      } else if (rank <= 80 || guessNorm.length >= 7) {
        rarity = 'RARE';
        pointsEarned = 8000 + occurrencesRevealed * 600 + guessNorm.length * 180;
      } else if (rank <= 250 || guessNorm.length >= 5) {
        rarity = 'UNCOMMON';
        pointsEarned = 4000 + occurrencesRevealed * 400 + guessNorm.length * 120;
      } else {
        rarity = 'COMMON';
        pointsEarned = 1000 + occurrencesRevealed * 250 + guessNorm.length * 80;
      }
    }
    if (gridTargetHit) {
      pointsEarned += 6500;
    }
  } else if (!alreadyRevealed) {
    if (rank <= 100) {
      pointsEarned = 1200;
      rarity = 'UNCOMMON';
    } else if (rank <= 500) {
      pointsEarned = 450;
    } else {
      pointsEarned = 100;
    }
  }

  const playerKey = `${player.platform}:${player.username.toLowerCase()}`;
  const existingPlayer = round.leaderboard.get(playerKey) || {
    id: playerKey,
    username: player.username,
    displayName: player.displayName || player.username,
    avatar: player.avatar,
    platform: player.platform,
    score: 0,
    wordsFound: 0,
    titleWordsFound: 0,
    bestRank: 9999,
    elo: 1200 + Math.floor(Math.random() * 250),
    cosmeticTitle: player.cosmeticTitle || 'Wiki Explorer',
    borderColor: '#19e4ff',
  };

  if (player.avatar && player.avatar.startsWith('http')) {
    existingPlayer.avatar = player.avatar;
  }
  if (player.displayName) {
    existingPlayer.displayName = player.displayName;
  }

  if (pointsEarned > 0) {
    existingPlayer.score += pointsEarned;
    if (occurrencesRevealed > 0 || gridTargetHit) existingPlayer.wordsFound += 1;
    if (titleMatched) existingPlayer.titleWordsFound += 1;
  }
  if (rank < existingPlayer.bestRank) {
    existingPlayer.bestRank = rank;
  }
  round.leaderboard.set(playerKey, existingPlayer);

  const card = {
    word: rawGuess.trim().toUpperCase(),
    norm: guessNorm,
    rank: titleMatched ? 1 : rank,
    similarity: titleMatched ? 100 : similarity,
    countInArticle: occurrencesRevealed,
    pointsEarned,
    rarity,
    finder: {
      username: player.username,
      displayName: player.displayName || player.username,
      avatar: player.avatar,
      platform: player.platform,
      cosmeticTitle: existingPlayer.cosmeticTitle,
    },
    timestamp: Date.now(),
  };

  const existingIdx = round.topRankCards.findIndex((c) => c.norm === guessNorm);
  if (existingIdx === -1) {
    round.topRankCards.push(card);
    round.topRankCards.sort((a, b) => a.rank - b.rank);
    round.topRankCards = round.topRankCards.slice(0, 6);
  }

  round.recentTicker = [
    card,
    ...round.recentTicker.filter((c) => c.norm !== guessNorm),
  ].slice(0, 18);

  if (pointsEarned >= 1000 || titleMatched || gridTargetHit) {
    round.lastAnnouncement = {
      id: `ann_${Date.now()}_${Math.random().toString(36).slice(2, 5)}`,
      username: player.username,
      displayName: player.displayName || player.username,
      avatar: player.avatar,
      platform: player.platform,
      word: rawGuess.trim().toUpperCase(),
      rarity,
      pointsEarned,
      totalPoints: existingPlayer.score,
      rank: card.rank,
      timestamp: Date.now(),
    };
  }

  const allTitlesRevealed = round.titleTokens.every((t) => t.revealed);
  const allGridTargetsRevealed =
    round.mode !== 'WIKICONTEXTO' &&
    round.gridBoard.targets.length > 0 &&
    round.gridBoard.targets.every((t) => t.revealed);

  if ((allTitlesRevealed || allGridTargetsRevealed) && !round.solved) {
    round.solved = true;
    round.solvedBy = {
      username: player.username,
      displayName: player.displayName || player.username,
      avatar: player.avatar,
      platform: player.platform,
    };
    existingPlayer.elo += 24;
  }

  return {
    valid: true,
    alreadyRevealed,
    occurrencesRevealed,
    titleMatched,
    gridTargetHit,
    pointsEarned,
    rank: card.rank,
    similarity: card.similarity,
    rarity,
    solved: round.solved,
    card,
  };
}

export function revealWikiconHint(round: InternalWikiconRound): string | null {
  const unrevealedTargets = round.gridBoard.targets.filter((t) => !t.revealed);
  if (unrevealedTargets.length > 0) {
    const target = unrevealedTargets[Math.floor(Math.random() * unrevealedTargets.length)];
    const emptyIdx = target.hintLetters.findIndex((l) => !l);
    if (emptyIdx !== -1) {
      target.hintLetters[emptyIdx] = target.word[emptyIdx];
      target.closeness = Math.min(95, target.closeness + 25);
    }
  }

  const unrevealedBodyWords: string[] = [];
  for (const para of round.paragraphs) {
    for (const tok of para) {
      if (tok.type === 'word' && !tok.revealed && !tok.isTitleWord && !tok.isStop) {
        unrevealedBodyWords.push(tok.norm);
      }
    }
  }

  if (unrevealedBodyWords.length > 0) {
    const chosenNorm =
      unrevealedBodyWords[Math.floor(Math.random() * unrevealedBodyWords.length)];
    for (const para of round.paragraphs) {
      for (const tok of para) {
        if (tok.type === 'word' && tok.norm === chosenNorm && !tok.revealed) {
          tok.revealed = true;
          tok.length = tok.text.length;
          round.revealedWordsCount++;
        }
      }
    }
    round.revealedSet.add(chosenNorm);
    return chosenNorm.toUpperCase();
  }
  return null;
}

export function revealEntireWikiconRound(round: InternalWikiconRound) {
  round.solved = true;
  for (const tt of round.titleTokens) tt.revealed = true;
  for (const para of round.paragraphs) {
    for (const tok of para) tok.revealed = true;
  }
  for (const gt of round.gridBoard.targets) {
    gt.revealed = true;
    gt.closeness = 100;
  }
}

export function evaluateTikTokChatIntoWikiconRound(
  round: InternalWikiconRound,
  chatData: {
    uniqueId?: string;
    nickname?: string;
    comment?: string;
    profilePictureUrl?: string;
  }
): boolean {
  const rawComment = String(chatData.comment || '').trim();
  if (!rawComment) return false;
  const collapsed = rawComment.replace(/(\d),(?=\d)/g, '$1');
  const tokens = collapsed.match(/[\p{L}\p{N}\p{M}]+/gu) || [];
  let anyUpdated = false;
  for (const token of tokens) {
    const norm = normalizeWikiWord(token);
    if (!norm || STOPLIST.has(norm)) continue;
    handleWikiconGuess(round, token, {
      username: chatData.uniqueId || 'tiktok_viewer',
      displayName: chatData.nickname || chatData.uniqueId || 'Viewer',
      avatar: chatData.profilePictureUrl || '',
      platform: 'tiktok',
      cosmeticTitle: 'TikTok Live',
    });
    anyUpdated = true;
  }
  return anyUpdated;
}
