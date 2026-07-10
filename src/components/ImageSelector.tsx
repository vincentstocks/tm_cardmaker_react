import { useEffect, useRef, useState } from 'react';
import { useCardStore } from '../store/cardStore';
import { CARD_WIDTH_PX, CARD_HEIGHT_PX } from '../utils/cardDimensions';
import { BlockLayer } from '../types';

interface ImageSelectorProps {
  x: number;
  y: number;
  imageArea?: { x: number; y: number; w: number; h: number };
  onSelect: (blockId: string) => void;
  onClose: () => void;
}

export function ImageSelector({ x, y, imageArea, onSelect, onClose }: ImageSelectorProps) {
  const ref = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [urlInput, setUrlInput] = useState('');
  const [tab, setTab] = useState<'upload' | 'url'>('upload');
  const { layers, deleteLayer } = useCardStore();

  // Close on click outside
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    };
    setTimeout(() => document.addEventListener('mousedown', handleClick), 0);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [onClose]);

  const imageZonePos = imageArea ? {
    x: imageArea.x,
    y: imageArea.y,
    width: imageArea.w,
    height: imageArea.h,
  } : {
    x: Math.round(63 * CARD_WIDTH_PX / 826),
    y: Math.round(240 * CARD_HEIGHT_PX / 1126),
    width: Math.round(700 * CARD_WIDTH_PX / 826),
    height: Math.round(340 * CARD_HEIGHT_PX / 1126),
  };

  const placeImage = (imagePath: string) => {
    // Find and remove any existing custom image in the area
    const existingImg = layers.find(l =>
      l.type === 'block' &&
      ((l as BlockLayer).customPath || (l as BlockLayer).blockId?.startsWith('custom-img-'))
    );

    if (existingImg) {
      deleteLayer(existingImg.id);
    }

    // Load the image to get its native dimensions
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const layerData: Omit<BlockLayer, 'id'> = {
        type: 'block',
        name: 'Card Image',
        blockId: `custom-img-${Date.now()}`,
        x: imageZonePos.x,
        y: imageZonePos.y,
        width: img.naturalWidth,
        height: img.naturalHeight,
        showOtherBg: false,
        customPath: imagePath,
      };

      useCardStore.getState().addLayer(layerData);

      // Move the image to just before the template block (index 1),
      // so it's behind the template and shows through the transparent hole
      const allLayers = useCardStore.getState().layers;
      const newLayerIndex = allLayers.length - 1;
      if (newLayerIndex > 1) {
        useCardStore.getState().moveLayer(newLayerIndex, 1);
      }
    };
    img.onerror = () => {
      // CORS failed — retry without crossOrigin to at least get dimensions
      const img2 = new Image();
      img2.onload = () => {
        const layerData: Omit<BlockLayer, 'id'> = {
          type: 'block',
          name: 'Card Image',
          blockId: `custom-img-${Date.now()}`,
          x: imageZonePos.x,
          y: imageZonePos.y,
          width: img2.naturalWidth,
          height: img2.naturalHeight,
          showOtherBg: false,
          customPath: imagePath,
        };

        useCardStore.getState().addLayer(layerData);

        const allLayers = useCardStore.getState().layers;
        const newLayerIndex = allLayers.length - 1;
        if (newLayerIndex > 1) {
          useCardStore.getState().moveLayer(newLayerIndex, 1);
        }
      };
      img2.src = imagePath;
    };
    img.src = imagePath;

    onClose();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      if (dataUrl) {
        placeImage(dataUrl);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleUrlSubmit = () => {
    if (urlInput.trim()) {
      placeImage(urlInput.trim());
    }
  };

  const style: React.CSSProperties = {
    position: 'fixed',
    left: Math.min(x, window.innerWidth - 340),
    top: Math.min(y, window.innerHeight - 280),
    zIndex: 10000,
  };

  return (
    <div ref={ref} className="tag-selector image-selector" style={style}>
      <div className="tag-selector-header">
        <span>Set Card Image</span>
        <button className="tag-selector-close" onClick={onClose}>✕</button>
      </div>

      <div className="image-selector-tabs">
        <button
          className={`image-selector-tab ${tab === 'upload' ? 'active' : ''}`}
          onClick={() => setTab('upload')}
        >
          Upload
        </button>
        <button
          className={`image-selector-tab ${tab === 'url' ? 'active' : ''}`}
          onClick={() => setTab('url')}
        >
          From URL
        </button>
      </div>

      <div className="image-selector-content">
        {tab === 'upload' && (
          <div className="image-upload-area">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              style={{ display: 'none' }}
            />
            <button
              className="image-upload-btn"
              onClick={() => fileInputRef.current?.click()}
            >
              Choose File from Device
            </button>
            <p className="image-upload-hint">PNG, JPG, or WebP recommended</p>
          </div>
        )}

        {tab === 'url' && (
          <div className="image-url-area">
            <input
              type="text"
              className="image-url-input"
              placeholder="https://example.com/image.png"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleUrlSubmit(); }}
            />
            <button
              className="image-url-btn"
              onClick={handleUrlSubmit}
              disabled={!urlInput.trim()}
            >
              Load Image
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
