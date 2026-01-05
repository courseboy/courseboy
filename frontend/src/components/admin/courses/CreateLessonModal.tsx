"use client";

import { useState } from "react";
import { adminCourseApi } from "@/lib/api";
import { Spinner } from "@/components/ui/spinner";

interface CreateLessonModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  courseId: number;
  categoryId: number;
}

// Process video URL - supports YouTube and Google Drive
function processVideoUrl(url: string): string | null {
  if (!url) return null;

  const trimmedUrl = url.trim();

  // Check if it's a YouTube URL
  if (trimmedUrl.includes("youtube.com") || trimmedUrl.includes("youtu.be")) {
    // YouTube URLs are stored as-is, will be processed by VideoPlayer
    return trimmedUrl;
  }

  // Check if it's a Google Drive URL
  if (trimmedUrl.includes("drive.google.com")) {
    const patterns = [
      /\/file\/d\/([a-zA-Z0-9_-]+)/,
      /[?&]id=([a-zA-Z0-9_-]+)/,
      /\/d\/([a-zA-Z0-9_-]+)/,
    ];

    for (const pattern of patterns) {
      const match = trimmedUrl.match(pattern);
      if (match) {
        return `https://drive.google.com/file/d/${match[1]}/preview`;
      }
    }

    // If no pattern matches but looks like a file ID
    if (/^[a-zA-Z0-9_-]{20,}$/.test(trimmedUrl)) {
      return `https://drive.google.com/file/d/${trimmedUrl}/preview`;
    }
  }

  // Return as-is for direct video URLs
  return trimmedUrl;
}

// Detect video type for validation feedback
function detectVideoType(url: string): "youtube" | "drive" | "other" | null {
  if (!url) return null;
  if (url.includes("youtube.com") || url.includes("youtu.be")) return "youtube";
  if (url.includes("drive.google.com")) return "drive";
  return "other";
}

export function CreateLessonModal({
  isOpen,
  onClose,
  onSuccess,
  courseId,
  categoryId,
}: CreateLessonModalProps) {
  const [title, setTitle] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [durationMinutes, setDurationMinutes] = useState("");
  const [durationSeconds, setDurationSeconds] = useState("");
  const [isFreePreview, setIsFreePreview] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      setError("Lesson title is required");
      return;
    }

    // Process video URL
    let processedVideoUrl: string | undefined;
    if (videoUrl.trim()) {
      processedVideoUrl = processVideoUrl(videoUrl.trim()) || undefined;
      if (!processedVideoUrl) {
        setError(
          "Invalid video URL. Please use a valid YouTube or Google Drive link."
        );
        return;
      }
    }

    // Calculate duration in seconds
    const mins = parseInt(durationMinutes) || 0;
    const secs = parseInt(durationSeconds) || 0;
    const totalSeconds = mins * 60 + secs;

    try {
      setLoading(true);
      setError(null);
      await adminCourseApi.createLesson(courseId, categoryId, {
        title: title.trim(),
        videoUrl: processedVideoUrl,
        durationSeconds: totalSeconds > 0 ? totalSeconds : undefined,
        isFreePreview,
      });
      // Reset form
      setTitle("");
      setVideoUrl("");
      setDurationMinutes("");
      setDurationSeconds("");
      setIsFreePreview(false);
      onSuccess();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || "Failed to create lesson");
    } finally {
      setLoading(false);
    }
  };

  // Detect video type for UI feedback
  const videoType = detectVideoType(videoUrl);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-200">
          <h3 className="text-xl font-bold text-[#1F2933]">Add Lesson</h3>
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

          {/* Lesson Title */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-[#1F2933]">
              Lesson Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter lesson title"
              className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3A7BD5]/20 focus:border-[#3A7BD5] transition-colors"
              autoFocus
            />
          </div>

          {/* Video URL */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-[#1F2933]">
              Video URL
            </label>
            <input
              type="text"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="YouTube or Google Drive URL"
              className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3A7BD5]/20 focus:border-[#3A7BD5] transition-colors"
            />
            <p className="text-xs text-[#6B7280]">
              Supports YouTube (recommended) or Google Drive links
            </p>
            {videoUrl && videoType && (
              <div className="mt-2 p-2 bg-slate-50 rounded-lg text-xs">
                {videoType === "youtube" ? (
                  <div className="flex items-center gap-2 text-green-600">
                    <span className="material-symbols-outlined text-[16px]">
                      check_circle
                    </span>
                    <span>YouTube video detected ✓</span>
                  </div>
                ) : videoType === "drive" ? (
                  <div className="flex items-center gap-2 text-blue-600">
                    <span className="material-symbols-outlined text-[16px]">
                      check_circle
                    </span>
                    <span>Google Drive video detected</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-amber-600">
                    <span className="material-symbols-outlined text-[16px]">
                      info
                    </span>
                    <span>Direct video URL</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Duration */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-[#1F2933]">
              Duration
            </label>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(e.target.value)}
                  placeholder="0"
                  min="0"
                  className="w-16 px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3A7BD5]/20 focus:border-[#3A7BD5] transition-colors text-center"
                />
                <span className="text-sm text-[#6B7280]">min</span>
              </div>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  value={durationSeconds}
                  onChange={(e) => setDurationSeconds(e.target.value)}
                  placeholder="0"
                  min="0"
                  max="59"
                  className="w-16 px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3A7BD5]/20 focus:border-[#3A7BD5] transition-colors text-center"
                />
                <span className="text-sm text-[#6B7280]">sec</span>
              </div>
            </div>
          </div>

          {/* Free Preview */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsFreePreview(!isFreePreview)}
              className={`relative w-11 h-6 rounded-full transition-colors ${
                isFreePreview ? "bg-[#F4A261]" : "bg-slate-200"
              }`}
            >
              <span
                className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                  isFreePreview ? "translate-x-5" : ""
                }`}
              />
            </button>
            <div>
              <span className="text-sm text-[#1F2933]">Free Preview</span>
              <p className="text-xs text-[#6B7280]">
                Allow non-enrolled users to preview this lesson
              </p>
            </div>
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
                  Creating...
                </>
              ) : (
                "Add Lesson"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
