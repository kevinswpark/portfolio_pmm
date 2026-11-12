// Shadow Storm sample data. The game, its clans, players, prices, fees, and balances are all invented for this demo.
export const RATE = { koban: 1000, jade: 100 }; // units per $1.00
export const STATS = ['Power', 'Speed', 'Stealth', 'Focus'];
export const TYPE_LABEL = { weapon: 'Weapon', armor: 'Armor', scroll: 'Scroll', gear: 'Gear', special: 'Special', currency: 'Currency' };

export const ITEMS = {
  kunai: { name: 'Training Kunai', type: 'weapon', rarity: 'common', desc: 'A plain, balanced blade. Every shinobi starts here.', stats: [4, 5, 2, 1] },
  ironstars: { name: 'Iron Star Shuriken', type: 'weapon', rarity: 'common', desc: 'A set of three four-point throwing stars.', stats: [5, 7, 3, 2] },
  stormwheel: { name: 'Stormwheel Shuriken', type: 'weapon', rarity: 'epic', desc: 'A folding great-shuriken with a storm core. It comes back.', stats: [14, 11, 4, 8] },
  katana: { name: 'Moonsplitter Katana', type: 'weapon', rarity: 'legendary', desc: 'Forged on the ridge during a lunar storm. Cuts clean through rain.', stats: [19, 12, 6, 10] },
  tanto: { name: 'Ember Tanto', type: 'weapon', rarity: 'rare', desc: 'A short blade that never fully cools.', stats: [9, 9, 5, 3] },
  kusarigama: { name: 'Reaper’s Kusarigama', type: 'weapon', rarity: 'rare', desc: 'Sickle and weighted chain. Awkward until it isn’t.', stats: [10, 6, 4, 6] },
  scrollthunder: { name: 'Scroll of the Thunder Step', type: 'scroll', rarity: 'epic', desc: 'Teaches a dash that arrives before its sound.', stats: [6, 15, 5, 12] },
  scrollfog: { name: 'Scroll of Veiling Fog', type: 'scroll', rarity: 'rare', desc: 'Fills a courtyard with fog for one long breath.', stats: [2, 4, 12, 8] },
  scrollserpent: { name: 'Scroll of the Storm Serpent', type: 'scroll', rarity: 'legendary', desc: 'A sealed contract with something that lives in the clouds.', stats: [16, 8, 7, 18] },
  cuirass: { name: 'Stormlace Cuirass', type: 'armor', rarity: 'epic', desc: 'Lamellar plates laced in vermilion cord. Lighter than it looks.', stats: [12, 5, 4, 9] },
  kote: { name: 'Iron Kote', type: 'armor', rarity: 'rare', desc: 'Forearm guards that turn a blade and keep the wrist free.', stats: [8, 6, 3, 4] },
  headband: { name: 'Steel-Brow Headband', type: 'armor', rarity: 'common', desc: 'A riveted plate on indigo cloth. Keeps hair and doubt out of your eyes.', stats: [3, 2, 2, 5] },
  tabi: { name: 'Silent-Step Tabi', type: 'armor', rarity: 'rare', desc: 'Split-toe boots with soft soles. Roof tiles stay quiet.', stats: [2, 9, 11, 3] },
  menpo: { name: 'Oni Half-Mask', type: 'armor', rarity: 'epic', desc: 'Lacquered and fanged. Most fights end when it turns to face you.', stats: [10, 4, 9, 9] },
  kasa: { name: 'Wanderer’s Kasa', type: 'armor', rarity: 'rare', desc: 'A wide straw hat. Hides a face, sheds a storm.', stats: [2, 4, 10, 7] },
  smoke: { name: 'Smoke Bomb Trio', type: 'gear', rarity: 'common', desc: 'Three ways to leave a conversation.', stats: [1, 4, 8, 2] },
  caltrops: { name: 'Caltrop Scatter', type: 'gear', rarity: 'common', desc: 'Whoever follows you will wish they hadn’t.', stats: [3, 2, 6, 2] },
  omamori: { name: 'Thunder Charm', type: 'gear', rarity: 'epic', desc: 'A brocade charm that hums before lightning strikes.', stats: [5, 5, 5, 14] },
  bell: { name: 'Storm Bell', type: 'gear', rarity: 'rare', desc: 'Rings once when an enemy draws steel nearby.', stats: [2, 5, 6, 10] },
  hook: { name: 'Grappling Hook', type: 'gear', rarity: 'rare', desc: 'Four tines and a silk rope. Every wall is a door.', stats: [4, 10, 6, 3] },
  pass: { name: 'Storm Pass', type: 'special', rarity: 'epic', desc: 'Monthly perks and a bonus stash of Koban.' },
  forge: { name: 'Forge Kit', type: 'special', rarity: 'common', desc: 'Whetstone and hammer. Raises one piece of gear by a level.' },
  daruma: { name: 'Lucky Daruma', type: 'special', rarity: 'rare', desc: 'Make a wish, get a random piece of gear, rare to epic.' },
  kobansmall: { name: 'Pouch of Koban', type: 'currency', rarity: 'common', desc: '5,000 Koban, added the moment you pay.' },
  kobanchest: { name: 'Chest of Koban', type: 'currency', rarity: 'rare', desc: '12,000 Koban, added the moment you pay.' },
  kobanhoard: { name: 'Warlord’s Hoard', type: 'currency', rarity: 'epic', desc: '30,000 Koban, added the moment you pay.' },
  jadepouch: { name: 'Jade Shard Pouch', type: 'currency', rarity: 'rare', desc: '120 Jade for premium gear.' },
  jadevault: { name: 'Jade Vault', type: 'currency', rarity: 'epic', desc: '700 Jade for premium gear.' },
};
// scrollfog reuses the mist scroll model
export const MODEL_OF = { scrollfog: 'scrollmist' };

// price: { k: Koban } | { j: Jade } | { usd: dollars, per?: 'mo' }
export const STORE = [
  { sku: 'pass', price: { usd: 9.99, per: 'mo' }, tabs: ['featured'], kind: 'pass' },
  { sku: 'forge', price: { k: 2500 }, tabs: ['featured', 'gear'], kind: 'kit' },
  { sku: 'daruma', price: { k: 1000 }, tabs: ['featured', 'gear'], kind: 'daruma' },
  { sku: 'katana', price: { usd: 12 }, tabs: ['featured', 'weapons'], kind: 'item' },
  { sku: 'stormwheel', price: { j: 220 }, tabs: ['weapons'], kind: 'item' },
  { sku: 'ironstars', price: { k: 1800 }, tabs: ['weapons'], kind: 'item' },
  { sku: 'kusarigama', price: { k: 6500 }, tabs: ['weapons'], kind: 'item' },
  { sku: 'cuirass', price: { j: 260 }, tabs: ['armor'], kind: 'item' },
  { sku: 'menpo', price: { k: 9500 }, tabs: ['armor'], kind: 'item' },
  { sku: 'kote', price: { k: 4800 }, tabs: ['armor'], kind: 'item' },
  { sku: 'headband', price: { k: 1200 }, tabs: ['armor'], kind: 'item' },
  { sku: 'scrollserpent', price: { usd: 8 }, tabs: ['gear'], kind: 'item' },
  { sku: 'scrollthunder', price: { j: 180 }, tabs: ['gear'], kind: 'item' },
  { sku: 'scrollfog', price: { k: 4000 }, tabs: ['gear'], kind: 'item' },
  { sku: 'hook', price: { k: 3600 }, tabs: ['gear'], kind: 'item' },
  { sku: 'smoke', price: { k: 900 }, tabs: ['gear'], kind: 'item' },
  { sku: 'caltrops', price: { k: 700 }, tabs: ['gear'], kind: 'item' },
  { sku: 'kobansmall', price: { usd: 4.99 }, tabs: ['currency'], kind: 'pack', grant: { koban: 5000 } },
  { sku: 'kobanchest', price: { usd: 9.99 }, tabs: ['currency'], kind: 'pack', grant: { koban: 12000 } },
  { sku: 'kobanhoard', price: { usd: 19.99 }, tabs: ['currency'], kind: 'pack', grant: { koban: 30000 } },
  { sku: 'jadepouch', price: { usd: 0.99 }, tabs: ['currency'], kind: 'pack', grant: { jade: 120 } },
  { sku: 'jadevault', price: { usd: 4.99 }, tabs: ['currency'], kind: 'pack', grant: { jade: 700 } },
];
export const STORE_TABS = [['featured', 'Featured'], ['currency', 'Currency'], ['weapons', 'Weapons'], ['armor', 'Armor'], ['gear', 'Scrolls & gear']];
export const DARUMA_POOL = ['bell', 'hook', 'tanto', 'kasa', 'omamori'];

export const MARKET = [
  { mid: 'm1', id: 'tanto', lvl: 2, price: 8.5, seller: 'Ashfall Rin' },
  { mid: 'm2', id: 'scrollthunder', lvl: 1, price: 22, seller: 'Nine-Lantern Jo' },
  { mid: 'm3', id: 'kasa', lvl: 1, price: 6.25, seller: 'Quiet Heron' },
];
export const SUGGESTED = { common: 2.5, rare: 7.5, epic: 18, legendary: 40 };
export const MARKET_FEE = 0.05;

export const PLAYER = { name: 'RaijuRunner', level: 24, clan: 'Ember Lotus', code: 'STORM-RAI7', email: 'r•••@example.com', stats: [['12', 'Provinces'], ['87', 'Missions'], ['200', 'Clan size']] };
export const COPY = {
  kicker: 'Stormwatch Ridge · Chapter II',
  hint: 'The storm breaks at dusk. Your clan is waiting on the ridge.',
  store: 'Purchases charge your embedded wallet directly. Koban buys settle instantly.',
  inventory: 'Equip gear, spend a Forge Kit to upgrade, or list an item for other players to buy.',
  market: 'Buy from other players, or sell your own gear. Sales pay out to your wallet in USD.',
  referral: 'Referral earnings pay out to your wallet. From there you can cash out to your bank.',
  ranks: 'Season prizes are paid in cash the moment you claim them.',
  creator: 'Every way you earn as a creator, tracked in one place. Sample data.',
  profile: 'Player record and demo controls.',
  train: 'Hit as many targets as you can in 20 seconds. Every hit pays Koban.',
};
export const REFERRALS = [['Mika T.', 'Qualified', 5], ['Jonah P.', 'Qualified', 5], ['Aiko S.', 'Pending', 0]];
export const STANDINGS = [['Hollow Reed', 18420, 500], ['Night Heron', 17110, 300], ['Ash & Ember', 16640, 150], ['Ember Lotus', 15980, 46]];
export const CREATOR = [['Item sales', 640.2, 62, [3, 4, 4, 6, 7, 9]], ['Storm Pass shares', 275.5, 27, [2, 3, 3, 4, 6, 7]], ['Marketplace fees', 118.3, 11, [1, 1, 2, 2, 3, 4]]];

export const CASH_METHODS = [
  { key: 'bank', title: 'Bank account ••4821', sub: '2% fee · 1 to 3 business days', fee: 0.02, eta: '1 to 3 business days', icon: 'bank', dest: 'Bank ••4821' },
  { key: 'card', title: 'Debit card ••7702', sub: '3.5% fee · within minutes', fee: 0.035, eta: 'Within minutes', icon: 'card', dest: 'Card ••7702' },
  { key: 'gift', title: 'Digital gift card', sub: 'No fee · instant', fee: 0, eta: 'Instant', icon: 'gift', dest: 'Gift card' },
];
export const LIMITS = { addMax: 500, cashMin: 5 };
export const GIFT_CODE = { code: 'STORM10', usd: 10 };
export const ACCENTS = { verm: ['Vermilion', '#e8442a'], storm: ['Storm blue', '#2f8fe0'], jade: ['Jade', '#149c74'] };
