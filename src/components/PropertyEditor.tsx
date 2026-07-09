import { useCardStore } from '../store/cardStore';
import { Layer, TextLayer, BlockLayer, BaseLayer, ProductionLayer, EffectLayer, LineLayer } from '../types';
import { presets, blockAssets } from '../data/assets';

export function PropertyEditor() {
  const { layers, selectedLayerId, updateLayer } = useCardStore();
  const selectedLayer = layers.find((l) => l.id === selectedLayerId);

  if (!selectedLayer) {
    return (
      <div className="property-editor">
        <h3 className="panel-title">Properties</h3>
        <p className="no-selection">Select a layer to edit its properties</p>
      </div>
    );
  }

  return (
    <div className="property-editor">
      <h3 className="panel-title">Properties</h3>
      <div className="property-fields">
        <PropertyField label="Name">
          <input
            type="text"
            value={selectedLayer.name}
            onChange={(e) => updateLayer(selectedLayer.id, { name: e.target.value })}
          />
        </PropertyField>

        {selectedLayer.type === 'base' && <BaseProperties layer={selectedLayer as BaseLayer} />}
        {selectedLayer.type === 'block' && <BlockProperties layer={selectedLayer as BlockLayer} />}
        {selectedLayer.type === 'text' && <TextProperties layer={selectedLayer as TextLayer} />}
        {selectedLayer.type === 'production' && <PositionSizeProperties layer={selectedLayer as ProductionLayer} />}
        {selectedLayer.type === 'effect' && <PositionSizeProperties layer={selectedLayer as EffectLayer} />}
        {selectedLayer.type === 'line' && <LineProperties layer={selectedLayer as LineLayer} />}
      </div>
    </div>
  );
}

function PropertyField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="property-field">
      <label className="property-label">{label}</label>
      <div className="property-input">{children}</div>
    </div>
  );
}

function BaseProperties({ layer }: { layer: BaseLayer }) {
  const { updateLayer } = useCardStore();
  return (
    <>
      <PropertyField label="Width">
        <input
          type="number"
          value={layer.width}
          onChange={(e) => updateLayer(layer.id, { width: Number(e.target.value) })}
        />
      </PropertyField>
      <PropertyField label="Height">
        <input
          type="number"
          value={layer.height}
          onChange={(e) => updateLayer(layer.id, { height: Number(e.target.value) })}
        />
      </PropertyField>
      <PropertyField label="Color">
        <input
          type="color"
          value={layer.color}
          onChange={(e) => updateLayer(layer.id, { color: e.target.value })}
        />
      </PropertyField>
    </>
  );
}

function BlockProperties({ layer }: { layer: BlockLayer }) {
  const { updateLayer } = useCardStore();
  const asset = blockAssets.find((a) => a.id === layer.blockId);
  const categoryPresets = asset ? presets[asset.category] || [] : [];

  const applyPreset = (preset: typeof categoryPresets[0]) => {
    const updates: Partial<BlockLayer> = {};
    if (preset.x !== undefined) updates.x = preset.x;
    if (preset.y !== undefined) updates.y = preset.y;
    if (preset.width !== undefined) updates.width = preset.width;
    if (preset.height !== undefined) updates.height = preset.height;
    updateLayer(layer.id, updates);
  };

  return (
    <>
      {categoryPresets.length > 0 && (
        <PropertyField label="Preset">
          <select
            value=""
            onChange={(e) => {
              const idx = Number(e.target.value);
              if (!isNaN(idx)) applyPreset(categoryPresets[idx]);
            }}
          >
            <option value="">Select preset...</option>
            {categoryPresets.map((p, i) => (
              <option key={i} value={i}>
                {p.label}
              </option>
            ))}
          </select>
        </PropertyField>
      )}
      <PropertyField label="X">
        <input
          type="number"
          value={layer.x}
          onChange={(e) => updateLayer(layer.id, { x: Number(e.target.value) })}
        />
      </PropertyField>
      <PropertyField label="Y">
        <input
          type="number"
          value={layer.y}
          onChange={(e) => updateLayer(layer.id, { y: Number(e.target.value) })}
        />
      </PropertyField>
      <PropertyField label="Width">
        <input
          type="number"
          value={layer.width}
          onChange={(e) => updateLayer(layer.id, { width: Number(e.target.value) })}
        />
      </PropertyField>
      <PropertyField label="Height">
        <input
          type="number"
          value={layer.height}
          onChange={(e) => updateLayer(layer.id, { height: Number(e.target.value) })}
        />
      </PropertyField>
    </>
  );
}

function TextProperties({ layer }: { layer: TextLayer }) {
  const { updateLayer } = useCardStore();
  const textPresets = presets['text'] || [];

  const applyPreset = (preset: typeof textPresets[0]) => {
    const updates: Partial<TextLayer> = {};
    if (preset.x !== undefined) updates.x = preset.x;
    if (preset.y !== undefined) updates.y = preset.y;
    if (preset.height !== undefined) updates.height = preset.height;
    updateLayer(layer.id, updates);
  };

  return (
    <>
      {textPresets.length > 0 && (
        <PropertyField label="Preset">
          <select
            value=""
            onChange={(e) => {
              const idx = Number(e.target.value);
              if (!isNaN(idx)) applyPreset(textPresets[idx]);
            }}
          >
            <option value="">Select preset...</option>
            {textPresets.map((p, i) => (
              <option key={i} value={i}>
                {p.label}
              </option>
            ))}
          </select>
        </PropertyField>
      )}
      <PropertyField label="Text">
        <textarea
          value={layer.data}
          rows={4}
          onChange={(e) => updateLayer(layer.id, { data: e.target.value })}
        />
      </PropertyField>
      <PropertyField label="X">
        <input
          type="number"
          value={layer.x}
          onChange={(e) => updateLayer(layer.id, { x: Number(e.target.value) })}
        />
      </PropertyField>
      <PropertyField label="Y">
        <input
          type="number"
          value={layer.y}
          onChange={(e) => updateLayer(layer.id, { y: Number(e.target.value) })}
        />
      </PropertyField>
      <PropertyField label="Font Size">
        <input
          type="number"
          value={layer.height}
          onChange={(e) => updateLayer(layer.id, { height: Number(e.target.value) })}
        />
      </PropertyField>
      <PropertyField label="Width (wrap)">
        <input
          type="number"
          value={layer.width}
          onChange={(e) => updateLayer(layer.id, { width: Number(e.target.value) })}
        />
      </PropertyField>
      <PropertyField label="Line Spacing">
        <input
          type="number"
          value={layer.lineSpace}
          onChange={(e) => updateLayer(layer.id, { lineSpace: Number(e.target.value) })}
        />
      </PropertyField>
      <PropertyField label="Font">
        <select
          value={layer.font}
          onChange={(e) => updateLayer(layer.id, { font: e.target.value })}
        >
          <option value="Prototype">Prototype</option>
          <option value="Pagella">Pagella (Palatino)</option>
          <option value="times">Times New Roman</option>
        </select>
      </PropertyField>
      <PropertyField label="Style">
        <select
          value={layer.style}
          onChange={(e) => updateLayer(layer.id, { style: e.target.value as 'normal' | 'italic' })}
        >
          <option value="normal">Normal</option>
          <option value="italic">Italic</option>
        </select>
      </PropertyField>
      <PropertyField label="Weight">
        <select
          value={layer.weight}
          onChange={(e) => updateLayer(layer.id, { weight: e.target.value as 'normal' | 'bold' })}
        >
          <option value="normal">Normal</option>
          <option value="bold">Bold</option>
        </select>
      </PropertyField>
      <PropertyField label="Justify">
        <select
          value={layer.justify}
          onChange={(e) => updateLayer(layer.id, { justify: e.target.value as 'left' | 'center' | 'right' })}
        >
          <option value="left">Left</option>
          <option value="center">Center</option>
          <option value="right">Right</option>
        </select>
      </PropertyField>
      <PropertyField label="Color">
        <input
          type="color"
          value={layer.color}
          onChange={(e) => updateLayer(layer.id, { color: e.target.value })}
        />
      </PropertyField>
    </>
  );
}

function PositionSizeProperties({ layer }: { layer: ProductionLayer | EffectLayer }) {
  const { updateLayer } = useCardStore();
  const categoryPresets = presets[layer.type === 'production' ? 'production' : 'misc'] || [];

  return (
    <>
      {categoryPresets.length > 0 && (
        <PropertyField label="Preset">
          <select
            value=""
            onChange={(e) => {
              const idx = Number(e.target.value);
              if (!isNaN(idx)) {
                const preset = categoryPresets[idx];
                const updates: Partial<Layer> = {};
                if (preset.x !== undefined) (updates as any).x = preset.x;
                if (preset.y !== undefined) (updates as any).y = preset.y;
                if (preset.width !== undefined) (updates as any).width = preset.width;
                if (preset.height !== undefined) (updates as any).height = preset.height;
                updateLayer(layer.id, updates);
              }
            }}
          >
            <option value="">Select preset...</option>
            {categoryPresets.map((p, i) => (
              <option key={i} value={i}>
                {p.label}
              </option>
            ))}
          </select>
        </PropertyField>
      )}
      <PropertyField label="X">
        <input
          type="number"
          value={layer.x}
          onChange={(e) => updateLayer(layer.id, { x: Number(e.target.value) })}
        />
      </PropertyField>
      <PropertyField label="Y">
        <input
          type="number"
          value={layer.y}
          onChange={(e) => updateLayer(layer.id, { y: Number(e.target.value) })}
        />
      </PropertyField>
      <PropertyField label="Width">
        <input
          type="number"
          value={layer.width}
          onChange={(e) => updateLayer(layer.id, { width: Number(e.target.value) })}
        />
      </PropertyField>
      <PropertyField label="Height">
        <input
          type="number"
          value={layer.height}
          onChange={(e) => updateLayer(layer.id, { height: Number(e.target.value) })}
        />
      </PropertyField>
    </>
  );
}

function LineProperties({ layer }: { layer: LineLayer }) {
  const { updateLayer } = useCardStore();
  return (
    <>
      <PropertyField label="X">
        <input
          type="number"
          value={layer.x}
          onChange={(e) => updateLayer(layer.id, { x: Number(e.target.value) })}
        />
      </PropertyField>
      <PropertyField label="Y">
        <input
          type="number"
          value={layer.y}
          onChange={(e) => updateLayer(layer.id, { y: Number(e.target.value) })}
        />
      </PropertyField>
      <PropertyField label="Length">
        <input
          type="number"
          value={layer.length}
          onChange={(e) => updateLayer(layer.id, { length: Number(e.target.value) })}
        />
      </PropertyField>
      <PropertyField label="Stroke Width">
        <input
          type="number"
          value={layer.width}
          onChange={(e) => updateLayer(layer.id, { width: Number(e.target.value) })}
        />
      </PropertyField>
      <PropertyField label="Angle">
        <input
          type="number"
          min={0}
          max={359}
          value={layer.angle}
          onChange={(e) => updateLayer(layer.id, { angle: Number(e.target.value) })}
        />
      </PropertyField>
      <PropertyField label="Color">
        <input
          type="color"
          value={layer.color}
          onChange={(e) => updateLayer(layer.id, { color: e.target.value })}
        />
      </PropertyField>
    </>
  );
}
