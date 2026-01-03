"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { adminPrivilegeApi } from "@/lib/api";
import { Spinner } from "@/components/ui/spinner";

interface Privilege {
  id: number;
  name: string;
  description: string | null;
  price: number | null;
}

interface PrivilegeFormData {
  name: string;
  description: string;
  price: string;
}

const INITIAL_FORM_DATA: PrivilegeFormData = {
  name: "",
  description: "",
  price: "",
};

interface ModalProps {
  onClose: () => void;
}

interface EditModalProps extends ModalProps {
  privilege: Privilege;
}

interface DeleteModalProps extends ModalProps {
  privilege: Privilege;
}

// Shared input styles
const INPUT_STYLES =
  "w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-[#3A7BD5] focus:outline-none focus:ring-1 focus:ring-[#3A7BD5]";

/**
 * Modal for creating a new privilege
 */
export function CreatePrivilegeModal({ onClose }: ModalProps) {
  const queryClient = useQueryClient();
  const [formData, setFormData] =
    useState<PrivilegeFormData>(INITIAL_FORM_DATA);

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
    <ModalWrapper onClose={onClose}>
      <ModalHeader title="Create Privilege" onClose={onClose} />
      <PrivilegeForm
        formData={formData}
        setFormData={setFormData}
        onSubmit={handleSubmit}
        onCancel={onClose}
        isLoading={createMutation.isPending}
        error={createMutation.error}
        submitLabel="Create"
        submitIcon="add"
      />
    </ModalWrapper>
  );
}

/**
 * Modal for editing an existing privilege
 */
export function EditPrivilegeModal({ privilege, onClose }: EditModalProps) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<PrivilegeFormData>({
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
    <ModalWrapper onClose={onClose}>
      <ModalHeader title="Edit Privilege" onClose={onClose} />
      <PrivilegeForm
        formData={formData}
        setFormData={setFormData}
        onSubmit={handleSubmit}
        onCancel={onClose}
        isLoading={updateMutation.isPending}
        error={updateMutation.error}
        submitLabel="Save Changes"
        submitIcon="save"
      />
    </ModalWrapper>
  );
}

/**
 * Modal for confirming privilege deletion
 */
export function DeletePrivilegeModal({ privilege, onClose }: DeleteModalProps) {
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: (id: number) => adminPrivilegeApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-privileges"] });
      onClose();
    },
  });

  return (
    <ModalWrapper onClose={onClose}>
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600">
          <span className="material-symbols-outlined text-2xl">warning</span>
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-900">Delete Privilege</h3>
          <p className="text-sm text-gray-500">This action cannot be undone</p>
        </div>
      </div>

      <p className="mb-6 text-gray-600">
        Are you sure you want to delete <strong>{privilege.name}</strong>? This
        will remove the privilege from the system.
      </p>

      {deleteMutation.error && (
        <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
          {(deleteMutation.error as Error).message ||
            "Failed to delete privilege"}
        </div>
      )}

      <div className="flex gap-3">
        <button
          onClick={onClose}
          className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          onClick={() => deleteMutation.mutate(privilege.id)}
          disabled={deleteMutation.isPending}
          className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:opacity-50"
        >
          {deleteMutation.isPending ? (
            <Spinner size="sm" />
          ) : (
            <>
              <span className="material-symbols-outlined text-lg">delete</span>
              Delete
            </>
          )}
        </button>
      </div>
    </ModalWrapper>
  );
}

// Shared modal wrapper component
function ModalWrapper({
  children,
}: {
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
        {children}
      </div>
    </div>
  );
}

// Shared modal header component
function ModalHeader({
  title,
  onClose,
}: {
  title: string;
  onClose: () => void;
}) {
  return (
    <div className="mb-6 flex items-center justify-between">
      <h3 className="text-lg font-bold text-gray-900">{title}</h3>
      <button
        onClick={onClose}
        className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
      >
        <span className="material-symbols-outlined">close</span>
      </button>
    </div>
  );
}

// Shared privilege form component
interface PrivilegeFormProps {
  formData: PrivilegeFormData;
  setFormData: (data: PrivilegeFormData) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  isLoading: boolean;
  error: Error | null;
  submitLabel: string;
  submitIcon: string;
}

function PrivilegeForm({
  formData,
  setFormData,
  onSubmit,
  onCancel,
  isLoading,
  error,
  submitLabel,
  submitIcon,
}: PrivilegeFormProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="mb-1.5 block text-sm font-medium text-gray-700">
          Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className={INPUT_STYLES}
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
          className={INPUT_STYLES}
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
          onChange={(e) => setFormData({ ...formData, price: e.target.value })}
          min="0"
          className={INPUT_STYLES}
          placeholder="0"
        />
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
          {(error as Error).message || "An error occurred"}
        </div>
      )}

      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading || !formData.name}
          className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-[#3A7BD5] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#2E6BC4] disabled:opacity-50"
        >
          {isLoading ? (
            <Spinner size="sm" />
          ) : (
            <>
              <span className="material-symbols-outlined text-lg">
                {submitIcon}
              </span>
              {submitLabel}
            </>
          )}
        </button>
      </div>
    </form>
  );
}
