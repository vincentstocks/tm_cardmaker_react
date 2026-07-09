import { useRef, useEffect } from 'react';
import { Rect, Group, Transformer } from 'react-konva';
import Konva from 'konva';
import { ProductionLayer } from '../../types';
import { LayerRendererProps } from './types';

export function ProductionLayerRenderer({
  layer,
  isSelected,
  scaleFactor,
  onSelect,
  onDragEnd,
  onTransformEnd,
}: LayerRendererProps) {
  const prod = layer as ProductionLayer;
  const nodeRef = useRef<Konva.Group>(null);
  const trRef = useRef<Konva.Transformer>(null);

  useEffect(() => {
    if (isSelected && trRef.current && nodeRef.current) {
      trRef.current.nodes([nodeRef.current]);
      trRef.current.getLayer()?.batchDraw();
    }
  }, [isSelected]);

  const x = prod.x * scaleFactor;
  const y = prod.y * scaleFactor;
  const w = prod.width * scaleFactor;
  const h = prod.height * scaleFactor;
  const border = 3 * scaleFactor;

  return (
    <>
      <Group
        ref={nodeRef}
        x={x}
        y={y}
        draggable
        onClick={onSelect}
        onTap={onSelect}
        onDragEnd={onDragEnd}
        onTransformEnd={onTransformEnd}
      >
        {/* Inner fill (production brown) */}
        <Rect width={w} height={h} fill="#7a5230" />
        {/* Inner border gradient */}
        <Rect x={border} y={0} width={w - 2 * border} height={border} fill="#9d6c43" />
        <Rect x={border} y={h - border} width={w - 2 * border} height={border} fill="#5a412c" />
        <Rect x={0} y={border} width={border} height={h - 2 * border} fill="#9d6c43" />
        <Rect x={w - border} y={border} width={border} height={h - 2 * border} fill="#5a412c" />
        {/* Outer border */}
        <Rect width={w} height={border} fill="#505050" />
        <Rect y={h - border} width={w} height={border} fill="#c0c0c0" />
        <Rect width={border} height={h} fill="#505050" />
        <Rect x={w - border} width={border} height={h} fill="#c0c0c0" />
      </Group>
      {isSelected && (
        <Transformer
          ref={trRef}
          rotateEnabled={false}
          boundBoxFunc={(oldBox, newBox) => {
            if (newBox.width < 20 || newBox.height < 20) return oldBox;
            return newBox;
          }}
        />
      )}
    </>
  );
}
