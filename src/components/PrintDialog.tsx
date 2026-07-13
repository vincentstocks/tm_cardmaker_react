import { useState } from 'react';
import { jsPDF } from 'jspdf';
import { useCardStore } from '../store/cardStore';
import { useCardCanvas } from '../context/CardCanvasContext';
import { PrintCard } from '../context/CardCanvasContext';
import { Printer, Plus, Minus, X, Download } from 'lucide-react';

// Card back image paths (relative to public/)
const CARD_BACKS: Record<PrintCard['cardType'], string> = {
  standard: '/assets/templates/tm-card-back-v2.png',
  prelude: '/assets/templates/tm-prel-back.png',
  corporation: '/assets/templates/tm-corp-back.png',
};

interface PrintDialogProps {
  initialCards: PrintCard[];
  onClose: () => void;
}

/** Load an image and return it as a data URL for embedding in the PDF */
function loadImageAsDataUrl(src: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) { reject(new Error('No canvas context')); return; }
      ctx.drawImage(img, 0, 0);
      try {
        resolve(canvas.toDataURL('image/png'));
      } catch (e) {
        reject(new Error(`Canvas tainted for ${src}`));
      }
    };
    img.onerror = () => reject(new Error(`Failed to load ${src}`));
    img.src = src;
  });
}

/** Preload all back images, returns map of cardType -> dataUrl */
async function preloadBackImages(): Promise<Record<string, string>> {
  const backDataUrls: Record<string, string> = {};
  for (const [type, path] of Object.entries(CARD_BACKS)) {
    backDataUrls[type] = await loadImageAsDataUrl(path);
  }
  return backDataUrls;
}

/** Detect card type from project layers by checking the template block ID */
function detectCardType(layers: any[]): PrintCard['cardType'] {
  const templateBlock = layers.find((l: any) => l.type === 'block' && l.blockId?.startsWith('tpl-'));
  const blockId = templateBlock?.blockId || '';
  if (blockId.includes('prelude')) return 'prelude';
  if (blockId.includes('corporation')) return 'corporation';
  return 'standard';
}

export function PrintDialog({ initialCards, onClose }: PrintDialogProps) {
  const { getSavedProjects } = useCardStore();
  const canvasCtx = useCardCanvas();
  const [cards, setCards] = useState<PrintCard[]>(initialCards);
  const [renderingProject, setRenderingProject] = useState<string | null>(null);
  const [includeBacks, setIncludeBacks] = useState(false);
  const savedProjects = getSavedProjects();

  const addSavedProject = async (projectName: string) => {
    setRenderingProject(projectName);
    const projects = getSavedProjects();
    const project = projects.find(p => p.name === projectName);
    if (!project) {
      setRenderingProject(null);
      return;
    }

    // Store current state
    const currentState = useCardStore.getState();
    const currentLayers = [...currentState.layers];
    const currentName = currentState.cardName;
    const currentStarted = currentState.isProjectStarted;

    // Load the project
    useCardStore.getState().loadProject(projectName);

    // Wait for all images on the Konva stage to finish loading
    await new Promise<void>(resolve => {
      const maxWait = 10000;
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
          resolve();
          return;
        }
        setTimeout(check, pollInterval);
      };

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
      const cardType = detectCardType(project.layers);
      setCards(prev => [...prev, {
        name: projectName,
        dataUrl,
        widthMm: isLandscape ? 95.3 : 69.9,
        heightMm: isLandscape ? 69.9 : 95.3,
        cardType,
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

  /**
   * Compute the grid layout of cards on pages.
   * Returns an array of pages, each page being an array of card positions.
   */
  function computeLayout(cardList: PrintCard[]) {
    const pageW = 210;
    const pageH = 297;
    const margin = 10;
    const gap = 2;

    const pages: { x: number; y: number; w: number; h: number; card: PrintCard }[][] = [[]];
    let curX = margin;
    let curY = margin;
    let rowHeight = 0;
    let currentPage = 0;

    for (const card of cardList) {
      const isLandscape = card.widthMm > card.heightMm;
      const w = isLandscape ? card.heightMm : card.widthMm;
      const h = isLandscape ? card.widthMm : card.heightMm;

      if (curX + w > pageW - margin) {
        curX = margin;
        curY += rowHeight + gap;
        rowHeight = 0;
      }

      if (curY + h > pageH - margin) {
        currentPage++;
        pages.push([]);
        curX = margin;
        curY = margin;
        rowHeight = 0;
      }

      pages[currentPage].push({ x: curX, y: curY, w, h, card });
      curX += w + gap;
      rowHeight = Math.max(rowHeight, h);
    }

    return pages;
  }

  const handlePrint = async () => {
    if (cards.length === 0) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Please allow popups to print.');
      return;
    }

    const doc = printWindow.document;
    doc.title = 'TM Cards - Print';

    const style = doc.createElement('style');
    style.textContent = `
      @page { size: A4; margin: 0; }
      * { margin: 0; padding: 0; box-sizing: border-box; }
      .page { position: relative; width: 210mm; height: 297mm; page-break-after: always; overflow: hidden; }
      .page:last-child { page-break-after: auto; }
      img { display: block; }
    `;
    doc.head.appendChild(style);

    const pages = computeLayout(cards);

    // Render front pages
    for (const pageCards of pages) {
      const pageDiv = doc.createElement('div');
      pageDiv.className = 'page';

      for (const pos of pageCards) {
        const isLandscape = pos.card.widthMm > pos.card.heightMm;

        if (isLandscape) {
          const wrapper = doc.createElement('div');
          wrapper.style.position = 'absolute';
          wrapper.style.left = `${pos.x}mm`;
          wrapper.style.top = `${pos.y}mm`;
          wrapper.style.width = `${pos.w}mm`;
          wrapper.style.height = `${pos.h}mm`;
          wrapper.style.overflow = 'hidden';

          const img = doc.createElement('img');
          img.src = pos.card.dataUrl;
          img.style.width = `${pos.card.widthMm}mm`;
          img.style.height = `${pos.card.heightMm}mm`;
          img.style.transform = 'rotate(-90deg) translateX(-100%)';
          img.style.transformOrigin = 'top left';

          wrapper.appendChild(img);
          pageDiv.appendChild(wrapper);
        } else {
          const img = doc.createElement('img');
          img.src = pos.card.dataUrl;
          img.style.position = 'absolute';
          img.style.left = `${pos.x}mm`;
          img.style.top = `${pos.y}mm`;
          img.style.width = `${pos.w}mm`;
          img.style.height = `${pos.h}mm`;
          pageDiv.appendChild(img);
        }
      }

      doc.body.appendChild(pageDiv);
    }

    // Render back pages if enabled
    if (includeBacks) {
      const pageW = 210;

      for (const pageCards of pages) {
        const pageDiv = doc.createElement('div');
        pageDiv.className = 'page';

        for (const pos of pageCards) {
          const isLandscape = pos.card.widthMm > pos.card.heightMm;
          const backSrc = CARD_BACKS[pos.card.cardType];

          // Mirror x position for long-edge duplex
          const mirroredX = pageW - pos.x - pos.w;

          if (isLandscape) {
            const wrapper = doc.createElement('div');
            wrapper.style.position = 'absolute';
            wrapper.style.left = `${mirroredX}mm`;
            wrapper.style.top = `${pos.y}mm`;
            wrapper.style.width = `${pos.w}mm`;
            wrapper.style.height = `${pos.h}mm`;
            wrapper.style.overflow = 'hidden';

            const img = doc.createElement('img');
            img.src = backSrc;
            img.style.width = `${pos.card.widthMm}mm`;
            img.style.height = `${pos.card.heightMm}mm`;
            img.style.transform = 'rotate(-90deg) translateX(-100%)';
            img.style.transformOrigin = 'top left';

            wrapper.appendChild(img);
            pageDiv.appendChild(wrapper);
          } else {
            const img = doc.createElement('img');
            img.src = backSrc;
            img.style.position = 'absolute';
            img.style.left = `${mirroredX}mm`;
            img.style.top = `${pos.y}mm`;
            img.style.width = `${pos.w}mm`;
            img.style.height = `${pos.h}mm`;
            pageDiv.appendChild(img);
          }
        }

        doc.body.appendChild(pageDiv);
      }
    }

    // Trigger print after images load
    setTimeout(() => printWindow.print(), 500);
  };

  const handleSavePdf = async () => {
    if (cards.length === 0) return;

    const pageW = 210;
    const pageH = 297;
    const margin = 10;

    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const pages = computeLayout(cards);

    // Draw front pages
    for (let p = 0; p < pages.length; p++) {
      if (p > 0) pdf.addPage();

      for (const pos of pages[p]) {
        const isLandscape = pos.card.widthMm > pos.card.heightMm;

        if (isLandscape) {
          pdf.saveGraphicsState();
          const rad = -Math.PI / 2;
          const cos = Math.cos(rad);
          const sin = Math.sin(rad);
          pdf.setCurrentTransformationMatrix(
            pdf.Matrix(cos, sin, -sin, cos, pos.x, pos.y + pos.h)
          );
          pdf.addImage(pos.card.dataUrl, 'PNG', 0, 0, pos.card.widthMm, pos.card.heightMm);
          pdf.restoreGraphicsState();
        } else {
          pdf.addImage(pos.card.dataUrl, 'PNG', pos.x, pos.y, pos.w, pos.h);
        }
      }
    }

    // Draw back pages if enabled
    if (includeBacks) {
      let backDataUrls: Record<string, string>;
      try {
        backDataUrls = await preloadBackImages();
      } catch (err) {
        alert('Failed to load card back images. Make sure the back image files exist in public/assets/templates/.');
        console.error(err);
        return;
      }

      for (const pageCards of pages) {
        pdf.addPage();

        for (const pos of pageCards) {
          const backDataUrl = backDataUrls[pos.card.cardType];
          const isLandscape = pos.card.widthMm > pos.card.heightMm;

          // Mirror x for long-edge duplex printing
          const mirroredX = pageW - pos.x - pos.w;

          if (isLandscape) {
            pdf.saveGraphicsState();
            const rad = -Math.PI / 2;
            const cos = Math.cos(rad);
            const sin = Math.sin(rad);
            pdf.setCurrentTransformationMatrix(
              pdf.Matrix(cos, sin, -sin, cos, mirroredX, pos.y + pos.h)
            );
            pdf.addImage(backDataUrl, 'PNG', 0, 0, pos.card.widthMm, pos.card.heightMm);
            pdf.restoreGraphicsState();
          } else {
            pdf.addImage(backDataUrl, 'PNG', mirroredX, pos.y, pos.w, pos.h);
          }
        }
      }
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

          <div className="print-dialog-section">
            <label className="print-backs-toggle">
              <input
                type="checkbox"
                checked={includeBacks}
                onChange={(e) => setIncludeBacks(e.target.checked)}
              />
              <span>Include card backs (for double-sided printing)</span>
            </label>
            {includeBacks && (
              <p className="print-backs-hint">
                Back pages are added after each front page, mirrored for long-edge duplex printing. Enable "Flip on long edge" in your printer settings.
              </p>
            )}
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
