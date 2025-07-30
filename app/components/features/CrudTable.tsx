import React, { useState, useMemo } from "react";
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
    itemsPerPage,
    isLoading,
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

  /* ---------- Search & pagination ---------- */
  const filtered = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return items.filter(
      (i) =>
        i.name.toLowerCase().includes(q) ||
        i.phone.toLowerCase().includes(q) ||
        i.position.toLowerCase().includes(q) ||
        i.division.name.toLowerCase().includes(q)
    );
  }, [items, searchQuery]);

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const startIdx = (currentPage - 1) * itemsPerPage;
  const paginated = filtered.slice(startIdx, startIdx + itemsPerPage);

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

  const handleSubmit = () => {
    if (!form.name || !form.phone || !form.division || !form.position) {
      alert("All fields are required");
      return;
    }
    editing ? updateItem(editing.id, form) : addItem(form);
    closeModal();
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

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-900">
            <tr>
              <th className="px-4 py-2 text-left text-sm font-medium">Name</th>
              <th className="px-4 py-2 text-left text-sm font-medium">Phone</th>
              <th className="px-4 py-2 text-left text-sm font-medium">
                Position
              </th>
              <th className="px-4 py-2 text-left text-sm font-medium">
                Division
              </th>
              <th className="px-4 py-2 text-right text-sm font-medium">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {isLoading ? (
              <tr>
                <td colSpan={5} className="text-center py-6 text-gray-500">
                  Loading…
                </td>
              </tr>
            ) : paginated.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-6 text-gray-500">
                  No data found.
                </td>
              </tr>
            ) : (
              paginated.map((item) => (
                <tr
                  key={item.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <td className="px-4 py-2">{item.name}</td>
                  <td className="px-4 py-2">{item.phone}</td>
                  <td className="px-4 py-2">{item.position}</td>
                  <td className="px-4 py-2">{item.division.name}</td>
                  <td className="px-4 py-2 text-right space-x-2">
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
                      onClick={() => deleteItem(item.id)}
                    >
                      Delete
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination
          paginationInfo={{
            currentPage,
            totalPages,
            totalItems: filtered.length,
            startIndex: startIdx,
            endIndex: startIdx + paginated.length,
            hasMorePages: currentPage < totalPages,
          }}
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
