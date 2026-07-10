import { useEffect, useRef } from 'react';
import { blockAssets } from '../data/assets';

interface RequirementSelectorProps {
  x: number;
  y: number;
  onSelect: (reqBlockId: string) => void;
  onClose: () => void;
}

const reqOptions = [
  { id: 'req-min-big', label: 'Min (Large)', description: 'Minimum requirement with large box' },
  { id: 'req-min-medium', label: 'Min (Medium)', description: 'Minimum requirement with medium box' },
  { id: 'req-min-small', label: 'Min (Small)', description: 'Minimum requirement with small box' },
  { id: 'req-max-big', label: 'Max', description: 'Maximum requirement' },
  { id: 'req-normal', label: 'None', description: 'No requirement' },
];

export function RequirementSelector({ x, y, onSelect, onClose }: RequirementSelectorProps) {
  const ref = useRef<HTMLDivElement>(null);

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

  const style: React.CSSProperties = {
    position: 'fixed',
    left: Math.min(x, window.innerWidth - 280),
    top: Math.min(y, window.innerHeight - 320),
    zIndex: 10000,
  };

  // Get asset paths for preview
  const getAssetPath = (id: string) => {
    const asset = blockAssets.find(a => a.id === id);
    return asset?.path || '';
  };

  return (
    <div ref={ref} className="tag-selector req-selector" style={style}>
      <div className="tag-selector-header">
        <span>Set Requirement</span>
        <button className="tag-selector-close" onClick={onClose}>✕</button>
      </div>
      <div className="req-selector-list">
        {reqOptions.map((opt) => (
          <button
            key={opt.id}
            className="req-selector-item"
            onClick={() => onSelect(opt.id)}
          >
            <img src={getAssetPath(opt.id)} alt={opt.label} className="req-selector-img" />
            <div className="req-selector-info">
              <span className="req-selector-label">{opt.label}</span>
              <span className="req-selector-desc">{opt.description}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
