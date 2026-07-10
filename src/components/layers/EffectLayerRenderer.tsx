import { useRef, useEffect } from 'react';
import { Rect, Group, Transformer } from 'react-konva';
import Konva from 'konva';
import { EffectLayer } from '../../types';
import { LayerRendererProps } from './types';

export function EffectLayerRenderer({
  layer,
  isSelected,
  scaleFactor,
  onSelect,
  onDragEnd,
  onDragMove,
  onTransformEnd,
}: LayerRendererProps) {
  const effect = layer as EffectLayer;
  const nodeRef = useRef<Konva.Group>(null);
  const trRef = useRef<Konva.Transformer>(null);

  useEffect(() => {
    if (isSelected && trRef.current && nodeRef.current) {
      trRef.current.nodes([nodeRef.current]);
      trRef.current.getLayer()?.batchDraw();
    }
  }, [isSelected]);

  const x = effect.x * scaleFactor;
  const y = effect.y * scaleFactor;
  const w = effect.width * scaleFactor;
  const h = effect.height * scaleFactor;
  const border = 5 * scaleFactor;

  return (
    <>
      <Group
        ref={nodeRef}
        x={x}
        y={y}
        width={w}
        height={h}
        draggable
        onClick={onSelect}
        onTap={onSelect}
        onDragEnd={onDragEnd}
        onDragMove={onDragMove}
        onTransformEnd={onTransformEnd}
      >
        {/* Outer border (gradient simulated with solid gray) */}
        <Rect width={w} height={h} fill="#777777" />
        {/* Inner area (white/gray gradient simulated) */}
        <Rect x={border} y={border} width={w - 2 * border} height={h - 2 * border} fill="#cccccc" />
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
