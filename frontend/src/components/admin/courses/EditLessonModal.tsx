"use client";

import { useState, useEffect } from "react";
import { adminCourseApi } from "@/lib/api";
import { AdminLesson } from "@/types";
import { Spinner } from "@/components/ui/spinner";
import type { YTEvent } from "@/types/youtube";

interface EditLessonModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  lesson: AdminLesson;
}

// Extract YouTube video ID
function getYouTubeVideoId(url: string): string | null {
  if (!url) return null;
  const patterns = [
    /youtube\.com\/watch\?v=([^&]+)/,
    /youtube\.com\/embed\/([^?]+)/,
    /youtu\.be\/([^?]+)/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

// Fetch YouTube video duration using IFrame API
function fetchYouTubeDuration(videoId: string): Promise<number | null> {
  return new Promise((resolve) => {
    // Load YouTube IFrame API if not already loaded
    const loadYTAPI = () => {
      if (window.YT && window.YT.Player) {
        createPlayer();
        return;
      }

      if (document.querySelector('script[src*="youtube.com/iframe_api"]')) {
        const checkInterval = setInterval(() => {
          if (window.YT && window.YT.Player) {
            clearInterval(checkInterval);
            createPlayer();
          }
        }, 100);
        setTimeout(() => {
          clearInterval(checkInterval);
          resolve(null);
        }, 5000);
        return;
      }

      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      tag.async = true;
      document.head.appendChild(tag);

      window.onYouTubeIframeAPIReady = () => {
        createPlayer();
      };

      setTimeout(() => resolve(null), 5000);
    };

    const createPlayer = () => {
      const container = document.createElement("div");
      container.style.display = "none";
      document.body.appendChild(container);

      const playerDiv = document.createElement("div");
      playerDiv.id = `duration-check-${Date.now()}`;
      container.appendChild(playerDiv);

      try {
        const player = new window.YT.Player(playerDiv.id, {
          videoId: videoId,
          width: "1",
          height: "1",
          playerVars: {
            autoplay: 0,
            controls: 0,
          },
          events: {
            onReady: (event: YTEvent) => {
              const duration = event.target.getDuration();
              event.target.destroy();
              document.body.removeChild(container);
              resolve(duration > 0 ? Math.floor(duration) : null);
            },
            onError: () => {
              try {
                document.body.removeChild(container);
              } catch {
                // Ignore errors
              }
              resolve(null);
            },
          },
        });

        setTimeout(() => {
          try {
            player.destroy();
            document.body.removeChild(container);
          } catch {
            // Ignore errors
          }
          resolve(null);
        }, 5000);
      } catch {
        try {
          document.body.removeChild(container);
        } catch {
          // Ignore errors
        }
        resolve(null);
      }
    };

    loadYTAPI();
  });
}

// Validate YouTube URL
function isValidYouTubeUrl(url: string): boolean {
  if (!url) return false;
  return url.includes("youtube.com") || url.includes("youtu.be");
}

export function EditLessonModal({
  isOpen,
  onClose,
  onSuccess,
  lesson,
}: EditLessonModalProps) {
  const [title, setTitle] = useState(lesson.title);
  const [videoUrl, setVideoUrl] = useState(lesson.videoUrl || "");
  const [isFreePreview, setIsFreePreview] = useState(lesson.isFreePreview);
  const [loading, setLoading] = useState(false);
  const [fetchingDuration, setFetchingDuration] = useState(false);
  const [videoDuration, setVideoDuration] = useState<number | null>(
    lesson.durationSeconds || null
  );
  const [error, setError] = useState<string | null>(null);

  // Update form when lesson changes
  useEffect(() => {
    setTitle(lesson.title);
    setVideoUrl(lesson.videoUrl || "");
    setVideoDuration(lesson.durationSeconds || null);
    setIsFreePreview(lesson.isFreePreview);
  }, [lesson]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      setError("Lesson title is required");
      return;
    }

    if (!videoUrl.trim()) {
      setError("YouTube video URL is required");
      return;
    }

    // Validate YouTube URL
    if (!isValidYouTubeUrl(videoUrl.trim())) {
      setError("Invalid YouTube URL. Please use a valid YouTube link.");
      return;
    }

    // Ensure duration is detected
    if (!videoDuration) {
      setError("Please wait for video duration to be detected.");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await adminCourseApi.updateLesson(lesson.id, {
        title: title.trim(),
        videoUrl: videoUrl.trim(),
        durationSeconds: videoDuration || undefined,
        isFreePreview,
      });
      onSuccess();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || "Failed to update lesson");
    } finally {
      setLoading(false);
    }
  };

  // Check if URL is valid YouTube
  const videoId = getYouTubeVideoId(videoUrl);
  const isValidYouTube = videoId !== null;

  // Auto-fetch duration when URL changes
  const handleVideoUrlChange = async (url: string) => {
    setVideoUrl(url);
    setVideoDuration(null);

    const id = getYouTubeVideoId(url);
    if (id) {
      setFetchingDuration(true);
      const duration = await fetchYouTubeDuration(id);
      setVideoDuration(duration);
      setFetchingDuration(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-200">
          <h3 className="text-xl font-bold text-[#1F2933]">Edit Lesson</h3>
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
            />
          </div>

          {/* Video URL */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-[#1F2933]">
              YouTube Video URL <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={videoUrl}
              onChange={(e) => handleVideoUrlChange(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
              className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3A7BD5]/20 focus:border-[#3A7BD5] transition-colors"
            />
            <p className="text-xs text-[#6B7280]">
              Paste a YouTube video URL. Duration will be auto-detected.
            </p>
            {videoUrl && (
              <div className="mt-2 p-2 bg-slate-50 rounded-lg text-xs">
                {isValidYouTube ? (
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2 text-green-600">
                      <span className="material-symbols-outlined text-[16px]">
                        check_circle
                      </span>
                      <span>Valid YouTube URL ✓</span>
                    </div>
                    {fetchingDuration && (
                      <div className="flex items-center gap-2 text-blue-600">
                        <span className="material-symbols-outlined text-[16px] animate-spin">
                          progress_activity
                        </span>
                        <span>Detecting video duration...</span>
                      </div>
                    )}
                    {!fetchingDuration && videoDuration !== null && (
                      <div className="flex items-center gap-2 text-green-600">
                        <span className="material-symbols-outlined text-[16px]">
                          schedule
                        </span>
                        <span>
                          Duration: {Math.floor(videoDuration / 60)}:
                          {String(videoDuration % 60).padStart(2, "0")} min
                        </span>
                      </div>
                    )}
                    {!fetchingDuration && videoDuration === null && (
                      <div className="flex items-center gap-2 text-amber-600">
                        <span className="material-symbols-outlined text-[16px]">
                          warning
                        </span>
                        <span>
                          Failed to detect duration. Please try again.
                        </span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-red-600">
                    <span className="material-symbols-outlined text-[16px]">
                      error
                    </span>
                    <span>Invalid YouTube URL</span>
                  </div>
                )}
              </div>
            )}
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
              disabled={loading || fetchingDuration || !videoDuration}
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
