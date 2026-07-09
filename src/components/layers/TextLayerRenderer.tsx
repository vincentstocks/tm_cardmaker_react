import { useRef, useEffect } from 'react';
import { Text, Transformer } from 'react-konva';
import Konva from 'konva';
import { TextLayer } from '../../types';
import { LayerRendererProps } from './types';

// Map font names to CSS font-family
const fontMap: Record<string, string> = {
  Prototype: 'Prototype',
  Pagella: 'Pagella',
  times: 'Times New Roman',
};

export function TextLayerRenderer({
  layer,
  isSelected,
  scaleFactor,
  onSelect,
  onDragEnd,
  onTransformEnd,
}: LayerRendererProps) {
  const textLayer = layer as TextLayer;
  const nodeRef = useRef<Konva.Text>(null);
  const trRef = useRef<Konva.Transformer>(null);

  useEffect(() => {
    if (isSelected && trRef.current && nodeRef.current) {
      trRef.current.nodes([nodeRef.current]);
      trRef.current.getLayer()?.batchDraw();
    }
  }, [isSelected]);

  const fontFamily = fontMap[textLayer.font] || textLayer.font;
  const fontStyle = `${textLayer.style === 'italic' ? 'italic ' : ''}${textLayer.weight === 'bold' ? 'bold' : ''}`.trim() || 'normal';

  // In the original app, x is the anchor point:
  //   - "center": x is the horizontal center of the text
  //   - "left": x is the left edge of the text
  //   - "right": x is the right edge of the text
  // In Konva, x is always the left edge of the bounding box, and `align`
  // controls alignment within that box. So we need to offset x based on justify.
  let renderX = textLayer.x;
  if (textLayer.justify === 'center') {
    renderX = textLayer.x - textLayer.width / 2;
  } else if (textLayer.justify === 'right') {
    renderX = textLayer.x - textLayer.width;
  }
  // "left" → x is already the left edge, no adjustment needed

  return (
    <>
      <Text
        ref={nodeRef}
        text={textLayer.data}
        x={renderX * scaleFactor}
        y={(textLayer.y - textLayer.height * 0.9) * scaleFactor}
        width={textLayer.width * scaleFactor}
        fontSize={textLayer.height * scaleFactor}
        fontFamily={fontFamily}
        fontStyle={fontStyle}
        fill={textLayer.color}
        align={textLayer.justify}
        lineHeight={1 + textLayer.lineSpace / textLayer.height}
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
          enabledAnchors={['middle-left', 'middle-right']}
          boundBoxFunc={(oldBox, newBox) => {
            if (newBox.width < 20) return oldBox;
            return newBox;
          }}
        />
      )}
    </>
  );
}
