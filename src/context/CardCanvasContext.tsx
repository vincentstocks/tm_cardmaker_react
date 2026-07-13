import { createContext, useContext, useRef, MutableRefObject } from 'react';
import Konva from 'konva';

interface PrintCard {
  name: string;
  dataUrl: string;
  widthMm: number;
  heightMm: number;
}

export interface CardCanvasContextValue {
  /** Export the current card as a PNG file download */
  exportCardAsPng: MutableRefObject<(() => void) | null>;
  /** Open the print dialog with the current card */
  printCardAsPdf: MutableRefObject<(() => void) | null>;
  /** Open the print dialog with given cards (set by App, called by CardCanvas) */
  openPrintDialog: MutableRefObject<((cards: PrintCard[]) => void) | null>;
  /** Get the current card as a data URL (used by PrintDialog) */
  getCardDataUrl: MutableRefObject<(() => string) | null>;
  /** Reference to the Konva stage (used by PrintDialog to poll image loading) */
  stageRef: MutableRefObject<Konva.Stage | null>;
}

const CardCanvasContext = createContext<CardCanvasContextValue | null>(null);

export function CardCanvasProvider({ children }: { children: React.ReactNode }) {
  const exportCardAsPng = useRef<(() => void) | null>(null);
  const printCardAsPdf = useRef<(() => void) | null>(null);
  const openPrintDialog = useRef<((cards: PrintCard[]) => void) | null>(null);
  const getCardDataUrl = useRef<(() => string) | null>(null);
  const stageRef = useRef<Konva.Stage | null>(null);

  return (
    <CardCanvasContext.Provider value={{ exportCardAsPng, printCardAsPdf, openPrintDialog, getCardDataUrl, stageRef }}>
      {children}
    </CardCanvasContext.Provider>
  );
}

export function useCardCanvas(): CardCanvasContextValue {
  const ctx = useContext(CardCanvasContext);
  if (!ctx) {
    throw new Error('useCardCanvas must be used within a CardCanvasProvider');
  }
  return ctx;
}
