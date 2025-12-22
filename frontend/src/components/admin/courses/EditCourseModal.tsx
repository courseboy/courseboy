"use client";

import { useState, useEffect } from "react";
import { adminCourseApi } from "@/lib/api";
import { AdminCourse, Privilege } from "@/types";
import { Spinner } from "@/components/ui/spinner";

interface EditCourseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  course: AdminCourse;
  privileges: Privilege[];
}

export function EditCourseModal({
  isOpen,
  onClose,
  onSuccess,
  course,
  privileges,
}: EditCourseModalProps) {
  const [name, setName] = useState(course.name || "");
  const [description, setDescription] = useState(course.description || "");
  const [thumbnailUrl, setThumbnailUrl] = useState(course.coverImg || "");
  const [selectedPrivilegeId, setSelectedPrivilegeId] = useState<number | null>(
    course.requiredPrivilegeId
  );
  const [isPublished, setIsPublished] = useState(course.isPublished);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Update form when course changes
  useEffect(() => {
    setName(course.name || "");
    setDescription(course.description || "");
    setThumbnailUrl(course.coverImg || "");
    setSelectedPrivilegeId(course.requiredPrivilegeId);
    setIsPublished(course.isPublished);
  }, [course]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setError("Course name is required");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await adminCourseApi.update(course.id, {
        name: name.trim(),
        description: description.trim() || undefined,
        coverImg: thumbnailUrl.trim() || undefined,
        requiredPrivilegeId: selectedPrivilegeId || undefined,
        isPublished,
      });
      onSuccess();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || "Failed to update course");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-200">
          <h3 className="text-xl font-bold text-[#1F2933]">Edit Course</h3>
          <button
            onClick={onClose}
            className="p-2 text-[#6B7280] hover:text-[#1F2933] hover:bg-slate-100 rounded-lg transition-colors"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Course Name */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-[#1F2933]">
              Course Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter course name"
              className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3A7BD5]/20 focus:border-[#3A7BD5] transition-colors"
            />
          </div>

          {/* Description */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-[#1F2933]">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter course description"
              rows={3}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3A7BD5]/20 focus:border-[#3A7BD5] transition-colors resize-none"
            />
          </div>

          {/* Cover Image URL */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-[#1F2933]">
              Cover Image URL
            </label>
            <input
              type="url"
              value={thumbnailUrl}
              onChange={(e) => setThumbnailUrl(e.target.value)}
              placeholder="https://example.com/image.jpg"
              className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3A7BD5]/20 focus:border-[#3A7BD5] transition-colors"
            />
          </div>

          {/* Required Privilege */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-[#1F2933]">
              Required Privilege
            </label>
            <p className="text-xs text-[#6B7280]">
              Users need this privilege to access the course
            </p>
            <select
              value={selectedPrivilegeId || ""}
              onChange={(e) =>
                setSelectedPrivilegeId(
                  e.target.value ? Number(e.target.value) : null
                )
              }
              className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3A7BD5]/20 focus:border-[#3A7BD5] transition-colors bg-white"
            >
              <option value="">No restriction (visible to all)</option>
              {privileges.map((privilege) => (
                <option key={privilege.id} value={privilege.id}>
                  {privilege.name}
                </option>
              ))}
            </select>
          </div>

          {/* Publish Status */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsPublished(!isPublished)}
              className={`relative w-11 h-6 rounded-full transition-colors ${
                isPublished ? "bg-[#7BC8A4]" : "bg-slate-200"
              }`}
            >
              <span
                className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                  isPublished ? "translate-x-5" : ""
                }`}
              />
            </button>
            <span className="text-sm text-[#1F2933]">
              {isPublished ? "Published" : "Draft"}
            </span>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 mt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-[#6B7280] hover:text-[#1F2933] hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 px-5 py-2 bg-[#3A7BD5] hover:bg-[#2c62b0] text-white rounded-lg text-sm font-semibold shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
          </div>
        </form>
      </div>
    </div>
  );
}
