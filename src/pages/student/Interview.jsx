import React, { useState, useEffect, useRef } from "react";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { jsPDF } from "jspdf";
import axios from "axios";
import { BACKEND_URL } from "../../../config/constant";
import APIService from "../../services/api";

const Loader = () => (
  <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
    <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-600"></div>
    <p className="text-white mt-4">Generating Report...</p>
  </div>
);

const Interview = () => {
  const [conversation, setConversation] = useState([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [status, setStatus] = useState("Initializing...");
  const [selectedLanguage, setSelectedLanguage] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [webcamPermission, setWebcamPermission] = useState(false);
  const [micPermission, setMicPermission] = useState(false);
  const [countdown, setCountdown] = useState(null);
  const [responseCountdown, setResponseCountdown] = useState(null);
  const [showStopModal, setShowStopModal] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);
  const [showUserInfoModal, setShowUserInfoModal] = useState(false);
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [userName, setUserName] = useState("");
  const [userMobile, setUserMobile] = useState("");
  const [geminiApiKey, setGeminiApiKey] = useState("");
  const [correctAnswers, setCorrectAnswers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [topics, setTopics] = useState([]);
  const { transcript, resetTranscript, listening } = useSpeechRecognition();
  const videoRef = useRef(null);
  const utteranceRef = useRef(null);
  const chatBoxRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);

  // Ensure topics is always an array before filtering
  const safeTopics = Array.isArray(topics) ? topics : [];
  const filteredTopics = safeTopics.filter(topic => {
    const matchesSearch = topic.topic?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || topic.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  let genAI, model;
  if (geminiApiKey) {
    genAI = new GoogleGenerativeAI(geminiApiKey);
    model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  }

  useEffect(() => {
    const fetchTopics = async () => {
      try {
        // Use APIService for authenticated requests
        const response = await APIService.interviews.getAll();
        const data = response.data?.data || response.data || [];
        setTopics(Array.isArray(data) ? data : []);
      } catch (error) {
        setStatus("Failed to load interview questions.");
        setTopics([]);
      }
    };
    fetchTopics();
  }, []);

  useEffect(() => {
    if (
      webcamPermission &&
      micPermission &&
      selectedLanguage &&
      !showPermissionModal
    ) {
      const startVideo = async () => {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true,
          });
          mediaStreamRef.current = stream;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.onloadedmetadata = () => {
              videoRef.current
                .play()
            };
            setStatus("Video and audio feed active");
          }
        } catch (err) {
          setStatus(
            `Error: Webcam or microphone access denied - ${err.message}`
          );
        }
      };
      startVideo();
    }
  }, [webcamPermission, micPermission, selectedLanguage, showPermissionModal]);

  useEffect(() => {
    if (countdown !== null && countdown > 0) {
      const timer = setInterval(() => setCountdown((prev) => prev - 1), 1000);
      return () => clearInterval(timer);
    } else if (countdown === 0) {
      startInterview(selectedLanguage);
      setCountdown(null);
    }
  }, [countdown, selectedLanguage]);

  useEffect(() => {
    if (responseCountdown !== null && responseCountdown > 0) {
      const timer = setInterval(() => {
        setResponseCountdown((prev) => {
          const newCount = prev - 1;
          setConversation((prevConv) => {
            const updatedConv = [...prevConv];
            if (
              updatedConv[updatedConv.length - 1].speaker === "You" &&
              !updatedConv[updatedConv.length - 1].text
            ) {
              updatedConv[updatedConv.length - 1] = {
                speaker: "You",
                text: "",
                countdown: newCount,
              };
            }
            return updatedConv;
          });
          return newCount;
        });
      }, 1000);
      return () => clearInterval(timer);
    } else if (responseCountdown === 0) {
      setConversation((prev) => {
        const updatedConv = [...prev];
        if (
          updatedConv[updatedConv.length - 1].speaker === "You" &&
          !updatedConv[updatedConv.length - 1].text
        ) {
          updatedConv[updatedConv.length - 1] = { speaker: "You", text: "" };
        }
        return updatedConv;
      });
      setResponseCountdown(null);
    }
  }, [responseCountdown]);

  const stopMediaStreams = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => {
        track.stop();
        track.enabled = false;
      });
      mediaStreamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
      videoRef.current.pause();
    }
    SpeechRecognition.stopListening();
    setIsListening(false);
    setStatus("Media streams stopped");
  };

  const stopAllSpeech = () => {
    if (isSpeaking && utteranceRef.current) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      utteranceRef.current = null;
    }
  };

  // Enhanced AI validation with detailed scoring
  const validateAnswer = async (answer, question) => {
    if (!model) return { score: 0, feedback: "AI not available" };
    try {
      const prompt = `You are an expert technical interviewer. Evaluate this answer to the interview question.

Question: "${question}"
Candidate's Answer: "${answer}"

Provide a JSON response with:
1. "score": A number from 0-10 (10 being perfect)
2. "isCorrect": true if score >= 6, false otherwise
3. "feedback": A brief, encouraging feedback (1-2 sentences)
4. "improvement": One specific suggestion to improve

Respond ONLY with valid JSON, no markdown.`;

      const result = await model.generateContent(prompt);
      const response = await result.response.text();

      try {
        const parsed = JSON.parse(response.replace(/```json|```/g, '').trim());
        return {
          score: parsed.score || 0,
          isCorrect: parsed.isCorrect || false,
          feedback: parsed.feedback || "Good attempt!",
          improvement: parsed.improvement || ""
        };
      } catch {
        // Fallback to simple evaluation
        return { score: 5, isCorrect: true, feedback: "Thanks for your answer!", improvement: "" };
      }
    } catch (error) {
      return { score: 0, isCorrect: false, feedback: "Error evaluating answer", improvement: "" };
    }
  };

  // Enhanced answer generation with examples
  const getCorrectAnswer = async (question) => {
    if (!model) return "API key not provided";
    try {
      const prompt = `You are an expert technical interviewer. Provide a comprehensive model answer for this interview question.

Question: "${question}"

Format your response as:
**Key Points:**
- Point 1
- Point 2
- Point 3

**Sample Answer:**
[A clear, concise 2-3 sentence answer that a candidate should give]

Keep it practical and interview-focused.`;

      const result = await model.generateContent(prompt);
      const response = await result.response.text();
      return response.trim();
    } catch (error) {
      return "Unable to generate model answer. Please try again.";
    }
  };

  // Generate follow-up question based on answer
  const generateFollowUp = async (question, answer) => {
    if (!model) return null;
    try {
      const prompt = `Based on this interview exchange, generate a short follow-up question.
Question: "${question}"
Answer: "${answer}"
Provide only the follow-up question, nothing else. Keep it brief.`;

      const result = await model.generateContent(prompt);
      return result.response.text().trim();
    } catch {
      return null;
    }
  };

  const generateCorrectAnswers = async () => {
    const answers = await Promise.all(
      questions.map((q) => getCorrectAnswer(q))
    );
    setCorrectAnswers(answers);
  };

  const handleUserInput = (input) => {
    const lowerInput = input.toLowerCase();
    if (lowerInput.includes("stop") || lowerInput.includes("end")) {
      setShowStopModal(true);
      return true;
    }
    if (lowerInput.includes("repeat") || lowerInput.includes("again")) {
      const currentQuestion = questions[currentQuestionIndex];
      setConversation((prev) => [
        ...prev,
        { speaker: "AI", text: `No problem, I’ll repeat: ${currentQuestion}` },
      ]);
      speak(`No problem, I’ll repeat: ${currentQuestion}`);
      return true;
    }
    if (lowerInput.includes("skip")) {
      if (currentQuestionIndex < questions.length - 1) {
        setConversation((prev) => [
          ...prev,
          { speaker: "AI", text: "Okay, let’s skip to the next one." },
        ]);
        speak("Okay, let’s skip to the next one.");
        setTimeout(() => askNextQuestion(), 5000);
      } else {
        endInterview();
      }
      return true;
    }
    return false;
  };

  const askNextQuestion = () => {
    if (currentQuestionIndex + 1 < questions.length) {
      const nextQuestion = questions[currentQuestionIndex + 1];
      setConversation((prev) => [
        ...prev,
        { speaker: "AI", text: `Next question: ${nextQuestion}` },
      ]);
      speak(`Next question: ${nextQuestion}`);
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      endInterview();
    }
  };

  const endInterview = () => {
    setIsLoading(true);
    stopAllSpeech();
    stopMediaStreams();
    const finalMessage = `Great job! The interview is over. Your final score is ${score}/${questions.length}.`;
    setConversation((prev) => [...prev, { speaker: "AI", text: finalMessage }]);
    generateCorrectAnswers().then(() => {
      setShowDashboard(true);
      setIsLoading(false);
      // sendReportToWhatsApp(); // Commented out as it's not implemented
    });
    setSelectedLanguage(null);
    setQuestions([]);
    setCurrentQuestionIndex(0);
    setScore(0);
    setResponseCountdown(null);
  };

  const stopInterview = () => {
    setIsLoading(true);
    stopAllSpeech();
    stopMediaStreams();
    const finalMessage = `Alright, the interview has been stopped. Your score was ${score}/${questions.length}.`;
    setConversation((prev) => {
      const newConversation = [...prev, { speaker: "AI", text: finalMessage }];
      setTimeout(() => {
        generateCorrectAnswers().then(() => {
          setShowDashboard(true);
          setIsLoading(false);
          // sendReportToWhatsApp(); // Commented out as it's not implemented
        });
      }, 1500);
      setShowStopModal(false);
      setSelectedLanguage(null);
      setQuestions([]);
      setCurrentQuestionIndex(0);
      setScore(0);
      setResponseCountdown(null);
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
      return newConversation;
    });
  };

  useEffect(() => {
    if (!listening && transcript && selectedLanguage) {
      setIsListening(false);
      const userInput = transcript;
      setConversation((prev) => {
        const updatedConversation = [...prev];
        updatedConversation[updatedConversation.length - 1] = {
          speaker: "You",
          text: userInput,
        };
        return updatedConversation;
      });
      resetTranscript();

      if (handleUserInput(userInput)) {
        if (chatBoxRef.current)
          chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
        return;
      }

      const currentQuestion = questions[currentQuestionIndex];
      validateAnswer(userInput, currentQuestion).then((result) => {
        // Handle both old (number) and new (object) response formats
        const scoreValue = typeof result === 'object' ? (result.isCorrect ? 1 : 0) : result;
        const detailedScore = typeof result === 'object' ? result.score : (result ? 10 : 0);

        setScore((prev) => prev + scoreValue);

        // Create feedback message
        let feedback;
        if (typeof result === 'object' && result.feedback) {
          feedback = `${result.feedback}${result.improvement ? ` Tip: ${result.improvement}` : ''}`;
        } else {
          feedback = scoreValue
            ? "Nice one! That's a solid answer."
            : "Hmm, that might need a bit more detail. Let's try the next question.";
        }

        setConversation((prev) => [...prev, {
          speaker: "AI",
          text: feedback,
          score: detailedScore
        }]);
        speak(feedback);

        if (currentQuestionIndex < questions.length - 1) {
          setTimeout(() => askNextQuestion(), 5000);
        } else {
          setTimeout(() => endInterview(), 5000);
        }

        if (chatBoxRef.current)
          chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
      });
    }
  }, [
    listening,
    transcript,
    selectedLanguage,
    questions,
    currentQuestionIndex,
    score,
  ]);

  const speak = (text) => {
    if ("speechSynthesis" in window) {
      const voices = window.speechSynthesis.getVoices();
      const femaleVoice =
        voices.find(
          (voice) =>
            voice.name === "Google US English" ||
            voice.name === "Samantha" ||
            voice.gender === "female"
        ) || voices[0];
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.voice = femaleVoice;
      utterance.pitch = 1.2;
      utterance.rate = 1;
      utterance.volume = 1;
      utteranceRef.current = utterance;
      setIsSpeaking(true);

      utterance.onend = () => {
        setIsSpeaking(false);
        utteranceRef.current = null;
        if (
          text.includes("First question") ||
          text.includes("Next question") ||
          text.includes("I’ll repeat") ||
          text === "Okay, let’s skip to the next one."
        ) {
          setConversation((prev) => [
            ...prev,
            { speaker: "You", text: "", countdown: 3 },
          ]);
          setResponseCountdown(3);
        }
      };
      utterance.onerror = (event) => {
        setIsSpeaking(false);
        setStatus("Error in speech synthesis");
      };
      window.speechSynthesis.speak(utterance);
    } else {
      setStatus("Error: Text-to-speech not supported");
    }
  };

  const stopSpeaking = () => {
    if (isSpeaking && utteranceRef.current) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      setStatus("Speech stopped");
      setResponseCountdown(null);
    }
  };

  const startListening = () => {
    if (micPermission) {
      SpeechRecognition.startListening({ continuous: false });
      setIsListening(true);
      setStatus("Listening to your input...");
    } else {
      setStatus("Error: Microphone permission not granted");
    }
  };

  const stopListening = () => {
    SpeechRecognition.stopListening();
    setStatus("Processing your input...");
  };

  const handleStartInterview = (language, questions) => {
    setSelectedLanguage(language);
    setQuestions(questions);
    setShowUserInfoModal(true);
  };

  const confirmUserInfo = () => {
    if (userName && userEmail && userMobile) {
      setShowUserInfoModal(false);
      setShowApiKeyModal(true);
    } else {
      setStatus("Please provide name, email, and mobile number.");
    }
  };

  const cancelUserInfo = () => {
    setShowUserInfoModal(false);
    setUserName("");
    setUserEmail("");
    setUserMobile("");
    setSelectedLanguage(null);
    setQuestions([]);
  };

  const confirmApiKey = () => {
    if (geminiApiKey) {
      setShowApiKeyModal(false);
      setShowPermissionModal(true);
    } else {
      setStatus("Please provide a valid Gemini API key.");
    }
  };

  const cancelApiKey = () => {
    setShowApiKeyModal(false);
    setGeminiApiKey("");
    setSelectedLanguage(null);
    setQuestions([]);
  };

  const confirmPermissions = async () => {
    if (webcamPermission && micPermission) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        mediaStreamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            videoRef.current
              .play()
          };
        }
        setShowPermissionModal(false);
        setCountdown(10);
      } catch (err) {
        setStatus(`Error: ${err.message}`);
      }
    } else {
      setStatus(
        "Please grant both webcam and microphone permissions to proceed."
      );
    }
  };

  const cancelPermissions = () => {
    setShowPermissionModal(false);
    setSelectedLanguage(null);
    setWebcamPermission(false);
    setMicPermission(false);
    setQuestions([]);
  };

  const startInterview = (language) => {
    setConversation([]);
    setCurrentQuestionIndex(0);
    setScore(0);
    setStatus(`Starting ${language} interview...`);
    setShowDashboard(false);

    const firstQuestion = questions[0];
    setConversation([
      {
        speaker: "AI",
        text: `Let’s start your ${language} interview! First question: ${firstQuestion}`,
      },
    ]);
    speak(
      `Let’s start your ${language} interview! First question: ${firstQuestion}`
    );
  };

  const downloadChatAsPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("WAB AI Interview Performance Report", 20, 20);
    doc.setFontSize(12);
    doc.text(`Name: ${userName}`, 20, 30);
    doc.text(`Email: ${userEmail}`, 20, 40);
    doc.text(`Mobile: +91${userMobile}`, 20, 50);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 60);
    doc.text(`Score: ${score}/${questions.length}`, 20, 70);

    doc.setFontSize(14);
    doc.text("Chat History:", 20, 80);
    let yPosition = 90;

    conversation.forEach((entry) => {
      const speakerLabel = entry.speaker === "AI" ? "Assistant" : "You";
      const text = `${speakerLabel} (${getCurrentTime()}): ${entry.text || (entry.countdown > 0 ? entry.countdown : "Start")
        }`;
      const splitText = doc.splitTextToSize(text, 170);
      doc.text(splitText, 20, yPosition);
      yPosition += splitText.length * 7;
      if (yPosition > 280) {
        doc.addPage();
        yPosition = 20;
      }
    });

    doc.setFontSize(14);
    doc.text("Correct Answers:", 20, yPosition + 10);
    yPosition += 20;

    correctAnswers.forEach((answer, index) => {
      const text = `Q${index + 1}: ${questions[index]
        }\nCorrect Answer: ${answer}`;
      const splitText = doc.splitTextToSize(text, 170);
      doc.text(splitText, 20, yPosition);
      yPosition += splitText.length * 7;
      if (yPosition > 280) {
        doc.addPage();
        yPosition = 20;
      }
    });

    doc.save(
      `wab_ai_interview_${userName}_${new Date().toISOString().split("T")[0]
      }.pdf`
    );
  };

  const getCurrentTime = () => {
    const now = new Date();
    return now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex justify-center p-4 sm:p-8 overflow-y-auto">
      {isLoading && <Loader />}

      {(!selectedLanguage ||
        showPermissionModal ||
        showUserInfoModal ||
        showApiKeyModal) &&
        !showDashboard ? (
        <div className="w-full max-w-7xl mx-auto">
          {/* Premium Header */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center p-3 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-2xl mb-4">
              <svg className="w-10 h-10 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
              </svg>
            </div>
            <h1 className="text-4xl md:text-5xl font-black mb-3 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              AI Interview Practice
            </h1>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Practice your interview skills with AI-powered mock interviews
            </p>
          </div>
          <div className="space-y-6 p-4 max-w-7xl mx-auto">
            {/* Search and Filter Section */}
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-slate-800/30 p-4 rounded-2xl border border-slate-700/50">
              <div className="relative w-full sm:w-96">
                <input
                  type="text"
                  placeholder="Search interview topics..."
                  className="w-full px-5 py-3 pl-12 bg-slate-800/80 rounded-xl border border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400"
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <svg
                  className="absolute left-4 top-3.5 h-5 w-5 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>

              <div className="flex flex-wrap gap-2">
                {['All', 'Programming', 'Web Dev', 'Data Science', 'System Design'].map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category === 'All' ? null : category)}
                    className={`px-4 py-2 text-sm font-medium rounded-xl border transition-all ${(selectedCategory === category || (category === 'All' && !selectedCategory))
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 border-transparent text-white shadow-lg shadow-blue-500/25'
                      : 'border-slate-600 text-gray-300 hover:border-blue-500/50 hover:text-white bg-slate-800/50'
                      }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            {/* Topics Grid */}
            {filteredTopics.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {filteredTopics.map((topic) => (
                  <button
                    key={topic._id}
                    onClick={() => handleStartInterview(topic.topic, topic.questions)}
                    className="group relative p-6 bg-slate-800/50 rounded-2xl border border-slate-700/50 transition-all duration-300 hover:border-blue-500/50 hover:shadow-xl hover:shadow-blue-500/10 hover:-translate-y-1 text-left"
                  >
                    {/* Badge */}
                    <div className="absolute -top-3 -right-3 flex items-center justify-center w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 text-white text-sm font-bold rounded-xl shadow-lg group-hover:scale-110 transition-transform">
                      {topic.questions?.length || 0}
                    </div>

                    {/* Icon */}
                    <div className="w-12 h-12 mb-4 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center">
                      <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
                      </svg>
                    </div>

                    <h3 className="text-lg font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">
                      {topic.topic}
                    </h3>

                    {topic.category && (
                      <span className="inline-block px-2 py-1 text-xs font-medium rounded-lg bg-slate-700/50 text-gray-400">
                        {topic.category}
                      </span>
                    )}

                    {/* Start indicator */}
                    <div className="mt-4 flex items-center text-sm text-gray-400 group-hover:text-blue-400">
                      <span>Start Interview</span>
                      <svg className="w-4 h-4 ml-2 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                      </svg>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <svg
                  className="mx-auto h-12 w-12 text-gray-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <h3 className="mt-2 text-lg font-medium text-white">No topics found</h3>
                <p className="mt-1 text-gray-400">
                  Try adjusting your search or filter criteria
                </p>
              </div>
            )}
          </div>
          {showUserInfoModal && (
            <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <div className="bg-gradient-to-b from-slate-800 to-slate-900 p-8 rounded-2xl shadow-2xl text-white w-full max-w-md border border-slate-700">
                {/* Header */}
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 mb-4">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                    Enter Your Details
                  </h2>
                  <p className="text-gray-400 text-sm mt-2">We'll use this information for your interview report</p>
                </div>

                <div className="flex flex-col gap-4">
                  <div className="relative">
                    <svg className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                    </svg>
                    <input
                      type="text"
                      placeholder="Your Name"
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                      className="w-full p-3 pl-12 rounded-xl bg-slate-700/50 text-white border border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400"
                    />
                  </div>

                  <div className="relative">
                    <svg className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                    </svg>
                    <input
                      type="email"
                      placeholder="Your Email"
                      value={userEmail}
                      onChange={(e) => setUserEmail(e.target.value)}
                      className="w-full p-3 pl-12 rounded-xl bg-slate-700/50 text-white border border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400"
                    />
                  </div>

                  <div className="relative">
                    <svg className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                    </svg>
                    <input
                      type="tel"
                      placeholder="Mobile Number (10 digits)"
                      value={userMobile}
                      onChange={(e) => setUserMobile(e.target.value)}
                      className="w-full p-3 pl-12 rounded-xl bg-slate-700/50 text-white border border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400"
                    />
                  </div>
                </div>

                <div className="mt-8 flex gap-3">
                  <button
                    onClick={cancelUserInfo}
                    className="flex-1 px-6 py-3 bg-slate-700 text-white rounded-xl hover:bg-slate-600 transition font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmUserInfo}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:opacity-90 transition font-medium shadow-lg shadow-blue-500/25"
                  >
                    Continue
                  </button>
                </div>

                {status && status !== "Initializing..." && (
                  <p className="mt-4 text-sm text-amber-400 text-center">{status}</p>
                )}
              </div>
            </div>
          )}
          {showApiKeyModal && (
            <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <div className="bg-gradient-to-b from-slate-800 to-slate-900 p-8 rounded-2xl shadow-2xl text-white w-full max-w-md border border-slate-700">
                {/* Header */}
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 mb-4">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"></path>
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
                    Gemini API Key
                  </h2>
                  <p className="text-gray-400 text-sm mt-2">Required for AI-powered interview feedback</p>
                </div>

                <div className="flex flex-col gap-4">
                  <div className="relative">
                    <svg className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"></path>
                    </svg>
                    <input
                      type="password"
                      placeholder="Paste your Gemini API Key"
                      value={geminiApiKey}
                      onChange={(e) => setGeminiApiKey(e.target.value)}
                      className="w-full p-3 pl-12 rounded-xl bg-slate-700/50 text-white border border-slate-600 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent placeholder-gray-400"
                    />
                  </div>

                  <a
                    href="https://aistudio.google.com/app/apikey"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 p-3 rounded-xl bg-slate-700/30 border border-slate-600 hover:bg-slate-700/50 transition text-sm text-gray-300"
                  >
                    <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
                    </svg>
                    Get your free API key from Google AI Studio
                  </a>
                </div>

                <div className="mt-8 flex gap-3">
                  <button
                    onClick={cancelApiKey}
                    className="flex-1 px-6 py-3 bg-slate-700 text-white rounded-xl hover:bg-slate-600 transition font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmApiKey}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-xl hover:opacity-90 transition font-medium shadow-lg shadow-amber-500/25"
                  >
                    Continue
                  </button>
                </div>

                {status && status !== "Initializing..." && (
                  <p className="mt-4 text-sm text-amber-400 text-center">{status}</p>
                )}
              </div>
            </div>
          )}
          {showPermissionModal && (
            <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <div className="bg-gradient-to-b from-slate-800 to-slate-900 p-8 rounded-2xl shadow-2xl text-white w-full max-w-md border border-slate-700">
                {/* Header */}
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 mb-4">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                    Grant Permissions
                  </h2>
                  <p className="text-gray-400 text-sm mt-2">We need camera & mic access for your interview</p>
                </div>

                <div className="flex flex-col gap-4">
                  {/* Webcam Permission */}
                  <label className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all ${webcamPermission
                      ? 'bg-green-500/10 border-green-500/50'
                      : 'bg-slate-700/30 border-slate-600 hover:border-slate-500'
                    }`}>
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${webcamPermission ? 'bg-green-500/20' : 'bg-slate-600/50'
                        }`}>
                        <svg className={`w-5 h-5 ${webcamPermission ? 'text-green-400' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                        </svg>
                      </div>
                      <div>
                        <p className="font-medium text-white">Camera Access</p>
                        <p className="text-sm text-gray-400">For video interview</p>
                      </div>
                    </div>
                    <div className={`w-12 h-6 rounded-full p-1 transition-colors ${webcamPermission ? 'bg-green-500' : 'bg-slate-600'}`}>
                      <div className={`w-4 h-4 rounded-full bg-white transition-transform ${webcamPermission ? 'translate-x-6' : 'translate-x-0'}`}></div>
                    </div>
                    <input
                      type="checkbox"
                      checked={webcamPermission}
                      onChange={(e) => setWebcamPermission(e.target.checked)}
                      className="hidden"
                    />
                  </label>

                  {/* Microphone Permission */}
                  <label className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all ${micPermission
                      ? 'bg-green-500/10 border-green-500/50'
                      : 'bg-slate-700/30 border-slate-600 hover:border-slate-500'
                    }`}>
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${micPermission ? 'bg-green-500/20' : 'bg-slate-600/50'
                        }`}>
                        <svg className={`w-5 h-5 ${micPermission ? 'text-green-400' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"></path>
                        </svg>
                      </div>
                      <div>
                        <p className="font-medium text-white">Microphone Access</p>
                        <p className="text-sm text-gray-400">For voice responses</p>
                      </div>
                    </div>
                    <div className={`w-12 h-6 rounded-full p-1 transition-colors ${micPermission ? 'bg-green-500' : 'bg-slate-600'}`}>
                      <div className={`w-4 h-4 rounded-full bg-white transition-transform ${micPermission ? 'translate-x-6' : 'translate-x-0'}`}></div>
                    </div>
                    <input
                      type="checkbox"
                      checked={micPermission}
                      onChange={(e) => setMicPermission(e.target.checked)}
                      className="hidden"
                    />
                  </label>
                </div>

                <div className="mt-8 flex gap-3">
                  <button
                    onClick={cancelPermissions}
                    className="flex-1 px-6 py-3 bg-slate-700 text-white rounded-xl hover:bg-slate-600 transition font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmPermissions}
                    disabled={!webcamPermission || !micPermission}
                    className={`flex-1 px-6 py-3 rounded-xl font-medium transition shadow-lg ${webcamPermission && micPermission
                        ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:opacity-90 shadow-green-500/25'
                        : 'bg-slate-600 text-gray-400 cursor-not-allowed'
                      }`}
                  >
                    Start Interview
                  </button>
                </div>

                {status && status !== "Initializing..." && (
                  <p className="mt-4 text-sm text-amber-400 text-center">{status}</p>
                )}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="w-full max-w-6xl relative">
          <div className="absolute top-4 left-4 flex items-center gap-1 z-10">
            <h1 className="w-12 h-12 flex items-center justify-center border-2 border-blue-500 rounded-full transform rotate-[21deg] text-2xl font-bold ms-[-20px] bg-[red] pe-[0] me-[0]">
              W
            </h1>
            <span className="text-2xl ps-[0] font-bold text-white ms-[0]">
              AI
            </span>
          </div>

          {showDashboard ? (
            <div className="bg-gradient-to-br from-gray-900 to-blue-900 rounded-xl shadow-lg p-8 text-white mt-20 max-h-[85vh] sm:h-[550px] overflow-y-auto mb-[100px] px-2 sm:px-6">
              <h2 className="text-3xl font-bold mb-6 text-center">
                WAB AI Interview Performance Dashboard
              </h2>
              <div className="flex justify-center gap-4 mb-6">
                <button
                  onClick={downloadChatAsPDF}
                  className="px-6 py-3 bg-gradient-to-r from-green-600 to-green-800 text-white rounded-full hover:from-green-700 hover:to-green-900 transition transform hover:scale-105"
                >
                  Download as PDF
                </button>
                <button
                  onClick={() => setShowDashboard(false)}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full hover:from-blue-700 hover:to-purple-700 transition transform hover:scale-105"
                >
                  Start New Interview
                </button>
              </div>
              <div className="mb-6">
                <p className="text-lg">
                  Name: <span className="font-bold">{userName}</span>
                </p>
                <p className="text-lg">
                  Email: <span className="font-bold">{userEmail}</span>
                </p>
                <p className="text-lg">
                  Mobile: <span className="font-bold">+91{userMobile}</span>
                </p>
                <p className="text-lg">
                  Score:{" "}
                  <span className="font-bold">
                    {score}/{questions.length}
                  </span>
                </p>
                <p className="text-sm">
                  Date: {new Date().toLocaleDateString()}
                </p>
              </div>
              <div className="max-h-64 overflow-y-auto rounded-lg p-4 bg-gray-950/50 flex flex-col gap-4">
                {conversation.map((entry, index) => (
                  <div
                    key={index}
                    className={`chat ${entry.speaker === "AI" ? "chat-start" : "chat-end"
                      }`}
                  >
                    <div className="chat-image avatar">
                      <div className="w-10 rounded-full">
                        <img
                          alt={`${entry.speaker} avatar`}
                          src={
                            entry.speaker === "AI"
                              ? "https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp"
                              : "https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp"
                          }
                        />
                      </div>
                    </div>
                    <div className="chat-header">
                      {entry.speaker === "AI" ? "Assistant" : "You"}
                      <time className="text-xs opacity-50 ml-2">
                        {getCurrentTime()}
                      </time>
                    </div>
                    <div
                      className={`chat-bubble ${entry.speaker === "AI" ? "bg-blue-600" : "bg-purple-600"
                        } text-white`}
                    >
                      {entry.text ||
                        (entry.countdown > 0 ? entry.countdown : "Start")}
                    </div>
                  </div>
                ))}
                {correctAnswers.map((answer, index) => (
                  <div key={`correct-${index}`} className="chat chat-start">
                    <div className="chat-image avatar">
                      <div className="w-10 rounded-full">
                        <img
                          alt="Assistant avatar"
                          src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp"
                        />
                      </div>
                    </div>
                    <div className="chat-header">
                      Correct Answer
                      <time className="text-xs opacity-50 ml-2">
                        {getCurrentTime()}
                      </time>
                    </div>
                    <div className="chat-bubble bg-green-600 text-white">
                      Q{index + 1}: {questions[index]}
                      <br />
                      Correct Answer: {answer}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20 overflow-y-auto pb-[180px]">
              <div className="bg-gradient-to-br from-gray-900 to-blue-900 rounded-xl shadow-xl border-2 border-blue-800/70 flex flex-col items-center p-4">
                <h2 className="text-2xl font-bold text-white mb-4">
                  Your Video
                </h2>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-72 rounded-lg object-cover shadow-inner"
                />
              </div>
              <div className="bg-gradient-to-br from-gray-900 to-blue-900 rounded-xl shadow-lg p-6 flex flex-col items-center border border-blue-800/50">
                <h2 className="text-2xl font-bold mb-4 text-white">
                  WAB AI Assistant
                </h2>
                <div className="relative w-48 h-48">
                  <svg
                    viewBox="0 0 100 100"
                    className={`transition-all duration-300 ${isListening ? "animate-amoeba" : ""
                      } ${isSpeaking ? "animate-speak" : ""}`}
                  >
                    <path
                      d="M50 10 C70 10, 90 30, 90 50 C90 70, 70 90, 50 90 C30 90, 10 70, 10 50 C10 30, 30 10, 50 10 Z"
                      fill="url(#amoebaGradient)"
                      className={isListening ? "pulsate" : ""}
                    />
                    <text
                      x="50"
                      y="60"
                      textAnchor="middle"
                      fill="white"
                      fontSize="24"
                      fontWeight="bold"
                      fontFamily="Arial, sans-serif"
                    >
                      W
                    </text>
                    <defs>
                      <linearGradient
                        id="amoebaGradient"
                        x1="0%"
                        y1="0%"
                        x2="100%"
                        y2="100%"
                      >
                        <stop offset="0%" style={{ stopColor: "#3b82f6" }} />
                        <stop offset="100%" style={{ stopColor: "#9333ea" }} />
                      </linearGradient>
                    </defs>
                  </svg>
                  {listening && (
                    <span className="absolute bottom-[-20px] left-1/2 transform -translate-x-1/2 text-white text-sm font-semibold bg-gray-800 px-3 py-1 rounded-full shadow-md">
                      Listening...
                    </span>
                  )}
                </div>
                {countdown !== null ? (
                  <div className="mt-6 text-2xl font-bold text-white">
                    {countdown}
                  </div>
                ) : (
                  <div className="mt-6 flex justify-center gap-4">
                    <button
                      onClick={() => setShowStopModal(true)}
                      className="px-6 py-3 bg-gradient-to-r from-gray-600 to-gray-800 text-white rounded-full hover:from-gray-700 Hover:to-gray-900 transition transform hover:scale-105"
                    >
                      Stop Interview
                    </button>
                    {isSpeaking && (
                      <button
                        onClick={stopSpeaking}
                        className="px-6 py-3 bg-gradient-to-r from-yellow-600 to-yellow-800 text-white rounded-full hover:from-yellow-700 hover:to-yellow-900 transition transform hover:scale-105"
                      >
                        Stop Speaking
                      </button>
                    )}
                  </div>
                )}
                <p className="mt-4 text-sm text-gray-400">{status}</p>
              </div>
              <div className="bg-gradient-to-br from-gray-900 to-blue-900 rounded-xl shadow-lg p-6 flex flex-col border border-blue-800/50">
                <h2 className="text-2xl font-bold mb-4 text-white">
                  {selectedLanguage} Interview
                </h2>
                <div
                  ref={chatBoxRef}
                  className="h-80 overflow-y-auto rounded-lg p-4 bg-gray-950/50 flex flex-col gap-4"
                >
                  {conversation.map((entry, index) => (
                    <div
                      key={index}
                      className={`chat ${entry.speaker === "AI" ? "chat-start" : "chat-end"
                        }`}
                    >
                      <div className="chat-image avatar">
                        <div className="w-10 rounded-full">
                          <img
                            alt={`${entry.speaker} avatar`}
                            src={
                              entry.speaker === "AI"
                                ? "https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp"
                                : "https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp"
                            }
                          />
                        </div>
                      </div>
                      <div className="chat-header">
                        {entry.speaker === "AI" ? "Assistant" : "You"}
                        <time className="text-xs opacity-50 ml-2">
                          {getCurrentTime()}
                        </time>
                      </div>
                      {entry.speaker === "AI" ? (
                        <div className="chat-bubble bg-blue-600 text-white">
                          {entry.text}
                        </div>
                      ) : entry.text ? (
                        <div className="chat-bubble bg-purple-600 text-white">
                          {entry.text}
                        </div>
                      ) : (
                        <div className="chat-bubble bg-gray-700 text-white flex items-center justify-center">
                          {entry.countdown > 0 ? (
                            <span>{entry.countdown}</span>
                          ) : (
                            <button
                              onClick={startListening}
                              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full hover:from-blue-700 hover:to-purple-700 transition transform hover:scale-105"
                            >
                              Start
                            </button>
                          )}
                        </div>
                      )}
                      <div className="chat-footer opacity-50">
                        {entry.speaker === "AI"
                          ? "Delivered"
                          : entry.text
                            ? "Seen at " + getCurrentTime()
                            : "Waiting..."}
                      </div>
                    </div>
                  ))}
                  {listening && transcript && (
                    <div className="chat chat-end">
                      <div className="chat-image avatar">
                        <div className="w-10 rounded-full">
                          <img
                            alt="User avatar"
                            src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp"
                          />
                        </div>
                      </div>
                      <div className="chat-header">
                        You
                        <time className="text-xs opacity-50 ml-2">
                          {getCurrentTime()}
                        </time>
                      </div>
                      <div className="chat-bubble bg-purple-600 text-white">
                        {transcript}
                      </div>
                      <div className="chat-footer opacity-50">Typing...</div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
      {showStopModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg text-white">
            <h2 className="text-xl font-bold mb-4">
              Are you sure you want to stop the interview?
            </h2>
            <div className="flex justify-end gap-4">
              <button
                onClick={stopInterview}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Yes
              </button>
              <button
                onClick={() => setShowStopModal(false)}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}
      <style>{`
        @keyframes amoeba {
          0%,
          100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.15) rotate(5deg);
          }
        }
        .animate-amoeba {
          animation: amoeba 1s infinite ease-in-out;
        }
        .pulsate {
          animation: pulse 1s infinite;
        }
        @keyframes pulse {
          0% {
            opacity: 0.7;
          }
          50% {
            opacity: 1;
          }
          100% {
            opacity: 0.7;
          }
        }
        @keyframes speak {
          0% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.1);
          }
          100% {
            transform: scale(1);
          }
        }
        .animate-speak {
          animation: speak 0.5s infinite ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default Interview;
