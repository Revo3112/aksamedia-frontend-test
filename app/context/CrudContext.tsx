// context/CrudContext.tsx - Complete Laravel API integration
import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useSearchParams } from 'react-router';
import type { CrudItem, EmployeeFormData, Division } from '../types';
import { apiClient, transformApiEmployeeToCrudItem, handleApiError } from '../utils/api';

interface CrudContextValue {
  items: CrudItem[];
  divisions: Division[];
  searchQuery: string;
  currentPage: number;
  itemsPerPage: number;
  isLoading: boolean;
  error: string | null;
  selectedDivision: string;
  paginationInfo: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    startIndex: number;
    endIndex: number;
    hasMorePages: boolean;
  };
  setSearchQuery: (query: string) => void;
  setCurrentPage: (page: number) => void;
  setSelectedDivision: (divisionId: string) => void;
  addItem: (data: EmployeeFormData) => Promise<{ success: boolean; error?: string }>;
  updateItem: (id: string, data: EmployeeFormData) => Promise<{ success: boolean; error?: string }>;
  deleteItem: (id: string) => Promise<{ success: boolean; error?: string }>;
  refreshData: () => Promise<void>;
  loadDivisions: () => Promise<void>;
}

const CrudContext = createContext<CrudContextValue | undefined>(undefined);

export function CrudProvider({ children }: { children: React.ReactNode }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [items, setItems] = useState<CrudItem[]>([]);
  const [divisions, setDivisions] = useState<Division[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paginationData, setPaginationData] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    hasMorePages: false,
  });

  const searchQuery = searchParams.get('q') || '';
  const currentPage = Math.max(1, Number(searchParams.get('page') || 1));
  const selectedDivision = searchParams.get('division') || '';

  // Load divisions
  const loadDivisions = useCallback(async () => {
    try {
      const response = await apiClient.getDivisions();
      if (response.status === 'success' && response.data) {
        setDivisions(response.data.divisions);
      }
    } catch (error) {
      console.error('Failed to load divisions:', error);
    }
  }, []);

  // Load employees with filters
  const loadEmployees = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const params: { name?: string; division_id?: string; page?: number } = {};

      if (searchQuery.trim()) {
        params.name = searchQuery.trim();
      }

      if (selectedDivision) {
        params.division_id = selectedDivision;
      }

      if (currentPage > 1) {
        params.page = currentPage;
      }

      const response = await apiClient.getEmployees(params);

      if (response.status === 'success' && response.data) {
        const transformedItems = response.data.employees.map(transformApiEmployeeToCrudItem);
        setItems(transformedItems);

        setPaginationData({
          currentPage: response.pagination.current_page,
          totalPages: response.pagination.last_page,
          totalItems: response.pagination.total,
          hasMorePages: response.pagination.has_more_pages,
        });
      } else {
        setError(response.message || 'Failed to load employees');
        setItems([]);
      }
    } catch (error) {
      const errorMessage = handleApiError(error);
      setError(errorMessage);
      setItems([]);
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, selectedDivision, currentPage]);

  // Initial loads
  useEffect(() => {
    loadEmployees();
    loadDivisions();
  }, [loadEmployees, loadDivisions]);

  const setSearchQuery = (query: string) => {
    const params = new URLSearchParams(searchParams);
    if (query.trim()) {
      params.set('q', query.trim());
    } else {
      params.delete('q');
    }
    params.set('page', '1');
    setSearchParams(params, { replace: true });
  };

  const setCurrentPage = (page: number) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', String(page));
    setSearchParams(params, { replace: true });
  };

  const setSelectedDivision = (divisionId: string) => {
    const params = new URLSearchParams(searchParams);
    if (divisionId) {
      params.set('division', divisionId);
    } else {
      params.delete('division');
    }
    params.set('page', '1');
    setSearchParams(params, { replace: true });
  };

  const createFormData = (data: EmployeeFormData): FormData => {
    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('phone', data.phone);
    formData.append('division', data.division);
    formData.append('position', data.position);

    if (data.image) {
      formData.append('image', data.image);
    }

    return formData;
  };

  const addItem = async (data: EmployeeFormData): Promise<{ success: boolean; error?: string }> => {
    try {
      setError(null);
      const formData = createFormData(data);

      const response = await apiClient.createEmployee(formData);

      if (response.status === 'success') {
        await refreshData();
        return { success: true };
      } else {
        return { success: false, error: response.message || 'Failed to add employee' };
      }
    } catch (error) {
      return { success: false, error: handleApiError(error) };
    }
  };

  const updateItem = async (id: string, data: EmployeeFormData): Promise<{ success: boolean; error?: string }> => {
    try {
      setError(null);
      const formData = createFormData(data);

      const response = await apiClient.updateEmployee(id, formData);

      if (response.status === 'success') {
        await refreshData();
        return { success: true };
      } else {
        return { success: false, error: response.message || 'Failed to update employee' };
      }
    } catch (error) {
      return { success: false, error: handleApiError(error) };
    }
  };

  const deleteItem = async (id: string): Promise<{ success: boolean; error?: string }> => {
    try {
      setError(null);

      const response = await apiClient.deleteEmployee(id);

      if (response.status === 'success') {
        await refreshData();

        // Adjust page if needed
        if (items.length === 1 && currentPage > 1) {
          setCurrentPage(currentPage - 1);
        }

        return { success: true };
      } else {
        return { success: false, error: response.message || 'Failed to delete employee' };
      }
    } catch (error) {
      return { success: false, error: handleApiError(error) };
    }
  };

  const refreshData = async (): Promise<void> => {
    await loadEmployees();
  };

  const value: CrudContextValue = {
    items,
    divisions,
    searchQuery,
    currentPage,
    itemsPerPage: 10,
    isLoading,
    error,
    selectedDivision,
    paginationInfo: {
      currentPage: paginationData.currentPage,
      totalPages: paginationData.totalPages,
      totalItems: paginationData.totalItems,
      startIndex: (paginationData.currentPage - 1) * 10,
      endIndex: Math.min(paginationData.currentPage * 10, paginationData.totalItems),
      hasMorePages: paginationData.hasMorePages,
    },
    setSearchQuery,
    setCurrentPage,
    setSelectedDivision,
    addItem,
    updateItem,
    deleteItem,
    refreshData,
    loadDivisions,
  };

  return (
    <CrudContext.Provider value={value}>
      {children}
    </CrudContext.Provider>
  );
}

export const useCrud = () => {
  const context = useContext(CrudContext);
  if (!context) {
    throw new Error('useCrud must be used within a CrudProvider');
  }
  return context;
};
