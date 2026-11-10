// Maps concatenated 2-word (or multi-word) answers to the 0-based tile index
// after which a word ends and the next word starts.
// For example, 'POLARBEAR' -> 'POLAR' (indices 0..4) | 'BEAR' (indices 5..8),
// so the separator appears right after colIdx = 4 (between index 4 and index 5).

const TWO_WORD_PARTITIONS: Record<string, string[]> = {
  // Theme words
  BOARDGAMES: ['BOARD', 'GAMES'],
  REEFLIFE: ['REEF', 'LIFE'],
  PUBGAMES: ['PUB', 'GAMES'],
  SPACEFLIGHT: ['SPACE', 'FLIGHT'],
  BIRDLIFE: ['BIRD', 'LIFE'],
  BAKEDPIZZA: ['BAKED', 'PIZZA'],
  TIDEPOOL: ['TIDE', 'POOL'],
  TIMBERWORK: ['TIMBER', 'WORK'],
  BREADBASKET: ['BREAD', 'BASKET'],
  APPLEPICK: ['APPLE', 'PICK'],
  LOGFIRE: ['LOG', 'FIRE'],
  TEAROOM: ['TEA', 'ROOM'],
  GOLDMINE: ['GOLD', 'MINE'],
  FALLFOLIAGE: ['FALL', 'FOLIAGE'],
  WOODFIRE: ['WOOD', 'FIRE'],
  CORALREEF: ['CORAL', 'REEF'],
  CIDERMILL: ['CIDER', 'MILL'],
  CHARTWORK: ['CHART', 'WORK'],
  BANANASPLIT: ['BANANA', 'SPLIT'],
  SWEETCIDER: ['SWEET', 'CIDER'],
  APRESSKI: ['APRES', 'SKI'],
  CHERRYPICK: ['CHERRY', 'PICK'],
  CHIMNEYPOT: ['CHIMNEY', 'POT'],
  CORNMAZE: ['CORN', 'MAZE'],
  MILLEFEUILLE: ['MILLE', 'FEUILLE'],
  CIDERPRESS: ['CIDER', 'PRESS'],
  LIGHTYEAR: ['LIGHT', 'YEAR'],
  APPLECRISP: ['APPLE', 'CRISP'],
  CROSSCOUNTRY: ['CROSS', 'COUNTRY'],
  CHIMNEYSWEEP: ['CHIMNEY', 'SWEEP'],
  APPLEBUTTER: ['APPLE', 'BUTTER'],
  BLACKHOLES: ['BLACK', 'HOLES'],
  FLATWHITE: ['FLAT', 'WHITE'],
  SKYWATCH: ['SKY', 'WATCH'],

  // Row words
  TREX: ['T', 'REX'],
  TUBETRAIN: ['TUBE', 'TRAIN'],
  KUNGFU: ['KUNG', 'FU'],
  TESTTUBE: ['TEST', 'TUBE'],
  ZIPCODE: ['ZIP', 'CODE'],
  PASODOBLE: ['PASO', 'DOBLE'],
  SAFEDEPOSIT: ['SAFE', 'DEPOSIT'],
  COTTONCANDY: ['COTTON', 'CANDY'],
  BLACKHOLE: ['BLACK', 'HOLE'],
  POLARBEAR: ['POLAR', 'BEAR'],
  YOYO: ['YO', 'YO'],
  HASHBROWNS: ['HASH', 'BROWNS'],
  HOTDOG: ['HOT', 'DOG'],
  LEADPIPE: ['LEAD', 'PIPE'],
  WOODFIRED: ['WOOD', 'FIRED'],
  EARLGREY: ['EARL', 'GREY'],
  DOUBLEBASS: ['DOUBLE', 'BASS'],
  HALFPIPE: ['HALF', 'PIPE'],
};

const customRuntimeSplits: Record<string, number[]> = {};

function computeBreakIndicesFromParts(parts: string[]): number[] {
  const cleanParts = parts.map((p) => p.replace(/[^A-Za-z]/g, '').toUpperCase()).filter(Boolean);
  if (cleanParts.length <= 1) return [];
  const indices: number[] = [];
  let runningLength = 0;
  for (let i = 0; i < cleanParts.length - 1; i++) {
    runningLength += cleanParts[i].length;
    indices.push(runningLength - 1);
  }
  return indices;
}

/**
 * Registers a potentially multi-word input string (e.g., "FLAT WHITE" or "POLAR-BEAR")
 * and returns the normalized uppercase letters-only string ("FLATWHITE") while
 * storing its word-boundary separator indices.
 */
export function normalizeAndRegisterWord(rawInput: string): string {
  const trimmed = rawInput.trim().toUpperCase();
  const parts = trimmed.split(/[\s-]+/).filter(Boolean);
  const normalized = parts.join('').replace(/[^A-Z]/g, '');
  if (parts.length > 1 && normalized.length > 0) {
    customRuntimeSplits[normalized] = computeBreakIndicesFromParts(parts);
  }
  return normalized;
}

/**
 * Returns an array of 0-based column indices after which a solid word-boundary
 * separator should be rendered (i.e. between `colIdx` and `colIdx + 1`).
 */
export function getWordBreakAfterIndices(word: string): number[] {
  if (!word) return [];
  const upper = word.trim().toUpperCase();

  // If the string itself contains spaces or hyphens, compute directly
  if (/[\s-]/.test(upper)) {
    return computeBreakIndicesFromParts(upper.split(/[\s-]+/));
  }

  if (customRuntimeSplits[upper]) {
    return customRuntimeSplits[upper];
  }

  const parts = TWO_WORD_PARTITIONS[upper];
  if (parts) {
    return computeBreakIndicesFromParts(parts);
  }

  return [];
}
