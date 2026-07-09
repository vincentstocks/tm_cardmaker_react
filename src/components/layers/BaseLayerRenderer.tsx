import { Rect } from 'react-konva';
import { BaseLayer } from '../../types';
import { LayerRendererProps } from './types';

export function BaseLayerRenderer({ layer, scaleFactor }: LayerRendererProps) {
  const base = layer as BaseLayer;
  return (
    <Rect
      x={0}
      y={0}
      width={base.width * scaleFactor}
      height={base.height * scaleFactor}
      fill={base.color}
      listening={false}
    />
  );
}
