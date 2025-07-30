// context/AuthContext.tsx - Complete Laravel API integration
import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User, AuthState } from '../types';
import { apiClient, transformApiUserToUser, handleApiError, tokenStorage } from '../utils/api';

interface AuthContextValue extends AuthState {
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateUser: (updates: Partial<User>) => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextValue>({
  isAuthenticated: false,
  user: null,
  login: async () => ({ success: false }),
  logout: async () => {},
  updateUser: () => {},
  isLoading: true,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = () => {
      const token = tokenStorage.getToken();
      const userData = localStorage.getItem('user_data');

      if (token && userData) {
        try {
          const user = JSON.parse(userData);
          setAuthState({ isAuthenticated: true, user });
        } catch {
          tokenStorage.removeToken();
          localStorage.removeItem('user_data');
        }
      }
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (username: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      setIsLoading(true);

      const response = await apiClient.login(username, password);

      if (response.status === 'success' && response.data) {
        const { token, admin } = response.data;
        const user = transformApiUserToUser(admin);

        tokenStorage.setToken(token);
        localStorage.setItem('user_data', JSON.stringify(user));

        setAuthState({ isAuthenticated: true, user });

        return { success: true };
      } else {
        return { success: false, error: response.message || 'Login failed' };
      }
    } catch (error) {
      const errorMessage = handleApiError(error);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await apiClient.logout().catch(console.error);
    } catch (error) {
      console.error('Logout API error:', error);
    } finally {
      tokenStorage.removeToken();
      localStorage.removeItem('user_data');
      setAuthState({ isAuthenticated: false, user: null });
    }
  };

  const updateUser = (updates: Partial<User>) => {
    if (!authState.user) return;
    const updatedUser = { ...authState.user, ...updates };
    localStorage.setItem('user_data', JSON.stringify(updatedUser));
    setAuthState({ isAuthenticated: true, user: updatedUser });
  };

  const value: AuthContextValue = {
    ...authState,
    login,
    logout,
    updateUser,
    isLoading,
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
