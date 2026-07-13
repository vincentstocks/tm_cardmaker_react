import { useRef, useCallback, useState, useEffect } from 'react';
import { Stage, Layer as KonvaLayer, Line } from 'react-konva';
import Konva from 'konva';
import { useCardStore } from '../store/cardStore';
import { useCardCanvas } from '../context/CardCanvasContext';
import { BlockLayerRenderer } from './layers/BlockLayerRenderer';
import { TextLayerRenderer } from './layers/TextLayerRenderer';
import { ProductionLayerRenderer } from './layers/ProductionLayerRenderer';
import { EffectLayerRenderer } from './layers/EffectLayerRenderer';
import { BaseLayerRenderer } from './layers/BaseLayerRenderer';
import { Layer, BaseLayer, TextLayer } from '../types';
import { CARD_WIDTH_PX, CARD_HEIGHT_PX, DISPLAY_SCALE } from '../utils/cardDimensions';
import { EditorOverlay } from './EditorOverlay';

const SCALE_FACTOR = DISPLAY_SCALE;

/**
 * Capture the Konva stage as a data URL at 600 DPI (2x template resolution).
 * Hides transformers during capture and restores them after.
 * Returns null if the canvas is tainted.
 */
function captureStageAsDataUrl(stage: Konva.Stage, baseLayer: BaseLayer): string | null {
  stage.find('Transformer').forEach((t: any) => t.hide());
  stage.draw();

  const baseWidth = baseLayer.width;
  const baseHeight = baseLayer.height;
  const isLandscape = baseWidth > baseHeight;
  const TEMPLATE_W = 826;
  const TEMPLATE_H = 1126;
  const EXPORT_SCALE = 2; // 2x = 600 DPI
  const exportWidth = (isLandscape ? TEMPLATE_H : TEMPLATE_W) * EXPORT_SCALE;
  const pixelRatio = exportWidth / (baseWidth * SCALE_FACTOR);

  const dataUrl = stage.toDataURL({
    mimeType: 'image/png',
    pixelRatio,
    width: baseWidth * SCALE_FACTOR,
    height: baseHeight * SCALE_FACTOR,
  });

  stage.find('Transformer').forEach((t: any) => t.show());
  stage.draw();

  if (!dataUrl || !dataUrl.includes(',')) {
    return null;
  }
  return dataUrl;
}

/**
 * Inject a pHYs chunk into a PNG to set DPI metadata.
 * This ensures the image prints at the correct physical size.
 * PNG pHYs stores pixels-per-unit (meter). 300 DPI = 11811 ppm.
 * Removes any existing pHYs chunk first to avoid conflicts.
 */
function injectPngDpi(pngData: Uint8Array, dpi: number): Uint8Array {
  const ppm = Math.round(dpi / 0.0254); // pixels per meter

  // First, remove any existing pHYs chunk
  let cleanData = removePngChunk(pngData, 'pHYs');

  // Build the pHYs chunk: 4 bytes X ppm + 4 bytes Y ppm + 1 byte unit (1 = meter)
  const phys = new Uint8Array(9);
  const view = new DataView(phys.buffer);
  view.setUint32(0, ppm); // X pixels per unit
  view.setUint32(4, ppm); // Y pixels per unit
  phys[8] = 1; // unit = meter

  // PNG chunk structure: 4 bytes length + 4 bytes type + data + 4 bytes CRC
  const chunkType = new Uint8Array([0x70, 0x48, 0x59, 0x73]); // "pHYs"
  const chunkLength = new Uint8Array(4);
  new DataView(chunkLength.buffer).setUint32(0, 9);

  // Calculate CRC32 over type + data
  const crcInput = new Uint8Array(4 + 9);
  crcInput.set(chunkType, 0);
  crcInput.set(phys, 4);
  const crc = crc32(crcInput);
  const crcBytes = new Uint8Array(4);
  new DataView(crcBytes.buffer).setUint32(0, crc);

  // Full chunk: length(4) + type(4) + data(9) + crc(4) = 21 bytes
  const chunk = new Uint8Array(21);
  chunk.set(chunkLength, 0);
  chunk.set(chunkType, 4);
  chunk.set(phys, 8);
  chunk.set(crcBytes, 17);

  // Insert pHYs chunk right after IHDR (PNG signature=8 + IHDR chunk=25 = offset 33)
  const insertAt = 33;
  const result = new Uint8Array(cleanData.length + 21);
  result.set(cleanData.slice(0, insertAt), 0);
  result.set(chunk, insertAt);
  result.set(cleanData.slice(insertAt), insertAt + 21);

  return result;
}

/** Remove a PNG chunk by type name */
function removePngChunk(data: Uint8Array, chunkName: string): Uint8Array {
  const nameBytes = new TextEncoder().encode(chunkName);
  let offset = 8; // skip PNG signature
  const pieces: Uint8Array[] = [data.slice(0, 8)];

  while (offset < data.length) {
    const len = new DataView(data.buffer, data.byteOffset + offset).getUint32(0);
    const totalChunkSize = 4 + 4 + len + 4; // length + type + data + crc
    const typeSlice = data.slice(offset + 4, offset + 8);

    const isTarget = typeSlice.length === 4 &&
      typeSlice[0] === nameBytes[0] && typeSlice[1] === nameBytes[1] &&
      typeSlice[2] === nameBytes[2] && typeSlice[3] === nameBytes[3];

    if (!isTarget) {
      pieces.push(data.slice(offset, offset + totalChunkSize));
    }
    offset += totalChunkSize;
  }

  // Concatenate pieces
  const totalLen = pieces.reduce((sum, p) => sum + p.length, 0);
  const result = new Uint8Array(totalLen);
  let pos = 0;
  for (const piece of pieces) {
    result.set(piece, pos);
    pos += piece.length;
  }
  return result;
}

/** CRC32 for PNG chunks */
function crc32(data: Uint8Array): number {
  let crc = 0xFFFFFFFF;
  for (let i = 0; i < data.length; i++) {
    crc ^= data[i];
    for (let j = 0; j < 8; j++) {
      crc = (crc >>> 1) ^ (crc & 1 ? 0xEDB88320 : 0);
    }
  }
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

interface CardCanvasProps {
  showOverlays?: boolean;
  snapEnabled?: boolean;
}

const SNAP_THRESHOLD = 5; // pixels (in display space)

interface GuideLine {
  orientation: 'horizontal' | 'vertical';
  position: number; // in display pixels
}

/** Get the bounding box edges and center of a layer in display pixels */
function getLayerBounds(layer: any, scaleFactor: number) {
  let x = (layer.x || 0) * scaleFactor;
  let y = (layer.y || 0) * scaleFactor;
  const w = (layer.width || 0) * scaleFactor;
  const h = (layer.height || 0) * scaleFactor;

  // Text layers render differently
  if (layer.type === 'text') {
    if (layer.justify === 'center') {
      x = (layer.x - layer.width / 2) * scaleFactor;
    } else if (layer.justify === 'right') {
      x = (layer.x - layer.width) * scaleFactor;
    }
    y = (layer.y - layer.height * 0.9) * scaleFactor;
  }

  return {
    left: x,
    right: x + w,
    top: y,
    bottom: y + h,
    centerX: x + w / 2,
    centerY: y + h / 2,
  };
}

export function CardCanvas({ showOverlays = true, snapEnabled = true }: CardCanvasProps) {
  const stageRef = useRef<Konva.Stage>(null);
  const { layers, selectedLayerId, selectLayer, updateLayer, cardName } = useCardStore();
  const canvasCtx = useCardCanvas();
  const baseLayer = layers.find((l) => l.type === 'base') as BaseLayer | undefined;
  const stageWidth = baseLayer ? baseLayer.width * SCALE_FACTOR : CARD_WIDTH_PX * SCALE_FACTOR;
  const stageHeight = baseLayer ? baseLayer.height * SCALE_FACTOR : CARD_HEIGHT_PX * SCALE_FACTOR;
  const [guides, setGuides] = useState<GuideLine[]>([]);

  const handleDragMove = useCallback(
    (layerId: string, e: Konva.KonvaEventObject<DragEvent>) => {
      if (!snapEnabled) return;

      const node = e.target;
      const nodeX = node.x();
      const nodeY = node.y();
      const nodeW = node.width() * node.scaleX();
      const nodeH = node.height() * node.scaleY();

      // Edges and center of the dragged node
      const dragBounds = {
        left: nodeX,
        right: nodeX + nodeW,
        top: nodeY,
        bottom: nodeY + nodeH,
        centerX: nodeX + nodeW / 2,
        centerY: nodeY + nodeH / 2,
      };

      const newGuides: GuideLine[] = [];
      let snappedX = nodeX;
      let snappedY = nodeY;
      let didSnapX = false;
      let didSnapY = false;

      // Compare against all other layers
      for (const other of layers) {
        if (other.id === layerId || other.type === 'base') continue;
        const otherBounds = getLayerBounds(other, SCALE_FACTOR);

        // Vertical snaps (X alignment)
        if (!didSnapX) {
          const xChecks = [
            { drag: dragBounds.left, other: otherBounds.left },
            { drag: dragBounds.right, other: otherBounds.right },
            { drag: dragBounds.centerX, other: otherBounds.centerX },
            { drag: dragBounds.left, other: otherBounds.right },
            { drag: dragBounds.right, other: otherBounds.left },
          ];
          for (const check of xChecks) {
            if (Math.abs(check.drag - check.other) < SNAP_THRESHOLD) {
              snappedX = nodeX + (check.other - check.drag);
              newGuides.push({ orientation: 'vertical', position: check.other });
              didSnapX = true;
              break;
            }
          }
        }

        // Horizontal snaps (Y alignment)
        if (!didSnapY) {
          const yChecks = [
            { drag: dragBounds.top, other: otherBounds.top },
            { drag: dragBounds.bottom, other: otherBounds.bottom },
            { drag: dragBounds.centerY, other: otherBounds.centerY },
            { drag: dragBounds.top, other: otherBounds.bottom },
            { drag: dragBounds.bottom, other: otherBounds.top },
          ];
          for (const check of yChecks) {
            if (Math.abs(check.drag - check.other) < SNAP_THRESHOLD) {
              snappedY = nodeY + (check.other - check.drag);
              newGuides.push({ orientation: 'horizontal', position: check.other });
              didSnapY = true;
              break;
            }
          }
        }

        if (didSnapX && didSnapY) break;
      }

      // Apply snap position
      if (didSnapX) node.x(snappedX);
      if (didSnapY) node.y(snappedY);

      setGuides(newGuides);
    },
    [snapEnabled, layers]
  );

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
      setGuides([]);
      const node = e.target;
      const layer = layers.find(l => l.id === layerId);
      let newX = Math.round(node.x() / SCALE_FACTOR);
      let newY = Math.round(node.y() / SCALE_FACTOR);

      // Text layers store x as the anchor point (center/left/right), not the box left edge
      // and y as the baseline, not the top of the rendered box
      if (layer && layer.type === 'text') {
        const textLayer = layer as TextLayer;
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
      const layer = layers.find(l => l.id === layerId);
      const scaleX = node.scaleX();
      const scaleY = node.scaleY();

      // Reset scale and apply to width/height
      node.scaleX(1);
      node.scaleY(1);

      if (layer && layer.type === 'text') {
        // For text layers: width controls wrapping, height controls font size
        // Only update if an actual resize happened
        if (Math.abs(scaleX - 1) < 0.01 && Math.abs(scaleY - 1) < 0.01) {
          return; // No actual transform, skip
        }

        const textLayer = layer as TextLayer;
        const newWidth = Math.round((node.width() * scaleX) / SCALE_FACTOR);

        const updates: any = { width: newWidth };

        // Only update font size if vertically scaled
        if (Math.abs(scaleY - 1) > 0.01) {
          updates.height = Math.round(textLayer.height * scaleY);
        }

        updateLayer(layerId, updates);
      } else {
        updateLayer(layerId, {
          x: Math.round(node.x() / SCALE_FACTOR),
          y: Math.round(node.y() / SCALE_FACTOR),
          width: Math.round((node.width() * scaleX) / SCALE_FACTOR),
          height: Math.round((node.height() * scaleY) / SCALE_FACTOR),
        } as Partial<Layer>);
      }
    },
    [updateLayer, layers]
  );

  const exportAsPng = useCallback(() => {
    if (!stageRef.current || !baseLayer) return;

    // Deselect everything before export
    selectLayer(null);

    // Use setTimeout to allow React to re-render with deselected state
    setTimeout(() => {
      const currentStage = stageRef.current;
      if (!currentStage) return;

      const dataUrl = captureStageAsDataUrl(currentStage, baseLayer as BaseLayer);
      if (!dataUrl) {
        alert('Export failed. If you uploaded an image from a URL, try uploading it from your device instead.');
        return;
      }

      // Convert dataURL to Uint8Array
      const byteString = atob(dataUrl.split(',')[1]);
      const pngBytes = new Uint8Array(byteString.length);
      for (let i = 0; i < byteString.length; i++) {
        pngBytes[i] = byteString.charCodeAt(i);
      }

      // Inject pHYs chunk with 600 DPI for correct print sizing
      const pngWithDpi = injectPngDpi(pngBytes, 600);

      const blob = new Blob([pngWithDpi], { type: 'image/png' });
      const url = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.download = (cardName.trim() || 'tm-card') + '.png';
      link.href = url;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 100);
  }, [baseLayer, selectLayer, cardName]);

  // Register export function on context for the toolbar
  useEffect(() => {
    canvasCtx.exportCardAsPng.current = exportAsPng;
    return () => { canvasCtx.exportCardAsPng.current = null; };
  }, [exportAsPng, canvasCtx]);

  // Print as A4 PDF with correct physical card size
  const printAsPdf = useCallback(() => {
    if (!stageRef.current || !baseLayer) return;

    selectLayer(null);

    setTimeout(() => {
      const currentStage = stageRef.current;
      if (!currentStage) return;

      const dataUrl = captureStageAsDataUrl(currentStage, baseLayer as BaseLayer);
      if (!dataUrl) {
        alert('Export failed. If you uploaded an image from a URL, try uploading it from your device instead.');
        return;
      }

      const baseWidth = (baseLayer as BaseLayer).width;
      const baseHeight = (baseLayer as BaseLayer).height;
      const isLandscape = baseWidth > baseHeight;

      // Template at 300 DPI: 826/300*25.4 = 69.9mm, 1126/300*25.4 = 95.3mm
      const cardWidthMm = isLandscape ? 95.3 : 69.9;
      const cardHeightMm = isLandscape ? 69.9 : 95.3;

      // Open print dialog
      canvasCtx.openPrintDialog.current?.([{ name: cardName.trim() || 'Current card', dataUrl, widthMm: cardWidthMm, heightMm: cardHeightMm }]);
    }, 100);
  }, [baseLayer, selectLayer, cardName]);

  useEffect(() => {
    canvasCtx.printCardAsPdf.current = printAsPdf;
    return () => { canvasCtx.printCardAsPdf.current = null; };
  }, [printAsPdf, canvasCtx]);

  // Expose a function to get the card as dataUrl (for print dialog)
  const getCardDataUrl = useCallback(() => {
    if (!stageRef.current || !baseLayer) return '';
    return captureStageAsDataUrl(stageRef.current, baseLayer as BaseLayer) || '';
  }, [baseLayer]);

  useEffect(() => {
    canvasCtx.getCardDataUrl.current = getCardDataUrl;
    canvasCtx.stageRef.current = stageRef.current;
    return () => {
      canvasCtx.getCardDataUrl.current = null;
      canvasCtx.stageRef.current = null;
    };
  }, [getCardDataUrl, canvasCtx]);

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
                onDragMove: (e: Konva.KonvaEventObject<DragEvent>) => handleDragMove(layer.id, e),
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
                onDragMove: (e: Konva.KonvaEventObject<DragEvent>) => handleDragMove(layer.id, e),
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
            {/* Snap guide lines */}
            {guides.map((guide, i) =>
              guide.orientation === 'vertical' ? (
                <Line
                  key={`guide-${i}`}
                  points={[guide.position, 0, guide.position, stageHeight]}
                  stroke="#ff4081"
                  strokeWidth={1}
                  dash={[4, 4]}
                />
              ) : (
                <Line
                  key={`guide-${i}`}
                  points={[0, guide.position, stageWidth, guide.position]}
                  stroke="#ff4081"
                  strokeWidth={1}
                  dash={[4, 4]}
                />
              )
            )}
          </KonvaLayer>
        </Stage>
        <EditorOverlay containerWidth={stageWidth} containerHeight={stageHeight} visible={showOverlays && !selectedLayerId} />
      </div>
    </div>
  );
}
