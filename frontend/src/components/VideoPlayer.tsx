"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { lessonApi } from "@/lib/api";
import { useAuthStore } from "@/lib/store/auth";
import type { YTPlayer, YTEvent } from "@/types/youtube";

interface VideoPlayerProps {
  lessonId: number;
  videoUrl: string;
  videoDuration?: number;
  initialProgress?: number;
  initialCompleted?: boolean;
  onProgressUpdate?: (progress: number, isCompleted: boolean) => void;
}

// Separate YouTube Player Component to isolate DOM manipulation
function YouTubePlayer({
  videoId,
  lessonId,
  initialProgress,
  initialCompleted,
  onTimeUpdate,
  onDurationChange,
  onComplete,
  onLoaded,
}: {
  videoId: string;
  lessonId: number;
  initialProgress: number;
  initialCompleted: boolean;
  onTimeUpdate: (time: number) => void;
  onDurationChange: (duration: number) => void;
  onComplete: () => void;
  onLoaded: () => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<YTPlayer | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout>();
  const hasAutoCompleted = useRef(initialCompleted);

  useEffect(() => {
    if (!containerRef.current) return;

    let isMounted = true;
    let checkYTInterval: NodeJS.Timeout | null = null;
    const containerElement = containerRef.current;

    const initPlayer = () => {
      if (!isMounted || !containerElement) return;

      // Create a new div for the player
      const playerDiv = document.createElement("div");
      playerDiv.id = `yt-player-${lessonId}-${Date.now()}`;
      containerElement.innerHTML = "";
      containerElement.appendChild(playerDiv);

      const startTime = initialProgress > 0 ? Math.floor(initialProgress) : 0;

      playerRef.current = new window.YT.Player(playerDiv.id, {
        videoId: videoId,
        width: "100%",
        height: "100%",
        playerVars: {
          autoplay: 0,
          controls: 1,
          modestbranding: 1,
          rel: 0,
          start: startTime,
        },
        events: {
          onReady: (event: YTEvent) => {
            if (!isMounted) return;
            onLoaded();
            const player = event.target;
            const duration = player.getDuration();
            onDurationChange(duration);

            if (initialProgress > 0) {
              player.seekTo(initialProgress, true);
            }

            if (
              initialCompleted ||
              (duration > 0 && initialProgress / duration >= 0.9)
            ) {
              hasAutoCompleted.current = true;
            }
          },
          onStateChange: (event: YTEvent) => {
            if (!isMounted) return;
            const player = event.target;

            // PLAYING
            if (event.data === 1) {
              startTracking();
            }
            // PAUSED
            else if (event.data === 2) {
              stopTracking();
              onTimeUpdate(player.getCurrentTime());
            }
            // ENDED
            else if (event.data === 0) {
              stopTracking();
              if (!hasAutoCompleted.current) {
                hasAutoCompleted.current = true;
                onComplete();
              }
            }
          },
        },
      });
    };

    const startTracking = () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }

      progressIntervalRef.current = setInterval(() => {
        const player = playerRef.current;
        if (!player || !player.getCurrentTime) return;

        const current = player.getCurrentTime();
        const duration = player.getDuration();
        onTimeUpdate(current);

        if (
          !hasAutoCompleted.current &&
          duration > 0 &&
          current / duration >= 0.9
        ) {
          hasAutoCompleted.current = true;
          onComplete();
        }
      }, 2000);
    };

    const stopTracking = () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };

    const loadYouTubeAPI = () => {
      if (window.YT && window.YT.Player) {
        initPlayer();
        return;
      }

      if (document.querySelector('script[src*="youtube.com/iframe_api"]')) {
        checkYTInterval = setInterval(() => {
          if (window.YT && window.YT.Player) {
            if (checkYTInterval) clearInterval(checkYTInterval);
            initPlayer();
          }
        }, 100);
        return;
      }

      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      tag.async = true;
      document.head.appendChild(tag);

      window.onYouTubeIframeAPIReady = () => {
        initPlayer();
      };
    };

    loadYouTubeAPI();

    return () => {
      isMounted = false;
      if (checkYTInterval) clearInterval(checkYTInterval);
      stopTracking();

      if (playerRef.current) {
        try {
          if (typeof playerRef.current.destroy === "function") {
            playerRef.current.destroy();
          }
        } catch {
          // Ignore errors during cleanup
        }
        playerRef.current = null;
      }

      // Clean up container if it still exists
      if (containerElement) {
        containerElement.innerHTML = "";
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videoId, lessonId]);

  return (
    <div
      ref={containerRef}
      className="w-full h-full"
      style={{ minHeight: "100%" }}
    />
  );
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
  const hasAutoCompleted = useRef(initialCompleted);
  const { isAuthenticated } = useAuthStore();

  // Reset state when lessonId changes
  useEffect(() => {
    setIsLoading(true);
    setError(null);
    setCurrentTime(initialProgress);
    setDuration(videoDuration);
    setIsCompleted(initialCompleted);
    lastSavedTime.current = initialProgress;
    hasAutoCompleted.current = initialCompleted;
  }, [lessonId, initialProgress, initialCompleted, videoDuration]);

  // Check URL types
  const isYouTube =
    videoUrl.includes("youtube.com") || videoUrl.includes("youtu.be");

  // Extract YouTube video ID
  const getYouTubeVideoId = (url: string): string | null => {
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
  };

  const youtubeVideoId = isYouTube ? getYouTubeVideoId(videoUrl) : null;

  // Save progress function
  const saveProgress = useCallback(
    async (watchedSeconds: number, completed: boolean = false) => {
      if (!isAuthenticated) return;
      if (!completed && Math.abs(watchedSeconds - lastSavedTime.current) < 3)
        return;

      try {
        await lessonApi.updateProgress(lessonId, {
          watchedSeconds: Math.floor(watchedSeconds),
          isCompleted: completed,
        });
        lastSavedTime.current = watchedSeconds;
        onProgressUpdate?.(watchedSeconds, completed);
      } catch (err: unknown) {
        const error = err as { response?: { status?: number } };
        if (error.response?.status === 401) {
          setError("Session expired. Please refresh the page.");
        }
      }
    },
    [lessonId, isAuthenticated, onProgressUpdate]
  );

  // Handle time update from YouTube player
  const handleTimeUpdate = useCallback(
    (time: number) => {
      setCurrentTime(time);
      saveProgress(time);
    },
    [saveProgress]
  );

  // Handle duration change
  const handleDurationChange = useCallback((newDuration: number) => {
    setDuration(newDuration);
  }, []);

  // Handle video complete
  const handleComplete = useCallback(() => {
    setIsCompleted(true);
    saveProgress(duration, true);
  }, [duration, saveProgress]);

  // Handle loaded
  const handleLoaded = useCallback(() => {
    setIsLoading(false);
  }, []);

  // Manual mark complete
  const handleMarkComplete = async () => {
    if (!isAuthenticated) return;
    hasAutoCompleted.current = true;
    setIsCompleted(true);
    await saveProgress(currentTime, true);
  };

  // HTML5 Video tracking
  useEffect(() => {
    if (isYouTube) return;

    const video = videoRef.current;
    if (!video) return;

    const handleVideoTimeUpdate = () => {
      const current = video.currentTime;
      const dur = video.duration;
      setCurrentTime(current);

      if (!hasAutoCompleted.current && dur > 0 && current / dur >= 0.9) {
        hasAutoCompleted.current = true;
        setIsCompleted(true);
        saveProgress(current, true);
        return;
      }

      if (saveTimeout.current) clearTimeout(saveTimeout.current);
      saveTimeout.current = setTimeout(() => saveProgress(current), 2000);
    };

    const handleLoadedMetadata = () => {
      setDuration(video.duration);
      setIsLoading(false);
      if (initialProgress > 0) {
        video.currentTime = initialProgress;
        if (video.duration > 0 && initialProgress / video.duration >= 0.9) {
          hasAutoCompleted.current = true;
        }
      }
    };

    const handleEnded = () => {
      if (!hasAutoCompleted.current) {
        hasAutoCompleted.current = true;
        setIsCompleted(true);
      }
      saveProgress(video.duration, true);
    };

    const handleError = () => {
      setError("Failed to load video.");
      setIsLoading(false);
    };

    const handlePause = () => saveProgress(video.currentTime);

    video.addEventListener("timeupdate", handleVideoTimeUpdate);
    video.addEventListener("loadedmetadata", handleLoadedMetadata);
    video.addEventListener("ended", handleEnded);
    video.addEventListener("error", handleError);
    video.addEventListener("pause", handlePause);

    return () => {
      video.removeEventListener("timeupdate", handleVideoTimeUpdate);
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
      video.removeEventListener("ended", handleEnded);
      video.removeEventListener("error", handleError);
      video.removeEventListener("pause", handlePause);
      if (saveTimeout.current) clearTimeout(saveTimeout.current);
    };
  }, [saveProgress, initialProgress, isYouTube]);

  // Progress percentage
  const progressPercentage =
    duration > 0 ? Math.min((currentTime / duration) * 100, 100) : 0;

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
      {isYouTube && youtubeVideoId ? (
        <div className="relative w-full">
          <div className="aspect-video bg-gray-900 rounded-lg overflow-hidden">
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center z-10">
                <div className="text-white">Loading YouTube video...</div>
              </div>
            )}
            <YouTubePlayer
              key={`youtube-${lessonId}`}
              videoId={youtubeVideoId}
              lessonId={lessonId}
              initialProgress={initialProgress}
              initialCompleted={initialCompleted}
              onTimeUpdate={handleTimeUpdate}
              onDurationChange={handleDurationChange}
              onComplete={handleComplete}
              onLoaded={handleLoaded}
            />
          </div>

          <div className="mt-3 space-y-3">
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

            <div className="flex items-center justify-between">
              <div className="flex flex-col gap-1">
                {isCompleted ? (
                  <span className="flex items-center gap-2 text-green-600 font-medium">
                    <span className="material-symbols-outlined text-lg">
                      check_circle
                    </span>
                    Lesson Completed
                  </span>
                ) : (
                  <>
                    <span className="text-sm text-gray-700">
                      Progress: {Math.round(progressPercentage)}%
                    </span>
                    <span className="text-xs text-gray-500">
                      {Math.floor(currentTime / 60)}:
                      {String(Math.floor(currentTime % 60)).padStart(2, "0")} /{" "}
                      {Math.floor(duration / 60)}:
                      {String(Math.floor(duration % 60)).padStart(2, "0")}
                    </span>
                  </>
                )}
              </div>

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
