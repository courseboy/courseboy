"use client";

import { Spinner } from "@/components/ui/spinner";
import { AddUserModal } from "@/components/admin/AddUserModal";
import { EditUserModal } from "@/components/admin/EditUserModal";
import {
  useUsers,
  useUserFilters,
  useUserActions,
  useUserModals,
} from "./hooks";
import { UserCard, UserFiltersBar, Pagination } from "./components";

export default function UserManagementPage() {
  const {
    users,
    privileges,
    loading,
    error,
    pagination,
    currentPage,
    setCurrentPage,
    refreshUsers,
  } = useUsers();

  const filters = useUserFilters();
  const actions = useUserActions();
  const modals = useUserModals();

  const filteredUsers = filters.filterUsers(users);

  const handleUserCreated = () => {
    modals.closeAddModal();
    refreshUsers();
  };

  const handleUserUpdated = () => {
    modals.closeEditModal();
    refreshUsers();
  };

  if (loading && users.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto flex flex-col gap-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-[#1F2933] tracking-tight">
            User Management
          </h2>
          <p className="text-[#6B7280] mt-1 text-base">
            Manage user access, assign roles, and handle account statuses.
          </p>
        </div>
        <button
          onClick={modals.openAddModal}
          className="flex items-center justify-center gap-2 bg-[#3A7BD5] hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-bold shadow-lg shadow-blue-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <span className="material-symbols-outlined">add</span>
          Add New User
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Search and Filters */}
      <UserFiltersBar
        searchQuery={filters.searchQuery}
        roleFilter={filters.roleFilter}
        privileges={privileges}
        onSearchChange={filters.setSearchQuery}
        onRoleChange={filters.setRoleFilter}
      />

      {/* User List */}
      <div className="flex flex-col gap-3">
        {filteredUsers.length === 0 ? (
          <div className="bg-white p-8 rounded-xl border border-slate-200/60 text-center">
            <span className="material-symbols-outlined text-4xl text-[#6B7280] mb-2">
              person_off
            </span>
            <p className="text-[#6B7280]">No users found.</p>
          </div>
        ) : (
          filteredUsers.map((user) => (
            <UserCard
              key={user.id}
              user={user}
              isLoading={actions.actionLoading === user.id}
              onEdit={() => modals.openEditModal(user)}
              onDeactivate={() =>
                actions.handleDeactivate(user.id, refreshUsers)
              }
              onActivate={() => actions.handleActivate(user.id, refreshUsers)}
            />
          ))
        )}
      </div>

      {/* Pagination */}
      {pagination && (
        <Pagination
          pagination={pagination}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
        />
      )}

      {/* Add User Modal */}
      <AddUserModal
        isOpen={modals.isAddModalOpen}
        onClose={modals.closeAddModal}
        onSuccess={handleUserCreated}
        privileges={privileges}
      />

      {/* Edit User Modal */}
      {modals.selectedUser && (
        <EditUserModal
          isOpen={modals.isEditModalOpen}
          onClose={modals.closeEditModal}
          onSuccess={handleUserUpdated}
          user={modals.selectedUser}
          privileges={privileges}
        />
      )}
    </div>
  );
}
