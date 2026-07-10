import { useEffect, useState } from 'react';
import { Toolbar } from './components/Toolbar';
import { CardCanvas } from './components/CardCanvas';
import { LayerPanel } from './components/LayerPanel';
import { AssetPicker } from './components/AssetPicker';
import { PropertyEditor } from './components/PropertyEditor';
import { TemplateSelector } from './components/TemplateSelector';
import { useCardStore } from './store/cardStore';
import { Grid3x3 } from 'lucide-react';
import './App.css';

function App() {
  const { undo, redo, isProjectStarted, selectLayer } = useCardStore();
  const [showOverlays, setShowOverlays] = useState(true);

  const handleCanvasAreaClick = (e: React.MouseEvent) => {
    // Only deselect if clicking directly on the canvas-area background, not its children
    if ((e.target as HTMLElement).classList.contains('canvas-area')) {
      selectLayer(null);
    }
  };

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
        <main className="canvas-area" onClick={handleCanvasAreaClick}>
          <div className="view-controls">
            <button
              className={`overlay-toggle-btn ${showOverlays ? 'active' : ''}`}
              onClick={() => setShowOverlays(!showOverlays)}
              title={showOverlays ? 'Hide editable zones' : 'Show editable zones'}
            >
              <Grid3x3 size={12} /> Zones
            </button>
          </div>
          <div className="view-container">
            <CardCanvas showOverlays={showOverlays} />
          </div>
        </main>
        <aside className="sidebar-right">
          <LayerPanel />
          <PropertyEditor />
        </aside>
      </div>
      <footer className="app-footer">
        Inspired by the original website <a href="https://github.com/SliceOfBread/tm_cardmaker" target="_blank" rel="noopener noreferrer">TM Card Maker</a> by SliceOfBread, rebuilt with a focus on usability. This website is not affiliated with Terraforming Mars or Fryxgames in any way.
      </footer>
    </div>
  );
}

export default App;
