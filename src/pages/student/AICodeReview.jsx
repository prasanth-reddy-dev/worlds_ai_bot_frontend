import React, { useState, useEffect } from "react";

function AICodeReview() {
    const [apiKey, setApiKey] = useState("");
    const [code, setCode] = useState("");
    const [language, setLanguage] = useState("javascript");
    const [reviewType, setReviewType] = useState("general");
    const [review, setReview] = useState(null);
    const [loading, setLoading] = useState(false);

    const languages = [
        "javascript", "typescript", "python", "java", "c++", "c#", "go",
        "rust", "ruby", "php", "swift", "kotlin", "sql"
    ];

    const reviewTypes = [
        { value: "general", label: "General Review", desc: "Overall code quality and best practices" },
        { value: "performance", label: "Performance", desc: "Focus on optimization and efficiency" },
        { value: "security", label: "Security", desc: "Identify potential vulnerabilities" },
        { value: "clean-code", label: "Clean Code", desc: "Readability and maintainability" },
        { value: "bug-detection", label: "Bug Detection", desc: "Find potential bugs and errors" },
    ];

    useEffect(() => {
        const savedKey = localStorage.getItem("gemini_api_key");
        if (savedKey) setApiKey(savedKey);
    }, []);

    const callGeminiAPI = async (prompt) => {
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }],
                    generationConfig: {
                        temperature: 0.7,
                        maxOutputTokens: 2048,
                    }
                })
            }
        );

        if (!response.ok) throw new Error('API call failed');
        const data = await response.json();
        return data.candidates[0].content.parts[0].text;
    };

    const reviewCode = async () => {
        if (!code.trim()) {
            alert("Please paste your code!");
            return;
        }

        setLoading(true);
        try {
            const reviewFocus = reviewTypes.find(r => r.value === reviewType);

            const prompt = `You are an expert code reviewer. Review the following ${language} code with focus on: ${reviewFocus.label} - ${reviewFocus.desc}

CODE:
\`\`\`${language}
${code}
\`\`\`

Provide a comprehensive review in the following JSON format (return ONLY valid JSON):
{
    "overallScore": 85,
    "summary": "Brief summary of the code quality",
    "issues": [
        { "severity": "high|medium|low", "line": "approximate line or section", "issue": "description", "suggestion": "how to fix" }
    ],
    "improvements": [
        { "type": "performance|security|readability|best-practice", "description": "improvement suggestion", "example": "code example if applicable" }
    ],
    "positives": ["good thing 1", "good thing 2"],
    "refactoredCode": "Improved version of the code if significant changes are needed, otherwise null"
}`;

            const result = await callGeminiAPI(prompt);

            try {
                const jsonMatch = result.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    const parsed = JSON.parse(jsonMatch[0]);
                    setReview(parsed);
                } else {
                    throw new Error("No JSON found");
                }
            } catch (e) {
                setReview({ raw: result });
            }
        } catch (error) {
            alert("Failed to review code. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    if (!apiKey) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 px-4 py-6 flex items-center justify-center">
                <div className="text-center max-w-md">
                    <div className="w-20 h-20 mx-auto bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl flex items-center justify-center mb-6">
                        <i className="bi bi-key-fill text-4xl text-white"></i>
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-4">API Key Required</h2>
                    <p className="text-slate-400 mb-6">Please set up your Google Gemini API key in AI Settings to use this feature.</p>
                    <a href="/student-dashboard/profile/ai-settings" className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-medium inline-flex items-center gap-2">
                        <i className="bi bi-gear"></i> Go to AI Settings
                    </a>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 px-4 py-6 md:px-6 md:py-8">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                        <i className="bi bi-cpu text-amber-400"></i>
                        AI Code Review
                    </h1>
                    <p className="text-slate-400">Get AI-powered code review with suggestions for improvement</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Code Input */}
                    <div className="bg-slate-800/30 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-6">
                        <h2 className="text-xl font-bold text-white mb-4">Your Code</h2>

                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">Language</label>
                                <select
                                    value={language}
                                    onChange={(e) => setLanguage(e.target.value)}
                                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white focus:outline-none focus:border-purple-500 capitalize"
                                >
                                    {languages.map(lang => (
                                        <option key={lang} value={lang} className="capitalize">{lang}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">Review Focus</label>
                                <select
                                    value={reviewType}
                                    onChange={(e) => setReviewType(e.target.value)}
                                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white focus:outline-none focus:border-purple-500"
                                >
                                    {reviewTypes.map(type => (
                                        <option key={type.value} value={type.value}>{type.label}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-slate-300 mb-2">Code</label>
                            <textarea
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                                placeholder={`// Paste your ${language} code here...`}
                                rows={20}
                                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-xl text-green-400 placeholder-slate-500 focus:outline-none focus:border-purple-500 resize-none font-mono text-sm"
                            />
                        </div>

                        <button
                            onClick={reviewCode}
                            disabled={loading}
                            className="w-full py-4 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-xl font-bold text-lg hover:from-amber-700 hover:to-orange-700 transition-all disabled:opacity-50 flex items-center justify-center gap-3"
                        >
                            {loading ? (
                                <><i className="bi bi-arrow-repeat animate-spin"></i> Reviewing...</>
                            ) : (
                                <><i className="bi bi-search"></i> Review Code</>
                            )}
                        </button>
                    </div>

                    {/* Review Results */}
                    <div className="space-y-6">
                        {review ? (
                            review.raw ? (
                                <div className="bg-slate-800/30 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-6">
                                    <h3 className="text-lg font-bold text-white mb-4">Review Results</h3>
                                    <pre className="whitespace-pre-wrap text-sm text-slate-300">{review.raw}</pre>
                                </div>
                            ) : (
                                <>
                                    {/* Score & Summary */}
                                    <div className="bg-slate-800/30 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-6">
                                        <div className="flex items-center gap-4 mb-4">
                                            <div className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold text-white ${review.overallScore >= 80 ? 'bg-gradient-to-br from-green-500 to-emerald-600' :
                                                review.overallScore >= 60 ? 'bg-gradient-to-br from-yellow-500 to-orange-600' :
                                                    'bg-gradient-to-br from-red-500 to-rose-600'
                                                }`}>
                                                {review.overallScore}
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-bold text-white">Code Quality Score</h3>
                                                <p className="text-slate-400 text-sm">{review.summary}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Issues */}
                                    {review.issues && review.issues.length > 0 && (
                                        <div className="bg-slate-800/30 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-6">
                                            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                                <i className="bi bi-exclamation-triangle text-yellow-400"></i>
                                                Issues Found ({review.issues.length})
                                            </h3>
                                            <div className="space-y-3">
                                                {review.issues.map((issue, i) => (
                                                    <div key={i} className={`p-4 rounded-xl border ${issue.severity === 'high' ? 'bg-red-500/10 border-red-500/30' :
                                                        issue.severity === 'medium' ? 'bg-yellow-500/10 border-yellow-500/30' :
                                                            'bg-blue-500/10 border-blue-500/30'
                                                        }`}>
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${issue.severity === 'high' ? 'bg-red-500 text-white' :
                                                                issue.severity === 'medium' ? 'bg-yellow-500 text-black' :
                                                                    'bg-blue-500 text-white'
                                                                }`}>
                                                                {issue.severity}
                                                            </span>
                                                            {issue.line && <span className="text-slate-400 text-xs">Line: {issue.line}</span>}
                                                        </div>
                                                        <p className="text-white text-sm mb-1">{issue.issue}</p>
                                                        <p className="text-slate-400 text-xs"><strong>Fix:</strong> {issue.suggestion}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Improvements */}
                                    {review.improvements && review.improvements.length > 0 && (
                                        <div className="bg-slate-800/30 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-6">
                                            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                                <i className="bi bi-lightbulb text-amber-400"></i>
                                                Suggestions
                                            </h3>
                                            <div className="space-y-3">
                                                {review.improvements.map((imp, i) => (
                                                    <div key={i} className="p-4 bg-slate-700/30 rounded-xl">
                                                        <span className="px-2 py-0.5 bg-purple-500/20 text-purple-400 rounded text-xs font-medium capitalize mb-2 inline-block">
                                                            {imp.type}
                                                        </span>
                                                        <p className="text-white text-sm mt-2">{imp.description}</p>
                                                        {imp.example && (
                                                            <pre className="mt-2 p-2 bg-slate-900/50 rounded text-green-400 text-xs overflow-x-auto">{imp.example}</pre>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Positives */}
                                    {review.positives && review.positives.length > 0 && (
                                        <div className="bg-green-500/10 border border-green-500/30 rounded-2xl p-4">
                                            <h4 className="font-bold text-green-400 mb-3 flex items-center gap-2">
                                                <i className="bi bi-check-circle"></i> What You Did Well
                                            </h4>
                                            <ul className="space-y-2">
                                                {review.positives.map((p, i) => (
                                                    <li key={i} className="text-green-200 text-sm flex items-start gap-2">
                                                        <i className="bi bi-check text-green-400 mt-0.5"></i> {p}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    {/* Refactored Code */}
                                    {review.refactoredCode && (
                                        <div className="bg-slate-800/30 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-6">
                                            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                                <i className="bi bi-code-slash text-cyan-400"></i>
                                                Improved Code
                                            </h3>
                                            <pre className="p-4 bg-slate-900/50 rounded-xl text-green-400 text-sm overflow-x-auto font-mono">
                                                {review.refactoredCode}
                                            </pre>
                                        </div>
                                    )}
                                </>
                            )
                        ) : (
                            <div className="bg-slate-800/30 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-12 text-center h-full flex flex-col items-center justify-center">
                                <div className="w-20 h-20 mx-auto bg-slate-700/50 rounded-2xl flex items-center justify-center mb-4">
                                    <i className="bi bi-code-square text-4xl text-slate-500"></i>
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2">Ready to Review</h3>
                                <p className="text-slate-400">Paste your code on the left and click "Review Code" to get AI-powered feedback</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AICodeReview;
