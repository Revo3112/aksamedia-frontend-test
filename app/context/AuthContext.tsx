import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User, AuthState } from '../types';
import { authStorage } from '../utils/storage';

const VALID_CREDENTIALS = {
  username: 'admin',
  password: 'password123',
  fullName: 'Administrator'
};

interface AuthContextValue extends AuthState {
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextValue>({
  isAuthenticated: false,
  user: null,
  login: async () => false,
  logout: () => {},
  updateUser: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>(() => {
    // Initialize from storage if available
    if (typeof window !== 'undefined') {
      const { isAuthenticated, user } = authStorage.getAuthData();
      return { isAuthenticated, user };
    }
    return { isAuthenticated: false, user: null };
  });

  // Sync with storage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const { isAuthenticated, user } = authStorage.getAuthData();
      setAuthState({ isAuthenticated, user });
    }
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));

    if (username === VALID_CREDENTIALS.username && password === VALID_CREDENTIALS.password) {
      const user: User = {
        id: '1',
        username,
        fullName: VALID_CREDENTIALS.fullName
      };

      authStorage.setAuthData(user);
      setAuthState({ isAuthenticated: true, user });
      return true;
    }
    return false;
  };

  const logout = () => {
    authStorage.clearAuthData();
    setAuthState({ isAuthenticated: false, user: null });
  };

  const updateUser = (updates: Partial<User>) => {
    if (!authState.user) return;

    const updatedUser = { ...authState.user, ...updates };
    authStorage.updateUserData(updatedUser);
    setAuthState({ isAuthenticated: true, user: updatedUser });
  };

  const value: AuthContextValue = {
    ...authState,
    login,
    logout,
    updateUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
