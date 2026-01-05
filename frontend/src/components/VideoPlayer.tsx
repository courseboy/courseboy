"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { lessonApi } from "@/lib/api";
import { useAuthStore } from "@/lib/store/auth";

interface VideoPlayerProps {
  lessonId: number;
  videoUrl: string;
  videoDuration?: number; // Duration in seconds (from database)
  initialProgress?: number;
  initialCompleted?: boolean;
  onProgressUpdate?: (progress: number, isCompleted: boolean) => void;
}

export default function VideoPlayer({
  lessonId,
  videoUrl,
  videoDuration = 0,
  initialProgress = 0,
  initialCompleted = false,
  onProgressUpdate,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(initialProgress);
  const [duration, setDuration] = useState(videoDuration);
  const [isCompleted, setIsCompleted] = useState(initialCompleted);
  const lastSavedTime = useRef(initialProgress);
  const saveTimeout = useRef<NodeJS.Timeout>();
  const watchTimerRef = useRef<NodeJS.Timeout>();
  const hasAutoCompleted = useRef(initialCompleted);
  const { isAuthenticated } = useAuthStore();

  // Check if it's a YouTube URL
  const isYouTube =
    videoUrl.includes("youtube.com") || videoUrl.includes("youtu.be");

  // Check if it's a Google Drive URL
  const isGoogleDrive = videoUrl.includes("drive.google.com");

  // Convert YouTube URL to embed format
  const getYouTubeEmbedUrl = (url: string) => {
    // Extract video ID from various YouTube URL formats
    const patterns = [
      /youtube\.com\/watch\?v=([^&]+)/,
      /youtube\.com\/embed\/([^?]+)/,
      /youtu\.be\/([^?]+)/,
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) {
        return `https://www.youtube.com/embed/${match[1]}?enablejsapi=1&origin=${window.location.origin}`;
      }
    }

    return url;
  };

  // Convert Google Drive URL to embeddable format
  const getEmbedUrl = (url: string) => {
    // Handle various Google Drive URL formats
    const patterns = [
      /drive\.google\.com\/file\/d\/([^\/]+)/,
      /drive\.google\.com\/open\?id=([^&]+)/,
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) {
        return `https://drive.google.com/file/d/${match[1]}/preview`;
      }
    }

    return url; // Return original if no pattern matches
  };

  // Throttled save function - saves every 5 seconds of watch time
  const saveProgress = useCallback(
    async (watchedSeconds: number, completed: boolean = false) => {
      // Only save progress if user is authenticated
      if (!isAuthenticated) {
        console.log("User not authenticated, skipping progress save");
        return;
      }

      // Only save if progress changed significantly (more than 3 seconds difference)
      if (!completed && Math.abs(watchedSeconds - lastSavedTime.current) < 3) {
        return;
      }

      try {
        console.log(
          `Saving progress: ${Math.floor(
            watchedSeconds
          )}s, completed: ${completed}`
        );
        await lessonApi.updateProgress(lessonId, {
          watchedSeconds: Math.floor(watchedSeconds),
          isCompleted: completed,
        });
        lastSavedTime.current = watchedSeconds;
        onProgressUpdate?.(watchedSeconds, completed);
        console.log("Progress saved successfully");
      } catch (err: unknown) {
        const error = err as {
          response?: { data?: unknown; status?: number };
          message?: string;
        };
        console.error("Failed to save progress:", err);
        console.error("Error details:", error.response?.data || error.message);

        // If it's a 401 error, the user needs to log in again
        if (error.response?.status === 401) {
          setError(
            "Session expired. Please refresh the page and log in again."
          );
        }
      }
    },
    [lessonId, isAuthenticated, onProgressUpdate]
  );

  // Google Drive: Timer-based progress tracking
  useEffect(() => {
    if (!isGoogleDrive || !isAuthenticated || isCompleted) return;

    // Start a timer when iframe loads
    const startTime = Date.now();
    const savedProgress = initialProgress;

    // Update progress every 10 seconds while watching
    watchTimerRef.current = setInterval(() => {
      const elapsedSeconds = Math.floor((Date.now() - startTime) / 1000);
      const totalWatched = savedProgress + elapsedSeconds;
      setCurrentTime(totalWatched);

      // Auto-complete if watched 90% of video duration
      if (
        !hasAutoCompleted.current &&
        videoDuration > 0 &&
        totalWatched / videoDuration >= 0.9
      ) {
        hasAutoCompleted.current = true;
        setIsCompleted(true);
        console.log("Auto-completing: User watched 90% of Google Drive video");
        saveProgress(totalWatched, true);
      } else {
        // Save progress periodically
        saveProgress(totalWatched);
      }
    }, 10000); // Update every 10 seconds

    return () => {
      if (watchTimerRef.current) {
        clearInterval(watchTimerRef.current);
      }
      // Save final progress on unmount
      const elapsedSeconds = Math.floor((Date.now() - startTime) / 1000);
      const totalWatched = savedProgress + elapsedSeconds;
      if (totalWatched > lastSavedTime.current) {
        saveProgress(totalWatched);
      }
    };
  }, [
    isGoogleDrive,
    isAuthenticated,
    isCompleted,
    videoDuration,
    initialProgress,
    saveProgress,
  ]);

  // HTML5 Video: Event-based progress tracking
  useEffect(() => {
    // Only for HTML5 videos, not Google Drive or YouTube iframes
    if (isGoogleDrive || isYouTube) return;

    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      const current = video.currentTime;
      const videoDuration = video.duration;
      setCurrentTime(current);

      // Check if user has watched 90% of the video - auto-complete
      if (
        !hasAutoCompleted.current &&
        videoDuration > 0 &&
        current / videoDuration >= 0.9
      ) {
        hasAutoCompleted.current = true;
        console.log("Auto-completing: User watched 90% of video");
        saveProgress(current, true);
        return; // Don't save regular progress, we just saved with completion
      }

      // Clear existing timeout
      if (saveTimeout.current) {
        clearTimeout(saveTimeout.current);
      }

      // Debounce save - wait 2 seconds after last time update
      saveTimeout.current = setTimeout(() => {
        saveProgress(current);
      }, 2000);
    };

    const handleLoadedMetadata = () => {
      setDuration(video.duration);
      setIsLoading(false);

      // Resume from saved position
      if (initialProgress > 0) {
        video.currentTime = initialProgress;

        // If already completed 90%+, mark as auto-completed to prevent re-triggering
        if (video.duration > 0 && initialProgress / video.duration >= 0.9) {
          hasAutoCompleted.current = true;
        }
      }
    };

    const handleEnded = () => {
      // Mark as completed when video ends
      if (!hasAutoCompleted.current) {
        hasAutoCompleted.current = true;
        console.log("Auto-completing: Video ended");
      }
      saveProgress(video.duration, true);
    };

    const handleError = () => {
      setError("Failed to load video. Please try again later.");
      setIsLoading(false);
    };

    const handlePause = () => {
      // Save immediately on pause
      saveProgress(video.currentTime);
    };

    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("loadedmetadata", handleLoadedMetadata);
    video.addEventListener("ended", handleEnded);
    video.addEventListener("error", handleError);
    video.addEventListener("pause", handlePause);

    return () => {
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
      video.removeEventListener("ended", handleEnded);
      video.removeEventListener("error", handleError);
      video.removeEventListener("pause", handlePause);

      // Save progress on unmount
      if (saveTimeout.current) {
        clearTimeout(saveTimeout.current);
      }
      saveProgress(video.currentTime);
    };
  }, [saveProgress, initialProgress, isGoogleDrive, isYouTube]);

  // Calculate progress percentage
  const progressPercentage =
    duration > 0 ? Math.min((currentTime / duration) * 100, 100) : 0;

  // Handle manual mark as complete for Google Drive videos
  const handleMarkComplete = async () => {
    if (!isAuthenticated) return;
    hasAutoCompleted.current = true;
    setIsCompleted(true);
    await saveProgress(currentTime, true);
  };

  if (error) {
    return (
      <div className="w-full aspect-video bg-gray-900 rounded-lg flex items-center justify-center">
        <div className="text-center text-white px-4">
          <p className="text-xl mb-2">⚠️</p>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {isYouTube ? (
        // YouTube iframe embed
        <div className="relative w-full">
          <div className="aspect-video bg-gray-900 rounded-lg overflow-hidden">
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center z-10">
                <div className="text-white">Loading video...</div>
              </div>
            )}
            <iframe
              src={getYouTubeEmbedUrl(videoUrl)}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              onLoad={() => setIsLoading(false)}
            />
          </div>

          {/* Progress tracking for YouTube */}
          <div className="mt-3 space-y-3">
            {/* Progress bar */}
            {duration > 0 && (
              <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${
                    isCompleted ? "bg-green-500" : "bg-blue-600"
                  }`}
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            )}

            {/* Status and action */}
            <div className="flex items-center justify-between">
              {isCompleted ? (
                <span className="flex items-center gap-2 text-green-600 font-medium">
                  <span className="material-symbols-outlined text-lg">
                    check_circle
                  </span>
                  Lesson Completed
                </span>
              ) : (
                <span className="text-sm text-gray-500">
                  {duration > 0
                    ? `Watch to auto-complete (${Math.round(
                        progressPercentage
                      )}% watched)`
                    : "Tracking watch time..."}
                </span>
              )}

              {!isCompleted && isAuthenticated && (
                <button
                  onClick={handleMarkComplete}
                  className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
                >
                  <span className="material-symbols-outlined text-lg">
                    task_alt
                  </span>
                  Mark as Complete
                </button>
              )}
            </div>
          </div>
        </div>
      ) : isGoogleDrive ? (
        // Google Drive iframe embed with timer-based tracking
        <div className="relative w-full">
          <div className="aspect-video bg-gray-900 rounded-lg overflow-hidden">
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center z-10">
                <div className="text-white">Loading video...</div>
              </div>
            )}
            <iframe
              src={getEmbedUrl(videoUrl)}
              className="w-full h-full"
              allow="autoplay; encrypted-media"
              allowFullScreen
              onLoad={() => setIsLoading(false)}
            />
          </div>

          {/* Progress tracking for Google Drive */}
          <div className="mt-3 space-y-3">
            {/* Progress bar */}
            {duration > 0 && (
              <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${
                    isCompleted ? "bg-green-500" : "bg-blue-600"
                  }`}
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            )}

            {/* Status and action */}
            <div className="flex items-center justify-between">
              {isCompleted ? (
                <span className="flex items-center gap-2 text-green-600 font-medium">
                  <span className="material-symbols-outlined text-lg">
                    check_circle
                  </span>
                  Lesson Completed
                </span>
              ) : (
                <span className="text-sm text-gray-500">
                  {duration > 0
                    ? `Watch to auto-complete (${Math.round(
                        progressPercentage
                      )}% watched)`
                    : "Tracking watch time..."}
                </span>
              )}

              {!isCompleted && isAuthenticated && (
                <button
                  onClick={handleMarkComplete}
                  className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
                >
                  <span className="material-symbols-outlined text-lg">
                    task_alt
                  </span>
                  Mark as Complete
                </button>
              )}
            </div>
          </div>
        </div>
      ) : (
        // Standard HTML5 video for direct video URLs
        <div className="relative w-full">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-900 rounded-lg">
              <div className="text-white">Loading video...</div>
            </div>
          )}
          <video
            ref={videoRef}
            className="w-full aspect-video bg-black rounded-lg"
            controls
            controlsList="nodownload"
          >
            <source src={videoUrl} type="video/mp4" />
            Your browser does not support the video tag.
          </video>

          {/* Progress bar */}
          {duration > 0 && (
            <div className="mt-2 w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <div
                className="bg-blue-600 h-full transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
