import {
  Direction,
  EditionScheduleType,
  GridCellData,
  GridSizeOption,
  PlacedClue,
  PuzzleDefinition,
  VisualThemeId,
  WordEntrySeed,
} from '@/data/crossword-types';

interface RawWordItem {
  answer: string;
  easyClue: string;
  mediumClue: string;
  hardClue: string;
  crypticBreakdown: string;
  etymologyOrContext: string;
  defaultIsCryptic: boolean;
}

const RAW_LEXICON: RawWordItem[] = [
  // --- FILM & CINEMA ---
  {
    answer: 'DIRECTOR',
    easyClue: 'Filmmaker who guides the actors and crew on a movie set',
    mediumClue: 'The person in the canvas chair who calls "Action!" and "Cut!"',
    hardClue: 'Filmmaker corded it in a new cut (8)',
    crypticBreakdown: 'Anagram ("in a new cut") of CORDED IT -> DIRECTOR; definition: "Filmmaker".',
    etymologyOrContext: 'Shapes the creative vision, camera staging, and pacing of a motion picture.',
    defaultIsCryptic: true,
  },
  {
    answer: 'PREMIERE',
    easyClue: 'First public screening of a new movie or play',
    mediumClue: 'Red-carpet opening night where flashbulbs pop',
    hardClue: 'Opening night prime ere rearranged (8)',
    crypticBreakdown: 'Anagram ("rearranged") of PRIME ERE -> PREMIERE; definition: "Opening night".',
    etymologyOrContext: 'From French premiere ("first").',
    defaultIsCryptic: true,
  },
  {
    answer: 'THRILLER',
    easyClue: 'Suspenseful movie genre full of tension and twists',
    mediumClue: 'Edge-of-your-seat Hitchcock genre',
    hardClue: 'Suspense film where hill err holds t (8)',
    crypticBreakdown: 'Insertion of HILL ERR around T -> THRILLER; definition: "Suspense film".',
    etymologyOrContext: 'Popularized in cinema by Alfred Hitchcock with films like Rear Window and Vertigo.',
    defaultIsCryptic: false,
  },
  {
    answer: 'MATINEE',
    easyClue: 'Afternoon movie screening or theater performance',
    mediumClue: 'Daytime show where tickets and popcorn cost a little less',
    hardClue: 'Afternoon show animate without a? No, in a team reshuffled! (7)',
    crypticBreakdown: 'Anagram ("reshuffled") of IN A TEAM -> MATINEE; definition: "Afternoon show".',
    etymologyOrContext: 'From French matin ("morning").',
    defaultIsCryptic: true,
  },
  {
    answer: 'MONTAGE',
    easyClue: 'Rapid sequence of film shots edited together to condense time',
    mediumClue: 'Training-sequence movie shortcut set to an upbeat song',
    hardClue: 'Edited film sequence got name in a twist (7)',
    crypticBreakdown: 'Anagram ("in a twist") of GOT NAME -> MONTAGE; definition: "Edited film sequence".',
    etymologyOrContext: 'Pioneered by Soviet film theorists Sergei Eisenstein and Lev Kuleshov.',
    defaultIsCryptic: true,
  },
  {
    answer: 'CINEMA',
    easyClue: 'Theater where movies are projected on a big screen',
    mediumClue: 'The silver screen art form—or the building where you watch it',
    hardClue: 'Movie house iceman melted inside (6)',
    crypticBreakdown: 'Anagram ("melted") of ICEMAN -> CINEMA; definition: "Movie house".',
    etymologyOrContext: 'Shortened from French cinematographe, coined by the Lumiere brothers.',
    defaultIsCryptic: true,
  },
  {
    answer: 'CAMERA',
    easyClue: 'Device used to record motion pictures or photographs',
    mediumClue: 'What comes between "Lights!" and "Action!" on set',
    hardClue: 'Lens box maraca shaken up (6)',
    crypticBreakdown: 'Anagram ("shaken up") of MARACA -> CAMERA; definition: "Lens box".',
    etymologyOrContext: 'From Latin camera obscura ("dark chamber").',
    defaultIsCryptic: true,
  },
  {
    answer: 'SEQUEL',
    easyClue: 'Movie or book that continues the story of an earlier one',
    mediumClue: 'Part II at the box office',
    hardClue: 'Follow-up film equals without a, adding e (6)',
    crypticBreakdown: 'Wordplay on SEQUEL (following in order); definition: "Follow-up film".',
    etymologyOrContext: 'From Latin sequela ("that which follows").',
    defaultIsCryptic: false,
  },
  {
    answer: 'SCRIPT',
    easyClue: 'Written text of a movie, play, or broadcast with dialogue',
    mediumClue: 'Screenplay binder that actors memorize before filming',
    hardClue: 'Screenplay strips c out of crisp t (6)',
    crypticBreakdown: 'Anagram of CRISP + T -> SCRIPT; definition: "Screenplay".',
    etymologyOrContext: 'Contains both spoken dialogue and scene sluglines.',
    defaultIsCryptic: true,
  },
  {
    answer: 'STUDIO',
    easyClue: 'Soundstage complex or company that produces films',
    mediumClue: 'Hollywood backlot where worlds are built indoors',
    hardClue: 'Filming lotious dust without us? Duo sits around t! (6)',
    crypticBreakdown: 'Anagram ("around") of DUO SITS without S -> STUDIO; definition: "Filming lot".',
    etymologyOrContext: 'Classic major studios include Universal, Paramount, and Warner Bros.',
    defaultIsCryptic: false,
  },
  {
    answer: 'AUTEUR',
    easyClue: 'Film director whose personal artistic style is unmistakable',
    mediumClue: 'French term for a director treated as the "author" of a movie',
    hardClue: 'Visionary filmmaker rue tau in Paris (6)',
    crypticBreakdown: 'Anagram of RUE TAU -> AUTEUR; definition: "Visionary filmmaker".',
    etymologyOrContext: 'Central concept of the French New Wave film criticism in Cahiers du Cinema.',
    defaultIsCryptic: true,
  },
  {
    answer: 'OSCAR',
    easyClue: 'Golden statuette awarded annually by the Academy of Motion Picture Arts',
    mediumClue: 'Hollywood’s most coveted golden knight on a film reel',
    hardClue: 'Film award orcas swimming backwards (5)',
    crypticBreakdown: 'Anagram ("swimming") of ORCAS -> OSCAR; definition: "Film award".',
    etymologyOrContext: 'First awarded at the Hollywood Roosevelt Hotel in 1929.',
    defaultIsCryptic: true,
  },
  {
    answer: 'ACTOR',
    easyClue: 'Performer who plays a character in a movie, play, or show',
    mediumClue: 'Cast member who steps into someone else’s shoes on cue',
    hardClue: 'Cast member gator loses g for ac (5)',
    crypticBreakdown: 'Anagram of TAR CO -> ACTOR; definition: "Cast member".',
    etymologyOrContext: 'Thespis of Icaria is credited as the first actor in ancient Greek theater.',
    defaultIsCryptic: false,
  },
  {
    answer: 'SCENE',
    easyClue: 'Single continuous unit of action in a film or play',
    mediumClue: 'What a clapperboard marks alongside the take number',
    hardClue: 'Film segment cense rearranged (5)',
    crypticBreakdown: 'Anagram ("rearranged") of CENSE -> SCENE; definition: "Film segment".',
    etymologyOrContext: 'From Greek skene ("stage building or tent").',
    defaultIsCryptic: true,
  },

  // --- TELEVISION & BROADCAST ---
  {
    answer: 'EPISODE',
    easyClue: 'Single installment of a television or radio series',
    mediumClue: 'One chapter in a binge-watched television season',
    hardClue: 'TV installment poised with e in remix (7)',
    crypticBreakdown: 'Anagram ("in remix") of POISED + E -> EPISODE; definition: "TV installment".',
    etymologyOrContext: 'Originally denoted the dialogue sections between choral songs in Greek tragedy.',
    defaultIsCryptic: true,
  },
  {
    answer: 'NETWORK',
    easyClue: 'Group of interconnected television stations broadcasting the same shows',
    mediumClue: 'Broadcaster web—or what professionals do at a conference',
    hardClue: 'Broadcast system won trek across the airwaves (7)',
    crypticBreakdown: 'Anagram ("across the airwaves") of WON TREK -> NETWORK; definition: "Broadcast system".',
    etymologyOrContext: 'Links local affiliate stations to national programming feeds.',
    defaultIsCryptic: true,
  },
  {
    answer: 'CHANNEL',
    easyClue: 'Television frequency band or streaming station you tune into',
    mediumClue: 'What the remote control flips through—or the waterway between England and France',
    hardClue: 'TV station clan hen feathers ruffled (7)',
    crypticBreakdown: 'Anagram ("ruffled") of CLAN HEN -> CHANNEL; definition: "TV station".',
    etymologyOrContext: 'Double meaning: a television band and a navigable strait.',
    defaultIsCryptic: true,
  },
  {
    answer: 'SITCOM',
    easyClue: 'Half-hour humorous television series with recurring characters',
    mediumClue: 'Laugh-track television staple whose name blends location and humor',
    hardClue: 'Funny TV show comics drop s for t (6)',
    crypticBreakdown: 'Anagram of COMIC(s) + T -> SITCOM; definition: "Funny TV show".',
    etymologyOrContext: 'Portmanteau of "situational comedy", pioneered on radio and early television.',
    defaultIsCryptic: false,
  },
  {
    answer: 'FINALE',
    easyClue: 'Last episode of a television season or closing number of a show',
    mediumClue: 'Cliffhanger season closer that leaves viewers talking all summer',
    hardClue: 'Season closer elfin a dance (6)',
    crypticBreakdown: 'Anagram ("dance") of ELFIN A -> FINALE; definition: "Season closer".',
    etymologyOrContext: 'Italian for "final" or "end".',
    defaultIsCryptic: true,
  },
  {
    answer: 'SERIES',
    easyClue: 'Set of related television episodes aired under one title',
    mediumClue: 'Multi-part television run—or the October championship in baseball',
    hardClue: 'TV show rises around east (6)',
    crypticBreakdown: 'Anagram of RISES + E (east) -> SERIES; definition: "TV show".',
    etymologyOrContext: 'In the UK, "series" refers to a single season; in the US, the entire show.',
    defaultIsCryptic: true,
  },
  {
    answer: 'STREAM',
    easyClue: 'Watch video or listen to audio live over the internet',
    mediumClue: 'Babbling brook that became how we watch television on demand',
    hardClue: 'Broadcast online master remade (6)',
    crypticBreakdown: 'Anagram ("remade") of MASTER -> STREAM; definition: "Broadcast online".',
    etymologyOrContext: 'Delivers continuous media packets without downloading the entire file first.',
    defaultIsCryptic: true,
  },
  {
    answer: 'REMOTE',
    easyClue: 'Handheld wireless device used to change TV channels from the sofa',
    mediumClue: 'Couch potato’s magic wand that hides between sofa cushions',
    hardClue: 'Couch clicker meteor showered (6)',
    crypticBreakdown: 'Anagram ("showered") of METEOR -> REMOTE; definition: "Couch clicker".',
    etymologyOrContext: 'Early 1950s Zenith models were called "Lazy Bones" and "Flash-Matic".',
    defaultIsCryptic: true,
  },
  {
    answer: 'SERIAL',
    easyClue: 'Story broadcast in continuing installments with an ongoing plot',
    mediumClue: 'Continuing drama that sounds just like breakfast flakes',
    hardClue: 'Ongoing drama Israel broadcasted (6)',
    crypticBreakdown: 'Anagram ("broadcasted") of ISRAEL -> SERIAL; definition: "Ongoing drama".',
    etymologyOrContext: 'Evolved from 19th-century serialized novels by authors like Charles Dickens.',
    defaultIsCryptic: true,
  },
  {
    answer: 'AERIAL',
    easyClue: 'Rooftop metal antenna that receives television or radio waves',
    mediumClue: 'Rooftop signal catcher—or performed high up in the air',
    hardClue: 'TV antenna air ale mixed up (6)',
    crypticBreakdown: 'Anagram ("mixed up") of AIR ALE -> AERIAL; definition: "TV antenna".',
    etymologyOrContext: 'British standard term for a broadcast receiving antenna.',
    defaultIsCryptic: true,
  },
  {
    answer: 'PILOT',
    easyClue: 'Test first episode produced to sell a new television series',
    mediumClue: 'Cockpit captain—or Episode 1 that convinces a network to order a season',
    hardClue: 'First episode lit up inside post office (5)',
    crypticBreakdown: 'Insertion of IL (lit reversed) inside POT -> PILOT; definition: "First episode".',
    etymologyOrContext: 'Serves as a proof-of-concept prototype for a television show.',
    defaultIsCryptic: false,
  },

  // --- SCIENCE FICTION & FUTURISM ---
  {
    answer: 'STARSHIP',
    easyClue: 'Fictional spacecraft designed to travel between distant star systems',
    mediumClue: 'Warp-drive vessel like the USS Enterprise',
    hardClue: 'Interstellar craft parts his in drydock (8)',
    crypticBreakdown: 'Anagram ("in drydock") of PARTS HIS -> STARSHIP; definition: "Interstellar craft".',
    etymologyOrContext: 'Central vehicle of space opera science fiction.',
    defaultIsCryptic: true,
  },
  {
    answer: 'ANDROID',
    easyClue: 'Robot built to look and act like a human being',
    mediumClue: 'Synthetic human that Philip K. Dick asked if electric sheep visit in dreams',
    hardClue: 'Humanlike robot did roar without r, adding n (7)',
    crypticBreakdown: 'Anagram of DROID + AN -> ANDROID; definition: "Humanlike robot".',
    etymologyOrContext: 'From Greek andr- ("man, human") + -oid ("having the form of").',
    defaultIsCryptic: true,
  },
  {
    answer: 'DYSTOPIA',
    easyClue: 'Imagined future society where life is bleak and oppressive',
    mediumClue: 'Dark sci-fi opposite of utopia seen in 1984 and Brave New World',
    hardClue: 'Bleak future world tidy soap dissolved (8)',
    crypticBreakdown: 'Anagram ("dissolved") of TIDY SOAP -> DYSTOPIA; definition: "Bleak future world".',
    etymologyOrContext: 'First used by John Stuart Mill in an 1868 parliamentary speech.',
    defaultIsCryptic: true,
  },
  {
    answer: 'CYBORG',
    easyClue: 'Being with both organic body parts and mechanical implants',
    mediumClue: 'Part human, part machine sci-fi hero',
    hardClue: 'Bionic being cry bog in confusion (6)',
    crypticBreakdown: 'Anagram ("in confusion") of CRY BOG -> CYBORG; definition: "Bionic being".',
    etymologyOrContext: 'Portmanteau of "cybernetic organism", coined in 1960.',
    defaultIsCryptic: true,
  },
  {
    answer: 'GALAXY',
    easyClue: 'Massive system of billions of stars held together by gravity',
    mediumClue: 'Where Star Wars takes place—"far, far away"',
    hardClue: 'Star system gay lax in arrangement (6)',
    crypticBreakdown: 'Anagram ("in arrangement") of GAY LAX -> GALAXY; definition: "Star system".',
    etymologyOrContext: 'From Greek galaxias kyklos ("milky circle").',
    defaultIsCryptic: false,
  },
  {
    answer: 'PORTAL',
    easyClue: 'Sci-fi doorway or wormhole that teleports travelers across space or time',
    mediumClue: 'Glowing dimensional gateway—or a grand architectural entrance',
    hardClue: 'Dimensional gate patrol on the move (6)',
    crypticBreakdown: 'Anagram ("on the move") of PATROL -> PORTAL; definition: "Dimensional gate".',
    etymologyOrContext: 'From Latin porta ("gate").',
    defaultIsCryptic: true,
  },
  {
    answer: 'PHASER',
    easyClue: 'Futuristic energy beam weapon often set to "stun"',
    mediumClue: 'Starfleet sidearm that rhymes with laser',
    hardClue: 'Sci-fi ray gun seraph terbang reversed (6)',
    crypticBreakdown: 'Anagram ("reversed") of SERAPH -> PHASER; definition: "Sci-fi ray gun".',
    etymologyOrContext: 'Coined for Star Trek in 1966 from "phased energy rectification".',
    defaultIsCryptic: true,
  },
  {
    answer: 'MUTANT',
    easyClue: 'Organism with a genetic change that gives it new traits or powers',
    mediumClue: 'Comic-book and sci-fi hero born with an X-gene evolution',
    hardClue: 'Genetically altered being nut mat woven (6)',
    crypticBreakdown: 'Anagram ("woven") of NUT MAT -> MUTANT; definition: "Genetically altered being".',
    etymologyOrContext: 'From Latin mutare ("to change").',
    defaultIsCryptic: false,
  },
  {
    answer: 'ALIEN',
    easyClue: 'Creature from another planet; extraterrestrial',
    mediumClue: 'Visitor from beyond Earth whose ship might be a flying saucer',
    hardClue: 'Extraterrestrial line a mixed up (5)',
    crypticBreakdown: 'Anagram ("mixed up") of LINE A -> ALIEN; definition: "Extraterrestrial".',
    etymologyOrContext: 'From Latin alienus ("belonging to another").',
    defaultIsCryptic: true,
  },
  {
    answer: 'ROBOT',
    easyClue: 'Programmable mechanical machine capable of carrying out tasks automatically',
    mediumClue: 'Mechanical helper governed by Asimov’s Three Laws',
    hardClue: 'Mechanical worker borto spun around (5)',
    crypticBreakdown: 'Anagram ("spun around") of BORTO -> ROBOT; definition: "Mechanical worker".',
    etymologyOrContext: 'Introduced by Karel Capek in his 1920 sci-fi play R.U.R. from Czech robota.',
    defaultIsCryptic: false,
  },
  {
    answer: 'CLONE',
    easyClue: 'Genetically identical copy of a living organism',
    mediumClue: 'Sci-fi double grown in a vat—or Dolly the famous sheep',
    hardClue: 'Genetic double clean without a, adding o (5)',
    crypticBreakdown: 'Anagram of CONE + L -> CLONE; definition: "Genetic double".',
    etymologyOrContext: 'From Greek klon ("twig, slip").',
    defaultIsCryptic: true,
  },

  // --- POPULAR SUBJECTS: MUSIC, CULINARY & MYTHOLOGY ---
  {
    answer: 'SYMPHONY',
    easyClue: 'Elaborate musical composition for a full orchestra in four movements',
    mediumClue: 'Beethoven’s Ninth or Mozart’s Jupiter in the concert hall',
    hardClue: 'Orchestral work hymns pay without a, adding o (8)',
    crypticBreakdown: 'Wordplay on SYM + PHONY ("fake sound"); definition: "Orchestral work".',
    etymologyOrContext: 'From Greek symphonia ("agreement or concord of sound").',
    defaultIsCryptic: true,
  },
  {
    answer: 'MELODY',
    easyClue: 'Sequence of musical notes that forms a recognizable tune',
    mediumClue: 'Catchy tune you find yourself humming after the concert',
    hardClue: 'Catchy tune oldemy rearranged (6)',
    crypticBreakdown: 'Anagram ("rearranged") of OLDEMY -> MELODY; definition: "Catchy tune".',
    etymologyOrContext: 'From Greek meloidia ("singing, chanting").',
    defaultIsCryptic: false,
  },
  {
    answer: 'CHORUS',
    easyClue: 'Repeated main refrain of a song where everyone sings along',
    mediumClue: 'The part of a pop song everyone knows the words to',
    hardClue: 'Refrain such or mixed up (6)',
    crypticBreakdown: 'Anagram ("mixed up") of SUCH OR -> CHORUS; definition: "Refrain".',
    etymologyOrContext: 'Originated in Athenian drama as the unified group of singers and dancers.',
    defaultIsCryptic: true,
  },
  {
    answer: 'ENCORE',
    easyClue: 'Extra song performed at the end of a concert when the audience cheers',
    mediumClue: 'What fans shout while clapping after the band leaves the stage',
    hardClue: 'Extra performance cornea without a (6)',
    crypticBreakdown: 'Anagram of CORNE(a) + E -> ENCORE; definition: "Extra performance".',
    etymologyOrContext: 'French for "again" or "some more".',
    defaultIsCryptic: true,
  },
  {
    answer: 'SONATA',
    easyClue: 'Classical music piece written for a solo instrument like piano or violin',
    mediumClue: 'Beethoven’s "Moonlight" composition for solo keys',
    hardClue: 'Instrumental piece at a son’s recital backwards (6)',
    crypticBreakdown: 'Anagram of A TAN OS -> SONATA; definition: "Instrumental piece".',
    etymologyOrContext: 'From Italian suonare ("to sound"), contrasted with cantata ("to sing").',
    defaultIsCryptic: true,
  },
  {
    answer: 'TEMPO',
    easyClue: 'Speed or pace at which a piece of music is played',
    mediumClue: 'Beat speed measured by a ticking metronome',
    hardClue: 'Musical pace poem with t rearranged (5)',
    crypticBreakdown: 'Anagram ("rearranged") of POEM + T -> TEMPO; definition: "Musical pace".',
    etymologyOrContext: 'Italian for "time"; marked by terms like allegro, adagio, and andante.',
    defaultIsCryptic: true,
  },
  {
    answer: 'SAFFRON',
    easyClue: 'Golden-red spice harvested from crocus flowers, used in paella',
    mediumClue: 'The world’s most expensive spice by weight, harvested thread by thread',
    hardClue: 'Golden spice raffs on in the kitchen (7)',
    crypticBreakdown: 'Anagram ("in the kitchen") of RAFFS ON -> SAFFRON; definition: "Golden spice".',
    etymologyOrContext: 'Derived from the crimson stigmas of Crocus sativus.',
    defaultIsCryptic: true,
  },
  {
    answer: 'TRUFFLE',
    easyClue: 'Rare underground mushroom prized by chefs, or a rich chocolate candy',
    mediumClue: 'Forest delicacy hunted by keen-nosed dogs and pigs',
    hardClue: 'Gourmet fungus flutter around f (7)',
    crypticBreakdown: 'Wordplay on TRUFFLE; definition: "Gourmet fungus".',
    etymologyOrContext: 'Prized varieties include the black Perigord and white Alba truffles.',
    defaultIsCryptic: false,
  },
  {
    answer: 'BISTRO',
    easyClue: 'Small, cozy French-style restaurant serving simple meals',
    mediumClue: 'Sidewalk cafe in Paris with chalkboard menus',
    hardClue: 'Cozy cafe orbits around the square (6)',
    crypticBreakdown: 'Anagram ("around the square") of ORBITS -> BISTRO; definition: "Cozy cafe".',
    etymologyOrContext: 'Classic Parisian neighborhood dining institution.',
    defaultIsCryptic: true,
  },
  {
    answer: 'RECIPE',
    easyClue: 'Set of instructions and ingredients for preparing a dish',
    mediumClue: 'Cookbook formula passed down through generations',
    hardClue: 'Cooking guide pierce through the middle (6)',
    crypticBreakdown: 'Anagram ("through the middle") of PIERCE -> RECIPE; definition: "Cooking guide".',
    etymologyOrContext: 'From Latin recipe ("take!"), originally used at the top of apothecary prescriptions.',
    defaultIsCryptic: true,
  },
  {
    answer: 'PALATE',
    easyClue: 'Roof of the mouth, or a person’s sense of taste for food and wine',
    mediumClue: 'A chef’s refined sense of flavor—not to be confused with a painter’s board',
    hardClue: 'Sense of taste a plate rearranged (6)',
    crypticBreakdown: 'Anagram ("rearranged") of A PLATE -> PALATE; definition: "Sense of taste".',
    etymologyOrContext: 'Homophone of palette (artist board) and pallet (shipping platform).',
    defaultIsCryptic: true,
  },
  {
    answer: 'AROMA',
    easyClue: 'Pleasant, appetizing smell of fresh coffee or baking bread',
    mediumClue: 'Kitchen fragrance that draws everyone to the table',
    hardClue: 'Pleasant scent roam a bit (5)',
    crypticBreakdown: 'Charade of A + ROMA (roam a) -> AROMA; definition: "Pleasant scent".',
    etymologyOrContext: 'From Greek aroma ("seasoning, sweet spice").',
    defaultIsCryptic: true,
  },
  {
    answer: 'FEAST',
    easyClue: 'Large, celebratory meal with many courses for guests',
    mediumClue: 'Banquet table spread fit for a king',
    hardClue: 'Grand banquet fates twisted (5)',
    crypticBreakdown: 'Anagram ("twisted") of FATES -> FEAST; definition: "Grand banquet".',
    etymologyOrContext: 'From Latin festa ("festal days").',
    defaultIsCryptic: true,
  },

  // --- ASTRONOMY, ECOLOGY, LITERATURE & NAVIGATION ---
  {
    answer: 'ASTRONOMER',
    easyClue: 'Scientist who studies stars, planets, and space',
    mediumClue: 'Night-shift professional who is always looking up',
    hardClue: 'Star-gazer roamers not wandering at last (10)',
    crypticBreakdown: 'Anagram ("wandering") of ROAMERS NOT -> ASTRONOMER; definition: "Star-gazer".',
    etymologyOrContext: 'From Greek astron (star) + nomos (arranging, law).',
    defaultIsCryptic: true,
  },
  {
    answer: 'OBSERVATORY',
    easyClue: 'Domed building equipped with a large telescope',
    mediumClue: 'High-altitude room with a view of the galaxies',
    hardClue: 'Watchful dome where a brave story is retold around zero (11)',
    crypticBreakdown: 'Anagram ("is retold") of BRAVE STORY + O (zero) -> OBSERVATORY; definition: "Watchful dome".',
    etymologyOrContext: 'Historically positioned on high mountain peaks above atmospheric distortion.',
    defaultIsCryptic: false,
  },
  {
    answer: 'CONSTELLATION',
    easyClue: 'Group of stars forming a named pattern in the night sky',
    mediumClue: 'Connect-the-dots picture drawn across the heavens',
    hardClue: 'Starry group calls note into arrangement (13)',
    crypticBreakdown: 'Complex anagram ("arrangement") of CALLS NOTE INTO -> CONSTELLATION; definition: "Starry group".',
    etymologyOrContext: 'The IAU officially recognizes 88 modern star patterns.',
    defaultIsCryptic: true,
  },
  {
    answer: 'EQUINOX',
    easyClue: 'Day of the year when daytime and nighttime are equal in length',
    mediumClue: 'Twice-yearly balancing act between light and dark',
    hardClue: 'Equal night starts with exotic queen before ox (7)',
    crypticBreakdown: 'Charade of E (exotic start) + QUIN (queen sound) + OX -> EQUINOX; definition: "Equal night".',
    etymologyOrContext: 'From Latin aequus (equal) + nox (night), occurring in March and September.',
    defaultIsCryptic: false,
  },
  {
    answer: 'NEBULA',
    easyClue: 'Giant cloud of gas and dust in outer space',
    mediumClue: 'Cosmic nursery where newborn stars ignite',
    hardClue: 'Cloud in space spun around blue anorak initially (6)',
    crypticBreakdown: 'Anagram ("spun around") of BLUE AN(orak) -> NEBULA; definition: "Cloud in space".',
    etymologyOrContext: 'Latin for "mist" or "cloud"; stellar nurseries where stars are born.',
    defaultIsCryptic: true,
  },
  {
    answer: 'ECLIPSE',
    easyClue: 'Event when the Moon or Earth blocks light from the Sun',
    mediumClue: 'Celestial photobomb that casts a dramatic shadow',
    hardClue: 'Outshine special arrangement in the sky (7)',
    crypticBreakdown: 'Anagram ("arrangement") of SPECIAL -> ECLIPSE; definition: "Outshine".',
    etymologyOrContext: 'Occurs as solar (Moon blocks Sun) or lunar (Earth shadows Moon).',
    defaultIsCryptic: true,
  },
  {
    answer: 'ORBITAL',
    easyClue: 'Relating to the curved path of a planet or spacecraft',
    mediumClue: 'Going around in circles at thousands of miles per hour',
    hardClue: 'Looping path of trial aboard ship (7)',
    crypticBreakdown: 'Anagram of TRIAL inside OB (old boy/ship) -> ORBITAL; definition: "Looping path".',
    etymologyOrContext: 'Describes both planetary trajectories and atomic electron wavefunctions.',
    defaultIsCryptic: false,
  },
  {
    answer: 'ZENITH',
    easyClue: 'The highest point reached in the sky directly overhead',
    mediumClue: 'Absolute peak that starts at the end of the alphabet',
    hardClue: 'Peak citizen, it hides inside! (6)',
    crypticBreakdown: 'Hidden word ("hides inside") in citiZEN ITHaca / zen + ith; definition: "Peak".',
    etymologyOrContext: 'Derived via medieval Latin and Arabic samt al-ras ("path over the head").',
    defaultIsCryptic: true,
  },
  {
    answer: 'PARALLAX',
    easyClue: 'Apparent shift of an object when viewed from two different angles',
    mediumClue: 'Why your thumb jumps when you wink one eye then the other',
    hardClue: 'Shift in perspective when all par axes align (8)',
    crypticBreakdown: 'Charade of PAR + ALL + AX (axes short) -> PARALLAX; definition: "Shift in perspective".',
    etymologyOrContext: 'Used by astronomers to measure distances to nearby stars.',
    defaultIsCryptic: false,
  },
  {
    answer: 'SOLSTICE',
    easyClue: 'Either the longest or the shortest day of the year',
    mediumClue: 'Midwinter or midsummer turning point when the sun stands still',
    hardClue: 'Turning point of the sun costs lie in ruin (8)',
    crypticBreakdown: 'Anagram ("in ruin") of COSTS LIE -> SOLSTICE; definition: "Turning point of the sun".',
    etymologyOrContext: 'From Latin sol (sun) + sistere (to stand still).',
    defaultIsCryptic: true,
  },
  {
    answer: 'APOGEE',
    easyClue: 'Farthest point in a satellite or Moon orbit from Earth',
    mediumClue: 'Orbital high-water mark where Earth looks smallest',
    hardClue: 'Distant peak where a page goes around outskirts of Europe (6)',
    crypticBreakdown: 'A + POGE (page shift) + E (outskirts of Europe) -> APOGEE; definition: "Distant peak".',
    etymologyOrContext: 'Opposite of perigee; from Greek apo (away from) + ge (Earth).',
    defaultIsCryptic: false,
  },
  {
    answer: 'METEORITE',
    easyClue: 'Space rock that survives falling through the atmosphere to hit Earth',
    mediumClue: 'Shooting star that actually made a touchdown',
    hardClue: 'Space rock remote tie shattered on impact (9)',
    crypticBreakdown: 'Anagram ("shattered") of REMOTE TIE -> METEORITE; definition: "Space rock".',
    etymologyOrContext: 'A meteoroid in space becomes a meteor in the atmosphere and a meteorite on the ground.',
    defaultIsCryptic: true,
  },
  {
    answer: 'RADIANT',
    easyClue: 'Shining brightly or sending out light and warmth',
    mediumClue: 'Beaming with joy—or the sky point where meteors fan out',
    hardClue: 'Glowing train ad remade backwards (7)',
    crypticBreakdown: 'Anagram ("remade") of TRAIN AD -> RADIANT; definition: "Glowing".',
    etymologyOrContext: 'Also the celestial point from which a meteor shower appears to originate.',
    defaultIsCryptic: true,
  },
  {
    answer: 'SPECTRUM',
    easyClue: 'Continuous band of rainbow colors separated by wavelength',
    mediumClue: 'What a glass prism unpacks from a beam of white light',
    hardClue: 'Range of light crumpets baked backwards (8)',
    crypticBreakdown: 'Anagram ("baked") of CRUMPETS -> SPECTRUM; definition: "Range of light".',
    etymologyOrContext: 'Coined by Isaac Newton in 1671 during his prism experiments.',
    defaultIsCryptic: true,
  },
  {
    answer: 'TELESCOPE',
    easyClue: 'Optical instrument with lenses or mirrors used to view distant stars',
    mediumClue: 'Galileo’s tube that brings Jupiter’s moons next door',
    hardClue: 'Spyglass elect pose in disarray (9)',
    crypticBreakdown: 'Anagram ("in disarray") of ELECT POSE -> TELESCOPE; definition: "Spyglass".',
    etymologyOrContext: 'First patented by Hans Lippershey in 1608 and turned skyward by Galileo.',
    defaultIsCryptic: true,
  },
  {
    answer: 'NOVA',
    easyClue: 'Star that suddenly becomes thousands of times brighter',
    mediumClue: 'Stellar flare-up whose Latin name means "new"',
    hardClue: 'New star captured in Avon backwards (4)',
    crypticBreakdown: 'Reversal ("backwards") of AVON -> NOVA; definition: "New star".',
    etymologyOrContext: 'From Latin stella nova, meaning "new star".',
    defaultIsCryptic: true,
  },
  {
    answer: 'COMET',
    easyClue: 'Icy body in space that forms a bright tail when passing near the Sun',
    mediumClue: 'Halley’s dirty snowball on a 76-year schedule',
    hardClue: 'Icy traveler met company at the door (5)',
    crypticBreakdown: 'Charade of CO (company) + MET -> COMET; definition: "Icy traveler".',
    etymologyOrContext: 'From Greek kometes, meaning "wearing long hair".',
    defaultIsCryptic: false,
  },
  {
    answer: 'QUASAR',
    easyClue: 'Extremely bright and distant galactic core powered by a black hole',
    mediumClue: 'Star-like radio beacon shining from the edge of the universe',
    hardClue: 'Distant beacon as aqua ripples around right (6)',
    crypticBreakdown: 'Anagram of AQUA + S + R (right) -> QUASAR; definition: "Distant beacon".',
    etymologyOrContext: 'Short for "quasi-stellar radio source".',
    defaultIsCryptic: false,
  },
  {
    answer: 'PULSAR',
    easyClue: 'Rapidly spinning neutron star that emits regular pulses of radiation',
    mediumClue: 'Cosmic lighthouse keeping time more accurately than atomic clocks',
    hardClue: 'Spinning beacon slurp a cocktail (6)',
    crypticBreakdown: 'Anagram ("cocktail") of SLURP A -> PULSAR; definition: "Spinning beacon".',
    etymologyOrContext: 'Discovered in 1967 by Jocelyn Bell Burnell and Antony Hewish.',
    defaultIsCryptic: true,
  },
  {
    answer: 'CORONA',
    easyClue: 'Glowing outer atmosphere of the Sun seen during a total eclipse',
    mediumClue: 'Fiery solar crown hidden until the Moon steps in front',
    hardClue: 'Solar crown racoon spun around (6)',
    crypticBreakdown: 'Anagram ("spun around") of RACOON -> CORONA; definition: "Solar crown".',
    etymologyOrContext: 'Latin for "crown"; reaches temperatures of millions of kelvins.',
    defaultIsCryptic: true,
  },
  {
    answer: 'ALBEDO',
    easyClue: 'Fraction of sunlight that a planet or icy surface reflects back into space',
    mediumClue: 'Why fresh snow gleams bright while charcoal stays dark',
    hardClue: 'Reflectivity of blade zero reshaped (6)',
    crypticBreakdown: 'Anagram ("reshaped") of BLADE + O (zero) -> ALBEDO; definition: "Reflectivity".',
    etymologyOrContext: 'Ranges from 0 (blackbody absorbing all light) to 1 (total reflection).',
    defaultIsCryptic: true,
  },
  {
    answer: 'UMBRA',
    easyClue: 'Darkest inner core of a shadow during an eclipse',
    mediumClue: 'Shady relative of an umbrella where light is totally blocked',
    hardClue: 'Dark shadow hidden in rumba dance (5)',
    crypticBreakdown: 'Anagram ("dance") of RUMBA -> UMBRA; definition: "Dark shadow".',
    etymologyOrContext: 'Surrounded by the lighter penumbra during eclipses.',
    defaultIsCryptic: true,
  },
  {
    answer: 'NADIR',
    easyClue: 'The lowest possible point; directly opposite the zenith',
    mediumClue: 'Rock bottom on the celestial sphere',
    hardClue: 'Lowest point drain backwards (5)',
    crypticBreakdown: 'Anagram/reversal ("backwards") of DRAIN -> NADIR; definition: "Lowest point".',
    etymologyOrContext: 'The direct opposite of the zenith.',
    defaultIsCryptic: true,
  },
  {
    answer: 'TITAN',
    easyClue: 'Largest moon of Saturn, famous for its thick golden haze',
    mediumClue: 'Mythological giant orbiting within Saturn’s ring system',
    hardClue: 'Giant moon taint disturbed (5)',
    crypticBreakdown: 'Anagram ("disturbed") of TAINT -> TITAN; definition: "Giant moon".',
    etymologyOrContext: 'Discovered by Christiaan Huygens in 1655.',
    defaultIsCryptic: true,
  },
  {
    answer: 'ORION',
    easyClue: 'Famous winter constellation featuring a three-star belt',
    mediumClue: 'Celestial hunter flanked by Betelgeuse and Rigel',
    hardClue: 'Hunter in the sky iron ring forged (5)',
    crypticBreakdown: 'Anagram ("forged") of IRON + O (ring) -> ORION; definition: "Hunter in the sky".',
    etymologyOrContext: 'Contains the bright supergiants Betelgeuse and Rigel.',
    defaultIsCryptic: true,
  },
  {
    answer: 'ATLAS',
    easyClue: 'Book of geographical maps, or the Greek Titan who held up the sky',
    mediumClue: 'World-carrying heavyweight found in the reference section',
    hardClue: 'Book of maps last a long time backwards (5)',
    crypticBreakdown: 'Reversal ("backwards") of A SALT / LAST A -> ATLAS; definition: "Book of maps".',
    etymologyOrContext: 'First used for a map collection by Gerardus Mercator in 1595.',
    defaultIsCryptic: false,
  },
  {
    answer: 'VORTEX',
    easyClue: 'Spinning whirlpool of water or swirling column of air',
    mediumClue: 'Spiraling funnel that pulls everything toward its center',
    hardClue: 'Whirlpool overtakes X at the center (6)',
    crypticBreakdown: 'Anagram of OVERT + X -> VORTEX; definition: "Whirlpool".',
    etymologyOrContext: 'Plural vortices; occurs in tornadoes, whirlpools, and aircraft wingtips.',
    defaultIsCryptic: false,
  },
  {
    answer: 'HORIZON',
    easyClue: 'Line in the distance where the Earth or sea seems to meet the sky',
    mediumClue: 'Boundary line that retreats as fast as you sail toward it',
    hardClue: 'Skyline where rhino zoinks around (7)',
    crypticBreakdown: 'Anagram of RHINO + ZO -> HORIZON; definition: "Skyline".',
    etymologyOrContext: 'From Greek horizon kyklos, meaning "separating circle".',
    defaultIsCryptic: false,
  },
  {
    answer: 'AURORA',
    easyClue: 'Glowing green and violet curtains of light in polar night skies',
    mediumClue: 'Dawn goddess painting the Arctic sky with solar wind',
    hardClue: 'Northern lights roar around gold (6)',
    crypticBreakdown: 'AU (gold) + RORA (roar around) -> AURORA; definition: "Northern lights".',
    etymologyOrContext: 'Named after the Roman goddess of the dawn.',
    defaultIsCryptic: true,
  },
  {
    answer: 'COSMOS',
    easyClue: 'The entire universe regarded as an orderly system',
    mediumClue: 'Greek word for order that shares its name with both space and a flower',
    hardClue: 'Orderly universe moss company overturned (6)',
    crypticBreakdown: 'CO (company) + SMOS (moss overturned) -> COSMOS; definition: "Orderly universe".',
    etymologyOrContext: 'Antonym of chaos in ancient Greek philosophy.',
    defaultIsCryptic: false,
  },
  {
    answer: 'ETHER',
    easyClue: 'Clear upper air beyond the clouds; early anesthetic liquid',
    mediumClue: 'Invisible medium once thought to carry light waves through space',
    hardClue: 'Upper air there swirling about (5)',
    crypticBreakdown: 'Anagram ("swirling about") of THERE -> ETHER; definition: "Upper air".',
    etymologyOrContext: 'Once hypothesized as the "luminiferous aether" carrying light waves.',
    defaultIsCryptic: true,
  },
  {
    answer: 'LUNAR',
    easyClue: 'Relating to the Moon',
    mediumClue: 'Kind of module, eclipse, or calendar tied to Earth’s night lantern',
    hardClue: 'Moon-related ulnar bone twisted (5)',
    crypticBreakdown: 'Anagram ("twisted") of ULNAR -> LUNAR; definition: "Moon-related".',
    etymologyOrContext: 'From Latin luna (the Moon).',
    defaultIsCryptic: true,
  },
  {
    answer: 'SOLAR',
    easyClue: 'Relating to or powered by the Sun',
    mediumClue: 'Daytime energy source collected by rooftop panels',
    hardClue: 'Sun-powered oral speech starts with S (5)',
    crypticBreakdown: 'S + ORAL -> SOLAR; definition: "Sun-powered".',
    etymologyOrContext: 'From Latin sol (Sun).',
    defaultIsCryptic: false,
  },
  {
    answer: 'ASTRA',
    easyClue: 'Latin word for the stars, used in "per ardua ad ___"',
    mediumClue: 'Starry destination reached through motto hardships',
    hardClue: 'Stars seen in fast racing cars (5)',
    crypticBreakdown: 'Hidden word ("seen in") fAST RAcing -> ASTRA; definition: "Stars".',
    etymologyOrContext: 'Ad astra per aspera: "To the stars through hardships".',
    defaultIsCryptic: true,
  },
  {
    answer: 'EPOCH',
    easyClue: 'Long and notable period of history or geological time',
    mediumClue: 'Milestone era that sets the clock for astronomers and geologists',
    hardClue: 'Era of hope around century’s start (5)',
    crypticBreakdown: 'Anagram of HOPE + C (century’s start) -> EPOCH; definition: "Era".',
    etymologyOrContext: 'Standard astronomical catalogs currently use the J2000.0 epoch.',
    defaultIsCryptic: true,
  },
  {
    answer: 'PHASE',
    easyClue: 'Distinct stage in a process, or the changing shape of the lit Moon',
    mediumClue: 'Waxing crescent or waning gibbous stage',
    hardClue: 'Stage shapes without the last letter (5)',
    crypticBreakdown: 'Anagram of SHAPE(s) -> PHASE; definition: "Stage".',
    etymologyOrContext: 'Lunar phases cycle every 29.53 days (a synodic month).',
    defaultIsCryptic: false,
  },
  {
    answer: 'ARENA',
    easyClue: 'Enclosed stadium or circular stage for sports and concerts',
    mediumClue: 'Gladiator’s sandy floor that became a modern concert bowl',
    hardClue: 'Stadium near a crossroads (5)',
    crypticBreakdown: 'Anagram of NEAR A -> ARENA; definition: "Stadium".',
    etymologyOrContext: 'Latin harena, meaning "fine sand" strewn on amphitheater floors.',
    defaultIsCryptic: true,
  },
  {
    answer: 'OPERA',
    easyClue: 'Theatrical drama sung entirely to orchestral accompaniment',
    mediumClue: 'Grand stage production where divas hit high C',
    hardClue: 'Musical drama a pear cooked up (5)',
    crypticBreakdown: 'Anagram ("cooked up") of A PEAR / O + PEAR -> OPERA; definition: "Musical drama".',
    etymologyOrContext: 'Italian plural of opus ("work").',
    defaultIsCryptic: true,
  },
  {
    answer: 'REALM',
    easyClue: 'Royal kingdom or domain of expertise',
    mediumClue: 'Monarch’s territory or a sphere of imagination',
    hardClue: 'Kingdom armigerous leader leaves alarm (5)',
    crypticBreakdown: 'Anagram of ALARM with E replacing A -> REALM; definition: "Kingdom".',
    etymologyOrContext: 'From Old French reaume and Latin regimen.',
    defaultIsCryptic: false,
  },
  {
    answer: 'CREST',
    easyClue: 'Top ridge of a mountain, breaking wave, or bird’s head feathers',
    mediumClue: 'Foamy peak of a wave or emblem atop a knight’s helm',
    hardClue: 'Peak certs sorted out (5)',
    crypticBreakdown: 'Anagram ("sorted out") of CERTS -> CREST; definition: "Peak".',
    etymologyOrContext: 'From Latin crista ("tuft" or "plume").',
    defaultIsCryptic: true,
  },
  {
    answer: 'TRACE',
    easyClue: 'Very small amount, or to copy a drawing through thin paper',
    mediumClue: 'Follow footsteps back to the source or leave a faint mark',
    hardClue: 'Track down crate in transit (5)',
    crypticBreakdown: 'Anagram ("in transit") of CRATE -> TRACE; definition: "Track down".',
    etymologyOrContext: 'Also means a minute and barely detectable amount.',
    defaultIsCryptic: true,
  },
  {
    answer: 'SCALE',
    easyClue: 'Instrument for weighing, or a series of musical notes',
    mediumClue: 'Climber’s verb, fish’s armor, and pianist’s warmup all in one',
    hardClue: 'Measure laces untied (5)',
    crypticBreakdown: 'Anagram ("untied") of LACES -> SCALE; definition: "Measure".',
    etymologyOrContext: 'From Latin scala ("ladder").',
    defaultIsCryptic: true,
  },
  {
    answer: 'PRISM',
    easyClue: 'Triangular glass block that splits white light into a rainbow',
    mediumClue: 'Optical crystal with an angled perspective on light',
    hardClue: 'Glass wedge prims and proper (5)',
    crypticBreakdown: 'Anagram of PRIMS -> PRISM; definition: "Glass wedge".',
    etymologyOrContext: 'Disperses white light into its constituent spectral colors.',
    defaultIsCryptic: false,
  },
  {
    answer: 'LASER',
    easyClue: 'Device that produces an intense, narrow beam of single-color light',
    mediumClue: 'Focused beam born as an acronym for light amplification',
    hardClue: 'Focused beam earls danced around (5)',
    crypticBreakdown: 'Anagram ("danced around") of EARLS -> LASER; definition: "Focused beam".',
    etymologyOrContext: 'Acronym for Light Amplification by Stimulated Emission of Radiation.',
    defaultIsCryptic: true,
  },
  {
    answer: 'DELTA',
    easyClue: 'Triangular area of marshland where a river splits before entering the sea',
    mediumClue: 'Fourth Greek letter shaped like a river’s fan-out mouth',
    hardClue: 'River mouth dealt a new hand (5)',
    crypticBreakdown: 'Anagram ("a new hand") of DEALT -> DELTA; definition: "River mouth".',
    etymologyOrContext: 'Named after the triangular uppercase Greek letter Δ.',
    defaultIsCryptic: true,
  },
  {
    answer: 'FLORA',
    easyClue: 'All the plant life native to a particular region or era',
    mediumClue: 'Botanical counterpart to fauna',
    hardClue: 'Plant life for alchemists initially (5)',
    crypticBreakdown: 'Anagram of FOR AL(chemists) -> FLORA; definition: "Plant life".',
    etymologyOrContext: 'Roman goddess of flowers and the season of spring.',
    defaultIsCryptic: false,
  },
  {
    answer: 'CORAL',
    easyClue: 'Hard colorful marine organism that builds tropical reefs',
    mediumClue: 'Pinkish-orange shade named after an underwater reef architect',
    hardClue: 'Reef builder carol sung out of tune (5)',
    crypticBreakdown: 'Anagram ("sung out of tune") of CAROL -> CORAL; definition: "Reef builder".',
    etymologyOrContext: 'Secretes calcium carbonate to form a hard skeleton.',
    defaultIsCryptic: true,
  },
  {
    answer: 'SPORE',
    easyClue: 'Microscopic reproductive cell of a fern, mushroom, or moss',
    mediumClue: 'Seedless traveler carried on the wind for ferns and fungi',
    hardClue: 'Fern seed ropes untangled (5)',
    crypticBreakdown: 'Anagram ("untangled") of ROPES -> SPORE; definition: "Fern seed".',
    etymologyOrContext: 'From Greek spora, meaning "seed" or "sowing".',
    defaultIsCryptic: true,
  },
  {
    answer: 'PETAL',
    easyClue: 'Single colored leaf-like segment of a blooming flower',
    mediumClue: 'Rose segment plucked in "he loves me, he loves me not"',
    hardClue: 'Flower part plate spun around (5)',
    crypticBreakdown: 'Anagram ("spun around") of PLATE -> PETAL; definition: "Flower part".',
    etymologyOrContext: 'Collectively, all petals of a flower are called the corolla.',
    defaultIsCryptic: true,
  },
  {
    answer: 'BIOME',
    easyClue: 'Large natural ecosystem type such as rainforest, desert, or tundra',
    mediumClue: 'Major ecological neighborhood defined by climate and life',
    hardClue: 'Ecological region where mob ie gathers (5)',
    crypticBreakdown: 'Anagram of MOB IE -> BIOME; definition: "Ecological region".',
    etymologyOrContext: 'Includes tundra, taiga, temperate forest, savannah, and desert.',
    defaultIsCryptic: false,
  },
  {
    answer: 'GROVE',
    easyClue: 'Small group of trees or orchard growing closely together',
    mediumClue: 'Shady cluster of olive or orange trees without heavy undergrowth',
    hardClue: 'Orchard where rover loses right and gains g (5)',
    crypticBreakdown: 'G + ROVE (wander) -> GROVE; definition: "Orchard".',
    etymologyOrContext: 'Often consists of cultivated fruit or nut trees.',
    defaultIsCryptic: false,
  },
  {
    answer: 'CEDAR',
    easyClue: 'Evergreen conifer tree prized for its fragrant, moth-repelling wood',
    mediumClue: 'Aromatic timber depicted on the flag of Lebanon',
    hardClue: 'Fragrant wood cared deeply about (5)',
    crypticBreakdown: 'Anagram ("deeply about") of CARED -> CEDAR; definition: "Fragrant wood".',
    etymologyOrContext: 'True cedars (genus Cedrus) are native to the Mediterranean and Himalayas.',
    defaultIsCryptic: true,
  },
  {
    answer: 'MAPLE',
    easyClue: 'Broadleaf tree tapped in early spring for sweet syrup',
    mediumClue: 'Autumn blaze tree whose leaf graces Canada’s emblem',
    hardClue: 'Syrup tree ample in size (5)',
    crypticBreakdown: 'Anagram ("in size") of AMPLE -> MAPLE; definition: "Syrup tree".',
    etymologyOrContext: 'Genus Acer; the sugar maple leaf is the national symbol of Canada.',
    defaultIsCryptic: true,
  },
  {
    answer: 'ASPEN',
    easyClue: 'Mountain poplar tree whose leaves flutter in the slightest breeze',
    mediumClue: 'Quaking white-barked tree that shares its name with a Colorado ski resort',
    hardClue: 'Quaking tree panes broken (5)',
    crypticBreakdown: 'Anagram ("broken") of PANES -> ASPEN; definition: "Quaking tree".',
    etymologyOrContext: 'Pando, a clonal colony of quaking aspen in Utah, is one of the oldest living organisms.',
    defaultIsCryptic: true,
  },
  {
    answer: 'LOTUS',
    easyClue: 'Sacred water lily that blooms cleanly above muddy ponds',
    mediumClue: 'Yoga posture and serene aquatic blossom in one',
    hardClue: 'Water lily louts cast out (5)',
    crypticBreakdown: 'Anagram ("out") of LOUTS -> LOTUS; definition: "Water lily".',
    etymologyOrContext: 'Nelumbo nucifera; its seeds can remain viable for over a thousand years.',
    defaultIsCryptic: true,
  },
  {
    answer: 'ALGAE',
    easyClue: 'Simple aquatic organisms ranging from pond scum to giant kelp',
    mediumClue: 'Rootless water greenery that makes most of Earth’s oxygen',
    hardClue: 'Seaweed gale blows around a (5)',
    crypticBreakdown: 'A + GALE rearranged -> ALGAE; definition: "Seaweed".',
    etymologyOrContext: 'Produce more than half of the Earth’s atmospheric oxygen.',
    defaultIsCryptic: false,
  },
  {
    answer: 'OASIS',
    easyClue: 'Green fertile spot in a desert where underground water reaches the surface',
    mediumClue: 'Palm-ringed refuge for a thirsty caravan',
    hardClue: 'Desert haven so as I step inside (5)',
    crypticBreakdown: 'Anagram of SO AS I -> OASIS; definition: "Desert haven".',
    etymologyOrContext: 'Sustained by underground aquifers or artesian springs.',
    defaultIsCryptic: false,
  },
  {
    answer: 'RIVER',
    easyClue: 'Large natural stream of water flowing in a channel to the sea',
    mediumClue: 'Winding water highway that has a bed and a mouth but never sleeps',
    hardClue: 'Stream split by right at the bank (5)',
    crypticBreakdown: 'RIVE (split) + R (right) -> RIVER; definition: "Stream".',
    etymologyOrContext: 'From Latin riparia ("of a riverbank").',
    defaultIsCryptic: false,
  },
  {
    answer: 'OCEAN',
    easyClue: 'Vast body of salt water covering most of the globe',
    mediumClue: 'Pacific, Atlantic, Indian, Arctic, or Southern expanse',
    hardClue: 'Vast sea canoe capsized in storm (5)',
    crypticBreakdown: 'Anagram ("capsized") of CANOE -> OCEAN; definition: "Vast sea".',
    etymologyOrContext: 'From Greek Okeanos, the Titan river encircling the world.',
    defaultIsCryptic: true,
  },
  {
    answer: 'GLACIER',
    easyClue: 'Huge, slow-moving mass of compacted snow and ice in mountains or poles',
    mediumClue: 'Frozen bulldozer that carves U-shaped valleys over millennia',
    hardClue: 'River of ice garlic with e mixed in (7)',
    crypticBreakdown: 'Anagram ("mixed in") of GARLIC + E -> GLACIER; definition: "River of ice".',
    etymologyOrContext: 'Stores roughly 69% of the world’s freshwater.',
    defaultIsCryptic: true,
  },
  {
    answer: 'ESTUARY',
    easyClue: 'Wide tidal mouth of a large river where fresh water mixes with sea water',
    mediumClue: 'Brackish meeting place where river currents greet ocean tides',
    hardClue: 'Tidal mouth where a surety is renegotiated (7)',
    crypticBreakdown: 'Anagram ("is renegotiated") of A SURETY -> ESTUARY; definition: "Tidal mouth".',
    etymologyOrContext: 'From Latin aestuarium ("tidal marsh, mudflat").',
    defaultIsCryptic: true,
  },
  {
    answer: 'SAVANNA',
    easyClue: 'Grassy tropical plain with scattered drought-resistant trees',
    mediumClue: 'Serengeti landscape of golden grass and umbrella acacias',
    hardClue: 'Tropical grassland vans and a van truncated (7)',
    crypticBreakdown: 'Wordplay on SAVAN + NA; definition: "Tropical grassland".',
    etymologyOrContext: 'Covers roughly 20% of the Earth’s land area.',
    defaultIsCryptic: false,
  },
  {
    answer: 'MONSOON',
    easyClue: 'Seasonal wind in South Asia bringing heavy summer rains',
    mediumClue: 'Weather reversal that turns parched plains into lush green',
    hardClue: 'Rainy season soon follows French my (7)',
    crypticBreakdown: 'Charade of MON ("French my") + SOON -> MONSOON; definition: "Rainy season".',
    etymologyOrContext: 'From Arabic mawsim ("season").',
    defaultIsCryptic: true,
  },
  {
    answer: 'ECOLOGY',
    easyClue: 'Scientific study of how living things interact with their environment',
    mediumClue: 'Nature’s household economics of food webs and habitats',
    hardClue: 'Environmental study cool guy drops u for e (7)',
    crypticBreakdown: 'Anagram of COOL GY + E -> ECOLOGY; definition: "Environmental study".',
    etymologyOrContext: 'Coined by German zoologist Ernst Haeckel in 1866.',
    defaultIsCryptic: false,
  },
  {
    answer: 'HABITAT',
    easyClue: 'The natural home or environment of a plant or animal',
    mediumClue: 'Home address in the wild for a species',
    hardClue: 'Natural home where a bit sits in hat (7)',
    crypticBreakdown: 'Insertion of A BIT inside HAT -> HABITAT; definition: "Natural home".',
    etymologyOrContext: 'Latin for "it inhabits".',
    defaultIsCryptic: true,
  },
  {
    answer: 'SPECIES',
    easyClue: 'Group of similar living organisms able to interbreed in nature',
    mediumClue: 'Bottom rung on the biological ladder below genus',
    hardClue: 'Biological group pieces together after start of spring (7)',
    crypticBreakdown: 'S (start of spring) + PIECES rearranged -> SPECIES; definition: "Biological group".',
    etymologyOrContext: 'Latin for "kind" or "appearance".',
    defaultIsCryptic: true,
  },
  {
    answer: 'CANOPY',
    easyClue: 'High leafy roof formed by the tops of rainforest trees',
    mediumClue: 'Sunlit penthouse level of a dense woodland',
    hardClue: 'Forest roof pony gallops after can (6)',
    crypticBreakdown: 'CAN + OPY (pony without n) -> CANOPY; definition: "Forest roof".',
    etymologyOrContext: 'Hosts the majority of biodiversity in tropical rainforests.',
    defaultIsCryptic: false,
  },
  {
    answer: 'POLLEN',
    easyClue: 'Fine yellow powder produced by flowers and carried by bees',
    mediumClue: 'Floral gold dust that keeps honeybees busy and noses sneezing',
    hardClue: 'Flower dust found in open valley (6)',
    crypticBreakdown: 'POLL + EN -> POLLEN; definition: "Flower dust".',
    etymologyOrContext: 'Each grain contains male gametophytes of seed plants.',
    defaultIsCryptic: false,
  },
  {
    answer: 'NECTAR',
    easyClue: 'Sweet liquid inside flowers that attracts hummingbirds and bees',
    mediumClue: 'Raw ingredient for honey and the mythic drink of Olympus',
    hardClue: 'Sweet flower drink trance broken (6)',
    crypticBreakdown: 'Anagram ("broken") of TRANCE -> NECTAR; definition: "Sweet flower drink".',
    etymologyOrContext: 'In Greek mythology, the drink of the Olympian gods.',
    defaultIsCryptic: true,
  },
  {
    answer: 'LICHEN',
    easyClue: 'Crusty or leafy growth on rocks and bark formed by fungus and algae',
    mediumClue: 'Two organisms living as one on a mossy boulder',
    hardClue: 'Moss-like growth niche around left (6)',
    crypticBreakdown: 'L (left) + NICHE rearranged -> LICHEN; definition: "Moss-like growth".',
    etymologyOrContext: 'Classic textbook example of mutualistic symbiosis.',
    defaultIsCryptic: true,
  },
  {
    answer: 'TUNDRA',
    easyClue: 'Treeless Arctic plain with permanently frozen subsoil',
    mediumClue: 'Far-north landscape where permafrost stops deep roots',
    hardClue: 'Frozen plain turn ad around (6)',
    crypticBreakdown: 'Anagram of TURN AD -> TUNDRA; definition: "Frozen plain".',
    etymologyOrContext: 'From Kildin Sami tundar, meaning "uplands" or "treeless mountain tract".',
    defaultIsCryptic: true,
  },
  {
    answer: 'MEADOW',
    easyClue: 'Open field of grass and wildflowers',
    mediumClue: 'Pastoral expanse buzzing with butterflies in June',
    hardClue: 'Grassy field made ow! when stepped on (6)',
    crypticBreakdown: 'Anagram of MADE + OW -> MEADOW; definition: "Grassy field".',
    etymologyOrContext: 'Crucial habitat for pollinators and ground-nesting birds.',
    defaultIsCryptic: true,
  },
  {
    answer: 'SONNET',
    easyClue: 'Poem of exactly fourteen lines with a formal rhyme scheme',
    mediumClue: 'Poetic form Shakespeare penned 154 times',
    hardClue: 'Fourteen-line poem tenons joints together (6)',
    crypticBreakdown: 'Anagram ("joints together") of TENONS -> SONNET; definition: "Fourteen-line poem".',
    etymologyOrContext: 'From Italian sonetto ("little song"), mastered by Petrarch and Shakespeare.',
    defaultIsCryptic: true,
  },
  {
    answer: 'STANZA',
    easyClue: 'Grouped set of lines in a poem separated by a space',
    mediumClue: 'Poetic paragraph whose Italian name means "room"',
    hardClue: 'Verse division Santa’s zany start (6)',
    crypticBreakdown: 'Anagram of SANTA + Z -> STANZA; definition: "Verse division".',
    etymologyOrContext: 'Italian for "stopping place" or "room".',
    defaultIsCryptic: false,
  },
  {
    answer: 'BALLAD',
    easyClue: 'Slow, sentimental song or poem that tells a dramatic story',
    mediumClue: 'Storytelling folk verse meant to be sung aloud',
    hardClue: 'Narrative song all bad in rehearsal (6)',
    crypticBreakdown: 'Anagram ("in rehearsal") of ALL BAD -> BALLAD; definition: "Narrative song".',
    etymologyOrContext: 'Derived from medieval French chanson balladee ("dancing song").',
    defaultIsCryptic: true,
  },
  {
    answer: 'SATIRE',
    easyClue: 'Writing that uses humor and exaggeration to criticize foolishness',
    mediumClue: 'Sharp-witted literary mirror held up to society’s vices',
    hardClue: 'Witty critique irates the establishment (6)',
    crypticBreakdown: 'Anagram ("the establishment") of IRATES -> SATIRE; definition: "Witty critique".',
    etymologyOrContext: 'Practiced by Juvenal, Horace, Jonathan Swift, and Voltaire.',
    defaultIsCryptic: true,
  },
  {
    answer: 'MEMOIR',
    easyClue: 'Book in which an author writes about their own life memories',
    mediumClue: 'First-person look back at chapters of one’s own life',
    hardClue: 'Personal account mime or actor recalls (6)',
    crypticBreakdown: 'Anagram ("recalls") of MIME OR -> MEMOIR; definition: "Personal account".',
    etymologyOrContext: 'From French memoire ("memory" or "reminiscence").',
    defaultIsCryptic: true,
  },
  {
    answer: 'LEGEND',
    easyClue: 'Famous traditional story from the past, or the key on a map',
    mediumClue: 'King Arthur’s lore—or the box that explains map symbols',
    hardClue: 'Mythical tale glen surrounded by ed (6)',
    crypticBreakdown: 'Anagram of GLEN + ED -> LEGEND; definition: "Mythical tale".',
    etymologyOrContext: 'Also refers to the explanatory key on a map or chart.',
    defaultIsCryptic: false,
  },
  {
    answer: 'ORACLE',
    easyClue: 'Ancient priestess or shrine consulted for prophecies of the future',
    mediumClue: 'Delphi voice famous for riddles that always came true',
    hardClue: 'Prophet coaler recasts in temple (6)',
    crypticBreakdown: 'Anagram ("recasts") of COALER -> ORACLE; definition: "Prophet".',
    etymologyOrContext: 'The most famous in antiquity was the Pythia at Delphi.',
    defaultIsCryptic: true,
  },
  {
    answer: 'ENIGMA',
    easyClue: 'Something mysterious, puzzling, and hard to explain',
    mediumClue: 'Baffling riddle—or the cipher machine cracked at Bletchley Park',
    hardClue: 'Mystery gamine dances in the dark (6)',
    crypticBreakdown: 'Anagram ("dances") of GAMINE -> ENIGMA; definition: "Mystery".',
    etymologyOrContext: 'From Greek ainigma ("to speak in riddles").',
    defaultIsCryptic: true,
  },
  {
    answer: 'CYPHER',
    easyClue: 'Secret code used to disguise a written message',
    mediumClue: 'Cryptographic puzzle that turns plain text into secret symbols',
    hardClue: 'Secret code hype inside credit return (6)',
    crypticBreakdown: 'Insertion of YPHE inside C R -> CYPHER; definition: "Secret code".',
    etymologyOrContext: 'From Arabic sifr ("zero" or "empty").',
    defaultIsCryptic: false,
  },
  {
    answer: 'SCROLL',
    easyClue: 'Roll of parchment or papyrus used for writing in ancient times',
    mediumClue: 'Ancient rolled manuscript—or what your thumb does on a webpage',
    hardClue: 'Ancient manuscript rolls around century’s start (6)',
    crypticBreakdown: 'C (century’s start) inside ROLLS rearranged -> SCROLL; definition: "Ancient manuscript".',
    etymologyOrContext: 'Used extensively across ancient Egypt, Greece, Rome, and the Near East.',
    defaultIsCryptic: true,
  },
  {
    answer: 'SCRIBE',
    easyClue: 'Person who copied manuscripts by hand before printing was invented',
    mediumClue: 'Quill-and-ink professional of the ancient scriptorium',
    hardClue: 'Ancient writer bribes without b, adding sc (6)',
    crypticBreakdown: 'SC + RIBE -> SCRIBE; definition: "Ancient writer".',
    etymologyOrContext: 'From Latin scribere ("to write").',
    defaultIsCryptic: false,
  },
  {
    answer: 'ANNALS',
    easyClue: 'Historical records of events written down year by year',
    mediumClue: 'Year-by-year chronicles kept in the monastery library',
    hardClue: 'Chronicles where Anna’s losses end in l (6)',
    crypticBreakdown: 'ANNA + L + S -> ANNALS; definition: "Chronicles".',
    etymologyOrContext: 'From Latin libri annales ("yearly books").',
    defaultIsCryptic: false,
  },
  {
    answer: 'NOVEL',
    easyClue: 'Long book of fictional story and characters',
    mediumClue: 'Bookstore staple whose adjective meaning is "brand new"',
    hardClue: 'New book found in Clovelly (5)',
    crypticBreakdown: 'Hidden word ("found in") ClOVELly -> NOVEL; definition: "New book".',
    etymologyOrContext: 'From Italian novella ("new story").',
    defaultIsCryptic: false,
  },
  {
    answer: 'PROSE',
    easyClue: 'Ordinary written language in sentences and paragraphs, not poetry',
    mediumClue: 'Everyday writing style that doesn’t worry about rhyme or meter',
    hardClue: 'Ordinary writing pores over every letter (5)',
    crypticBreakdown: 'Anagram ("over every letter") of PORES -> PROSE; definition: "Ordinary writing".',
    etymologyOrContext: 'From Latin prosa oratio ("straightforward discourse").',
    defaultIsCryptic: true,
  },
  {
    answer: 'VERSE',
    easyClue: 'Writing arranged with rhythm and often rhyme; poetry',
    mediumClue: 'What comes between the chorus in a song or a chapter in scripture',
    hardClue: 'Poetic lines serve up a twist (5)',
    crypticBreakdown: 'Anagram ("up a twist") of SERVE -> VERSE; definition: "Poetic lines".',
    etymologyOrContext: 'From Latin versus ("a turn of the plow, a line of writing").',
    defaultIsCryptic: true,
  },
  {
    answer: 'DRAMA',
    easyClue: 'Serious play written for performance in a theater',
    mediumClue: 'Stage genre represented by the weeping theatrical mask',
    hardClue: 'Stage play mar a d backwards (5)',
    crypticBreakdown: 'Reversal of A MARD -> DRAMA; definition: "Stage play".',
    etymologyOrContext: 'From Greek drama ("action, deed").',
    defaultIsCryptic: false,
  },
  {
    answer: 'FABLE',
    easyClue: 'Short story with talking animals that teaches a moral lesson',
    mediumClue: 'Aesop’s specialty featuring tortoises, hares, and sour grapes',
    hardClue: 'Moral tale flab with e rearranged (5)',
    crypticBreakdown: 'Anagram ("rearranged") of FLAB + E -> FABLE; definition: "Moral tale".',
    etymologyOrContext: 'Associated globally with Aesop in ancient Greece.',
    defaultIsCryptic: false,
  },
  {
    answer: 'ELEGY',
    easyClue: 'Reflective poem written to mourn someone who has died',
    mediumClue: 'Poetic tribute of sorrow and remembrance',
    hardClue: 'Mournful poem glee mixed with y (5)',
    crypticBreakdown: 'Anagram ("mixed") of GLEE + Y -> ELEGY; definition: "Mournful poem".',
    etymologyOrContext: 'Notable examples include Thomas Gray’s "Elegy Written in a Country Churchyard".',
    defaultIsCryptic: true,
  },
  {
    answer: 'INDEX',
    easyClue: 'Alphabetical list of topics and page numbers at the back of a book',
    mediumClue: 'Back-of-the-book pointer that shares its name with your pointing finger',
    hardClue: 'Pointer nixes d inside (5)',
    crypticBreakdown: 'Anagram of NIXED -> INDEX; definition: "Pointer".',
    etymologyOrContext: 'Latin for "forefinger, pointer, or sign".',
    defaultIsCryptic: true,
  },
  {
    answer: 'CANON',
    easyClue: 'Collection of literary works considered the most important of an era',
    mediumClue: 'Accepted classics list—or Pachelbel’s famous overlapping melody',
    hardClue: 'Accepted rule can go on without g, o (5)',
    crypticBreakdown: 'CAN + ON -> CANON; definition: "Accepted rule".',
    etymologyOrContext: 'Also a contrapuntal musical composition employing melody imitations.',
    defaultIsCryptic: false,
  },
  {
    answer: 'TROPE',
    easyClue: 'Commonly recurring literary theme, device, or figure of speech',
    mediumClue: 'Storytelling convention like "the chosen one" or "enemies to lovers"',
    hardClue: 'Literary motif repot backwards! (5)',
    crypticBreakdown: 'Anagram ("backwards") of REPOT -> TROPE; definition: "Literary motif".',
    etymologyOrContext: 'From Greek tropos ("turn, direction, way").',
    defaultIsCryptic: true,
  },
  {
    answer: 'IRONY',
    easyClue: 'Saying the opposite of what you mean for humorous or sharp effect',
    mediumClue: 'When a fire station burns down or rain falls on your wedding day',
    hardClue: 'Wry twist in metallic taste (5)',
    crypticBreakdown: 'Double definition: "Wry twist" and "metallic (iron-y) taste" -> IRONY.',
    etymologyOrContext: 'From Greek eironeia ("feigned ignorance").',
    defaultIsCryptic: true,
  },
  {
    answer: 'COMPASS',
    easyClue: 'Dial with a magnetic needle that always points north',
    mediumClue: 'Pocket instrument that never loses its bearings',
    hardClue: 'Navigator’s guide pass com around (7)',
    crypticBreakdown: 'COM + PASS -> COMPASS; definition: "Navigator’s guide".',
    etymologyOrContext: 'First used for navigation during the Song Dynasty in China.',
    defaultIsCryptic: false,
  },
  {
    answer: 'SEXTANT',
    easyClue: 'Brass instrument used by sailors to measure the angle of the sun and stars',
    mediumClue: 'Sixty-degree arc tool for finding latitude on the high seas',
    hardClue: 'Navigator’s tool text ans rewritten (7)',
    crypticBreakdown: 'Anagram ("rewritten") of TEXT ANS -> SEXTANT; definition: "Navigator’s tool".',
    etymologyOrContext: 'Arc spans 60 degrees, or one-sixth of a full circle.',
    defaultIsCryptic: true,
  },
  {
    answer: 'MARINER',
    easyClue: 'Sailor or seafarer who navigates the ocean',
    mediumClue: 'Coleridge’s ancient storyteller with an albatross problem',
    hardClue: 'Sailor airmen recruited with r (7)',
    crypticBreakdown: 'Anagram ("recruited") of AIRMEN + R -> MARINER; definition: "Sailor".',
    etymologyOrContext: 'Immortalized in Samuel Taylor Coleridge’s "The Rime of the Ancient Mariner".',
    defaultIsCryptic: true,
  },
  {
    answer: 'GALLEON',
    easyClue: 'Large multi-decked wooden sailing ship of the 16th and 17th centuries',
    mediumClue: 'Square-rigged treasure ship of the Spanish Main',
    hardClue: 'Treasure ship all gone adrift (7)',
    crypticBreakdown: 'Anagram ("adrift") of ALL GONE -> GALLEON; definition: "Treasure ship".',
    etymologyOrContext: 'Evolved from the carrack and served as both warship and cargo vessel.',
    defaultIsCryptic: true,
  },
  {
    answer: 'HARBOR',
    easyClue: 'Sheltered coastal port where ships dock safely out of the waves',
    mediumClue: 'Safe port in a storm—or to secretly hold a thought',
    hardClue: 'Safe port arbor behind hotel (6)',
    crypticBreakdown: 'H (hotel) + ARBOR -> HARBOR; definition: "Safe port".',
    etymologyOrContext: 'Can be natural (land-sheltered) or artificial (built with breakwaters).',
    defaultIsCryptic: true,
  },
  {
    answer: 'ANCHOR',
    easyClue: 'Heavy hooked iron weight dropped on a chain to hold a ship in place',
    mediumClue: 'Seabed grip for a captain, or the lead broadcaster on the evening news',
    hardClue: 'Secure mooring rancho rebuilt (6)',
    crypticBreakdown: 'Anagram ("rebuilt") of RANCHO -> ANCHOR; definition: "Secure mooring".',
    etymologyOrContext: 'From Greek ankyra.',
    defaultIsCryptic: true,
  },
  {
    answer: 'BEACON',
    easyClue: 'Bright warning light or signal fire on a hill or coast',
    mediumClue: 'Lighthouse beam that tells captains where the rocks are',
    hardClue: 'Guiding light bacon cooked with e (6)',
    crypticBreakdown: 'Anagram ("cooked") of BACON + E -> BEACON; definition: "Guiding light".',
    etymologyOrContext: 'Includes lighthouses, radio beacons, and radar transponders.',
    defaultIsCryptic: true,
  },
  {
    answer: 'VOYAGE',
    easyClue: 'Long journey across the ocean or through outer space',
    mediumClue: 'Epic expedition preceded by "bon" at the dock',
    hardClue: 'Sea journey gave yo in return (6)',
    crypticBreakdown: 'Anagram of GAVE YO -> VOYAGE; definition: "Sea journey".',
    etymologyOrContext: 'From Latin viaticum ("provisions for a journey").',
    defaultIsCryptic: false,
  },
  {
    answer: 'ISLAND',
    easyClue: 'Piece of land completely surrounded by water',
    mediumClue: 'What John Donne famously said no man is',
    hardClue: 'Piece of land is land indeed! (6)',
    crypticBreakdown: 'Charade of IS + LAND -> ISLAND; definition: "Piece of land".',
    etymologyOrContext: 'Greenland is the world’s largest non-continental island.',
    defaultIsCryptic: true,
  },
  {
    answer: 'STRAIT',
    easyClue: 'Narrow channel of sea connecting two larger bodies of water',
    mediumClue: 'Waterway bottleneck like Gibraltar, Hormuz, or Magellan',
    hardClue: 'Narrow channel artist painted anew (6)',
    crypticBreakdown: 'Anagram ("painted anew") of ARTIST -> STRAIT; definition: "Narrow channel".',
    etymologyOrContext: 'Examples include the Strait of Gibraltar and the Bering Strait.',
    defaultIsCryptic: true,
  },
  {
    answer: 'LAGOON',
    easyClue: 'Calm, shallow bay separated from the open sea by a coral reef or sandbar',
    mediumClue: 'Turquoise tropical pool sheltered behind an atoll ring',
    hardClue: 'Shallow bay go on after la (6)',
    crypticBreakdown: 'Charade of LA + GO ON -> LAGOON; definition: "Shallow bay".',
    etymologyOrContext: 'From Italian laguna, originally referring to the Lagoon of Venice.',
    defaultIsCryptic: true,
  },
  {
    answer: 'VESSEL',
    easyClue: 'Large boat or ship, or a hollow pitcher for holding liquids',
    mediumClue: 'Word that applies equally to a tall ship, a wine goblet, or a vein',
    hardClue: 'Craft elves’s spun around (6)',
    crypticBreakdown: 'Anagram ("spun around") of ELVES S -> VESSEL; definition: "Craft".',
    etymologyOrContext: 'From Late Latin vascellum ("small vase or urn").',
    defaultIsCryptic: false,
  },
  {
    answer: 'STERN',
    easyClue: 'Rear end of a ship or boat',
    mediumClue: 'Strict and unsmiling—or the aft end opposite the bow',
    hardClue: 'Strict rear of a vessel (5)',
    crypticBreakdown: 'Double definition: "Strict" and "rear of a vessel" -> STERN.',
    etymologyOrContext: 'Opposite of the bow (prow).',
    defaultIsCryptic: true,
  },
  {
    answer: 'CHART',
    easyClue: 'Detailed map of the sea used by ship navigators',
    mediumClue: 'Captain’s map of depths and reefs—or a hit parade ranking',
    hardClue: 'Navigator’s map march art without ma (5)',
    crypticBreakdown: 'CH + ART -> CHART; definition: "Navigator’s map".',
    etymologyOrContext: 'Shows water depths, hazards, and aids to navigation.',
    defaultIsCryptic: false,
  },
  {
    answer: 'SHOAL',
    easyClue: 'Shallow sandbank hidden just beneath the water’s surface',
    mediumClue: 'Submerged sandbar hazard—or a shimmering crowd of fish',
    hardClue: 'Shallow sandbank halos rearranged (5)',
    crypticBreakdown: 'Anagram ("rearranged") of HALOS -> SHOAL; definition: "Shallow sandbank".',
    etymologyOrContext: 'Also refers to a large group of fish swimming together.',
    defaultIsCryptic: true,
  },
  {
    answer: 'FLEET',
    easyClue: 'Group of naval ships sailing together under one command',
    mediumClue: 'Swift-footed adjective that also names an entire armada',
    hardClue: 'Fast naval squadron (5)',
    crypticBreakdown: 'Double definition: "Fast" and "naval squadron" -> FLEET.',
    etymologyOrContext: 'From Old English fleot ("ship, raft, estuary").',
    defaultIsCryptic: true,
  },
  {
    answer: 'HAVEN',
    easyClue: 'Protected inlet for boats; any peaceful place of safety',
    mediumClue: 'Cozy refuge that sits halfway between New and Connecticut’s coast',
    hardClue: 'Safe harbor have north at the end (5)',
    crypticBreakdown: 'HAVE + N (north) -> HAVEN; definition: "Safe harbor".',
    etymologyOrContext: 'Preserved in port names such as New Haven and Milford Haven.',
    defaultIsCryptic: true,
  },
  {
    answer: 'INLET',
    easyClue: 'Narrow arm of water reaching inland from a coast or lake',
    mediumClue: 'Small coastal cove that lets the tide in',
    hardClue: 'Coastal cove lent i out (5)',
    crypticBreakdown: 'Anagram ("out") of LENT I -> INLET; definition: "Coastal cove".',
    etymologyOrContext: 'Connects an enclosed body of water with the open sea.',
    defaultIsCryptic: true,
  },
  {
    answer: 'ATOLL',
    easyClue: 'Ring-shaped coral island enclosing a central lagoon',
    mediumClue: 'Circular reef necklace floating in the Pacific',
    hardClue: 'Coral ring takes a toll on sailors (5)',
    crypticBreakdown: 'Charade ("takes") of A + TOLL -> ATOLL; definition: "Coral ring".',
    etymologyOrContext: 'Word comes from the Dhivehi language of the Maldives (atholhu).',
    defaultIsCryptic: true,
  },
  {
    answer: 'TRADE',
    easyClue: 'Buying and selling of goods, or steady tropical ocean winds',
    mediumClue: 'Swap collectibles—or catch the steady winds across the tropics',
    hardClue: 'Commerce rated highly in overhaul (5)',
    crypticBreakdown: 'Anagram ("in overhaul") of RATED -> TRADE; definition: "Commerce".',
    etymologyOrContext: 'Trade winds enabled historic transoceanic sailing routes.',
    defaultIsCryptic: true,
  },
  {
    answer: 'NORTH',
    easyClue: 'Direction toward the Arctic Pole at the top of a standard map',
    mediumClue: 'Polaris’s direction where compass needles love to point',
    hardClue: 'Cardinal point thorn twisted (5)',
    crypticBreakdown: 'Anagram ("twisted") of THORN -> NORTH; definition: "Cardinal point".',
    etymologyOrContext: 'Oriented toward the star Polaris in the Northern Hemisphere.',
    defaultIsCryptic: true,
  },
  {
    answer: 'SOUTH',
    easyClue: 'Direction opposite north, toward Antarctica',
    mediumClue: 'Where migratory birds head when autumn frost arrives',
    hardClue: 'Cardinal direction shout wildly (5)',
    crypticBreakdown: 'Anagram ("wildly") of SHOUT -> SOUTH; definition: "Cardinal direction".',
    etymologyOrContext: 'Marked in the southern sky by the Crux (Southern Cross) constellation.',
    defaultIsCryptic: true,
  },
];

const UNIVERSAL_BRIDGE_WORDS: WordEntrySeed[] = RAW_LEXICON.map((item) => ({
  ...item,
  standardClue: item.easyClue,
  crypticClue: item.hardClue,
}));

const wordMap = new Map<string, WordEntrySeed>();
for (const entry of UNIVERSAL_BRIDGE_WORDS) {
  wordMap.set(entry.answer, entry);
}

// Expanded Weekend Themes covering Film, Television, Science Fiction, Music, Culinary, Mythology, Astronomy, Ecology, Literature & Navigation
export interface WeekendThemeBank {
  id: string;
  themeName: string;
  titleSuffix: string;
  visual: VisualThemeId;
  priorityAnswers: string[];
}

export const WEEKEND_THEME_BANKS: WeekendThemeBank[] = [
  {
    id: 'weekend-film-cinema',
    themeName: 'Film, Cinema & The Silver Screen',
    titleSuffix: 'Premiere Night & Auteurs',
    visual: 'editorial',
    priorityAnswers: [
      'DIRECTOR',
      'PREMIERE',
      'THRILLER',
      'MATINEE',
      'MONTAGE',
      'CINEMA',
      'CAMERA',
      'SEQUEL',
      'SCRIPT',
      'STUDIO',
      'AUTEUR',
      'OSCAR',
      'ACTOR',
      'SCENE',
      'DRAMA',
      'OPERA',
      'ARENA',
      'STARSHIP',
      'LEGEND',
      'SATIRE',
    ],
  },
  {
    id: 'weekend-television-broadcast',
    themeName: 'Television, Broadcast & Streaming',
    titleSuffix: 'Prime Time & Season Finales',
    visual: 'observatory',
    priorityAnswers: [
      'EPISODE',
      'NETWORK',
      'CHANNEL',
      'SITCOM',
      'FINALE',
      'SERIES',
      'STREAM',
      'REMOTE',
      'SERIAL',
      'AERIAL',
      'ANCHOR',
      'PILOT',
      'DRAMA',
      'SCRIPT',
      'STUDIO',
      'CAMERA',
      'ACTOR',
      'SCENE',
      'SATIRE',
    ],
  },
  {
    id: 'weekend-science-fiction',
    themeName: 'Science Fiction & Futurism',
    titleSuffix: 'Starships, Androids & Portals',
    visual: 'observatory',
    priorityAnswers: [
      'STARSHIP',
      'DYSTOPIA',
      'ANDROID',
      'ORBITAL',
      'ECLIPSE',
      'CYBORG',
      'GALAXY',
      'PORTAL',
      'PHASER',
      'MUTANT',
      'COSMOS',
      'VORTEX',
      'NEBULA',
      'QUASAR',
      'PULSAR',
      'ALIEN',
      'ROBOT',
      'CLONE',
      'LASER',
      'TITAN',
      'LUNAR',
      'SOLAR',
    ],
  },
  {
    id: 'weekend-music-symphony',
    themeName: 'Popular Music, Stage & Symphony',
    titleSuffix: 'Encores, Melodies & Concert Halls',
    visual: 'mahogany',
    priorityAnswers: [
      'SYMPHONY',
      'MELODY',
      'CHORUS',
      'ENCORE',
      'SONATA',
      'BALLAD',
      'TEMPO',
      'OPERA',
      'SCALE',
      'ARENA',
      'VERSE',
      'CANON',
      'SONNET',
      'STANZA',
      'DRAMA',
      'SCENE',
      'ACTOR',
      'STUDIO',
    ],
  },
  {
    id: 'weekend-culinary-gastronomy',
    themeName: 'Culinary Arts & World Gastronomy',
    titleSuffix: 'Saffron, Truffles & Bistros',
    visual: 'botanical',
    priorityAnswers: [
      'SAFFRON',
      'TRUFFLE',
      'BISTRO',
      'RECIPE',
      'PALATE',
      'NECTAR',
      'AROMA',
      'FEAST',
      'FLORA',
      'GROVE',
      'MAPLE',
      'LOTUS',
      'PETAL',
      'SPORE',
      'CORAL',
      'OASIS',
      'TRADE',
    ],
  },
  {
    id: 'weekend-astronomy-space',
    themeName: 'Astronomy & Deep Space',
    titleSuffix: 'Celestial Cartography',
    visual: 'observatory',
    priorityAnswers: [
      'CONSTELLATION',
      'OBSERVATORY',
      'ASTRONOMER',
      'METEORITE',
      'TELESCOPE',
      'PARALLAX',
      'SOLSTICE',
      'SPECTRUM',
      'EQUINOX',
      'ECLIPSE',
      'ORBITAL',
      'RADIANT',
      'HORIZON',
      'NEBULA',
      'ZENITH',
      'APOGEE',
      'QUASAR',
      'PULSAR',
      'CORONA',
      'ALBEDO',
      'AURORA',
      'COSMOS',
      'VORTEX',
      'COMET',
      'UMBRA',
      'NADIR',
      'TITAN',
      'ORION',
      'ATLAS',
    ],
  },
  {
    id: 'weekend-ecology-nature',
    themeName: 'Ecology & Natural Wonders',
    titleSuffix: 'The Living Biosphere',
    visual: 'botanical',
    priorityAnswers: [
      'GLACIER',
      'ESTUARY',
      'SAVANNA',
      'MONSOON',
      'ECOLOGY',
      'HABITAT',
      'SPECIES',
      'CANOPY',
      'POLLEN',
      'NECTAR',
      'LICHEN',
      'TUNDRA',
      'MEADOW',
      'ISLAND',
      'LAGOON',
      'STRAIT',
      'DELTA',
      'FLORA',
      'CORAL',
      'SPORE',
      'PETAL',
      'BIOME',
      'GROVE',
      'CEDAR',
      'MAPLE',
      'ASPEN',
      'LOTUS',
      'ALGAE',
      'OASIS',
      'RIVER',
      'OCEAN',
    ],
  },
  {
    id: 'weekend-literature-myth',
    themeName: 'Literature, Mythology & Antiquity',
    titleSuffix: 'Oracles, Scrolls & Belles-Lettres',
    visual: 'editorial',
    priorityAnswers: [
      'SONNET',
      'STANZA',
      'BALLAD',
      'SATIRE',
      'MEMOIR',
      'LEGEND',
      'ORACLE',
      'ENIGMA',
      'CYPHER',
      'SCROLL',
      'SCRIBE',
      'ANNALS',
      'NOVEL',
      'PROSE',
      'VERSE',
      'DRAMA',
      'FABLE',
      'ELEGY',
      'INDEX',
      'CANON',
      'TROPE',
      'IRONY',
      'OPERA',
      'REALM',
      'ARENA',
    ],
  },
  {
    id: 'weekend-maritime-navigation',
    themeName: 'Navigation & High Seas',
    titleSuffix: 'Galleons, Sextants & Compasses',
    visual: 'mahogany',
    priorityAnswers: [
      'COMPASS',
      'SEXTANT',
      'MARINER',
      'GALLEON',
      'HORIZON',
      'ESTUARY',
      'HARBOR',
      'ANCHOR',
      'BEACON',
      'VOYAGE',
      'ISLAND',
      'STRAIT',
      'LAGOON',
      'VESSEL',
      'STERN',
      'CHART',
      'SHOAL',
      'FLEET',
      'HAVEN',
      'INLET',
      'ATOLL',
      'TRADE',
      'NORTH',
      'SOUTH',
      'OCEAN',
      'RIVER',
    ],
  },
];

interface InternalPlacedWord {
  seed: WordEntrySeed;
  row: number;
  col: number;
  direction: Direction;
}

function canPlaceWordOnGrid(
  letters: (string | null)[][],
  hOccupied: boolean[][],
  vOccupied: boolean[][],
  word: string,
  row: number,
  col: number,
  direction: Direction,
  requireIntersection: boolean,
  gridSize: GridSizeOption
): { valid: boolean; intersections: number } {
  const len = word.length;
  if (direction === 'across') {
    if (row < 0 || row >= gridSize || col < 0 || col + len > gridSize) {
      return { valid: false, intersections: 0 };
    }
    if (col > 0 && letters[row][col - 1] !== null) {
      return { valid: false, intersections: 0 };
    }
    if (col + len < gridSize && letters[row][col + len] !== null) {
      return { valid: false, intersections: 0 };
    }

    let intersections = 0;
    for (let i = 0; i < len; i++) {
      const r = row;
      const c = col + i;
      const ch = word[i];
      if (hOccupied[r][c]) {
        return { valid: false, intersections: 0 };
      }
      const existing = letters[r][c];
      if (existing !== null) {
        if (existing !== ch) {
          return { valid: false, intersections: 0 };
        }
        intersections++;
      } else {
        if (r > 0 && letters[r - 1][c] !== null) {
          return { valid: false, intersections: 0 };
        }
        if (r + 1 < gridSize && letters[r + 1][c] !== null) {
          return { valid: false, intersections: 0 };
        }
      }
    }
    if (requireIntersection && intersections === 0) {
      return { valid: false, intersections: 0 };
    }
    return { valid: true, intersections };
  } else {
    if (col < 0 || col >= gridSize || row < 0 || row + len > gridSize) {
      return { valid: false, intersections: 0 };
    }
    if (row > 0 && letters[row - 1][col] !== null) {
      return { valid: false, intersections: 0 };
    }
    if (row + len < gridSize && letters[row + len][col] !== null) {
      return { valid: false, intersections: 0 };
    }

    let intersections = 0;
    for (let i = 0; i < len; i++) {
      const r = row + i;
      const c = col;
      const ch = word[i];
      if (vOccupied[r][c]) {
        return { valid: false, intersections: 0 };
      }
      const existing = letters[r][c];
      if (existing !== null) {
        if (existing !== ch) {
          return { valid: false, intersections: 0 };
        }
        intersections++;
      } else {
        if (c > 0 && letters[r][c - 1] !== null) {
          return { valid: false, intersections: 0 };
        }
        if (c + 1 < gridSize && letters[r][c + 1] !== null) {
          return { valid: false, intersections: 0 };
        }
      }
    }
    if (requireIntersection && intersections === 0) {
      return { valid: false, intersections: 0 };
    }
    return { valid: true, intersections };
  }
}

export function compilePuzzleGrid(
  id: string,
  title: string,
  themeName: string,
  editionType: EditionScheduleType,
  gridSize: GridSizeOption,
  dayOfWeekName: string,
  subtitle: string,
  editionDate: string,
  archiveDate: string,
  recommendedVisualTheme: VisualThemeId,
  orderedCandidatePool: WordEntrySeed[]
): PuzzleDefinition {
  const filteredPool = orderedCandidatePool.filter(
    (w) => w.answer.length >= 3 && w.answer.length <= gridSize
  );

  const letters: (string | null)[][] = Array.from({ length: gridSize }, () =>
    Array.from({ length: gridSize }, () => null)
  );
  const hOccupied: boolean[][] = Array.from({ length: gridSize }, () =>
    Array.from({ length: gridSize }, () => false)
  );
  const vOccupied: boolean[][] = Array.from({ length: gridSize }, () =>
    Array.from({ length: gridSize }, () => false)
  );

  const placedWords: InternalPlacedWord[] = [];
  const usedAnswers = new Set<string>();

  const commitWord = (
    seed: WordEntrySeed,
    row: number,
    col: number,
    direction: Direction
  ) => {
    const word = seed.answer;
    for (let i = 0; i < word.length; i++) {
      const r = direction === 'across' ? row : row + i;
      const c = direction === 'across' ? col + i : col;
      letters[r][c] = word[i];
      if (direction === 'across') {
        hOccupied[r][c] = true;
      } else {
        vOccupied[r][c] = true;
      }
    }
    placedWords.push({ seed, row, col, direction });
    usedAnswers.add(word);
  };

  const firstSeed =
    filteredPool.find((w) =>
      gridSize === 8
        ? w.answer.length >= 5 && w.answer.length <= 7
        : w.answer.length >= 6
    ) || filteredPool[0];

  const startRow = gridSize === 8 ? 3 : 9;
  const startCol = Math.max(
    0,
    Math.floor((gridSize - firstSeed.answer.length) / 2)
  );
  commitWord(firstSeed, startRow, startCol, 'across');

  const maxTargetWords = gridSize === 8 ? 14 : 38;
  const maxPasses = 8;

  for (let pass = 0; pass < maxPasses; pass++) {
    let placedInPass = false;

    for (const candidate of filteredPool) {
      if (usedAnswers.has(candidate.answer)) continue;
      if (placedWords.length >= maxTargetWords) break;

      let bestPlacement: {
        row: number;
        col: number;
        direction: Direction;
        score: number;
      } | null = null;

      const acrossCount = placedWords.filter(
        (w) => w.direction === 'across'
      ).length;
      const downCount = placedWords.filter((w) => w.direction === 'down').length;
      const preferredDirection: Direction =
        acrossCount <= downCount ? 'across' : 'down';

      const directions: Direction[] =
        preferredDirection === 'across'
          ? ['across', 'down']
          : ['down', 'across'];

      for (const dir of directions) {
        for (let r = 0; r < gridSize; r++) {
          for (let c = 0; c < gridSize; c++) {
            const check = canPlaceWordOnGrid(
              letters,
              hOccupied,
              vOccupied,
              candidate.answer,
              r,
              c,
              dir,
              true,
              gridSize
            );
            if (!check.valid) continue;

            const endR =
              dir === 'down' ? r + candidate.answer.length - 1 : r;
            const endC =
              dir === 'across' ? c + candidate.answer.length - 1 : c;

            let edgeBonus = 0;
            if (r === 0 || endR === gridSize - 1) edgeBonus += 14;
            if (c === 0 || endC === gridSize - 1) edgeBonus += 14;
            if (r <= 1 || endR >= gridSize - 2) edgeBonus += 6;
            if (c <= 1 || endC >= gridSize - 2) edgeBonus += 6;

            const dirBonus = dir === preferredDirection ? 8 : 0;
            const score =
              check.intersections * 35 +
              candidate.answer.length * 2 +
              edgeBonus +
              dirBonus;

            if (!bestPlacement || score > bestPlacement.score) {
              bestPlacement = { row: r, col: c, direction: dir, score };
            }
          }
        }
      }

      if (bestPlacement) {
        commitWord(
          candidate,
          bestPlacement.row,
          bestPlacement.col,
          bestPlacement.direction
        );
        placedInPass = true;
      }
    }

    if (!placedInPass) break;
  }

  const grid: GridCellData[][] = Array.from({ length: gridSize }, (_, r) =>
    Array.from({ length: gridSize }, (__, c) => ({
      row: r,
      col: c,
      isBlocked: letters[r][c] === null,
      solution: letters[r][c] ?? '',
    }))
  );

  const acrossByStart = new Map<string, InternalPlacedWord>();
  const downByStart = new Map<string, InternalPlacedWord>();
  for (const pw of placedWords) {
    const key = `${pw.row},${pw.col}`;
    if (pw.direction === 'across') {
      acrossByStart.set(key, pw);
    } else {
      downByStart.set(key, pw);
    }
  }

  const acrossClues: PlacedClue[] = [];
  const downClues: PlacedClue[] = [];
  let clueCounter = 1;
  let totalWhiteCells = 0;

  for (let r = 0; r < gridSize; r++) {
    for (let c = 0; c < gridSize; c++) {
      if (!grid[r][c].isBlocked) {
        totalWhiteCells++;
      }
      const key = `${r},${c}`;
      const startsAcross = acrossByStart.get(key);
      const startsDown = downByStart.get(key);

      if (startsAcross || startsDown) {
        const num = clueCounter++;
        grid[r][c].number = num;

        if (startsAcross) {
          const clueId = `${num}-across`;
          acrossClues.push({
            id: clueId,
            number: num,
            direction: 'across',
            row: r,
            col: c,
            answer: startsAcross.seed.answer,
            length: startsAcross.seed.answer.length,
            easyClue: startsAcross.seed.easyClue,
            mediumClue: startsAcross.seed.mediumClue,
            hardClue: startsAcross.seed.hardClue,
            standardClue: startsAcross.seed.standardClue,
            crypticClue: startsAcross.seed.crypticClue,
            crypticBreakdown: startsAcross.seed.crypticBreakdown,
            etymologyOrContext: startsAcross.seed.etymologyOrContext,
            isCrypticInMixed: startsAcross.seed.defaultIsCryptic,
          });
          for (let i = 0; i < startsAcross.seed.answer.length; i++) {
            grid[r][c + i].acrossClueId = clueId;
          }
        }

        if (startsDown) {
          const clueId = `${num}-down`;
          downClues.push({
            id: clueId,
            number: num,
            direction: 'down',
            row: r,
            col: c,
            answer: startsDown.seed.answer,
            length: startsDown.seed.answer.length,
            easyClue: startsDown.seed.easyClue,
            mediumClue: startsDown.seed.mediumClue,
            hardClue: startsDown.seed.hardClue,
            standardClue: startsDown.seed.standardClue,
            crypticClue: startsDown.seed.crypticClue,
            crypticBreakdown: startsDown.seed.crypticBreakdown,
            etymologyOrContext: startsDown.seed.etymologyOrContext,
            isCrypticInMixed: startsDown.seed.defaultIsCryptic,
          });
          for (let i = 0; i < startsDown.seed.answer.length; i++) {
            grid[r + i][c].downClueId = clueId;
          }
        }
      }
    }
  }

  return {
    id,
    title,
    themeName,
    editionType,
    gridSize,
    dayOfWeekName,
    subtitle,
    editionDate,
    archiveDate,
    recommendedVisualTheme,
    grid,
    clues: {
      across: acrossClues,
      down: downClues,
    },
    totalWhiteCells,
  };
}

export function compile20x20Puzzle(
  id: string,
  title: string,
  themeName: string,
  editionType: EditionScheduleType,
  dayOfWeekName: string,
  subtitle: string,
  editionDate: string,
  archiveDate: string,
  recommendedVisualTheme: VisualThemeId,
  orderedCandidatePool: WordEntrySeed[]
): PuzzleDefinition {
  return compilePuzzleGrid(
    id,
    title,
    themeName,
    editionType,
    20,
    dayOfWeekName,
    subtitle,
    editionDate,
    archiveDate,
    recommendedVisualTheme,
    orderedCandidatePool
  );
}

/**
 * Returns the current date & time components in London, UK ('Europe/London' timezone).
 * All new daily crosswords generate at 00:00 London, UK time.
 */
export function getLondonDateTimeParts(now: Date = new Date()): {
  isoDate: string;
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
  countdownToMidnight: string;
} {
  try {
    const formatter = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Europe/London',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });
    const parts = formatter.formatToParts(now);
    const getPart = (type: string) =>
      parts.find((p) => p.type === type)?.value || '00';

    const year = parseInt(getPart('year'), 10);
    const month = parseInt(getPart('month'), 10);
    const day = parseInt(getPart('day'), 10);
    const hour = parseInt(getPart('hour'), 10) % 24;
    const minute = parseInt(getPart('minute'), 10);
    const second = parseInt(getPart('second'), 10);

    const isoDate = `${year}-${String(month).padStart(2, '0')}-${String(
      day
    ).padStart(2, '0')}`;

    const elapsedSecondsToday = hour * 3600 + minute * 60 + second;
    const remainingSeconds = Math.max(0, 86400 - elapsedSecondsToday);
    const remH = Math.floor(remainingSeconds / 3600);
    const remM = Math.floor((remainingSeconds % 3600) / 60);
    const remS = remainingSeconds % 60;
    const countdownToMidnight = `${String(remH).padStart(2, '0')}:${String(
      remM
    ).padStart(2, '0')}:${String(remS).padStart(2, '0')}`;

    return {
      isoDate,
      year,
      month,
      day,
      hour,
      minute,
      second,
      countdownToMidnight,
    };
  } catch {
    const year = now.getUTCFullYear();
    const month = now.getUTCMonth() + 1;
    const day = now.getUTCDate();
    const hour = now.getUTCHours();
    const minute = now.getUTCMinutes();
    const second = now.getUTCSeconds();
    const isoDate = `${year}-${String(month).padStart(2, '0')}-${String(
      day
    ).padStart(2, '0')}`;
    return {
      isoDate,
      year,
      month,
      day,
      hour,
      minute,
      second,
      countdownToMidnight: '00:00:00',
    };
  }
}

export function getTodayIsoDate(): string {
  return getLondonDateTimeParts().isoDate;
}

/**
 * Generates a deterministic 20x20 Daily Crossword for any YYYY-MM-DD London date:
 * - Weekdays (Monday - Friday): General Knowledge Crosswords (eclectic mix, unthemed)
 * - Weekends (Saturday & Sunday): Special Themed Crosswords covering Film, TV, Sci-Fi, Music, Gastronomy, Astronomy, Ecology, Literature & Navigation.
 */
export function generateArchivePuzzleForDate(
  isoDate: string,
  forcedThemeBankId?: string
): PuzzleDefinition {
  const parsedDate = new Date(`${isoDate}T12:00:00Z`);
  const dayOfWeek = isNaN(parsedDate.getTime()) ? 4 : parsedDate.getUTCDay(); // 0 = Sun, 6 = Sat
  const isWeekend =
    Boolean(forcedThemeBankId) || dayOfWeek === 0 || dayOfWeek === 6;

  const dayOfWeekName = isNaN(parsedDate.getTime())
    ? 'Daily'
    : parsedDate.toLocaleDateString('en-GB', {
        weekday: 'long',
        timeZone: 'UTC',
      });

  const formattedDate = isNaN(parsedDate.getTime())
    ? isoDate
    : parsedDate.toLocaleDateString('en-GB', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        timeZone: 'UTC',
      });

  // Deterministic hash from YYYY-MM-DD
  let hash = 0;
  for (let i = 0; i < isoDate.length; i++) {
    hash = (hash * 31 + isoDate.charCodeAt(i)) >>> 0;
  }

  if (isWeekend) {
    // Select Weekend Theme Bank either by forcedThemeBankId or by sequential weekend index
    // Using epoch days ensures Saturday and Sunday of the same weekend get two different themes!
    const epochDays = isNaN(parsedDate.getTime())
      ? hash
      : Math.floor(parsedDate.getTime() / 86400000);
    const themeBank =
      (forcedThemeBankId
        ? WEEKEND_THEME_BANKS.find((b) => b.id === forcedThemeBankId)
        : undefined) ||
      WEEKEND_THEME_BANKS[Math.abs(epochDays) % WEEKEND_THEME_BANKS.length];

    const orderedSeeds: WordEntrySeed[] = [];
    const seen = new Set<string>();

    const priorityCopy = [...themeBank.priorityAnswers];
    let seed = (hash ^ epochDays) >>> 0 || 987654321;
    for (let i = priorityCopy.length - 1; i > 0; i--) {
      seed = (seed * 1664525 + 1013904223) >>> 0;
      const j = seed % (i + 1);
      const tmp = priorityCopy[i];
      priorityCopy[i] = priorityCopy[j];
      priorityCopy[j] = tmp;
    }

    for (const ans of priorityCopy) {
      const item = wordMap.get(ans);
      if (item && !seen.has(ans)) {
        orderedSeeds.push(item);
        seen.add(ans);
      }
    }
    for (const item of UNIVERSAL_BRIDGE_WORDS) {
      if (!seen.has(item.answer)) {
        orderedSeeds.push(item);
        seen.add(item.answer);
      }
    }

    const idSuffix = forcedThemeBankId ? `-${forcedThemeBankId}` : '';
    return compile20x20Puzzle(
      `daily-${isoDate}${idSuffix}`,
      `${dayOfWeekName} Weekend Special: ${themeBank.titleSuffix}`,
      themeBank.themeName,
      'weekend-themed',
      dayOfWeekName,
      'Weekend Themed 20×20 Edition',
      formattedDate,
      isoDate,
      themeBank.visual,
      orderedSeeds
    );
  } else {
    // Weekday General Knowledge Crossword (Monday - Friday)
    const pool = [...UNIVERSAL_BRIDGE_WORDS];
    let seed = hash || 123456789;
    for (let i = pool.length - 1; i > 0; i--) {
      seed = (seed * 1664525 + 1013904223) >>> 0;
      const j = seed % (i + 1);
      const temp = pool[i];
      pool[i] = pool[j];
      pool[j] = temp;
    }

    const weekdayPalettes: VisualThemeId[] = [
      'editorial',
      'observatory',
      'botanical',
      'mahogany',
    ];
    const visual = weekdayPalettes[hash % weekdayPalettes.length];

    return compile20x20Puzzle(
      `daily-${isoDate}`,
      `${dayOfWeekName} General Crossword`,
      'General Knowledge (Weekday Edition)',
      'weekday-general',
      dayOfWeekName,
      'Weekday General 20×20 Edition',
      formattedDate,
      isoDate,
      visual,
      pool
    );
  }
}

/**
 * Generates a deterministic Daily 8x8 Quick Crossword for any YYYY-MM-DD London date.
 */
export function generateQuick8x8PuzzleForDate(
  isoDate: string
): PuzzleDefinition {
  const parsedDate = new Date(`${isoDate}T12:00:00Z`);
  const dayOfWeekName = isNaN(parsedDate.getTime())
    ? 'Daily'
    : parsedDate.toLocaleDateString('en-GB', {
        weekday: 'long',
        timeZone: 'UTC',
      });

  const formattedDate = isNaN(parsedDate.getTime())
    ? isoDate
    : parsedDate.toLocaleDateString('en-GB', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        timeZone: 'UTC',
      });

  let hash = 777;
  for (let i = 0; i < isoDate.length; i++) {
    hash = (hash * 37 + isoDate.charCodeAt(i)) >>> 0;
  }

  // Filter to crisp 4-7 letter words ideal for an 8x8 Quick Crossword
  const pool = UNIVERSAL_BRIDGE_WORDS.filter(
    (w) => w.answer.length >= 4 && w.answer.length <= 7
  );
  let seed = (hash ^ 0x5a5a5a5a) >>> 0 || 246813579;
  for (let i = pool.length - 1; i > 0; i--) {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    const j = seed % (i + 1);
    const tmp = pool[i];
    pool[i] = pool[j];
    pool[j] = tmp;
  }

  const palettes: VisualThemeId[] = [
    'editorial',
    'botanical',
    'observatory',
    'mahogany',
  ];
  const visual = palettes[hash % palettes.length];

  return compilePuzzleGrid(
    `quick8x8-${isoDate}`,
    `${dayOfWeekName} 8×8 Quick Crossword`,
    'Quick 8×8 Daily Sprint',
    'quick-8x8',
    8,
    dayOfWeekName,
    '8×8 Daily Quick Edition',
    formattedDate,
    isoDate,
    visual,
    pool
  );
}

/**
 * Generates a rolling 21-day Daily & Archive catalog anchored to London, UK ('Europe/London') date,
 * including both the 20x20 Standard Edition and the 8x8 Quick Crossword for each day.
 */
export function buildRollingDailyCatalog(
  daysCount: number = 21
): PuzzleDefinition[] {
  const londonNow = getLondonDateTimeParts();
  const anchorUtc = new Date(
    Date.UTC(londonNow.year, londonNow.month - 1, londonNow.day, 12, 0, 0)
  );
  const catalog: PuzzleDefinition[] = [];

  for (let offset = 0; offset < daysCount; offset++) {
    const d = new Date(anchorUtc.getTime() - offset * 86400000);
    const yyyy = d.getUTCFullYear();
    const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
    const dd = String(d.getUTCDate()).padStart(2, '0');
    const isoDate = `${yyyy}-${mm}-${dd}`;
    catalog.push(generateArchivePuzzleForDate(isoDate));
    catalog.push(generateQuick8x8PuzzleForDate(isoDate));
  }

  return catalog;
}

export const CURATED_PUZZLES: PuzzleDefinition[] = buildRollingDailyCatalog(21);

export function createCustomThemePuzzle(
  customThemeTitle: string,
  customEntries: Array<{
    answer: string;
    standardClue: string;
    mediumClue?: string;
    crypticClue?: string;
    crypticBreakdown?: string;
  }>,
  visualTheme: VisualThemeId,
  gridSize: GridSizeOption = 20
): PuzzleDefinition {
  const todayIso = getTodayIsoDate();
  const customSeeds: WordEntrySeed[] = customEntries
    .map((e, idx) => {
      const cleaned = e.answer.toUpperCase().replace(/[^A-Z]/g, '');
      if (cleaned.length < 3 || cleaned.length > gridSize) return null;
      const easyText =
        e.standardClue.trim() || `Thematic entry for ${customThemeTitle}`;
      const mediumText =
        e.mediumClue && e.mediumClue.trim().length > 0
          ? e.mediumClue.trim()
          : `${easyText} (starts with ${cleaned[0]}, ${cleaned.length} letters)`;
      const hardText =
        e.crypticClue && e.crypticClue.trim().length > 0
          ? e.crypticClue.trim()
          : `${easyText} — hidden in ${cleaned
              .split('')
              .reverse()
              .join('')
              .toLowerCase()} reversal (${cleaned.length})`;
      const breakdownText =
        e.crypticBreakdown && e.crypticBreakdown.trim().length > 0
          ? e.crypticBreakdown.trim()
          : `Custom entry (${cleaned.length} letters): starts with '${cleaned[0]}' and ends with '${cleaned[cleaned.length - 1]}'.`;

      return {
        answer: cleaned,
        easyClue: easyText,
        mediumClue: mediumText,
        hardClue: hardText,
        standardClue: easyText,
        crypticClue: hardText,
        crypticBreakdown: breakdownText,
        etymologyOrContext: `Custom theme word from "${customThemeTitle}".`,
        defaultIsCryptic: idx % 2 === 1,
      };
    })
    .filter((x): x is WordEntrySeed => x !== null);

  const seen = new Set<string>(customSeeds.map((s) => s.answer));
  const combinedPool = [
    ...customSeeds,
    ...UNIVERSAL_BRIDGE_WORDS.filter((w) => !seen.has(w.answer)),
  ];

  return compilePuzzleGrid(
    `custom-${Date.now()}`,
    `Custom ${gridSize}×${gridSize}: ${customThemeTitle}`,
    customThemeTitle,
    'custom-themed',
    gridSize,
    'Custom',
    `${gridSize}×${gridSize} Custom Thematic Grid`,
    todayIso,
    todayIso,
    visualTheme,
    combinedPool
  );
}
