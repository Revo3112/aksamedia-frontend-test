import React, { createContext, useContext, useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router';
import type { CrudItem } from '../types';
import { crudStorage } from '../utils/storage';

const ITEMS_PER_PAGE = 5;

interface CrudContextValue {
  items: CrudItem[];
  searchQuery: string;
  currentPage: number;
  itemsPerPage: number;
  isLoading: boolean;
  filteredItems: CrudItem[];
  paginationInfo: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    startIndex: number;
    endIndex: number
  };
  setSearchQuery: (query: string) => void;
  setCurrentPage: (page: number) => void;
  addItem: (data: Omit<CrudItem, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateItem: (id: string, updates: Partial<Omit<CrudItem, 'id' | 'createdAt'>>) => void;
  deleteItem: (id: string) => void;
}

const CrudContext = createContext<CrudContextValue | undefined>(undefined);

export function CrudProvider({ children }: { children: React.ReactNode }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [items, setItems] = useState<CrudItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize data from storage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const data = crudStorage.getCrudData();
      setItems(data);
      setIsLoading(false);
    }
  }, []);

  const searchQuery = searchParams.get('q') || '';
  const currentPage = Math.max(1, Number(searchParams.get('page') || 1));

  // Filter items based on search query
  const filteredItems = useMemo(() => {
    const query = searchQuery.toLowerCase();
    return items.filter(item =>
      item.name.toLowerCase().includes(query) ||
      item.email.toLowerCase().includes(query) ||
      item.position.toLowerCase().includes(query) ||
      item.department.toLowerCase().includes(query)
    );
  }, [items, searchQuery]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredItems.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedItems = filteredItems.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const setSearchQuery = (query: string) => {
    const params = new URLSearchParams(searchParams);
    if (query) {
      params.set('q', query);
    } else {
      params.delete('q');
    }
    params.set('page', '1'); // Reset to first page when searching
    setSearchParams(params, { replace: true });
  };

  const setCurrentPage = (page: number) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', String(page));
    setSearchParams(params, { replace: true });
  };

  const persistAndUpdate = (newItems: CrudItem[]) => {
    crudStorage.setCrudData(newItems);
    setItems(newItems);
  };

  const addItem = (data: Omit<CrudItem, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newItem = crudStorage.addItem(data);
    const updatedItems = crudStorage.getCrudData();
    setItems(updatedItems);
  };

  const updateItem = (id: string, updates: Partial<Omit<CrudItem, 'id' | 'createdAt'>>) => {
    const updatedItem = crudStorage.updateItem(id, updates);
    if (updatedItem) {
      const updatedItems = crudStorage.getCrudData();
      setItems(updatedItems);
    }
  };

  const deleteItem = (id: string) => {
    const updatedItems = crudStorage.deleteItem(id);
    setItems(updatedItems);

    // Adjust current page if needed
    const newTotalPages = Math.ceil(
      updatedItems.filter(item => {
        const query = searchQuery.toLowerCase();
        return (
          item.name.toLowerCase().includes(query) ||
          item.email.toLowerCase().includes(query) ||
          item.position.toLowerCase().includes(query) ||
          item.department.toLowerCase().includes(query)
        );
      }).length / ITEMS_PER_PAGE
    );

    if (currentPage > newTotalPages && newTotalPages > 0) {
      setCurrentPage(newTotalPages);
    }
  };

  const value: CrudContextValue = {
    items,
    searchQuery,
    currentPage,
    itemsPerPage: ITEMS_PER_PAGE,
    isLoading,
    filteredItems: paginatedItems,
    paginationInfo: {
      currentPage,
      totalPages,
      totalItems: filteredItems.length,
      startIndex,
      endIndex: startIndex + paginatedItems.length,
    },
    setSearchQuery,
    setCurrentPage,
    addItem,
    updateItem,
    deleteItem,
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
