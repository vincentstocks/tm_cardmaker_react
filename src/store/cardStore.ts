import { create } from 'zustand';
import { Layer, BlockLayer, TextLayer, ProductionLayer, EffectLayer, LineLayer, TemplateLayerDef } from '../types';
import { cardTemplates } from '../data/templates';
import { blockAssets } from '../data/assets';
import { CARD_WIDTH_PX, CARD_HEIGHT_PX } from '../utils/cardDimensions';

let nextId = 1;
function generateId(): string {
  return `layer-${nextId++}`;
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

    const baseLayer = get().layers.find(l => l.type === 'base');
    const centerX = baseLayer ? Math.round((baseLayer as any).width / 2) : 413;
    const centerY = baseLayer ? Math.round((baseLayer as any).height / 2) : 563;

    const layer: Omit<BlockLayer, 'id'> = {
      type: 'block',
      name: asset.label,
      blockId: asset.id,
      x: centerX - 50,
      y: centerY - 50,
      width: 100,
      height: 100,
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
