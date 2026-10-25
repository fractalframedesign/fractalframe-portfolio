/** Drawing mode's two themes: ink on paper, and the same drawing reversed for dark mode */
export const DRAWING_THEMES = ['drawing', 'drawing-dark'] as const;

export const THEMES = ['light', 'dark', ...DRAWING_THEMES];

const PREVIOUS_THEME_KEY = 'theme-before-drawing';

export const isDrawingTheme = (theme: string | undefined) =>
  theme === 'drawing' || theme === 'drawing-dark';

/** The drawing theme that matches a light or dark page */
export const drawingThemeFor = (dark: boolean) =>
  dark ? 'drawing-dark' : 'drawing';

/** The theme to return to when drawing mode is turned off (system if unknown) */
export function readThemeBeforeDrawing() {
  try {
    return localStorage.getItem(PREVIOUS_THEME_KEY) ?? 'system';
  } catch {
    return 'system';
  }
}

export function saveThemeBeforeDrawing(theme: string) {
  try {
    localStorage.setItem(PREVIOUS_THEME_KEY, theme);
  } catch {
    // Storage blocked: exiting falls back to the system theme
  }
}
