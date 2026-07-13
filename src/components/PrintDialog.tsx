import { useState } from 'react';
import { jsPDF } from 'jspdf';
import { useCardStore } from '../store/cardStore';
import { useCardCanvas } from '../context/CardCanvasContext';
import { Printer, Plus, Minus, X, Download } from 'lucide-react';

interface PrintCard {
  name: string;
  dataUrl: string;
  widthMm: number;
  heightMm: number;
}

interface PrintDialogProps {
  initialCards: PrintCard[];
  onClose: () => void;
}

export function PrintDialog({ initialCards, onClose }: PrintDialogProps) {
  const { getSavedProjects } = useCardStore();
  const canvasCtx = useCardCanvas();
  const [cards, setCards] = useState<PrintCard[]>(initialCards);
  const [renderingProject, setRenderingProject] = useState<string | null>(null);
  const savedProjects = getSavedProjects();

  // Card size: 69.9 x 95.3mm. A4 printable area with 10mm margins = 190x277mm
  // Portrait cards: 2 across (2*69.9=139.8), 2 down (2*95.3=190.6) — fits 2x2=4 per page easily
  //                 or 2 across, 3 down (3*95.3=285.9 > 277) — tight, but 2x2 is safe
  // Actually: A4 = 210x297mm, with 10mm margin = 190x277mm
  // 190/69.9 = 2.7 → 2 columns. 277/95.3 = 2.9 → 2 rows. So 2x2 = 4 per page for portrait.
  // For a mix, we'll just flow them in a grid.

  const addSavedProject = async (projectName: string) => {
    setRenderingProject(projectName);
    // Load the project, render it, get dataUrl
    // We'll use a temporary offscreen canvas approach
    const projects = getSavedProjects();
    const project = projects.find(p => p.name === projectName);
    if (!project) {
      setRenderingProject(null);
      return;
    }

    // Render the project by temporarily loading it
    // Store current state
    const currentState = useCardStore.getState();
    const currentLayers = [...currentState.layers];
    const currentName = currentState.cardName;
    const currentStarted = currentState.isProjectStarted;

    // Load the project
    useCardStore.getState().loadProject(projectName);

    // Wait for all images on the Konva stage to finish loading.
    // The useImage hook sets the image attribute on Konva.Image nodes once loaded.
    // We poll until all Image nodes have a loaded image, with a timeout fallback.
    await new Promise<void>(resolve => {
      const maxWait = 10000; // 10s max
      const pollInterval = 100;
      let elapsed = 0;

      const check = () => {
        elapsed += pollInterval;
        const stage = canvasCtx.stageRef.current;
        if (stage) {
          const imageNodes = stage.find('Image');
          const allLoaded = imageNodes.length > 0 && imageNodes.every((node: any) => node.image());
          if (allLoaded) {
            resolve();
            return;
          }
        }
        if (elapsed >= maxWait) {
          resolve(); // Give up after timeout
          return;
        }
        setTimeout(check, pollInterval);
      };

      // Initial delay to let React render the new layers
      setTimeout(check, 100);
    });

    // Capture the canvas
    const exportFn = canvasCtx.getCardDataUrl.current;
    let dataUrl = '';
    if (exportFn) {
      dataUrl = exportFn();
    }

    // Restore state
    if (currentStarted) {
      // Restore by directly setting state
      useCardStore.setState({
        layers: currentLayers,
        cardName: currentName,
        isProjectStarted: currentStarted,
        selectedLayerId: null,
      });
    }

    if (dataUrl) {
      const baseLayer = project.layers.find((l: any) => l.type === 'base');
      const isLandscape = baseLayer && (baseLayer as any).width > (baseLayer as any).height;
      setCards(prev => [...prev, {
        name: projectName,
        dataUrl,
        widthMm: isLandscape ? 95.3 : 69.9,
        heightMm: isLandscape ? 69.9 : 95.3,
      }]);
    }

    setRenderingProject(null);
  };

  const removeCard = (index: number) => {
    setCards(prev => prev.filter((_, i) => i !== index));
  };

  const duplicateCard = (index: number) => {
    setCards(prev => [...prev.slice(0, index + 1), prev[index], ...prev.slice(index + 1)]);
  };

  const handlePrint = () => {
    if (cards.length === 0) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Please allow popups to print.');
      return;
    }

    const doc = printWindow.document;
    doc.title = 'TM Cards - Print';

    // Add print styles
    const style = doc.createElement('style');
    style.textContent = `
      @page { size: A4; margin: 10mm; }
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body { display: flex; flex-wrap: wrap; align-content: flex-start; gap: 2mm; }
      img { display: block; }
    `;
    doc.head.appendChild(style);

    // Build card images using DOM APIs
    for (const card of cards) {
      const isLandscape = card.widthMm > card.heightMm;

      if (isLandscape) {
        const wrapper = doc.createElement('div');
        wrapper.style.width = `${card.heightMm}mm`;
        wrapper.style.height = `${card.widthMm}mm`;
        wrapper.style.overflow = 'hidden';

        const img = doc.createElement('img');
        img.src = card.dataUrl;
        img.style.width = `${card.widthMm}mm`;
        img.style.height = `${card.heightMm}mm`;
        img.style.transform = 'rotate(-90deg) translateX(-100%)';
        img.style.transformOrigin = 'top left';

        wrapper.appendChild(img);
        doc.body.appendChild(wrapper);
      } else {
        const img = doc.createElement('img');
        img.src = card.dataUrl;
        img.style.width = `${card.widthMm}mm`;
        img.style.height = `${card.heightMm}mm`;
        doc.body.appendChild(img);
      }
    }

    // Trigger print after images render
    printWindow.onload = () => {
      setTimeout(() => printWindow.print(), 300);
    };
    // Fallback: if onload already fired (data URLs load synchronously)
    setTimeout(() => printWindow.print(), 500);
  };

  const handleSavePdf = () => {
    if (cards.length === 0) return;

    // A4 dimensions in mm
    const pageW = 210;
    const pageH = 297;
    const margin = 10;
    const gap = 2;
    const printableW = pageW - 2 * margin;
    const printableH = pageH - 2 * margin;

    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

    let curX = margin;
    let curY = margin;
    let rowHeight = 0;

    for (let i = 0; i < cards.length; i++) {
      const card = cards[i];
      const isLandscape = card.widthMm > card.heightMm;
      // For landscape cards, rotate 90° so they take up portrait space
      const w = isLandscape ? card.heightMm : card.widthMm;
      const h = isLandscape ? card.widthMm : card.heightMm;

      // Check if card fits in current row
      if (curX + w > pageW - margin) {
        // Move to next row
        curX = margin;
        curY += rowHeight + gap;
        rowHeight = 0;
      }

      // Check if card fits on current page
      if (curY + h > pageH - margin) {
        // New page
        pdf.addPage();
        curX = margin;
        curY = margin;
        rowHeight = 0;
      }

      // Add the image (rotated for landscape cards)
      if (isLandscape) {
        // Use save/restore with rotation transform
        // Rotate -90° around the top-left of the placement area
        // After rotation: place image so it fits in the w×h box
        pdf.saveGraphicsState();
        // Translate to where we want the top-left of the rotated result
        // Then rotate -90°, then draw at adjusted position
        const rad = -Math.PI / 2;
        const cos = Math.cos(rad);
        const sin = Math.sin(rad);
        // Transform matrix: [cos, sin, -sin, cos, tx, ty]
        // We want the image (originally widthMm × heightMm) to appear at (curX, curY) 
        // occupying heightMm × widthMm after rotation
        pdf.setCurrentTransformationMatrix(
          pdf.Matrix(cos, sin, -sin, cos, curX, curY + h)
        );
        pdf.addImage(card.dataUrl, 'PNG', 0, 0, card.widthMm, card.heightMm);
        pdf.restoreGraphicsState();
      } else {
        pdf.addImage(card.dataUrl, 'PNG', curX, curY, w, h);
      }

      curX += w + gap;
      rowHeight = Math.max(rowHeight, h);
    }

    pdf.save('tm-cards.pdf');
  };

  return (
    <div className="print-dialog-overlay" onClick={onClose}>
      <div className="print-dialog" onClick={e => e.stopPropagation()}>
        <div className="print-dialog-header">
          <h2>Print Cards</h2>
          <button className="print-dialog-close" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <div className="print-dialog-body">
          <div className="print-dialog-section">
            <h3>Cards to print ({cards.length})</h3>
            <div className="print-card-list">
              {cards.map((card, i) => (
                <div key={i} className="print-card-item">
                  <img src={card.dataUrl} className="print-card-thumb" alt={card.name} />
                  <span className="print-card-name">{card.name}</span>
                  <button className="print-card-btn" onClick={() => duplicateCard(i)} title="Add another copy">
                    <Plus size={12} />
                  </button>
                  <button className="print-card-btn print-card-btn-danger" onClick={() => removeCard(i)} title="Remove">
                    <Minus size={12} />
                  </button>
                </div>
              ))}
              {cards.length === 0 && (
                <p className="print-empty">No cards added. Add saved projects below.</p>
              )}
            </div>
          </div>

          <div className="print-dialog-section">
            <h3>Add from saved projects</h3>
            <div className="print-saved-list">
              {savedProjects.length === 0 ? (
                <p className="print-empty">No saved projects.</p>
              ) : (
                savedProjects.map(p => (
                  <button
                    key={p.name}
                    className="print-saved-btn"
                    onClick={() => addSavedProject(p.name)}
                    disabled={renderingProject !== null}
                  >
                    <Plus size={12} /> {p.name}
                    {renderingProject === p.name && ' (loading...)'}
                  </button>
                ))
              )}
            </div>
          </div>

          <div className="print-dialog-info">
            <p>Cards are arranged on A4 pages at their correct physical size. Save PDF downloads directly; Print opens the browser print dialog.</p>
          </div>
        </div>

        <div className="print-dialog-footer">
          <button className="toolbar-btn" onClick={onClose}>Cancel</button>
          <button className="toolbar-btn toolbar-btn-primary" onClick={handleSavePdf} disabled={cards.length === 0}>
            <Download size={14} /> Save PDF
          </button>
          <button className="toolbar-btn toolbar-btn-primary" onClick={handlePrint} disabled={cards.length === 0}>
            <Printer size={14} /> Print
          </button>
        </div>
      </div>
    </div>
  );
}
