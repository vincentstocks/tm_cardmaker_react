import { Stage, Layer as KonvaLayer } from 'react-konva';
import { useCardStore } from '../store/cardStore';
import { BlockLayerRenderer } from './layers/BlockLayerRenderer';
import { TextLayerRenderer } from './layers/TextLayerRenderer';
import { ProductionLayerRenderer } from './layers/ProductionLayerRenderer';
import { EffectLayerRenderer } from './layers/EffectLayerRenderer';
import { BaseLayerRenderer } from './layers/BaseLayerRenderer';
import { CARD_WIDTH_PX, CARD_HEIGHT_PX } from '../utils/cardDimensions';

const PREVIEW_SCALE = 0.65;

export function CardPreview() {
  const { layers } = useCardStore();
  const baseLayer = layers.find((l) => l.type === 'base');
  const stageWidth = baseLayer ? (baseLayer as any).width * PREVIEW_SCALE : CARD_WIDTH_PX * PREVIEW_SCALE;
  const stageHeight = baseLayer ? (baseLayer as any).height * PREVIEW_SCALE : CARD_HEIGHT_PX * PREVIEW_SCALE;

  // Dummy handlers — preview is non-interactive
  const noop = () => {};
  const noopEvent = () => {};

  return (
    <div className="card-canvas-container">
      <div className="card-canvas-wrapper" style={{ position: 'relative', display: 'inline-block' }}>
        <Stage
          width={stageWidth}
          height={stageHeight}
          listening={false}
          style={{ border: '1px solid #333', backgroundColor: '#f0f0f0' }}
        >
          <KonvaLayer>
            {layers.map((layer) => {
              const commonProps = {
                key: layer.id,
                layer,
                isSelected: false,
                scaleFactor: PREVIEW_SCALE,
                onSelect: noop,
                onDragEnd: noopEvent,
                onTransformEnd: noopEvent,
              };

              switch (layer.type) {
                case 'base':
                  return <BaseLayerRenderer {...commonProps} />;
                case 'block':
                  return <BlockLayerRenderer {...commonProps} />;
                case 'text':
                  return <TextLayerRenderer {...commonProps} />;
                case 'production':
                  return <ProductionLayerRenderer {...commonProps} />;
                case 'effect':
                  return <EffectLayerRenderer {...commonProps} />;
                default:
                  return null;
              }
            })}
          </KonvaLayer>
        </Stage>
      </div>
    </div>
  );
}
