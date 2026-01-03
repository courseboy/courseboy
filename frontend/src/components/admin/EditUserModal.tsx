"use client";

import { useState, useEffect } from "react";
import { adminUserApi } from "@/lib/api";
import { AdminUser, Privilege } from "@/types";
import { Spinner } from "@/components/ui/spinner";

interface EditUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  user: AdminUser;
  privileges: Privilege[];
}

export function EditUserModal({
  isOpen,
  onClose,
  onSuccess,
  user,
  privileges,
}: EditUserModalProps) {
  const [email, setEmail] = useState(user.email);
  const [username, setUsername] = useState(user.username || "");
  const [selectedPrivileges, setSelectedPrivileges] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize selected privileges when user changes
  useEffect(() => {
    setEmail(user.email);
    setUsername(user.username || "");

    // Map privilege names to IDs
    const privilegeIds = privileges
      .filter((p) => user.privileges.includes(p.name))
      .map((p) => p.id);
    setSelectedPrivileges(privilegeIds);
  }, [user, privileges]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email) {
      setError("Email is required");
      return;
    }

    try {
      setLoading(true);

      // Update user details
      await adminUserApi.update(user.id, {
        email,
        username: username || undefined,
      });

      // Update privileges
      await adminUserApi.updatePrivileges(user.id, selectedPrivileges);

      onSuccess();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || "Failed to update user");
    } finally {
      setLoading(false);
    }
  };

  const handlePrivilegeToggle = (privilegeId: number) => {
    setSelectedPrivileges((prev) =>
      prev.includes(privilegeId)
        ? prev.filter((id) => id !== privilegeId)
        : [...prev, privilegeId]
    );
  };

  const handleClose = () => {
    setError(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={handleClose}></div>

      {/* Modal */}
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6 flex flex-col gap-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-[#1F2933]">Edit User</h3>
            <button
              onClick={handleClose}
              className="text-[#6B7280] hover:text-[#1F2933]"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <label className="flex flex-col gap-1">
              <span className="text-sm font-bold text-[#1F2933]">
                Email Address <span className="text-red-500">*</span>
              </span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border-slate-200 text-sm focus:border-[#3A7BD5] focus:ring-[#3A7BD5] py-3"
                placeholder="user@example.com"
                required
              />
            </label>

            <label className="flex flex-col gap-1">
              <span className="text-sm font-bold text-[#1F2933]">Username</span>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full rounded-lg border-slate-200 text-sm focus:border-[#3A7BD5] focus:ring-[#3A7BD5] py-3"
                placeholder="John Doe"
              />
            </label>

            <div className="flex flex-col gap-2">
              <span className="text-sm font-bold text-[#1F2933]">
                Privileges
              </span>
              <div className="flex flex-col gap-2 mt-1">
                {privileges.map((privilege) => (
                  <label
                    key={privilege.id}
                    className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedPrivileges.includes(privilege.id)
                        ? "border-[#3A7BD5] bg-[#3A7BD5]/5"
                        : "border-slate-200 hover:border-[#3A7BD5]"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedPrivileges.includes(privilege.id)}
                      onChange={() => handlePrivilegeToggle(privilege.id)}
                      className="text-[#3A7BD5] focus:ring-[#3A7BD5] rounded"
                    />
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">
                        {privilege.name}
                      </span>
                      {privilege.description && (
                        <span className="text-xs text-[#6B7280]">
                          {privilege.description}
                        </span>
                      )}
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* User Info */}
            <div className="bg-slate-50 rounded-lg p-4 mt-2">
              <p className="text-xs text-[#6B7280]">
                <span className="font-medium">Created:</span>{" "}
                {new Date(user.createdAt).toLocaleDateString()}
              </p>
              {user.lastLogin && (
                <p className="text-xs text-[#6B7280] mt-1">
                  <span className="font-medium">Last Login:</span>{" "}
                  {new Date(user.lastLogin).toLocaleDateString()}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-4 bg-[#3A7BD5] hover:bg-blue-600 text-white py-3 rounded-lg font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Spinner size="sm" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
