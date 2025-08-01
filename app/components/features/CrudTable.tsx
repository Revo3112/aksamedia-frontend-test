import React, { useState } from "react";
import { useCrud } from "../../context/CrudContext";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Select } from "../ui/Select";
import { Modal } from "../ui/Modal";
import { Pagination } from "../ui/Pagination";
import type { CrudItem } from "../../types";

export function CrudTable() {
  const {
    items,
    divisions,
    searchQuery,
    currentPage,
    isLoading,
    error,
    paginationInfo,
    setSearchQuery,
    setCurrentPage,
    addItem,
    updateItem,
    deleteItem,
  } = useCrud();

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<CrudItem | null>(null);

  /* ---------- Form state ---------- */
  const [form, setForm] = useState({
    name: "",
    phone: "",
    position: "",
    division: "",
  });

  /* ---------- Modal helpers ---------- */
  const openModal = (item?: CrudItem) => {
    setEditing(item || null);
    setForm(
      item
        ? {
            name: item.name,
            phone: item.phone || "",
            position: item.position,
            division: item.division.id, // Use division ID for form
          }
        : { name: "", phone: "", position: "", division: "" }
    );
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditing(null);
  };

  const handleSubmit = async () => {
    if (!form.name || !form.phone || !form.division || !form.position) {
      alert("All fields are required");
      return;
    }

    const result = editing
      ? await updateItem(editing.id, form)
      : await addItem(form);

    if (result.success) {
      closeModal();
    } else {
      alert(result.error || "Operation failed");
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this employee?")) {
      const result = await deleteItem(id);
      if (!result.success) {
        alert(result.error || "Delete failed");
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Employee Management
        </h1>
        <Button onClick={() => openModal()}>Add Employee</Button>
      </div>

      {/* Search */}
      <div className="max-w-md">
        <Input
          placeholder="Search employees..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm !text-red-700 dark:!text-red-400">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-900 dark:text-gray-300 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-900 dark:text-gray-300 uppercase tracking-wider">
                  Phone
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-900 dark:text-gray-300 uppercase tracking-wider">
                  Position
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-900 dark:text-gray-300 uppercase tracking-wider">
                  Division
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-900 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center">
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                      <span className="ml-2 text-gray-900 dark:text-gray-300">Loading...</span>
                    </div>
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center">
                    <div className="text-gray-900 dark:text-gray-300">
                      <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                      </svg>
                      <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-200">No employees found</h3>
                      <p className="mt-1 text-sm text-gray-900 dark:text-gray-300">
                        {searchQuery ? "Try adjusting your search terms." : "Get started by adding a new employee."}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {item.name}
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-gray-300">
                        {item.phone}
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-gray-300">
                        {item.position}
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full !bg-blue-200 !text-blue-800 dark:!bg-blue-900 dark:!text-blue-100">
                        {item.division.name}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => openModal(item)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleDelete(item.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination - Only show if there are multiple pages */}
      {paginationInfo.totalPages > 1 && (
        <Pagination
          paginationInfo={paginationInfo}
          onPageChange={setCurrentPage}
        />
      )}

      {/* Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={closeModal}
        title={editing ? "Edit Employee" : "Add Employee"}
      >
        <div className="space-y-4">
          <Input
            label="Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Full name"
          />
          <Input
            label="Phone"
            type="tel"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            placeholder="Phone number"
          />
          <Input
            label="Position"
            value={form.position}
            onChange={(e) => setForm({ ...form, position: e.target.value })}
            placeholder="Job title"
          />
          <Select
            label="Division"
            value={form.division}
            onChange={(value) => setForm({ ...form, division: value })}
            options={divisions.map((div) => ({
              value: div.id,
              label: div.name,
            }))}
            placeholder="Select a division"
            required
          />
          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="secondary" onClick={closeModal}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>
              {editing ? "Save Changes" : "Add"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
