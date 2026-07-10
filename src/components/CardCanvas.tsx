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
      let newY = Math.round(node.y() / SCALE_FACTOR);

      // Text layers store x as the anchor point (center/left/right), not the box left edge
      // and y as the baseline, not the top of the rendered box
      if (layer && layer.type === 'text') {
        const textLayer = layer as any;
        if (textLayer.justify === 'center') {
          newX = newX + Math.round(textLayer.width / 2);
        } else if (textLayer.justify === 'right') {
          newX = newX + textLayer.width;
        }
        // Add back the y baseline offset (text renders at y - height*0.9)
        newY = newY + Math.round(textLayer.height * 0.9);
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

    // Deselect everything before export
    selectLayer(null);

    // Use setTimeout to allow React to re-render with deselected state
    setTimeout(() => {
      const currentStage = stageRef.current;
      if (!currentStage) return;

      // Hide transformers
      currentStage.find('Transformer').forEach((t: any) => t.hide());
      currentStage.draw();

      // Standard poker card: 63.5 × 88 mm at 300 DPI
      const baseWidth = (baseLayer as any).width;
      const baseHeight = (baseLayer as any).height;
      const isLandscape = baseWidth > baseHeight;
      const exportWidth = isLandscape ? CARD_HEIGHT_PX : CARD_WIDTH_PX;   // 1039 or 750
      const exportHeight = isLandscape ? CARD_WIDTH_PX : CARD_HEIGHT_PX;  // 750 or 1039

      // Export at the ratio needed to go from display size to print size
      const pixelRatio = exportWidth / (baseWidth * SCALE_FACTOR);

      const dataUrl = currentStage.toDataURL({
        mimeType: 'image/png',
        pixelRatio,
        width: baseWidth * SCALE_FACTOR,
        height: baseHeight * SCALE_FACTOR,
      });

      // Show transformers again
      currentStage.find('Transformer').forEach((t: any) => t.show());
      currentStage.draw();

      if (!dataUrl || !dataUrl.includes(',')) {
        console.error('Export failed: canvas may be tainted by cross-origin images');
        alert('Export failed. If you uploaded an image from a URL, try uploading it from your device instead.');
        return;
      }

      // Download via blob for better compatibility
      const byteString = atob(dataUrl.split(',')[1]);
      const mimeString = dataUrl.split(',')[0].split(':')[1].split(';')[0];
      const ab = new ArrayBuffer(byteString.length);
      const ia = new Uint8Array(ab);
      for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
      }
      const blob = new Blob([ab], { type: mimeString });
      const url = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.download = 'tm-card.png';
      link.href = url;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 100);
  }, [baseLayer, selectLayer]);

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
              // Skip selected layer on first pass — render it last for top interaction
              if (isSelected) return null;
              const commonProps = {
                key: layer.id,
                layer,
                isSelected: false,
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
            {/* Render selected layer on top so transform handles are always accessible */}
            {selectedLayerId && (() => {
              const layer = layers.find(l => l.id === selectedLayerId);
              if (!layer) return null;
              const commonProps = {
                key: layer.id + '-selected',
                layer,
                isSelected: true,
                scaleFactor: SCALE_FACTOR,
                opacity: 0.75,
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
            })()}
          </KonvaLayer>
        </Stage>
        <EditorOverlay containerWidth={stageWidth} containerHeight={stageHeight} visible={showOverlays && !selectedLayerId} />
      </div>
    </div>
  );
}
