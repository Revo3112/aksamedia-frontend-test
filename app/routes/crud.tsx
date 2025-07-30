import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { useCrud } from '../context/CrudContext';
import { CrudTable } from '../components/features/CrudTable';

export function meta() {
  return [
    { title: 'Employee Management - Aksamedia' },
    { name: 'description', content: 'Manage employee records' },
  ];
}

export default function Crud() {
  const { isAuthenticated } = useAuth();
  const { searchQuery, currentPage } = useCrud();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  /* ---------- redirect login ---------- */
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  /* ---------- sinkronisasi URL ---------- */
  useEffect(() => {
    if (!isAuthenticated) return;

    const q = searchParams.get('q') || '';
    const page = Math.max(1, Number(searchParams.get('page') || 1));

    if (q !== searchQuery || page !== currentPage) {
      // URL sudah otomatis ter-update lewat setSearchQuery & setCurrentPage
    }
  }, [isAuthenticated, searchParams, searchQuery, currentPage]);

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <CrudTable />
        </div>
      </div>
    </div>
  );
}
