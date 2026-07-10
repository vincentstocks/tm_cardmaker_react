import { useRef, useEffect, useState } from 'react';
import { Image, Transformer } from 'react-konva';
import useImage from 'use-image';
import Konva from 'konva';
import { BlockLayer } from '../../types';
import { blockAssets } from '../../data/assets';
import { LayerRendererProps } from './types';

function useImageWithFallback(url: string, isCustom: boolean): [HTMLImageElement | undefined, string] {
  const [corsImage, corsStatus] = useImage(url, 'anonymous');
  const [noCorsImage, noCorsStatus] = useImage(isCustom && corsStatus === 'failed' ? url : '', undefined);

  if (!isCustom) {
    return [corsImage, corsStatus];
  }
  if (corsStatus === 'loaded') {
    return [corsImage, 'loaded'];
  }
  if (corsStatus === 'failed') {
    return [noCorsImage, noCorsStatus];
  }
  return [undefined, corsStatus];
}

export function BlockLayerRenderer({
  layer,
  isSelected,
  scaleFactor,
  opacity,
  onSelect,
  onDragEnd,
  onDragMove,
  onTransformEnd,
}: LayerRendererProps) {
  const block = layer as BlockLayer;
  const asset = blockAssets.find((a) => a.id === block.blockId);
  const imagePath = (block as any).customPath || asset?.path || '';
  const isCustom = !!(block as any).customPath || block.blockId.startsWith('custom-img-');
  const [image] = useImageWithFallback(imagePath, isCustom);
  const nodeRef = useRef<Konva.Image>(null);
  const trRef = useRef<Konva.Transformer>(null);

  useEffect(() => {
    if (isSelected && trRef.current && nodeRef.current) {
      trRef.current.nodes([nodeRef.current]);
      trRef.current.getLayer()?.batchDraw();
    }
  }, [isSelected]);

  return (
    <>
      <Image
        ref={nodeRef}
        image={image}
        x={block.x * scaleFactor}
        y={block.y * scaleFactor}
        width={block.width * scaleFactor}
        height={block.height * scaleFactor}
        opacity={opacity}
        draggable
        onClick={onSelect}
        onTap={onSelect}
        onDragEnd={onDragEnd}
        onDragMove={onDragMove}
        onTransformEnd={onTransformEnd}
      />
      {isSelected && (
        <Transformer
          ref={trRef}
          rotateEnabled={false}
          boundBoxFunc={(oldBox, newBox) => {
            // Minimum size
            if (newBox.width < 10 || newBox.height < 10) {
              return oldBox;
            }
            return newBox;
          }}
        />
      )}
    </>
  );
}
