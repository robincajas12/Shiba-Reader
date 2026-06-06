const common = {
  fonts: {
    serif: 'Noto Serif JP',
  },

  spacing: {
    xs: 5,
    sm: 10,
    md: 15,
    lg: 20,
    xl: 30,
  },

  radius: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 20,
  },
};

export const ThemeBrown = {
  colors: {
    background: '#161616',
    surface: '#1c1c1c',
    card: '#252525',
    border: '#333333',

    text: '#c8c0b0',
    textMuted: '#8d8578',
    header: '#e5dccb',

    primary: '#c8c0b0',
    onPrimary: '#161616',

    accent: '#90cdf4',

    success: '#28a745',
    secondary: '#6c757d',
    error: '#ff4d4d',
    star: '#FFCC00',

    white: '#ffffff',
    black: '#000000',
  },

  ...common,
};

export const ThemeLight = {
  colors: {
    background: '#F5F1E8',
    surface: '#FFFFFF',
    card: '#FFFCF7',
    border: '#E4DED1',

    text: '#2F2A24',
    textMuted: '#7A7267',
    header: '#1F1A15',

    primary: '#6D4C41',
    onPrimary: '#FFFFFF',

    accent: '#8B5E3C',

    success: '#2E7D32',
    secondary: '#9E9E9E',
    error: '#C62828',
    star: '#D4A017',

    white: '#FFFFFF',
    black: '#000000',
  },

  ...common,
};

export const ThemePurple = {
  colors: {
    background: '#6753F9',
    surface: '#5A46F0',
    card: '#4D3BDD',
    border: '#8578FF',

    text: '#FFFFFF',
    textMuted: '#D8D2FF',
    header: '#FFFFFF',

    primary: '#FFFFFF',
    onPrimary: '#6753F9',

    accent: '#C4BDFF',

    success: '#4ADE80',
    secondary: '#AFA6FF',
    error: '#FF6B6B',
    star: '#FFD700',

    white: '#FFFFFF',
    black: '#000000',
  },

  ...common,
};

export const ThemeOLED = {
  colors: {
    background: '#000000',
    surface: '#111111',
    card: '#1A1A1A',
    border: '#2A2A2A',

    text: '#F5F5F5',
    textMuted: '#9A9A9A',
    header: '#FFFFFF',

    primary: '#FFFFFF',
    onPrimary: '#000000',

    accent: '#8B5CF6',

    success: '#22C55E',
    secondary: '#666666',
    error: '#EF4444',
    star: '#FACC15',

    white: '#FFFFFF',
    black: '#000000',
  },

  ...common,
};

export const ThemeBlueNight = {
  colors: {
    background: '#0F172A',
    surface: '#162033',
    card: '#1E293B',
    border: '#334155',

    text: '#E2E8F0',
    textMuted: '#94A3B8',
    header: '#FFFFFF',

    primary: '#38BDF8',
    onPrimary: '#0F172A',

    accent: '#7DD3FC',

    success: '#22C55E',
    secondary: '#64748B',
    error: '#EF4444',
    star: '#FACC15',

    white: '#FFFFFF',
    black: '#000000',
  },

  ...common,
};

export const ThemeForest = {
  colors: {
    background: '#15261D',
    surface: '#1D3327',
    card: '#274234',
    border: '#395A47',

    text: '#E8F0E9',
    textMuted: '#A5B5A7',
    header: '#FFFFFF',

    primary: '#7FB069',
    onPrimary: '#15261D',

    accent: '#B7D3A8',

    success: '#4ADE80',
    secondary: '#6B8F71',
    error: '#EF4444',
    star: '#FACC15',

    white: '#FFFFFF',
    black: '#000000',
  },

  ...common,
};

export const ThemeCrimson = {
  colors: {
    background: '#221315',
    surface: '#2D1A1D',
    card: '#382024',
    border: '#533036',

    text: '#F5EAEA',
    textMuted: '#C0A8A8',
    header: '#FFFFFF',

    primary: '#D95C5C',
    onPrimary: '#FFFFFF',

    accent: '#F0B6B6',

    success: '#4ADE80',
    secondary: '#8A6B6B',
    error: '#FF4D4D',
    star: '#FFD700',

    white: '#FFFFFF',
    black: '#000000',
  },

  ...common,
};

export const Themes = {
  brown: ThemeBrown,
  light: ThemeLight,
  purple: ThemePurple,
  oled: ThemeOLED,
  blueNight: ThemeBlueNight,
  forest: ThemeForest,
  crimson: ThemeCrimson,
};

export type ThemeType = typeof ThemeBrown;
export type ThemeName = keyof typeof Themes;

export const DefaultTheme = ThemeBlueNight;

// Mantener Theme por compatibilidad momentánea mientras se refactorizan los componentes
export const Theme = DefaultTheme;