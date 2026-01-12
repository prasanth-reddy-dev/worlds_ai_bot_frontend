import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "axios";
import { BACKEND_URL } from "../../../config/constant";

function Recordings() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.user);
  const [recording, setRecording] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasAccess, setHasAccess] = useState(false);
  const [currentVideo, setCurrentVideo] = useState(null);

  // Video player state
  const playerRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(100);
  const [isMuted, setIsMuted] = useState(false);
  const [isTheaterMode, setIsTheaterMode] = useState(false);
  const [showBlackScreen, setShowBlackScreen] = useState(true);
  const [countdown, setCountdown] = useState(0); // Countdown timer
  const [isEnding, setIsEnding] = useState(false); // Track if video is ending
  const [hasStartedPlaying, setHasStartedPlaying] = useState(false); // Track if play button was pressed
  const [isRecordingDetected, setIsRecordingDetected] = useState(false); // Track if recording detected
  const blackScreenTimerRef = useRef(null);
  const timeUpdateIntervalRef = useRef(null);
  const countdownIntervalRef = useRef(null);

  useEffect(() => {
    checkAccessAndFetchRecording();
  }, [id, user]);

  // Anti-recording protection
  useEffect(() => {
    const detectRecording = () => {
      // Detect screen sharing or recording (page loses focus)
      if (document.hidden || !document.hasFocus()) {
        setIsRecordingDetected(true);
      } else {
        setIsRecordingDetected(false);
      }
    };

    // Listen for visibility and focus changes
    document.addEventListener('visibilitychange', detectRecording);
    window.addEventListener('blur', () => setIsRecordingDetected(true));
    window.addEventListener('focus', () => setIsRecordingDetected(false));

    return () => {
      document.removeEventListener('visibilitychange', detectRecording);
      window.removeEventListener('blur', detectRecording);
      window.removeEventListener('focus', detectRecording);
    };
  }, []);

  useEffect(() => {
    // Load YouTube IFrame API
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
  }, []);

  useEffect(() => {
    if (currentVideo && window.YT) {
      // Stop current video if playing and reset states
      if (playerRef.current && playerRef.current.stopVideo) {
        playerRef.current.stopVideo();
      }
      setIsPlaying(false);
      setShowBlackScreen(true); // Show black screen when switching
      setCurrentTime(0); // Reset progress bar
      setCountdown(0); // Reset countdown to 0
      setIsEnding(false); // Reset ending state
      setHasStartedPlaying(false); // Reset play state for new video

      // Clear any existing timer
      if (blackScreenTimerRef.current) {
        clearTimeout(blackScreenTimerRef.current);
        blackScreenTimerRef.current = null;
      }

      // Clear countdown interval
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
        countdownIntervalRef.current = null;
      }

      initializePlayer();
    }

    // Cleanup on unmount
    return () => {
      if (blackScreenTimerRef.current) {
        clearTimeout(blackScreenTimerRef.current);
      }
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
    };
  }, [currentVideo]);

  const checkAccessAndFetchRecording = async () => {
    try {
      setLoading(true);
      setError(null);

      const userCourses = user?.courses || [];
      const purchasedCourse = userCourses.find(course => course.recordingsId === id);

      if (!purchasedCourse) {
        setHasAccess(false);
        setError("You haven't purchased this course yet.");
        setLoading(false);
        return;
      }

      if (purchasedCourse.recordingAccess === false) {
        setHasAccess(false);
        setError("Recording access has been disabled for this course. Please contact support.");
        setLoading(false);
        return;
      }

      const token = localStorage.getItem('token');
      const response = await axios.get(`${BACKEND_URL}/show-recordings/${id}`, {
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setRecording(response.data);
      setHasAccess(true);

      if (response.data.recordings && response.data.recordings.length > 0) {
        setCurrentVideo(response.data.recordings[0]);
      } else {
      }
    } catch (err) {
      setHasAccess(false);
      setError(err.response?.data?.message || "Failed to load recordings");
    } finally {
      setLoading(false);
    }
  };

  const getVideoId = (videoUrl) => {
    try {
      let videoId = '';
      if (videoUrl.includes('youtu.be/')) {
        videoId = videoUrl.split('youtu.be/')[1].split('?')[0];
      } else if (videoUrl.includes('youtube.com/watch')) {
        videoId = videoUrl.split('v=')[1]?.split('&')[0];
      } else if (videoUrl.includes('youtube.com/embed/')) {
        videoId = videoUrl.split('embed/')[1].split('?')[0];
      }
      return videoId;
    } catch {
      return null;
    }
  };

  const initializePlayer = () => {
    if (!currentVideo || !window.YT) return;

    // Destroy existing player
    if (playerRef.current) {
      playerRef.current.destroy();
    }

    const videoId = getVideoId(currentVideo.videoUrl);
    if (!videoId) return;

    playerRef.current = new window.YT.Player('youtube-player', {
      videoId: videoId,
      width: '100%',
      height: '100%',
      playerVars: {
        autoplay: 0,
        controls: 0, // Hide YouTube controls
        modestbranding: 1, // Minimal YouTube branding
        rel: 0, // Don't show related videos
        showinfo: 0, // Hide video info
        fs: 0, // Hide fullscreen button
        iv_load_policy: 3, // Hide annotations
        disablekb: 1, // Disable keyboard controls
        cc_load_policy: 0, // Hide closed captions
        playsinline: 1,
        enablejsapi: 1,
        origin: window.location.origin,
      },
      events: {
        onReady: onPlayerReady,
        onStateChange: onPlayerStateChange,
      },
    });
  };

  const onPlayerReady = (event) => {
    setDuration(event.target.getDuration());
    setVolume(event.target.getVolume());
    setCurrentTime(0); // Reset progress bar to start

    // Update time every second
    setInterval(() => {
      if (playerRef.current && playerRef.current.getCurrentTime) {
        const current = playerRef.current.getCurrentTime();
        const total = playerRef.current.getDuration();
        setCurrentTime(current);

        // Check if video is in last 7 seconds
        if (total && current > 0) {
          const remaining = Math.ceil(total - current);

          if (remaining <= 7 && remaining > 0 && playerRef.current.getPlayerState() === window.YT.PlayerState.PLAYING) {
            // Show countdown before video ends
            setShowBlackScreen(true);
            setCountdown(remaining);
            setIsEnding(true); // Mark as ending
          } else if (remaining <= 0) {
            // Video ended
            setShowBlackScreen(true);
            setCountdown(0);
            setIsEnding(true);
          }
        }
      }
    }, 1000);
  };

  const onPlayerStateChange = (event) => {
    setIsPlaying(event.data === window.YT.PlayerState.PLAYING);
  };

  // Custom controls
  const togglePlay = () => {
    if (!playerRef.current) return;

    if (isPlaying) {
      // Pausing - show black screen immediately
      playerRef.current.pauseVideo();
      setShowBlackScreen(true);
      setCountdown(0); // Reset countdown

      // Clear all timers
      if (blackScreenTimerRef.current) {
        clearTimeout(blackScreenTimerRef.current);
        blackScreenTimerRef.current = null;
      }
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
        countdownIntervalRef.current = null;
      }
    } else {
      // Playing - START VIDEO IMMEDIATELY but keep black screen with countdown
      playerRef.current.playVideo(); // ✅ Video starts playing NOW
      setHasStartedPlaying(true); // Mark that play button was pressed

      // Show countdown on black screen (5 seconds)
      setCountdown(5);
      setIsEnding(false); // Mark as starting, not ending
      let count = 5;

      // Countdown every second
      countdownIntervalRef.current = setInterval(() => {
        count--;
        setCountdown(count);

        if (count <= 0) {
          // Countdown finished - hide black screen
          clearInterval(countdownIntervalRef.current);
          countdownIntervalRef.current = null;
          setShowBlackScreen(false);
        }
      }, 1000);
    }
  };

  const skip = (seconds) => {
    if (!playerRef.current) return;
    const newTime = currentTime + seconds;
    playerRef.current.seekTo(newTime, true);
  };

  const handleSeek = (e) => {
    if (!playerRef.current) return;

    // Check if play button has been pressed
    if (!hasStartedPlaying) {
      alert('Please press the PLAY button first to start the video!');
      return; // Don't allow seeking
    }

    const seekBar = e.currentTarget;
    const clickPosition = (e.clientX - seekBar.getBoundingClientRect().left) / seekBar.offsetWidth;
    const seekTime = clickPosition * duration;
    playerRef.current.seekTo(seekTime, true);
  };

  const handleVolumeChange = (e) => {
    if (!playerRef.current) return;
    const newVolume = parseInt(e.target.value);
    setVolume(newVolume);
    playerRef.current.setVolume(newVolume);
    if (newVolume > 0 && isMuted) {
      setIsMuted(false);
      playerRef.current.unMute();
    }
  };

  const toggleMute = () => {
    if (!playerRef.current) return;
    if (isMuted) {
      playerRef.current.unMute();
      setIsMuted(false);
    } else {
      playerRef.current.mute();
      setIsMuted(true);
    }
  };

  const toggleTheaterMode = () => {
    setIsTheaterMode(!isTheaterMode);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 to-slate-900 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400 text-lg">Loading your course...</p>
        </div>
      </div>
    );
  }

  if (!hasAccess || error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 to-slate-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-800/30 backdrop-blur-sm rounded-xl border border-red-500/30 p-8 text-center">
          <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="bi bi-lock-fill text-4xl text-red-400"></i>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Access Denied</h2>
          <p className="text-slate-400 mb-6">
            {error || "This course is currently unavailable."}
          </p>
          <button
            onClick={() => navigate("/student-dashboard/profile/lectures")}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium rounded-lg transition-all"
          >
            Back to My Courses
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 to-slate-900 px-4 md:px-6 pt-4 pb-6">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate("/student-dashboard/profile/lectures")}
          className="text-slate-400 hover:text-white flex items-center gap-2 mb-4 transition-colors"
        >
          <i className="bi bi-arrow-left"></i> Back to My Courses
        </button>
        <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
          Course Recordings - Batch {recording?.batchNumber}
        </h1>
        <p className="text-slate-400">
          {recording?.recordings?.length || 0} lectures available
        </p>
      </div>

      <div className={`grid grid-cols-1 gap-6 transition-all duration-300 ${isTheaterMode ? 'lg:grid-cols-1' : 'lg:grid-cols-3'
        }`}>
        {/* Video Player with Custom Controls */}
        <div className={`transition-all duration-300 ${isTheaterMode ? 'lg:col-span-1' : 'lg:col-span-2'
          }`}>
          <div className="bg-slate-800/30 backdrop-blur-sm rounded-xl border border-slate-700/50 overflow-hidden">
            {currentVideo ? (
              <>
                {/* Video Container with Overlay */}
                <div className={`relative bg-black transition-all duration-300 ${isTheaterMode
                  ? 'h-[calc(100vh-200px)]'
                  : 'aspect-video'
                  }`}>
                  <div id="youtube-player" className="absolute inset-0 w-full h-full"></div>
                  {/* Transparent overlay to prevent clicks */}
                  <div
                    className="absolute inset-0 z-10 cursor-pointer"
                    onClick={togglePlay}
                    onContextMenu={(e) => e.preventDefault()}
                  ></div>

                  {/* Anti-recording black screen */}
                  {isRecordingDetected && (
                    <div className="absolute inset-0 z-40 bg-black flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-6xl mb-6">🚫</div>
                        <p className="text-red-500 text-3xl font-bold mb-4">Recording Detected!</p>
                        <p className="text-white text-xl mb-2">Screen recording and sharing are prohibited</p>
                        <p className="text-slate-400 text-lg">Please stop recording to continue watching</p>
                      </div>
                    </div>
                  )}

                  {/* Full black cover with countdown */}
                  {showBlackScreen && (
                    <div className="absolute inset-0 z-30 bg-black flex items-center justify-center">
                      {countdown > 0 ? (
                        // Countdown mode
                        <div className="text-center">
                          <div className="text-9xl font-bold text-white mb-4 animate-pulse">
                            {countdown}
                          </div>
                          <p className="text-slate-400 text-lg">
                            {isEnding ? 'Video ending...' : 'Video starting...'}
                          </p>
                        </div>
                      ) : (
                        // Ready to play mode - No icon, just text
                        <div className="text-center">
                          <p className="text-white text-2xl font-bold mb-3">Click PLAY Button</p>
                          <p className="text-slate-400 text-lg">to start watching the video</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Physical overlays to block YouTube UI */}
                  {/* Top overlay - blocks channel name, logo */}
                  <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-black/90 via-black/60 to-transparent z-20 pointer-events-none"></div>

                  {/* Bottom overlay - blocks YouTube branding */}
                  <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black/90 via-black/60 to-transparent z-20 pointer-events-none"></div>

                  {/* Top-right corner overlay - blocks Watch Later, etc */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-black/90 to-transparent z-20 pointer-events-none"></div>
                </div>

                {/* CSS to hide YouTube branding and UI */}
                <style>{`
                  #youtube-player iframe {
                    pointer-events: none !important;
                  }
                  .ytp-title,
                  .ytp-chrome-top,
                  .ytp-show-cards-title,
                  .ytp-watermark,
                  .ytp-pause-overlay,
                  .ytp-info-panel-detail,
                  .ytp-gradient-top,
                  .ytp-gradient-bottom,
                  .ytp-chrome-top-buttons,
                  .ytp-cards-teaser,
                  .ytp-endscreen-content {
                    display: none !important;
                    opacity: 0 !important;
                    visibility: hidden !important;
                  }
                `}</style>

                {/* Custom Controls */}
                <div className="bg-slate-900/50 p-4">
                  {/* Progress Bar */}
                  <div
                    className="w-full h-2 bg-slate-700 rounded-full mb-4 cursor-pointer"
                    onClick={handleSeek}
                  >
                    <div
                      className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all"
                      style={{ width: `${(currentTime / duration) * 100}%` }}
                    ></div>
                  </div>

                  {/* Controls Row */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {/* Play/Pause */}
                      <button
                        onClick={togglePlay}
                        className="w-10 h-10 bg-purple-600 hover:bg-purple-700 rounded-full flex items-center justify-center transition-colors"
                      >
                        <i className={`bi ${isPlaying ? 'bi-pause-fill' : 'bi-play-fill'} text-white text-lg`}></i>
                      </button>

                      {/* Skip Backward */}
                      <button
                        onClick={() => skip(-10)}
                        className="w-8 h-8 bg-slate-700 hover:bg-slate-600 rounded-full flex items-center justify-center transition-colors"
                      >
                        <i className="bi bi-skip-backward-fill text-white text-sm"></i>
                      </button>

                      {/* Skip Forward */}
                      <button
                        onClick={() => skip(10)}
                        className="w-8 h-8 bg-slate-700 hover:bg-slate-600 rounded-full flex items-center justify-center transition-colors"
                      >
                        <i className="bi bi-skip-forward-fill text-white text-sm"></i>
                      </button>

                      {/* Time */}
                      <span className="text-slate-300 text-sm">
                        {formatTime(currentTime)} / {formatTime(duration)}
                      </span>
                    </div>

                    <div className="flex items-center gap-4">
                      {/* Volume */}
                      <div className="flex items-center gap-2">
                        <button onClick={toggleMute} className="text-slate-300 hover:text-white">
                          <i className={`bi ${isMuted ? 'bi-volume-mute-fill' : volume > 50 ? 'bi-volume-up-fill' : 'bi-volume-down-fill'}`}></i>
                        </button>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={volume}
                          onChange={handleVolumeChange}
                          className="w-20 accent-purple-500"
                        />
                      </div>

                      {/* Theater Mode / Fullscreen */}
                      <button
                        onClick={toggleTheaterMode}
                        className="text-slate-300 hover:text-white transition-colors"
                        title={isTheaterMode ? "Exit Theater Mode" : "Theater Mode"}
                      >
                        <i className={`bi ${isTheaterMode ? 'bi-fullscreen-exit' : 'bi-arrows-fullscreen'}`}></i>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Video Info */}
                <div className="p-6 border-t border-slate-700/50">
                  <h2 className="text-xl font-bold text-white mb-2">{currentVideo.videoTitle}</h2>
                  <div className="flex items-center gap-4 text-sm text-slate-400">
                    <span className="flex items-center gap-2">
                      <i className="bi bi-play-circle-fill"></i> Video Lecture
                    </span>
                    <span className="flex items-center gap-2">
                      <i className="bi bi-shield-lock-fill"></i> Protected Content
                    </span>
                  </div>
                </div>
              </>
            ) : (
              <div className="aspect-video bg-slate-900/50 flex items-center justify-center">
                <div className="text-center">
                  <i className="bi bi-play-circle text-6xl text-slate-600 mb-4"></i>
                  <p className="text-slate-400">Select a video to start learning</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Video List - Hidden in Theater Mode */}
        {!isTheaterMode && (
          <div className="lg:col-span-1">
            <div className="bg-slate-800/30 backdrop-blur-sm rounded-xl border border-slate-700/50 p-4 max-h-[600px] overflow-y-auto">
              <h3 className="text-lg font-bold text-white mb-4 sticky top-0 bg-slate-800/90 -mx-4 px-4 py-2 backdrop-blur-sm">
                Course Content
              </h3>
              <div className="space-y-2">
                {recording?.recordings?.map((video, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentVideo(video)}
                    className={`w-full text-left p-4 rounded-lg transition-all ${currentVideo?.videoUrl === video.videoUrl
                      ? "bg-gradient-to-r from-purple-600 to-pink-600 shadow-lg"
                      : "bg-slate-700/30 hover:bg-slate-700/50"
                      }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${currentVideo?.videoUrl === video.videoUrl
                        ? "bg-white/20"
                        : "bg-slate-600/50"
                        }`}>
                        <span className="text-sm font-bold text-white">{index + 1}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className={`font-medium text-sm mb-1 truncate ${currentVideo?.videoUrl === video.videoUrl
                          ? "text-white"
                          : "text-slate-300"
                          }`}>
                          {video.videoTitle}
                        </h4>
                        <div className="flex items-center gap-2">
                          <i className={`bi bi-youtube text-xs ${currentVideo?.videoUrl === video.videoUrl
                            ? "text-white/70"
                            : "text-slate-500"
                            }`}></i>
                          <span className={`text-xs ${currentVideo?.videoUrl === video.videoUrl
                            ? "text-white/70"
                            : "text-slate-500"
                            }`}>
                            Video Lecture
                          </span>
                        </div>
                      </div>
                      {currentVideo?.videoUrl === video.videoUrl && (
                        <i className="bi bi-play-circle-fill text-white"></i>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Recordings;