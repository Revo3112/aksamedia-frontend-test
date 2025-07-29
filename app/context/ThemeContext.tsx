import React, { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { Theme, ThemeState } from '../types';
import { themeStorage } from '../utils/storage';

interface ThemeContextValue extends ThemeState {
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

interface ThemeProviderProps {
  children: ReactNode;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: 'system',
  effectiveTheme: 'light',
  setTheme: () => {},
  toggleTheme: () => {},
});

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>('system');
  const [effectiveTheme, setEffectiveTheme] = useState<'light' | 'dark'>('light');
  const [isInitialized, setIsInitialized] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  // Calculate effective theme based on current theme and system preference
  const calculateEffectiveTheme = useCallback((currentTheme: Theme): 'light' | 'dark' => {
    if (typeof window === 'undefined') return 'light';

    if (currentTheme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      return mediaQuery.matches ? 'dark' : 'light';
    }
    return currentTheme;
  }, []);

  // Apply theme to DOM immediately
  const applyThemeToDOM = useCallback((effective: 'light' | 'dark') => {
    if (typeof window === 'undefined') return;

    const root = document.documentElement;

    // Use requestAnimationFrame to ensure smooth transition
    requestAnimationFrame(() => {
      if (effective === 'dark') {
        root.classList.add('dark');
        root.setAttribute('data-theme', 'dark');
      } else {
        root.classList.remove('dark');
        root.setAttribute('data-theme', 'light');
      }

      // Mark theme as applied
      root.setAttribute('data-theme-applied', 'true');
    });
  }, []);

  // Initialize theme from storage on client-side hydration
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Wait for theme initialization script to complete
    const checkInitialization = () => {
      const root = document.documentElement;
      const isThemeInitialized = root.getAttribute('data-theme-initialized') === 'true';

      if (isThemeInitialized) {
        const storedTheme = themeStorage.getTheme();
        const calculatedEffective = calculateEffectiveTheme(storedTheme);

        setThemeState(storedTheme);
        setEffectiveTheme(calculatedEffective);
        setIsInitialized(true);
        setIsHydrated(true);

        // Ensure DOM is in sync
        applyThemeToDOM(calculatedEffective);
      } else {
        // Retry if not initialized yet
        setTimeout(checkInitialization, 10);
      }
    };

    checkInitialization();
  }, [calculateEffectiveTheme, applyThemeToDOM]);

  // Listen for system theme changes when theme is set to 'system'
  useEffect(() => {
    if (!isHydrated || theme !== 'system') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleSystemThemeChange = (e: MediaQueryListEvent) => {
      const newEffective = e.matches ? 'dark' : 'light';
      setEffectiveTheme(newEffective);
      applyThemeToDOM(newEffective);
    };

    // Add listener
    mediaQuery.addEventListener('change', handleSystemThemeChange);

    // Initial check
    const initialEffective = mediaQuery.matches ? 'dark' : 'light';
    if (initialEffective !== effectiveTheme) {
      setEffectiveTheme(initialEffective);
      applyThemeToDOM(initialEffective);
    }

    return () => mediaQuery.removeEventListener('change', handleSystemThemeChange);
  }, [theme, isHydrated, effectiveTheme, applyThemeToDOM]);

  // Update effective theme when theme changes
  useEffect(() => {
    if (!isInitialized) return;

    const newEffective = calculateEffectiveTheme(theme);
    if (newEffective !== effectiveTheme) {
      setEffectiveTheme(newEffective);
      applyThemeToDOM(newEffective);
    }
  }, [theme, isInitialized, effectiveTheme, calculateEffectiveTheme, applyThemeToDOM]);

  const setTheme = useCallback((newTheme: Theme) => {
    // Update state immediately
    setThemeState(newTheme);

    // Calculate and apply new effective theme
    const newEffective = calculateEffectiveTheme(newTheme);
    setEffectiveTheme(newEffective);
    applyThemeToDOM(newEffective);

    // Persist to storage
    themeStorage.setTheme(newTheme);

    // Dispatch custom event for other components to listen
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('themeChange', {
        detail: { theme: newTheme, effectiveTheme: newEffective }
      }));
    }
  }, [calculateEffectiveTheme, applyThemeToDOM]);

  const toggleTheme = useCallback(() => {
    // If system, toggle to opposite of current effective theme
    // If light, go to dark
    // If dark, go to light
    if (theme === 'system') {
      setTheme(effectiveTheme === 'light' ? 'dark' : 'light');
    } else if (theme === 'light') {
      setTheme('dark');
    } else {
      setTheme('light');
    }
  }, [theme, effectiveTheme, setTheme]);

  const value: ThemeContextValue = {
    theme,
    effectiveTheme,
    setTheme,
    toggleTheme,
  };

  // Don't render children until hydrated to prevent hydration mismatch
  if (!isHydrated) {
    return null;
  }

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
