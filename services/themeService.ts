import { Theme } from '../types';

export interface ThemeColors {
  primary: string;
  primaryHover: string;
  background: string;
  foreground: string;
  card: string;
  cardBorder: string;
  muted: string;
  mutedForeground: string;
  accent: string;
  accentForeground: string;
}

export const themeConfigs: Record<Theme, ThemeColors> = {
  light: {
    primary: '#2563eb',
    primaryHover: '#1d4ed8',
    background: '#F8FAFC',
    foreground: '#0f172a',
    card: '#ffffff',
    cardBorder: '#e2e8f0',
    muted: '#f1f5f9',
    mutedForeground: '#64748b',
    accent: '#3b82f6',
    accentForeground: '#ffffff'
  },
  dark: {
    primary: '#3b82f6',
    primaryHover: '#2563eb',
    background: '#020617',
    foreground: '#f8fafc',
    card: '#1e293b',
    cardBorder: '#334155',
    muted: '#1e293b',
    mutedForeground: '#94a3b8',
    accent: '#3b82f6',
    accentForeground: '#ffffff'
  },
  blue: {
    primary: '#0ea5e9',
    primaryHover: '#0284c7',
    background: '#e0f2fe',
    foreground: '#0c4a6e',
    card: '#f0f9ff',
    cardBorder: '#7dd3fc',
    muted: '#bae6fd',
    mutedForeground: '#0369a1',
    accent: '#0ea5e9',
    accentForeground: '#ffffff'
  },
  purple: {
    primary: '#a855f7',
    primaryHover: '#9333ea',
    background: '#f3e8ff',
    foreground: '#581c87',
    card: '#faf5ff',
    cardBorder: '#d8b4fe',
    muted: '#e9d5ff',
    mutedForeground: '#7e22ce',
    accent: '#a855f7',
    accentForeground: '#ffffff'
  },
  green: {
    primary: '#10b981',
    primaryHover: '#059669',
    background: '#dcfce7',
    foreground: '#064e3b',
    card: '#f0fdf4',
    cardBorder: '#86efac',
    muted: '#bbf7d0',
    mutedForeground: '#047857',
    accent: '#10b981',
    accentForeground: '#ffffff'
  },
  'high-contrast-light': {
    primary: '#000000',
    primaryHover: '#1a1a1a',
    background: '#ffffff',
    foreground: '#000000',
    card: '#ffffff',
    cardBorder: '#000000',
    muted: '#f5f5f5',
    mutedForeground: '#000000',
    accent: '#000000',
    accentForeground: '#ffffff'
  },
  'high-contrast-dark': {
    primary: '#ffffff',
    primaryHover: '#e5e5e5',
    background: '#000000',
    foreground: '#ffffff',
    card: '#1a1a1a',
    cardBorder: '#ffffff',
    muted: '#1a1a1a',
    mutedForeground: '#ffffff',
    accent: '#ffffff',
    accentForeground: '#000000'
  },
  auto: {
    primary: '#2563eb',
    primaryHover: '#1d4ed8',
    background: '#F8FAFC',
    foreground: '#0f172a',
    card: '#ffffff',
    cardBorder: '#e2e8f0',
    muted: '#f1f5f9',
    mutedForeground: '#64748b',
    accent: '#3b82f6',
    accentForeground: '#ffffff'
  }
};

// Detect system theme preference
export const getSystemTheme = (): 'light' | 'dark' => {
  if (typeof window === 'undefined') return 'light';

  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  return mediaQuery.matches ? 'dark' : 'light';
};

// Listen to system theme changes
export const watchSystemTheme = (callback: (theme: 'light' | 'dark') => void) => {
  if (typeof window === 'undefined') return () => {};

  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

  const handler = (e: MediaQueryListEvent) => {
    callback(e.matches ? 'dark' : 'light');
  };

  mediaQuery.addEventListener('change', handler);

  return () => mediaQuery.removeEventListener('change', handler);
};

// Apply theme to document
export const applyTheme = (theme: Theme) => {
  const root = document.documentElement;

  // Handle auto theme
  let effectiveTheme: Exclude<Theme, 'auto'> = theme as Exclude<Theme, 'auto'>;
  if (theme === 'auto') {
    effectiveTheme = getSystemTheme();
  }

  // Remove all theme classes
  root.classList.remove('dark', 'light', 'blue', 'purple', 'green', 'high-contrast-light', 'high-contrast-dark');

  // Add base dark class for dark-based themes
  if (effectiveTheme === 'dark' || effectiveTheme === 'high-contrast-dark') {
    root.classList.add('dark');
  }

  // Add specific theme class
  root.classList.add(effectiveTheme);

  // Apply CSS variables
  const colors = themeConfigs[effectiveTheme];
  root.style.setProperty('--color-primary', colors.primary);
  root.style.setProperty('--color-primary-hover', colors.primaryHover);
  root.style.setProperty('--color-background', colors.background);
  root.style.setProperty('--color-foreground', colors.foreground);
  root.style.setProperty('--color-card', colors.card);
  root.style.setProperty('--color-card-border', colors.cardBorder);
  root.style.setProperty('--color-muted', colors.muted);
  root.style.setProperty('--color-muted-foreground', colors.mutedForeground);
  root.style.setProperty('--color-accent', colors.accent);
  root.style.setProperty('--color-accent-foreground', colors.accentForeground);
};

// Get theme display name
export const getThemeDisplayName = (theme: Theme, lang: 'es' | 'en' | 'de'): string => {
  const names = {
    es: {
      light: 'Claro',
      dark: 'Oscuro',
      auto: 'Automático',
      blue: 'Azul',
      purple: 'Púrpura',
      green: 'Verde',
      'high-contrast-light': 'Alto Contraste (Claro)',
      'high-contrast-dark': 'Alto Contraste (Oscuro)'
    },
    en: {
      light: 'Light',
      dark: 'Dark',
      auto: 'Auto',
      blue: 'Blue',
      purple: 'Purple',
      green: 'Green',
      'high-contrast-light': 'High Contrast (Light)',
      'high-contrast-dark': 'High Contrast (Dark)'
    },
    de: {
      light: 'Hell',
      dark: 'Dunkel',
      auto: 'Automatisch',
      blue: 'Blau',
      purple: 'Lila',
      green: 'Grün',
      'high-contrast-light': 'Hoher Kontrast (Hell)',
      'high-contrast-dark': 'Hoher Kontrast (Dunkel)'
    }
  };

  return names[lang][theme];
};

// Get theme icon
export const getThemeIcon = (theme: Theme): string => {
  const icons: Record<Theme, string> = {
    light: '☀️',
    dark: '🌙',
    auto: '🔄',
    blue: '💙',
    purple: '💜',
    green: '💚',
    'high-contrast-light': '◐',
    'high-contrast-dark': '◑'
  };

  return icons[theme];
};
