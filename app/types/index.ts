import React from 'react';

export interface User {
  id: string;
  username: string;
  fullName: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
}

export interface CrudItem {
  id: string;
  name: string;
  email: string;
  position: string;
  department: string;
  createdAt: string;
  updatedAt: string;
}

export interface CrudState {
  items: CrudItem[];
  searchQuery: string;
  currentPage: number;
  itemsPerPage: number;
  isLoading: boolean;
}

export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  startIndex: number;
  endIndex: number;
}

export type Theme = 'light' | 'dark' | 'system';

export interface ThemeState {
  theme: Theme;
  effectiveTheme: 'light' | 'dark';
}

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export interface DropdownItem {
  label: string;
  onClick: () => void;
  icon?: React.ReactNode;
  danger?: boolean;
}
