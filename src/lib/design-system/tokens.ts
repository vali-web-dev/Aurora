// Aurora Design System - Color Tokens
export const colorTokens = {
  // Base colors
  primary: {
    50: '#f0f7ff',
    100: '#e0efff',
    200: '#bae3ff',
    300: '#7cc3ff',
    400: '#36a3ff',
    500: '#0084ff',
    600: '#0070e6',
    700: '#0053b3',
    800: '#003d80',
    900: '#002650',
  },
  secondary: {
    50: '#faf5ff',
    100: '#f5ebff',
    200: '#ead7ff',
    300: '#ddb3ff',
    400: '#cb82ff',
    500: '#a855f7',
    600: '#9333ea',
    700: '#7e22ce',
    800: '#6b21a8',
    900: '#581c87',
  },
  accent: {
    50: '#fef3f2',
    100: '#fee4e2',
    200: '#fecdca',
    300: '#fda29b',
    400: '#f97066',
    500: '#f04438',
    600: '#d92d20',
    700: '#b42318',
    800: '#912018',
    900: '#7a271a',
  },
  
  // Semantic colors
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6',
  
  // Neutral/Background
  background: '#ffffff',
  surface: '#f8fafc',
  border: '#e2e8f0',
  text: {
    primary: '#0f172a',
    secondary: '#475569',
    tertiary: '#64748b',
  },
  
  // Glow (for illuminated mode)
  glow: '#60a5fa',
  shadow: 'rgba(0, 0, 0, 0.1)',
};

// Theme Family Palettes
export const themeFamilies = {
  home: {
    primary: '#0084ff',
    accent: '#f04438',
    secondary: '#a855f7',
    warm: '#f59e0b',
    cool: '#06b6d4',
  },
  office: {
    primary: '#0070e6',
    accent: '#6366f1',
    secondary: '#0891b2',
    warm: '#dc2626',
    cool: '#0369a1',
  },
  outdoor: {
    primary: '#059669',
    accent: '#f59e0b',
    secondary: '#14b8a6',
    warm: '#ea580c',
    cool: '#0284c7',
  },
  lifestyle: {
    primary: '#ec4899',
    accent: '#f97316',
    secondary: '#a855f7',
    warm: '#f43f5e',
    cool: '#6366f1',
  },
  creative: {
    primary: '#a855f7',
    accent: '#06b6d4',
    secondary: '#f97316',
    warm: '#ef4444',
    cool: '#10b981',
  },
};

// Illuminated Mode Variants
export const illuminatedTokens = {
  glow: {
    soft: '0 0 20px rgba(96, 165, 250, 0.4)',
    medium: '0 0 40px rgba(96, 165, 250, 0.6)',
    strong: '0 0 60px rgba(96, 165, 250, 0.8)',
  },
  background: '#0f172a',
  surface: '#1e293b',
  border: '#334155',
  text: {
    primary: '#f1f5f9',
    secondary: '#cbd5e1',
    tertiary: '#94a3b8',
  },
};

// Aurora Design System - Typography Tokens
export const typographyTokens = {
  fontFamily: {
    display: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    body: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    mono: '"Fira Code", "Courier New", monospace',
  },
  
  sizes: {
    display: { fontSize: '4rem', lineHeight: '1.1', fontWeight: 700 },
    h1: { fontSize: '3rem', lineHeight: '1.2', fontWeight: 700 },
    h2: { fontSize: '2.25rem', lineHeight: '1.25', fontWeight: 700 },
    h3: { fontSize: '1.875rem', lineHeight: '1.3', fontWeight: 600 },
    h4: { fontSize: '1.5rem', lineHeight: '1.4', fontWeight: 600 },
    body: { fontSize: '1rem', lineHeight: '1.5', fontWeight: 400 },
    bodySmall: { fontSize: '0.875rem', lineHeight: '1.5', fontWeight: 400 },
    caption: { fontSize: '0.75rem', lineHeight: '1.4', fontWeight: 500 },
  },
};

// Aurora Design System - Motion Tokens
export const motionTokens = {
  duration: {
    fast: 120,
    medium: 200,
    slow: 320,
    slower: 500,
    ambient: {
      min: 600,
      max: 2000,
    },
  },
  
  easing: {
    easeOut: 'cubic-bezier(0.0, 0.0, 0.2, 1)',
    easeInOut: 'cubic-bezier(0.4, 0.0, 0.2, 1)',
    easeIn: 'cubic-bezier(0.4, 0.0, 1, 1)',
    linear: 'linear',
    smooth: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
    spring: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  },
  
  transitions: {
    fade: 'opacity 200ms cubic-bezier(0.4, 0, 0.2, 1)',
    slideIn: 'transform 300ms cubic-bezier(0.4, 0, 0.2, 1)',
    scale: 'transform 200ms cubic-bezier(0.4, 0, 0.2, 1)',
    glow: 'box-shadow 500ms cubic-bezier(0.25, 0.46, 0.45, 0.94)',
  },
};

// Aurora Button Tokens
export const buttonTokens = {
  // Aurora Primary Button (Cover Page Style)
  aurora: {
    gradient: {
      from: '#a855f7', // purple-500
      via: '#ec4899', // pink-500
      to: '#3b82f6', // blue-500
    },
    gradientHover: {
      from: '#9333ea', // purple-600
      via: '#db2777', // pink-600
      to: '#2563eb', // blue-600
    },
    shadow: {
      base: '0 25px 50px -12px rgba(168, 85, 247, 0.5)',
      hover: '0 25px 50px -12px rgba(168, 85, 247, 0.7)',
    },
    scale: {
      base: '1',
      hover: '1.05',
    },
    transition: 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)',
    borderRadius: '1rem', // rounded-2xl
  },
  // Aurora Secondary Button (Glassmorphic)
  auroraSecondary: {
    background: 'rgba(255, 255, 255, 0.1)',
    backgroundHover: 'rgba(255, 255, 255, 0.2)',
    border: 'rgba(255, 255, 255, 0.2)',
    backdropBlur: '12px',
    scale: {
      base: '1',
      hover: '1.05',
    },
    transition: 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)',
    borderRadius: '1rem',
  },
  // Aurora Ghost Button
  auroraGhost: {
    background: 'transparent',
    backgroundHover: 'rgba(255, 255, 255, 0.1)',
    transition: 'all 200ms cubic-bezier(0.4, 0, 0.2, 1)',
    borderRadius: '0.5rem',
  },
};

// Theme modes
export type ThemeMode = 'light' | 'dark' | 'illuminated' | 'system';
export type ThemeFamily = 'home' | 'office' | 'outdoor' | 'lifestyle' | 'creative';

export interface ThemeConfig {
  mode: ThemeMode;
  family: ThemeFamily;
  customizations?: Record<string, unknown>;
}
