import { useCardStore } from '../store/cardStore';

export function LayerPanel() {
  const { layers, selectedLayerId, selectLayer, deleteLayer, moveLayer } = useCardStore();

  const handleDragStart = (e: React.DragEvent, index: number) => {
    e.dataTransfer.setData('text/plain', String(index));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, toIndex: number) => {
    e.preventDefault();
    const fromIndex = parseInt(e.dataTransfer.getData('text/plain'), 10);
    if (fromIndex !== toIndex) {
      moveLayer(fromIndex, toIndex);
    }
  };

  return (
    <div className="layer-panel">
      <h3 className="panel-title">Layers</h3>
      <div className="layer-list">
        {layers.map((layer, index) => (
          <div
            key={layer.id}
            className={`layer-item ${layer.id === selectedLayerId ? 'layer-item--selected' : ''} ${layer.type === 'base' ? 'layer-item--base' : ''}`}
            draggable={layer.type !== 'base'}
            onDragStart={(e) => handleDragStart(e, index)}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, index)}
            onClick={() => selectLayer(layer.id)}
          >
            <span className="layer-type-badge">{getLayerTypeIcon(layer.type)}</span>
            <span className="layer-name">{layer.name}</span>
            {layer.type !== 'base' && (
              <button
                className="layer-delete-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  deleteLayer(layer.id);
                }}
                title="Delete layer"
              >
                ✕
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function getLayerTypeIcon(type: string): string {
  switch (type) {
    case 'base': return '🎨';
    case 'block': return '🖼️';
    case 'text': return '📝';
    case 'production': return '📦';
    case 'effect': return '✨';
    case 'line': return '➖';
    case 'userImage': return '📷';
    case 'webImage': return '🌐';
    default: return '❓';
  }
}
