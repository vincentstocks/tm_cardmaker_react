import { useRef, useEffect, useState, useCallback } from 'react';
import { Text, Transformer } from 'react-konva';
import Konva from 'konva';
import { TextLayer } from '../../types';
import { LayerRendererProps } from './types';
import { useCardStore } from '../../store/cardStore';

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
  opacity,
  onSelect,
  onDragEnd,
  onDragMove,
  onTransformEnd,
}: LayerRendererProps) {
  const textLayer = layer as TextLayer;
  const nodeRef = useRef<Konva.Text>(null);
  const trRef = useRef<Konva.Transformer>(null);
  const [isEditing, setIsEditing] = useState(false);
  const { updateLayer } = useCardStore();

  useEffect(() => {
    if (isSelected && !isEditing && trRef.current && nodeRef.current) {
      trRef.current.nodes([nodeRef.current]);
      trRef.current.getLayer()?.batchDraw();
    }
  }, [isSelected, isEditing]);

  const fontFamily = fontMap[textLayer.font] || textLayer.font;
  const fontStyle = `${textLayer.style === 'italic' ? 'italic ' : ''}${textLayer.weight === 'bold' ? 'bold' : ''}`.trim() || 'normal';

  // Calculate render position based on justify mode
  let renderX = textLayer.x;
  if (textLayer.justify === 'center') {
    renderX = textLayer.x - textLayer.width / 2;
  } else if (textLayer.justify === 'right') {
    renderX = textLayer.x - textLayer.width;
  }

  const handleDblClick = useCallback(() => {
    onSelect();
    setIsEditing(true);

    const textNode = nodeRef.current;
    if (!textNode) return;

    textNode.hide();
    if (trRef.current) trRef.current.hide();
    textNode.getLayer()?.batchDraw();

    const stage = textNode.getStage();
    if (!stage) return;
    const stageContainer = stage.container();
    const stageBox = stageContainer.getBoundingClientRect();
    const textPosition = textNode.getAbsolutePosition();

    // Create a minimal, clean input
    const isMultiline = textLayer.data.includes('\n') || textLayer.data.length > 30;
    const el = document.createElement(isMultiline ? 'textarea' : 'input') as HTMLTextAreaElement | HTMLInputElement;
    document.body.appendChild(el);

    el.value = textLayer.data;
    const fontSize = Math.max(12, textLayer.height * scaleFactor);

    Object.assign(el.style, {
      position: 'fixed',
      top: `${stageBox.top + textPosition.y}px`,
      left: `${stageBox.left + textPosition.x}px`,
      width: `${textNode.width()}px`,
      height: `${fontSize * 1.2}px`,
      fontSize: `${fontSize}px`,
      fontFamily,
      fontStyle: textLayer.style,
      fontWeight: textLayer.weight,
      textAlign: textLayer.justify,
      color: textLayer.color,
      lineHeight: '1',
      // Clean minimal styling
      border: 'none',
      borderBottom: '2px solid #e94560',
      borderRadius: '0',
      padding: '0',
      margin: '0',
      background: 'transparent',
      outline: 'none',
      resize: 'none',
      overflow: 'hidden',
      zIndex: '10000',
      boxSizing: 'border-box',
      boxShadow: '0 2px 8px rgba(233, 69, 96, 0.2)',
    });

    if (isMultiline && el instanceof HTMLTextAreaElement) {
      el.rows = textLayer.data.split('\n').length + 1;
      el.style.height = 'auto';
      el.style.minHeight = `${textNode.height()}px`;
      el.style.lineHeight = `${1 + textLayer.lineSpace / textLayer.height}`;
    }

    el.focus();
    el.select();

    // Auto-resize for textareas
    if (isMultiline) {
      const autoResize = () => {
        el.style.height = 'auto';
        el.style.height = el.scrollHeight + 'px';
      };
      el.addEventListener('input', autoResize);
      autoResize();
    }

    let finished = false;
    const finishEdit = () => {
      if (finished) return;
      finished = true;
      updateLayer(textLayer.id, { data: el.value });
      document.body.removeChild(el);
      textNode.show();
      if (trRef.current) trRef.current.show();
      textNode.getLayer()?.batchDraw();
      setIsEditing(false);
    };

    el.addEventListener('blur', finishEdit);
    el.addEventListener('keydown', ((e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        el.value = textLayer.data; // revert
        el.blur();
      }
      if (e.key === 'Enter' && !isMultiline) {
        el.blur();
      }
      if (e.key === 'Enter' && e.ctrlKey && isMultiline) {
        el.blur();
      }
    }) as EventListener);
  }, [textLayer, scaleFactor, fontFamily, onSelect, updateLayer]);

  // Listen for programmatic inline edit triggers (e.g., from cost zone overlay)
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail?.layerId === textLayer.id) {
        setTimeout(() => handleDblClick(), 150);
      }
    };
    window.addEventListener('trigger-inline-edit', handler);
    return () => window.removeEventListener('trigger-inline-edit', handler);
  }, [textLayer.id, handleDblClick]);

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
        opacity={opacity}
        draggable
        onClick={onSelect}
        onTap={onSelect}
        onDblClick={handleDblClick}
        onDblTap={handleDblClick}
        onDragEnd={onDragEnd}
        onDragMove={onDragMove}
        onTransformEnd={onTransformEnd}
      />
      {isSelected && !isEditing && (
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
