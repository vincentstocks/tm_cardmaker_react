import { BlockAsset, BlockPreset, AssetCategory } from '../types';
import { CARD_WIDTH_PX, CARD_HEIGHT_PX } from '../utils/cardDimensions';

// Scale helpers: convert original 826×1126 coordinates to 750×1039
const sx = (v: number) => Math.round(v * CARD_WIDTH_PX / 826);
const sy = (v: number) => Math.round(v * CARD_HEIGHT_PX / 1126);

// All block assets from the original tm_cardmaker
// Each entry maps to a PNG in public/assets/{category}/{src}.png
export const blockAssets: BlockAsset[] = [
  // Templates
  { id: 'tpl-green-normal', category: 'templates', label: 'Green Card', src: 'green_normal', path: '/assets/templates/green_normal.png' },
  { id: 'tpl-green-small-bottom', category: 'templates', label: 'Green Small Bottom', src: 'green_small_bottom', path: '/assets/templates/green_small_bottom.png' },
  { id: 'tpl-green-big-bottom', category: 'templates', label: 'Green Big Bottom', src: 'green_big_bottom', path: '/assets/templates/green_big_bottom.png' },
  { id: 'tpl-blue-normal', category: 'templates', label: 'Blue Card', src: 'blue_normal', path: '/assets/templates/blue_normal.png' },
  { id: 'tpl-blue-big-bottom', category: 'templates', label: 'Blue Big Bottom', src: 'blue_big_bottom', path: '/assets/templates/blue_big_bottom.png' },
  { id: 'tpl-blue-big-top', category: 'templates', label: 'Blue Big Top', src: 'blue_big_top', path: '/assets/templates/blue_big_top.png' },
  { id: 'tpl-red-normal', category: 'templates', label: 'Red Card', src: 'red_normal', path: '/assets/templates/red_normal.png' },
  { id: 'tpl-red-small-bottom', category: 'templates', label: 'Red Small Bottom', src: 'red_small_bottom', path: '/assets/templates/red_small_bottom.png' },
  { id: 'tpl-prelude', category: 'templates', label: 'Prelude', src: 'prelude', path: '/assets/templates/prelude.png' },
  { id: 'tpl-corporation', category: 'templates', label: 'Corporation', src: 'corporation', path: '/assets/templates/corporation.png' },
  { id: 'tpl-card-back', category: 'templates', label: 'Card Back', src: 'tm-card-back-v2', path: '/assets/templates/tm-card-back-v2.png' },
  { id: 'tpl-prelude-back', category: 'templates', label: 'Prelude Back', src: 'tm-prel-back', path: '/assets/templates/tm-prel-back.png' },
  { id: 'tpl-corporation-back', category: 'templates', label: 'Corporation Back', src: 'tm-corp-back', path: '/assets/templates/tm-corp-back.png' },

  // Global Parameters
  { id: 'gp-oxygen', category: 'globalparameters', label: 'Oxygen', src: 'oxygen', path: '/assets/globalparameters/oxygen.png' },
  { id: 'gp-temperature', category: 'globalparameters', label: 'Temperature', src: 'temperature', path: '/assets/globalparameters/temperature.png' },
  { id: 'gp-venus', category: 'globalparameters', label: 'Venus', src: 'venus', path: '/assets/globalparameters/venus.png' },

  // Misc
  { id: 'misc-megacredit', category: 'misc', label: 'Megacredit', src: 'megacredit', path: '/assets/misc/megacredit.png', otherBgId: 'misc-other-player-bg' },
  { id: 'misc-other-player-bg', category: 'misc', label: 'Other Player BG', src: 'other_player_background', path: '/assets/misc/other_player_background.png', hidden: true },
  { id: 'misc-arrow', category: 'misc', label: 'Arrow', src: 'arrow', path: '/assets/misc/arrow.png' },
  { id: 'misc-asterisk', category: 'misc', label: 'Asterisk', src: 'asterisc', path: '/assets/misc/asterisc.png' },
  { id: 'misc-slash', category: 'misc', label: 'Slash', src: 'bar', path: '/assets/misc/bar.png' },
  { id: 'misc-chairman', category: 'misc', label: 'Chairman', src: 'chairman', path: '/assets/misc/chairman.png' },
  { id: 'misc-colon', category: 'misc', label: 'Colon', src: 'colon', path: '/assets/misc/colon.png' },
  { id: 'misc-delegate', category: 'misc', label: 'Delegate', src: 'delegate', path: '/assets/misc/delegate.png' },
  { id: 'misc-influence', category: 'misc', label: 'Influence', src: 'influence', path: '/assets/misc/influence.png' },
  { id: 'misc-party-leader', category: 'misc', label: 'Party Leader', src: 'party_leader', path: '/assets/misc/party_leader.png' },
  { id: 'misc-corp-tag-holder', category: 'misc', label: 'Tag Holder', src: 'corp_tag_holder', path: '/assets/misc/corp_tag_holder.png' },
  { id: 'misc-effect', category: 'misc', label: 'Effect (bg)', src: 'effect', path: '/assets/misc/effect.png' },

  // Parties
  { id: 'party-bureacrats', category: 'parties', label: 'Bureaucrats', src: 'bureacrats', path: '/assets/parties/bureacrats.png' },
  { id: 'party-centrists', category: 'parties', label: 'Centrists', src: 'centrists', path: '/assets/parties/centrists.png' },
  { id: 'party-empower', category: 'parties', label: 'Empower', src: 'empower', path: '/assets/parties/empower.png' },
  { id: 'party-greens', category: 'parties', label: 'Greens', src: 'greens', path: '/assets/parties/greens.png' },
  { id: 'party-kelvinists', category: 'parties', label: 'Kelvinists', src: 'kelvinists', path: '/assets/parties/kelvinists.png' },
  { id: 'party-mars-first', category: 'parties', label: 'Mars First', src: 'mars_first', path: '/assets/parties/mars_first.png' },
  { id: 'party-populists', category: 'parties', label: 'Populists', src: 'populists', path: '/assets/parties/populists.png' },
  { id: 'party-reds', category: 'parties', label: 'Reds', src: 'reds', path: '/assets/parties/reds.png' },
  { id: 'party-scientists', category: 'parties', label: 'Scientists', src: 'scientists', path: '/assets/parties/scientists.png' },
  { id: 'party-spome', category: 'parties', label: 'Spome', src: 'spome', path: '/assets/parties/spome.png' },
  { id: 'party-transhumanists', category: 'parties', label: 'Transhumanists', src: 'transhumanists', path: '/assets/parties/transhumanists.png' },
  { id: 'party-unity', category: 'parties', label: 'Unity', src: 'unity', path: '/assets/parties/unity.png' },

  // Requirements
  { id: 'req-max-big', category: 'requisites', label: 'Max Requirement', src: 'max_big', path: '/assets/requisites/max_big.png' },
  { id: 'req-min-big', category: 'requisites', label: 'Min Requirement (big)', src: 'min_big', path: '/assets/requisites/min_big.png' },
  { id: 'req-min-medium', category: 'requisites', label: 'Min Requirement', src: 'min_medium', path: '/assets/requisites/min_medium.png' },
  { id: 'req-min-small', category: 'requisites', label: 'Min Requirement (small)', src: 'min_small', path: '/assets/requisites/min_small.png' },
  { id: 'req-normal', category: 'requisites', label: 'No Requirement', src: 'normal', path: '/assets/requisites/normal.png' },

  // Resources
  { id: 'res-animal', category: 'resources', label: 'Animal', src: 'animal', path: '/assets/resources/animal.png', otherBgId: 'res-other-player-bg' },
  { id: 'res-card', category: 'resources', label: 'Card', src: 'card', path: '/assets/resources/card.png', otherBgId: 'res-other-player-bg' },
  { id: 'res-data', category: 'resources', label: 'Data', src: 'data', path: '/assets/resources/data.png', otherBgId: 'res-other-player-bg' },
  { id: 'res-fighter', category: 'resources', label: 'Fighter', src: 'fighter', path: '/assets/resources/fighter.png', otherBgId: 'res-other-player-bg' },
  { id: 'res-floater', category: 'resources', label: 'Floater', src: 'floater', path: '/assets/resources/floater.png', otherBgId: 'res-other-player-bg' },
  { id: 'res-heat', category: 'resources', label: 'Heat', src: 'heat', path: '/assets/resources/heat.png', otherBgId: 'res-other-player-bg' },
  { id: 'res-microbe', category: 'resources', label: 'Microbe', src: 'microbe', path: '/assets/resources/microbe.png', otherBgId: 'res-other-player-bg' },
  { id: 'res-other-player-bg', category: 'resources', label: 'Other Player BG', src: 'other_player_background', path: '/assets/resources/other_player_background.png', hidden: true },
  { id: 'res-plant', category: 'resources', label: 'Plant', src: 'plant', path: '/assets/resources/plant.png', otherBgId: 'res-other-player-bg' },
  { id: 'res-power', category: 'resources', label: 'Power', src: 'power', path: '/assets/resources/power.png', otherBgId: 'res-other-player-bg' },
  { id: 'res-radiation', category: 'resources', label: 'Radiation', src: 'radiation', path: '/assets/resources/radiation.png', otherBgId: 'res-other-player-bg' },
  { id: 'res-science', category: 'resources', label: 'Science', src: 'science', path: '/assets/resources/science.png', otherBgId: 'res-other-player-bg' },
  { id: 'res-steel', category: 'resources', label: 'Steel', src: 'steel', path: '/assets/resources/steel.png', otherBgId: 'res-other-player-bg' },
  { id: 'res-titanium', category: 'resources', label: 'Titanium', src: 'titanium', path: '/assets/resources/titanium.png', otherBgId: 'res-other-player-bg' },
  { id: 'res-TR', category: 'resources', label: 'TR', src: 'TR', path: '/assets/resources/TR.png', otherBgId: 'res-other-player-bg' },
  { id: 'res-wild', category: 'resources', label: 'Wild', src: 'wild', path: '/assets/resources/wild.png', otherBgId: 'res-other-player-bg' },

  // Tags
  { id: 'tag-animal', category: 'tags', label: 'Animal', src: 'animal', path: '/assets/tags/animal.png', otherBgId: 'tag-other-player-bg' },
  { id: 'tag-building', category: 'tags', label: 'Building', src: 'building', path: '/assets/tags/building.png', otherBgId: 'tag-other-player-bg' },
  { id: 'tag-city', category: 'tags', label: 'City', src: 'city', path: '/assets/tags/city.png', otherBgId: 'tag-other-player-bg' },
  { id: 'tag-earth', category: 'tags', label: 'Earth', src: 'earth', path: '/assets/tags/earth.png', otherBgId: 'tag-other-player-bg' },
  { id: 'tag-event', category: 'tags', label: 'Event', src: 'event', path: '/assets/tags/event.png', otherBgId: 'tag-other-player-bg' },
  { id: 'tag-galactic', category: 'tags', label: 'Galactic', src: 'galactic', path: '/assets/tags/galactic.png', otherBgId: 'tag-other-player-bg' },
  { id: 'tag-infrastructure', category: 'tags', label: 'Infrastructure', src: 'infrastructure', path: '/assets/tags/infrastructure.png', otherBgId: 'tag-other-player-bg' },
  { id: 'tag-jovian', category: 'tags', label: 'Jovian', src: 'jovian', path: '/assets/tags/jovian.png', otherBgId: 'tag-other-player-bg' },
  { id: 'tag-mars', category: 'tags', label: 'Mars', src: 'mars', path: '/assets/tags/mars.png', otherBgId: 'tag-other-player-bg' },
  { id: 'tag-microbe', category: 'tags', label: 'Microbe', src: 'microbe', path: '/assets/tags/microbe.png', otherBgId: 'tag-other-player-bg' },
  { id: 'tag-moon', category: 'tags', label: 'Moon', src: 'moon', path: '/assets/tags/moon.png', otherBgId: 'tag-other-player-bg' },
  { id: 'tag-other-player-bg', category: 'tags', label: 'Other Player BG', src: 'other_player_background', path: '/assets/tags/other_player_background.png', hidden: true },
  { id: 'tag-planetary', category: 'tags', label: 'Planetary', src: 'planetary', path: '/assets/tags/planetary.png', otherBgId: 'tag-other-player-bg' },
  { id: 'tag-plant', category: 'tags', label: 'Plant', src: 'plant', path: '/assets/tags/plant.png', otherBgId: 'tag-other-player-bg' },
  { id: 'tag-power', category: 'tags', label: 'Power', src: 'power', path: '/assets/tags/power.png', otherBgId: 'tag-other-player-bg' },
  { id: 'tag-radioactive', category: 'tags', label: 'Radioactive', src: 'radioactive', path: '/assets/tags/radioactive.png', otherBgId: 'tag-other-player-bg' },
  { id: 'tag-science', category: 'tags', label: 'Science', src: 'science', path: '/assets/tags/science.png', otherBgId: 'tag-other-player-bg' },
  { id: 'tag-space', category: 'tags', label: 'Space', src: 'space', path: '/assets/tags/space.png', otherBgId: 'tag-other-player-bg' },
  { id: 'tag-venus', category: 'tags', label: 'Venus', src: 'venus', path: '/assets/tags/venus.png', otherBgId: 'tag-other-player-bg' },
  { id: 'tag-wild', category: 'tags', label: 'Wild', src: 'wild', path: '/assets/tags/wild.png', otherBgId: 'tag-other-player-bg' },
  { id: 'tag-multitag', category: 'tags', label: 'Multitag', src: 'multitag', path: '/assets/tags/multitag.png', otherBgId: 'tag-other-player-bg' },

  // Tiles
  { id: 'tile-city', category: 'tiles', label: 'City', src: 'city', path: '/assets/tiles/city.png', otherBgId: 'tile-other-player-bg' },
  { id: 'tile-colony', category: 'tiles', label: 'Colony', src: 'colony', path: '/assets/tiles/colony.png' },
  { id: 'tile-empty', category: 'tiles', label: 'Empty', src: 'empty', path: '/assets/tiles/empty.png', otherBgId: 'tile-other-player-bg' },
  { id: 'tile-greenery-no-o2', category: 'tiles', label: 'Greenery (no O2)', src: 'greenery_no_O2', path: '/assets/tiles/greenery_no_O2.png', otherBgId: 'tile-other-player-bg' },
  { id: 'tile-greenery', category: 'tiles', label: 'Greenery', src: 'greenery', path: '/assets/tiles/greenery.png', otherBgId: 'tile-other-player-bg' },
  { id: 'tile-ocean', category: 'tiles', label: 'Ocean', src: 'ocean', path: '/assets/tiles/ocean.png', otherBgId: 'tile-other-player-bg' },
  { id: 'tile-off-world-city', category: 'tiles', label: 'Off-world City', src: 'off-world_city', path: '/assets/tiles/off-world_city.png', otherBgId: 'tile-other-player-bg' },
  { id: 'tile-special', category: 'tiles', label: 'Special', src: 'special', path: '/assets/tiles/special.png', otherBgId: 'tile-other-player-bg' },
  { id: 'tile-trade', category: 'tiles', label: 'Trade', src: 'trade', path: '/assets/tiles/trade.png' },
  { id: 'tile-other-player-bg', category: 'tiles', label: 'Other Player BG', src: 'other_player_background', path: '/assets/tiles/other_player_background.png', hidden: true },

  // VPs
  { id: 'vp-1-for', category: 'VPs', label: 'VP 1/', src: '1_for', path: '/assets/VPs/1_for.png' },
  { id: 'vp-1', category: 'VPs', label: '1 VP', src: '1', path: '/assets/VPs/1.png' },
  { id: 'vp-2-for', category: 'VPs', label: 'VP 2/', src: '2_for', path: '/assets/VPs/2_for.png' },
  { id: 'vp-2', category: 'VPs', label: '2 VP', src: '2', path: '/assets/VPs/2.png' },
  { id: 'vp-3', category: 'VPs', label: '3 VP', src: '3', path: '/assets/VPs/3.png' },
  { id: 'vp-4', category: 'VPs', label: '4 VP', src: '4', path: '/assets/VPs/4.png' },
  { id: 'vp-5', category: 'VPs', label: '5 VP', src: '5', path: '/assets/VPs/5.png' },
  { id: 'vp-blank', category: 'VPs', label: 'VP background', src: 'blank', path: '/assets/VPs/blank.png' },
  { id: 'vp-negative', category: 'VPs', label: '-VP', src: 'VPnegative', path: '/assets/VPs/VPnegative.png' },
  { id: 'vp-n-for', category: 'VPs', label: '/ VP', src: 'n_for', path: '/assets/VPs/n_for.png' },

  // Production boxes (hidden helper assets)
  { id: 'prod-nxn', category: 'productionboxes', label: 'Production NxN', src: 'nxn', path: '/assets/productionboxes/nxn.png', hidden: true },
];

// Get visible assets by category
export function getAssetsByCategory(category: AssetCategory): BlockAsset[] {
  return blockAssets.filter(a => a.category === category && !a.hidden);
}

// Get all visible categories with their assets
export function getAssetCatalog(): { category: AssetCategory; label: string; assets: BlockAsset[] }[] {
  const categories: { category: AssetCategory; label: string }[] = [
    { category: 'templates', label: 'Templates' },
    { category: 'tags', label: 'Tags' },
    { category: 'resources', label: 'Resources' },
    { category: 'tiles', label: 'Tiles' },
    { category: 'VPs', label: 'VPs' },
    { category: 'requisites', label: 'Requirements' },
    { category: 'globalparameters', label: 'Global Parameters' },
    { category: 'parties', label: 'Parties' },
    { category: 'misc', label: 'Misc' },
  ];

  return categories.map(c => ({
    ...c,
    assets: getAssetsByCategory(c.category),
  }));
}

// Presets from the original app
export const presets: Record<string, BlockPreset[]> = {
  tags: [
    { label: 'First Tag', x: sx(639), y: sy(67), width: sx(110), height: sy(110) },
    { label: 'Second Tag', x: sx(524), y: sy(67), width: sx(110), height: sy(110) },
    { label: 'Third Tag', x: sx(410), y: sy(67), width: sx(110), height: sy(110) },
    { label: 'Small Tag', x: sx(330), y: sy(536), width: sx(82), height: sy(82) },
    { label: 'First (Prel)', x: sx(937), y: sy(67), width: sx(110), height: sy(110) },
    { label: 'Second (Prel)', x: sx(822), y: sy(67), width: sx(110), height: sy(110) },
    { label: 'Third (Prel)', x: sx(708), y: sy(67), width: sx(110), height: sy(110) },
    { label: 'First (Corp)', x: sx(937), y: sy(90), width: sx(110), height: sy(110) },
    { label: 'Second (Corp)', x: sx(822), y: sy(90), width: sx(110), height: sy(110) },
  ],
  templates: [
    { label: 'Vertical Card', x: 0, y: 0, width: CARD_WIDTH_PX, height: CARD_HEIGHT_PX },
    { label: 'Horizontal Card', x: 0, y: 0, width: CARD_HEIGHT_PX, height: CARD_WIDTH_PX },
  ],
  text: [
    { label: 'Card Cost', x: sx(118), y: sy(147), height: sy(66) },
    { label: 'Card Name', x: sx(413), y: sy(214), height: sy(46) },
    { label: 'Description', x: sx(413), y: sy(643), height: sy(22) },
    { label: 'Flavor Text', x: sx(413), y: sy(1005), height: sy(22) },
    { label: 'FAN MADE', x: sx(413), y: sy(611), height: sy(24) },
    { label: 'PRELUDE', x: sx(563), y: sy(99), height: sy(22) },
    { label: 'CORPORATION', x: sx(563), y: sy(109), height: sy(24) },
    { label: 'EFFECT', x: sx(800), y: sy(333), height: sy(22) },
  ],
  resources: [
    { label: 'Standard', x: sx(413), y: sy(643), width: sx(92), height: sy(92) },
    { label: 'Card', x: sx(413), y: sy(643), width: sx(88), height: sy(122) },
    { label: 'TR', x: sx(413), y: sy(643), width: sx(151), height: sy(112) },
  ],
  VPs: [
    { label: 'Standard', x: sx(542), y: sy(836), width: sx(223), height: sy(223) },
    { label: 'Negative', x: sx(652), y: sy(836), width: sx(223), height: sy(223) },
  ],
  tiles: [
    { label: 'Standard tile', x: sx(413), y: sy(643), width: 113, height: sy(142) },
    { label: 'Square tile', x: sx(413), y: sy(643), width: sx(130), height: sx(130) },
  ],
  requisites: [
    { label: 'Max', x: sx(180), y: sy(92), width: sx(200), height: sy(60) },
    { label: 'Min Large', x: sx(180), y: sy(92), width: sx(176), height: sy(60) },
    { label: 'Min Medium', x: sx(180), y: sy(92), width: sx(147), height: sy(60) },
    { label: 'Min Small', x: sx(180), y: sy(92), width: sx(130), height: sy(60) },
    { label: 'No Req', x: sx(180), y: sy(92), width: sx(21), height: sy(60) },
  ],
  globalparameters: [
    { label: 'Oxygen', x: sx(413), y: sy(643), width: sx(118), height: sy(118) },
    { label: 'Temp', x: sx(413), y: sy(643), width: sx(35), height: sy(118) },
    { label: 'Venus', x: sx(413), y: sy(643), width: sx(125), height: sy(71) },
  ],
  misc: [
    { label: 'MC', x: sx(413), y: sy(643), width: sx(92), height: sy(92) },
    { label: 'Arrow', x: sx(413), y: sy(429), width: sx(116), height: sy(55) },
    { label: 'Asterisk', x: sx(413), y: sy(643), width: sx(55), height: sy(55) },
    { label: 'Slash', x: sx(413), y: sy(643), width: sx(55), height: sy(146) },
    { label: 'Colon', x: sx(413), y: sy(643), width: sx(11), height: sy(55) },
    { label: 'Delegate', x: sx(413), y: sy(643), width: sx(77), height: sy(99) },
    { label: 'Effect (bg)', x: sx(631), y: sy(307), width: sx(346), height: sy(36) },
    { label: 'Influence', x: sx(413), y: sy(643), width: sx(117), height: sy(122) },
    { label: 'Tag Holder 0', x: sx(969), y: sy(103), width: sx(257), height: sy(89) },
    { label: 'Tag Holder 1', x: sx(898), y: sy(103), width: sx(257), height: sy(89) },
    { label: 'Tag Holder 2', x: sx(794), y: sy(103), width: sx(257), height: sy(89) },
  ],
  parties: [
    { label: 'Party', x: sx(413), y: sy(643), width: sx(169), height: sy(122) },
  ],
  production: [
    { label: '1x height', height: sy(143) },
    { label: '2x height', height: sy(235) },
    { label: '1x width', width: sx(143) },
    { label: '1.5x width', width: sx(188) },
    { label: '2x width', width: sx(235) },
    { label: '2.5x width', width: sx(279) },
    { label: '3x width', width: sx(325) },
  ],
};
