import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useCardStore } from '../store/cardStore';
import { cardTemplates } from '../data/templates';
import { FilePlus, Trash2, Undo2, Redo2, Type, Box, Sparkles, Minus, Download, Save, FolderOpen, Printer } from 'lucide-react';

export function Toolbar() {
  const { loadTemplate, clearProject, undo, redo, canUndo, canRedo, addTextLayer, addProductionBox, addEffectBox, addLine, cardName, setCardName, saveProject, getSavedProjects, loadProject, deleteProject } = useCardStore();
  const [showTemplates, setShowTemplates] = useState(false);
  const [showLoadMenu, setShowLoadMenu] = useState(false);
  const [showNamePrompt, setShowNamePrompt] = useState(false);
  const [nameInput, setNameInput] = useState('');
  const nameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (showNamePrompt && nameInputRef.current) {
      nameInputRef.current.focus();
    }
  }, [showNamePrompt]);

  const handleExport = () => {
    const exportFn = (window as any).__exportCardAsPng;
    if (exportFn) exportFn();
  };

  const handleSave = () => {
    if (!cardName.trim()) {
      setNameInput('');
      setShowNamePrompt(true);
    } else {
      saveProject();
    }
  };

  const handleNameSubmit = () => {
    if (!nameInput.trim()) return;
    setCardName(nameInput.trim());
    setShowNamePrompt(false);
    setTimeout(() => useCardStore.getState().saveProject(), 0);
  };

  const savedProjects = getSavedProjects();

  return (
    <div className="toolbar">
      <div className="toolbar-group">
        <input
          type="text"
          className="toolbar-card-name"
          placeholder="Card name..."
          value={cardName}
          onChange={(e) => setCardName(e.target.value)}
        />
      </div>

      <div className="toolbar-separator" />

      <div className="toolbar-group">
        <button className="toolbar-btn" onClick={() => setShowTemplates(!showTemplates)}>
          <FilePlus size={14} /> New
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
        <button className="toolbar-btn" onClick={handleSave} title="Save project">
          <Save size={14} /> Save
        </button>
        <button className="toolbar-btn" onClick={() => setShowLoadMenu(!showLoadMenu)} title="Load project">
          <FolderOpen size={14} /> Load
        </button>
        {showLoadMenu && (
          <div className="dropdown-menu dropdown-menu-load">
            {savedProjects.length === 0 ? (
              <div className="dropdown-item dropdown-item-empty">No saved projects</div>
            ) : (
              savedProjects
                .sort((a, b) => b.savedAt - a.savedAt)
                .map((p) => (
                  <div key={p.name} className="dropdown-item-row">
                    <button
                      className="dropdown-item"
                      onClick={() => {
                        loadProject(p.name);
                        setShowLoadMenu(false);
                      }}
                    >
                      {p.name}
                      <span className="dropdown-item-date">
                        {new Date(p.savedAt).toLocaleDateString()}
                      </span>
                    </button>
                    <button
                      className="dropdown-item-delete"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm(`Delete "${p.name}"?`)) {
                          deleteProject(p.name);
                          setShowLoadMenu(false);
                          setTimeout(() => setShowLoadMenu(true), 0);
                        }
                      }}
                      title="Delete project"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))
            )}
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
        <button className="toolbar-btn toolbar-btn-primary" onClick={() => {
          const printFn = (window as any).__printCardAsPdf;
          if (printFn) printFn();
        }} title="Print as A4 PDF with correct card size">
          <Printer size={14} /> Print PDF
        </button>
      </div>

      {showNamePrompt && createPortal(
        <div className="name-prompt-overlay" onClick={() => setShowNamePrompt(false)}>
          <div className="name-prompt" onClick={e => e.stopPropagation()}>
            <h3 className="name-prompt-title">Name your card</h3>
            <input
              ref={nameInputRef}
              type="text"
              className="name-prompt-input"
              placeholder="Enter card name..."
              value={nameInput}
              onChange={e => setNameInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') handleNameSubmit();
                if (e.key === 'Escape') setShowNamePrompt(false);
              }}
            />
            <div className="name-prompt-buttons">
              <button className="toolbar-btn" onClick={() => setShowNamePrompt(false)}>Cancel</button>
              <button className="toolbar-btn toolbar-btn-primary" onClick={handleNameSubmit} disabled={!nameInput.trim()}>
                <Save size={14} /> Save
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
