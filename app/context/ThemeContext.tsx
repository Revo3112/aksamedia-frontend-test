import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode
} from 'react';
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

  // Calculate effective theme - FIXED untuk override system
  const calculateEffectiveTheme = useCallback((currentTheme: Theme): 'light' | 'dark' => {
    if (typeof window === 'undefined') return 'light';

    if (currentTheme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      return mediaQuery.matches ? 'dark' : 'light';
    }
    return currentTheme;
  }, []);

  // Apply theme to DOM dengan force override
  const applyThemeToDOM = useCallback((effective: 'light' | 'dark') => {
    if (typeof window === 'undefined') return;

    const root = document.documentElement;

    // Hapus semua class terlebih dahulu
    root.classList.remove('light', 'dark');

    requestAnimationFrame(() => {
      if (effective === 'dark') {
        root.classList.add('dark');
        root.setAttribute('data-theme', 'dark');
        root.style.colorScheme = 'dark';
      } else {
        root.classList.remove('dark');
        root.setAttribute('data-theme', 'light');
        root.style.colorScheme = 'light';
      }
      root.setAttribute('data-theme-applied', 'true');
    });
  }, []);

  // Initialize theme
  useEffect(() => {
    if (typeof window === 'undefined') return;

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
        applyThemeToDOM(calculatedEffective);
      } else {
        setTimeout(checkInitialization, 10);
      }
    };

    checkInitialization();
  }, [calculateEffectiveTheme, applyThemeToDOM]);

  // Listen for system theme changes
  useEffect(() => {
    if (!isHydrated || theme !== 'system') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemThemeChange = (e: MediaQueryListEvent) => {
      const newEffective = e.matches ? 'dark' : 'light';
      setEffectiveTheme(newEffective);
      applyThemeToDOM(newEffective);
    };

    mediaQuery.addEventListener('change', handleSystemThemeChange);
    return () => mediaQuery.removeEventListener('change', handleSystemThemeChange);
  }, [theme, isHydrated, effectiveTheme, applyThemeToDOM]);

  // Update effective theme
  useEffect(() => {
    if (!isInitialized) return;

    const newEffective = calculateEffectiveTheme(theme);
    if (newEffective !== effectiveTheme) {
      setEffectiveTheme(newEffective);
      applyThemeToDOM(newEffective);
    }
  }, [theme, isInitialized, effectiveTheme, calculateEffectiveTheme, applyThemeToDOM]);

  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
    const newEffective = calculateEffectiveTheme(newTheme);
    setEffectiveTheme(newEffective);
    applyThemeToDOM(newEffective);
    themeStorage.setTheme(newTheme);
  }, [calculateEffectiveTheme, applyThemeToDOM]);

  // FIXED: Enhanced toggle yang benar-benar override system
  const toggleTheme = useCallback(() => {
    if (theme === 'system') {
      // Saat system mode, force manual toggle
      const systemIsDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setTheme(systemIsDark ? 'light' : 'dark');
    } else if (theme === 'light') {
      setTheme('dark');
    } else {
      setTheme('light');
    }
  }, [theme, setTheme]);

  const value: ThemeContextValue = {
    theme,
    effectiveTheme,
    setTheme,
    toggleTheme,
  };

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
