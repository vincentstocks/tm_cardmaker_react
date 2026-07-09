// Layer types matching the original card maker's capabilities

export type LayerType = 'base' | 'block' | 'text' | 'production' | 'effect' | 'line' | 'userImage' | 'webImage';

export interface BaseLayer {
  id: string;
  type: 'base';
  name: string;
  width: number;
  height: number;
  color: string;
}

export interface BlockLayer {
  id: string;
  type: 'block';
  name: string;
  blockId: string; // references an asset in the block catalog
  x: number;
  y: number;
  width: number;
  height: number;
  showOtherBg: boolean;
}

export interface TextLayer {
  id: string;
  type: 'text';
  name: string;
  data: string;
  x: number;
  y: number;
  width: number;
  height: number; // font size
  color: string;
  font: string;
  style: 'normal' | 'italic';
  weight: 'normal' | 'bold';
  lineSpace: number;
  justify: 'left' | 'center' | 'right';
}

export interface ProductionLayer {
  id: string;
  type: 'production';
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface EffectLayer {
  id: string;
  type: 'effect';
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface LineLayer {
  id: string;
  type: 'line';
  name: string;
  x: number;
  y: number;
  width: number; // stroke width
  angle: number;
  length: number;
  color: string;
}

export interface UserImageLayer {
  id: string;
  type: 'userImage';
  name: string;
  src: string; // data URL or object URL
  x: number;
  y: number;
  width: number;
  height: number;
  opacity: number;
  // Source crop
  sx: number;
  sy: number;
  sWidth: number;
  sHeight: number;
}

export interface WebImageLayer {
  id: string;
  type: 'webImage';
  name: string;
  url: string;
  x: number;
  y: number;
  width: number;
  height: number;
  opacity: number;
  sx: number;
  sy: number;
  sWidth: number;
  sHeight: number;
}

export type Layer =
  | BaseLayer
  | BlockLayer
  | TextLayer
  | ProductionLayer
  | EffectLayer
  | LineLayer
  | UserImageLayer
  | WebImageLayer;

// Asset catalog types

export type AssetCategory =
  | 'templates'
  | 'tags'
  | 'resources'
  | 'tiles'
  | 'VPs'
  | 'parties'
  | 'requisites'
  | 'misc'
  | 'globalparameters'
  | 'productionboxes';

export interface BlockAsset {
  id: string;
  category: AssetCategory;
  label: string;
  src: string; // filename without extension
  path: string; // full path relative to public/
  hidden?: boolean;
  otherBgId?: string; // ID of the "other player background" asset for this category
}

export interface BlockPreset {
  label: string;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
}

// Template layer definitions - use a broad record type since templates
// contain different layer types with different properties
export type TemplateLayerDef = { type: LayerType; name: string } & Record<string, unknown>;

export interface CardTemplate {
  id: string;
  label: string;
  layers: TemplateLayerDef[];
}
