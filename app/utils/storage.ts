import type { User, CrudItem, Theme } from '../types';

export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  USER_DATA: 'user_data',
  CRUD_DATA: 'crud_data',
  THEME: 'theme_preference',
} as const;

// Authentication storage
export const authStorage = {
  setAuthData: (user: User) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, 'authenticated');
    localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user));
  },

  getAuthData: (): { isAuthenticated: boolean; user: User | null } => {
    if (typeof window === 'undefined') {
      return { isAuthenticated: false, user: null };
    }

    const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    const userData = localStorage.getItem(STORAGE_KEYS.USER_DATA);

    if (token === 'authenticated' && userData) {
      try {
        const user = JSON.parse(userData);
        return { isAuthenticated: true, user };
      } catch {
        return { isAuthenticated: false, user: null };
      }
    }

    return { isAuthenticated: false, user: null };
  },

  updateUserData: (user: User) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user));
  },

  clearAuthData: () => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER_DATA);
  },
};

// CRUD data storage
export const crudStorage = {
  getCrudData: (): CrudItem[] => {
    if (typeof window === 'undefined') {
      return getDefaultCrudData();
    }

    const data = localStorage.getItem(STORAGE_KEYS.CRUD_DATA);

    if (data) {
      try {
        return JSON.parse(data);
      } catch {
        return getDefaultCrudData();
      }
    }

    // Initialize with default data if not exists
    const defaultData = getDefaultCrudData();
    crudStorage.setCrudData(defaultData);
    return defaultData;
  },

  setCrudData: (items: CrudItem[]) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEYS.CRUD_DATA, JSON.stringify(items));
  },

  addItem: (item: Omit<CrudItem, 'id' | 'createdAt' | 'updatedAt'>) => {
    const items = crudStorage.getCrudData();
    const newItem: CrudItem = {
      ...item,
      id: generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    items.push(newItem);
    crudStorage.setCrudData(items);
    return newItem;
  },

  updateItem: (id: string, updates: Partial<Omit<CrudItem, 'id' | 'createdAt'>>) => {
    const items = crudStorage.getCrudData();
    const index = items.findIndex(item => item.id === id);

    if (index !== -1) {
      items[index] = {
        ...items[index],
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      crudStorage.setCrudData(items);
      return items[index];
    }

    return null;
  },

  deleteItem: (id: string) => {
    const items = crudStorage.getCrudData();
    const filteredItems = items.filter(item => item.id !== id);
    crudStorage.setCrudData(filteredItems);
    return filteredItems;
  },
};

// Enhanced theme storage with better error handling and synchronization
export const themeStorage = {
  getTheme: (): Theme => {
    if (typeof window === 'undefined') return 'system';

    try {
      const theme = localStorage.getItem(STORAGE_KEYS.THEME);

      // Validate the theme value
      if (theme === 'light' || theme === 'dark' || theme === 'system') {
        return theme;
      }

      // Return default if invalid
      return 'system';
    } catch (error) {
      console.warn('Failed to get theme from localStorage:', error);
      return 'system';
    }
  },

  setTheme: (theme: Theme) => {
    if (typeof window === 'undefined') return;

    try {
      localStorage.setItem(STORAGE_KEYS.THEME, theme);

      // Dispatch storage event for cross-tab synchronization
      window.dispatchEvent(new StorageEvent('storage', {
        key: STORAGE_KEYS.THEME,
        newValue: theme,
        oldValue: localStorage.getItem(STORAGE_KEYS.THEME),
        storageArea: localStorage
      }));
    } catch (error) {
      console.warn('Failed to save theme to localStorage:', error);
    }
  },

  getEffectiveTheme: (theme: Theme): 'light' | 'dark' => {
    if (typeof window === 'undefined') return 'light';

    if (theme === 'system') {
      try {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        return mediaQuery.matches ? 'dark' : 'light';
      } catch (error) {
        console.warn('Failed to detect system theme:', error);
        return 'light';
      }
    }
    return theme;
  },

  applyTheme: (effectiveTheme: 'light' | 'dark', immediate = false) => {
    if (typeof window === 'undefined') return;

    const root = document.documentElement;

    const applyChanges = () => {
      try {
        if (effectiveTheme === 'dark') {
          root.classList.add('dark');
          root.setAttribute('data-theme', 'dark');
        } else {
          root.classList.remove('dark');
          root.setAttribute('data-theme', 'light');
        }

        // Update color-scheme for better browser integration
        root.style.colorScheme = effectiveTheme;

        // Mark as applied for synchronization
        root.setAttribute('data-theme-applied', effectiveTheme);
      } catch (error) {
        console.warn('Failed to apply theme to DOM:', error);
      }
    };

    if (immediate) {
      applyChanges();
    } else {
      // Use requestAnimationFrame for smooth transitions
      requestAnimationFrame(applyChanges);
    }
  },

  // Listen for system theme changes
  watchSystemTheme: (callback: (isDark: boolean) => void) => {
    if (typeof window === 'undefined') return () => {};

    try {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

      const handler = (e: MediaQueryListEvent) => {
        callback(e.matches);
      };

      // Modern browsers
      if (mediaQuery.addEventListener) {
        mediaQuery.addEventListener('change', handler);
        return () => mediaQuery.removeEventListener('change', handler);
      }

      // Legacy browsers
      if (mediaQuery.addListener) {
        mediaQuery.addListener(handler);
        return () => mediaQuery.removeListener(handler);
      }
    } catch (error) {
      console.warn('Failed to watch system theme changes:', error);
    }

    return () => {};
  },

  // Cross-tab synchronization
  watchStorageChanges: (callback: (theme: Theme) => void) => {
    if (typeof window === 'undefined') return () => {};

    const handler = (e: StorageEvent) => {
      if (e.key === STORAGE_KEYS.THEME && e.newValue) {
        const newTheme = e.newValue as Theme;
        if (newTheme === 'light' || newTheme === 'dark' || newTheme === 'system') {
          callback(newTheme);
        }
      }
    };

    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  },
};

// Helper functions
function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function getDefaultCrudData(): CrudItem[] {
  const now = new Date().toISOString();

  return [
    {
      id: '1',
      name: 'Agus Setiawan',
      email: 'agus.setiawan@company.com',
      position: 'Frontend Developer',
      department: 'Engineering',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: '2',
      name: 'Siti Nurhaliza',
      email: 'siti.nurhaliza@company.com',
      position: 'UI/UX Designer',
      department: 'Design',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: '3',
      name: 'Budi Santoso',
      email: 'budi.santoso@company.com',
      position: 'Backend Developer',
      department: 'Engineering',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: '4',
      name: 'Maya Sari',
      email: 'maya.sari@company.com',
      position: 'Product Manager',
      department: 'Product',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: '5',
      name: 'Rizki Pratama',
      email: 'rizki.pratama@company.com',
      position: 'DevOps Engineer',
      department: 'Engineering',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: '6',
      name: 'Dewi Lestari',
      email: 'dewi.lestari@company.com',
      position: 'QA Engineer',
      department: 'Engineering',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: '7',
      name: 'Ahmad Fauzi',
      email: 'ahmad.fauzi@company.com',
      position: 'Marketing Specialist',
      department: 'Marketing',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: '8',
      name: 'Rina Wati',
      email: 'rina.wati@company.com',
      position: 'HR Manager',
      department: 'Human Resources',
      createdAt: now,
      updatedAt: now,
    },
  ];
}
