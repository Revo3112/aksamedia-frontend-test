// API Response types
export interface ApiResponse<T = any> {
  status: 'success' | 'error';
  message: string;
  data?: T;
}

export interface PaginatedResponse<T> extends ApiResponse<T> {
  pagination: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
    has_more_pages: boolean;
  };
}

// API Admin/User types (from Laravel)
export interface ApiUser {
  id: string;
  name: string;
  username: string;
  phone: string;
  email: string;
}

// API Employee types (from Laravel)
export interface ApiEmployee {
  id: string;
  image: string;
  name: string;
  phone: string;
  division: {
    id: string;
    name: string;
  };
  position: string;
}

// API Division types (from Laravel)
export interface ApiDivision {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

// Frontend types
export interface User {
  id: string;
  username: string;
  fullName: string;
  email?: string;
  phone?: string;
}

export interface EmployeeFormData {
  name: string;
  phone: string;
  division: string; // Division ID
  position: string;
  image?: File;
}

export interface CrudItem {
  id: string;
  name: string;
  email?: string;
  phone: string;
  position: string;
  department: string;
  division_id: string;
  image?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Division {
  id: string;
  name: string;
  created_at?: string;
  updated_at?: string;
}

export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  startIndex: number;
  endIndex: number;
  hasMorePages: boolean;
}

// Auth State (missing from original)
export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
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
