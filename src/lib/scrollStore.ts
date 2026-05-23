/**
 * Module-level mutable singleton.
 * Updated by the scroll listener on the page, read every frame inside the Canvas.
 * Using a plain object avoids React re-renders on every scroll tick.
 */
export const scrollStore = {
  progress: 0, // 0 (top) → 1 (bottom)
};
