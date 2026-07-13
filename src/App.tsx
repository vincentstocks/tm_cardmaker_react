import { useEffect, useState } from 'react';
import { Toolbar } from './components/Toolbar';
import { CardCanvas } from './components/CardCanvas';
import { LayerPanel } from './components/LayerPanel';
import { AssetPicker } from './components/AssetPicker';
import { PropertyEditor } from './components/PropertyEditor';
import { TemplateSelector } from './components/TemplateSelector';
import { PrintDialog } from './components/PrintDialog';
import { CardCanvasProvider, useCardCanvas, PrintCard } from './context/CardCanvasContext';
import { useCardStore } from './store/cardStore';
import { Grid3x3, Magnet } from 'lucide-react';
import './App.css';

function AppContent() {
  const { undo, redo, isProjectStarted, selectLayer, deleteLayer, selectedLayerId, layers } = useCardStore();
  const canvasCtx = useCardCanvas();
  const [showOverlays, setShowOverlays] = useState(true);
  const [snapEnabled, setSnapEnabled] = useState(true);
  const [printDialogCards, setPrintDialogCards] = useState<PrintCard[] | null>(null);

  // Disable overlays and snap for back templates (they're just for export)
  useEffect(() => {
    if (!isProjectStarted) return;
    const hasBackTemplate = layers.some(
      (l: any) => l.type === 'block' && l.blockId && (
        l.blockId === 'tpl-card-back' ||
        l.blockId === 'tpl-prelude-back' ||
        l.blockId === 'tpl-corporation-back'
      )
    );
    if (hasBackTemplate) {
      setShowOverlays(false);
      setSnapEnabled(false);
    }
  }, [isProjectStarted]);

  // Register the print dialog opener on context so CardCanvas can call it
  useEffect(() => {
    canvasCtx.openPrintDialog.current = (cards) => {
      setPrintDialogCards(cards);
    };
    return () => { canvasCtx.openPrintDialog.current = null; };
  }, [canvasCtx]);

  const handleCanvasAreaClick = (e: React.MouseEvent) => {
    // Only deselect if clicking directly on the canvas-area background, not its children
    if ((e.target as HTMLElement).classList.contains('canvas-area')) {
      selectLayer(null);
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in input fields
      const tag = (e.target as HTMLElement).tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;

      if (e.ctrlKey && e.key === 'z') {
        e.preventDefault();
        undo();
      } else if (e.ctrlKey && e.key === 'y') {
        e.preventDefault();
        redo();
      } else if (e.ctrlKey && e.key === 'f') {
        e.preventDefault();
        setShowOverlays(v => !v);
      } else if (e.ctrlKey && e.key === 'g') {
        e.preventDefault();
        setSnapEnabled(v => !v);
      } else if (e.key === 'Delete') {
        if (selectedLayerId) {
          deleteLayer(selectedLayerId);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo, selectedLayerId, deleteLayer]);

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
            <button
              className={`overlay-toggle-btn ${snapEnabled ? 'active' : ''}`}
              onClick={() => setSnapEnabled(!snapEnabled)}
              title={snapEnabled ? 'Disable snap guides' : 'Enable snap guides'}
            >
              <Magnet size={12} /> Snap
            </button>
          </div>
          <div className="view-container">
            <CardCanvas showOverlays={showOverlays} snapEnabled={snapEnabled} />
          </div>
        </main>
        <aside className="sidebar-right">
          <LayerPanel />
          <PropertyEditor />
        </aside>
      </div>
      <footer className="app-footer">
        Inspired by the original website <a href="https://github.com/SliceOfBread/tm_cardmaker" target="_blank" rel="noopener noreferrer">TM Card Maker</a> by <a href="https://github.com/SliceOfBread" target="_blank" rel="noopener noreferrer">SliceOfBread</a>, rebuilt with a focus on usability. This website is not affiliated with Terraforming Mars or Fryxgames in any way. | <a href="https://github.com/vincentstocks/tm_cardmaker_react" target="_blank" rel="noopener noreferrer">Source code</a> (GPL-3.0)
      </footer>
      {printDialogCards && (
        <PrintDialog
          initialCards={printDialogCards}
          onClose={() => setPrintDialogCards(null)}
        />
      )}
    </div>
  );
}

function App() {
  return (
    <CardCanvasProvider>
      <AppContent />
    </CardCanvasProvider>
  );
}

export default App;
