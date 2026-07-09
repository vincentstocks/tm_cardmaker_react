import { CardTemplate } from '../types';
import { CARD_WIDTH_PX, CARD_HEIGHT_PX, CARD_LANDSCAPE_WIDTH_PX, CARD_LANDSCAPE_HEIGHT_PX } from '../utils/cardDimensions';

// Shorthand for portrait card dimensions
const W = CARD_WIDTH_PX;   // 750
const H = CARD_HEIGHT_PX;  // 1039

// Shorthand for landscape card dimensions
const LW = CARD_LANDSCAPE_WIDTH_PX;  // 1039
const LH = CARD_LANDSCAPE_HEIGHT_PX; // 750

// Content width for text (with equal margins on each side)
const TW = W - 2 * Math.round(110 * W / 826);  // ~550 - symmetric margin from description x
const LTW = Math.round(LW * 0.85);   // ~883 - text wrap width for landscape

// Scale helper: converts original 826×1126 coordinates to 750×1039
function p(x: number, y: number) {
  return { x: Math.round(x * W / 826), y: Math.round(y * H / 1126) };
}
function pw(w: number) { return Math.round(w * W / 826); }
function ph(h: number) { return Math.round(h * H / 1126); }

// Scale helper for landscape: converts original 1126×826 to 1039×750
function l(x: number, y: number) {
  return { x: Math.round(x * LW / 1126), y: Math.round(y * LH / 826) };
}
function lw(w: number) { return Math.round(w * LW / 1126); }
function lh(h: number) { return Math.round(h * LH / 826); }

export const cardTemplates: CardTemplate[] = [
  {
    id: 'green-normal',
    label: 'Green Card',
    layers: [
      { type: 'base', name: 'Base', color: '#ffffff', width: W, height: H },
      { type: 'block', name: 'Green Card', blockId: 'tpl-green-normal', x: 0, y: 0, width: W, height: H, showOtherBg: false },
      { type: 'text', name: 'Cost', data: '0', ...p(115, 151), width: pw(120), height: ph(66), color: '#000000', font: 'Prototype', style: 'normal', weight: 'normal', lineSpace: 4, justify: 'center' },
      { type: 'block', name: 'No Requirement', blockId: 'req-normal', ...p(179, 97), width: pw(22), height: ph(59), showOtherBg: false },
      { type: 'text', name: 'Card Name', data: 'CARD NAME', ...p(413, 214), width: pw(600), height: ph(46), color: '#000000', font: 'Prototype', style: 'normal', weight: 'normal', lineSpace: 4, justify: 'center' },
      { type: 'text', name: 'FAN MADE', data: 'FAN MADE', ...p(413, 612), width: pw(400), height: ph(24), color: '#24770d', font: 'Prototype', style: 'normal', weight: 'normal', lineSpace: 4, justify: 'center' },
      { type: 'text', name: 'Description', data: 'Card description\nMultiple lines\nand they can be much, much, much longer\n\'V space\' controls the spacing between lines', ...p(110, 770), width: TW, height: ph(22), color: '#000000', font: 'Pagella', style: 'normal', weight: 'normal', lineSpace: 4, justify: 'left' },
      { type: 'text', name: 'Flavor Text', data: 'Flavor text!', ...p(413, 1005), width: TW, height: ph(22), color: '#000000', font: 'Pagella', style: 'italic', weight: 'bold', lineSpace: 4, justify: 'center' },
    ],
  },
  {
    id: 'green-big-bottom',
    label: 'Green Big Bottom',
    layers: [
      { type: 'base', name: 'Base', color: '#ffffff', width: W, height: H },
      { type: 'block', name: 'Green Big Bottom', blockId: 'tpl-green-big-bottom', x: 0, y: 0, width: W, height: H, showOtherBg: false },
      { type: 'text', name: 'Cost', data: '0', ...p(115, 151), width: pw(120), height: ph(66), color: '#000000', font: 'Prototype', style: 'normal', weight: 'normal', lineSpace: 4, justify: 'center' },
      { type: 'block', name: 'No Requirement', blockId: 'req-normal', ...p(179, 97), width: pw(22), height: ph(59), showOtherBg: false },
      { type: 'text', name: 'Card Name', data: 'CARD NAME', ...p(413, 214), width: pw(600), height: ph(46), color: '#000000', font: 'Prototype', style: 'normal', weight: 'normal', lineSpace: 4, justify: 'center' },
      { type: 'text', name: 'FAN MADE', data: 'FAN MADE', ...p(413, 562), width: pw(400), height: ph(24), color: '#24770d', font: 'Prototype', style: 'normal', weight: 'normal', lineSpace: 4, justify: 'center' },
      { type: 'text', name: 'Description', data: 'Card description\nMultiple lines\nand they can be much, much, much longer\n\'V space\' controls the spacing between lines', ...p(110, 770), width: TW, height: ph(22), color: '#000000', font: 'Pagella', style: 'normal', weight: 'normal', lineSpace: 4, justify: 'left' },
      { type: 'text', name: 'Flavor Text', data: 'Flavor text!', ...p(413, 1005), width: TW, height: ph(22), color: '#000000', font: 'Pagella', style: 'italic', weight: 'bold', lineSpace: 4, justify: 'center' },
    ],
  },
  {
    id: 'green-small-bottom',
    label: 'Green Small Bottom',
    layers: [
      { type: 'base', name: 'Base', color: '#ffffff', width: W, height: H },
      { type: 'block', name: 'Green Small Bottom', blockId: 'tpl-green-small-bottom', x: 0, y: 0, width: W, height: H, showOtherBg: false },
      { type: 'text', name: 'Cost', data: '0', ...p(115, 151), width: pw(120), height: ph(66), color: '#000000', font: 'Prototype', style: 'normal', weight: 'normal', lineSpace: 4, justify: 'center' },
      { type: 'block', name: 'No Requirement', blockId: 'req-normal', ...p(179, 97), width: pw(22), height: ph(59), showOtherBg: false },
      { type: 'text', name: 'Card Name', data: 'CARD NAME', ...p(413, 214), width: pw(600), height: ph(46), color: '#000000', font: 'Prototype', style: 'normal', weight: 'normal', lineSpace: 4, justify: 'center' },
      { type: 'text', name: 'FAN MADE', data: 'FAN MADE', ...p(413, 664), width: pw(400), height: ph(24), color: '#24770d', font: 'Prototype', style: 'normal', weight: 'normal', lineSpace: 4, justify: 'center' },
      { type: 'text', name: 'Description', data: 'Card description\nMultiple lines\nand they can be much, much, much longer\n\'V space\' controls the spacing between lines', ...p(110, 770), width: TW, height: ph(22), color: '#000000', font: 'Pagella', style: 'normal', weight: 'normal', lineSpace: 4, justify: 'left' },
      { type: 'text', name: 'Flavor Text', data: 'Flavor text!', ...p(413, 1005), width: TW, height: ph(22), color: '#000000', font: 'Pagella', style: 'italic', weight: 'bold', lineSpace: 4, justify: 'center' },
    ],
  },
  {
    id: 'blue-normal',
    label: 'Blue Card',
    layers: [
      { type: 'base', name: 'Base', color: '#ffffff', width: W, height: H },
      { type: 'block', name: 'Blue Card', blockId: 'tpl-blue-normal', x: 0, y: 0, width: W, height: H, showOtherBg: false },
      { type: 'text', name: 'Cost', data: '0', ...p(115, 151), width: pw(120), height: ph(66), color: '#000000', font: 'Prototype', style: 'normal', weight: 'normal', lineSpace: 4, justify: 'center' },
      { type: 'block', name: 'No Requirement', blockId: 'req-normal', ...p(179, 97), width: pw(22), height: ph(59), showOtherBg: false },
      { type: 'text', name: 'Card Name', data: 'CARD NAME', ...p(413, 214), width: pw(600), height: ph(46), color: '#000000', font: 'Prototype', style: 'normal', weight: 'normal', lineSpace: 4, justify: 'center' },
      { type: 'text', name: 'FAN MADE', data: 'FAN MADE', ...p(413, 798), width: pw(400), height: ph(24), color: '#0c5e84', font: 'Prototype', style: 'normal', weight: 'normal', lineSpace: 4, justify: 'center' },
      { type: 'text', name: 'Description', data: 'Card description\nMultiple lines\nand they can be much, much, much longer\n\'V space\' controls the spacing between lines', ...p(100, 860), width: TW, height: ph(22), color: '#000000', font: 'Pagella', style: 'normal', weight: 'normal', lineSpace: 4, justify: 'left' },
      { type: 'text', name: 'Flavor Text', data: 'Flavor text!', ...p(413, 1005), width: TW, height: ph(22), color: '#000000', font: 'Pagella', style: 'italic', weight: 'bold', lineSpace: 4, justify: 'center' },
      { type: 'block', name: 'Arrow', blockId: 'misc-arrow', ...p(355, 265), width: pw(116), height: ph(55), showOtherBg: false },
      { type: 'text', name: 'Effect Text', data: 'Effect or Action text!', ...p(413, 360), width: pw(500), height: ph(22), color: '#000000', font: 'Pagella', style: 'normal', weight: 'normal', lineSpace: 4, justify: 'center' },
    ],
  },
  {
    id: 'blue-big-bottom',
    label: 'Blue Big Bottom',
    layers: [
      { type: 'base', name: 'Base', color: '#ffffff', width: W, height: H },
      { type: 'block', name: 'Blue Big Bottom', blockId: 'tpl-blue-big-bottom', x: 0, y: 0, width: W, height: H, showOtherBg: false },
      { type: 'text', name: 'Cost', data: '0', ...p(115, 151), width: pw(120), height: ph(66), color: '#000000', font: 'Prototype', style: 'normal', weight: 'normal', lineSpace: 4, justify: 'center' },
      { type: 'block', name: 'No Requirement', blockId: 'req-normal', ...p(179, 97), width: pw(22), height: ph(59), showOtherBg: false },
      { type: 'text', name: 'Card Name', data: 'CARD NAME', ...p(413, 214), width: pw(600), height: ph(46), color: '#000000', font: 'Prototype', style: 'normal', weight: 'normal', lineSpace: 4, justify: 'center' },
      { type: 'text', name: 'FAN MADE', data: 'FAN MADE', ...p(413, 753), width: pw(702), height: ph(24), color: '#0c5e84', font: 'Prototype', style: 'normal', weight: 'normal', lineSpace: 4, justify: 'center' },
      { type: 'text', name: 'Description', data: 'Card description\nMultiple lines\nand they can be much, much, much longer\n\'V space\' controls the spacing between lines', ...p(100, 860), width: TW, height: ph(22), color: '#000000', font: 'Pagella', style: 'normal', weight: 'normal', lineSpace: 4, justify: 'left' },
      { type: 'text', name: 'Flavor Text', data: 'Flavor text!', ...p(413, 1005), width: TW, height: ph(22), color: '#000000', font: 'Pagella', style: 'italic', weight: 'bold', lineSpace: 4, justify: 'center' },
      { type: 'block', name: 'Arrow', blockId: 'misc-arrow', ...p(355, 265), width: pw(116), height: ph(55), showOtherBg: false },
      { type: 'text', name: 'Effect Text', data: 'Effect or Action text!', ...p(413, 360), width: pw(500), height: ph(22), color: '#000000', font: 'Pagella', style: 'normal', weight: 'normal', lineSpace: 4, justify: 'center' },
    ],
  },
  {
    id: 'blue-big-top',
    label: 'Blue Big Top',
    layers: [
      { type: 'base', name: 'Base', color: '#ffffff', width: W, height: H },
      { type: 'block', name: 'Blue Big Top', blockId: 'tpl-blue-big-top', x: 0, y: 0, width: W, height: H, showOtherBg: false },
      { type: 'text', name: 'Cost', data: '0', ...p(115, 151), width: pw(120), height: ph(66), color: '#000000', font: 'Prototype', style: 'normal', weight: 'normal', lineSpace: 4, justify: 'center' },
      { type: 'block', name: 'No Requirement', blockId: 'req-normal', ...p(179, 97), width: pw(22), height: ph(59), showOtherBg: false },
      { type: 'text', name: 'Card Name', data: 'CARD NAME', ...p(413, 214), width: pw(600), height: ph(46), color: '#000000', font: 'Prototype', style: 'normal', weight: 'normal', lineSpace: 4, justify: 'center' },
      { type: 'text', name: 'FAN MADE', data: 'FAN MADE', ...p(413, 849), width: pw(702), height: ph(24), color: '#0c5e84', font: 'Prototype', style: 'normal', weight: 'normal', lineSpace: 4, justify: 'center' },
      { type: 'text', name: 'Description', data: 'Card description\nMultiple lines\nand they can be much, much, much longer\n\'V space\' controls the spacing between lines', ...p(100, 891), width: TW, height: ph(22), color: '#000000', font: 'Pagella', style: 'normal', weight: 'normal', lineSpace: 4, justify: 'left' },
      { type: 'text', name: 'Flavor Text', data: 'Flavor text!', ...p(413, 1005), width: TW, height: ph(22), color: '#000000', font: 'Pagella', style: 'italic', weight: 'bold', lineSpace: 4, justify: 'center' },
      { type: 'block', name: 'Arrow', blockId: 'misc-arrow', ...p(355, 265), width: pw(116), height: ph(55), showOtherBg: false },
      { type: 'text', name: 'Effect Text', data: 'Effect or Action text!', ...p(413, 360), width: pw(500), height: ph(22), color: '#000000', font: 'Pagella', style: 'normal', weight: 'normal', lineSpace: 4, justify: 'center' },
    ],
  },
  {
    id: 'red-normal',
    label: 'Red Event Card',
    layers: [
      { type: 'base', name: 'Base', color: '#ffffff', width: W, height: H },
      { type: 'block', name: 'Red Card', blockId: 'tpl-red-normal', x: 0, y: 0, width: W, height: H, showOtherBg: false },
      { type: 'text', name: 'Cost', data: '0', ...p(115, 151), width: pw(120), height: ph(66), color: '#000000', font: 'Prototype', style: 'normal', weight: 'normal', lineSpace: 4, justify: 'center' },
      { type: 'block', name: 'No Requirement', blockId: 'req-normal', ...p(179, 97), width: pw(22), height: ph(59), showOtherBg: false },
      { type: 'text', name: 'Card Name', data: 'CARD NAME', ...p(413, 214), width: pw(600), height: ph(46), color: '#000000', font: 'Prototype', style: 'normal', weight: 'normal', lineSpace: 4, justify: 'center' },
      { type: 'text', name: 'FAN MADE', data: 'FAN MADE', ...p(413, 685), width: pw(400), height: ph(24), color: '#c36a17', font: 'Prototype', style: 'normal', weight: 'normal', lineSpace: 4, justify: 'center' },
      { type: 'text', name: 'Description', data: 'Card description\nMultiple lines\nand they can be much, much, much longer\n\'V space\' controls the spacing between lines', ...p(100, 810), width: TW, height: ph(22), color: '#000000', font: 'Pagella', style: 'normal', weight: 'normal', lineSpace: 4, justify: 'left' },
      { type: 'text', name: 'Flavor Text', data: 'Flavor text!', ...p(413, 1005), width: TW, height: ph(22), color: '#000000', font: 'Pagella', style: 'italic', weight: 'bold', lineSpace: 4, justify: 'center' },
    ],
  },
  {
    id: 'red-small-bottom',
    label: 'Red Small Bottom',
    layers: [
      { type: 'base', name: 'Base', color: '#ffffff', width: W, height: H },
      { type: 'block', name: 'Red Small Bottom', blockId: 'tpl-red-small-bottom', x: 0, y: 0, width: W, height: H, showOtherBg: false },
      { type: 'text', name: 'Cost', data: '0', ...p(115, 151), width: pw(120), height: ph(66), color: '#000000', font: 'Prototype', style: 'normal', weight: 'normal', lineSpace: 4, justify: 'center' },
      { type: 'block', name: 'No Requirement', blockId: 'req-normal', ...p(179, 97), width: pw(22), height: ph(59), showOtherBg: false },
      { type: 'text', name: 'Card Name', data: 'CARD NAME', ...p(413, 214), width: pw(600), height: ph(46), color: '#000000', font: 'Prototype', style: 'normal', weight: 'normal', lineSpace: 4, justify: 'center' },
      { type: 'text', name: 'FAN MADE', data: 'FAN MADE', ...p(413, 718), width: pw(400), height: ph(24), color: '#c36a17', font: 'Prototype', style: 'normal', weight: 'normal', lineSpace: 4, justify: 'center' },
      { type: 'text', name: 'Description', data: 'Card description\nMultiple lines\nand they can be much, much, much longer\n\'V space\' controls the spacing between lines', ...p(100, 810), width: TW, height: ph(22), color: '#000000', font: 'Pagella', style: 'normal', weight: 'normal', lineSpace: 4, justify: 'left' },
      { type: 'text', name: 'Flavor Text', data: 'Flavor text!', ...p(413, 1005), width: TW, height: ph(22), color: '#000000', font: 'Pagella', style: 'italic', weight: 'bold', lineSpace: 4, justify: 'center' },
    ],
  },
  {
    id: 'prelude',
    label: 'Prelude Card',
    layers: [
      { type: 'base', name: 'Base', color: '#ffffff', width: LW, height: LH },
      { type: 'block', name: 'Prelude', blockId: 'tpl-prelude', x: 0, y: 0, width: LW, height: LH, showOtherBg: false },
      { type: 'text', name: 'Card Name', data: 'CARD NAME', ...l(563, 218), width: lw(600), height: lh(48), color: '#000000', font: 'Prototype', style: 'normal', weight: 'normal', lineSpace: 4, justify: 'center' },
      { type: 'text', name: 'FAN MADE', data: 'FAN MADE', ...l(563, 500), width: lw(400), height: lh(24), color: '#ce809f', font: 'Prototype', style: 'normal', weight: 'normal', lineSpace: 4, justify: 'center' },
      { type: 'text', name: 'PRELUDE', data: 'P R E L U D E', ...l(563, 99), width: lw(500), height: lh(24), color: '#000000', font: 'Prototype', style: 'normal', weight: 'normal', lineSpace: 4, justify: 'center' },
      { type: 'text', name: 'Description', data: 'Card description\nMultiple lines\nand they can be much, much, much longer\n\'V space\' controls the spacing between lines', ...l(110, 560), width: LTW, height: lh(22), color: '#000000', font: 'Pagella', style: 'normal', weight: 'normal', lineSpace: 4, justify: 'left' },
      { type: 'text', name: 'Flavor Text', data: 'Flavor text!', ...l(563, 723), width: LTW, height: lh(22), color: '#000000', font: 'Pagella', style: 'italic', weight: 'bold', lineSpace: 4, justify: 'center' },
    ],
  },
  {
    id: 'corporation',
    label: 'Corporation',
    layers: [
      { type: 'base', name: 'Base', color: '#ffffff', width: LW, height: LH },
      { type: 'block', name: 'Tag Holder', blockId: 'misc-corp-tag-holder', ...l(969, 103), width: lw(257), height: lh(89), showOtherBg: false },
      { type: 'block', name: 'Corporation', blockId: 'tpl-corporation', x: 0, y: 0, width: LW, height: LH, showOtherBg: false },
      { type: 'effect', name: 'Effect Box', ...l(600, 300), width: lw(400), height: lh(300) },
      { type: 'block', name: 'Effect (bg)', blockId: 'misc-effect', ...l(631, 307), width: lw(346), height: lh(36), showOtherBg: false },
      { type: 'text', name: 'EFFECT', data: 'E F F E C T', ...l(800, 333), width: lw(400), height: lh(22), color: '#000000', font: 'Prototype', style: 'normal', weight: 'normal', lineSpace: 4, justify: 'center' },
      { type: 'text', name: 'FAN MADE', data: 'FAN MADE', ...l(198, 736), width: lw(400), height: lh(24), color: '#c3c3c3', font: 'Prototype', style: 'normal', weight: 'normal', lineSpace: 4, justify: 'center' },
      { type: 'text', name: 'CORPORATION', data: 'C O R P O R A T I O N', ...l(563, 109), width: lw(600), height: lh(24), color: '#000000', font: 'Prototype', style: 'normal', weight: 'normal', lineSpace: 4, justify: 'center' },
      { type: 'text', name: 'Description', data: 'Card description\nMultiple lines\nand they can be much, much, much longer\n\'V space\' controls the spacing between lines', ...l(110, 560), width: LTW, height: lh(22), color: '#000000', font: 'Pagella', style: 'normal', weight: 'normal', lineSpace: 4, justify: 'left' },
      { type: 'text', name: 'Flavor Text', data: 'Flavor text!', ...l(563, 723), width: LTW, height: lh(22), color: '#000000', font: 'Pagella', style: 'italic', weight: 'bold', lineSpace: 4, justify: 'center' },
    ],
  },
];
