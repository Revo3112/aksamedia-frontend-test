// context/CrudContext.tsx - Complete Laravel API integration
import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import { useSearchParams } from "react-router";
import type { CrudItem, EmployeeFormData, Division } from "../types";
import {
  apiClient,
  transformApiEmployeeToCrudItem,
  handleApiError,
} from "../utils/api";
import { useAuth } from "./AuthContext";

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
  addItem: (
    data: EmployeeFormData
  ) => Promise<{ success: boolean; error?: string }>;
  updateItem: (
    id: string,
    data: EmployeeFormData
  ) => Promise<{ success: boolean; error?: string }>;
  deleteItem: (id: string) => Promise<{ success: boolean; error?: string }>;
  refreshData: () => Promise<void>;
  loadDivisions: () => Promise<void>;
}

const CrudContext = createContext<CrudContextValue | undefined>(undefined);

export function CrudProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [items, setItems] = useState<CrudItem[]>([]);
  const [divisions, setDivisions] = useState<Division[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paginationData, setPaginationData] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    hasMorePages: false,
  });

  const searchQuery = searchParams.get("q") || "";
  const currentPage = Math.max(1, Number(searchParams.get("page") || 1));
  const selectedDivision = searchParams.get("division") || "";

  // Load divisions - only when authenticated
  const loadDivisions = useCallback(async () => {
    if (!isAuthenticated) {
      console.log("🚫 Skipping divisions load - user not authenticated");
      return;
    }

    try {
      console.log("📁 Loading divisions...");
      const response = await apiClient.getDivisions();
      if (response.status === "success" && response.data) {
        setDivisions(response.data.divisions);
        console.log("✅ Divisions loaded:", response.data.divisions.length);
      }
    } catch (error) {
      console.error("❌ Failed to load divisions:", error);
    }
  }, [isAuthenticated]);

  // Load employees with filters - only when authenticated
  const loadEmployees = useCallback(async () => {
    if (!isAuthenticated) {
      console.log("🚫 Skipping employees load - user not authenticated");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      console.log("👥 Loading employees...");

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
      console.log("🔍 API Response:", response);

      if (response.status === "success" && response.data) {
        console.log("📊 Raw employees data:", response.data.employees);
        const transformedItems = response.data.employees.map(
          transformApiEmployeeToCrudItem
        );
        console.log("🔄 Transformed items:", transformedItems);
        setItems(transformedItems);
        console.log("✅ Employees loaded:", transformedItems.length);

        console.log("📄 Pagination data:", response.pagination);
        setPaginationData({
          currentPage: response.pagination.current_page,
          totalPages: response.pagination.last_page,
          totalItems: response.pagination.total,
          hasMorePages: response.pagination.has_more_pages,
        });
      } else {
        console.log("❌ API Response failed:", response);
        setError(response.message || "Failed to load employees");
        setItems([]);
      }
    } catch (error) {
      const errorMessage = handleApiError(error);
      console.error("❌ Failed to load employees:", errorMessage);
      setError(errorMessage);
      setItems([]);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, searchQuery, selectedDivision, currentPage]);

  // Load data only when user is authenticated and auth loading is complete
  useEffect(() => {
    if (authLoading) {
      console.log("⏳ Auth still loading, waiting...");
      return;
    }

    if (isAuthenticated) {
      console.log("🔓 User authenticated, loading data...");
      loadEmployees();
      loadDivisions();
    } else {
      console.log("🔒 User not authenticated, clearing data...");
      setItems([]);
      setDivisions([]);
      setError(null);
      setIsLoading(false);
    }
  }, [authLoading, isAuthenticated, loadEmployees, loadDivisions]);

  const setSearchQuery = (query: string) => {
    const params = new URLSearchParams(searchParams);
    if (query.trim()) {
      params.set("q", query.trim());
    } else {
      params.delete("q");
    }
    params.set("page", "1");
    setSearchParams(params, { replace: true });
  };

  const setCurrentPage = (page: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", String(page));
    setSearchParams(params, { replace: true });
  };

  const setSelectedDivision = (divisionId: string) => {
    const params = new URLSearchParams(searchParams);
    if (divisionId) {
      params.set("division", divisionId);
    } else {
      params.delete("division");
    }
    params.set("page", "1");
    setSearchParams(params, { replace: true });
  };

  const createFormData = (data: EmployeeFormData): FormData => {
    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("phone", data.phone);
    formData.append("division", data.division); // Backend expects 'division', not 'division_id'
    formData.append("position", data.position);

    if (data.image) {
      formData.append("image", data.image);
    }

    return formData;
  };

  const addItem = async (
    data: EmployeeFormData
  ): Promise<{ success: boolean; error?: string }> => {
    if (!isAuthenticated) {
      return { success: false, error: "Authentication required" };
    }

    try {
      setError(null);
      console.log("📝 Adding employee with data:", data);
      const formData = createFormData(data);

      // Debug FormData content
      for (let [key, value] of formData.entries()) {
        console.log(`📊 FormData: ${key} = ${value}`);
      }

      const response = await apiClient.createEmployee(formData);
      console.log("📮 Create employee response:", response);

      if (response.status === "success") {
        await refreshData();
        return { success: true };
      } else {
        console.log("❌ Create employee failed:", response);
        return {
          success: false,
          error: response.message || "Failed to add employee",
        };
      }
    } catch (error) {
      console.error("💥 Add employee error:", error);
      return { success: false, error: handleApiError(error) };
    }
  };

  const updateItem = async (
    id: string,
    data: EmployeeFormData
  ): Promise<{ success: boolean; error?: string }> => {
    if (!isAuthenticated) {
      return { success: false, error: "Authentication required" };
    }

    try {
      setError(null);
      const formData = createFormData(data);

      const response = await apiClient.updateEmployee(id, formData);

      if (response.status === "success") {
        await refreshData();
        return { success: true };
      } else {
        return {
          success: false,
          error: response.message || "Failed to update employee",
        };
      }
    } catch (error) {
      return { success: false, error: handleApiError(error) };
    }
  };

  const deleteItem = async (
    id: string
  ): Promise<{ success: boolean; error?: string }> => {
    if (!isAuthenticated) {
      return { success: false, error: "Authentication required" };
    }

    try {
      setError(null);

      const response = await apiClient.deleteEmployee(id);

      if (response.status === "success") {
        await refreshData();

        // Adjust page if needed
        if (items.length === 1 && currentPage > 1) {
          setCurrentPage(currentPage - 1);
        }

        return { success: true };
      } else {
        return {
          success: false,
          error: response.message || "Failed to delete employee",
        };
      }
    } catch (error) {
      return { success: false, error: handleApiError(error) };
    }
  };

  const refreshData = async (): Promise<void> => {
    if (isAuthenticated) {
      await loadEmployees();
    }
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
      endIndex: Math.min(
        paginationData.currentPage * 10,
        paginationData.totalItems
      ),
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

  return <CrudContext.Provider value={value}>{children}</CrudContext.Provider>;
}

export const useCrud = () => {
  const context = useContext(CrudContext);

  // Return default values when context is not available (user not authenticated)
  if (!context) {
    return {
      items: [],
      divisions: [],
      searchQuery: "",
      currentPage: 1,
      itemsPerPage: 10,
      isLoading: false,
      error: null,
      selectedDivision: "",
      paginationInfo: {
        currentPage: 1,
        totalPages: 0,
        totalItems: 0,
        startIndex: 0,
        endIndex: 0,
        hasMorePages: false,
      },
      setSearchQuery: () => {},
      setCurrentPage: () => {},
      setSelectedDivision: () => {},
      addItem: async () => ({
        success: false,
        error: "Authentication required",
      }),
      updateItem: async () => ({
        success: false,
        error: "Authentication required",
      }),
      deleteItem: async () => ({
        success: false,
        error: "Authentication required",
      }),
      refreshData: async () => {},
      loadDivisions: async () => {},
    };
  }

  return context;
};
