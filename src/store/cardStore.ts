import { create } from 'zustand';
import { Layer, BlockLayer, TextLayer, ProductionLayer, EffectLayer, LineLayer, TemplateLayerDef } from '../types';
import { cardTemplates } from '../data/templates';
import { blockAssets, presets } from '../data/assets';
import { CARD_WIDTH_PX, CARD_HEIGHT_PX } from '../utils/cardDimensions';

let nextId = 1;
function generateId(): string {
  return `layer-${nextId++}`;
}

// Map asset IDs to their default preset
function getDefaultPreset(asset: { id: string; category: string; label: string }): { x?: number; y?: number; width?: number; height?: number } | undefined {
  const category = asset.category;
  const categoryPresets = presets[category];
  if (!categoryPresets || categoryPresets.length === 0) return undefined;

  switch (category) {
    case 'resources': {
      if (asset.id === 'res-card') return categoryPresets.find(p => p.label === 'Card');
      if (asset.id === 'res-TR') return categoryPresets.find(p => p.label === 'TR');
      return categoryPresets.find(p => p.label === 'Standard') || categoryPresets[0];
    }
    case 'globalparameters': {
      if (asset.id === 'gp-oxygen') return categoryPresets.find(p => p.label === 'Oxygen');
      if (asset.id === 'gp-temperature') return categoryPresets.find(p => p.label === 'Temp');
      if (asset.id === 'gp-venus') return categoryPresets.find(p => p.label === 'Venus');
      return categoryPresets[0];
    }
    case 'VPs': {
      if (asset.id === 'vp-negative') return categoryPresets.find(p => p.label === 'Negative');
      return categoryPresets.find(p => p.label === 'Standard') || categoryPresets[0];
    }
    case 'tiles':
      return categoryPresets[0];
    case 'misc': {
      // Match misc items by label
      if (asset.id === 'misc-megacredit') return categoryPresets.find(p => p.label === 'MC');
      if (asset.id === 'misc-arrow') return categoryPresets.find(p => p.label === 'Arrow');
      if (asset.id === 'misc-asterisk') return categoryPresets.find(p => p.label === 'Asterisk');
      if (asset.id === 'misc-slash') return categoryPresets.find(p => p.label === 'Slash');
      if (asset.id === 'misc-colon') return categoryPresets.find(p => p.label === 'Colon');
      if (asset.id === 'misc-delegate') return categoryPresets.find(p => p.label === 'Delegate');
      if (asset.id === 'misc-effect') return categoryPresets.find(p => p.label === 'Effect (bg)');
      if (asset.id === 'misc-influence') return categoryPresets.find(p => p.label === 'Influence');
      if (asset.id === 'misc-corp-tag-holder') return categoryPresets.find(p => p.label === 'Tag Holder 0');
      return categoryPresets[0];
    }
    case 'parties':
      return categoryPresets[0];
    case 'requisites': {
      if (asset.id === 'req-max-big') return categoryPresets.find(p => p.label === 'Max');
      if (asset.id === 'req-min-big') return categoryPresets.find(p => p.label === 'Min Large');
      if (asset.id === 'req-min-medium') return categoryPresets.find(p => p.label === 'Min Medium');
      if (asset.id === 'req-min-small') return categoryPresets.find(p => p.label === 'Min Small');
      if (asset.id === 'req-normal') return categoryPresets.find(p => p.label === 'No Req');
      return categoryPresets[0];
    }
    case 'tags':
      return categoryPresets[0]; // First Tag slot
    default:
      return undefined;
  }
}

interface CardState {
  // Layer data
  layers: Layer[];
  selectedLayerId: string | null;
  isProjectStarted: boolean;

  // Undo/Redo
  history: Layer[][];
  historyIndex: number;

  // Actions
  selectLayer: (id: string | null) => void;
  addLayer: (layer: Omit<Layer, 'id'>) => void;
  updateLayer: (id: string, updates: Partial<Layer>) => void;
  deleteLayer: (id: string) => void;
  moveLayer: (fromIndex: number, toIndex: number) => void;
  loadTemplate: (templateId: string) => void;
  clearProject: () => void;
  
  // Block-specific
  addBlock: (blockId: string) => void;
  addTextLayer: () => void;
  addProductionBox: () => void;
  addEffectBox: () => void;
  addLine: () => void;

  // Undo/Redo
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;

  // Export
  getBaseLayer: () => Layer | undefined;
}

const defaultLayers: Layer[] = [
  {
    id: 'layer-base',
    type: 'base',
    name: 'Base',
    width: CARD_WIDTH_PX,
    height: CARD_HEIGHT_PX,
    color: '#ffffff',
  },
];

function pushHistory(state: { layers: Layer[]; history: Layer[][]; historyIndex: number }) {
  const newHistory = state.history.slice(0, state.historyIndex + 1);
  newHistory.push(JSON.parse(JSON.stringify(state.layers)));
  // Keep max 50 undo states
  if (newHistory.length > 50) newHistory.shift();
  return { history: newHistory, historyIndex: newHistory.length - 1 };
}

export const useCardStore = create<CardState>((set, get) => ({
  layers: [],
  selectedLayerId: null,
  isProjectStarted: false,
  history: [[]],
  historyIndex: 0,

  selectLayer: (id) => set({ selectedLayerId: id }),

  addLayer: (layerData) => {
    const id = generateId();
    const layer = { ...layerData, id } as Layer;
    set((state) => {
      const newLayers = [...state.layers, layer];
      return {
        layers: newLayers,
        selectedLayerId: id,
        ...pushHistory({ ...state, layers: newLayers }),
      };
    });
  },

  updateLayer: (id, updates) => {
    set((state) => {
      const newLayers = state.layers.map((l) =>
        l.id === id ? { ...l, ...updates } as Layer : l
      );
      return {
        layers: newLayers,
        ...pushHistory({ ...state, layers: newLayers }),
      };
    });
  },

  deleteLayer: (id) => {
    set((state) => {
      // Cannot delete base layer
      const layer = state.layers.find(l => l.id === id);
      if (layer?.type === 'base') return state;
      
      const newLayers = state.layers.filter((l) => l.id !== id);
      return {
        layers: newLayers,
        selectedLayerId: state.selectedLayerId === id ? null : state.selectedLayerId,
        ...pushHistory({ ...state, layers: newLayers }),
      };
    });
  },

  moveLayer: (fromIndex, toIndex) => {
    set((state) => {
      // Don't allow moving the base layer (index 0)
      if (fromIndex === 0 || toIndex === 0) return state;
      const newLayers = [...state.layers];
      const [moved] = newLayers.splice(fromIndex, 1);
      newLayers.splice(toIndex, 0, moved);
      return {
        layers: newLayers,
        ...pushHistory({ ...state, layers: newLayers }),
      };
    });
  },

  loadTemplate: (templateId) => {
    const template = cardTemplates.find((t) => t.id === templateId);
    if (!template) return;

    // Reset ID counter
    nextId = 1;
    
    const layers: Layer[] = template.layers.map((layerData: TemplateLayerDef) => ({
      ...layerData,
      id: generateId(),
    })) as unknown as Layer[];

    set({
      layers,
      selectedLayerId: null,
      isProjectStarted: true,
      history: [JSON.parse(JSON.stringify(layers))],
      historyIndex: 0,
    });
  },

  clearProject: () => {
    nextId = 1;
    set({
      layers: [],
      selectedLayerId: null,
      isProjectStarted: false,
      history: [[]],
      historyIndex: 0,
    });
  },

  addBlock: (blockId) => {
    const asset = blockAssets.find((a) => a.id === blockId);
    if (!asset) return;

    // Determine the default preset for this asset
    const preset = getDefaultPreset(asset);

    const layer: Omit<BlockLayer, 'id'> = {
      type: 'block',
      name: asset.label,
      blockId: asset.id,
      x: preset?.x ?? Math.round(CARD_WIDTH_PX / 2) - 50,
      y: preset?.y ?? Math.round(CARD_HEIGHT_PX / 2) - 50,
      width: preset?.width ?? 100,
      height: preset?.height ?? 100,
      showOtherBg: false,
    };

    get().addLayer(layer);
  },

  addTextLayer: () => {
    const baseLayer = get().layers.find(l => l.type === 'base');
    const centerX = baseLayer ? Math.round((baseLayer as any).width / 2) : 375;
    const centerY = baseLayer ? Math.round((baseLayer as any).height / 2) : 520;
    const width = baseLayer ? Math.round((baseLayer as any).width * 0.85) : 638;

    const layer: Omit<TextLayer, 'id'> = {
      type: 'text',
      name: 'New Text',
      data: 'Replace this text!',
      x: centerX,
      y: centerY,
      width: width,
      height: 20,
      color: '#000000',
      font: 'Prototype',
      style: 'normal',
      weight: 'normal',
      lineSpace: 4,
      justify: 'center',
    };

    get().addLayer(layer);
  },

  addProductionBox: () => {
    const layer: Omit<ProductionLayer, 'id'> = {
      type: 'production',
      name: 'Production',
      x: 200,
      y: 643,
      width: 130,
      height: 130,
    };

    get().addLayer(layer);
  },

  addEffectBox: () => {
    const layer: Omit<EffectLayer, 'id'> = {
      type: 'effect',
      name: 'Effect Box',
      x: 600,
      y: 300,
      width: 400,
      height: 300,
    };

    get().addLayer(layer);
  },

  addLine: () => {
    const layer: Omit<LineLayer, 'id'> = {
      type: 'line',
      name: 'Line',
      x: 100,
      y: 100,
      width: 2,
      angle: 0,
      length: 100,
      color: '#000000',
    };

    get().addLayer(layer);
  },

  undo: () => {
    set((state) => {
      if (state.historyIndex <= 0) return state;
      const newIndex = state.historyIndex - 1;
      return {
        layers: JSON.parse(JSON.stringify(state.history[newIndex])),
        historyIndex: newIndex,
        selectedLayerId: null,
      };
    });
  },

  redo: () => {
    set((state) => {
      if (state.historyIndex >= state.history.length - 1) return state;
      const newIndex = state.historyIndex + 1;
      return {
        layers: JSON.parse(JSON.stringify(state.history[newIndex])),
        historyIndex: newIndex,
        selectedLayerId: null,
      };
    });
  },

  canUndo: () => get().historyIndex > 0,
  canRedo: () => get().historyIndex < get().history.length - 1,

  getBaseLayer: () => get().layers.find((l) => l.type === 'base'),
}));
