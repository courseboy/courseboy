"use client";

import { useState, useEffect, useCallback } from "react";
import { adminUserApi } from "@/lib/api";
import { AdminUser, Privilege, PaginationMeta } from "@/types";
import { Spinner } from "@/components/ui/spinner";
import { AddUserModal } from "@/components/admin/AddUserModal";
import { EditUserModal } from "@/components/admin/EditUserModal";

export default function UserManagementPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [privileges, setPrivileges] = useState<Privilege[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await adminUserApi.getAll(currentPage, 10);
      setUsers(response.data.data);
      setPagination(response.data.meta);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to fetch users");
    } finally {
      setLoading(false);
    }
  }, [currentPage]);

  const fetchPrivileges = async () => {
    try {
      const response = await adminUserApi.getPrivileges();
      setPrivileges(response.data.data);
    } catch (err: any) {
      console.error("Failed to fetch privileges:", err);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchPrivileges();
  }, [fetchUsers]);

  const handleDeactivate = async (userId: number) => {
    if (!confirm("Are you sure you want to deactivate this user?")) return;
    
    try {
      setActionLoading(userId);
      await adminUserApi.deactivate(userId);
      await fetchUsers();
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to deactivate user");
    } finally {
      setActionLoading(null);
    }
  };

  const handleActivate = async (userId: number) => {
    try {
      setActionLoading(userId);
      await adminUserApi.activate(userId);
      await fetchUsers();
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to activate user");
    } finally {
      setActionLoading(null);
    }
  };

  const handleEdit = (user: AdminUser) => {
    setSelectedUser(user);
    setIsEditModalOpen(true);
  };

  const handleUserCreated = () => {
    setIsAddModalOpen(false);
    fetchUsers();
  };

  const handleUserUpdated = () => {
    setIsEditModalOpen(false);
    setSelectedUser(null);
    fetchUsers();
  };

  // Filter users based on search and role
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      searchQuery === "" ||
      user.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRole =
      roleFilter === "all" ||
      user.privileges.includes(roleFilter);

    return matchesSearch && matchesRole;
  });

  const getPrivilegeBadgeStyle = (privilege: string) => {
    switch (privilege) {
      case "Admin":
        return "bg-[#3A7BD5]/10 text-[#3A7BD5]";
      case "Instructor":
        return "bg-[#7BC8A4]/15 text-[#7BC8A4]";
      case "Manager":
        return "bg-[#F4A261]/15 text-[#F4A261]";
      default:
        return "bg-slate-100 text-slate-600";
    }
  };

  const getUserInitials = (user: AdminUser) => {
    if (user.username) {
      return user.username
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    return user.email.slice(0, 2).toUpperCase();
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
      {/* Page Header & Main Action */}
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
          onClick={() => setIsAddModalOpen(true)}
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

      {/* Search and Filters Bar */}
      <div className="bg-white p-2 rounded-xl shadow-sm border border-slate-200/60 flex flex-col md:flex-row gap-2">
        <div className="flex-1 relative">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280]">
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-slate-50 border-transparent rounded-lg focus:bg-white focus:border-[#3A7BD5] focus:ring-0 text-sm placeholder:text-[#6B7280]/70 transition-all"
            placeholder="Search by username or email..."
          />
        </div>
        <div className="flex gap-2">
          <div className="relative min-w-[140px]">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full appearance-none bg-slate-50 border-transparent rounded-lg py-3 pl-4 pr-10 text-sm text-[#1F2933] font-medium focus:border-[#3A7BD5] focus:ring-0 cursor-pointer"
            >
              <option value="all">All Roles</option>
              {privileges.map((privilege) => (
                <option key={privilege.id} value={privilege.name}>
                  {privilege.name}
                </option>
              ))}
            </select>
            <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7280] pointer-events-none text-sm">
              expand_more
            </span>
          </div>
        </div>
      </div>

      {/* User List (Cards) */}
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
            <div
              key={user.id}
              className={`group flex flex-col md:flex-row md:items-center justify-between p-4 md:p-5 rounded-xl border shadow-sm hover:shadow-md transition-all gap-4 ${
                user.isActive
                  ? "bg-white border-slate-200/60 hover:border-[#3A7BD5]/20"
                  : "bg-slate-50 border-slate-200 opacity-80"
              }`}
            >
              <div className="flex items-center gap-4">
                <div
                  className={`size-12 rounded-full flex items-center justify-center font-bold text-lg ring-2 ring-slate-100 ${
                    user.isActive
                      ? "bg-[#3A7BD5]/10 text-[#3A7BD5]"
                      : "bg-slate-100 text-slate-400 grayscale"
                  }`}
                >
                  {getUserInitials(user)}
                </div>
                <div className="flex flex-col">
                  <span
                    className={`text-base font-bold transition-colors ${
                      user.isActive
                        ? "text-[#1F2933] group-hover:text-[#3A7BD5]"
                        : "text-[#6B7280] line-through decoration-slate-400"
                    }`}
                  >
                    {user.username || "No username"}
                  </span>
                  <span className="text-sm text-[#6B7280]">{user.email}</span>
                </div>
              </div>
              <div className="flex items-center justify-between md:justify-end gap-6 md:w-1/2">
                <div className="flex flex-col md:items-end gap-1">
                  {user.isActive ? (
                    <div className="flex flex-wrap gap-1">
                      {user.privileges.map((privilege) => (
                        <span
                          key={privilege}
                          className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${getPrivilegeBadgeStyle(
                            privilege
                          )}`}
                        >
                          {privilege}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="bg-slate-200 text-slate-500 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
                      Deactivated
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {actionLoading === user.id ? (
                    <div className="size-10 flex items-center justify-center">
                      <Spinner size="sm" />
                    </div>
                  ) : user.isActive ? (
                    <>
                      <button
                        onClick={() => handleEdit(user)}
                        className="size-10 flex items-center justify-center rounded-lg hover:bg-[#EEF2F7] text-[#6B7280] hover:text-[#3A7BD5] transition-colors"
                        title="Edit User"
                      >
                        <span className="material-symbols-outlined">edit</span>
                      </button>
                      <button
                        onClick={() => handleDeactivate(user.id)}
                        className="size-10 flex items-center justify-center rounded-lg hover:bg-red-50 text-[#6B7280] hover:text-red-500 transition-colors"
                        title="Deactivate User"
                      >
                        <span className="material-symbols-outlined">block</span>
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => handleActivate(user.id)}
                      className="size-10 flex items-center justify-center rounded-lg hover:bg-[#EEF2F7] text-[#6B7280] transition-colors"
                      title="Restore User"
                    >
                      <span className="material-symbols-outlined">history</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-center md:justify-end gap-2 pt-4 pb-12">
          <span className="text-sm text-[#6B7280] mr-4">
            Showing {(currentPage - 1) * 10 + 1}-
            {Math.min(currentPage * 10, pagination.total)} of {pagination.total}{" "}
            users
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="size-9 flex items-center justify-center rounded-lg border border-slate-200 text-[#6B7280] hover:bg-white hover:text-[#1F2933] transition-colors disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-sm">
              chevron_left
            </span>
          </button>
          {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
            const pageNum = i + 1;
            return (
              <button
                key={pageNum}
                onClick={() => setCurrentPage(pageNum)}
                className={`size-9 flex items-center justify-center rounded-lg font-bold text-sm transition-colors ${
                  currentPage === pageNum
                    ? "bg-[#3A7BD5] text-white shadow-md shadow-[#3A7BD5]/30"
                    : "border border-slate-200 text-[#6B7280] hover:bg-white hover:text-[#1F2933]"
                }`}
              >
                {pageNum}
              </button>
            );
          })}
          <button
            onClick={() =>
              setCurrentPage((p) => Math.min(pagination.totalPages, p + 1))
            }
            disabled={currentPage === pagination.totalPages}
            className="size-9 flex items-center justify-center rounded-lg border border-slate-200 text-[#6B7280] hover:bg-white hover:text-[#1F2933] transition-colors disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-sm">
              chevron_right
            </span>
          </button>
        </div>
      )}

      {/* Add User Modal */}
      <AddUserModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={handleUserCreated}
        privileges={privileges}
      />

      {/* Edit User Modal */}
      {selectedUser && (
        <EditUserModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedUser(null);
          }}
          onSuccess={handleUserUpdated}
          user={selectedUser}
          privileges={privileges}
        />
      )}
    </div>
  );
}
