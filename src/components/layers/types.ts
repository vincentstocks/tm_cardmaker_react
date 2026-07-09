import Konva from 'konva';
import { Layer } from '../../types';

export interface LayerRendererProps {
  layer: Layer;
  isSelected: boolean;
  scaleFactor: number;
  onSelect: () => void;
  onDragEnd: (e: Konva.KonvaEventObject<DragEvent>) => void;
  onTransformEnd: (e: Konva.KonvaEventObject<Event>) => void;
}
