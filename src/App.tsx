import { useEffect, useState } from 'react';
import { Toolbar } from './components/Toolbar';
import { CardCanvas } from './components/CardCanvas';
import { CardPreview } from './components/CardPreview';
import { LayerPanel } from './components/LayerPanel';
import { AssetPicker } from './components/AssetPicker';
import { PropertyEditor } from './components/PropertyEditor';
import { TemplateSelector } from './components/TemplateSelector';
import { useCardStore } from './store/cardStore';
import './App.css';

function App() {
  const { undo, redo, isProjectStarted } = useCardStore();
  const [viewMode, setViewMode] = useState<'editor' | 'preview'>('editor');
  const [showOverlays, setShowOverlays] = useState(true);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'z') {
        e.preventDefault();
        undo();
      } else if (e.ctrlKey && e.key === 'y') {
        e.preventDefault();
        redo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo]);

  // Show template selector if no project is started
  if (!isProjectStarted) {
    return <TemplateSelector />;
  }

  return (
    <div className="app">
      <Toolbar />
      <div className="app-body">
        <aside className="sidebar-left">
          <AssetPicker />
        </aside>
        <main className="canvas-area">
          <div className="view-controls">
            <div className="view-toggle">
              <button
                className={`view-toggle-btn ${viewMode === 'editor' ? 'active' : ''}`}
                onClick={() => setViewMode('editor')}
              >
                Editor
              </button>
              <button
                className={`view-toggle-btn ${viewMode === 'preview' ? 'active' : ''}`}
                onClick={() => setViewMode('preview')}
              >
                Preview
              </button>
            </div>
            {viewMode === 'editor' && (
              <button
                className={`overlay-toggle-btn ${showOverlays ? 'active' : ''}`}
                onClick={() => setShowOverlays(!showOverlays)}
                title={showOverlays ? 'Hide editable zones' : 'Show editable zones'}
              >
                {showOverlays ? '◻ Zones' : '◻ Zones'}
              </button>
            )}
          </div>
          <div className="view-container">
            {viewMode === 'editor' ? (
              <CardCanvas showOverlays={showOverlays} />
            ) : (
              <CardPreview />
            )}
          </div>
        </main>
        <aside className="sidebar-right">
          <LayerPanel />
          <PropertyEditor />
        </aside>
      </div>
    </div>
  );
}

export default App;
