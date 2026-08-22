/** Outdoor atoms are 8px on screen. Scene stays 480×640. */

export const DREAM_ATOM = 8;
export const DREAM_COLS = 60;
export const DREAM_ROWS = 80;
export const DREAM_WIDTH = DREAM_COLS * DREAM_ATOM;
export const DREAM_HEIGHT = DREAM_ROWS * DREAM_ATOM;

export function dreamPx(col: number, row: number, w = 1, h = 1) {
  return {
    left: col * DREAM_ATOM,
    top: row * DREAM_ATOM,
    width: w * DREAM_ATOM,
    height: h * DREAM_ATOM,
  };
}
