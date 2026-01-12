import React, { useState, useEffect, useRef } from "react";
import { callAI, hasAnyProvider, getActiveProvider } from "../../services/aiService";

function AIInterview() {
    const [apiKey, setApiKey] = useState("");
    const [jobRole, setJobRole] = useState("");
    const [experience, setExperience] = useState("fresher");
    const [technology, setTechnology] = useState("");
    const [interviewStarted, setInterviewStarted] = useState(false);
    const [currentQuestion, setCurrentQuestion] = useState("");
    const [userAnswer, setUserAnswer] = useState("");
    const [feedback, setFeedback] = useState("");
    const [questionCount, setQuestionCount] = useState(0);
    const [totalQuestions, setTotalQuestions] = useState(5);
    const [loading, setLoading] = useState(false);
    const [interviewHistory, setInterviewHistory] = useState([]);
    const [showResults, setShowResults] = useState(false);
    const [overallScore, setOverallScore] = useState(0);
    const chatContainerRef = useRef(null);

    const technologies = [
        "JavaScript", "Python", "Java", "React", "Node.js", "Angular", "Vue.js",
        "Machine Learning", "Data Science", "AWS", "Azure", "DevOps", "SQL",
        "MongoDB", "Docker", "Kubernetes", "TypeScript", "Go", "Rust", "C++",
        "System Design", "Data Structures", "Algorithms"
    ];

    const [hasProvider, setHasProvider] = useState(false);
    const [providerName, setProviderName] = useState("");

    useEffect(() => {
        setHasProvider(hasAnyProvider());
        const active = getActiveProvider();
        if (active) setProviderName(active.provider);
    }, []);

    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [interviewHistory, currentQuestion, feedback]);

    const callGeminiAPI = async (prompt) => {
        return await callAI(prompt);
    };

    const startInterview = async () => {
        if (!hasProvider) {
            alert("Please set up an API key in AI Settings first!");
            return;
        }
        if (!jobRole || !technology) {
            alert("Please fill in all fields!");
            return;
        }

        setInterviewStarted(true);
        setLoading(true);
        setInterviewHistory([]);
        setQuestionCount(1);
        setShowResults(false);

        try {
            const prompt = `You are a technical interviewer conducting an interview for a ${experience} ${jobRole} position focusing on ${technology}. 
            Ask the FIRST interview question. Keep it relevant to the role and technology.
            Just ask the question directly, no introductions. Be professional but friendly.`;

            const question = await callGeminiAPI(prompt);
            setCurrentQuestion(question);
        } catch (error) {
            alert("Failed to start interview. Please check your API key.");
            setInterviewStarted(false);
        } finally {
            setLoading(false);
        }
    };

    const submitAnswer = async () => {
        if (!userAnswer.trim()) return;

        setLoading(true);
        const currentQA = { question: currentQuestion, answer: userAnswer };

        try {
            // Get feedback for current answer
            const feedbackPrompt = `You are evaluating an interview answer.
            
Question: ${currentQuestion}
Candidate's Answer: ${userAnswer}
Role: ${jobRole} (${experience})
Technology: ${technology}

Provide brief, constructive feedback (2-3 sentences). 
Then rate out of 10. Format: "Feedback: [your feedback]. Score: X/10"`;

            const feedbackResponse = await callGeminiAPI(feedbackPrompt);
            setFeedback(feedbackResponse);

            // Extract score from feedback
            const scoreMatch = feedbackResponse.match(/(\d+)\/10/);
            const score = scoreMatch ? parseInt(scoreMatch[1]) : 5;

            setInterviewHistory(prev => [...prev, { ...currentQA, feedback: feedbackResponse, score }]);
            setUserAnswer("");

            // Check if interview is complete
            if (questionCount >= totalQuestions) {
                // Calculate final score
                const allScores = [...interviewHistory, { score }];
                const avgScore = Math.round(allScores.reduce((sum, q) => sum + q.score, 0) / allScores.length);
                setOverallScore(avgScore);
                setShowResults(true);
                setInterviewStarted(false);
            } else {
                // Get next question
                setTimeout(async () => {
                    const nextPrompt = `You are continuing a technical interview for a ${experience} ${jobRole} position.
                    Previous question was about: ${currentQuestion}
                    Ask question ${questionCount + 1} of ${totalQuestions}. Focus on ${technology}.
                    Just ask the question directly, no preamble.`;

                    const nextQuestion = await callGeminiAPI(nextPrompt);
                    setCurrentQuestion(nextQuestion);
                    setQuestionCount(prev => prev + 1);
                    setFeedback("");
                    setLoading(false);
                }, 2000);
                return;
            }
        } catch (error) {
            alert("Failed to process answer. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const resetInterview = () => {
        setInterviewStarted(false);
        setCurrentQuestion("");
        setUserAnswer("");
        setFeedback("");
        setQuestionCount(0);
        setInterviewHistory([]);
        setShowResults(false);
        setOverallScore(0);
    };

    if (!hasProvider) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 px-4 py-6 flex items-center justify-center">
                <div className="text-center max-w-md">
                    <div className="w-20 h-20 mx-auto bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mb-6">
                        <i className="bi bi-key-fill text-4xl text-white"></i>
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-4">API Key Required</h2>
                    <p className="text-slate-400 mb-6">Please set up an AI API key (Gemini, OpenAI, Groq, etc.) in AI Settings to use this feature.</p>
                    <a href="/student-dashboard/profile/ai-settings" className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-medium hover:from-purple-700 hover:to-pink-700 transition-all inline-flex items-center gap-2">
                        <i className="bi bi-gear"></i> Go to AI Settings
                    </a>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 px-4 py-6 md:px-6 md:py-8">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                        <i className="bi bi-robot text-violet-400"></i>
                        AI Mock Interview
                    </h1>
                    <p className="text-slate-400">Practice technical interviews with AI-powered questions and feedback</p>
                </div>

                {!interviewStarted && !showResults ? (
                    /* Setup Form */
                    <div className="bg-slate-800/30 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-6">
                        <h2 className="text-xl font-bold text-white mb-6">Configure Your Interview</h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">Job Role</label>
                                <input
                                    type="text"
                                    value={jobRole}
                                    onChange={(e) => setJobRole(e.target.value)}
                                    placeholder="e.g., Frontend Developer"
                                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">Experience Level</label>
                                <select
                                    value={experience}
                                    onChange={(e) => setExperience(e.target.value)}
                                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white focus:outline-none focus:border-purple-500"
                                >
                                    <option value="fresher">Fresher (0-1 years)</option>
                                    <option value="junior">Junior (1-3 years)</option>
                                    <option value="mid-level">Mid-Level (3-5 years)</option>
                                    <option value="senior">Senior (5+ years)</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">Primary Technology</label>
                                <select
                                    value={technology}
                                    onChange={(e) => setTechnology(e.target.value)}
                                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white focus:outline-none focus:border-purple-500"
                                >
                                    <option value="">Select technology...</option>
                                    {technologies.map(tech => (
                                        <option key={tech} value={tech}>{tech}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">Number of Questions</label>
                                <select
                                    value={totalQuestions}
                                    onChange={(e) => setTotalQuestions(parseInt(e.target.value))}
                                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white focus:outline-none focus:border-purple-500"
                                >
                                    <option value="3">3 Questions (Quick)</option>
                                    <option value="5">5 Questions (Standard)</option>
                                    <option value="10">10 Questions (Comprehensive)</option>
                                </select>
                            </div>
                        </div>

                        <button
                            onClick={startInterview}
                            disabled={loading}
                            className="w-full mt-6 py-4 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl font-bold text-lg hover:from-violet-700 hover:to-purple-700 transition-all disabled:opacity-50 flex items-center justify-center gap-3"
                        >
                            {loading ? (
                                <><i className="bi bi-arrow-repeat animate-spin"></i> Starting...</>
                            ) : (
                                <><i className="bi bi-play-fill text-2xl"></i> Start Interview</>
                            )}
                        </button>
                    </div>
                ) : showResults ? (
                    /* Results */
                    <div className="bg-slate-800/30 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-6">
                        <div className="text-center mb-8">
                            <div className={`w-32 h-32 mx-auto rounded-full flex items-center justify-center text-5xl font-bold text-white mb-4 ${overallScore >= 7 ? 'bg-gradient-to-br from-green-500 to-emerald-600' :
                                overallScore >= 5 ? 'bg-gradient-to-br from-yellow-500 to-orange-600' :
                                    'bg-gradient-to-br from-red-500 to-rose-600'
                                }`}>
                                {overallScore}/10
                            </div>
                            <h2 className="text-2xl font-bold text-white mb-2">Interview Complete!</h2>
                            <p className="text-slate-400">
                                {overallScore >= 7 ? "Excellent performance! You're well prepared." :
                                    overallScore >= 5 ? "Good effort! Keep practicing to improve." :
                                        "Keep learning and practicing. You've got this!"}
                            </p>
                        </div>

                        <div className="space-y-4 mb-6">
                            {interviewHistory.map((qa, index) => (
                                <div key={index} className="p-4 bg-slate-700/30 rounded-xl">
                                    <div className="flex items-start justify-between mb-2">
                                        <span className="text-purple-400 font-medium">Q{index + 1}</span>
                                        <span className={`px-2 py-1 rounded-lg text-sm font-bold ${qa.score >= 7 ? 'bg-green-500/20 text-green-400' :
                                            qa.score >= 5 ? 'bg-yellow-500/20 text-yellow-400' :
                                                'bg-red-500/20 text-red-400'
                                            }`}>
                                            {qa.score}/10
                                        </span>
                                    </div>
                                    <p className="text-white text-sm mb-2">{qa.question}</p>
                                    <p className="text-slate-400 text-sm">{qa.feedback}</p>
                                </div>
                            ))}
                        </div>

                        <button
                            onClick={resetInterview}
                            className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold hover:from-purple-700 hover:to-pink-700 transition-all"
                        >
                            <i className="bi bi-arrow-repeat mr-2"></i> Start New Interview
                        </button>
                    </div>
                ) : (
                    /* Interview in Progress */
                    <div className="bg-slate-800/30 backdrop-blur-sm rounded-2xl border border-slate-700/50 overflow-hidden">
                        {/* Progress Bar */}
                        <div className="p-4 border-b border-slate-700/50">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-slate-400">Question {questionCount} of {totalQuestions}</span>
                                <button onClick={resetInterview} className="text-red-400 hover:text-red-300 text-sm">
                                    <i className="bi bi-x-lg mr-1"></i> End Interview
                                </button>
                            </div>
                            <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500"
                                    style={{ width: `${(questionCount / totalQuestions) * 100}%` }}
                                ></div>
                            </div>
                        </div>

                        {/* Chat Area */}
                        <div ref={chatContainerRef} className="h-[400px] overflow-y-auto p-4 space-y-4">
                            {/* Current Question */}
                            {currentQuestion && (
                                <div className="flex gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                                        <i className="bi bi-robot text-white"></i>
                                    </div>
                                    <div className="flex-1 bg-slate-700/50 rounded-2xl rounded-tl-none p-4">
                                        <p className="text-white">{currentQuestion}</p>
                                    </div>
                                </div>
                            )}

                            {/* Feedback */}
                            {feedback && (
                                <div className="flex gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center flex-shrink-0">
                                        <i className="bi bi-chat-dots text-white"></i>
                                    </div>
                                    <div className="flex-1 bg-green-500/20 border border-green-500/30 rounded-2xl rounded-tl-none p-4">
                                        <p className="text-green-200 text-sm">{feedback}</p>
                                    </div>
                                </div>
                            )}

                            {loading && (
                                <div className="flex gap-3">
                                    <div className="w-10 h-10 rounded-full bg-slate-600 flex items-center justify-center">
                                        <i className="bi bi-three-dots text-white animate-pulse"></i>
                                    </div>
                                    <div className="bg-slate-700/50 rounded-2xl rounded-tl-none p-4">
                                        <p className="text-slate-400">Thinking...</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Answer Input */}
                        <div className="p-4 border-t border-slate-700/50">
                            <div className="flex gap-3">
                                <textarea
                                    value={userAnswer}
                                    onChange={(e) => setUserAnswer(e.target.value)}
                                    placeholder="Type your answer here..."
                                    rows={3}
                                    disabled={loading}
                                    className="flex-1 px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 resize-none"
                                />
                                <button
                                    onClick={submitAnswer}
                                    disabled={loading || !userAnswer.trim()}
                                    className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-medium hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50 self-end"
                                >
                                    <i className="bi bi-send-fill"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default AIInterview;
