"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminPrivilegeApi } from "@/lib/api";
import { Spinner } from "@/components/ui/spinner";

interface Privilege {
  id: number;
  name: string;
  description: string | null;
  price: number | null;
  _count?: {
    userPrivileges: number;
    courses: number;
  };
}

export default function AdminPrivilegesPage() {
  const queryClient = useQueryClient();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingPrivilege, setEditingPrivilege] = useState<Privilege | null>(
    null
  );
  const [deletingPrivilege, setDeletingPrivilege] = useState<Privilege | null>(
    null
  );

  // Fetch privileges
  const { data: privileges, isLoading } = useQuery({
    queryKey: ["admin-privileges"],
    queryFn: async () => {
      const response = await adminPrivilegeApi.getAll();
      return response.data.data as Privilege[];
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => adminPrivilegeApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-privileges"] });
      setDeletingPrivilege(null);
    },
  });

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Privilege Management
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage user privileges and access levels
          </p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2 rounded-lg bg-[#3A7BD5] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#2E6BC4]"
        >
          <span className="material-symbols-outlined text-lg">add</span>
          Add Privilege
        </button>
      </div>

      {/* Privileges Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {privileges?.map((privilege) => (
          <div
            key={privilege.id}
            className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-all hover:shadow-md"
          >
            {/* Header */}
            <div className="mb-4 flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#3A7BD5]/10 text-[#3A7BD5]">
                  <span className="material-symbols-outlined">
                    verified_user
                  </span>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">{privilege.name}</h3>
                  {privilege.price !== null && (
                    <span className="text-sm font-medium text-green-600">
                      ฿{privilege.price.toLocaleString()}
                    </span>
                  )}
                </div>
              </div>
              {/* Actions */}
              <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                <button
                  onClick={() => setEditingPrivilege(privilege)}
                  className="rounded-lg p-1.5 text-gray-500 transition-colors hover:bg-gray-100 hover:text-[#3A7BD5]"
                  title="Edit"
                >
                  <span className="material-symbols-outlined text-lg">
                    edit
                  </span>
                </button>
                <button
                  onClick={() => setDeletingPrivilege(privilege)}
                  className="rounded-lg p-1.5 text-gray-500 transition-colors hover:bg-red-50 hover:text-red-600"
                  title="Delete"
                >
                  <span className="material-symbols-outlined text-lg">
                    delete
                  </span>
                </button>
              </div>
            </div>

            {/* Description */}
            <p className="mb-4 min-h-[40px] text-sm text-gray-600">
              {privilege.description || "No description"}
            </p>

            {/* Stats */}
            {privilege._count && (
              <div className="flex gap-4 border-t border-gray-100 pt-3">
                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                  <span className="material-symbols-outlined text-sm">
                    group
                  </span>
                  {privilege._count.userPrivileges} users
                </div>
                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                  <span className="material-symbols-outlined text-sm">
                    book_2
                  </span>
                  {privilege._count.courses} courses
                </div>
              </div>
            )}
          </div>
        ))}

        {/* Empty State */}
        {privileges?.length === 0 && (
          <div className="col-span-full rounded-xl border border-dashed border-gray-300 bg-gray-50 py-12 text-center">
            <span className="material-symbols-outlined text-4xl text-gray-400">
              verified_user
            </span>
            <p className="mt-2 text-gray-600">No privileges created yet</p>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="mt-4 text-sm font-medium text-[#3A7BD5] hover:underline"
            >
              Create your first privilege
            </button>
          </div>
        )}
      </div>

      {/* Create Modal */}
      {isCreateModalOpen && (
        <CreatePrivilegeModal onClose={() => setIsCreateModalOpen(false)} />
      )}

      {/* Edit Modal */}
      {editingPrivilege && (
        <EditPrivilegeModal
          privilege={editingPrivilege}
          onClose={() => setEditingPrivilege(null)}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deletingPrivilege && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600">
                <span className="material-symbols-outlined text-2xl">
                  warning
                </span>
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  Delete Privilege
                </h3>
                <p className="text-sm text-gray-500">
                  This action cannot be undone
                </p>
              </div>
            </div>

            <p className="mb-6 text-gray-600">
              Are you sure you want to delete{" "}
              <strong>{deletingPrivilege.name}</strong>? This will remove the
              privilege from the system.
            </p>

            {deleteMutation.error && (
              <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
                {(deleteMutation.error as Error).message ||
                  "Failed to delete privilege"}
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setDeletingPrivilege(null)}
                className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => deleteMutation.mutate(deletingPrivilege.id)}
                disabled={deleteMutation.isPending}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:opacity-50"
              >
                {deleteMutation.isPending ? (
                  <Spinner size="sm" />
                ) : (
                  <>
                    <span className="material-symbols-outlined text-lg">
                      delete
                    </span>
                    Delete
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Create Privilege Modal
function CreatePrivilegeModal({ onClose }: { onClose: () => void }) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
  });

  const createMutation = useMutation({
    mutationFn: (data: {
      name: string;
      description?: string;
      price?: number;
    }) => adminPrivilegeApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-privileges"] });
      onClose();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({
      name: formData.name,
      description: formData.description || undefined,
      price: formData.price ? parseInt(formData.price) : undefined,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
        <div className="mb-6 flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-900">Create Privilege</h3>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-[#3A7BD5] focus:outline-none focus:ring-1 focus:ring-[#3A7BD5]"
              placeholder="e.g., Premium, VIP"
              required
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              rows={3}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-[#3A7BD5] focus:outline-none focus:ring-1 focus:ring-[#3A7BD5]"
              placeholder="Describe what this privilege provides..."
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Price (฿)
            </label>
            <input
              type="number"
              value={formData.price}
              onChange={(e) =>
                setFormData({ ...formData, price: e.target.value })
              }
              min="0"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-[#3A7BD5] focus:outline-none focus:ring-1 focus:ring-[#3A7BD5]"
              placeholder="0"
            />
          </div>

          {createMutation.error && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
              {(createMutation.error as Error).message ||
                "Failed to create privilege"}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createMutation.isPending || !formData.name}
              className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-[#3A7BD5] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#2E6BC4] disabled:opacity-50"
            >
              {createMutation.isPending ? (
                <Spinner size="sm" />
              ) : (
                <>
                  <span className="material-symbols-outlined text-lg">add</span>
                  Create
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Edit Privilege Modal
function EditPrivilegeModal({
  privilege,
  onClose,
}: {
  privilege: Privilege;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    name: privilege.name,
    description: privilege.description || "",
    price: privilege.price?.toString() || "",
  });

  const updateMutation = useMutation({
    mutationFn: (data: {
      name?: string;
      description?: string | null;
      price?: number | null;
    }) => adminPrivilegeApi.update(privilege.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-privileges"] });
      onClose();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate({
      name: formData.name,
      description: formData.description || null,
      price: formData.price ? parseInt(formData.price) : null,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
        <div className="mb-6 flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-900">Edit Privilege</h3>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-[#3A7BD5] focus:outline-none focus:ring-1 focus:ring-[#3A7BD5]"
              placeholder="e.g., Premium, VIP"
              required
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              rows={3}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-[#3A7BD5] focus:outline-none focus:ring-1 focus:ring-[#3A7BD5]"
              placeholder="Describe what this privilege provides..."
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Price (฿)
            </label>
            <input
              type="number"
              value={formData.price}
              onChange={(e) =>
                setFormData({ ...formData, price: e.target.value })
              }
              min="0"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-[#3A7BD5] focus:outline-none focus:ring-1 focus:ring-[#3A7BD5]"
              placeholder="0"
            />
          </div>

          {updateMutation.error && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
              {(updateMutation.error as Error).message ||
                "Failed to update privilege"}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={updateMutation.isPending || !formData.name}
              className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-[#3A7BD5] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#2E6BC4] disabled:opacity-50"
            >
              {updateMutation.isPending ? (
                <Spinner size="sm" />
              ) : (
                <>
                  <span className="material-symbols-outlined text-lg">
                    save
                  </span>
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
