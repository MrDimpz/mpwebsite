import { Puzzle } from '../types/game';
import { getLondonDateString, formatDayString } from '../utils/londonTime';

// Significant Holiday & Special Occasion Puzzles (keyed by MM-DD)
export const SPECIAL_DATE_PUZZLES: Record<
  string,
  {
    clue: string;
    themeWord: string;
    words: string[];
    difficulty: 'Easy' | 'Medium' | 'Challenging';
    funFact: string;
  }
> = {
  // Halloween (October 31)
  '10-31': {
    clue: '"___ or treat!"',
    themeWord: 'TRICK',
    words: ['BATS', 'CANDY', 'GHOST', 'OWL', 'WITCH', 'ZOMBIE'],
    difficulty: 'Medium',
    funFact: 'The phrase "Trick or treat!" was first recorded in print in 1927 in Alberta, Canada.'
  },
  // October 30 (Mischief Night)
  '10-30': {
    clue: '"Eve before the spooky costumes"',
    themeWord: 'MISCHIEF',
    words: ['APPLE', 'BONFIRE', 'CANDLE', 'COSTUME', 'MASK', 'PRANK'],
    difficulty: 'Medium',
    funFact: 'October 30 is traditionally celebrated as Mischief Night, an evening of playful pranks and games.'
  },
  // Bonfire Night / Guy Fawkes Night (November 5)
  '11-05': {
    clue: '"Remember, remember the fifth of November"',
    themeWord: 'BONFIRE',
    words: ['BLAZE', 'CHESTNUT', 'EMBER', 'FIREWORK', 'ROCKET', 'SPARKLER'],
    difficulty: 'Medium',
    funFact: 'Bonfire Night commemorates the failure of the 1605 Gunpowder Plot to blow up the Houses of Parliament in London.'
  },
  // Christmas Eve (December 24)
  '12-24': {
    clue: '"The night before Christmas"',
    themeWord: 'SLEIGH',
    words: ['BELLS', 'CAROL', 'CHIMNEY', 'ELF', 'REINDEER', 'STOCKING'],
    difficulty: 'Easy',
    funFact: 'The poem "A Visit from St. Nicholas" (The Night Before Christmas) was first published anonymously in 1823.'
  },
  // Christmas Day (December 25)
  '12-25': {
    clue: '"Deck the halls with boughs of holly"',
    themeWord: 'YULETIDE',
    words: ['CANDLE', 'FEAST', 'HOLLY', 'MISTLETOE', 'PRESENTS', 'TINSEL'],
    difficulty: 'Easy',
    funFact: 'In 1843, Sir Henry Cole commissioned the very first commercial Christmas card in London.'
  },
  // Boxing Day (December 26)
  '12-26': {
    clue: '"Day after Christmas unwrapping"',
    themeWord: 'BOXING',
    words: ['CHARITY', 'HAMPER', 'LEFTOVERS', 'PARCEL', 'RIBBON', 'WRAPPING'],
    difficulty: 'Easy',
    funFact: 'Boxing Day traditionally originated as a day off for servants who received gift boxes from their employers.'
  },
  // New Year\'s Eve (December 31)
  '12-31': {
    clue: '"Midnight countdown to a new beginning"',
    themeWord: 'COUNTDOWN',
    words: ['BALLOON', 'CHAMPAGNE', 'CONFETTI', 'MIDNIGHT', 'PARTY', 'TOAST'],
    difficulty: 'Medium',
    funFact: 'The Times Square New Year\'s Eve ball drop has been held annually since 1907.'
  },
  // New Year\'s Day (January 1)
  '01-01': {
    clue: '"Turn over a fresh calendar page"',
    themeWord: 'RESOLVE',
    words: ['CALENDAR', 'GOAL', 'HOPE', 'JANUARY', 'NEW', 'PROMISE'],
    difficulty: 'Easy',
    funFact: 'The Babylonians made promises to their gods at the start of each year over 4,000 years ago.'
  },
  // Valentine\'s Day (February 14)
  '02-14': {
    clue: '"Cupid\'s arrow of affection"',
    themeWord: 'ROMANCE',
    words: ['CANDLE', 'CHOCOLATE', 'CUPID', 'HEART', 'KISS', 'ROSE'],
    difficulty: 'Easy',
    funFact: 'Richard Cadbury introduced the first heart-shaped box of Valentine\'s Day chocolates in 1868.'
  },
  // St. Patrick\'s Day (March 17)
  '03-17': {
    clue: '"Wearing the green for luck"',
    themeWord: 'SHAMROCK',
    words: ['CELTIC', 'CLOVER', 'DUBLIN', 'EMERALD', 'GOLD', 'LEPRECHAUN'],
    difficulty: 'Easy',
    funFact: 'The Chicago River has been dyed bright green annually for St. Patrick\'s Day since 1962.'
  },
  // April Fools\' Day (April 1)
  '04-01': {
    clue: '"Watch out for harmless trickery"',
    themeWord: 'PRANKSTER',
    words: ['CHUCKLE', 'FOOL', 'GIGGLE', 'HOAX', 'JEST', 'SPOOF'],
    difficulty: 'Medium',
    funFact: 'In 1957, the BBC broadcast a famous April Fools\' hoax showing a family harvesting spaghetti from trees in Switzerland.'
  },
  // Easter Sunday (April 5)
  '04-05': {
    clue: '"Springtime painted egg hunt"',
    themeWord: 'EASTER',
    words: ['BONNET', 'BUNNY', 'CHICK', 'CHOCOLATE', 'DAFFODIL', 'EGG'],
    difficulty: 'Easy',
    funFact: 'Decorating eggs for spring celebrations is an ancient custom dating back millennia before modern chocolate eggs.'
  },
  // Earth Day (April 22)
  '04-22': {
    clue: '"Protect our shared home planet"',
    themeWord: 'PLANET',
    words: ['CLIMATE', 'FOREST', 'NATURE', 'OCEAN', 'RECYCLE', 'WILDLIFE'],
    difficulty: 'Easy',
    funFact: 'The first Earth Day took place on April 22, 1970, mobilizing 20 million Americans.'
  },
  // May Day (May 1)
  '05-01': {
    clue: '"Dancing around the floral ribbon pole"',
    themeWord: 'MAYPOLE',
    words: ['BLOOM', 'BLOSSOM', 'CROWN', 'DANCE', 'GARLAND', 'SPRING'],
    difficulty: 'Easy',
    funFact: 'May Day celebrations have welcomed the arrival of summer since ancient Roman and Celtic festivals.'
  },
  // Cinco de Mayo (May 5)
  '05-05': {
    clue: '"Fiesta of music and heritage"',
    themeWord: 'FIESTA',
    words: ['GUITAR', 'MARIACHI', 'PIÑATA', 'SALSA', 'SOMBRERO', 'TACO'],
    difficulty: 'Easy',
    funFact: 'Cinco de Mayo commemorates the Mexican army\'s unlikely victory over the French Empire in 1862.'
  },
  // Summer Solstice / Midsummer (June 21)
  '06-21': {
    clue: '"The longest daylight of the year"',
    themeWord: 'SOLSTICE',
    words: ['BONFIRE', 'DAWN', 'LONGEST', 'MIDNIGHT', 'SUNLIGHT', 'TWILIGHT'],
    difficulty: 'Medium',
    funFact: 'Stonehenge aligns precisely with the sunrise on the summer solstice every year.'
  },
  // Independence Day / Summer Picnic (July 4)
  '07-04': {
    clue: '"Sparklers in the summer night sky"',
    themeWord: 'FREEDOM',
    words: ['BARBECUE', 'BURGER', 'FIREWORK', 'PARADE', 'PICNIC', 'SPARKLER'],
    difficulty: 'Easy',
    funFact: 'Three US presidents died on the Fourth of July: John Adams, Thomas Jefferson, and James Monroe.'
  },
  // Autumn Equinox / Harvest (September 22)
  '09-22': {
    clue: '"When golden crops fill the barn"',
    themeWord: 'HARVEST',
    words: ['ACORN', 'APPLE', 'BARN', 'CIDER', 'CORN', 'SCARECROW'],
    difficulty: 'Easy',
    funFact: 'The Harvest Moon is the full moon nearest the autumn equinox, allowing farmers extra light to work late.'
  },
  // Thanksgiving (November 26)
  '11-26': {
    clue: '"Gathering around the roasted feast"',
    themeWord: 'GRATITUDE',
    words: ['CRANBERRY', 'FEAST', 'GRAVY', 'PIE', 'STUFFING', 'TURKEY'],
    difficulty: 'Easy',
    funFact: 'President Lincoln declared Thanksgiving a national holiday in 1863 amidst the American Civil War.'
  }
};

export interface PuzzleTemplate {
  clue: string;
  themeWord: string;
  words: string[];
  difficulty: 'Easy' | 'Medium' | 'Challenging';
  funFact: string;
}

// 70 Handcrafted Compound Association Puzzles (Lower words follow or precede the theme word)
export const COMPOUND_PUZZLES_BANK: PuzzleTemplate[] = [
  // 1. Compound: ICE
  {
    clue: '"Frozen water in a cube"',
    themeWord: 'ICE',
    words: ['AGE', 'BERG', 'BOX', 'CAP', 'CREAM', 'SKATE'],
    difficulty: 'Medium',
    funFact: 'All lower words form compound terms with ICE: Ice age, iceberg, icebox, ice cap, ice cream, ice skate.'
  },
  // 2. Compound: BEE
  {
    clue: '"It produces golden honey"',
    themeWord: 'BEE',
    words: ['HIVE', 'KEEPER', 'LINE', 'POLLEN', 'STING', 'WAX'],
    difficulty: 'Easy',
    funFact: 'Forms compound terms with BEE: Beehive, beekeeper, beeline, bee pollen, bee sting, beeswax.'
  },
  // 3. Compound: MOON
  {
    clue: '"The nocturnal celestial orb"',
    themeWord: 'MOON',
    words: ['BEAM', 'CAKE', 'LIGHT', 'PIE', 'SHINE', 'STONE'],
    difficulty: 'Medium',
    funFact: 'Forms compound terms with MOON: Moonbeam, mooncake, moonlight, moonpie, moonshine, moonstone.'
  },
  // 4. Compound: HAND
  {
    clue: '"At the end of your arm"',
    themeWord: 'HAND',
    words: ['BAG', 'BOOK', 'CUFF', 'MADE', 'SHAKE', 'WRITING'],
    difficulty: 'Easy',
    funFact: 'Forms compound terms with HAND: Handbag, handbook, handcuff, handmade, handshake, handwriting.'
  },
  // 5. Compound: RAIN
  {
    clue: '"Precipitation from storm clouds"',
    themeWord: 'RAIN',
    words: ['BOW', 'COAT', 'DROP', 'FALL', 'FOREST', 'WATER'],
    difficulty: 'Easy',
    funFact: 'Forms compound terms with RAIN: Rainbow, raincoat, raindrop, rainfall, rainforest, rainwater.'
  },
  // 6. Compound: HOME
  {
    clue: '"The place where you live"',
    themeWord: 'HOME',
    words: ['BASE', 'COMING', 'LAND', 'MADE', 'SICK', 'TOWN'],
    difficulty: 'Easy',
    funFact: 'Forms compound terms with HOME: Homebase, homecoming, homeland, homemade, homesick, hometown.'
  },
  // 7. Compound: SNOW
  {
    clue: '"White winter flurry crystals"',
    themeWord: 'SNOW',
    words: ['BALL', 'BOARD', 'DRIFT', 'FLAKE', 'MAN', 'STORM'],
    difficulty: 'Easy',
    funFact: 'Forms compound terms with SNOW: Snowball, snowboard, snowdrift, snowflake, snowman, snowstorm.'
  },
  // 8. Compound: TEA
  {
    clue: '"Morning cup of steeped herbal brew"',
    themeWord: 'TEA',
    words: ['BAG', 'CUP', 'LEAF', 'POT', 'SPOON', 'TIME'],
    difficulty: 'Easy',
    funFact: 'Forms compound terms with TEA: Teabag, teacup, tealeaf, teapot, teaspoon, teatime.'
  },
  // 9. Compound: BUTTER
  {
    clue: '"Creamy yellow spread on toast"',
    themeWord: 'BUTTER',
    words: ['CUP', 'FAT', 'FINGER', 'FLY', 'KNIFE', 'MILK'],
    difficulty: 'Medium',
    funFact: 'Forms compound terms with BUTTER: Buttercup, butterfat, butterfinger, butterfly, butterknife, buttermilk.'
  },
  // 10. Compound: BEACH
  {
    clue: '"Coastal shore of sand and shells"',
    themeWord: 'BEACH',
    words: ['BALL', 'BOY', 'COMB', 'FRONT', 'HEAD', 'TOWEL'],
    difficulty: 'Medium',
    funFact: 'Forms compound terms with BEACH: Beach ball, beach boy, beachcomb, beachfront, beachhead, beach towel.'
  },
  // 11. Compound: SHIP
  {
    clue: '"Vessel sailing on high seas"',
    themeWord: 'SHIP',
    words: ['BOARD', 'BUILDER', 'MATE', 'SHAPE', 'WRECK', 'YARD'],
    difficulty: 'Medium',
    funFact: 'Forms compound terms with SHIP: Shipboard, shipbuilder, shipmate, shipshape, shipwreck, shipyard.'
  },
  // 12. Compound: LIGHT
  {
    clue: '"Illumination from a lamp or star"',
    themeWord: 'LIGHT',
    words: ['BULB', 'HOUSE', 'POST', 'SABER', 'SPEED', 'WEIGHT'],
    difficulty: 'Medium',
    funFact: 'Forms compound terms with LIGHT: Lightbulb, lighthouse, lightpost, lightsaber, lightspeed, lightweight.'
  },
  // 13. Compound: BOOK
  {
    clue: '"Bound pages you read"',
    themeWord: 'BOOK',
    words: ['CASE', 'END', 'MARK', 'SHELF', 'STORE', 'WORM'],
    difficulty: 'Easy',
    funFact: 'Forms compound terms with BOOK: Bookcase, bookend, bookmark, bookshelf, bookstore, bookworm.'
  },
  // 14. Compound: SUN
  {
    clue: '"The daytime glowing yellow star"',
    themeWord: 'SUN',
    words: ['BATHE', 'BURN', 'DIAL', 'FLOWER', 'LIGHT', 'SET'],
    difficulty: 'Easy',
    funFact: 'Forms compound terms with SUN: Sunbathe, sunburn, sundial, sunflower, sunlight, sunset.'
  },
  // 15. Compound: WATER
  {
    clue: '"Clear liquid essential for life"',
    themeWord: 'WATER',
    words: ['COLOR', 'FALL', 'FRONT', 'MELON', 'PROOF', 'SHED'],
    difficulty: 'Easy',
    funFact: 'Forms compound terms with WATER: Watercolor, waterfall, waterfront, watermelon, waterproof, watershed.'
  },
  // 16. Compound: FIRE
  {
    clue: '"Flame that produces heat"',
    themeWord: 'FIRE',
    words: ['BALL', 'CRACKER', 'FLY', 'MAN', 'PLACE', 'WOOD'],
    difficulty: 'Easy',
    funFact: 'Forms compound terms with FIRE: Fireball, firecracker, firefly, fireman, fireplace, firewood.'
  },
  // 17. Compound: FOOT
  {
    clue: '"At the bottom of your leg"',
    themeWord: 'FOOT',
    words: ['BALL', 'HOLD', 'NOTE', 'PATH', 'PRINT', 'STEP'],
    difficulty: 'Easy',
    funFact: 'Forms compound terms with FOOT: Football, foothold, footnote, footpath, footprint, footstep.'
  },
  // 18. Compound: HEAD
  {
    clue: '"Where your brain resides"',
    themeWord: 'HEAD',
    words: ['BAND', 'LIGHT', 'LINE', 'PHONE', 'SET', 'STRONG'],
    difficulty: 'Medium',
    funFact: 'Forms compound terms with HEAD: Headband, headlight, headline, headphone, headset, headstrong.'
  },
  // 19. Compound: EYE
  {
    clue: '"The organ of sight"',
    themeWord: 'EYE',
    words: ['BALL', 'BROW', 'LASH', 'LID', 'OPENER', 'SIGHT'],
    difficulty: 'Easy',
    funFact: 'Forms compound terms with EYE: Eyeball, eyebrow, eyelash, eyelid, eye-opener, eyesight.'
  },
  // 20. Compound: STAR
  {
    clue: '"Twinkling speck in deep space"',
    themeWord: 'STAR',
    words: ['BURST', 'DOM', 'FISH', 'GAZE', 'LIGHT', 'SHIP'],
    difficulty: 'Easy',
    funFact: 'Forms compound terms with STAR: Starburst, stardom, starfish, stargaze, starlight, starship.'
  },
  // 21. Compound: CARD
  {
    clue: '"Rectangle dealt in poker or blackjack"',
    themeWord: 'CARD',
    words: ['BOARD', 'GAME', 'HOLDER', 'SHARK', 'TABLE', 'TRICK'],
    difficulty: 'Easy',
    funFact: 'Forms compound terms with CARD: Cardboard, card game, cardholder, card shark, card table, card trick.'
  },
  // 22. Compound: GOLD
  {
    clue: '"Precious shiny yellow metal"',
    themeWord: 'GOLD',
    words: ['DIGGER', 'EN', 'FISH', 'MINE', 'RUSH', 'SMITH'],
    difficulty: 'Easy',
    funFact: 'Forms compound terms with GOLD: Gold digger, golden, goldfish, goldmine, gold rush, goldsmith.'
  },
  // 23. Compound: SILVER
  {
    clue: '"Lustrous metal behind mirrors"',
    themeWord: 'SILVER',
    words: ['BELL', 'FISH', 'FOX', 'LINING', 'SCREEN', 'WARE'],
    difficulty: 'Medium',
    funFact: 'Forms compound terms with SILVER: Silver bell, silverfish, silver fox, silver lining, silver screen, silverware.'
  },
  // 24. Compound: TIME
  {
    clue: '"Measured by clocks and sundials"',
    themeWord: 'TIME',
    words: ['BOMB', 'CARD', 'KEEPER', 'LINE', 'PIECE', 'ZONE'],
    difficulty: 'Easy',
    funFact: 'Forms compound terms with TIME: Time bomb, timecard, timekeeper, timeline, timepiece, timezone.'
  },
  // 25. Compound: AIR
  {
    clue: '"Atmospheric gas that fills lungs"',
    themeWord: 'AIR',
    words: ['CRAFT', 'LINE', 'MAIL', 'PLANE', 'PORT', 'SHIP'],
    difficulty: 'Easy',
    funFact: 'Forms compound terms with AIR: Aircraft, airline, airmail, airplane, airport, airship.'
  },
  // 26. Compound: WOOD
  {
    clue: '"Felled timber from the forest"',
    themeWord: 'WOOD',
    words: ['CHIP', 'CHUCK', 'CRAFT', 'LAND', 'PECKER', 'SHED'],
    difficulty: 'Easy',
    funFact: 'Forms compound terms with WOOD: Woodchip, woodchuck, woodcraft, woodland, woodpecker, woodshed.'
  },
  // 27. Compound: SEA
  {
    clue: '"Briny saltwater marine expanse"',
    themeWord: 'SEA',
    words: ['BIRD', 'FOOD', 'GULL', 'HORSE', 'SHELL', 'WEED'],
    difficulty: 'Easy',
    funFact: 'Forms compound terms with SEA: Seabird, seafood, seagull, seahorse, seashell, seaweed.'
  },
  // 28. Compound: TOOTH
  {
    clue: '"Pearly white chomper in your mouth"',
    themeWord: 'TOOTH',
    words: ['ACHE', 'BRUSH', 'FAIRY', 'LESS', 'PASTE', 'PICK'],
    difficulty: 'Easy',
    funFact: 'Forms compound terms with TOOTH: Toothache, toothbrush, tooth fairy, toothless, toothpaste, toothpick.'
  },
  // 29. Compound: DOG
  {
    clue: '"Barking canine loyal pet"',
    themeWord: 'DOG',
    words: ['COLLAR', 'FIGHT', 'HOUSE', 'PARK', 'SLED', 'WOOD'],
    difficulty: 'Easy',
    funFact: 'Forms compound terms with DOG: Dog collar, dogfight, doghouse, dog park, dogsled, dogwood.'
  },
  // 30. Compound: CAT
  {
    clue: '"Purring feline whiskered pet"',
    themeWord: 'CAT',
    words: ['CALL', 'FIGHT', 'FISH', 'NAP', 'NIP', 'WALK'],
    difficulty: 'Easy',
    funFact: 'Forms compound terms with CAT: Catcall, catfight, catfish, catnap, catnip, catwalk.'
  },
  // 31. Compound: POST
  {
    clue: '"Mail delivery courier service"',
    themeWord: 'POST',
    words: ['AGE', 'BOX', 'CARD', 'MAN', 'MARK', 'OFFICE'],
    difficulty: 'Easy',
    funFact: 'Forms compound terms with POST: Postage, postbox, postcard, postman, postmark, post office.'
  },
  // 32. Compound: SUPER
  {
    clue: '"Far greater than average"',
    themeWord: 'SUPER',
    words: ['BOWL', 'HERO', 'MAN', 'MARKET', 'SONIC', 'STAR'],
    difficulty: 'Easy',
    funFact: 'Forms compound terms with SUPER: Super Bowl, superhero, superman, supermarket, supersonic, superstar.'
  },
  // 33. Compound: SWEET
  {
    clue: '"Sugary dessert sensation"',
    themeWord: 'SWEET',
    words: ['BREAD', 'CORN', 'HEART', 'MEAT', 'PEA', 'TOOTH'],
    difficulty: 'Easy',
    funFact: 'Forms compound terms with SWEET: Sweetbread, sweetcorn, sweetheart, sweetmeat, sweetpea, sweet tooth.'
  },
  // 34. Compound: BLACK
  {
    clue: '"Total absence of visible light"',
    themeWord: 'BLACK',
    words: ['BERRY', 'BIRD', 'BOARD', 'JACK', 'MAIL', 'SMITH'],
    difficulty: 'Easy',
    funFact: 'Forms compound terms with BLACK: Blackberry, blackbird, blackboard, blackjack, blackmail, blacksmith.'
  },
  // 35. Compound: WHITE
  {
    clue: '"Hue of pure snow and milk"',
    themeWord: 'WHITE',
    words: ['BOARD', 'CAP', 'COLLAR', 'FISH', 'HOUSE', 'WASH'],
    difficulty: 'Easy',
    funFact: 'Forms compound terms with WHITE: Whiteboard, whitecap, white-collar, whitefish, White House, whitewash.'
  },
  // 36. Compound: BLUE
  {
    clue: '"Color of the clear azure sky"',
    themeWord: 'BLUE',
    words: ['BELL', 'BERRY', 'BIRD', 'JEANS', 'PRINT', 'TOOTH'],
    difficulty: 'Easy',
    funFact: 'Forms compound terms with BLUE: Bluebell, blueberry, bluebird, blue jeans, blueprint, Bluetooth.'
  },
  // 37. Compound: GREEN
  {
    clue: '"Color of lush spring lawn"',
    themeWord: 'GREEN',
    words: ['BACK', 'FIELD', 'HORN', 'HOUSE', 'PEA', 'THUMB'],
    difficulty: 'Easy',
    funFact: 'Forms compound terms with GREEN: Greenback, greenfield, greenhorn, greenhouse, green pea, green thumb.'
  },
  // 38. Compound: RED
  {
    clue: '"Color of a ripe crimson rose"',
    themeWord: 'RED',
    words: ['BIRD', 'CAP', 'CARPET', 'HEAD', 'TAPE', 'WOOD'],
    difficulty: 'Easy',
    funFact: 'Forms compound terms with RED: Redbird, redcap, red carpet, redhead, red tape, redwood.'
  },
  // 39. Compound: JELLY
  {
    clue: '"Fruity gelatinous toast spread"',
    themeWord: 'JELLY',
    words: ['BEAN', 'FISH', 'JAR', 'ROLL', 'SHOT', 'SPREAD'],
    difficulty: 'Easy',
    funFact: 'Forms compound terms with JELLY: Jellybean, jellyfish, jelly jar, jelly roll, jelly shot, jelly spread.'
  },
  // 40. Compound: CAMP
  {
    clue: '"Outdoor summer tent site"',
    themeWord: 'CAMP',
    words: ['BED', 'FIRE', 'GROUND', 'MATE', 'OUT', 'SITE'],
    difficulty: 'Easy',
    funFact: 'Forms compound terms with CAMP: Campbed, campfire, campground, campmate, campout, campsite.'
  },
  // 41. Compound: CROSS
  {
    clue: '"Intersecting pair of perpendicular lines"',
    themeWord: 'CROSS',
    words: ['BAR', 'BONE', 'BOW', 'FIRE', 'ROAD', 'WORD'],
    difficulty: 'Medium',
    funFact: 'Forms compound terms with CROSS: Crossbar, crossbones, crossbow, crossfire, crossroads, crossword.'
  },
  // 42. Compound: DAY
  {
    clue: '"Twenty-four hour solar rotation"',
    themeWord: 'DAY',
    words: ['BREAK', 'CARE', 'DREAM', 'LIGHT', 'TIME', 'TRIP'],
    difficulty: 'Easy',
    funFact: 'Forms compound terms with DAY: Daybreak, daycare, daydream, daylight, daytime, daytrip.'
  },
  // 43. Compound: EARTH
  {
    clue: '"Third planet from the sun"',
    themeWord: 'EARTH',
    words: ['BOUND', 'QUAKE', 'SHINE', 'WARE', 'WORK', 'WORM'],
    difficulty: 'Easy',
    funFact: 'Forms compound terms with EARTH: Earthbound, earthquake, earthshine, earthenware, earthwork, earthworm.'
  },
  // 44. Compound: FISH
  {
    clue: '"Gill-breathing underwater swimmer"',
    themeWord: 'FISH',
    words: ['BOWL', 'HOOK', 'MONGER', 'NET', 'POND', 'TANK'],
    difficulty: 'Easy',
    funFact: 'Forms compound terms with FISH: Fishbowl, fishhook, fishmonger, fishnet, fishpond, fishtank.'
  },
  // 45. Compound: HAIR
  {
    clue: '"Strands growing on your scalp"',
    themeWord: 'HAIR',
    words: ['BAND', 'BRUSH', 'CUT', 'LINE', 'NET', 'PIN'],
    difficulty: 'Easy',
    funFact: 'Forms compound terms with HAIR: Hairband, hairbrush, haircut, hairline, hairnet, hairpin.'
  },
  // 46. Compound: IRON
  {
    clue: '"Heavy magnetic metallic element"',
    themeWord: 'IRON',
    words: ['CLAD', 'CURTAIN', 'FIST', 'MAN', 'WEED', 'WOOD'],
    difficulty: 'Medium',
    funFact: 'Forms compound terms with IRON: Ironclad, Iron Curtain, iron fist, iron man, ironweed, ironwood.'
  },
  // 47. Compound: LIFE
  {
    clue: '"Living biological existence"',
    themeWord: 'LIFE',
    words: ['BOAT', 'GUARD', 'LINE', 'SAVER', 'SPAN', 'TIME'],
    difficulty: 'Easy',
    funFact: 'Forms compound terms with LIFE: Lifeboat, lifeguard, lifeline, lifesaver, lifespan, lifetime.'
  },
  // 48. Compound: NIGHT
  {
    clue: '"Dusk to dawn dark hours"',
    themeWord: 'NIGHT',
    words: ['CAP', 'CLUB', 'FALL', 'GOWN', 'LIFE', 'STAND'],
    difficulty: 'Easy',
    funFact: 'Forms compound terms with NIGHT: Nightcap, nightclub, nightfall, nightgown, nightlife, nightstand.'
  },
  // 49. Compound: PAPER
  {
    clue: '"Pressed wood pulp sheets"',
    themeWord: 'PAPER',
    words: ['BACK', 'BOY', 'CLIP', 'MILL', 'WEIGHT', 'WORK'],
    difficulty: 'Easy',
    funFact: 'Forms compound terms with PAPER: Paperback, paperboy, paperclip, papermill, paperweight, paperwork.'
  },
  // 50. Compound: PLAY
  {
    clue: '"Engage in fun games"',
    themeWord: 'PLAY',
    words: ['BILL', 'DATE', 'GROUND', 'MATE', 'OFF', 'TIME'],
    difficulty: 'Easy',
    funFact: 'Forms compound terms with PLAY: Playbill, playdate, playground, playmate, playoff, playtime.'
  },
  // 51. Compound: BALL (preceded by words)
  {
    clue: '"Round inflated bounce sphere"',
    themeWord: 'BALL',
    words: ['BASE', 'BASKET', 'FOOT', 'MEAT', 'SNOW', 'VOLLEY'],
    difficulty: 'Easy',
    funFact: 'Every lower word precedes BALL: Baseball, basketball, football, meatball, snowball, volleyball.'
  },
  // 52. Compound: ROOM (preceded by words)
  {
    clue: '"Walled living interior space"',
    themeWord: 'ROOM',
    words: ['BATH', 'BED', 'CLASS', 'COURT', 'DINING', 'LIVING'],
    difficulty: 'Easy',
    funFact: 'Every lower word precedes ROOM: Bathroom, bedroom, classroom, courtroom, dining room, living room.'
  },
  // 53. Compound: BOARD (preceded by words)
  {
    clue: '"Flat surface for chalk or games"',
    themeWord: 'BOARD',
    words: ['BLACK', 'CHALK', 'CHESS', 'DART', 'KEY', 'SKATE'],
    difficulty: 'Easy',
    funFact: 'Every lower word precedes BOARD: Blackboard, chalkboard, chessboard, dartboard, keyboard, skateboard.'
  },
  // 54. Compound: CAKE (preceded by words)
  {
    clue: '"Frosted birthday bakery slice"',
    themeWord: 'CAKE',
    words: ['CUP', 'FRUIT', 'PAN', 'PATTY', 'SHORT', 'WEDDING'],
    difficulty: 'Easy',
    funFact: 'Every lower word precedes CAKE: Cupcake, fruitcake, pancake, pattycake, shortcake, wedding cake.'
  },
  // 55. Compound: BOAT (preceded by words)
  {
    clue: '"Floating watercraft on the river"',
    themeWord: 'BOAT',
    words: ['FERRY', 'LIFE', 'ROW', 'SAIL', 'SPEED', 'TUG'],
    difficulty: 'Easy',
    funFact: 'Every lower word precedes BOAT: Ferryboat, lifeboat, rowboat, sailboat, speedboat, tugboat.'
  },
  // 56. Compound: BERRY (preceded by words)
  {
    clue: '"Juicy wild bush fruit"',
    themeWord: 'BERRY',
    words: ['BLACK', 'BLUE', 'CRAN', 'GOOSE', 'RASP', 'STRAW'],
    difficulty: 'Easy',
    funFact: 'Every lower word precedes BERRY: Blackberry, blueberry, cranberry, gooseberry, raspberry, strawberry.'
  },
  // 57. Compound: LINE (preceded by words)
  {
    clue: '"Drawn continuous boundary mark"',
    themeWord: 'LINE',
    words: ['AIR', 'BASE', 'DEAD', 'GUIDE', 'OUT', 'PIPE'],
    difficulty: 'Medium',
    funFact: 'Every lower word precedes LINE: Airline, baseline, deadline, guideline, outline, pipeline.'
  },
  // 58. Compound: HOUSE (preceded by words)
  {
    clue: '"Roof and four walls"',
    themeWord: 'HOUSE',
    words: ['DOG', 'FARM', 'GREEN', 'LIGHT', 'TREE', 'WARE'],
    difficulty: 'Easy',
    funFact: 'Every lower word precedes HOUSE: Doghouse, farmhouse, greenhouse, lighthouse, treehouse, warehouse.'
  },
  // 59. Compound: WORK (preceded by words)
  {
    clue: '"Daily effort and occupational task"',
    themeWord: 'WORK',
    words: ['FRAME', 'HOME', 'NET', 'PAPER', 'PATCH', 'TEAM'],
    difficulty: 'Easy',
    funFact: 'Every lower word precedes WORK: Framework, homework, network, paperwork, patchwork, teamwork.'
  },
  // 60. Compound: HORSE (preceded by words)
  {
    clue: '"Galloping mane equestrian mount"',
    themeWord: 'HORSE',
    words: ['CART', 'DARK', 'IRON', 'PACK', 'SEA', 'WAR'],
    difficulty: 'Medium',
    funFact: 'Every lower word precedes HORSE: Carthorse, dark horse, iron horse, packhorse, seahorse, warhorse.'
  },
  // 61. Compound: STAND (preceded by words)
  {
    clue: '"Upright stationary platform"',
    themeWord: 'STAND',
    words: ['BAND', 'FREE', 'GRAND', 'HAND', 'NIGHT', 'UNDER'],
    difficulty: 'Medium',
    funFact: 'Every lower word precedes STAND: Bandstand, freestanding, grandstand, handstand, nightstand, understand.'
  },
  // 62. Compound: WAY (preceded by words)
  {
    clue: '"Path for traveling through"',
    themeWord: 'WAY',
    words: ['DOOR', 'FREE', 'GATE', 'HIGH', 'PASS', 'SUB'],
    difficulty: 'Easy',
    funFact: 'Every lower word precedes WAY: Doorway, freeway, gateway, highway, passageway, subway.'
  },
  // 63. Compound: DROP (preceded by words)
  {
    clue: '"Single bead of liquid"',
    themeWord: 'DROP',
    words: ['BACK', 'DEW', 'GUM', 'NAME', 'RAIN', 'TEAR'],
    difficulty: 'Medium',
    funFact: 'Every lower word precedes DROP: Backdrop, dewdrop, gumdrop, namedrop, raindrop, teardrop.'
  },
  // 64. Compound: COAT (preceded by words)
  {
    clue: '"Winter jacket with lapels"',
    themeWord: 'COAT',
    words: ['OVER', 'PETTI', 'RAIN', 'RED', 'TOP', 'WAIST'],
    difficulty: 'Medium',
    funFact: 'Every lower word precedes COAT: Overcoat, petticoat, raincoat, redcoat, topcoat, waistcoat.'
  },
  // 65. Compound: MAN (preceded by words)
  {
    clue: '"Grown male person"',
    themeWord: 'MAN',
    words: ['FIRE', 'MAIL', 'POLICE', 'SNOW', 'SUPER', 'WATER'],
    difficulty: 'Easy',
    funFact: 'Every lower word precedes MAN: Fireman, mailman, policeman, snowman, superman, waterman.'
  },
  // 66. Compound: WORD (preceded by words)
  {
    clue: '"Spoken syllable unit in a sentence"',
    themeWord: 'WORD',
    words: ['BUZZ', 'CROSS', 'FORE', 'KEY', 'PASS', 'WATCH'],
    difficulty: 'Easy',
    funFact: 'Every lower word precedes WORD: Buzzword, crossword, foreword, keyword, password, watchword.'
  },
  // 67. Compound: SIDE (preceded by words)
  {
    clue: '"Lateral border or flank"',
    themeWord: 'SIDE',
    words: ['BED', 'CAMP', 'DOWN', 'IN', 'OUT', 'SEA'],
    difficulty: 'Easy',
    funFact: 'Every lower word precedes SIDE: Bedside, campsite, downside, inside, outside, seaside.'
  },
  // 68. Compound: GROUND (preceded by words)
  {
    clue: '"Surface terrain underfoot"',
    themeWord: 'GROUND',
    words: ['BACK', 'CAMP', 'FORE', 'PLAY', 'UNDER', 'UP'],
    difficulty: 'Medium',
    funFact: 'Every lower word precedes GROUND: Background, campground, foreground, playground, underground, upground.'
  },
  // 69. Compound: NOTE (preceded by words)
  {
    clue: '"Jotted memo or musical tone"',
    themeWord: 'NOTE',
    words: ['BANK', 'BLUE', 'FOOT', 'KEY', 'PASS', 'POST'],
    difficulty: 'Medium',
    funFact: 'Every lower word precedes NOTE: Banknote, blue note, footnote, keynote, passnote, post-it note.'
  },
  // 70. Compound: SHIRT (preceded by words)
  {
    clue: '"Upper body cloth garment"',
    themeWord: 'SHIRT',
    words: ['DRESS', 'NIGHT', 'POLO', 'SWEAT', 'TEE', 'UNDER'],
    difficulty: 'Easy',
    funFact: 'Every lower word precedes SHIRT: Dress shirt, nightshirt, polo shirt, sweatshirt, tee-shirt, undershirt.'
  },
  // 71. Compound: ROCK (words precede or follow)
  {
    clue: '"It beats scissors and loses to paper"',
    themeWord: 'ROCK',
    words: ['BOTTOM', 'CANDY', 'CLIMBING', 'GARDEN', 'SOLID', 'STAR'],
    difficulty: 'Medium',
    funFact: 'Every lower word forms a compound phrase with the theme: Rock bottom, rock candy, rock climbing, rock garden, rock solid, and rock star!'
  },
  // 72. Compound: WIND
  {
    clue: '"Moving current of outdoor breeze"',
    themeWord: 'WIND',
    words: ['BREAKER', 'CHIME', 'FALL', 'MILL', 'PIPE', 'SHIELD'],
    difficulty: 'Easy',
    funFact: 'Forms compound terms with WIND: Windbreaker, windchime, windfall, windmill, windpipe, windshield.'
  },
  // 73. Compound: BACK
  {
    clue: '"Rear spine or opposite of front"',
    themeWord: 'BACK',
    words: ['BONE', 'DROP', 'FIRE', 'GROUND', 'PACK', 'STAGE'],
    difficulty: 'Easy',
    funFact: 'Forms compound terms with BACK: Backbone, backdrop, backfire, background, backpack, backstage.'
  },
  // 74. Compound: OVER
  {
    clue: '"Above and across the top"',
    themeWord: 'OVER',
    words: ['BOARD', 'COAT', 'DRIVE', 'FLOW', 'LOOK', 'NIGHT'],
    difficulty: 'Easy',
    funFact: 'Forms compound terms with OVER: Overboard, overcoat, overdrive, overflow, overlook, overnight.'
  },
  // 75. Compound: UNDER
  {
    clue: '"Beneath the surface level"',
    themeWord: 'UNDER',
    words: ['COVER', 'CURRENT', 'DOG', 'GROUND', 'LINE', 'WORLD'],
    difficulty: 'Easy',
    funFact: 'Forms compound terms with UNDER: Undercover, undercurrent, underdog, underground, underline, underworld.'
  },
  // 76. Compound: OUT
  {
    clue: '"Away from the inside"',
    themeWord: 'OUT',
    words: ['BREAK', 'CAST', 'COME', 'FIELD', 'LAW', 'LINE'],
    difficulty: 'Easy',
    funFact: 'Forms compound terms with OUT: Outbreak, outcast, outcome, outfield, outlaw, outline.'
  },
  // 77. Compound: DOWN
  {
    clue: '"Toward a lower position"',
    themeWord: 'DOWN',
    words: ['FALL', 'HILL', 'POUR', 'STAGE', 'STAIRS', 'TOWN'],
    difficulty: 'Easy',
    funFact: 'Forms compound terms with DOWN: Downfall, downhill, downpour, downstage, downstairs, downtown.'
  },
  // 78. Compound: UP
  {
    clue: '"Toward the sky or higher ground"',
    themeWord: 'UP',
    words: ['BEAT', 'GRADE', 'HILL', 'LIFT', 'RIGHT', 'STAIRS'],
    difficulty: 'Easy',
    funFact: 'Forms compound terms with UP: Upbeat, upgrade, uphill, uplift, upright, upstairs.'
  },
  // 79. Compound: HIGH
  {
    clue: '"Lofty elevation above the rest"',
    themeWord: 'HIGH',
    words: ['BROW', 'CHAIR', 'LAND', 'LIGHT', 'RISE', 'WAY'],
    difficulty: 'Easy',
    funFact: 'Forms compound terms with HIGH: Highbrow, highchair, highland, highlight, highrise, highway.'
  },
  // 80. Compound: LOW
  {
    clue: '"Close to the ground or quiet"',
    themeWord: 'LOW',
    words: ['BROW', 'DOWN', 'KEY', 'LAND', 'LIFE', 'TIDE'],
    difficulty: 'Easy',
    funFact: 'Forms compound terms with LOW: Lowbrow, lowdown, lowkey, lowland, lowlife, low tide.'
  },
  // 81. Compound: SHORT
  {
    clue: '"Brief in length or stature"',
    themeWord: 'SHORT',
    words: ['BREAD', 'CAKE', 'CHANGE', 'COMING', 'CUT', 'HAND'],
    difficulty: 'Medium',
    funFact: 'Forms compound terms with SHORT: Shortbread, shortcake, shortchange, shortcoming, shortcut, shorthand.'
  },
  // 82. Compound: LONG
  {
    clue: '"Extended in distance or duration"',
    themeWord: 'LONG',
    words: ['BOAT', 'BOW', 'HAIR', 'HAND', 'HORN', 'SHOT'],
    difficulty: 'Medium',
    funFact: 'Forms compound terms with LONG: Longboat, longbow, longhair, longhand, longhorn, longshot.'
  },
  // 83. Compound: HARD
  {
    clue: '"Solid, firm, and unyielding"',
    themeWord: 'HARD',
    words: ['BACK', 'BALL', 'COPY', 'HAT', 'WARE', 'WOOD'],
    difficulty: 'Easy',
    funFact: 'Forms compound terms with HARD: Hardback, hardball, hardcopy, hardhat, hardware, hardwood.'
  },
  // 84. Compound: SOFT
  {
    clue: '"Gentle and plush to the touch"',
    themeWord: 'SOFT',
    words: ['BALL', 'BOILED', 'DRINK', 'SERVE', 'WARE', 'WOOD'],
    difficulty: 'Easy',
    funFact: 'Forms compound terms with SOFT: Softball, soft-boiled, soft drink, soft serve, software, softwood.'
  },
  // 85. Compound: COLD
  {
    clue: '"Chilly winter temperature"',
    themeWord: 'COLD',
    words: ['BLOOD', 'CREAM', 'CUT', 'FEET', 'FRONT', 'SNAP'],
    difficulty: 'Medium',
    funFact: 'Forms compound terms with COLD: Cold-blooded, cold cream, cold cut, cold feet, cold front, cold snap.'
  },
  // 86. Compound: HOT
  {
    clue: '"Sizzling high temperature"',
    themeWord: 'HOT',
    words: ['BED', 'CAKE', 'DOG', 'HEAD', 'HOUSE', 'LINE'],
    difficulty: 'Easy',
    funFact: 'Forms compound terms with HOT: Hotbed, hotcake, hotdog, hothead, hothouse, hotline.'
  },
  // 87. Compound: NEW
  {
    clue: '"Freshly minted or recently arrived"',
    themeWord: 'NEW',
    words: ['BORN', 'CAST', 'COMER', 'FANGLED', 'FOUND', 'WAVE'],
    difficulty: 'Medium',
    funFact: 'Forms compound terms with NEW: Newborn, newscast, newcomer, newfangled, newfound, new wave.'
  },
  // 88. Compound: OLD
  {
    clue: '"From a bygone vintage era"',
    themeWord: 'OLD',
    words: ['FASHION', 'GROWTH', 'HAND', 'MAID', 'SCHOOL', 'TIMER'],
    difficulty: 'Medium',
    funFact: 'Forms compound terms with OLD: Old-fashioned, old-growth, old hand, old maid, old school, old-timer.'
  },
  // 89. Compound: GOOD
  {
    clue: '"Virtuous, pleasant, or fine"',
    themeWord: 'GOOD',
    words: ['BYE', 'FELLOW', 'HEART', 'NIGHT', 'SPEED', 'WILL'],
    difficulty: 'Easy',
    funFact: 'Forms compound terms with GOOD: Goodbye, goodfellow, good-hearted, goodnight, godspeed, goodwill.'
  },
  // 90. Compound: WILD
  {
    clue: '"Untamed in nature"',
    themeWord: 'WILD',
    words: ['CARD', 'CAT', 'FIRE', 'FLOWER', 'FOWL', 'LIFE'],
    difficulty: 'Easy',
    funFact: 'Forms compound terms with WILD: Wildcard, wildcat, wildfire, wildflower, waterfowl/wildfowl, wildlife.'
  },
  // 91. Compound: FREE
  {
    clue: '"At liberty with zero cost"',
    themeWord: 'FREE',
    words: ['BIRD', 'BOOT', 'DOM', 'FALL', 'LOAD', 'STYLE'],
    difficulty: 'Easy',
    funFact: 'Forms compound terms with FREE: Freebird, freebooter, freedom, freefall, freeload, freestyle.'
  },
  // 92. Compound: OPEN
  {
    clue: '"Unlocked and welcoming"',
    themeWord: 'OPEN',
    words: ['AIR', 'DOOR', 'ENDED', 'HAND', 'HOUSE', 'WORK'],
    difficulty: 'Easy',
    funFact: 'Forms compound terms with OPEN: Open-air, open-door, open-ended, openhanded, open house, openwork.'
  },
  // 93. Compound: HALF
  {
    clue: '"One of two equal parts"',
    themeWord: 'HALF',
    words: ['BACK', 'BAKED', 'MOON', 'PIPE', 'TIME', 'WAY'],
    difficulty: 'Easy',
    funFact: 'Forms compound terms with HALF: Halfback, half-baked, half-moon, halfpipe, halftime, halfway.'
  },
  // 94. Compound: FULL
  {
    clue: '"Filled to maximum capacity"',
    themeWord: 'FULL',
    words: ['BACK', 'BLOWN', 'GROWN', 'HOUSE', 'MOON', 'SCALE'],
    difficulty: 'Easy',
    funFact: 'Forms compound terms with FULL: Fullback, full-blown, full-grown, full house, full moon, full-scale.'
  },
  // 95. Compound: FIRST
  {
    clue: '"Leading at the very front"',
    themeWord: 'FIRST',
    words: ['AID', 'BORN', 'CLASS', 'HAND', 'LADY', 'MATE'],
    difficulty: 'Easy',
    funFact: 'Forms compound terms with FIRST: First aid, firstborn, first-class, firsthand, first lady, first mate.'
  },
  // 96. Compound: BACKWARD / FORE
  {
    clue: '"Positioned in front or ahead"',
    themeWord: 'FORE',
    words: ['ARM', 'CAST', 'FATHER', 'GROUND', 'HEAD', 'WORD'],
    difficulty: 'Medium',
    funFact: 'Forms compound terms with FORE: Forearm, forecast, forefather, foreground, forehead, foreword.'
  },
  // 97. Compound: AFTER
  {
    clue: '"Following later in time"',
    themeWord: 'AFTER',
    words: ['GLOW', 'LIFE', 'MATH', 'NOON', 'SHOCK', 'TASTE'],
    difficulty: 'Easy',
    funFact: 'Forms compound terms with AFTER: Afterglow, afterlife, aftermath, afternoon, aftershock, aftertaste.'
  },
  // 98. Compound: SPRING
  {
    clue: '"Season of budding blossoms"',
    themeWord: 'SPRING',
    words: ['BOARD', 'BREAK', 'CLEAN', 'FIELD', 'TIME', 'WATER'],
    difficulty: 'Easy',
    funFact: 'Forms compound terms with SPRING: Springboard, spring break, spring cleaning, springfield, springtime, springwater.'
  },
  // 99. Compound: SUMMER
  {
    clue: '"Warmest sunny season"',
    themeWord: 'SUMMER',
    words: ['CAMP', 'HOUSE', 'LAND', 'SALT', 'SCHOOL', 'TIME'],
    difficulty: 'Easy',
    funFact: 'Forms compound terms with SUMMER: Summer camp, summerhouse, summerland, somersault, summer school, summertime.'
  },
  // 100. Compound: WINTER
  {
    clue: '"Frosty season of snow"',
    themeWord: 'WINTER',
    words: ['BERRY', 'COAT', 'GREEN', 'LAND', 'SOLSTICE', 'TIME'],
    difficulty: 'Easy',
    funFact: 'Forms compound terms with WINTER: Winterberry, winter coat, wintergreen, winterland, winter solstice, wintertime.'
  },
  // 101. Compound: CLOUD
  {
    clue: '"Fluffy white vapor in the sky"',
    themeWord: 'CLOUD',
    words: ['BERRY', 'BURST', 'CAP', 'COVER', 'LAND', 'NINE'],
    difficulty: 'Medium',
    funFact: 'Forms compound terms with CLOUD: Cloudberry, cloudburst, cloudcap, cloud cover, cloudland, cloud nine.'
  },
  // 102. Compound: STORM
  {
    clue: '"Tempest of thunder and lightning"',
    themeWord: 'STORM',
    words: ['BIRD', 'CELLAR', 'CLOUD', 'DOOR', 'FRONT', 'WATER'],
    difficulty: 'Medium',
    funFact: 'Forms compound terms with STORM: Stormbird, storm cellar, storm cloud, storm door, storm front, stormwater.'
  },
  // 103. Compound: THUNDER
  {
    clue: '"Booming rumble after lightning"',
    themeWord: 'THUNDER',
    words: ['BIRD', 'BOLT', 'CLAP', 'CLOUD', 'HEAD', 'STORM'],
    difficulty: 'Easy',
    funFact: 'Forms compound terms with THUNDER: Thunderbird, thunderbolt, thunderclap, thundercloud, thunderhead, thunderstorm.'
  },
  // 104. Compound: SAND
  {
    clue: '"Fine grains along the desert or beach"',
    themeWord: 'SAND',
    words: ['BAG', 'BANK', 'BAR', 'BOX', 'CASTLE', 'STONE'],
    difficulty: 'Easy',
    funFact: 'Forms compound terms with SAND: Sandbag, sandbank, sandbar, sandbox, sandcastle, sandstone.'
  },
  // 105. Compound: STONE
  {
    clue: '"Solid mineral pebble or boulder"',
    themeWord: 'STONE',
    words: ['AGE', 'COLD', 'CUTTER', 'WALL', 'WARE', 'WORK'],
    difficulty: 'Medium',
    funFact: 'Forms compound terms with STONE: Stone Age, stone-cold, stonecutter, stonewall, stoneware, stonework.'
  },
  // 106. Compound: GLASS
  {
    clue: '"Transparent window pane material"',
    themeWord: 'GLASS',
    words: ['BLOWER', 'CUTTER', 'EYE', 'HOUSE', 'JAW', 'WARE'],
    difficulty: 'Medium',
    funFact: 'Forms compound terms with GLASS: Glassblower, glasscutter, glass eye, glasshouse, glass jaw, glassware.'
  },
  // 107. Compound: STEEL
  {
    clue: '"Tempered alloy of iron and carbon"',
    themeWord: 'STEEL',
    words: ['BAND', 'DRUM', 'GUITAR', 'MILL', 'WOOL', 'WORK'],
    difficulty: 'Medium',
    funFact: 'Forms compound terms with STEEL: Steel band, steel drum, steel guitar, steel mill, steel wool, steelwork.'
  },
  // 108. Compound: COPPER
  {
    clue: '"Reddish-brown conductive metal"',
    themeWord: 'COPPER',
    words: ['FIELD', 'HEAD', 'MINE', 'PLATE', 'SMITH', 'WARE'],
    difficulty: 'Medium',
    funFact: 'Forms compound terms with COPPER: Copperfield, copperhead, copper mine, copperplate, coppersmith, copperware.'
  },
  // 109. Compound: STEAM
  {
    clue: '"Vapor rising from a boiling kettle"',
    themeWord: 'STEAM',
    words: ['BOAT', 'ENGINE', 'IRON', 'PIPE', 'ROLLER', 'SHIP'],
    difficulty: 'Easy',
    funFact: 'Forms compound terms with STEAM: Steamboat, steam engine, steam iron, steampipe, steamroller, steamship.'
  },
  // 110. Compound: SMOKE
  {
    clue: '"Curling plume from a campfire"',
    themeWord: 'SMOKE',
    words: ['BOMB', 'HOUSE', 'JACK', 'SCREEN', 'SIGNAL', 'STACK'],
    difficulty: 'Easy',
    funFact: 'Forms compound terms with SMOKE: Smoke bomb, smokehouse, smokejack, smokescreen, smoke signal, smokestack.'
  },
  // 111. Compound: ASH
  {
    clue: '"Silvery-gray hearth residue"',
    themeWord: 'ASH',
    words: ['BIN', 'CAN', 'FALL', 'LAR', 'PAN', 'TRAY'],
    difficulty: 'Medium',
    funFact: 'Forms compound terms with ASH: Ashbin, ashcan, ashfall, ashlar, ashpan, ashtray.'
  },
  // 112. Compound:COAL
  {
    clue: '"Black carbon fuel from a seam"',
    themeWord: 'COAL',
    words: ['BED', 'BIN', 'FACE', 'FIELD', 'MINE', 'TAR'],
    difficulty: 'Medium',
    funFact: 'Forms compound terms with COAL: Coalbed, coalbin, coalface, coalfield, coalmine, coal tar.'
  },
  // 113. Compound: RIVER
  {
    clue: '"Flowing freshwater stream"',
    themeWord: 'RIVER',
    words: ['BANK', 'BED', 'BOAT', 'FRONT', 'HEAD', 'SIDE'],
    difficulty: 'Easy',
    funFact: 'Forms compound terms with RIVER: Riverbank, riverbed, riverboat, riverfront, riverhead, riverside.'
  },
  // 114. Compound: LAKE
  {
    clue: '"Inland body of calm fresh water"',
    themeWord: 'LAKE',
    words: ['BED', 'FRONT', 'HOUSE', 'LAND', 'SHORE', 'SIDE'],
    difficulty: 'Easy',
    funFact: 'Forms compound terms with LAKE: Lakebed, lakefront, lakehouse, lakeland, lakeshore, lakeside.'
  },
  // 115. Compound: HILL
  {
    clue: '"Grassy mound smaller than a mountain"',
    themeWord: 'HILL',
    words: ['BILLY', 'CREST', 'FORT', 'OCK', 'SIDE', 'TOP'],
    difficulty: 'Easy',
    funFact: 'Forms compound terms with HILL: Hillbilly, hillcrest, hillfort, hillock, hillside, hilltop.'
  },
  // 116. Compound: FIELD
  {
    clue: '"Open meadow or athletic pitch"',
    themeWord: 'FIELD',
    words: ['CORN', 'DAY', 'GLASS', 'GOAL', 'MOUSE', 'WORK'],
    difficulty: 'Easy',
    funFact: 'Forms compound terms with FIELD: Cornfield, field day, field glass, field goal, field mouse, fieldwork.'
  },
  // 117. Compound: FARM
  {
    clue: '"Countryside homestead with crops and barns"',
    themeWord: 'FARM',
    words: ['HAND', 'HOUSE', 'LAND', 'STEAD', 'WIFE', 'YARD'],
    difficulty: 'Easy',
    funFact: 'Forms compound terms with FARM: Farmhand, farmhouse, farmland, farmstead, farmwife, farmyard.'
  },
  // 118. Compound: BARN
  {
    clue: '"Red timber building on a ranch"',
    themeWord: 'BARN',
    words: ['DANCE', 'DOOR', 'OWL', 'STORM', 'SWALLOW', 'YARD'],
    difficulty: 'Easy',
    funFact: 'Forms compound terms with BARN: Barn dance, barn door, barn owl, barnstorm, barn swallow, barnyard.'
  },
  // 119. Compound: MILL
  {
    clue: '"Grinding wheel powered by wind or water"',
    themeWord: 'MILL',
    words: ['DAM', 'POND', 'RACE', 'STONE', 'STREAM', 'WRIGHT'],
    difficulty: 'Medium',
    funFact: 'Forms compound terms with MILL: Milldam, millpond, millrace, millstone, millstream, millwright.'
  },
  // 120. Compound: GATE
  {
    clue: '"Hinged entrance in a garden wall"',
    themeWord: 'GATE',
    words: ['CRASH', 'FOLD', 'HOUSE', 'KEEP', 'POST', 'WAY'],
    difficulty: 'Easy',
    funFact: 'Forms compound terms with GATE: Gatecrash, gatefold, gatehouse, gatekeeper, gatepost, gateway.'
  },
  // 121. Compound: DOOR
  {
    clue: '"Swinging panel at a room entrance"',
    themeWord: 'DOOR',
    words: ['BELL', 'KNOB', 'MAT', 'NAIL', 'STEP', 'WAY'],
    difficulty: 'Easy',
    funFact: 'Forms compound terms with DOOR: Doorbell, doorknob, doormat, doornail, doorstep, doorway.'
  },
  // 122. Compound: WALL
  {
    clue: '"Upright brick or plaster partition"',
    themeWord: 'WALL',
    words: ['BOARD', 'EYE', 'FLOWER', 'PAPER', 'SOCKET', 'STONE'],
    difficulty: 'Easy',
    funFact: 'Forms compound terms with WALL: Wallboard, walleye, wallflower, wallpaper, wall socket, stonewall.'
  },
  // 123. Compound: FLOOR
  {
    clue: '"Surface you walk across indoors"',
    themeWord: 'FLOOR',
    words: ['BOARD', 'CLOTH', 'LAMP', 'MAT', 'PLAN', 'SHOW'],
    difficulty: 'Easy',
    funFact: 'Forms compound terms with FLOOR: Floorboard, floorcloth, floor lamp, floormat, floorplan, floorshow.'
  },
  // 124. Compound: ROOF
  {
    clue: '"Shingled shelter atop a house"',
    themeWord: 'ROOF',
    words: ['GARDEN', 'LINE', 'RACK', 'TILE', 'TOP', 'TREE'],
    difficulty: 'Easy',
    funFact: 'Forms compound terms with ROOF: Roof garden, roofline, roof rack, roof tile, rooftop, rooftree.'
  },
  // 125. Compound: WINDOW
  {
    clue: '"Framed glass opening in a wall"',
    themeWord: 'WINDOW',
    words: ['BOX', 'FRAME', 'LEDGE', 'PANE', 'SEAT', 'SILL'],
    difficulty: 'Easy',
    funFact: 'Forms compound terms with WINDOW: Window box, window frame, window ledge, windowpane, window seat, windowsill.'
  },
  // 126. Compound: TABLE
  {
    clue: '"Flat-topped dining furniture"',
    themeWord: 'TABLE',
    words: ['CLOTH', 'LAND', 'SPOON', 'TALK', 'TENNIS', 'WARE'],
    difficulty: 'Easy',
    funFact: 'Forms compound terms with TABLE: Tablecloth, tableland, tablespoon, table talk, table tennis, tableware.'
  },
  // 127. Compound: CHAIR
  {
    clue: '"Seat with a backrest"',
    themeWord: 'CHAIR',
    words: ['ARM', 'DECK', 'HIGH', 'LIFT', 'MAN', 'PUSH'],
    difficulty: 'Easy',
    funFact: 'Forms compound terms with CHAIR: Armchair, deckchair, highchair, chairlift, chairman, pushchair.'
  },
  // 128. Compound: BED
  {
    clue: '"Cozy mattress furniture for sleeping"',
    themeWord: 'BED',
    words: ['CHAMBER', 'FELLOW', 'PAN', 'POST', 'ROOM', 'SPREAD'],
    difficulty: 'Easy',
    funFact: 'Forms compound terms with BED: Bedchamber, bedfellow, bedpan, bedpost, bedroom, bedspread.'
  },
  // 129. Compound: CLOCK
  {
    clue: '"Ticking instrument that tells the hour"',
    themeWord: 'CLOCK',
    words: ['ALARM', 'FACE', 'HAND', 'TOWER', 'WISE', 'WORK'],
    difficulty: 'Easy',
    funFact: 'Forms compound terms with CLOCK: Alarm clock, clockface, clock hand, clocktower, clockwise, clockwork.'
  },
  // 130. Compound: BELL
  {
    clue: '"Hollow metal chime that rings"',
    themeWord: 'BELL',
    words: ['BIRD', 'BOY', 'FLOWER', 'FOUNDER', 'HOP', 'TOWER'],
    difficulty: 'Easy',
    funFact: 'Forms compound terms with BELL: Bellbird, bellboy, bellflower, bellfounder, bellhop, belltower.'
  },
  // 131. Compound: DRUM
  {
    clue: '"Rhythmic percussion instrument beaten with sticks"',
    themeWord: 'DRUM',
    words: ['BEAT', 'EAR', 'HEAD', 'KETTLE', 'ROLL', 'STICK'],
    difficulty: 'Easy',
    funFact: 'Forms compound terms with DRUM: Drumbeat, eardrum, drumhead, kettledrum, drumroll, drumstick.'
  }
];

// Thematic Categories (Alphabetical sub-words)
export const THEMATIC_PUZZLES_BANK: PuzzleTemplate[] = [
  {
    clue: '"Pass the parmesan!"',
    themeWord: 'PASTA',
    words: ['FUSILLI', 'GNOCCHI', 'LASAGNA', 'PENNE', 'RAVIOLI', 'ZITI'],
    difficulty: 'Easy',
    funFact: 'There are over 350 recognized pasta shapes in Italy, each engineered for specific sauce viscosities.'
  },
  {
    clue: '"Morning caffeine rush"',
    themeWord: 'COFFEE',
    words: ['AFFOGATO', 'BREVE', 'CORTADO', 'DRIP', 'LATTE', 'MOCHA'],
    difficulty: 'Easy',
    funFact: 'An Affogato is made by pouring a shot of hot espresso directly over a scoop of vanilla gelato.'
  },
  {
    clue: '"Roll the dice on family night"',
    themeWord: 'BOARDGAMES',
    words: ['CATAN', 'CLUE', 'MONOPOLY', 'RISK', 'SORRY', 'TWISTER'],
    difficulty: 'Medium',
    funFact: 'The Landlord\'s Game, the predecessor of Monopoly, was patented in 1903 by progressive feminist Lizzie Magie.'
  },
  {
    clue: '"Stargazer\'s night sky"',
    themeWord: 'COSMOS',
    words: ['COMET', 'GALAXY', 'METEOR', 'MOON', 'NEBULA', 'PULSAR'],
    difficulty: 'Medium',
    funFact: 'Halley\'s Comet returns to Earth\'s vicinity once every 75 to 76 years.'
  },
  {
    clue: '"Man\'s best friend"',
    themeWord: 'CANINE',
    words: ['BEAGLE', 'BOXER', 'CORGI', 'HUSKY', 'POODLE', 'PUG'],
    difficulty: 'Easy',
    funFact: 'Corgi translates from Welsh as "dwarf dog," originally bred to herd livestock by nipping heels.'
  },
  {
    clue: '"Sparkle in the jeweler\'s vault"',
    themeWord: 'JEWELS',
    words: ['AMBER', 'DIAMOND', 'EMERALD', 'GARNET', 'RUBY', 'TOPAZ'],
    difficulty: 'Medium',
    funFact: 'Rubies and sapphires are made of the exact same mineral: corundum.'
  },
  {
    clue: '"Sounds from the orchestra pit"',
    themeWord: 'MUSIC',
    words: ['BASSOON', 'CELLO', 'FLUTE', 'HARP', 'OBOE', 'VIOLIN'],
    difficulty: 'Medium',
    funFact: 'The modern concert harp has 47 strings and 7 pedals to change the pitch of the strings.'
  },
  {
    clue: '"Fresh bakery morning aromas"',
    themeWord: 'BAKERY',
    words: ['BAGEL', 'BRIOCHE', 'CROISSANT', 'DANISH', 'ECLAIR', 'SCONE'],
    difficulty: 'Easy',
    funFact: 'The croissant was adapted from the Austrian kipferl following the siege of Vienna in 1683.'
  },
  {
    clue: '"Citrus orchard harvest"',
    themeWord: 'CITRUS',
    words: ['BERGAMOT', 'CLEMENTINE', 'KUMQUAT', 'LEMON', 'LIME', 'ORANGE'],
    difficulty: 'Easy',
    funFact: 'All commercial citrus fruits derive from four wild ancestral species: citron, pomelo, mandarin, and papeda.'
  },
  {
    clue: '"European capital getaways"',
    themeWord: 'CAPITALS',
    words: ['ATHENS', 'BERLIN', 'DUBLIN', 'LISBON', 'MADRID', 'ROME'],
    difficulty: 'Easy',
    funFact: 'Rome was founded in 753 BC and is home to the smallest sovereign nation on Earth, Vatican City.'
  },
  {
    clue: '"Under the ocean waves"',
    themeWord: 'MARINE',
    words: ['CORAL', 'DOLPHIN', 'JELLYFISH', 'OCTOPUS', 'SHARK', 'WHALE'],
    difficulty: 'Easy',
    funFact: 'Octopuses have three hearts, nine brains, and blue, copper-based blood.'
  },
  {
    clue: '"Olympics on ice and snow"',
    themeWord: 'WINTER',
    words: ['BIATHLON', 'BOBSLED', 'CURLING', 'LUGE', 'SKELETON', 'SKIING'],
    difficulty: 'Medium',
    funFact: 'Curling stones are crafted exclusively from granite quarried on the Scottish island of Ailsa Craig.'
  },
  {
    clue: '"William Shakespeare\'s stage"',
    themeWord: 'THEATRE',
    words: ['HAMLET', 'MACBETH', 'OTHELLO', 'ROMEO', 'TEMPEST', 'TWELFTH'],
    difficulty: 'Challenging',
    funFact: 'Actors avoid speaking the word "Macbeth" inside a theater due to a superstition dating to 1606.'
  },
  {
    clue: '"Shades of the twilight sky"',
    themeWord: 'BLUES',
    words: ['AZURE', 'COBALT', 'CYAN', 'INDIGO', 'NAVY', 'TEAL'],
    difficulty: 'Easy',
    funFact: 'Lapis lazuli was once ground into pigment more expensive than gold to produce ultramarine.'
  },
  {
    clue: '"Card shark around the table"',
    themeWord: 'CARDS',
    words: ['BACCARAT', 'BLACKJACK', 'BRIDGE', 'CANASTA', 'EUCHRE', 'POKER'],
    difficulty: 'Medium',
    funFact: 'A standard deck has 52 cards corresponding to the 52 weeks of the year.'
  },
  {
    clue: '"Mount Olympus deities"',
    themeWord: 'MYTHS',
    words: ['APOLLO', 'ARES', 'ATHENA', 'HADES', 'HERMES', 'ZEUS'],
    difficulty: 'Medium',
    funFact: 'Hermes was the Olympian herald as well as the patron god of travelers, gamblers, and commerce.'
  },
  {
    clue: '"Campfire autumn treats"',
    themeWord: 'SMORES',
    words: ['APPLE', 'CIDER', 'GRAHAM', 'MALLOW', 'PUMPKIN', 'SPICE'],
    difficulty: 'Easy',
    funFact: 'The first official s\'mores recipe was published in the 1927 Girl Scouts handbook.'
  },
  {
    clue: '"In the carpenter\'s toolbox"',
    themeWord: 'TOOLS',
    words: ['CHISEL', 'DRILL', 'HAMMER', 'LEVEL', 'PLIERS', 'WRENCH'],
    difficulty: 'Easy',
    funFact: 'Spirit levels were invented in 1661 by French polymath Melchisédech Thévenot using alcohol bubbles.'
  },
  {
    clue: '"Spices from the silk road"',
    themeWord: 'SPICES',
    words: ['CARDAMOM', 'CLOVE', 'CUMIN', 'NUTMEG', 'PAPRIKA', 'SAFFRON'],
    difficulty: 'Medium',
    funFact: 'Saffron is the world\'s costliest spice because each flower produces only three delicate stigmas.'
  },
  {
    clue: '"Wild savannah safari"',
    themeWord: 'AFRICA',
    words: ['CHEETAH', 'ELEPHANT', 'GIRAFFE', 'HYENA', 'LEOPARD', 'ZEBRA'],
    difficulty: 'Easy',
    funFact: 'Cheetahs can accelerate from 0 to 60 miles per hour in just three seconds.'
  },
  {
    clue: '"Classic sandwich counter"',
    themeWord: 'LUNCH',
    words: ['BLT', 'CLUB', 'CUBAN', 'PANINI', 'REUBEN', 'SUB'],
    difficulty: 'Easy',
    funFact: 'The Reuben sandwich was invented in Omaha, Nebraska during a weekly poker game at the Blackstone Hotel.'
  },
  {
    clue: '"Garden flower blooms"',
    themeWord: 'FLORAL',
    words: ['DAHLIA', 'LILY', 'ORCHID', 'PEONY', 'ROSE', 'TULIP'],
    difficulty: 'Easy',
    funFact: 'During the Dutch "Tulip Mania" of 1637, single tulip bulbs sold for more than ten times an artisan’s annual wage.'
  },
  {
    clue: '"World currencies in trade"',
    themeWord: 'MONEY',
    words: ['DOLLAR', 'EURO', 'POUND', 'RAND', 'RUPEE', 'YEN'],
    difficulty: 'Medium',
    funFact: 'The British pound sterling is the world\'s oldest currency still in continuous circulation, over 1,200 years old.'
  },
  {
    clue: '"Winter jacket weather"',
    themeWord: 'COATS',
    words: ['ANORAK', 'BLAZER', 'PARKA', 'PEACOAT', 'PONCHO', 'TRENCH'],
    difficulty: 'Medium',
    funFact: 'The trench coat was originally designed by Thomas Burberry in 1914 for British officers serving in World War I.'
  },
  {
    clue: '"Deciduous forest trees"',
    themeWord: 'TIMBER',
    words: ['BIRCH', 'CEDAR', 'ELM', 'MAPLE', 'OAK', 'WILLOW'],
    difficulty: 'Easy',
    funFact: 'A single mature oak tree can produce up to 10,000 acorns in a single bumper year.'
  },
  {
    clue: '"Berry patch basket"',
    themeWord: 'BERRY',
    words: ['CHERRY', 'CURRANT', 'FIG', 'GRAPE', 'PLUM', 'RAISIN'],
    difficulty: 'Easy',
    funFact: 'Botanically speaking, bananas, watermelons, and tomatoes are true berries, while strawberries and raspberries are not.'
  },
  {
    clue: '"Weather report radar"',
    themeWord: 'STORMS',
    words: ['BLIZZARD', 'CYCLONE', 'DRIZZLE', 'FOG', 'HAIL', 'TYPHOON'],
    difficulty: 'Medium',
    funFact: 'A typical hurricane releases heat energy equivalent to a 10-megaton nuclear bomb exploding every 20 minutes.'
  },
  {
    clue: '"Classic cocktail lounge"',
    themeWord: 'SPIRITS',
    words: ['GIMLET', 'MANHATTAN', 'MARTINI', 'MOJITO', 'NEGRONI', 'SAZERAC'],
    difficulty: 'Medium',
    funFact: 'The Sazerac, invented in New Orleans in the 1830s, is officially designated as the city\'s official cocktail.'
  },
  {
    clue: '"Farmyard morning wake-up"',
    themeWord: 'RANCH',
    words: ['CATTLE', 'CHICKEN', 'DONKEY', 'GOAT', 'HORSE', 'SHEEP'],
    difficulty: 'Easy',
    funFact: 'Goats have rectangular pupils that give them a panoramic 320-degree field of vision.'
  },
  {
    clue: '"Things that keep time"',
    themeWord: 'CLOCKS',
    words: ['ALARM', 'CHRONO', 'DIAL', 'HOURGLASS', 'PENDULUM', 'SUNDIAL'],
    difficulty: 'Medium',
    funFact: 'Christiaan Huygens invented the pendulum clock in 1656, increasing timekeeping accuracy from 15 minutes to 15 seconds a day.'
  },
  {
    clue: '"Inside the artist\'s studio"',
    themeWord: 'CANVAS',
    words: ['BRUSH', 'CHARCOAL', 'EASEL', 'GESSO', 'PALETTE', 'PASTEL'],
    difficulty: 'Medium',
    funFact: 'Leonardo da Vinci took more than 14 years to paint the lips of the Mona Lisa.'
  },
  {
    clue: '"Essential kitchen cookware"',
    themeWord: 'KITCHEN',
    words: ['COLANDER', 'DUTCH', 'GRIDDLE', 'KETTLE', 'SKILLET', 'WOK'],
    difficulty: 'Easy',
    funFact: 'Cast iron cookware can retain heat so effectively that it continues cooking food even after the burner is switched off.'
  },
  {
    clue: '"Prehistoric dinosaur titans"',
    themeWord: 'FOSSIL',
    words: ['ANKYLO', 'BRACHIO', 'RAPTOR', 'SPINO', 'STEGO', 'TREX'],
    difficulty: 'Medium',
    funFact: 'The Stegosaurus had a brain roughly the size of a walnut, despite weighing over 5 tons.'
  },
  {
    clue: '"Flight of backyard birds"',
    themeWord: 'AVIAN',
    words: ['CANARY', 'FINCH', 'JAY', 'ROBIN', 'SPARROW', 'WARBLER'],
    difficulty: 'Easy',
    funFact: 'A hummingbird\'s heart can beat more than 1,200 times per minute during intense flight.'
  },
  {
    clue: '"At the circus big top"',
    themeWord: 'CIRCUS',
    words: ['ACROBAT', 'CLOWN', 'JUGGLER', 'RINGMASTER', 'TRAPEZE', 'UNICYCLE'],
    difficulty: 'Easy',
    funFact: 'Philip Astley is considered the "father of modern circus," establishing the first 42-foot diameter riding ring in London in 1768.'
  },
  {
    clue: '"Under the microscope lab"',
    themeWord: 'BIOLOGY',
    words: ['AMOEBA', 'BACTERIA', 'CELL', 'FUNGUS', 'NUCLEUS', 'VIRUS'],
    difficulty: 'Medium',
    funFact: 'Antonie van Leeuwenhoek first observed microorganisms in pond water in 1674, calling them "animalcules."'
  },
  {
    clue: '"Major organs of the human body"',
    themeWord: 'ANATOMY',
    words: ['BRAIN', 'HEART', 'KIDNEY', 'LIVER', 'LUNGS', 'STOMACH'],
    difficulty: 'Easy',
    funFact: 'The human liver is the only internal organ capable of naturally regenerating lost tissue.'
  },
  {
    clue: '"Ancient wonders of architecture"',
    themeWord: 'WONDERS',
    words: ['COLOSSUS', 'GARDENS', 'LIGHTHOUSE', 'MAUSOLEUM', 'PYRAMID', 'TEMPLE'],
    difficulty: 'Medium',
    funFact: 'The Great Pyramid of Giza is the only one of the original Seven Wonders of the Ancient World still standing.'
  },
  {
    clue: '"Gems of the solar system"',
    themeWord: 'PLANETS',
    words: ['JUPITER', 'MARS', 'MERCURY', 'NEPTUNE', 'SATURN', 'VENUS'],
    difficulty: 'Easy',
    funFact: 'Venus rotates in the opposite direction to most planets, meaning the Sun rises in the west and sets in the east.'
  },
  {
    clue: '"Sweet tooth confectionery"',
    themeWord: 'SWEETS',
    words: ['CARAMEL', 'FUDGE', 'GUMMY', 'LICORICE', 'NOUGAT', 'TOFFEE'],
    difficulty: 'Easy',
    funFact: 'Licorice root contains glycyrrhizin, a compound that is 50 times sweeter than regular table sugar.'
  },
  {
    clue: '"Modes of public transit"',
    themeWord: 'TRANSIT',
    words: ['BUS', 'FERRY', 'METRO', 'TRAM', 'TROLLEY', 'TUBETRAIN'],
    difficulty: 'Easy',
    funFact: 'The London Underground opened in 1863 as the world\'s very first underground passenger railway.'
  },
  {
    clue: '"In the detective\'s investigation"',
    themeWord: 'MYSTERY',
    words: ['ALIBI', 'CLUE', 'CULPRIT', 'MOTIVE', 'SUSPECT', 'WITNESS'],
    difficulty: 'Medium',
    funFact: 'Arthur Conan Doyle based Sherlock Holmes on Dr. Joseph Bell, his university professor famous for keen observational deduction.'
  },
  {
    clue: '"Campground wilderness gear"',
    themeWord: 'OUTDOOR',
    words: ['CANTEEN', 'COMPASS', 'FLASHLIGHT', 'HAMMOCK', 'LANTERN', 'TENT'],
    difficulty: 'Easy',
    funFact: 'The magnetic compass was invented during the Chinese Han Dynasty around 206 BC using naturally magnetized lodestone.'
  },
  {
    clue: '"Popular pizza parlor toppings"',
    themeWord: 'PIZZERIA',
    words: ['ANCHOVY', 'BASIL', 'MUSHROOM', 'OLIVES', 'PEPPERONI', 'SAUSAGE'],
    difficulty: 'Easy',
    funFact: 'The classic Pizza Margherita was created in 1889 to represent the colors of the Italian flag: red tomato, white mozzarella, green basil.'
  },
  {
    clue: '"Olympic track & field events"',
    themeWord: 'ATHLETE',
    words: ['DECATHLON', 'DISCUS', 'HURDLES', 'JAVELIN', 'RELAY', 'SPRINT'],
    difficulty: 'Medium',
    funFact: 'The discus throw is one of the oldest recorded sporting events, featured in Homer\'s Iliad and the ancient Olympic Games in 708 BC.'
  },
  {
    clue: '"In the royal medieval castle"',
    themeWord: 'FORTRESS',
    words: ['BAILEY', 'DRAWBRIDGE', 'DUNGEON', 'KEEP', 'MOAT', 'TURRET'],
    difficulty: 'Medium',
    funFact: 'Spiral staircases in medieval castles were typically built turning clockwise going up to give defending right-handed swordsmen more room to swing.'
  },
  {
    clue: '"Popular indoor houseplants"',
    themeWord: 'BOTANY',
    words: ['BEGONIA', 'FERN', 'MONSTERA', 'PALM', 'POTHOS', 'SUCCULENT'],
    difficulty: 'Medium',
    funFact: 'The Swiss cheese plant (Monstera deliciosa) produces natural holes in its leaves to withstand high winds in tropical rainforests.'
  },
  {
    clue: '"Famous desert dunes of Earth"',
    themeWord: 'DESERTS',
    words: ['ATACAMA', 'GOBI', 'KALAHARI', 'MOJAVE', 'NAMIB', 'SAHARA'],
    difficulty: 'Medium',
    funFact: 'Parts of the Atacama Desert in Chile have recorded no measurable rainfall for over 400 years.'
  },
  {
    clue: '"Winter warm-up apparel"',
    themeWord: 'KNITWEAR',
    words: ['BEANIE', 'CARDIGAN', 'GLOVES', 'MITTENS', 'SCARF', 'SWEATER'],
    difficulty: 'Easy',
    funFact: 'Cashmere wool comes exclusively from the fine downy undercoat of cashmere goats native to the Himalayan region.'
  },
  {
    clue: '"Tools of the architect"',
    themeWord: 'BLUEPRINT',
    words: ['CALIPER', 'COMPASS', 'DIVIDER', 'PROTRACTOR', 'RULER', 'SCALE'],
    difficulty: 'Medium',
    funFact: 'Blueprints were invented in 1842 by Sir John Herschel using cyanotype photographic contact printing.'
  },
  {
    clue: '"In the wine tasting cellar"',
    themeWord: 'VINEYARD',
    words: ['CABERNET', 'CHARDONNAY', 'MERLOT', 'PINOT', 'RIESLING', 'SYRAH'],
    difficulty: 'Medium',
    funFact: 'Archaeological evidence shows winemaking in Georgia as early as 6000 BC in clay jars called qvevri.'
  },
  {
    clue: '"Deep cave spelunking formations"',
    themeWord: 'CAVERNS',
    words: ['ABYSS', 'CHASM', 'CRYSTAL', 'GROTTO', 'STALACTITE', 'STALAGMITE'],
    difficulty: 'Challenging',
    funFact: 'A simple mnemonic: stalactites hold "tight" to the ceiling; stalagmites "might" reach the roof from the floor.'
  },
  {
    clue: '"Fresh salad bar garden greens"',
    themeWord: 'SALAD',
    words: ['ARUGULA', 'CABBAGE', 'ENDIVE', 'KALE', 'ROMAINE', 'SPINACH'],
    difficulty: 'Easy',
    funFact: 'Ancient Romans and Greeks ate raw lettuce dressed with salt (sal), from which the word "salad" derives.'
  },
  {
    clue: '"Martial arts traditions"',
    themeWord: 'COMBAT',
    words: ['AIKIDO', 'JUDO', 'KARATE', 'KUNGFU', 'TAEKWONDO', 'WRESTLING'],
    difficulty: 'Medium',
    funFact: 'Karate translates from Japanese as "empty hand," emphasizing self-defense without weapons.'
  },
  {
    clue: '"At the airport departure gate"',
    themeWord: 'AVIATION',
    words: ['AIRBUS', 'BOEING', 'CABIN', 'HANGAR', 'PILOT', 'RUNWAY'],
    difficulty: 'Easy',
    funFact: 'The Wright brothers\' historic first powered flight in 1903 lasted just 12 seconds and covered 120 feet.'
  },
  {
    clue: '"In the sewing and tailor kit"',
    themeWord: 'NEEDLEWORK',
    words: ['BOBBIN', 'BUTTON', 'PINCUSHION', 'SCISSORS', 'THIMBLE', 'THREAD'],
    difficulty: 'Easy',
    funFact: 'Bone sewing needles dating back more than 25,000 years have been discovered in Upper Paleolithic archaeological sites.'
  },
  {
    clue: '"Types of cheese on the platter"',
    themeWord: 'FROMAGE',
    words: ['BRIE', 'CHEDDAR', 'FETA', 'GOUDA', 'PARMESAN', 'SWISS'],
    difficulty: 'Easy',
    funFact: 'The holes in Swiss cheese (called "eyes") are caused by carbon dioxide bubbles released by Propionibacterium bacteria during aging.'
  },
  {
    clue: '"Under the hood of an automobile"',
    themeWord: 'ENGINE',
    words: ['BATTERY', 'BRAKES', 'CLUTCH', 'PISTON', 'RADIATOR', 'STARTER'],
    difficulty: 'Medium',
    funFact: 'Karl Benz received the patent for the first modern gasoline-powered automobile in Mannheim, Germany in 1886.'
  },
  {
    clue: '"Types of footwear in the closet"',
    themeWord: 'SHOES',
    words: ['BOOTS', 'LOAFER', 'MULE', 'OXFORD', 'SANDAL', 'SNEAKER'],
    difficulty: 'Easy',
    funFact: 'The term "sneaker" was coined in the late 19th century because rubber soles allowed wearers to walk almost silently.'
  },
  {
    clue: '"At the scientific chemistry bench"',
    themeWord: 'REAGENTS',
    words: ['BEAKER', 'BUNSEN', 'FLASK', 'PIPETTE', 'RETORT', 'TESTTUBE'],
    difficulty: 'Medium',
    funFact: 'The Bunsen burner was perfected in 1855 by Robert Bunsen and his laboratory mechanic Peter Desaga.'
  },
  {
    clue: '"Fresh seafood market catch"',
    themeWord: 'FISHERY',
    words: ['CLAM', 'CRAB', 'LOBSTER', 'MUSSEL', 'OYSTER', 'SHRIMP'],
    difficulty: 'Easy',
    funFact: 'Lobsters can live for over 100 years and do not show signs of aging in the way mammals do.'
  },
  {
    clue: '"Natural natural gemstones and crystals"',
    themeWord: 'MINERALS',
    words: ['AGATE', 'JASPER', 'OPAL', 'QUARTZ', 'TURQUOISE', 'ZIRCON'],
    difficulty: 'Medium',
    funFact: 'Opals contain up to 20% water trapped within their microscopic silica sphere structure.'
  },
  {
    clue: '"Things in the solar system orbit"',
    themeWord: 'ORBITS',
    words: ['ASTEROID', 'DEBRIS', 'GRAVITY', 'MOON', 'PROBE', 'SATELLITE'],
    difficulty: 'Easy',
    funFact: 'Sputnik 1 was launched by the Soviet Union on October 4, 1957, becoming the first human-made satellite to orbit Earth.'
  },
  {
    clue: '"In the breakfast cereal bowl"',
    themeWord: 'GRAINS',
    words: ['BARLEY', 'BRAN', 'GRANOLA', 'MUESLI', 'OATS', 'WHEAT'],
    difficulty: 'Easy',
    funFact: 'Granola was invented in Dansville, New York in 1863 by Dr. James Caleb Jackson as a health food.'
  },
  {
    clue: '"Tropical rainforest animals"',
    themeWord: 'JUNGLE',
    words: ['JAGUAR', 'MONKEY', 'OCELOT', 'SLOTH', 'TAPIR', 'TOUCAN'],
    difficulty: 'Easy',
    funFact: 'Sloths move so slowly that green algae actually grows on their fur, providing natural camouflage.'
  },
  {
    clue: '"At the post office counter"',
    themeWord: 'MAILBOX',
    words: ['ENVELOPE', 'LETTER', 'PARCEL', 'POSTCARD', 'STAMP', 'ZIPCODE'],
    difficulty: 'Easy',
    funFact: 'The world\'s first adhesive postage stamp was the Penny Black, issued in Great Britain in May 1840.'
  },
  {
    clue: '"Musical tempo markings"',
    themeWord: 'TEMPOS',
    words: ['ADAGIO', 'ALLEGRETTO', 'ALLEGRO', 'ANDANTE', 'LARGO', 'PRESTO'],
    difficulty: 'Challenging',
    funFact: 'Italian became the universal language of musical notation in the 17th century when Italian composers dominated European music.'
  },
  {
    clue: '"In the cocktail bartender\'s garnish"',
    themeWord: 'GARNISH',
    words: ['CHERRY', 'CINNAMON', 'MINT', 'NUTMEG', 'OLIVE', 'TWIST'],
    difficulty: 'Medium',
    funFact: 'Maraschino cherries originated in Croatia, where sour Marasca cherries were preserved in Maraschino liqueur.'
  },
  {
    clue: '"In the artist\'s paint set"',
    themeWord: 'PIGMENTS',
    words: ['ACRYLIC', 'CHARCOAL', 'GOUACHE', 'INK', 'OIL', 'TEMPERA'],
    difficulty: 'Medium',
    funFact: 'Egg tempera was the primary method of painting until oil paint took over in the 15th century.'
  },
  {
    clue: '"Essential computer peripherals"',
    themeWord: 'HARDWARE',
    words: ['KEYBOARD', 'MONITOR', 'MOUSE', 'PRINTER', 'SCANNER', 'WEBCAM'],
    difficulty: 'Easy',
    funFact: 'Douglas Engelbart invented the first computer mouse in 1964; it was carved from a block of wood with two wheels.'
  },
  {
    clue: '"Wild birds of prey"',
    themeWord: 'RAPTORS',
    words: ['BUZZARD', 'EAGLE', 'FALCON', 'HARRIER', 'HAWK', 'KESTREL'],
    difficulty: 'Medium',
    funFact: 'The peregrine falcon is the fastest animal on the planet, reaching diving speeds over 240 miles per hour.'
  },
  {
    clue: '"In the photographer\'s camera bag"',
    themeWord: 'CAMERA',
    words: ['APERTURE', 'FILTER', 'FLASH', 'LENS', 'SHUTTER', 'TRIPOD'],
    difficulty: 'Medium',
    funFact: 'The word "photography" comes from Greek roots meaning "drawing with light."'
  },
  {
    clue: '"Mythological fantasy creatures"',
    themeWord: 'BEASTS',
    words: ['CENTAUR', 'DRAGON', 'GRIFFIN', 'PEGASUS', 'PHOENIX', 'UNICORN'],
    difficulty: 'Easy',
    funFact: 'The unicorn is the official national animal of Scotland, symbolizing purity and unconquerable strength.'
  },
  {
    clue: '"Types of trees in the park"',
    themeWord: 'FORESTRY',
    words: ['ASH', 'BEECH', 'CHESTNUT', 'CYPRESS', 'POPLAR', 'SYCAMORE'],
    difficulty: 'Easy',
    funFact: 'Bristlecone pine trees in California\'s White Mountains are among the oldest living organisms on Earth, over 4,800 years old.'
  },
  {
    clue: '"In the doctor\'s clinic room"',
    themeWord: 'CLINICAL',
    words: ['BANDAGE', 'GAUZE', 'SCALPEL', 'SPLINT', 'STETHOSCOPE', 'SYRINGE'],
    difficulty: 'Medium',
    funFact: 'René Laennec invented the stethoscope in Paris in 1816 using a rolled-up wooden tube.'
  },
  {
    clue: '"Popular ballroom dancing styles"',
    themeWord: 'BALLROOM',
    words: ['FOXTROT', 'JIVE', 'PASODOBLE', 'RUMBA', 'TANGO', 'WALTZ'],
    difficulty: 'Medium',
    funFact: 'When the waltz first appeared in Vienna around 1780, it was condemned as scandalous because partners danced in close contact.'
  },
  {
    clue: '"Things found on the beach"',
    themeWord: 'SHORELINE',
    words: ['CONCH', 'DRIFTWOOD', 'KELP', 'SAND', 'SEAGULL', 'SHELL'],
    difficulty: 'Easy',
    funFact: 'The sound you hear when holding a conch shell to your ear is ambient room noise echoing and resonating inside the shell chamber.'
  },
  {
    clue: '"Things inside a school desk"',
    themeWord: 'STATIONERY',
    words: ['ERASER', 'GLUE', 'HIGHLIGHTER', 'MARKER', 'PENCIL', 'RULER'],
    difficulty: 'Easy',
    funFact: 'Hymen Lipman patented the first pencil with an attached eraser in Philadelphia in 1858.'
  },
  {
    clue: '"In the morning gym workout"',
    themeWord: 'FITNESS',
    words: ['BARBELL', 'CARDIO', 'DUMBBELL', 'KETTLEBELL', 'ROWER', 'TREADMILL'],
    difficulty: 'Easy',
    funFact: 'The first treadmill was patented in 1818 by English civil engineer Sir William Cubitt as a prison labor device.'
  },
  {
    clue: '"In the magical wizard spellbook"',
    themeWord: 'SORCERY',
    words: ['CHARM', 'CURSE', 'HEX', 'INCANTATION', 'POTION', 'WAND'],
    difficulty: 'Medium',
    funFact: 'The word "abracadabra" was first recorded in the 2nd century AD by Roman physician Serenus Sammonicus as an antidote to fever.'
  },
  {
    clue: '"Inside the bank vault"',
    themeWord: 'TREASURE',
    words: ['BULLION', 'COINS', 'DEPOSIT', 'GOLD', 'LOCKER', 'SAFEDEPOSIT'],
    difficulty: 'Medium',
    funFact: 'Fort Knox in Kentucky holds over 147 million ounces of gold bullion, about half of the United States Treasury\'s gold reserves.'
  },
  {
    clue: '"Fresh herbs in the garden pot"',
    themeWord: 'HERBOLOGY',
    words: ['BASIL', 'CILANTRO', 'OREGANO', 'ROSEMARY', 'SAGE', 'THYME'],
    difficulty: 'Easy',
    funFact: 'In ancient Greece, rosemary was woven into wreaths worn by students to stimulate memory during examinations.'
  },
  {
    clue: '"Winter snow ski resort fun"',
    themeWord: 'ALPINE',
    words: ['CHAIRLIFT', 'CHALET', 'GOGGLES', 'HELMET', 'POLES', 'SLOPE'],
    difficulty: 'Easy',
    funFact: 'The earliest known skis date back over 9,000 years, discovered in bog peat in northern Russia.'
  },
  {
    clue: '"On the breakfast pancake table"',
    themeWord: 'BRUNCH',
    words: ['BACON', 'BUTTER', 'CREPE', 'PANCAKE', 'SYRUP', 'WAFFLE'],
    difficulty: 'Easy',
    funFact: 'It takes approximately 40 gallons of maple sap from sugar maple trees to produce just one gallon of pure maple syrup.'
  },
  {
    clue: '"In the amusement park midway"',
    themeWord: 'CARNIVAL',
    words: ['CAROUSEL', 'COASTER', 'COTTONCANDY', 'DROP', 'FERRIS', 'SLIDE'],
    difficulty: 'Easy',
    funFact: 'George Washington Gale Ferris Jr. designed the first Ferris Wheel for the 1893 World\'s Columbian Exposition in Chicago.'
  },
  {
    clue: '"Deep dark outer space mysteries"',
    themeWord: 'ASTRONOMY',
    words: ['BLACKHOLE', 'COSMIC', 'ECLIPSE', 'GRAVITON', 'QUASAR', 'SUPERNOVA'],
    difficulty: 'Challenging',
    funFact: 'A teaspoon of material from a collapsed neutron star would weigh approximately 6 billion tons on Earth.'
  },
  {
    clue: '"In the Italian trattoria kitchen"',
    themeWord: 'TRATTORIA',
    words: ['ANTIPASTO', 'BRUSCHETTA', 'CALZONE', 'CANNOLI', 'RISOTTO', 'TIRAMISU'],
    difficulty: 'Easy',
    funFact: 'Tiramisu literally translates from Italian as "pick me up" or "cheer me up," referring to its shot of espresso.'
  },
  {
    clue: '"Things with buttons and zippers"',
    themeWord: 'APPAREL',
    words: ['CARDIGAN', 'DUNGAREES', 'HOODIE', 'JACKET', 'JEANS', 'VEST'],
    difficulty: 'Easy',
    funFact: 'Levi Strauss and Jacob Davis were granted the patent for copper-riveted denim work trousers in 1873.'
  },
  {
    clue: '"Under the hood of an electric car"',
    themeWord: 'ELECTRIC',
    words: ['BATTERY', 'CHARGER', 'INVERTER', 'MOTOR', 'PLUG', 'VOLTAGE'],
    difficulty: 'Medium',
    funFact: 'Electric vehicles were actually popular in the late 19th and early 20th centuries, before the discovery of cheap Texas oil.'
  },
  {
    clue: '"In the morning cereal pantry"',
    themeWord: 'BREAKFAST',
    words: ['CEREAL', 'FLAKES', 'GRANOLA', 'OATMEAL', 'PUFFS', 'TOAST'],
    difficulty: 'Easy',
    funFact: 'Corn flakes were invented by Dr. John Harvey Kellogg in 1894 at the Battle Creek Sanitarium in Michigan.'
  },
  {
    clue: '"Precious stones in the royal crown"',
    themeWord: 'CORONATION',
    words: ['DIADEM', 'ORB', 'PLATINUM', 'SCEPTER', 'TIARA', 'VELVET'],
    difficulty: 'Medium',
    funFact: 'St. Edward\'s Crown, used at British coronations, was made in 1661 and weighs nearly five solid pounds.'
  },
  {
    clue: '"In the cozy winter fireplace"',
    themeWord: 'HEARTH',
    words: ['ANDIRON', 'BELLOWS', 'CHIMNEY', 'FIREWOOD', 'KINDLING', 'POKER'],
    difficulty: 'Medium',
    funFact: 'Bellows have been used by blacksmiths and hearth-keepers since ancient Egyptian times around 1500 BC.'
  },
  {
    clue: '"Wild mammals of the Arctic snow"',
    themeWord: 'TUNDRA',
    words: ['CARIBOU', 'FOX', 'HARE', 'NARWHAL', 'POLARBEAR', 'WALRUS'],
    difficulty: 'Medium',
    funFact: 'A polar bear\'s skin beneath its thick coat is actually pitch black to absorb heat from the Arctic sun.'
  },
  {
    clue: '"In the classic toy chest"',
    themeWord: 'PLAYROOM',
    words: ['BLOCKS', 'DOLL', 'KITE', 'MARBLES', 'PUZZLE', 'YOYO'],
    difficulty: 'Easy',
    funFact: 'The yo-yo is one of the oldest known toys in history, depicted on ancient Greek vases dating back to 500 BC.'
  },
  {
    clue: '"Fresh fruits in the summer orchard"',
    themeWord: 'ORCHARD',
    words: ['APRICOT', 'CHERRY', 'FIG', 'PEACH', 'PEAR', 'PLUM'],
    difficulty: 'Easy',
    funFact: 'Peaches, plums, apricots, and cherries all belong to the genus Prunus in the rose family (Rosaceae).'
  },
  {
    clue: '"On the classic diner counter"',
    themeWord: 'DINER',
    words: ['BURGER', 'COFFEE', 'FLOAT', 'FRIES', 'PANCAKES', 'SHAKE'],
    difficulty: 'Easy',
    funFact: 'The American diner originated in 1872 when Walter Scott sold food from a horse-drawn wagon in Providence, Rhode Island.'
  },
  {
    clue: '"Things with wheels on the road"',
    themeWord: 'VEHICLES',
    words: ['BICYCLE', 'BUS', 'MOTORCYCLE', 'SCOOTER', 'TRUCK', 'VAN'],
    difficulty: 'Easy',
    funFact: 'The first modern bicycle with chain drive and equal-sized wheels was the Rover Safety Bicycle, designed in Coventry in 1885.'
  },
  {
    clue: '"In the school science laboratory"',
    themeWord: 'LABORATORY',
    words: ['BALANCE', 'BEAKER', 'BURNER', 'CYLINDER', 'MICROSCOPE', 'PIPETTE'],
    difficulty: 'Medium',
    funFact: 'The periodic table of elements was formulated in 1869 by Russian chemist Dmitri Mendeleev.'
  },
  {
    clue: '"Under the ocean coral reef"',
    themeWord: 'REEFLIFE',
    words: ['ANEMONE', 'CLOWNFISH', 'CORAL', 'EEL', 'RAY', 'TURTLE'],
    difficulty: 'Easy',
    funFact: 'The Great Barrier Reef in Australia is the world\'s largest living structure, visible from outer space.'
  },
  {
    clue: '"In the cozy coffee house menu"',
    themeWord: 'BARISTA',
    words: ['CHAI', 'ESPRESSO', 'FRAPPE', 'LATTE', 'MATCHA', 'STEAMER'],
    difficulty: 'Easy',
    funFact: 'Matcha is powdered green tea that was first prepared in China during the Tang Dynasty and perfected in Japan.'
  },
  {
    clue: '"Things that tell the temperature"',
    themeWord: 'CLIMATE',
    words: ['BAROMETER', 'CELSIUS', 'DEGREE', 'FAHRENHEIT', 'GAUGE', 'MERCURY'],
    difficulty: 'Medium',
    funFact: 'Daniel Gabriel Fahrenheit invented the mercury thermometer in 1714 and the Fahrenheit temperature scale in 1724.'
  },
  {
    clue: '"Musical brass section power"',
    themeWord: 'BRASS',
    words: ['CORNET', 'EUPHONIUM', 'HORN', 'SOUSAPHONE', 'TROMBONE', 'TRUMPET'],
    difficulty: 'Medium',
    funFact: 'The sousaphone was created in 1893 by J.W. Pepper at the request of American march composer John Philip Sousa.'
  },
  {
    clue: '"In the morning farm garden"',
    themeWord: 'PRODUCE',
    words: ['CARROT', 'CUCUMBER', 'LETTUCE', 'ONION', 'RADISH', 'TOMATO'],
    difficulty: 'Easy',
    funFact: 'Carrots were originally purple, red, and yellow; Dutch growers developed orange carrots in the 17th century.'
  },
  {
    clue: '"Things with keys and locks"',
    themeWord: 'SECURITY',
    words: ['BOLT', 'CHAIN', 'DEADBOLT', 'LATCH', 'PADLOCK', 'SAFE'],
    difficulty: 'Easy',
    funFact: 'Linus Yale Jr. invented the modern pin tumbler cylinder lock in 1865, still used in homes today.'
  },
  {
    clue: '"Things that sail through the wind"',
    themeWord: 'BREEZE',
    words: ['BALLOON', 'GLIDER', 'KITE', 'PARACHUTE', 'SAIL', 'WINDMILL'],
    difficulty: 'Easy',
    funFact: 'The earliest known windmills were built in Sistan (modern Iran/Afghanistan) in the 7th century AD to grind grain.'
  },
  {
    clue: '"Sweet bakery pastry treats"',
    themeWord: 'DESSERTS',
    words: ['BROWNIE', 'CUPCAKE', 'MACARON', 'MUFFIN', 'TART', 'TURNOVER'],
    difficulty: 'Easy',
    funFact: 'The French macaron was created in Venetian monasteries in the 8th century before reaching Paris in the 1830s.'
  },
  {
    clue: '"In the autumn apple orchard"',
    themeWord: 'CIDERY',
    words: ['APPLE', 'BASKET', 'CRISP', 'FRITTER', 'PIE', 'PRESS'],
    difficulty: 'Easy',
    funFact: 'There are over 7,500 varieties of apples grown throughout the world.'
  },
  {
    clue: '"Classic tabletop pub games"',
    themeWord: 'PUBGAMES',
    words: ['BILLIARDS', 'DARTS', 'DOMINOES', 'FOOSBALL', 'PINBALL', 'POOL'],
    difficulty: 'Easy',
    funFact: 'The standard dartboard numbering system was devised in 1896 by Brian Gamlin, a carpenter from Lancashire.'
  },
  {
    clue: '"In the astronomer\'s observatory"',
    themeWord: 'SKYWATCH',
    words: ['ASTROLABE', 'DOME', 'EYEPIECE', 'LENS', 'MIRROR', 'TELESCOPE'],
    difficulty: 'Medium',
    funFact: 'Galileo Galilei was the first person to turn a telescope toward the night sky in 1609, discovering Jupiter\'s four largest moons.'
  },
  {
    clue: '"On the campfire barbecue grill"',
    themeWord: 'BARBECUE',
    words: ['BRISKET', 'BURGER', 'CHARCOAL', 'RIBS', 'SAUSAGE', 'STEAK'],
    difficulty: 'Easy',
    funFact: 'The word "barbecue" comes from the Taíno word "barbacoa," describing a wooden framework for smoking meat over embers.'
  },
  {
    clue: '"In the botanical conservatory"',
    themeWord: 'GREENHOUSE',
    words: ['BROMELIAD', 'FERN', 'IVY', 'MOSS', 'ORCHID', 'PALM'],
    difficulty: 'Medium',
    funFact: 'The Palm House at Kew Gardens in London, built in 1844, was the world\'s first large-scale structural cast iron glasshouse.'
  },
  {
    clue: '"Things you find in a museum"',
    themeWord: 'EXHIBIT',
    words: ['ARTIFACT', 'FOSSIL', 'MUMMY', 'PAINTING', 'RELIC', 'STATUE'],
    difficulty: 'Easy',
    funFact: 'The Ashmolean Museum in Oxford, founded in 1683, is considered the world\'s first modern university museum.'
  },
  {
    clue: '"In the winter ski lodge fireplace"',
    themeWord: 'FIRESIDE',
    words: ['BLANKET', 'CACAO', 'EMBER', 'HEARTH', 'KINDLING', 'LOG'],
    difficulty: 'Easy',
    funFact: 'Hot chocolate was originally a bitter frothy drink brewed with chili peppers by the ancient Olmec and Maya civilizations.'
  },
  {
    clue: '"In the evening night sky show"',
    themeWord: 'AURORA',
    words: ['BOREALIS', 'FLARE', 'GLOW', 'LIGHTS', 'MAGNETIC', 'SOLAR'],
    difficulty: 'Medium',
    funFact: 'The Northern Lights (Aurora Borealis) occur when charged particles from solar wind collide with gases in Earth\'s upper atmosphere.'
  },
  {
    clue: '"In the classic library stacks"',
    themeWord: 'ARCHIVES',
    words: ['ATLAS', 'CATALOG', 'ENCYCLOPEDIA', 'INDEX', 'MANUSCRIPT', 'VOLUME'],
    difficulty: 'Medium',
    funFact: 'The Library of Alexandria in ancient Egypt aimed to collect a copy of every book in the known world.'
  },
  {
    clue: '"On the artist\'s color palette wheel"',
    themeWord: 'COLORS',
    words: ['AMBER', 'CRIMSON', 'EMERALD', 'INDIGO', 'MAGENTA', 'VIOLET'],
    difficulty: 'Easy',
    funFact: 'Sir Isaac Newton created the first color wheel in 1666 after splitting white light through a glass prism.'
  },
  {
    clue: '"In the musical percussion rack"',
    themeWord: 'DRUMS',
    words: ['BONGO', 'CONGA', 'CYMBAL', 'SNARE', 'TIMPANI', 'TRIANGLE'],
    difficulty: 'Medium',
    funFact: 'Timpani are unique drums because their pitch can be tuned precisely using foot pedals that alter head tension.'
  },
  {
    clue: '"Things that grow in the garden soil"',
    themeWord: 'VEGETABLE',
    words: ['BEET', 'CELERY', 'GARLIC', 'PARSNIP', 'POTATO', 'TURNIP'],
    difficulty: 'Easy',
    funFact: 'Potatoes were first cultivated by indigenous farmers in the high Andes of Peru around 8000 BC.'
  },
  {
    clue: '"Under the big circus tent lights"',
    themeWord: 'SHOWTIME',
    words: ['ACROBAT', 'CLOWN', 'HOOP', 'JUGGLER', 'RINGMASTER', 'TRAPEZE'],
    difficulty: 'Easy',
    funFact: 'The word "circus" comes from the Latin word for circle, describing the circular arena where equestrian displays took place.'
  },
  {
    clue: '"Things that keep warm in winter"',
    themeWord: 'WARMTH',
    words: ['BLANKET', 'DOWN', 'FLANNEL', 'FLEECE', 'HEATER', 'WOOL'],
    difficulty: 'Easy',
    funFact: 'Wool fibers have a natural crimp that creates millions of tiny air pockets, making it one of nature\'s best thermal insulators.'
  },
  {
    clue: '"In the captain\'s sea navigation"',
    themeWord: 'SEAFARING',
    words: ['ANCHOR', 'COMPASS', 'HELM', 'RUDDER', 'SAIL', 'SEXTANT'],
    difficulty: 'Medium',
    funFact: 'The marine sextant was invented in 1757 by John Campbell, allowing sailors to measure celestial latitude with precision.'
  },
  {
    clue: '"Sweet chilled summer desserts"',
    themeWord: 'GELATO',
    words: ['CONE', 'CUSTARD', 'FROZEN', 'PARFAIT', 'SHERBET', 'SUNDAE'],
    difficulty: 'Easy',
    funFact: 'Gelato contains less air and less butterfat than traditional ice cream, giving it a denser and richer flavor.'
  },
  {
    clue: '"In the tropical island lagoon"',
    themeWord: 'LAGOON',
    words: ['ATOLL', 'CORAL', 'MANTA', 'PALM', 'SANDBAR', 'SURF'],
    difficulty: 'Easy',
    funFact: 'An atoll is a ring-shaped coral reef encircling a central lagoon, formed around a submerged volcanic island.'
  },
  {
    clue: '"In the woodworking master\'s shop"',
    themeWord: 'CARPENTRY',
    words: ['CHISEL', 'CLAMP', 'LATHE', 'MALLET', 'PLANE', 'SAW'],
    difficulty: 'Medium',
    funFact: 'Hand planes dating back to Roman Pompeii have been unearthed with iron cutting blades seated in wooden stocks.'
  },
  {
    clue: '"Things that soar in the sky"',
    themeWord: 'FLIGHT',
    words: ['BIRD', 'BOEING', 'DRONE', 'EAGLE', 'GLIDER', 'KITE'],
    difficulty: 'Easy',
    funFact: 'The golden eagle can dive through the air at speeds exceeding 150 miles per hour when hunting prey.'
  },
  {
    clue: '"Inside the jewelry case display"',
    themeWord: 'BIJOUX',
    words: ['BRACELET', 'BROOCH', 'LOCKET', 'NECKLACE', 'PENDANT', 'RING'],
    difficulty: 'Easy',
    funFact: 'The earliest known jewelry was made of pierced sea snail shells discovered in a cave in Morocco dating back 82,000 years.'
  },
  {
    clue: '"Fresh green herbs for cooking"',
    themeWord: 'SEASONING',
    words: ['CHIVES', 'DILL', 'MINT', 'PARSLEY', 'TARRAGON', 'THYME'],
    difficulty: 'Easy',
    funFact: 'Parsley was used in ancient Rome as a breath freshener and decorative table border.'
  },
  {
    clue: '"In the morning country bakery"',
    themeWord: 'BREADS',
    words: ['BAGUETTE', 'CHALLAH', 'CIABATTA', 'FOCACCIA', 'PITA', 'SOURDOUGH'],
    difficulty: 'Easy',
    funFact: 'Sourdough baking is the oldest form of leavened bread, utilizing wild airborne yeasts and lactobacilli bacteria.'
  },
  {
    clue: '"Things in the galaxy night sky"',
    themeWord: 'UNIVERSE',
    words: ['ASTEROID', 'COMET', 'GALAXY', 'METEOR', 'NEBULA', 'PLANET'],
    difficulty: 'Easy',
    funFact: 'The Milky Way galaxy is estimated to contain between 100 billion and 400 billion stars.'
  },
  {
    clue: '"In the classic parlor game room"',
    themeWord: 'LEISURE',
    words: ['CHESS', 'CRIB', 'DARTS', 'DOMINO', 'SCRABBLE', 'SHUFFLE'],
    difficulty: 'Easy',
    funFact: 'Chess originated in northern India in the 6th century AD as chaturanga, representing four military branches.'
  },
  {
    clue: '"Things that measure distance and size"',
    themeWord: 'METRICS',
    words: ['CALIPER', 'FATHOM', 'INCH', 'METER', 'MICRON', 'YARD'],
    difficulty: 'Medium',
    funFact: 'A "fathom" was originally defined as the span of a man\'s outstretched arms, standardized to exactly six feet.'
  },
  {
    clue: '"Things in the detective\'s file"',
    themeWord: 'SLEUTH',
    words: ['ALIBI', 'BADGE', 'DOSSIER', 'EVIDENCE', 'FINGERPRINT', 'MOTIVE'],
    difficulty: 'Medium',
    funFact: 'Sir Francis Galton published the first scientific study on fingerprint analysis in London in 1892.'
  },
  {
    clue: '"In the sweet orchard harvest"',
    themeWord: 'FRUITS',
    words: ['APPLE', 'CHERRY', 'FIG', 'GRAPE', 'PEACH', 'PEAR'],
    difficulty: 'Easy',
    funFact: 'Apples float in water because roughly 25% of their total volume consists of trapped air.'
  },
  {
    clue: '"Things that swim in cold freshwater"',
    themeWord: 'RIVERBED',
    words: ['BASS', 'CATFISH', 'PERCH', 'PIKE', 'SALMON', 'TROUT'],
    difficulty: 'Easy',
    funFact: 'Atlantic salmon can leap up to 12 feet into the air to navigate raging waterfalls during their spawning journey.'
  },
  {
    clue: '"In the artist\'s drawing sketchpad"',
    themeWord: 'SKETCHING',
    words: ['CHALK', 'CHARCOAL', 'CRAYON', 'GRAPHITE', 'INK', 'PASTEL'],
    difficulty: 'Easy',
    funFact: 'Graphite was first discovered in Borrowdale, England in the 1500s when a storm uprooted trees to reveal the dark deposit.'
  },
  {
    clue: '"In the morning cereal pantry"',
    themeWord: 'GRANARY',
    words: ['BARLEY', 'MILLET', 'OATS', 'QUINOA', 'RICE', 'RYE'],
    difficulty: 'Easy',
    funFact: 'Quinoa was revered as the "mother of all grains" by the ancient Inca civilization in the Andes.'
  },
  {
    clue: '"Things that fly through space"',
    themeWord: 'SPACEFLIGHT',
    words: ['CAPSULE', 'LANDER', 'ORBITER', 'PROBE', 'ROVER', 'SHUTTLE'],
    difficulty: 'Medium',
    funFact: 'Voyager 1, launched in 1977, is the most distant human-made object from Earth, traveling through interstellar space.'
  },
  {
    clue: '"In the sweet confectionery shop"',
    themeWord: 'CHOCOLATIER',
    words: ['BONBON', 'FUDGE', 'GANACHE', 'PRALINE', 'TAFFY', 'TRUFFLE'],
    difficulty: 'Medium',
    funFact: 'Chocolate truffles are named after the prized subterranean fungal truffles due to their similar rustic shape.'
  },
  {
    clue: '"In the royal coronation crown jewels"',
    themeWord: 'ROYALTY',
    words: ['DIADEM', 'ERMINE', 'ORB', 'ROBE', 'SCEPTER', 'THRONE'],
    difficulty: 'Medium',
    funFact: 'Ermine trim on royal coronation robes is made from the white winter coat of the stoat.'
  },
  {
    clue: '"Things with pages in a schoolroom"',
    themeWord: 'TEXTBOOK',
    words: ['ATLAS', 'BINDER', 'DIARY', 'MANUAL', 'NOTEBOOK', 'PRIMER'],
    difficulty: 'Easy',
    funFact: 'The word "atlas" for a collection of maps stems from the mythological Titan Atlas holding the celestial spheres.'
  },
  {
    clue: '"On the evening symphony stage"',
    themeWord: 'CONCERT',
    words: ['BATON', 'MAESTRO', 'OVERTURE', 'PODIUM', 'SCORE', 'SOLOIST'],
    difficulty: 'Medium',
    funFact: 'Before the modern wooden conducting baton was adopted in the 19th century, conductors pounded heavy staves on the floor.'
  },
  {
    clue: '"In the cozy winter hearth fire"',
    themeWord: 'KINDLE',
    words: ['ASH', 'BLAZE', 'CHAR', 'CINDER', 'EMBER', 'SPARK'],
    difficulty: 'Easy',
    funFact: 'Sparks from burning hardwood wood can reach temperatures exceeding 1,200 degrees Fahrenheit.'
  },
  {
    clue: '"Things you wear on your hands"',
    themeWord: 'GLOVES',
    words: ['GAUNTLET', 'MITTENS', 'MUFF', 'PADDED', 'SUEDE', 'WRISTLET'],
    difficulty: 'Easy',
    funFact: 'In medieval Europe, throwing down a gauntlet was a formal challenge to a duel.'
  },
  {
    clue: '"On the summer tennis lawn court"',
    themeWord: 'TENNIS',
    words: ['ACE', 'DEUCE', 'FAULT', 'LOB', 'RACKET', 'VOLLEY'],
    difficulty: 'Easy',
    funFact: 'The score "love" in tennis is thought to derive from the French word "l\'oeuf" (egg), representing a zero on the board.'
  },
  {
    clue: '"In the secret spy dossier"',
    themeWord: 'ESPIONAGE',
    words: ['AGENT', 'CIPHER', 'CODE', 'COVERT', 'DECOY', 'MICROFILM'],
    difficulty: 'Medium',
    funFact: 'During World War II, Bletchley Park cryptanalysts used the Enigma-busting Bombe machines to decrypt Axis codes.'
  },
  {
    clue: '"In the botanical apothecary herb shop"',
    themeWord: 'APOTHECARY',
    words: ['ALOE', 'CHAMOMILE', 'GINSENG', 'LAVENDER', 'PEPPERMINT', 'VALERIAN'],
    difficulty: 'Medium',
    funFact: 'Lavender was used by ancient Romans to scent communal baths, giving it its name from the Latin "lavare" (to wash).'
  },
  {
    clue: '"Things that keep warm in cold weather"',
    themeWord: 'COMFORTER',
    words: ['BLANKET', 'DUVET', 'FEATHER', 'FLANNEL', 'QUILT', 'THROWS'],
    difficulty: 'Easy',
    funFact: 'Eiderdown, gathered from the nests of wild Arctic eider ducks, is considered the warmest and softest natural down on Earth.'
  },
  {
    clue: '"In the ancient pharaoh\'s pyramid tomb"',
    themeWord: 'DYNASTY',
    words: ['AMULET', 'ANUBIS', 'BARK', 'MUMMY', 'PAPYRUS', 'SCARAB'],
    difficulty: 'Medium',
    funFact: 'The Rosetta Stone, discovered in 1799, allowed Jean-François Champollion to decipher ancient Egyptian hieroglyphs in 1822.'
  },
  {
    clue: '"On the morning breakfast griddle"',
    themeWord: 'SKILLET',
    words: ['BACON', 'EGG', 'HAM', 'HASHBROWNS', 'SAUSAGE', 'TOAST'],
    difficulty: 'Easy',
    funFact: 'Cast iron cookware improves with age as oils bond to the iron at high temperatures, creating a slick natural seasoning.'
  },
  {
    clue: '"Things you find at a carnival fair"',
    themeWord: 'FUNFAIR',
    words: ['ARCADE', 'BOOTH', 'CAROUSEL', 'FERRIS', 'MIDWAY', 'POPCORN'],
    difficulty: 'Easy',
    funFact: 'Cotton candy was patented in 1897 by dentist William Morrison and confectioner John C. Wharton under the name "Fairy Floss."'
  },
  {
    clue: '"In the deep underground coal mine"',
    themeWord: 'MINING',
    words: ['CANARY', 'CART', 'HELMET', 'LAMP', 'PICKAXE', 'TUNNEL'],
    difficulty: 'Medium',
    funFact: 'Canaries were used in coal mines as early warning systems for toxic gases until electronic detectors replaced them in 1986.'
  },
  {
    clue: '"Things that tell the time of day"',
    themeWord: 'TIMEPIECE',
    words: ['CHRONOMETER', 'CLOCK', 'DIAL', 'HOURGLASS', 'PENDULUM', 'WATCH'],
    difficulty: 'Medium',
    funFact: 'John Harrison invented the marine chronometer in the 18th century, finally solving the great longitude problem at sea.'
  },
  {
    clue: '"Things that float on the water surface"',
    themeWord: 'BUOYANT',
    words: ['BARGE', 'CANOE', 'FLOAT', 'KAYAK', 'RAFT', 'YACHT'],
    difficulty: 'Easy',
    funFact: 'Archimedes discovered his principle of buoyancy while taking a bath in Syracuse around 250 BC.'
  },
  {
    clue: '"In the master tailor\'s fitting suit"',
    themeWord: 'BESPOKE',
    words: ['CUFF', 'HEM', 'LAPEL', 'LINING', 'SEAM', 'WAISTBAND'],
    difficulty: 'Medium',
    funFact: 'Savile Row in Mayfair, London, has been the global epicenter of bespoke gentlemen\'s tailoring since the late 18th century.'
  },
  {
    clue: '"Things that produce musical sound"',
    themeWord: 'HARMONY',
    words: ['CHORD', 'NOTE', 'PITCH', 'SCALE', 'TUNE', 'VOICE'],
    difficulty: 'Easy',
    funFact: 'Pythagoras discovered that musical harmony is governed by mathematical ratios when listening to blacksmiths\' hammers.'
  },
  {
    clue: '"In the medieval king\'s royal court"',
    themeWord: 'COURTIERS',
    words: ['BARON', 'DUKE', 'EARL', 'KNIGHT', 'LORD', 'VISCOUNT'],
    difficulty: 'Medium',
    funFact: 'The five ranks of the British peerage in descending order are Duke, Marquess, Earl, Viscount, and Baron.'
  },
  {
    clue: '"In the sweet summer fruit orchard"',
    themeWord: 'HARVESTER',
    words: ['APPLE', 'BERRY', 'CHERRY', 'FIG', 'PLUM', 'PEACH'],
    difficulty: 'Easy',
    funFact: 'Wild apple species originated in the Tian Shan mountains of Central Asia, where ancestral forests still grow today.'
  },
  {
    clue: '"Things that make a strong castle wall"',
    themeWord: 'RAMPARTS',
    words: ['BATTLEMENT', 'GATE', 'MOAT', 'PORTCULLIS', 'STONE', 'TOWER'],
    difficulty: 'Medium',
    funFact: 'A portcullis is a heavy vertically-closing wooden or metal grille sliding down grooved tracks to seal a gatehouse.'
  },
  {
    clue: '"Things in the backyard barbecue party"',
    themeWord: 'COOKOUT',
    words: ['BURGER', 'COLESLAW', 'CORN', 'HOTDOG', 'RELISH', 'RIBS'],
    difficulty: 'Easy',
    funFact: 'The hot dog bun was popularized in St. Louis in 1904 when vendor Anton Feuchtwanger needed a way for customers to hold hot sausages.'
  },
  {
    clue: '"Things in the classroom science lab"',
    themeWord: 'EQUIPMENT',
    words: ['BEAKER', 'BURNER', 'FLASK', 'GOGGLES', 'PIPETTE', 'TESTTUBE'],
    difficulty: 'Easy',
    funFact: 'Pyrex borosilicate glass was created in 1915 by Corning scientists to resist thermal shock without shattering.'
  },
  {
    clue: '"Things that grow in the damp forest floor"',
    themeWord: 'FUNGI',
    words: ['CAP', 'GILLS', 'MOREL', 'MUSHROOM', 'SPORES', 'TRUFFLE'],
    difficulty: 'Medium',
    funFact: 'The largest living organism on Earth is an Armillaria ostoyae honey fungus in Oregon covering over 2,385 acres.'
  },
  {
    clue: '"On the morning commuter subway map"',
    themeWord: 'METROPOLIS',
    words: ['COMMUTE', 'DEPOT', 'LINE', 'PLATFORM', 'STATION', 'TRANSFER'],
    difficulty: 'Easy',
    funFact: 'Harry Beck created the iconic schematic London Tube map in 1931, inspired by electrical circuit diagrams.'
  },
  {
    clue: '"In the vintage phonograph music room"',
    themeWord: 'VINYL',
    words: ['ALBUM', 'ARM', 'GROOVE', 'NEEDLE', 'RECORD', 'TURNTABLE'],
    difficulty: 'Easy',
    funFact: 'Vinyl microgroove LP records introduced in 1948 played at 33⅓ RPM, dramatically expanding listening time per side.'
  },
  {
    clue: '"Things with feathers in the aviary"',
    themeWord: 'BIRDLIFE',
    words: ['BEAK', 'CLAW', 'FEATHER', 'NEST', 'TALON', 'WING'],
    difficulty: 'Easy',
    funFact: 'Bird feathers are composed of beta-keratin, the same strong fibrous protein found in reptile scales.'
  },
  {
    clue: '"In the morning country breakfast pantry"',
    themeWord: 'PANTRY',
    words: ['BUTTER', 'FLOUR', 'HONEY', 'JAM', 'SUGAR', 'YEAST'],
    difficulty: 'Easy',
    funFact: 'Honey found in ancient Egyptian tombs over 3,000 years old is still completely preserved and edible.'
  },
  {
    clue: '"In the winter Olympic bobsled chute"',
    themeWord: 'BOBSLEIGH',
    words: ['BRAKEMAN', 'CURVE', 'HELMET', 'ICE', 'RUNNER', 'SLED'],
    difficulty: 'Medium',
    funFact: 'Bobsled tracks are banked so steeply that sleds can experience up to 5G of centrifugal force through hairpin turns.'
  },
  {
    clue: '"In the classic detective board game"',
    themeWord: 'CLUEDO',
    words: ['CANDLESTICK', 'DAGGER', 'KITCHEN', 'LEADPIPE', 'LOUNGE', 'ROPE'],
    difficulty: 'Medium',
    funFact: 'Cluedo was invented in Birmingham, England in 1944 by solicitor\'s clerk Anthony E. Pratt to pass time during wartime blackouts.'
  },
  {
    clue: '"Things that glow in the night sky"',
    themeWord: 'CELESTIAL',
    words: ['AURORA', 'COMET', 'METEOR', 'MOON', 'NEBULA', 'STAR'],
    difficulty: 'Easy',
    funFact: 'Shooting stars are actually tiny meteoroids, often no larger than a grain of sand, burning up in Earth\'s mesosphere.'
  },
  {
    clue: '"In the cozy winter knit sweater"',
    themeWord: 'PULLOVER',
    words: ['CABLE', 'COLLAR', 'CUFF', 'HEM', 'STITCH', 'YARN'],
    difficulty: 'Easy',
    funFact: 'Traditional Aran fishermen sweaters from Ireland used distinctive cable patterns that were unique to individual clans.'
  },
  {
    clue: '"On the artist\'s drafting easel"',
    themeWord: 'ATELIER',
    words: ['CANVAS', 'EASEL', 'MAHLSTICK', 'PALETTE', 'RAG', 'SPATULA'],
    difficulty: 'Medium',
    funFact: 'A mahlstick is a wooden stick with a soft leather ball at the tip used by painters to steady their brush-holding hand.'
  },
  {
    clue: '"In the morning espresso blend"',
    themeWord: 'ROASTERY',
    words: ['ARABICA', 'BEAN', 'CREMA', 'FILTER', 'GRIND', 'ROBUSTA'],
    difficulty: 'Easy',
    funFact: 'Arabica coffee beans account for about 60% of world coffee production, known for their sweeter, aromatic flavor.'
  },
  {
    clue: '"Things that hold water"',
    themeWord: 'RESERVOIR',
    words: ['BASIN', 'BISTRO', 'CISTERN', 'DAM', 'POND', 'TANK'],
    difficulty: 'Medium',
    funFact: 'The Hoover Dam on the Colorado River created Lake Mead, the largest reservoir by volume in the United States.'
  },
  {
    clue: '"In the classic toy train set"',
    themeWord: 'LOCOMOTIVE',
    words: ['CABOOSE', 'ENGINE', 'RAIL', 'SIGNAL', 'TRACK', 'WAGON'],
    difficulty: 'Easy',
    funFact: 'George Stephenson built the world\'s first public inter-city railway line to use steam locomotives in 1830 in England.'
  },
  {
    clue: '"Things in the spring flower garden"',
    themeWord: 'BLOSSOMS',
    words: ['ASTER', 'CROCUS', 'DAISY', 'IRIS', 'PEONY', 'TULIP'],
    difficulty: 'Easy',
    funFact: 'Crocuses are often the very first flowers to emerge in early spring, sometimes pushing directly through remaining snow.'
  },
  {
    clue: '"In the high mountain hiking backpack"',
    themeWord: 'TREKKING',
    words: ['BOOTS', 'CANTEEN', 'COMPASS', 'MAP', 'POLES', 'RUCKSACK'],
    difficulty: 'Easy',
    funFact: 'Mount Everest was officially measured as the world\'s highest peak in 1856 by the Great Trigonometrical Survey of India.'
  },
  {
    clue: '"In the delicious pizzeria oven"',
    themeWord: 'BAKEDPIZZA',
    words: ['CRUST', 'DOUGH', 'MOZZARELLA', 'PEEL', 'SAUCE', 'WOODFIRED'],
    difficulty: 'Easy',
    funFact: 'Traditional Neapolitan pizza is baked in a wood-fired domed oven at temperatures between 850°F and 900°F for just 60 to 90 seconds.'
  },
  {
    clue: '"Things found on the ocean shoreline"',
    themeWord: 'TIDEPOOL',
    words: ['ANEMONE', 'BARNACLE', 'CRAB', 'LIMPET', 'STARFISH', 'URCHIN'],
    difficulty: 'Medium',
    funFact: 'Sea stars can regenerate entire lost limbs, and in some species, a single severed arm can grow an entirely new body.'
  },
  {
    clue: '"On the evening symphony orchestra program"',
    themeWord: 'SYMPHONY',
    words: ['ALLEGRO', 'ANDANTE', 'FINALE', 'MOVEMENT', 'SCHERZO', 'THEME'],
    difficulty: 'Medium',
    funFact: 'Beethoven composed his famous Ninth Symphony ("Ode to Joy") while completely deaf.'
  },
  {
    clue: '"Things with strings that play music"',
    themeWord: 'STRINGS',
    words: ['BANJO', 'CELLO', 'GUITAR', 'HARP', 'LUTE', 'VIOLIN'],
    difficulty: 'Easy',
    funFact: 'The Stradivarius violins crafted by Antonio Stradivari in Cremona around 1700 are valued in the tens of millions of dollars.'
  },
  {
    clue: '"Things inside a traveler\'s suitcase"',
    themeWord: 'LUGGAGE',
    words: ['PASSPORT', 'POUCH', 'SHIRTS', 'SOCKS', 'TAG', 'TICKETS'],
    difficulty: 'Easy',
    funFact: 'Bernard Sadow invented rolling luggage in 1970 after observing workers easily rolling heavy machinery on wheeled skids.'
  },
  {
    clue: '"In the delicious French boulangerie"',
    themeWord: 'CROISSANT',
    words: ['BAGUETTE', 'BOULE', 'BRIOCHE', 'ECLAIR', 'FICELLE', 'PAIN'],
    difficulty: 'Easy',
    funFact: 'French law formally protects the "Baguette de tradition française," mandating it be made without artificial additives.'
  },
  {
    clue: '"Things in the carpenter\'s workshop"',
    themeWord: 'TIMBERWORK',
    words: ['AWL', 'CHISEL', 'CLAMP', 'MALLET', 'PLANE', 'VISE'],
    difficulty: 'Medium',
    funFact: 'Wooden pegs were used in timber frame construction for centuries before metal mass-produced nails became common.'
  },
  {
    clue: '"In the morning country breakfast basket"',
    themeWord: 'BREADBASKET',
    words: ['BAGEL', 'BISCUIT', 'MUFFIN', 'ROLL', 'SCONE', 'TOAST'],
    difficulty: 'Easy',
    funFact: 'The English muffin was invented in New York City in 1894 by English immigrant baker Samuel Bath Thomas.'
  },
  {
    clue: '"Things with four wheels on the tracks"',
    themeWord: 'RAILWAY',
    words: ['BOXCAR', 'DIESEL', 'HOPPER', 'SLEEPER', 'TANKER', 'TRACK'],
    difficulty: 'Medium',
    funFact: 'The Trans-Siberian Railway connects Moscow to Vladivostok, spanning 5,772 miles across eight time zones.'
  },
  {
    clue: '"Things in the autumn harvest orchard"',
    themeWord: 'APPLEPICK',
    words: ['BASKET', 'BRANCH', 'CRISP', 'FRUIT', 'LADDER', 'ORCHARD'],
    difficulty: 'Easy',
    funFact: 'Johnny Appleseed (John Chapman) was a real historical pioneer who planted apple nurseries across the American Midwest.'
  },
  {
    clue: '"In the magical woodland fairy glen"',
    themeWord: 'ENCHANTED',
    words: ['BROOK', 'ELF', 'FAIRY', 'MOSS', 'MUSHROOM', 'SPRITE'],
    difficulty: 'Easy',
    funFact: 'Fairy rings—circular formations of mushrooms in meadows—were explained in folklore as the footprints of dancing elves.'
  },
  {
    clue: '"Things in the cozy winter fireplace glow"',
    themeWord: 'LOGFIRE',
    words: ['ASH', 'BLAZE', 'CHIMNEY', 'EMBER', 'KINDLING', 'SMOKE'],
    difficulty: 'Easy',
    funFact: 'Hearth fires have been the gathering focal point of human social storytelling for at least 300,000 years.'
  },
  {
    clue: '"On the evening dinner table setting"',
    themeWord: 'CUTLERY',
    words: ['FORK', 'GLASS', 'KNIFE', 'NAPKIN', 'PLATE', 'SPOON'],
    difficulty: 'Easy',
    funFact: 'Table forks were viewed with suspicion in western Europe until Catherine de\' Medici popularized them in France.'
  },
  {
    clue: '"In the winter snow ski trail"',
    themeWord: 'SLALOM',
    words: ['BINDINGS', 'BOOTS', 'CHAIRLIFT', 'GOGGLES', 'POLES', 'SKIS'],
    difficulty: 'Easy',
    funFact: 'The word "slalom" comes from the Norwegian "slalåm," meaning a gentle slope trail.'
  },
  {
    clue: '"In the classic royal tea salon"',
    themeWord: 'TEAROOM',
    words: ['CHAMOMILE', 'EARLGREY', 'HERBAL', 'MATCHA', 'OOLONG', 'SENCHA'],
    difficulty: 'Medium',
    funFact: 'Earl Grey tea is flavored with oil extracted from the rind of the fragrant bergamot orange.'
  },
  {
    clue: '"Things with sails on the blue ocean"',
    themeWord: 'YACHTING',
    words: ['CATAMARAN', 'CUTTER', 'DINGHY', 'KETCH', 'SCHOONER', 'SLOOP'],
    difficulty: 'Challenging',
    funFact: 'The America\'s Cup is the oldest trophy in international sport, contested since 1851.'
  },
  {
    clue: '"Things in the sweet candy shop"',
    themeWord: 'CANDIES',
    words: ['BONBON', 'CARAMEL', 'FUDGE', 'LOLLIPOP', 'NOUGAT', 'TOFFEE'],
    difficulty: 'Easy',
    funFact: 'The word "candy" comes from the Arabic "qandi," meaning made of sugar.'
  },
  {
    clue: '"Things that tell the direction of north"',
    themeWord: 'NAVIGATOR',
    words: ['BEARING', 'COMPASS', 'HEADING', 'MAGNETIC', 'NEEDLE', 'POLARIS'],
    difficulty: 'Medium',
    funFact: 'Polaris, the North Star, sits almost directly above Earth\'s true geographic North Pole.'
  },
  {
    clue: '"In the morning country barnyard"',
    themeWord: 'FARMLAND',
    words: ['BARN', 'COW', 'HAY', 'PIG', 'ROOSTER', 'TRACTOR'],
    difficulty: 'Easy',
    funFact: 'Roosters crow in the morning because of their internal circadian rhythm, not solely in response to daylight.'
  },
  {
    clue: '"Things with strings in the music room"',
    themeWord: 'ORCHESTRAL',
    words: ['CELLO', 'DOUBLEBASS', 'GUITAR', 'HARP', 'VIOLA', 'VIOLIN'],
    difficulty: 'Easy',
    funFact: 'The viola is slightly larger than a violin and tuned a perfect fifth lower (C-G-D-A).'
  },
  {
    clue: '"In the deep subterranean gold mine"',
    themeWord: 'GOLDMINE',
    words: ['CARAT', 'CRUCIBLE', 'INGOT', 'NUGGET', 'ORE', 'VEIN'],
    difficulty: 'Medium',
    funFact: 'Nearly all the gold on Earth originated from the collisions of neutron stars billions of years ago.'
  },
  {
    clue: '"Things in the student\'s school bag"',
    themeWord: 'BACKPACK',
    words: ['BINDER', 'CALCULATOR', 'ERASER', 'FOLDER', 'PENCIL', 'RULER'],
    difficulty: 'Easy',
    funFact: 'The modern pocket scientific calculator was introduced by Hewlett-Packard in 1972 with the HP-35.'
  },
  {
    clue: '"In the cozy winter snow chalet"',
    themeWord: 'FIREPLACE',
    words: ['BLANKET', 'CHIMNEY', 'COCOA', 'EMBER', 'HEARTH', 'MANTEL'],
    difficulty: 'Easy',
    funFact: 'Traditional Swiss chalets were built of heavy timber beams designed to withstand deep Alpine snow loads.'
  },
  {
    clue: '"Things that bloom in the garden flowerbed"',
    themeWord: 'PERENNIAL',
    words: ['ANEMONE', 'BLEEDING', 'COLUMBINE', 'HOSTA', 'LUPINE', 'PEONY'],
    difficulty: 'Medium',
    funFact: 'Perennial plants survive multiple growing seasons by storing nutrient energy in dormant root systems through winter.'
  },
  {
    clue: '"In the evening dinner pasta kitchen"',
    themeWord: 'RAVIOLI',
    words: ['DOUGH', 'FILLING', 'HERBS', 'PARMESAN', 'RICOTTA', 'SAUCE'],
    difficulty: 'Easy',
    funFact: 'The earliest known mention of ravioli appears in the 14th-century personal letters of merchant Francesco di Marco Datini.'
  },
  {
    clue: '"In the ancient Olympic Greek stadium"',
    themeWord: 'PENTATHLON',
    words: ['DISCUS', 'JAVELIN', 'RUNNING', 'STADIUM', 'TORCH', 'WRESTLING'],
    difficulty: 'Medium',
    funFact: 'The ancient Olympic Games were held every four years in Olympia from 776 BC until 393 AD.'
  },
  {
    clue: '"In the sweet summer ice cream parlor"',
    themeWord: 'SUNDAE',
    words: ['CHERRY', 'CHOCOLATE', 'CONE', 'FUDGE', 'SCOOP', 'SPRINKLES'],
    difficulty: 'Easy',
    funFact: 'The ice cream cone was popularized at the 1904 World\'s Fair in St. Louis when an ice cream vendor paired with a waffle maker.'
  },
  {
    clue: '"Things in the autumn harvest woods"',
    themeWord: 'FALLFOLIAGE',
    words: ['ACORN', 'CHESTNUT', 'LEAF', 'MAPLE', 'PINE', 'SQUIRREL'],
    difficulty: 'Easy',
    funFact: 'Chlorophyll breaks down in autumn as daylight shortens, revealing hidden yellow carotenoids and red anthocyanins in leaves.'
  },
  {
    clue: '"In the evening astronomer\'s telescope"',
    themeWord: 'STARGAZING',
    words: ['CLUSTER', 'COMET', 'GALAXY', 'NEBULA', 'PLANET', 'PULSAR'],
    difficulty: 'Medium',
    funFact: 'The Hubble Space Telescope has made more than 1.5 million observations since its launch in 1990.'
  },
  {
    clue: '"Things in the captain\'s sailing schooner"',
    themeWord: 'MAINSAIL',
    words: ['ANCHOR', 'BOOM', 'BOW', 'HATCH', 'MAST', 'STERN'],
    difficulty: 'Medium',
    funFact: 'The bow is the front of a vessel and the stern is the back; port is left and starboard is right.'
  },
  {
    clue: '"Things in the Italian espresso bar"',
    themeWord: 'ESPRESSO',
    words: ['AROMA', 'BARISTA', 'CREMA', 'DOSE', 'FILTER', 'TAMP'],
    difficulty: 'Easy',
    funFact: 'The golden crema on top of an espresso shot is an emulsion of coffee oils and carbon dioxide micro-bubbles.'
  },
  {
    clue: '"Things in the cozy winter fireplace"',
    themeWord: 'FIRELIGHT',
    words: ['ASH', 'BLAZE', 'CHIMNEY', 'EMBER', 'FLAME', 'SPARK'],
    difficulty: 'Easy',
    funFact: 'Wood fires produce pleasant crackling sounds when pockets of moisture and sap trapped in the wood vaporize and burst.'
  },
  {
    clue: '"Things you wear on your head"',
    themeWord: 'HEADWEAR',
    words: ['BERET', 'BONNET', 'CAP', 'FEDORA', 'HELMET', 'SOMBRERO'],
    difficulty: 'Easy',
    funFact: 'The fedora became a popular hat for men after British Prince Edward started wearing one in 1924.'
  },
  {
    clue: '"Things in the artist\'s watercolor box"',
    themeWord: 'AQUARELLE',
    words: ['BRUSH', 'EASEL', 'GOUACHE', 'PAD', 'PALETTE', 'PIGMENT'],
    difficulty: 'Medium',
    funFact: 'Albrecht Dürer was among the first European masters to use watercolors for delicate botanical and landscape studies.'
  },
  {
    clue: '"In the high mountain ski lift"',
    themeWord: 'GONDOLA',
    words: ['CABLE', 'CHALET', 'POLE', 'PYLON', 'STATION', 'TRACK'],
    difficulty: 'Medium',
    funFact: 'The peak-to-peak gondola in Whistler, Canada holds the world record for the longest unsupported span between towers (1.88 miles).'
  },
  {
    clue: '"Things in the morning breakfast tray"',
    themeWord: 'CROISSANTS',
    words: ['BUTTER', 'COFFEE', 'EGG', 'JAM', 'JUICE', 'PASTRY'],
    difficulty: 'Easy',
    funFact: 'Laminated dough in croissants consists of up to 55 alternating layers of butter and dough.'
  },
  {
    clue: '"In the deep tropical ocean trench"',
    themeWord: 'ABYSS',
    words: ['ANGLERFISH', 'BATHYAL', 'CORAL', 'CURRENT', 'VENT', 'WHALE'],
    difficulty: 'Challenging',
    funFact: 'The Mariana Trench is the deepest oceanic trench on Earth, plunging nearly 36,000 feet at Challenger Deep.'
  },
  {
    clue: '"Things in the sweet bakery oven"',
    themeWord: 'BAGUETTES',
    words: ['CRUST', 'DOUGH', 'FLOUR', 'LOAF', 'OVEN', 'YEAST'],
    difficulty: 'Easy',
    funFact: 'In 2022, the artisanal know-how and culture of the baguette was added to UNESCO\'s Intangible Cultural Heritage list.'
  },
  {
    clue: '"In the spring flower botanical garden"',
    themeWord: 'ORCHIDS',
    words: ['BLOOM', 'HYBRID', 'LEAF', 'PETAL', 'ROOT', 'STEM'],
    difficulty: 'Medium',
    funFact: 'There are over 28,000 accepted species in the orchid family, making it larger than the bird and mammal families combined.'
  },
  {
    clue: '"Things in the cozy winter cabin"',
    themeWord: 'CHALETS',
    words: ['FIREPLACE', 'KINDLING', 'MANTEL', 'RUG', 'SOFA', 'STOVE'],
    difficulty: 'Easy',
    funFact: 'Wood-burning stoves were revolutionized in the 1740s by Benjamin Franklin\'s metal-lined "Franklin stove."'
  },
  {
    clue: '"In the evening symphony orchestra concert hall"',
    themeWord: 'ORCHESTRAS',
    words: ['BRASS', 'CHORD', 'FLUTE', 'HARP', 'STRINGS', 'VIOLIN'],
    difficulty: 'Easy',
    funFact: 'A modern symphony orchestra can feature up to 100 musicians playing in synchronized harmony.'
  },
  {
    clue: '"Things in the autumn harvest festival"',
    themeWord: 'PUMPKINS',
    words: ['CIDER', 'CORN', 'GOURD', 'HAYSTACK', 'PIE', 'SQUASH'],
    difficulty: 'Easy',
    funFact: 'Pumpkins are native to North America and were a staple dietary crop for Indigenous peoples for thousands of years.'
  },
  {
    clue: '"Things in the ancient pharaoh\'s treasure tomb"',
    themeWord: 'SARCOPHAGUS',
    words: ['AMULET', 'CHEST', 'GOLD', 'MASK', 'MUMMY', 'SCARAB'],
    difficulty: 'Medium',
    funFact: 'Tutankhamun\'s burial mask was crafted from two layers of high-karat gold and weighs 22.5 pounds.'
  },
  {
    clue: '"Things in the morning breakfast skillet"',
    themeWord: 'OMELETTE',
    words: ['CHEESE', 'EGG', 'HERBS', 'PEPPER', 'SALT', 'SPINACH'],
    difficulty: 'Easy',
    funFact: 'Legend holds that Napoleon was so impressed by an omelette prepared for him in Bessières, France, that he ordered a giant one for his army.'
  },
  {
    clue: '"Things in the sweet chocolate factory"',
    themeWord: 'CHOCOLATE',
    words: ['BAR', 'BEAN', 'BUTTER', 'CACAO', 'DARK', 'MILK'],
    difficulty: 'Easy',
    funFact: 'Cacao beans were so valuable to the ancient Aztecs and Maya that they were used as universal currency.'
  },
  {
    clue: '"Things in the summer sea breeze"',
    themeWord: 'SAILBOATS',
    words: ['ANCHOR', 'CLEAT', 'HULL', 'KEEL', 'MAST', 'RUDDER'],
    difficulty: 'Easy',
    funFact: 'The keel of a sailboat provides ballast weight to prevent the wind from tipping the vessel over.'
  },
  {
    clue: '"Things in the evening night sky"',
    themeWord: 'SUPERNOVA',
    words: ['BLAST', 'CORE', 'ENERGY', 'GAS', 'NEBULA', 'STAR'],
    difficulty: 'Medium',
    funFact: 'In 1054 AD, Chinese and Arab astronomers recorded a supernova so bright it remained visible in broad daylight for 23 days.'
  },
  {
    clue: '"Things in the classic detective mystery"',
    themeWord: 'DETECTIVE',
    words: ['CLUE', 'EVIDENCE', 'FINGERPRINT', 'MOTIVE', 'PROOF', 'SUSPECT'],
    difficulty: 'Easy',
    funFact: 'Agatha Christie wrote 66 detective novels, making her the best-selling fiction writer of all time.'
  },
  {
    clue: '"Things in the morning bakery counter"',
    themeWord: 'PASTRIES',
    words: ['DANISH', 'ECLAIR', 'GLAZE', 'PIE', 'SCONE', 'TART'],
    difficulty: 'Easy',
    funFact: 'The éclair originated in France in the 19th century; the word "éclair" means "flash of lightning" because it was eaten quickly.'
  },
  {
    clue: '"Things in the cozy winter fireplace"',
    themeWord: 'WOODFIRE',
    words: ['ASH', 'BLAZE', 'CHIMNEY', 'EMBER', 'FLAME', 'LOGS'],
    difficulty: 'Easy',
    funFact: 'Hardwoods like oak and maple burn longer and produce more heat energy than softwoods like pine.'
  },
  {
    clue: '"Things in the deep blue ocean reef"',
    themeWord: 'CORALREEF',
    words: ['ANEMONE', 'CLOWNFISH', 'KELP', 'MANTA', 'SPONGE', 'TURTLE'],
    difficulty: 'Easy',
    funFact: 'Coral reefs occupy less than 0.1% of the world\'s ocean area, yet provide a home for at least 25% of all marine species.'
  },
  {
    clue: '"Things in the ancient Roman Colosseum arena"',
    themeWord: 'GLADIATOR',
    words: ['ARENA', 'CHARIOT', 'HELMET', 'SAND', 'SHIELD', 'SWORD'],
    difficulty: 'Medium',
    funFact: 'The Colosseum in Rome could hold over 50,000 spectators and could even be flooded with water for mock naval battles.'
  },
  {
    clue: '"Things in the delicious pizza oven"',
    themeWord: 'MARGHERITA',
    words: ['BASIL', 'CRUST', 'DOUGH', 'MOZZARELLA', 'OIL', 'TOMATO'],
    difficulty: 'Easy',
    funFact: 'The Associazione Verace Pizza Napoletana was founded in 1984 to maintain the strict traditional recipe for Neapolitan pizza.'
  },
  {
    clue: '"Things in the morning espresso cup"',
    themeWord: 'CAPPUCCINO',
    words: ['BARISTA', 'CREMA', 'ESPRESSO', 'FOAM', 'MILK', 'STEAM'],
    difficulty: 'Easy',
    funFact: 'The cappuccino was named for the Capuchin friars in Vienna because the color of the espresso mixed with steamed milk resembled their brown robes.'
  },
  {
    clue: '"Things in the summer garden flowerbed"',
    themeWord: 'SUNFLOWERS',
    words: ['BLOOM', 'LEAF', 'PETAL', 'RAY', 'SEED', 'STALK'],
    difficulty: 'Easy',
    funFact: 'Young sunflowers exhibit heliotropism, tracking the Sun across the sky from east to west each day.'
  },
  {
    clue: '"Things in the autumn harvest orchard"',
    themeWord: 'CIDERMILL',
    words: ['APPLE', 'BARREL', 'JUG', 'ORCHARD', 'PRESS', 'SWEET'],
    difficulty: 'Easy',
    funFact: 'Unfiltered apple cider contains raw apple pulp, giving it an opaque golden amber appearance and richer taste.'
  },
  {
    clue: '"Things in the captain\'s sea navigation"',
    themeWord: 'CHARTWORK',
    words: ['ANCHOR', 'BEACON', 'BUOY', 'COMPASS', 'KNOT', 'SEXTANT'],
    difficulty: 'Medium',
    funFact: 'A nautical mile is based on one minute of arc along a meridian of latitude, equal to 1,852 meters.'
  },
  {
    clue: '"Things in the sweet ice cream sundae"',
    themeWord: 'BANANASPLIT',
    words: ['BERRY', 'CHERRY', 'CHOCOLATE', 'CREAM', 'NUTS', 'SAUCE'],
    difficulty: 'Easy',
    funFact: 'The banana split was invented in 1904 by 23-year-old pharmacy apprentice David Evans Strickler in Latrobe, Pennsylvania.'
  },
  {
    clue: '"Things in the morning breakfast buffet"',
    themeWord: 'PANCAKES',
    words: ['BATTER', 'BUTTER', 'GRIDDLE', 'MAPLE', 'STACK', 'SYRUP'],
    difficulty: 'Easy',
    funFact: 'The world\'s largest pancake, flipped in Rochdale, England in 1994, measured over 49 feet in diameter.'
  },
  {
    clue: '"Things in the high mountain ski resort"',
    themeWord: 'SNOWBOARDING',
    words: ['BINDINGS', 'BOOTS', 'CHAIRLIFT', 'GOGGLES', 'PARK', 'SLOPE'],
    difficulty: 'Easy',
    funFact: 'Snowboarding was invented in 1965 by Sherman Poppen in Michigan when he tied two skis together for his daughter, calling it a "snurfer."'
  },
  {
    clue: '"Things in the ancient Egyptian pyramid tomb"',
    themeWord: 'HIEROGLYPHS',
    words: ['AMULET', 'CARTOUCHE', 'PAPYRUS', 'REED', 'SCRIBE', 'SCROLL'],
    difficulty: 'Challenging',
    funFact: 'A cartouche is an oval loop enclosing royal hieroglyphic names, symbolizing the protective encircling loop of the universe.'
  },
  {
    clue: '"Things in the delicious French patisserie"',
    themeWord: 'MADELEINE',
    words: ['ALMOND', 'BATTER', 'BUTTER', 'MOLD', 'SHELL', 'SUGAR'],
    difficulty: 'Medium',
    funFact: 'Marcel Proust famously described the taste of a madeleine cake dipped in tea triggering vivid involuntary memories in his masterpiece.'
  },
  {
    clue: '"Things in the evening starry night sky"',
    themeWord: 'CONSTELLATIONS',
    words: ['CASSIOPEIA', 'CYGNUS', 'DRACO', 'ORION', 'PEGASUS', 'URSA'],
    difficulty: 'Medium',
    funFact: 'The International Astronomical Union officially recognizes 88 modern constellations filling the night sky.'
  },
  {
    clue: '"Things in the cozy winter fireplace"',
    themeWord: 'BONFIRES',
    words: ['ASH', 'BLAZE', 'CINDER', 'EMBER', 'FLAME', 'SPARK'],
    difficulty: 'Easy',
    funFact: 'The word "bonfire" originally derived from "bone fire" in Middle English, referring to large open-air fires.'
  },
  {
    clue: '"Things in the captain\'s ocean vessel"',
    themeWord: 'STEAMSHIP',
    words: ['BOILER', 'BRIDGE', 'FUNNEL', 'HULL', 'PROPELLER', 'RUDDER'],
    difficulty: 'Medium',
    funFact: 'The SS Great Western, designed by Isambard Kingdom Brunel in 1838, was the first purpose-built transatlantic steamship.'
  },
  {
    clue: '"Things in the spring flower garden"',
    themeWord: 'DAFFODILS',
    words: ['BULB', 'COROLLA', 'LEAF', 'PETAL', 'STEM', 'YELLOW'],
    difficulty: 'Easy',
    funFact: 'Daffodils (Narcissus) are the national flower of Wales and are traditionally worn on St. David\'s Day.'
  },
  {
    clue: '"Things in the delicious pizzeria kitchen"',
    themeWord: 'CALZONES',
    words: ['CHEESE', 'DOUGH', 'FOLD', 'MEAT', 'OVEN', 'RICOTTA'],
    difficulty: 'Easy',
    funFact: 'A calzone is essentially a folded turnover pizza, originating in Naples in the 18th century as a street food.'
  },
  {
    clue: '"Things in the morning espresso blend"',
    themeWord: 'MACCHIATO',
    words: ['BARISTA', 'CREMA', 'ESPRESSO', 'FOAM', 'MARK', 'MILK'],
    difficulty: 'Easy',
    funFact: 'Macchiato in Italian means "stained" or "spotted," describing espresso stained with a small dollop of steamed milk foam.'
  },
  {
    clue: '"Things in the sweet bakery oven"',
    themeWord: 'SCONES',
    words: ['BUTTER', 'CLOTTED', 'CURRANT', 'FLOUR', 'JAM', 'TEA'],
    difficulty: 'Easy',
    funFact: 'The age-old British debate between Devon and Cornwall is whether cream goes on the scone before jam (Devon) or after jam (Cornwall).'
  },
  {
    clue: '"Things in the autumn harvest orchard"',
    themeWord: 'SWEETCIDER',
    words: ['APPLE', 'BARREL', 'CINNAMON', 'CLOVE', 'JUG', 'PRESS'],
    difficulty: 'Easy',
    funFact: 'Hot mulled cider with cloves, orange peel, and cinnamon has been enjoyed across Britain as "wassail" since medieval times.'
  },
  {
    clue: '"Things in the high mountain ski resort"',
    themeWord: 'APRESSKI',
    words: ['CHALET', 'FIREPLACE', 'FONDU', 'HEATER', 'LODGE', 'SAUNA'],
    difficulty: 'Easy',
    funFact: 'The French term "après-ski" arose in the 1950s in the Alps to describe the evening socializing, food, and drinks following a day on the slopes.'
  },
  {
    clue: '"Things in the ancient pharaoh\'s burial tomb"',
    themeWord: 'PYRAMIDS',
    words: ['BLOCK', 'CHAMBER', 'LIMESTONE', 'MUMMY', 'RAMP', 'TOMB'],
    difficulty: 'Easy',
    funFact: 'The Great Pyramid of Giza was the tallest human-made structure in the world for over 3,800 years until Lincoln Cathedral in 1311.'
  },
  {
    clue: '"Things in the delicious French bakery"',
    themeWord: 'BRIOCHES',
    words: ['BUTTER', 'CRUST', 'DOUGH', 'EGG', 'GOLDEN', 'LOAF'],
    difficulty: 'Easy',
    funFact: 'Brioche is an enriched French bread with a high butter and egg content that gives it a rich, tender crumb.'
  },
  {
    clue: '"Things in the evening starry galaxy"',
    themeWord: 'ANDROMEDA',
    words: ['CORE', 'DISK', 'DUST', 'GALAXY', 'SPIRAL', 'STARS'],
    difficulty: 'Medium',
    funFact: 'The Andromeda Galaxy is our closest major galactic neighbor, located approximately 2.5 million light-years away.'
  },
  {
    clue: '"Things in the sweet summer orchard"',
    themeWord: 'CHERRYPICK',
    words: ['BASKET', 'BLOSSOM', 'BRANCH', 'FRUIT', 'LADDER', 'RED'],
    difficulty: 'Easy',
    funFact: 'Traverse City, Michigan is known as the "Cherry Capital of the World," hosting an annual National Cherry Festival since 1925.'
  },
  {
    clue: '"Things in the cozy winter fireplace"',
    themeWord: 'CHIMNEYPOT',
    words: ['BRICK', 'CLAY', 'FLUE', 'HEARTH', 'SMOKE', 'SOOT'],
    difficulty: 'Medium',
    funFact: 'Terracotta chimney pots were introduced on roofs in Britain in the Victorian era to improve the draft pull of fires.'
  },
  {
    clue: '"Things in the captain\'s ocean vessel"',
    themeWord: 'CLIPPER',
    words: ['ANCHOR', 'BOW', 'CANVAS', 'MAST', 'RIGGING', 'SAIL'],
    difficulty: 'Medium',
    funFact: 'The Cutty Sark in Greenwich, London, is one of the last surviving 19th-century clipper ships, built for the China tea trade.'
  },
  {
    clue: '"Things in the spring flower garden"',
    themeWord: 'HYACINTHS',
    words: ['BLOOM', 'BULB', 'FRAGRANT', 'PETAL', 'PURPLE', 'SPIKE'],
    difficulty: 'Medium',
    funFact: 'Hyacinths were named after the divine youth Hyacinthus in Greek mythology and were favored by Madame de Pompadour in 18th-century Versailles.'
  },
  {
    clue: '"Things in the delicious Italian kitchen"',
    themeWord: 'GNOCCHI',
    words: ['BUTTER', 'DOUGH', 'FORK', 'PARMESAN', 'POTATO', 'SAUCE'],
    difficulty: 'Easy',
    funFact: 'The characteristic ridges on gnocchi are made by rolling the dough dumplings across the tines of a fork to hold sauce.'
  },
  {
    clue: '"Things in the morning espresso cup"',
    themeWord: 'CORTADOS',
    words: ['BARISTA', 'CREMA', 'EQUAL', 'ESPRESSO', 'GLASS', 'MILK'],
    difficulty: 'Easy',
    funFact: 'The cortado originated in the Basque country of Spain, where hot espresso is "cut" (cortar) with an equal volume of warm milk.'
  },
  {
    clue: '"Things in the sweet bakery display"',
    themeWord: 'TARTELETTE',
    words: ['BERRY', 'CRUST', 'CUSTARD', 'FRUIT', 'GLAZE', 'PASTRY'],
    difficulty: 'Easy',
    funFact: 'Fruit tart glaze is often made with warmed apricot jam strained through a fine sieve to provide a shiny protective seal.'
  },
  {
    clue: '"Things in the autumn harvest orchard"',
    themeWord: 'CORNMAZE',
    words: ['FIELD', 'HARVEST', 'HAY', 'PATH', 'PUMPKIN', 'STALK'],
    difficulty: 'Easy',
    funFact: 'The first recorded corn maze was created in 1993 at Lebanon Valley College in Annville, Pennsylvania.'
  },
  {
    clue: '"Things in the high mountain ski resort"',
    themeWord: 'TELEMARK',
    words: ['BINDINGS', 'BOOTS', 'CHALET', 'HEEL', 'SKIS', 'TURNS'],
    difficulty: 'Medium',
    funFact: 'Telemark skiing, originating in Telemark, Norway in 1868, uses a free-heel binding that requires a deep lunging turn.'
  },
  {
    clue: '"Things in the ancient Roman Colosseum"',
    themeWord: 'AMPHITHEATER',
    words: ['ARCH', 'ARENA', 'TIERS', 'TRIBUNE', 'VAULT', 'VELARIUM'],
    difficulty: 'Challenging',
    funFact: 'The velarium was a gigantic retractable canvas awning deployed by Roman sailors over the Colosseum to shade spectators from the sun.'
  },
  {
    clue: '"Things in the delicious French patisserie"',
    themeWord: 'MILLEFEUILLE',
    words: ['CREAM', 'CRUST', 'ICING', 'LAYERS', 'PASTRY', 'PUFF'],
    difficulty: 'Challenging',
    funFact: 'Mille-feuille translates from French as "a thousand leaves," describing the hundreds of wafer-thin layers in puff pastry.'
  },
  {
    clue: '"Things in the evening starry sky"',
    themeWord: 'INTERSTELLAR',
    words: ['CLOUD', 'COSMOS', 'DUST', 'GAS', 'NEBULA', 'VOYAGE'],
    difficulty: 'Medium',
    funFact: 'The interstellar medium comprises the matter and radiation that exists in the vast space between the star systems of a galaxy.'
  },
  {
    clue: '"Things in the sweet summer garden"',
    themeWord: 'RASPBERRIES',
    words: ['BUSH', 'CANE', 'DRUPELET', 'FRUIT', 'RED', 'THORN'],
    difficulty: 'Easy',
    funFact: 'A raspberry is an aggregate fruit composed of dozens of tiny individual drupelets clustered around a central core.'
  },
  {
    clue: '"Things in the cozy winter fireplace"',
    themeWord: 'ANDIRONS',
    words: ['BRASS', 'CAST', 'EMBER', 'FIRE', 'GRATE', 'HEARTH'],
    difficulty: 'Medium',
    funFact: 'Andirons (firedogs) hold firewood logs above the hearth floor to improve air circulation and draft beneath the fire.'
  },
  {
    clue: '"Things in the captain\'s sea vessel"',
    themeWord: 'GALLEON',
    words: ['CANNON', 'DECK', 'FLAGSHIP', 'MAST', 'RIGGING', 'RUDDER'],
    difficulty: 'Medium',
    funFact: 'Spanish galleons transported silver and gold treasure across the Atlantic and Pacific for over two centuries.'
  },
  {
    clue: '"Things in the spring flower garden"',
    themeWord: 'LILACS',
    words: ['BLOOM', 'BUSH', 'CLUSTER', 'FRAGRANCE', 'PETAL', 'PURPLE'],
    difficulty: 'Easy',
    funFact: 'Lilacs belong to the olive family (Oleaceae) and can survive for well over a century in cottage gardens.'
  },
  {
    clue: '"Things in the delicious Italian kitchen"',
    themeWord: 'TAGLIATELLE',
    words: ['BEEF', 'DOUGH', 'EGG', 'NOODLE', 'PARMESAN', 'RAGU'],
    difficulty: 'Easy',
    funFact: 'According to legend, a Bolognese chef invented tagliatelle in 1487, inspired by the luscious blonde hair of Lucrezia Borgia.'
  },
  {
    clue: '"Things in the morning espresso cup"',
    themeWord: 'LATTES',
    words: ['BARISTA', 'CREMA', 'CUP', 'FOAM', 'MILK', 'STEAM'],
    difficulty: 'Easy',
    funFact: 'Latte art is created by skillfully pouring microfoam steamed milk into a shot of espresso to form rosettas and hearts.'
  },
  {
    clue: '"Things in the sweet bakery display"',
    themeWord: 'CANNOLIS',
    words: ['CHIP', 'CREAM', 'CRUST', 'PISTACHIO', 'RICOTTA', 'SHELL'],
    difficulty: 'Easy',
    funFact: 'Cannoli originated in the Sicilian city of Palermo during Arab rule in the 9th to 11th centuries.'
  },
  {
    clue: '"Things in the autumn harvest orchard"',
    themeWord: 'CIDERPRESS',
    words: ['APPLE', 'BARREL', 'CRANK', 'ORCHARD', 'POMACE', 'SWEET'],
    difficulty: 'Medium',
    funFact: 'The leftover crushed apple solids after pressing cider are known as "pomace," often fed to livestock on farms.'
  },
  {
    clue: '"Things in the high mountain ski resort"',
    themeWord: 'DOWNHILL',
    words: ['BOOTS', 'CHAIRLIFT', 'GOGGLES', 'POLES', 'RACE', 'SLOPE'],
    difficulty: 'Easy',
    funFact: 'Downhill skiers can reach speeds of over 95 miles per hour on famous World Cup courses like the Streif in Kitzbühel.'
  },
  {
    clue: '"Things in the ancient Greek Parthenon"',
    themeWord: 'ACROPOLIS',
    words: ['ATHENA', 'COLUMN', 'DORIC', 'FRIEZE', 'MARBLE', 'TEMPLE'],
    difficulty: 'Medium',
    funFact: 'The columns of the Parthenon lean slightly inward and swell in the middle (entasis) to correct for optical illusions.'
  },
  {
    clue: '"Things in the delicious French patisserie"',
    themeWord: 'PROFITEROLE',
    words: ['CHOUX', 'CREAM', 'CUSTARD', 'FUDGE', 'PASTRY', 'SAUCE'],
    difficulty: 'Medium',
    funFact: 'Profiteroles are made from choux pastry, which uses steam rather than chemical leaveners to puff hollow in the oven.'
  },
  {
    clue: '"Things in the evening starry sky"',
    themeWord: 'LIGHTYEAR',
    words: ['COSMOS', 'DISTANCE', 'GALAXY', 'SPEED', 'STARS', 'VOYAGE'],
    difficulty: 'Easy',
    funFact: 'One light-year is the distance light travels in one Julian year: roughly 5.88 trillion miles.'
  },
  {
    clue: '"Things in the sweet summer garden"',
    themeWord: 'BLACKBERRIES',
    words: ['BRAMBLE', 'BUSH', 'CANE', 'FRUIT', 'PURPLE', 'THORN'],
    difficulty: 'Easy',
    funFact: 'In British folklore, it is said that the devil spits on wild blackberries after Michaelmas (September 29), making them bitter.'
  },
  {
    clue: '"Things in the cozy winter fireplace"',
    themeWord: 'HEARTHSTONE',
    words: ['ASH', 'BLAZE', 'BRICK', 'EMBER', 'FIRE', 'MANTEL'],
    difficulty: 'Easy',
    funFact: 'The hearthstone is the heavy stone slab forming the floor of a fireplace, designed to radiate stored warmth into the room.'
  },
  {
    clue: '"Things in the captain\'s sea vessel"',
    themeWord: 'CARAVEL',
    words: ['CARGO', 'COMPASS', 'DECK', 'MAST', 'RUDDER', 'SAIL'],
    difficulty: 'Medium',
    funFact: 'The caravel was developed by Portuguese shipwrights in the 15th century, featuring lateen sails that allowed ships to sail windward.'
  },
  {
    clue: '"Things in the spring flower garden"',
    themeWord: 'PEONIES',
    words: ['BLOOM', 'BUD', 'FRAGRANT', 'PETAL', 'PINK', 'STALK'],
    difficulty: 'Easy',
    funFact: 'In traditional Chinese culture, the tree peony is revered as the "king of flowers" and symbolizes prosperity and honor.'
  },
  {
    clue: '"Things in the delicious Italian kitchen"',
    themeWord: 'PAPPARDELLE',
    words: ['BEEF', 'DOUGH', 'EGG', 'NOODLE', 'PARMESAN', 'RIBBON'],
    difficulty: 'Medium',
    funFact: 'Pappardelle comes from the Italian verb "pappare," meaning to gobble up or eat with ravenous pleasure.'
  },
  {
    clue: '"Things in the morning espresso cup"',
    themeWord: 'AMERICANOS',
    words: ['BARISTA', 'CREMA', 'DILUTE', 'ESPRESSO', 'HOT', 'WATER'],
    difficulty: 'Easy',
    funFact: 'The Americano was popularized during World War II when American GIs in Italy diluted local espresso with hot water to mimic drip coffee.'
  },
  {
    clue: '"Things in the sweet bakery display"',
    themeWord: 'TIRAMISUS',
    words: ['COCOA', 'COFFEE', 'EGG', 'LADYFINGER', 'MASCARPONE', 'SUGAR'],
    difficulty: 'Easy',
    funFact: 'Authentic tiramisu uses Italian Savoiardi ladyfinger biscuits dipped in strong espresso and layered with mascarpone cream.'
  },
  {
    clue: '"Things in the autumn harvest orchard"',
    themeWord: 'APPLECRISP',
    words: ['BROWN', 'CINNAMON', 'CRUST', 'FRUIT', 'OATS', 'SUGAR'],
    difficulty: 'Easy',
    funFact: 'Apple crisp (or crumble) emerged during World War II as a delicious alternative to pie that required less rationed flour and butter.'
  },
  {
    clue: '"Things in the high mountain ski resort"',
    themeWord: 'CROSSCOUNTRY',
    words: ['BOOTS', 'CHALET', 'GLIDE', 'POLES', 'SKIS', 'TRAIL'],
    difficulty: 'Easy',
    funFact: 'Nordic cross-country skiing has been practiced for over 4,000 years across Scandinavia as an essential winter travel method.'
  },
  {
    clue: '"Things in the ancient Greek mythology"',
    themeWord: 'PANTHEONS',
    words: ['APOLLO', 'ARES', 'ATHENA', 'HERA', 'HERMES', 'ZEUS'],
    difficulty: 'Easy',
    funFact: 'Mount Olympus in Thessaly was believed by ancient Greeks to be the divine dwelling place of the twelve principal gods.'
  },
  {
    clue: '"Things in the delicious French patisserie"',
    themeWord: 'PALMIERS',
    words: ['BUTTER', 'CRISP', 'DOUGH', 'HEART', 'PASTRY', 'SUGAR'],
    difficulty: 'Medium',
    funFact: 'Palmiers are puff pastry cookies rolled in granulated sugar and folded into a heart or elephant-ear palm shape before baking.'
  },
  {
    clue: '"Things in the evening starry sky"',
    themeWord: 'EXOPLANETS',
    words: ['ATMOSPHERE', 'HABITABLE', 'ORBIT', 'STAR', 'TELESCOPE', 'TRANSIT'],
    difficulty: 'Challenging',
    funFact: 'The Kepler Space Telescope discovered thousands of exoplanets by detecting the tiny dip in starlight when a planet crosses in front of its star.'
  },
  {
    clue: '"Things in the sweet summer garden"',
    themeWord: 'STRAWBERRIES',
    words: ['BERRY', 'BLOSSOM', 'FRUIT', 'LEAF', 'RED', 'RUNNER'],
    difficulty: 'Easy',
    funFact: 'The garden strawberry is not a true berry but an aggregate accessory fruit, with its seeds (achenes) on the exterior flesh.'
  },
  {
    clue: '"Things in the cozy winter fireplace"',
    themeWord: 'CHIMNEYSWEEP',
    words: ['BRUSH', 'CLEAN', 'FLUE', 'LADDER', 'ROOF', 'SOOT'],
    difficulty: 'Medium',
    funFact: 'In British tradition, shaking hands with a chimney sweep on your wedding day is considered good luck.'
  },
  {
    clue: '"Things in the captain\'s sea vessel"',
    themeWord: 'FRIGATE',
    words: ['CANNON', 'CAPTAIN', 'DECK', 'MAST', 'RUDDER', 'SAIL'],
    difficulty: 'Medium',
    funFact: 'Frigates were the fast, maneuverable cruisers of the sailing era, built for patrol and escort missions.'
  },
  {
    clue: '"Things in the spring flower garden"',
    themeWord: 'DAHLIAS',
    words: ['BLOOM', 'COLOR', 'PETAL', 'STALK', 'TUBER', 'VIBRANT'],
    difficulty: 'Easy',
    funFact: 'Dahlias are native to the high mountainous valleys of Mexico and were grown by the Aztecs for food and medicine.'
  },
  {
    clue: '"Things in the delicious Italian kitchen"',
    themeWord: 'TORTELLINI',
    words: ['BROTH', 'CHEESE', 'DOUGH', 'FILLING', 'FOLD', 'PARMESAN'],
    difficulty: 'Easy',
    funFact: 'According to culinary legend in Modena, the distinct belly-button shape of tortellini was modeled after the navel of Venus.'
  },
  {
    clue: '"Things in the morning espresso cup"',
    themeWord: 'MOCHAS',
    words: ['BARISTA', 'CHOCOLATE', 'COFFEE', 'CREAM', 'ESPRESSO', 'MILK'],
    difficulty: 'Easy',
    funFact: 'The mocha is named after the historic Red Sea port of Mocha in Yemen, famous for its chocolatey-noted coffee beans.'
  },
  {
    clue: '"Things in the sweet bakery display"',
    themeWord: 'BISCOTTI',
    words: ['ALMOND', 'BAKED', 'COFFEE', 'CRUNCH', 'DIP', 'DOUGH'],
    difficulty: 'Easy',
    funFact: 'Biscotti translates from Italian as "twice baked" (bis = twice, cotto = baked), designed to stay dry and crisp for long storage.'
  },
  {
    clue: '"Things in the autumn harvest orchard"',
    themeWord: 'APPLEBUTTER',
    words: ['BROWN', 'CINNAMON', 'CLOVE', 'COOKED', 'JAR', 'SPREAD'],
    difficulty: 'Medium',
    funFact: 'Apple butter contains no actual dairy butter; it is a dense, concentrated spiced apple reduction cooked slowly until caramelized.'
  },
  {
    clue: '"Things in the high mountain ski resort"',
    themeWord: 'FREESTYLE',
    words: ['AIR', 'CHALET', 'GOGGLES', 'HALFPIPE', 'JUMP', 'SLOPE'],
    difficulty: 'Medium',
    funFact: 'Freestyle skiing became an official Olympic medal sport at the 1992 Winter Games in Albertville, France.'
  },
  {
    clue: '"Things in the ancient Roman city"',
    themeWord: 'FORUM',
    words: ['ARCH', 'BASILICA', 'COLUMN', 'MARBLE', 'SENATE', 'TEMPLE'],
    difficulty: 'Medium',
    funFact: 'The Roman Forum was the bustling civic, political, and commercial center of the Roman Empire for centuries.'
  },
  {
    clue: '"Things in the delicious French patisserie"',
    themeWord: 'FINANCIERS',
    words: ['ALMOND', 'BATTER', 'BROWN', 'BUTTER', 'GOLD', 'RECTANGLE'],
    difficulty: 'Medium',
    funFact: 'Financier almond cakes were created in the Paris financial district, shaped like gold bars so brokers could eat them without dirtying hands.'
  },
  {
    clue: '"Things in the evening starry sky"',
    themeWord: 'BLACKHOLES',
    words: ['DENSITY', 'GRAVITY', 'HORIZON', 'MASS', 'PHYSICS', 'SINGULARITY'],
    difficulty: 'Challenging',
    funFact: 'The boundary around a black hole beyond which nothing can escape, not even light, is called the event horizon.'
  },
  {
    clue: '"Things in the sweet summer garden"',
    themeWord: 'BLUEBERRIES',
    words: ['BERRY', 'BUSH', 'CUP', 'FRUIT', 'INDIGO', 'SWEET'],
    difficulty: 'Easy',
    funFact: 'Blueberries are one of the only natural foods that are truly blue in color.'
  },
  {
    clue: '"Shelf above the cozy parlor hearth"',
    themeWord: 'MANTELPIECE',
    words: ['CANDLE', 'CARVED', 'CLOCK', 'FRAME', 'LEDGE', 'MARBLE'],
    difficulty: 'Medium',
    funFact: 'The mantelpiece originally served as a hood to catch smoke before evolving into the decorative focal shelf of a parlor.'
  },
  {
    clue: '"Things in the captain\'s sea vessel"',
    themeWord: 'CORVETTE',
    words: ['BOW', 'CANNON', 'DECK', 'FAST', 'MAST', 'SAIL'],
    difficulty: 'Medium',
    funFact: 'Sailing corvettes were small, agile warships carrying a single tier of guns on an open flush deck.'
  },
  {
    clue: '"Things in the spring flower garden"',
    themeWord: 'IRISES',
    words: ['BEARDED', 'BLOOM', 'BLUE', 'PETAL', 'RHIZOME', 'STALK'],
    difficulty: 'Easy',
    funFact: 'The iris is named after the Greek goddess of the rainbow who served as a messenger between heaven and earth.'
  },
  {
    clue: '"Things in the delicious Italian kitchen"',
    themeWord: 'CAPPELLACCI',
    words: ['BUTTER', 'DOUGH', 'FILLING', 'PARMESAN', 'PUMPKIN', 'SAGE'],
    difficulty: 'Challenging',
    funFact: 'Cappellacci di zucca is a Renaissance specialty of Ferrara, filled with roasted butternut squash and nutmeg.'
  },
  {
    clue: '"Things in the morning espresso cup"',
    themeWord: 'FLATWHITE',
    words: ['AUSTRAILA', 'BARISTA', 'CREMA', 'CUP', 'ESPRESSO', 'MICROFOAM'],
    difficulty: 'Easy',
    funFact: 'The flat white was created in Australia and New Zealand in the 1980s, prioritizing silky microfoam over thick froth.'
  },
  {
    clue: '"Things in the sweet bakery display"',
    themeWord: 'SFOGLIATELLE',
    words: ['CRISP', 'DOUGH', 'LAYERS', 'PASTRY', 'RICOTTA', 'SHELL'],
    difficulty: 'Challenging',
    funFact: 'Sfogliatella means "small, thin leaf," describing the ridged shell resembling stacked autumn leaves invented in an Italian monastery in the 17th century.'
  },
  {
    clue: '"Ancient wonders of the Nile Valley"',
    themeWord: 'PHARAOHS',
    words: ['ANKH', 'CHARIOT', 'OBELISK', 'PAPYRUS', 'SPHINX', 'TEMPLE'],
    difficulty: 'Medium',
    funFact: 'Obelisks were carved from a single piece of red granite in Aswan and floated down the Nile on massive wooden barges.'
  },
  {
    clue: '"Classic symphony woodwind section"',
    themeWord: 'WOODWINDS',
    words: ['BASSOON', 'CLARINET', 'FLUTE', 'OBOE', 'PICCOLO', 'SAXOPHONE'],
    difficulty: 'Easy',
    funFact: 'Despite being made of brass, the saxophone is classified as a woodwind instrument because it uses a vibrating single reed.'
  },
  {
    clue: '"Gear inside a mountain climber\'s pack"',
    themeWord: 'ALPINIST',
    words: ['BELAY', 'CARABINER', 'CRAMPON', 'HARNESS', 'PITON', 'ROPE'],
    difficulty: 'Medium',
    funFact: 'Modern ten-point and twelve-point steel crampons revolutionized ice climbing in the early 20th century.'
  },
  {
    clue: '"Found in a medieval blacksmith\'s forge"',
    themeWord: 'SMITHY',
    words: ['ANVIL', 'BELLOWS', 'COAL', 'HAMMER', 'QUENCH', 'TONGS'],
    difficulty: 'Easy',
    funFact: 'Plunging red-hot steel into water or oil ("quenching") locks the carbon crystal structure into hardened martensite.'
  },
  {
    clue: '"Vibrant coral atoll ecosystem"',
    themeWord: 'SEASCAPE',
    words: ['ANEMONE', 'BARRACUDA', 'GROUPER', 'MORAY', 'PARROTFISH', 'URCHIN'],
    difficulty: 'Medium',
    funFact: 'Parrotfish produce up to 85% of the white coral sand found on tropical beaches by grinding coral skeleton with their beak-like teeth.'
  },
  {
    clue: '"Traditional Japanese tea ceremony"',
    themeWord: 'CHANOYU',
    words: ['BAMBOO', 'BOWL', 'CADDY', 'KIMONO', 'MATCHA', 'TATAMI'],
    difficulty: 'Medium',
    funFact: 'The bamboo tea whisk (chasen) is carved from a single piece of seasoned bamboo split into 80 to 120 delicate tines.'
  },
  {
    clue: '"Inside a grand horologist\'s workshop"',
    themeWord: 'CLOCKWORK',
    words: ['BALANCE', 'CHIME', 'ESCAPEMENT', 'GEAR', 'MAINSPRING', 'PINION'],
    difficulty: 'Challenging',
    funFact: 'The mechanical escapement is what gives a mechanical watch or clock its signature rhythmic ticking sound.'
  },
  {
    clue: '"Aromatic Mediterranean herb garden"',
    themeWord: 'HERBARIUM',
    words: ['CHERVIL', 'FENNEL', 'LAVENDER', 'MARJORAM', 'SAVORY', 'TARRAGON'],
    difficulty: 'Medium',
    funFact: 'Marjoram was considered a symbol of happiness by the ancient Greeks and Romans, who wove it into bridal wreaths.'
  },
  {
    clue: '"Classic chess tournament strategy"',
    themeWord: 'CHECKMATE',
    words: ['BISHOP', 'CASTLE', 'GAMBIT', 'KNIGHT', 'PAWN', 'ROOK'],
    difficulty: 'Easy',
    funFact: 'The word "checkmate" derives from the Persian phrase "Shah Mat," meaning "the King is helpless."'
  },
  {
    clue: '"Equipment on a vintage film set"',
    themeWord: 'CINEMA',
    words: ['BOOM', 'CAMERA', 'CLAPPER', 'DOLLY', 'LENS', 'SCRIPT'],
    difficulty: 'Easy',
    funFact: 'The hinged clapperboard was invented by Australian film pioneer Frank Thring to synchronize separate audio and film reels.'
  },
  {
    clue: '"Architectural gems of a Gothic cathedral"',
    themeWord: 'CATHEDRAL',
    words: ['APSE', 'BUTTRESS', 'CLOISTER', 'GARGOYLE', 'NAVE', 'TRANSEPT'],
    difficulty: 'Challenging',
    funFact: 'Flying buttresses allowed medieval master masons to transfer roof weight outward so walls could be filled with stained glass.'
  },
  {
    clue: '"Tools of a traditional bookbinder"',
    themeWord: 'BOOKBINDER',
    words: ['AWL', 'BUCKRAM', 'FOLIO', 'GLUE', 'PRESS', 'THREAD'],
    difficulty: 'Medium',
    funFact: 'Raised bands on the spine of fine leather books originally covered the heavy hemp cords onto which pages were hand-sewn.'
  },
  {
    clue: '"Treasures of a pirate\'s sea chest"',
    themeWord: 'BUCCANEER',
    words: ['COMPASS', 'CUTLASS', 'DOUBLOON', 'LOCKET', 'MAP', 'SPYGLASS'],
    difficulty: 'Easy',
    funFact: 'Spanish gold doubloons were worth two escudos and could be physically cut into "pieces of eight" for smaller change.'
  },
  {
    clue: '"Found in a botanical conservatory"',
    themeWord: 'ORANGERY',
    words: ['CITRUS', 'FOUNTAIN', 'GLASS', 'JASMINE', 'MYRTLE', 'TRELLIS'],
    difficulty: 'Medium',
    funFact: 'Renaissance orangeries were heated masonry pavilions built with tall south-facing windows to shelter citrus trees in winter.'
  },
  {
    clue: '"Classic French bistro menu"',
    themeWord: 'BRASSERIE',
    words: ['BAGUETTE', 'BOUILLON', 'CONFIT', 'CROQUE', 'QUICHE', 'SOUFFLE'],
    difficulty: 'Medium',
    funFact: 'The word "brasserie" originally meant "brewery" in French before coming to describe lively Alsatian-style dining halls in Paris.'
  },
  {
    clue: '"Highland Scottish gathering"',
    themeWord: 'HIGHLANDS',
    words: ['BAGPIPE', 'BONNET', 'CABER', 'CLAN', 'KILT', 'TARTAN'],
    difficulty: 'Easy',
    funFact: 'In the caber toss, competitors are judged on how straight the 175-pound larch pole lands (a "12 o\'clock" turn), not distance.'
  },
  {
    clue: '"Instruments of celestial navigation"',
    themeWord: 'CELESTIAL',
    words: ['ALMANAC', 'ASTROLABE', 'CHRONO', 'COMPASS', 'OCTANT', 'SEXTANT'],
    difficulty: 'Medium',
    funFact: 'By measuring the angle between the horizon and the noon sun or Polaris, a sextant lets mariners determine latitude at sea.'
  },
  {
    clue: '"Classic Venetian carnival mask ball"',
    themeWord: 'MASQUERADE',
    words: ['BROCADE', 'CLOAK', 'DOMINO', 'FEATHER', 'GONDOLA', 'VELVET'],
    difficulty: 'Medium',
    funFact: 'Venetian carnival masks were historically made of papier-mâché and decorated with gold leaf, feathers, and hand-painted enamel.'
  },
  {
    clue: '"Artisanal cheesemaker\'s cellar"',
    themeWord: 'CREAMERY',
    words: ['BRINE', 'CURD', 'MOLD', 'PRESS', 'RENNET', 'WHEY'],
    difficulty: 'Medium',
    funFact: 'Wheels of Parmigiano-Reggiano are tapped with a small silver hammer by master graders listening for tiny internal air pockets.'
  },
  {
    clue: '"Classic Victorian parlor mystery"',
    themeWord: 'WHODUNIT',
    words: ['ALIBI', 'BUTLER', 'CIPHER', 'MANOR', 'MOTIVE', 'SLEUTH'],
    difficulty: 'Easy',
    funFact: 'Edgar Allan Poe\'s 1841 story "The Murders in the Rue Morgue" is widely credited as the first modern detective story.'
  },
  {
    clue: '"Inside a classical luthiers workshop"',
    themeWord: 'LUTHIER',
    words: ['BRIDGE', 'CHISEL', 'EBONY', 'MAPLE', 'ROSIN', 'VARNISH'],
    difficulty: 'Medium',
    funFact: 'Violin backs are traditionally carved from flamed maple, while the resonant top soundboard is crafted from fine-grained spruce.'
  },
  {
    clue: '"Desert oasis caravan stop"',
    themeWord: 'CARAVAN',
    words: ['CAMEL', 'CISTERN', 'DATES', 'DUNE', 'MIRAGE', 'PALM'],
    difficulty: 'Easy',
    funFact: 'Date palms can thrive in extreme desert heat so long as their deep roots reach subterranean oasis water tables.'
  },
  {
    clue: '"Classic apothecary spice cabinet"',
    themeWord: 'SPICERY',
    words: ['ANISE', 'CLOVE', 'CORIANDER', 'MACE', 'NUTMEG', 'SAFFRON'],
    difficulty: 'Medium',
    funFact: 'Nutmeg and mace both come from the exact same tropical tree: nutmeg is the seed kernel and mace is its lacy red covering.'
  },
  {
    clue: '"Winter Nordic ski lodge"',
    themeWord: 'NORDIC',
    words: ['BIRCH', 'CHALET', 'FIR', 'HEARTH', 'SAUNA', 'SLEIGH'],
    difficulty: 'Easy',
    funFact: 'Traditional Finnish saunas heat volcanic peridotite stones on a stove so water thrown on them produces gentle steam ("löyly").'
  },
  {
    clue: '"Tools of a master calligrapher"',
    themeWord: 'SCRIPTORIUM',
    words: ['BLOTTER', 'INKWELL', 'NIB', 'PARCHMENT', 'QUILL', 'VELLUM'],
    difficulty: 'Challenging',
    funFact: 'Goose and swan wing feathers made the finest medieval quills, cured in heated sand before cutting the split nib.'
  },
  {
    clue: '"Classic boardwalk amusement pier"',
    themeWord: 'BOARDWALK',
    words: ['ARCADE', 'CAROUSEL', 'COASTER', 'MIDWAY', 'PAVILION', 'TAFFY'],
    difficulty: 'Easy',
    funFact: 'Saltwater taffy became famous on the Atlantic City boardwalk in the 1880s—even though the recipe contains no actual ocean water.'
  },
  {
    clue: '"Inside a glassblower\'s furnace studio"',
    themeWord: 'GLASSWORKS',
    words: ['ANNEAL', 'BLOWPIPE', 'CRUCIBLE', 'FURNACE', 'MOLTEN', 'PONTIL'],
    difficulty: 'Challenging',
    funFact: 'The slight scar on the bottom of hand-blown glassware is the "pontil mark," where the solid iron holding rod was snapped off.'
  },
  {
    clue: '"Autumn woodland foraging basket"',
    themeWord: 'WOODLAND',
    words: ['ACORN', 'BRAMBLE', 'CHESTNUT', 'FERN', 'HAZELNUT', 'TRUFFLE'],
    difficulty: 'Easy',
    funFact: 'Black and white truffles grow underground in symbiotic mycorrhizal partnerships with the roots of oak, hazel, and beech trees.'
  },
  {
    clue: '"Classic railway sleeping car"',
    themeWord: 'PULLMAN',
    words: ['BERTH', 'CONDUCTOR', 'COUPE', 'DINER', 'PORTER', 'TICKET'],
    difficulty: 'Medium',
    funFact: 'George Pullman introduced his luxurious palace sleeping cars in the 1860s, complete with chandeliers, plush upholstery, and dining service.'
  },
  {
    clue: '"Found in a traditional falconer\'s mews"',
    themeWord: 'FALCONRY',
    words: ['GAUNTLET', 'HOOD', 'JESSES', 'LURE', 'PERCH', 'TALON'],
    difficulty: 'Medium',
    funFact: 'The phrase "wrapped around your little finger" comes from falconry, where leather jesses were looped around the falconer\'s finger.'
  }
];

export const UNIQUE_PUZZLE_BANK: PuzzleTemplate[] = [
  ...COMPOUND_PUZZLES_BANK,
  ...THEMATIC_PUZZLES_BANK,
];

// Generates a consistent, 100% unique, non-duplicating puzzle for ANY date
// Ensures compound word association puzzles appear exactly 1 in 3 days!
export function getPuzzleForDate(dateStr: string): Puzzle {
  // 1. Check if date is a significant holiday / special date (e.g. 11-01 Today's Redone Rock puzzle, 10-31 Halloween, 11-05 Bonfire Night, etc.)
  const monthDay = dateStr.slice(5); // e.g. '11-01'
  if (SPECIAL_DATE_PUZZLES[monthDay]) {
    const special = SPECIAL_DATE_PUZZLES[monthDay];
    const sortedWords = [...special.words].sort((a, b) => a.localeCompare(b));
    return {
      id: dateStr,
      date: dateStr,
      formattedDate: formatDayString(dateStr),
      themeClue: special.clue,
      themeWord: special.themeWord,
      words: sortedWords,
      difficulty: special.difficulty,
      funFact: special.funFact,
    };
  }

  // 2. Select from the bank: Compound word puzzles appear exactly 1 in 3 days!
  const [y, m, d] = dateStr.split('-').map(Number);
  const daysSinceEpoch = Math.floor(
    (Date.UTC(y, m - 1, d) - Date.UTC(2026, 0, 1)) / (1000 * 60 * 60 * 24)
  );

  // Exactly 1 in 3 days is a compound puzzle (where words precede or follow the theme word)
  const isCompoundDay = (daysSinceEpoch % 3 + 3) % 3 === 1;

  let theme: PuzzleTemplate;
  if (isCompoundDay) {
    const cIndex = Math.abs(Math.floor(daysSinceEpoch / 3) + y * 5) % COMPOUND_PUZZLES_BANK.length;
    theme = COMPOUND_PUZZLES_BANK[cIndex];
  } else {
    const tCycle = Math.floor((daysSinceEpoch * 2) / 3);
    const tIndex = Math.abs(tCycle + y * 7) % THEMATIC_PUZZLES_BANK.length;
    theme = THEMATIC_PUZZLES_BANK[tIndex];
  }

  const sortedWords = [...theme.words].sort((a, b) => a.localeCompare(b));

  return {
    id: dateStr,
    date: dateStr,
    formattedDate: formatDayString(dateStr),
    themeClue: theme.clue,
    themeWord: theme.themeWord,
    words: sortedWords,
    difficulty: theme.difficulty,
    funFact: theme.funFact,
  };
}

// Generate the full archive from the start of the year (January 1) up to today's London date
export function getArchivePuzzles(): Puzzle[] {
  const todayLondon = getLondonDateString();
  const currentYear = todayLondon.slice(0, 4);

  const endDate = new Date(todayLondon + 'T12:00:00Z');
  const startDate = new Date(`${currentYear}-01-01T12:00:00Z`);

  const puzzles: Puzzle[] = [];
  const curr = new Date(endDate);

  while (curr >= startDate) {
    const dStr = curr.toISOString().split('T')[0];
    puzzles.push(getPuzzleForDate(dStr));
    curr.setDate(curr.getDate() - 1);
  }

  return puzzles;
}

export const DAILY_PUZZLES: Puzzle[] = getArchivePuzzles();

export function getTodayPuzzle(): Puzzle {
  const todayLondon = getLondonDateString();
  return getPuzzleForDate(todayLondon);
}

export function getPuzzleById(id: string): Puzzle | undefined {
  return getPuzzleForDate(id);
}

export function getRandomPuzzle(): Puzzle {
  const puzzles = getArchivePuzzles();
  const index = Math.floor(Math.random() * puzzles.length);
  return puzzles[index];
}
