import { useRef, useEffect } from 'react';
import { Image, Transformer } from 'react-konva';
import useImage from 'use-image';
import Konva from 'konva';
import { BlockLayer } from '../../types';
import { blockAssets } from '../../data/assets';
import { LayerRendererProps } from './types';

export function BlockLayerRenderer({
  layer,
  isSelected,
  scaleFactor,
  onSelect,
  onDragEnd,
  onTransformEnd,
}: LayerRendererProps) {
  const block = layer as BlockLayer;
  const asset = blockAssets.find((a) => a.id === block.blockId);
  const [image] = useImage(asset?.path || '');
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
        draggable
        onClick={onSelect}
        onTap={onSelect}
        onDragEnd={onDragEnd}
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
