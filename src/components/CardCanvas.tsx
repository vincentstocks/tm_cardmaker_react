import { useRef, useCallback } from 'react';
import { Stage, Layer as KonvaLayer } from 'react-konva';
import Konva from 'konva';
import { useCardStore } from '../store/cardStore';
import { BlockLayerRenderer } from './layers/BlockLayerRenderer';
import { TextLayerRenderer } from './layers/TextLayerRenderer';
import { ProductionLayerRenderer } from './layers/ProductionLayerRenderer';
import { EffectLayerRenderer } from './layers/EffectLayerRenderer';
import { BaseLayerRenderer } from './layers/BaseLayerRenderer';
import { Layer } from '../types';
import { CARD_WIDTH_PX, CARD_HEIGHT_PX } from '../utils/cardDimensions';
import { EditorOverlay } from './EditorOverlay';

const SCALE_FACTOR = 0.65; // Scale down for display

interface CardCanvasProps {
  showOverlays?: boolean;
}

export function CardCanvas({ showOverlays = true }: CardCanvasProps) {
  const stageRef = useRef<Konva.Stage>(null);
  const { layers, selectedLayerId, selectLayer, updateLayer } = useCardStore();
  const baseLayer = layers.find((l) => l.type === 'base');
  const stageWidth = baseLayer ? (baseLayer as any).width * SCALE_FACTOR : CARD_WIDTH_PX * SCALE_FACTOR;
  const stageHeight = baseLayer ? (baseLayer as any).height * SCALE_FACTOR : CARD_HEIGHT_PX * SCALE_FACTOR;

  const handleStageClick = useCallback(
    (e: Konva.KonvaEventObject<MouseEvent>) => {
      // Click on empty space deselects
      if (e.target === e.target.getStage()) {
        selectLayer(null);
      }
    },
    [selectLayer]
  );

  const handleDragEnd = useCallback(
    (layerId: string, e: Konva.KonvaEventObject<DragEvent>) => {
      const node = e.target;
      const layer = layers.find(l => l.id === layerId);
      let newX = Math.round(node.x() / SCALE_FACTOR);
      const newY = Math.round(node.y() / SCALE_FACTOR);

      // Text layers store x as the anchor point (center/left/right), not the box left edge
      if (layer && layer.type === 'text') {
        const textLayer = layer as any;
        if (textLayer.justify === 'center') {
          newX = newX + Math.round(textLayer.width / 2);
        } else if (textLayer.justify === 'right') {
          newX = newX + textLayer.width;
        }
      }

      updateLayer(layerId, {
        x: newX,
        y: newY,
      } as Partial<Layer>);
    },
    [updateLayer, layers]
  );

  const handleSelect = useCallback(
    (layerId: string) => {
      selectLayer(layerId);
    },
    [selectLayer]
  );

  const handleTransformEnd = useCallback(
    (layerId: string, e: Konva.KonvaEventObject<Event>) => {
      const node = e.target;
      const scaleX = node.scaleX();
      const scaleY = node.scaleY();

      // Reset scale and apply to width/height
      node.scaleX(1);
      node.scaleY(1);

      updateLayer(layerId, {
        x: Math.round(node.x() / SCALE_FACTOR),
        y: Math.round(node.y() / SCALE_FACTOR),
        width: Math.round((node.width() * scaleX) / SCALE_FACTOR),
        height: Math.round((node.height() * scaleY) / SCALE_FACTOR),
      } as Partial<Layer>);
    },
    [updateLayer]
  );

  const exportAsPng = useCallback(() => {
    if (!stageRef.current || !baseLayer) return;

    // Standard poker card: 63.5 × 88 mm at 300 DPI = 750 × 1039 pixels
    const PRINT_DPI = 300;
    const CARD_WIDTH_MM = 63.5;
    const CARD_HEIGHT_MM = 88;
    const baseWidth = (baseLayer as any).width;
    const baseHeight = (baseLayer as any).height;

    // Determine if portrait or landscape based on base layer
    const isLandscape = baseWidth > baseHeight;
    const exportWidth = isLandscape
      ? Math.round(CARD_HEIGHT_MM / 25.4 * PRINT_DPI)   // 1039px
      : Math.round(CARD_WIDTH_MM / 25.4 * PRINT_DPI);   // 750px
    const exportHeight = isLandscape
      ? Math.round(CARD_WIDTH_MM / 25.4 * PRINT_DPI)    // 750px
      : Math.round(CARD_HEIGHT_MM / 25.4 * PRINT_DPI);  // 1039px

    // Create a temporary stage at export resolution
    const container = document.createElement('div');
    container.style.position = 'absolute';
    container.style.left = '-9999px';
    document.body.appendChild(container);

    const exportStage = new Konva.Stage({
      container,
      width: exportWidth,
      height: exportHeight,
    });

    // Clone current layers and scale from display size to export size
    const currentStage = stageRef.current;
    const konvaLayer = currentStage.getLayers()[0];
    const clonedLayer = konvaLayer.clone();

    // Scale from display pixels to export pixels
    const scaleToExport = exportWidth / stageWidth;
    clonedLayer.scale({ x: scaleToExport, y: scaleToExport });
    exportStage.add(clonedLayer);

    const dataUrl = exportStage.toDataURL({ pixelRatio: 1 });

    // Download
    const link = document.createElement('a');
    link.download = 'tm-card.png';
    link.href = dataUrl;
    link.click();

    // Cleanup
    exportStage.destroy();
    document.body.removeChild(container);
  }, [baseLayer, stageWidth]);

  // Expose export function globally for the toolbar
  (window as any).__exportCardAsPng = exportAsPng;

  return (
    <div className="card-canvas-container">
      <div className="card-canvas-wrapper" style={{ position: 'relative', display: 'inline-block' }}>
        <Stage
          ref={stageRef}
          width={stageWidth}
          height={stageHeight}
          onClick={handleStageClick}
          onTap={handleStageClick}
          style={{ border: '1px solid #333', backgroundColor: '#f0f0f0' }}
        >
          <KonvaLayer>
            {layers.map((layer) => {
              const isSelected = layer.id === selectedLayerId;
              const commonProps = {
                key: layer.id,
                layer,
                isSelected,
                scaleFactor: SCALE_FACTOR,
                onSelect: () => handleSelect(layer.id),
                onDragEnd: (e: Konva.KonvaEventObject<DragEvent>) => handleDragEnd(layer.id, e),
                onTransformEnd: (e: Konva.KonvaEventObject<Event>) => handleTransformEnd(layer.id, e),
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
        <EditorOverlay containerWidth={stageWidth} containerHeight={stageHeight} visible={showOverlays} />
      </div>
    </div>
  );
}
