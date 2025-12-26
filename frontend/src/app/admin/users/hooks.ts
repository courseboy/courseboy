"use client";

import { useState, useEffect, useCallback } from "react";
import { adminUserApi } from "@/lib/api";
import { AdminUser, Privilege, PaginationMeta } from "@/types";

interface UseUsersReturn {
  users: AdminUser[];
  privileges: Privilege[];
  loading: boolean;
  error: string | null;
  pagination: PaginationMeta | null;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  refreshUsers: () => Promise<void>;
}

/**
 * Manages user data fetching and pagination
 */
export function useUsers(): UseUsersReturn {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [privileges, setPrivileges] = useState<Privilege[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await adminUserApi.getAll(currentPage, 10);
      setUsers(response.data.data);
      setPagination(response.data.meta);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || "Failed to fetch users");
    } finally {
      setLoading(false);
    }
  }, [currentPage]);

  const fetchPrivileges = async () => {
    try {
      const response = await adminUserApi.getPrivileges();
      setPrivileges(response.data.data);
    } catch (err: unknown) {
      console.error("Failed to fetch privileges:", err);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchPrivileges();
  }, [fetchUsers]);

  return {
    users,
    privileges,
    loading,
    error,
    pagination,
    currentPage,
    setCurrentPage,
    refreshUsers: fetchUsers,
  };
}

interface UserFilters {
  searchQuery: string;
  roleFilter: string;
}

interface UseUserFiltersReturn extends UserFilters {
  setSearchQuery: (query: string) => void;
  setRoleFilter: (role: string) => void;
  filterUsers: (users: AdminUser[]) => AdminUser[];
}

/**
 * Manages user search and role filtering
 */
export function useUserFilters(): UseUserFiltersReturn {
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  const filterUsers = useCallback(
    (users: AdminUser[]) => {
      return users.filter((user) => {
        const matchesSearch =
          searchQuery === "" ||
          user.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.email.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesRole =
          roleFilter === "all" || user.privileges.includes(roleFilter);

        return matchesSearch && matchesRole;
      });
    },
    [searchQuery, roleFilter]
  );

  return {
    searchQuery,
    roleFilter,
    setSearchQuery,
    setRoleFilter,
    filterUsers,
  };
}

interface UseUserActionsReturn {
  actionLoading: number | null;
  handleDeactivate: (userId: number, onSuccess: () => void) => Promise<void>;
  handleActivate: (userId: number, onSuccess: () => void) => Promise<void>;
}

/**
 * Manages user activation/deactivation actions
 */
export function useUserActions(): UseUserActionsReturn {
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  const handleDeactivate = async (userId: number, onSuccess: () => void) => {
    if (!confirm("Are you sure you want to deactivate this user?")) return;

    try {
      setActionLoading(userId);
      await adminUserApi.deactivate(userId);
      onSuccess();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      alert(error.response?.data?.message || "Failed to deactivate user");
    } finally {
      setActionLoading(null);
    }
  };

  const handleActivate = async (userId: number, onSuccess: () => void) => {
    try {
      setActionLoading(userId);
      await adminUserApi.activate(userId);
      onSuccess();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      alert(error.response?.data?.message || "Failed to activate user");
    } finally {
      setActionLoading(null);
    }
  };

  return {
    actionLoading,
    handleDeactivate,
    handleActivate,
  };
}

interface UseUserModalsReturn {
  isAddModalOpen: boolean;
  isEditModalOpen: boolean;
  selectedUser: AdminUser | null;
  openAddModal: () => void;
  closeAddModal: () => void;
  openEditModal: (user: AdminUser) => void;
  closeEditModal: () => void;
}

/**
 * Manages modal states for user management
 */
export function useUserModals(): UseUserModalsReturn {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);

  return {
    isAddModalOpen,
    isEditModalOpen,
    selectedUser,
    openAddModal: () => setIsAddModalOpen(true),
    closeAddModal: () => setIsAddModalOpen(false),
    openEditModal: (user: AdminUser) => {
      setSelectedUser(user);
      setIsEditModalOpen(true);
    },
    closeEditModal: () => {
      setIsEditModalOpen(false);
      setSelectedUser(null);
    },
  };
}
