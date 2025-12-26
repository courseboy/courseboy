"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { adminPrivilegeApi } from "@/lib/api";
import { Spinner } from "@/components/ui/spinner";
import {
  PrivilegeCard,
  EmptyState,
  CreatePrivilegeModal,
  EditPrivilegeModal,
  DeletePrivilegeModal,
} from "./components";

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
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingPrivilege, setEditingPrivilege] = useState<Privilege | null>(
    null
  );
  const [deletingPrivilege, setDeletingPrivilege] = useState<Privilege | null>(
    null
  );

  const { data: privileges, isLoading } = useQuery({
    queryKey: ["admin-privileges"],
    queryFn: async () => {
      const response = await adminPrivilegeApi.getAll();
      return response.data.data as Privilege[];
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
          <PrivilegeCard
            key={privilege.id}
            privilege={privilege}
            onEdit={() => setEditingPrivilege(privilege)}
            onDelete={() => setDeletingPrivilege(privilege)}
          />
        ))}

        {privileges?.length === 0 && (
          <EmptyState onCreateClick={() => setIsCreateModalOpen(true)} />
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
        <DeletePrivilegeModal
          privilege={deletingPrivilege}
          onClose={() => setDeletingPrivilege(null)}
        />
      )}
    </div>
  );
}
