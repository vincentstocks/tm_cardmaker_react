import { useEffect, useRef } from 'react';
import { blockAssets } from '../data/assets';

interface TagSelectorProps {
  x: number;
  y: number;
  onSelect: (tagBlockId: string) => void;
  onClose: () => void;
}

export function TagSelector({ x, y, onSelect, onClose }: TagSelectorProps) {
  const ref = useRef<HTMLDivElement>(null);
  const tags = blockAssets.filter(a => a.category === 'tags' && !a.hidden);

  // Close on click outside
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    };
    // Delay to avoid immediate close from the click that opened it
    setTimeout(() => document.addEventListener('mousedown', handleClick), 0);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [onClose]);

  // Position the popup near the click but keep it on screen
  const style: React.CSSProperties = {
    position: 'fixed',
    left: Math.min(x, window.innerWidth - 320),
    top: Math.min(y, window.innerHeight - 400),
    zIndex: 10000,
  };

  return (
    <div ref={ref} className="tag-selector" style={style}>
      <div className="tag-selector-header">
        <span>Select Tag</span>
        <button className="tag-selector-close" onClick={onClose}>✕</button>
      </div>
      <div className="tag-selector-grid">
        {tags.map((tag) => (
          <button
            key={tag.id}
            className="tag-selector-item"
            onClick={() => onSelect(tag.id)}
            title={tag.label}
          >
            <img src={tag.path} alt={tag.label} className="tag-selector-img" />
          </button>
        ))}
      </div>
    </div>
  );
}
