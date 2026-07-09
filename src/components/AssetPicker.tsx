import { useState, useMemo } from 'react';
import { useCardStore } from '../store/cardStore';
import { getAssetCatalog } from '../data/assets';
import { BlockAsset } from '../types';

export function AssetPicker() {
  const [search, setSearch] = useState('');
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const { addBlock, loadTemplate } = useCardStore();

  const catalog = useMemo(() => getAssetCatalog(), []);

  const filteredCatalog = useMemo(() => {
    if (!search.trim()) return catalog;
    const term = search.toLowerCase();
    return catalog
      .map((cat) => ({
        ...cat,
        assets: cat.assets.filter((a) => a.label.toLowerCase().includes(term)),
      }))
      .filter((cat) => cat.assets.length > 0);
  }, [catalog, search]);

  const handleAddAsset = (asset: BlockAsset) => {
    if (asset.category === 'templates') {
      // Templates replace the entire card — map asset ID to template ID
      // Asset IDs are like "tpl-green-normal", template IDs are "green-normal"
      const templateId = asset.id.replace(/^tpl-/, '');
      loadTemplate(templateId);
    } else {
      addBlock(asset.id);
    }
  };

  return (
    <div className="asset-picker">
      <h3 className="panel-title">Assets</h3>
      <input
        type="text"
        className="asset-search"
        placeholder="Search assets..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <div className="asset-categories">
        {filteredCatalog.map((cat) => (
          <div key={cat.category} className="asset-category">
            <button
              className={`asset-category-header ${expandedCategory === cat.category ? 'expanded' : ''}`}
              onClick={() =>
                setExpandedCategory(expandedCategory === cat.category ? null : cat.category)
              }
            >
              <span className="category-arrow">{expandedCategory === cat.category ? '▼' : '▶'}</span>
              {cat.label}
              <span className="category-count">{cat.assets.length}</span>
            </button>
            {(expandedCategory === cat.category || search.trim()) && (
              <div className="asset-grid">
                {cat.assets.map((asset) => (
                  <button
                    key={asset.id}
                    className="asset-item"
                    onClick={() => handleAddAsset(asset)}
                    title={`Add ${asset.label}`}
                  >
                    <img
                      src={asset.path}
                      alt={asset.label}
                      className="asset-thumbnail"
                      loading="lazy"
                    />
                    <span className="asset-label">{asset.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
