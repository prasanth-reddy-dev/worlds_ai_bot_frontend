import React, { useState, useEffect, useRef } from "react";
import Editor from "@monaco-editor/react";
import axios from "axios";
import { BACKEND_URL } from '../../../config/constant';
import APIService from '../../services/api';

const App = () => {
  const [code, setCode] = useState("# Write your Python code here");
  const [language, setLanguage] = useState("python");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [showSidebar, setShowSidebar] = useState(false);
  const [pyodideReady, setPyodideReady] = useState(false);
  const [pyodide, setPyodide] = useState(null);
  const [alert, setAlert] = useState(null);
  const [progress, setProgress] = useState(100);

  // Video modal state
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [currentVideoUrl, setCurrentVideoUrl] = useState("");
  const playerRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(100);
  const [isMuted, setIsMuted] = useState(false);
  const [showBlackScreen, setShowBlackScreen] = useState(true);
  const [countdown, setCountdown] = useState(0);
  const [isEnding, setIsEnding] = useState(false);
  const [hasStartedPlaying, setHasStartedPlaying] = useState(false);
  const countdownIntervalRef = useRef(null);

  const languages = [
    { value: "javascript", label: "JavaScript 🔽" },
    { value: "python", label: "Python 🔽" },
    { value: "html", label: "HTML 🔽" },
    { value: "css", label: "CSS 🔽" },
    { value: "java", label: "Java 🔽" },
    { value: "cpp", label: "C++ 🔽" },
  ];

  const showAlert = (message, type) => {
    setAlert({ message, type });
    setProgress(100);
  };

  const dismissAlert = () => {
    setAlert(null);
    setProgress(100);
  };

  useEffect(() => {
    if (alert) {
      const duration = 3000;
      const interval = 50;
      const decrement = (interval / duration) * 100;

      const timer = setInterval(() => {
        setProgress((prev) => {
          const newProgress = prev - decrement;
          if (newProgress <= 0) {
            dismissAlert();
            clearInterval(timer);
            return 0;
          }
          return newProgress;
        });
      }, interval);

      return () => clearInterval(timer);
    }
  }, [alert]);

  useEffect(() => {
    const initializePyodide = async () => {
      try {
        showAlert("Initializing Python interpreter...", "info");
        if (typeof window.loadPyodide !== "function") {
          throw new Error("Pyodide script not loaded properly");
        }

        const pyodideInstance = await window.loadPyodide({
          indexURL: "https://cdn.jsdelivr.net/pyodide/v0.23.4/full/",
        });
        await pyodideInstance.loadPackage(["numpy", "pandas"]);

        setPyodide(pyodideInstance);
        setPyodideReady(true);
        showAlert("Python interpreter ready!", "success");
        setOutput("Here is your output...");
      } catch (error) {
        showAlert(`Failed to load Python interpreter: ${error.message}`, "error");
        setOutput("");
        setPyodideReady(false);
      }
    };

    if (!window.loadPyodide) {
      const script = document.createElement("script");
      script.src = "https://cdn.jsdelivr.net/pyodide/v0.23.4/full/pyodide.js";
      script.async = true;
      script.onload = () => initializePyodide();
      script.onerror = () => {
        showAlert(
          "Failed to load Pyodide script. Check your internet connection.",
          "error"
        );
        setOutput("");
        setPyodideReady(false);
      };
      document.body.appendChild(script);
    } else {
      initializePyodide();
    }

    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      // Use APIService for authenticated requests
      const response = await APIService.tests.getAll();
      // Backend returns { message, data } format
      const data = response.data?.data || response.data || [];

      if (!Array.isArray(data)) {
        setQuestions([]);
        setSelectedQuestion(null);
        showAlert("No questions available.", "info");
        return;
      }

      const formattedQuestions = data.map((item, index) => ({
        id: item._id || index + 1,
        question: `${index + 1}. ${item.question}`,
        youtube_url: item.youtube_url || "",
        testCases: (item.test || []).map((testCase) => ({
          input: testCase.input,
          output: testCase.output,
        })),
      }));
      setQuestions(formattedQuestions);
      if (formattedQuestions.length > 0) {
        setSelectedQuestion(formattedQuestions[0]);
        showAlert(`${formattedQuestions.length} questions loaded!`, "success");
      } else {
        showAlert("No questions available.", "info");
      }
    } catch (error) {
      showAlert(
        error.response?.data?.message || "Failed to fetch questions.",
        "error"
      );
      setQuestions([]);
      setSelectedQuestion(null);
    }
  };

  const convertReactStyleToHTML = (htmlCode) => {
    try {
      return htmlCode.replace(/style={{([^}]+)}}/g, (match, styleContent) => {
        const styles = styleContent
          .replace(/["']/g, "")
          .replace(/,\s*/g, ";")
          .replace(/([a-zA-Z]+)\s*:/g, "$1:")
          .replace(/([a-z])([A-Z])/g, "$1-$2")
          .toLowerCase();
        return `style="${styles}"`;
      });
    } catch (error) {
      showAlert("Failed to process HTML styles.", "error");
      return htmlCode;
    }
  };

  // Video player functions
  const getVideoId = (videoUrl) => {
    try {
      let videoId = '';
      if (videoUrl?.includes('youtu.be/')) {
        videoId = videoUrl.split('youtu.be/')[1].split('?')[0];
      } else if (videoUrl?.includes('youtube.com/watch')) {
        videoId = videoUrl.split('v=')[1]?.split('&')[0];
      } else if (videoUrl?.includes('youtube.com/embed/')) {
        videoId = videoUrl.split('embed/')[1].split('?')[0];
      }
      return videoId;
    } catch {
      return null;
    }
  };

  const openVideoModal = (youtubeUrl) => {
    setCurrentVideoUrl(youtubeUrl);
    setShowVideoModal(true);
    setShowBlackScreen(true);
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    setCountdown(0);
    setIsEnding(false);
    setHasStartedPlaying(false);

    // Load YouTube API if not loaded
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    }
  };

  const closeVideoModal = () => {
    if (playerRef.current && playerRef.current.stopVideo) {
      playerRef.current.stopVideo();
    }
    if (playerRef.current && playerRef.current.destroy) {
      playerRef.current.destroy();
    }
    playerRef.current = null;
    setShowVideoModal(false);
    setCurrentVideoUrl("");
    setIsPlaying(false);
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
    }
  };

  useEffect(() => {
    if (showVideoModal && currentVideoUrl) {
      // Wait for YouTube API to be ready
      const checkAndInitialize = () => {
        if (window.YT && window.YT.Player) {
          setTimeout(() => initializePlayer(), 100);
        } else {
          // Retry after 500ms
          setTimeout(checkAndInitialize, 500);
        }
      };
      checkAndInitialize();
    }
  }, [showVideoModal, currentVideoUrl]);

  const initializePlayer = () => {
    if (!currentVideoUrl || !window.YT) return;

    if (playerRef.current && playerRef.current.destroy) {
      playerRef.current.destroy();
    }

    const videoId = getVideoId(currentVideoUrl);
    if (!videoId) return;

    playerRef.current = new window.YT.Player('solution-video-player', {
      videoId: videoId,
      width: '100%',
      height: '100%',
      playerVars: {
        autoplay: 0,
        controls: 0,
        modestbranding: 1,
        rel: 0,
        showinfo: 0,
        fs: 0,
        iv_load_policy: 3,
        disablekb: 1,
        cc_load_policy: 0,
        playsinline: 1,
        enablejsapi: 1,
        origin: window.location.origin,
      },
      events: {
        onReady: (event) => {
          setDuration(event.target.getDuration());
          setVolume(event.target.getVolume());
          setCurrentTime(0);

          setInterval(() => {
            if (playerRef.current && playerRef.current.getCurrentTime) {
              const current = playerRef.current.getCurrentTime();
              const total = playerRef.current.getDuration();
              setCurrentTime(current);

              if (total && current > 0) {
                const remaining = Math.ceil(total - current);
                if (remaining <= 7 && remaining > 0 && playerRef.current.getPlayerState() === window.YT.PlayerState.PLAYING) {
                  setShowBlackScreen(true);
                  setCountdown(remaining);
                  setIsEnding(true);
                } else if (remaining <= 0) {
                  setShowBlackScreen(true);
                  setCountdown(0);
                  setIsEnding(true);
                }
              }
            }
          }, 1000);
        },
        onStateChange: (event) => {
          setIsPlaying(event.data === window.YT.PlayerState.PLAYING);
        },
      },
    });
  };

  const toggleVideoPlay = () => {
    if (!playerRef.current) return;

    if (isPlaying) {
      playerRef.current.pauseVideo();
      setShowBlackScreen(true);
      setCountdown(0);
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
        countdownIntervalRef.current = null;
      }
    } else {
      playerRef.current.playVideo();
      setHasStartedPlaying(true);
      setCountdown(5);
      setIsEnding(false);
      let count = 5;

      countdownIntervalRef.current = setInterval(() => {
        count--;
        setCountdown(count);
        if (count <= 0) {
          clearInterval(countdownIntervalRef.current);
          countdownIntervalRef.current = null;
          setShowBlackScreen(false);
        }
      }, 1000);
    }
  };

  const skipVideo = (seconds) => {
    if (!playerRef.current) return;
    const newTime = currentTime + seconds;
    playerRef.current.seekTo(newTime, true);
  };

  const handleVideoSeek = (e) => {
    if (!playerRef.current || !hasStartedPlaying) return;
    const seekBar = e.currentTarget;
    const clickPosition = (e.clientX - seekBar.getBoundingClientRect().left) / seekBar.offsetWidth;
    const seekTime = clickPosition * duration;
    playerRef.current.seekTo(seekTime, true);
  };

  const handleVideoVolumeChange = (e) => {
    if (!playerRef.current) return;
    const newVolume = parseInt(e.target.value);
    setVolume(newVolume);
    playerRef.current.setVolume(newVolume);
    if (newVolume > 0 && isMuted) {
      setIsMuted(false);
      playerRef.current.unMute();
    }
  };

  const toggleVideoMute = () => {
    if (!playerRef.current) return;
    if (isMuted) {
      playerRef.current.unMute();
      setIsMuted(false);
    } else {
      playerRef.current.mute();
      setIsMuted(true);
    }
  };

  const formatVideoTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const executeCode = async () => {
    setLoading(true);
    setOutput("");

    try {
      switch (language) {
        case "javascript":
          let consoleOutput = "";

          // Mock console.log
          const mockConsoleLog = (...args) => {
            const formattedArgs = args.map((arg) => {
              if (typeof arg === "object" && arg !== null) {
                return JSON.stringify(arg, null, 2);
              }
              return String(arg);
            });
            consoleOutput += formattedArgs.join(" ") + "\n";
          };

          // Mock console.error
          const mockConsoleError = (...args) => {
            consoleOutput += "Error: " + args.join(" ") + "\n";
          };

          try {
            showAlert(
              "Warning: JavaScript execution may pose security risks.",
              "warning"
            );
            const asyncCode = `
              return new Promise((resolve) => {
                ${code}
                setTimeout(resolve, 1000);
              });
            `;
            const executionFunction = new Function(asyncCode);
            await executionFunction();
            setOutput(
              consoleOutput || "Code executed successfully (no console output)"
            );
          } catch (error) {
            setOutput(consoleOutput || `Error: ${error.message}`);
            showAlert(`JavaScript Error: ${error.message}`, "error");
          }
          break;

        case "html":
          const convertedCode = convertReactStyleToHTML(code);
          const htmlContent = `
            <!DOCTYPE html>
            <html>
              <head>
                <meta charset="UTF-8">
              </head>
              <body>
                ${convertedCode}
              </body>
            </html>
          `;
          setOutput(htmlContent);
          break;

        case "css":
          const cssPreview = `
            <!DOCTYPE html>
            <html>
              <head>
                <meta charset="UTF-8">
                <style>${code}</style>
              </head>
              <body>
                <div class="preview-content">
                  <h1>Sample Heading</h1>
                  <p>This is a sample paragraph to preview your CSS.</p>
                  <button>Sample Button</button>
                </div>
              </body>
            </html>
          `;
          setOutput(cssPreview);
          break;

        case "python":
          if (!pyodideReady || !pyodide) {
            showAlert(
              "Python interpreter is not ready yet. Please wait or check your connection.",
              "error"
            );
            setOutput("");
          } else {
            try {
              pyodide.runPython(`
                import sys
                import io
                sys.stdout = io.StringIO()
              `);

              if (selectedQuestion?.testCases?.length > 0) {
                const inputs = selectedQuestion.testCases[0].input.split(",");
                let inputIndex = 0;
                pyodide.globals.set("input", () => {
                  return inputIndex < inputs.length ? inputs[inputIndex++] : "";
                });
              }

              await pyodide.runPythonAsync(code);
              const stdout = pyodide.runPython("sys.stdout.getvalue()");
              setOutput(stdout || "Code executed successfully (no output)");
            } catch (error) {
              showAlert(`Python Error: ${error.message}`, "error");
              setOutput("");
            }
          }
          break;

        case "java":
        case "cpp":
          let outputMessage = `Note: ${language} execution is not supported in this browser-based editor.\n`;
          outputMessage += `Your ${language} code:\n${code}\n\n`;
          if (selectedQuestion?.testCases?.length > 0) {
            const testResults = selectedQuestion.testCases
              .map(
                (testCase, index) =>
                  `Test Case ${index + 1}:\nInput: ${testCase.input
                  }\nExpected Output: ${testCase.output}`
              )
              .join("\n\n");
            outputMessage += `Available Test Cases:\n${testResults}`;
          } else {
            outputMessage += "No test cases available for this question.";
          }
          setOutput(outputMessage);
          break;

        default:
          showAlert("Language not supported for execution", "error");
          setOutput("");
      }
    } catch (error) {
      showAlert(`Error: ${error.message}`, "error");
      setOutput("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white overflow-hidden sm:pb-[0px] pb-[100px]">
      {/* Alert Component */}
      {alert && (
        <div
          className={`fixed top-24 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-300 ${alert.visible ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
        >
          <div
            className={`px-6 py-4 rounded-xl shadow-2xl backdrop-blur-md flex flex-col w-80 border ${alert.type === 'success'
              ? 'bg-emerald-600/90 border-emerald-400/30'
              : alert.type === 'info'
                ? 'bg-blue-600/90 border-blue-400/30'
                : alert.type === 'warning'
                  ? 'bg-amber-600/90 border-amber-400/30'
                  : 'bg-red-600/90 border-red-400/30'
              }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-medium">{alert.message}</span>
              <button
                onClick={dismissAlert}
                className="text-white/80 hover:text-white transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
            <div className="w-full h-1.5 mt-3 bg-white/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-white transition-all duration-100 ease-linear"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 p-4 shadow-2xl border-b border-white/10">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-xl">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"></path>
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold">Code Editor</h1>
              <p className="text-white/70 text-sm">Write, run & test your code</p>
            </div>
            {!pyodideReady && (
              <span className="text-sm font-normal bg-white/10 px-3 py-1.5 rounded-full flex items-center gap-2 ml-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span className="animate-pulse">Loading Python...</span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="bg-white/10 backdrop-blur-sm text-white px-4 py-2.5 pr-10 rounded-xl border border-white/20 focus:outline-none focus:ring-2 focus:ring-white/30 appearance-none cursor-pointer hover:bg-white/20 transition-colors"
              >
                {languages.map((lang) => (
                  <option key={lang.value} value={lang.value} className="bg-slate-800 text-white">
                    {lang.label.replace(' 🔽', '')}
                  </option>
                ))}
              </select>
              <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
              </svg>
            </div>

            <button
              onClick={executeCode}
              disabled={loading || (language === "python" && !pyodideReady)}
              className={`px-6 py-2.5 rounded-xl font-semibold flex items-center gap-2 transition-all ${loading
                ? 'bg-gray-500 cursor-not-allowed'
                : 'bg-white text-gray-900 hover:bg-gray-100 hover:scale-[1.02] active:scale-95 shadow-lg'
                }`}
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Running...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                  Run Code
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Sidebar Toggle */}
      <div className="p-4 md:hidden">
        <button
          onClick={() => setShowSidebar(!showSidebar)}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-3 rounded-lg shadow-lg hover:opacity-90 transition-all flex items-center justify-center gap-2"
        >
          {showSidebar ? (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
              Hide Questions
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
              </svg>
              Show Questions
            </>
          )}
        </button>
      </div>

      {/* Main Content */}
      <main className="flex flex-col md:flex-row h-[calc(100vh-112px)] max-w-7xl mx-auto">
        {/* Sidebar */}
        <div
          className={`fixed md:relative inset-y-0 left-0 w-80 bg-slate-900/95 backdrop-blur-xl rounded-r-2xl md:rounded-none overflow-y-auto p-4 transform transition-transform duration-300 ease-in-out z-50 ${showSidebar ? "translate-x-0" : "-translate-x-full"}
            } md:translate-x-0 md:border-r md:border-slate-700/50 shadow-2xl`}
        >
          <div className="flex justify-between items-center mb-6 p-3 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-xl border border-white/5">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-blue-500/20 rounded-lg">
                <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <h2 className="text-lg font-bold text-white">
                Coding Challenges
              </h2>
            </div>
            <button
              onClick={() => setShowSidebar(false)}
              className="md:hidden text-gray-400 hover:text-white p-2 rounded-lg hover:bg-white/10 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>

          {questions.length > 0 ? (
            <div className="space-y-3">
              {questions.map((question, idx) => (
                <div
                  key={question.id}
                  className={`p-4 rounded-xl cursor-pointer transition-all duration-200 ${selectedQuestion?.id === question.id
                    ? "bg-gradient-to-r from-blue-600/30 to-purple-600/30 border-l-4 border-blue-500 shadow-lg"
                    : "bg-slate-800/50 hover:bg-slate-800 border-l-4 border-transparent hover:border-slate-600"
                    }`}
                  onClick={() => {
                    setSelectedQuestion(question);
                    if (window.innerWidth < 768) setShowSidebar(false);
                  }}
                >
                  <div className="flex items-start gap-3">
                    <span className={`flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-sm font-bold ${selectedQuestion?.id === question.id
                      ? 'bg-blue-500 text-white'
                      : 'bg-slate-700 text-gray-400'
                      }`}>
                      {idx + 1}
                    </span>
                    <div className="flex-1">
                      <h3 className="font-medium text-white text-sm leading-snug">
                        {question.question.replace(/^\d+\.\s*/, '')}
                      </h3>
                      <div className="mt-3 space-y-1.5">
                        {question.testCases.slice(0, 1).map((testCase, index) => (
                          <div
                            key={index}
                            className="text-xs bg-slate-900/70 p-2 rounded-lg font-mono"
                          >
                            <p className="text-gray-400">Input: <span className="text-emerald-400">{testCase.input}</span></p>
                            <p className="text-gray-400">Output: <span className="text-amber-400">{testCase.output}</span></p>
                          </div>
                        ))}
                        {question.testCases.length > 1 && (
                          <p className="text-xs text-gray-500">+{question.testCases.length - 1} more test cases</p>
                        )}
                        {question.youtube_url && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              openVideoModal(question.youtube_url);
                            }}
                            className="flex items-center gap-2 mt-2 px-3 py-2 bg-gradient-to-r from-purple-600/20 to-pink-600/20 hover:from-purple-600/30 hover:to-pink-600/30 text-purple-400 rounded-lg text-xs transition-all border border-purple-500/30"
                          >
                            <i className="bi bi-play-circle-fill"></i>
                            Solution
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto bg-slate-800 rounded-2xl flex items-center justify-center mb-4">
                <svg className="h-8 w-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <p className="text-gray-400 font-medium">No questions available</p>
              <p className="text-gray-500 text-sm mt-1">Check back later for new challenges</p>
            </div>
          )}
        </div>

        {/* Editor and Output */}
        <div className="flex-1 flex flex-col p-4 overflow-hidden">
          {/* Editor */}
          <div className="flex-1 bg-gray-800 rounded-xl overflow-hidden shadow-xl border border-gray-700">
            <Editor
              height="100%"
              defaultLanguage={language}
              defaultValue={code}
              onChange={(value) => setCode(value)}
              theme="vs-dark"
              options={{
                fontSize: 14,
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                wordWrap: "on",
                padding: { top: 15, bottom: 15 },
                renderWhitespace: "selection",
                lineNumbersMinChars: 3,
              }}
            />
          </div>

          {/* Output */}
          <div className="mt-4 bg-gray-800 rounded-xl overflow-hidden shadow-xl border border-gray-700 flex flex-col h-[40vh]">
            <div className="bg-gray-700/50 p-3 flex justify-between items-center border-b border-gray-700">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                </svg>
                Output
              </h2>
              <button
                onClick={() => setOutput("")}
                className="text-sm bg-gray-600 hover:bg-gray-500 text-white px-3 py-1 rounded-lg transition-colors flex items-center gap-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                </svg>
                Clear
              </button>
            </div>

            <div className="flex-1 overflow-auto p-4 bg-gray-900/50">
              {loading ? (
                <div className="flex justify-center items-center h-full">
                  <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              ) : language === "html" || language === "css" ? (
                <iframe
                  srcDoc={output}
                  title="output"
                  sandbox="allow-scripts"
                  className="w-full h-full bg-white rounded-b-lg"
                />
              ) : (
                <pre className="whitespace-pre-wrap font-mono text-sm text-gray-200 overflow-auto h-full">
                  {output || <span className="text-gray-500">Run code to see output...</span>}
                </pre>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Video Solution Modal */}
      {showVideoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-4xl bg-slate-900 rounded-2xl overflow-hidden shadow-2xl border border-slate-700/50">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-700/50">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <i className="bi bi-play-circle-fill text-purple-400"></i>
                Video Solution
              </h3>
              <button
                onClick={closeVideoModal}
                className="w-8 h-8 bg-slate-700 hover:bg-slate-600 rounded-full flex items-center justify-center transition-colors"
              >
                <i className="bi bi-x-lg text-white"></i>
              </button>
            </div>

            {/* Video Container */}
            <div className="relative bg-black aspect-video">
              <div id="solution-video-player" className="absolute inset-0 w-full h-full"></div>

              {/* Transparent overlay to prevent clicks */}
              <div
                className="absolute inset-0 z-10 cursor-pointer"
                onClick={toggleVideoPlay}
                onContextMenu={(e) => e.preventDefault()}
              ></div>

              {/* Black screen with countdown */}
              {showBlackScreen && (
                <div className="absolute inset-0 z-30 bg-black flex items-center justify-center">
                  {countdown > 0 ? (
                    <div className="text-center">
                      <div className="text-9xl font-bold text-white mb-4 animate-pulse">
                        {countdown}
                      </div>
                      <p className="text-slate-400 text-lg">
                        {isEnding ? 'Video ending...' : 'Video starting...'}
                      </p>
                    </div>
                  ) : (
                    <div className="text-center">
                      <p className="text-white text-2xl font-bold mb-3">Click PLAY Button</p>
                      <p className="text-slate-400 text-lg">to start watching the solution</p>
                    </div>
                  )}
                </div>
              )}

              {/* Overlays to block YouTube UI */}
              <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-black/90 via-black/60 to-transparent z-20 pointer-events-none"></div>
              <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black/90 via-black/60 to-transparent z-20 pointer-events-none"></div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-black/90 to-transparent z-20 pointer-events-none"></div>
            </div>

            {/* CSS to hide YouTube branding */}
            <style>{`
              #solution-video-player iframe {
                pointer-events: none !important;
              }
              .ytp-title,
              .ytp-chrome-top,
              .ytp-show-cards-title,
              .ytp-watermark,
              .ytp-pause-overlay,
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
                onClick={handleVideoSeek}
              >
                <div
                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all"
                  style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
                ></div>
              </div>

              {/* Controls Row */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {/* Play/Pause */}
                  <button
                    onClick={toggleVideoPlay}
                    className="w-10 h-10 bg-purple-600 hover:bg-purple-700 rounded-full flex items-center justify-center transition-colors"
                  >
                    <i className={`bi ${isPlaying ? 'bi-pause-fill' : 'bi-play-fill'} text-white text-lg`}></i>
                  </button>

                  {/* Skip Backward */}
                  <button
                    onClick={() => skipVideo(-10)}
                    className="w-8 h-8 bg-slate-700 hover:bg-slate-600 rounded-full flex items-center justify-center transition-colors"
                  >
                    <i className="bi bi-skip-backward-fill text-white text-sm"></i>
                  </button>

                  {/* Skip Forward */}
                  <button
                    onClick={() => skipVideo(10)}
                    className="w-8 h-8 bg-slate-700 hover:bg-slate-600 rounded-full flex items-center justify-center transition-colors"
                  >
                    <i className="bi bi-skip-forward-fill text-white text-sm"></i>
                  </button>

                  {/* Time */}
                  <span className="text-slate-300 text-sm">
                    {formatVideoTime(currentTime)} / {formatVideoTime(duration)}
                  </span>
                </div>

                <div className="flex items-center gap-4">
                  {/* Volume */}
                  <div className="flex items-center gap-2">
                    <button onClick={toggleVideoMute} className="text-slate-300 hover:text-white">
                      <i className={`bi ${isMuted ? 'bi-volume-mute-fill' : volume > 50 ? 'bi-volume-up-fill' : 'bi-volume-down-fill'}`}></i>
                    </button>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={volume}
                      onChange={handleVideoVolumeChange}
                      className="w-20 accent-purple-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;