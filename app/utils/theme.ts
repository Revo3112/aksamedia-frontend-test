// app/utils/theme.ts
import type { Theme } from '../types';
import { useState, useEffect, useCallback } from 'react';

export class ThemeManager {
  private static instance: ThemeManager;
  private observers: Set<(theme: Theme, effectiveTheme: 'light' | 'dark') => void> = new Set();
  private currentTheme: Theme = 'system';
  private currentEffectiveTheme: 'light' | 'dark' = 'light';

  static getInstance(): ThemeManager {
    if (!ThemeManager.instance) {
      ThemeManager.instance = new ThemeManager();
    }
    return ThemeManager.instance;
  }

  private constructor() {
    if (typeof window !== 'undefined') {
      this.initialize();
    }
  }

  private initialize() {
    window.addEventListener('storage', (e) => {
      if (e.key === 'theme_preference' && e.newValue) {
        const newTheme = e.newValue as Theme;
        if (this.isValidTheme(newTheme)) {
          this.setTheme(newTheme, false);
        }
      }
    });

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemChange = (e: MediaQueryListEvent) => {
      if (this.currentTheme === 'system') {
        this.updateEffectiveTheme(e.matches ? 'dark' : 'light');
      }
    };

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleSystemChange);
    } else {
      mediaQuery.addListener(handleSystemChange);
    }
  }

  private isValidTheme(theme: string): theme is Theme {
    return theme === 'light' || theme === 'dark' || theme === 'system';
  }

  public setTheme(theme: Theme, saveToStorage = true) {
    this.currentTheme = theme;
    const effectiveTheme = this.calculateEffectiveTheme(theme);
    this.updateEffectiveTheme(effectiveTheme);

    if (saveToStorage) {
      try {
        localStorage.setItem('theme_preference', theme);
      } catch (error) {
        console.warn('Failed to save theme preference:', error);
      }
    }
    this.notifyObservers();
  }

  public getTheme(): Theme {
    return this.currentTheme;
  }

  public getEffectiveTheme(): 'light' | 'dark' {
    return this.currentEffectiveTheme;
  }

  private calculateEffectiveTheme(theme: Theme): 'light' | 'dark' {
    if (theme === 'system') {
      if (typeof window !== 'undefined') {
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      }
      return 'light';
    }
    return theme;
  }

  private updateEffectiveTheme(effectiveTheme: 'light' | 'dark') {
    if (this.currentEffectiveTheme === effectiveTheme) return;
    this.currentEffectiveTheme = effectiveTheme;
    this.applyThemeToDOM(effectiveTheme);
  }

  private applyThemeToDOM(effectiveTheme: 'light' | 'dark') {
    if (typeof window === 'undefined') return;
    const root = document.documentElement;

    root.classList.add('theme-transitioning');
    requestAnimationFrame(() => {
      if (effectiveTheme === 'dark') {
        root.classList.add('dark');
        root.setAttribute('data-theme', 'dark');
      } else {
        root.classList.remove('dark');
        root.setAttribute('data-theme', 'light');
      }
      root.style.colorScheme = effectiveTheme;
      setTimeout(() => root.classList.remove('theme-transitioning'), 300);
    });

    window.dispatchEvent(
      new CustomEvent('theme-applied', { detail: { effectiveTheme } })
    );
  }

  public toggleTheme() {
    switch (this.currentTheme) {
      case 'light':
        this.setTheme('dark');
        break;
      case 'dark':
        this.setTheme('system');
        break;
      case 'system':
        this.setTheme('light');
        break;
    }
  }

  public quickToggle() {
    this.setTheme(this.currentEffectiveTheme === 'light' ? 'dark' : 'light');
  }

  public subscribe(
    observer: (theme: Theme, effectiveTheme: 'light' | 'dark') => void
  ): () => void {
    this.observers.add(observer);
    observer(this.currentTheme, this.currentEffectiveTheme);
    return () => {
      this.observers.delete(observer);
    };
  }

  private notifyObservers() {
    this.observers.forEach((observer) => {
      try {
        observer(this.currentTheme, this.currentEffectiveTheme);
      } catch (error) {
        console.error('Error in theme observer:', error);
      }
    });
  }

  public loadFromStorage() {
    if (typeof window === 'undefined') return;
    try {
      const stored = localStorage.getItem('theme_preference');
      if (stored && this.isValidTheme(stored)) {
        this.setTheme(stored, false);
      }
    } catch (error) {
      console.warn('Failed to load theme from storage:', error);
    }
  }

  public preloadTheme(): string {
    return `
      (function() {
        try {
          const theme = localStorage.getItem('theme_preference') || 'system';
          const root = document.documentElement;
          function applyTheme(t) {
            if (t === 'dark') {
              root.classList.add('dark');
              root.setAttribute('data-theme', 'dark');
              root.style.colorScheme = 'dark';
            } else {
              root.classList.remove('dark');
              root.setAttribute('data-theme', 'light');
              root.style.colorScheme = 'light';
            }
          }
          if (theme === 'system') {
            const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
            applyTheme(prefersDark ? 'dark' : 'light');
          } else {
            applyTheme(theme);
          }
          root.setAttribute('data-theme-initialized', 'true');
        } catch (e) {
          root.setAttribute('data-theme', 'light');
          root.setAttribute('data-theme-initialized', 'true');
        }
      })();
    `;
  }
}

// React 19 hook (bebas TS2345)
export function useThemeManager() {
  const [theme, setThemeState] = useState<Theme>('system');
  const [effectiveTheme, setEffectiveThemeState] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const manager = ThemeManager.getInstance();
    const unsubscribe = manager.subscribe((newTheme, newEffectiveTheme) => {
      setThemeState(newTheme);
      setEffectiveThemeState(newEffectiveTheme);
    });
    manager.loadFromStorage();
    return () => {
      unsubscribe(); // cleanup void
    };
  }, []);

  const setTheme = useCallback((newTheme: Theme) => {
    ThemeManager.getInstance().setTheme(newTheme);
  }, []);

  const toggleTheme = useCallback(() => {
    ThemeManager.getInstance().toggleTheme();
  }, []);

  const quickToggle = useCallback(() => {
    ThemeManager.getInstance().quickToggle();
  }, []);

  return { theme, effectiveTheme, setTheme, toggleTheme, quickToggle };
}

// Utility helpers
export const themeUtils = {
  getSystemTheme(): 'light' | 'dark' {
    if (typeof window === 'undefined') return 'light';
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  },
  isSystemDark(): boolean {
    return this.getSystemTheme() === 'dark';
  },
  getContrastRatio(color1: string, color2: string): number {
    const getLuminance = (color: string) => {
      const rgb = parseInt(color.replace('#', ''), 16);
      const r = (rgb >> 16) & 0xff;
      const g = (rgb >> 8) & 0xff;
      const b = (rgb >> 0) & 0xff;
      const rsRGB = r / 255;
      const gsRGB = g / 255;
      const bsRGB = b / 255;
      const rLinear = rsRGB <= 0.03928 ? rsRGB / 12.92 : Math.pow((rsRGB + 0.055) / 1.055, 2.4);
      const gLinear = gsRGB <= 0.03928 ? gsRGB / 12.92 : Math.pow((gsRGB + 0.055) / 1.055, 2.4);
      const bLinear = bsRGB <= 0.03928 ? bsRGB / 12.92 : Math.pow((bsRGB + 0.055) / 1.055, 2.4);
      return 0.2126 * rLinear + 0.7152 * gLinear + 0.0722 * bLinear;
    };
    const lum1 = getLuminance(color1);
    const lum2 = getLuminance(color2);
    const brightest = Math.max(lum1, lum2);
    const darkest = Math.min(lum1, lum2);
    return (brightest + 0.05) / (darkest + 0.05);
  },
  meetsAccessibilityStandards(color1: string, color2: string, level: 'AA' | 'AAA' = 'AA'): boolean {
    const ratio = this.getContrastRatio(color1, color2);
    return level === 'AA' ? ratio >= 4.5 : ratio >= 7;
  },
};

export default ThemeManager;
