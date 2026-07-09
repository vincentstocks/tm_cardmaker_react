import { useEffect } from 'react';
import { Toolbar } from './components/Toolbar';
import { CardCanvas } from './components/CardCanvas';
import { LayerPanel } from './components/LayerPanel';
import { AssetPicker } from './components/AssetPicker';
import { PropertyEditor } from './components/PropertyEditor';
import { TemplateSelector } from './components/TemplateSelector';
import { useCardStore } from './store/cardStore';
import './App.css';

function App() {
  const { undo, redo, isProjectStarted } = useCardStore();

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
          <CardCanvas />
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
