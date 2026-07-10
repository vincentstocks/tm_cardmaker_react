import { useState } from 'react';
import { useCardStore } from '../store/cardStore';
import { cardTemplates } from '../data/templates';
import { FilePlus, Trash2, Undo2, Redo2, Type, Box, Sparkles, Minus, Download } from 'lucide-react';

export function Toolbar() {
  const { loadTemplate, clearProject, undo, redo, canUndo, canRedo, addTextLayer, addProductionBox, addEffectBox, addLine } = useCardStore();
  const [showTemplates, setShowTemplates] = useState(false);

  const handleExport = () => {
    const exportFn = (window as any).__exportCardAsPng;
    if (exportFn) exportFn();
  };

  return (
    <div className="toolbar">
      <div className="toolbar-group">
        <button className="toolbar-btn" onClick={() => setShowTemplates(!showTemplates)}>
          <FilePlus size={14} /> New from Template
        </button>
        {showTemplates && (
          <div className="dropdown-menu">
            {cardTemplates.map((t) => (
              <button
                key={t.id}
                className="dropdown-item"
                onClick={() => {
                  loadTemplate(t.id);
                  setShowTemplates(false);
                }}
              >
                {t.label}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="toolbar-group">
        <button className="toolbar-btn" onClick={clearProject} title="Clear project">
          <Trash2 size={14} /> Clear
        </button>
      </div>

      <div className="toolbar-separator" />

      <div className="toolbar-group">
        <button className="toolbar-btn" onClick={undo} disabled={!canUndo()} title="Undo (Ctrl+Z)">
          <Undo2 size={14} /> Undo
        </button>
        <button className="toolbar-btn" onClick={redo} disabled={!canRedo()} title="Redo (Ctrl+Y)">
          <Redo2 size={14} /> Redo
        </button>
      </div>

      <div className="toolbar-separator" />

      <div className="toolbar-group">
        <button className="toolbar-btn" onClick={addTextLayer} title="Add text box">
          <Type size={14} /> Text
        </button>
        <button className="toolbar-btn" onClick={addProductionBox} title="Add production box">
          <Box size={14} /> Production
        </button>
        <button className="toolbar-btn" onClick={addEffectBox} title="Add effect box">
          <Sparkles size={14} /> Effect
        </button>
        <button className="toolbar-btn" onClick={addLine} title="Add line">
          <Minus size={14} /> Line
        </button>
      </div>

      <div className="toolbar-separator" />

      <div className="toolbar-group">
        <button className="toolbar-btn toolbar-btn-primary" onClick={handleExport} title="Export as PNG">
          <Download size={14} /> Export PNG
        </button>
      </div>
    </div>
  );
}
