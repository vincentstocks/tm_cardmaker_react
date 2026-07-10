// Standard poker card dimensions: 63.5 × 88 mm
// At 300 DPI: 750 × 1039 pixels
export const PRINT_DPI = 300;
export const CARD_WIDTH_MM = 63.5;
export const CARD_HEIGHT_MM = 88;

// Internal canvas pixel dimensions (300 DPI print size)
export const CARD_WIDTH_PX = Math.round(CARD_WIDTH_MM / 25.4 * PRINT_DPI);   // 750
export const CARD_HEIGHT_PX = Math.round(CARD_HEIGHT_MM / 25.4 * PRINT_DPI); // 1039

// Landscape (for Prelude/Corporation cards)
export const CARD_LANDSCAPE_WIDTH_PX = CARD_HEIGHT_PX;  // 1039
export const CARD_LANDSCAPE_HEIGHT_PX = CARD_WIDTH_PX;  // 750

// Scale factors from the original app's coordinates (826×1126) to our canvas
export const SCALE_X = CARD_WIDTH_PX / 826;       // ~0.908
export const SCALE_Y = CARD_HEIGHT_PX / 1126;     // ~0.923

// Display scale factor (canvas pixels to screen pixels)
export const DISPLAY_SCALE = 0.65;

// Scale factors for landscape (original was 1126×826)
export const LANDSCAPE_SCALE_X = CARD_LANDSCAPE_WIDTH_PX / 1126;  // ~0.923
export const LANDSCAPE_SCALE_Y = CARD_LANDSCAPE_HEIGHT_PX / 826;  // ~0.908

/**
 * Scale a coordinate value from the original 826×1126 coordinate space
 * to the new 750×1039 space.
 */
export function scalePortrait(x: number, y: number, w?: number, h?: number) {
  return {
    x: Math.round(x * SCALE_X),
    y: Math.round(y * SCALE_Y),
    ...(w !== undefined ? { width: Math.round(w * SCALE_X) } : {}),
    ...(h !== undefined ? { height: Math.round(h * SCALE_Y) } : {}),
  };
}

export function scaleLandscape(x: number, y: number, w?: number, h?: number) {
  return {
    x: Math.round(x * LANDSCAPE_SCALE_X),
    y: Math.round(y * LANDSCAPE_SCALE_Y),
    ...(w !== undefined ? { width: Math.round(w * LANDSCAPE_SCALE_X) } : {}),
    ...(h !== undefined ? { height: Math.round(h * LANDSCAPE_SCALE_Y) } : {}),
  };
}
