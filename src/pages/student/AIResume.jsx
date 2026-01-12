import React, { useState, useEffect, useRef } from "react";
import * as pdfjsLib from 'pdfjs-dist';
import { callAI, hasAnyProvider } from "../../services/aiService";

// Set PDF.js worker - use unpkg CDN which has all versions
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

function AIResume() {
    const [apiKey, setApiKey] = useState("");
    const [resumeText, setResumeText] = useState("");
    const [targetRole, setTargetRole] = useState("");
    const [analysis, setAnalysis] = useState(null);
    const [loading, setLoading] = useState(false);
    const [uploadedFileName, setUploadedFileName] = useState("");
    const [uploading, setUploading] = useState(false);
    const [inputMethod, setInputMethod] = useState("upload"); // "upload" or "paste"
    const fileInputRef = useRef(null);

    const [hasProvider, setHasProvider] = useState(false);

    useEffect(() => {
        setHasProvider(hasAnyProvider());
    }, []);

    const callGeminiAPI = async (prompt) => {
        return await callAI(prompt);
    };

    // Extract text from PDF using pdf.js
    const extractTextFromPDF = async (file) => {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        let fullText = "";

        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            const pageText = textContent.items.map(item => item.str).join(" ");
            fullText += pageText + "\n";
        }

        return fullText.trim();
    };

    // Extract text from DOCX (simplified - reads XML content)
    const extractTextFromDOCX = async (file) => {
        const arrayBuffer = await file.arrayBuffer();
        const JSZip = (await import('jszip')).default;
        const zip = await JSZip.loadAsync(arrayBuffer);

        const docXml = await zip.file("word/document.xml")?.async("text");
        if (!docXml) throw new Error("Invalid DOCX file");

        // Extract text from XML
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(docXml, "text/xml");
        const textNodes = xmlDoc.getElementsByTagName("w:t");

        let text = "";
        for (let i = 0; i < textNodes.length; i++) {
            text += textNodes[i].textContent + " ";
        }

        return text.trim();
    };

    // Handle file upload
    const handleFileUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        setUploading(true);
        setUploadedFileName(file.name);

        try {
            let extractedText = "";
            const fileType = file.type;
            const fileName = file.name.toLowerCase();

            if (fileType === "application/pdf" || fileName.endsWith(".pdf")) {
                extractedText = await extractTextFromPDF(file);
            } else if (
                fileType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
                fileName.endsWith(".docx")
            ) {
                extractedText = await extractTextFromDOCX(file);
            } else if (fileType === "text/plain" || fileName.endsWith(".txt")) {
                extractedText = await file.text();
            } else if (
                fileType === "application/msword" ||
                fileName.endsWith(".doc")
            ) {
                alert("Old .doc format is not fully supported. Please convert to .docx or PDF for better results.");
                extractedText = await file.text();
            } else {
                alert("Unsupported file format. Please upload PDF, DOCX, or TXT files.");
                setUploading(false);
                setUploadedFileName("");
                return;
            }

            if (extractedText.trim()) {
                setResumeText(extractedText);
            } else {
                alert("Could not extract text from the file. Please try pasting your resume manually.");
            }
        } catch (error) {
            console.error("Error extracting text:", error);
            alert("Failed to read the file. Please try a different format or paste your resume manually.");
            setUploadedFileName("");
        } finally {
            setUploading(false);
        }
    };

    // Handle drag and drop
    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();

        const files = e.dataTransfer.files;
        if (files.length > 0) {
            fileInputRef.current.files = files;
            handleFileUpload({ target: { files } });
        }
    };

    const analyzeResume = async () => {
        if (!resumeText.trim()) {
            alert("Please upload or paste your resume content!");
            return;
        }

        setLoading(true);
        try {
            const prompt = `You are an expert resume reviewer and career advisor. Analyze the following resume ${targetRole ? `for a ${targetRole} position` : ''}.

RESUME:
${resumeText}

Provide a comprehensive analysis in the following JSON format (return ONLY valid JSON):
{
    "overallScore": 85,
    "sections": {
        "summary": { "score": 80, "feedback": "Your feedback here" },
        "experience": { "score": 90, "feedback": "Your feedback here" },
        "skills": { "score": 85, "feedback": "Your feedback here" },
        "education": { "score": 80, "feedback": "Your feedback here" },
        "formatting": { "score": 75, "feedback": "Your feedback here" }
    },
    "strengths": ["strength 1", "strength 2", "strength 3"],
    "improvements": ["improvement 1", "improvement 2", "improvement 3"],
    "missingKeywords": ["keyword 1", "keyword 2"],
    "suggestedChanges": ["Change 1: explanation", "Change 2: explanation"],
    "atsScore": 75,
    "atsIssues": ["issue 1", "issue 2"]
}`;

            const result = await callGeminiAPI(prompt);

            // Parse JSON from response
            try {
                const jsonMatch = result.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    const parsed = JSON.parse(jsonMatch[0]);
                    setAnalysis(parsed);
                } else {
                    throw new Error("No JSON found");
                }
            } catch (e) {
                // If JSON parsing fails, show raw analysis
                setAnalysis({ raw: result });
            }
        } catch (error) {
            alert("Failed to analyze resume. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const clearResume = () => {
        setResumeText("");
        setUploadedFileName("");
        setAnalysis(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    if (!hasProvider) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 px-4 py-6 flex items-center justify-center">
                <div className="text-center max-w-md">
                    <div className="w-20 h-20 mx-auto bg-gradient-to-br from-rose-500 to-pink-500 rounded-2xl flex items-center justify-center mb-6">
                        <i className="bi bi-key-fill text-4xl text-white"></i>
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-4">API Key Required</h2>
                    <p className="text-slate-400 mb-6">Please set up an AI API key (Gemini, OpenAI, Groq, etc.) in AI Settings to use this feature.</p>
                    <a href="/student-dashboard/profile/ai-settings" className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-medium inline-flex items-center gap-2">
                        <i className="bi bi-gear"></i> Go to AI Settings
                    </a>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 px-4 py-6 md:px-6 md:py-8">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                        <i className="bi bi-file-earmark-person text-rose-400"></i>
                        AI Resume Analyzer
                    </h1>
                    <p className="text-slate-400">Get AI-powered feedback and suggestions to improve your resume</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Input Section */}
                    <div className="bg-slate-800/30 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold text-white">Your Resume</h2>
                            {/* Toggle between upload and paste */}
                            <div className="flex bg-slate-700/50 rounded-lg p-1">
                                <button
                                    onClick={() => setInputMethod("upload")}
                                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${inputMethod === "upload"
                                        ? "bg-rose-500 text-white"
                                        : "text-slate-400 hover:text-white"
                                        }`}
                                >
                                    <i className="bi bi-upload mr-1"></i> Upload
                                </button>
                                <button
                                    onClick={() => setInputMethod("paste")}
                                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${inputMethod === "paste"
                                        ? "bg-rose-500 text-white"
                                        : "text-slate-400 hover:text-white"
                                        }`}
                                >
                                    <i className="bi bi-clipboard mr-1"></i> Paste
                                </button>
                            </div>
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-slate-300 mb-2">Target Role (Optional)</label>
                            <input
                                type="text"
                                value={targetRole}
                                onChange={(e) => setTargetRole(e.target.value)}
                                placeholder="e.g., Senior Frontend Developer"
                                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                            />
                        </div>

                        {inputMethod === "upload" ? (
                            /* File Upload Section */
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-slate-300 mb-2">Upload Resume</label>
                                <div
                                    className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer ${uploading
                                        ? "border-purple-500 bg-purple-500/10"
                                        : uploadedFileName
                                            ? "border-green-500 bg-green-500/10"
                                            : "border-slate-600 hover:border-rose-500 hover:bg-rose-500/5"
                                        }`}
                                    onDragOver={handleDragOver}
                                    onDrop={handleDrop}
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept=".pdf,.docx,.doc,.txt"
                                        onChange={handleFileUpload}
                                        className="hidden"
                                    />

                                    {uploading ? (
                                        <div className="space-y-3">
                                            <div className="w-12 h-12 mx-auto bg-purple-500/20 rounded-full flex items-center justify-center animate-pulse">
                                                <i className="bi bi-arrow-repeat text-2xl text-purple-400 animate-spin"></i>
                                            </div>
                                            <p className="text-purple-300 font-medium">Processing file...</p>
                                        </div>
                                    ) : uploadedFileName ? (
                                        <div className="space-y-3">
                                            <div className="w-12 h-12 mx-auto bg-green-500/20 rounded-full flex items-center justify-center">
                                                <i className="bi bi-check-circle text-2xl text-green-400"></i>
                                            </div>
                                            <div>
                                                <p className="text-green-300 font-medium">{uploadedFileName}</p>
                                                <p className="text-slate-400 text-sm mt-1">Click to upload a different file</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            <div className="w-16 h-16 mx-auto bg-slate-700/50 rounded-2xl flex items-center justify-center">
                                                <i className="bi bi-cloud-arrow-up text-3xl text-rose-400"></i>
                                            </div>
                                            <div>
                                                <p className="text-white font-medium">Drop your resume here or click to browse</p>
                                                <p className="text-slate-400 text-sm mt-1">Supports PDF, DOCX, and TXT files</p>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Preview of extracted text */}
                                {resumeText && (
                                    <div className="mt-4">
                                        <div className="flex items-center justify-between mb-2">
                                            <label className="text-sm font-medium text-slate-300">Extracted Text Preview</label>
                                            <button
                                                onClick={clearResume}
                                                className="text-red-400 hover:text-red-300 text-sm flex items-center gap-1"
                                            >
                                                <i className="bi bi-trash"></i> Clear
                                            </button>
                                        </div>
                                        <div className="max-h-48 overflow-y-auto bg-slate-700/30 rounded-xl p-4 border border-slate-600">
                                            <pre className="text-slate-300 text-sm whitespace-pre-wrap font-mono">
                                                {resumeText.substring(0, 1000)}
                                                {resumeText.length > 1000 && "..."}
                                            </pre>
                                        </div>
                                        <p className="text-slate-500 text-xs mt-2">
                                            {resumeText.length} characters extracted
                                        </p>
                                    </div>
                                )}
                            </div>
                        ) : (
                            /* Text Paste Section */
                            <div className="mb-4">
                                <div className="flex items-center justify-between mb-2">
                                    <label className="block text-sm font-medium text-slate-300">Resume Content</label>
                                    {resumeText && (
                                        <button
                                            onClick={clearResume}
                                            className="text-red-400 hover:text-red-300 text-sm flex items-center gap-1"
                                        >
                                            <i className="bi bi-trash"></i> Clear
                                        </button>
                                    )}
                                </div>
                                <textarea
                                    value={resumeText}
                                    onChange={(e) => setResumeText(e.target.value)}
                                    placeholder="Paste your resume text here... Include all sections like Summary, Experience, Skills, Education, etc."
                                    rows={15}
                                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 resize-none font-mono text-sm"
                                />
                            </div>
                        )}

                        <button
                            onClick={analyzeResume}
                            disabled={loading || !resumeText.trim()}
                            className="w-full py-4 bg-gradient-to-r from-rose-600 to-pink-600 text-white rounded-xl font-bold text-lg hover:from-rose-700 hover:to-pink-700 transition-all disabled:opacity-50 flex items-center justify-center gap-3"
                        >
                            {loading ? (
                                <><i className="bi bi-arrow-repeat animate-spin"></i> Analyzing...</>
                            ) : (
                                <><i className="bi bi-magic"></i> Analyze Resume</>
                            )}
                        </button>
                    </div>

                    {/* Results Section */}
                    <div className="space-y-6">
                        {analysis ? (
                            analysis.raw ? (
                                /* Raw Analysis (fallback) */
                                <div className="bg-slate-800/30 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-6">
                                    <h3 className="text-lg font-bold text-white mb-4">Analysis Results</h3>
                                    <div className="prose prose-invert max-w-none">
                                        <pre className="whitespace-pre-wrap text-sm text-slate-300">{analysis.raw}</pre>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    {/* Overall Score */}
                                    <div className="bg-slate-800/30 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-6">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h3 className="text-lg font-bold text-white mb-1">Overall Score</h3>
                                                <p className="text-slate-400 text-sm">Based on content, formatting & ATS compatibility</p>
                                            </div>
                                            <div className={`w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold text-white ${analysis.overallScore >= 80 ? 'bg-gradient-to-br from-green-500 to-emerald-600' :
                                                analysis.overallScore >= 60 ? 'bg-gradient-to-br from-yellow-500 to-orange-600' :
                                                    'bg-gradient-to-br from-red-500 to-rose-600'
                                                }`}>
                                                {analysis.overallScore}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Section Scores */}
                                    <div className="bg-slate-800/30 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-6">
                                        <h3 className="text-lg font-bold text-white mb-4">Section Scores</h3>
                                        <div className="space-y-3">
                                            {Object.entries(analysis.sections || {}).map(([key, value]) => (
                                                <div key={key}>
                                                    <div className="flex justify-between text-sm mb-1">
                                                        <span className="text-slate-300 capitalize">{key}</span>
                                                        <span className={`font-medium ${value.score >= 80 ? 'text-green-400' :
                                                            value.score >= 60 ? 'text-yellow-400' : 'text-red-400'
                                                            }`}>{value.score}/100</span>
                                                    </div>
                                                    <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                                                        <div
                                                            className={`h-full transition-all ${value.score >= 80 ? 'bg-green-500' :
                                                                value.score >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                                                                }`}
                                                            style={{ width: `${value.score}%` }}
                                                        ></div>
                                                    </div>
                                                    <p className="text-slate-400 text-xs mt-1">{value.feedback}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Strengths & Improvements */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="bg-green-500/10 border border-green-500/30 rounded-2xl p-4">
                                            <h4 className="font-bold text-green-400 mb-3 flex items-center gap-2">
                                                <i className="bi bi-check-circle"></i> Strengths
                                            </h4>
                                            <ul className="space-y-2">
                                                {(analysis.strengths || []).map((s, i) => (
                                                    <li key={i} className="text-green-200 text-sm flex items-start gap-2">
                                                        <i className="bi bi-check text-green-400 mt-0.5"></i> {s}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                        <div className="bg-orange-500/10 border border-orange-500/30 rounded-2xl p-4">
                                            <h4 className="font-bold text-orange-400 mb-3 flex items-center gap-2">
                                                <i className="bi bi-arrow-up-circle"></i> To Improve
                                            </h4>
                                            <ul className="space-y-2">
                                                {(analysis.improvements || []).map((s, i) => (
                                                    <li key={i} className="text-orange-200 text-sm flex items-start gap-2">
                                                        <i className="bi bi-arrow-right text-orange-400 mt-0.5"></i> {s}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>

                                    {/* ATS Score - Speedometer Style */}
                                    <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-6">
                                        <h4 className="font-bold text-white text-lg mb-6 flex items-center gap-2 justify-center">
                                            <i className="bi bi-speedometer2 text-cyan-400"></i> ATS Compatibility Score
                                        </h4>

                                        {/* Speedometer Gauge */}
                                        <div className="relative w-64 h-36 mx-auto mb-4">
                                            {/* Background Arc */}
                                            <svg className="w-full h-full" viewBox="0 0 200 110">
                                                {/* Gradient definitions */}
                                                <defs>
                                                    <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                                        <stop offset="0%" stopColor="#ef4444" />
                                                        <stop offset="35%" stopColor="#f59e0b" />
                                                        <stop offset="65%" stopColor="#eab308" />
                                                        <stop offset="100%" stopColor="#22c55e" />
                                                    </linearGradient>
                                                    <filter id="glow">
                                                        <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                                                        <feMerge>
                                                            <feMergeNode in="coloredBlur" />
                                                            <feMergeNode in="SourceGraphic" />
                                                        </feMerge>
                                                    </filter>
                                                </defs>

                                                {/* Background track */}
                                                <path
                                                    d="M 20 100 A 80 80 0 0 1 180 100"
                                                    fill="none"
                                                    stroke="#334155"
                                                    strokeWidth="16"
                                                    strokeLinecap="round"
                                                />

                                                {/* Colored gauge arc */}
                                                <path
                                                    d="M 20 100 A 80 80 0 0 1 180 100"
                                                    fill="none"
                                                    stroke="url(#gaugeGradient)"
                                                    strokeWidth="16"
                                                    strokeLinecap="round"
                                                    strokeDasharray={`${(analysis.atsScore / 100) * 251.2} 251.2`}
                                                    style={{ transition: 'stroke-dasharray 1s ease-out' }}
                                                />

                                                {/* Tick marks */}
                                                {[0, 25, 50, 75, 100].map((tick, i) => {
                                                    const angle = (tick / 100) * 180 - 180;
                                                    const radians = (angle * Math.PI) / 180;
                                                    const x1 = 100 + 90 * Math.cos(radians);
                                                    const y1 = 100 + 90 * Math.sin(radians);
                                                    const x2 = 100 + 75 * Math.cos(radians);
                                                    const y2 = 100 + 75 * Math.sin(radians);
                                                    return (
                                                        <line
                                                            key={tick}
                                                            x1={x1}
                                                            y1={y1}
                                                            x2={x2}
                                                            y2={y2}
                                                            stroke="#64748b"
                                                            strokeWidth="2"
                                                        />
                                                    );
                                                })}

                                                {/* Needle */}
                                                <g style={{
                                                    transform: `rotate(${(analysis.atsScore / 100) * 180 - 90}deg)`,
                                                    transformOrigin: '100px 100px',
                                                    transition: 'transform 1s ease-out'
                                                }}>
                                                    <line
                                                        x1="100"
                                                        y1="100"
                                                        x2="100"
                                                        y2="35"
                                                        stroke="#fff"
                                                        strokeWidth="3"
                                                        strokeLinecap="round"
                                                        filter="url(#glow)"
                                                    />
                                                    <circle cx="100" cy="100" r="8" fill="#fff" />
                                                    <circle cx="100" cy="100" r="4" fill="#0f172a" />
                                                </g>
                                            </svg>

                                            {/* Score display */}
                                            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-center">
                                                <span className={`text-4xl font-bold ${analysis.atsScore >= 80 ? 'text-green-400' :
                                                    analysis.atsScore >= 60 ? 'text-yellow-400' :
                                                        analysis.atsScore >= 40 ? 'text-orange-400' :
                                                            'text-red-400'
                                                    }`}>
                                                    {analysis.atsScore}%
                                                </span>
                                            </div>
                                        </div>

                                        {/* Score labels */}
                                        <div className="flex justify-between text-xs text-slate-400 px-4 mb-4">
                                            <span>Poor</span>
                                            <span>Fair</span>
                                            <span>Good</span>
                                            <span>Excellent</span>
                                        </div>

                                        {/* Score interpretation */}
                                        <div className={`text-center py-3 px-4 rounded-xl mb-4 ${analysis.atsScore >= 80 ? 'bg-green-500/20 border border-green-500/30' :
                                            analysis.atsScore >= 60 ? 'bg-yellow-500/20 border border-yellow-500/30' :
                                                analysis.atsScore >= 40 ? 'bg-orange-500/20 border border-orange-500/30' :
                                                    'bg-red-500/20 border border-red-500/30'
                                            }`}>
                                            <p className={`font-medium ${analysis.atsScore >= 80 ? 'text-green-300' :
                                                analysis.atsScore >= 60 ? 'text-yellow-300' :
                                                    analysis.atsScore >= 40 ? 'text-orange-300' :
                                                        'text-red-300'
                                                }`}>
                                                {analysis.atsScore >= 80 ? '🎉 Excellent! Your resume is highly ATS-friendly' :
                                                    analysis.atsScore >= 60 ? '👍 Good! Minor improvements recommended' :
                                                        analysis.atsScore >= 40 ? '⚠️ Needs work. Several ATS issues detected' :
                                                            '🚨 Critical! Major ATS compatibility issues'}
                                            </p>
                                        </div>

                                        {/* ATS Issues */}
                                        {analysis.atsIssues && analysis.atsIssues.length > 0 && (
                                            <div className="mt-4">
                                                <h5 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
                                                    <i className="bi bi-exclamation-triangle text-amber-400"></i>
                                                    Issues to Fix
                                                </h5>
                                                <ul className="space-y-2">
                                                    {analysis.atsIssues.map((issue, i) => (
                                                        <li key={i} className="flex items-start gap-3 p-3 bg-slate-700/30 rounded-lg hover:bg-slate-700/50 transition-colors">
                                                            <span className="w-6 h-6 rounded-full bg-amber-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                                                                <i className="bi bi-exclamation text-amber-400 text-sm"></i>
                                                            </span>
                                                            <span className="text-slate-300 text-sm">{issue}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}

                                        {/* Missing Keywords if available */}
                                        {analysis.missingKeywords && analysis.missingKeywords.length > 0 && (
                                            <div className="mt-4 pt-4 border-t border-slate-700/50">
                                                <h5 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
                                                    <i className="bi bi-tags text-purple-400"></i>
                                                    Suggested Keywords to Add
                                                </h5>
                                                <div className="flex flex-wrap gap-2">
                                                    {analysis.missingKeywords.map((keyword, i) => (
                                                        <span key={i} className="px-3 py-1.5 bg-purple-500/20 border border-purple-500/30 rounded-full text-purple-300 text-sm hover:bg-purple-500/30 transition-colors">
                                                            + {keyword}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Suggested Changes Section */}
                                    {analysis.suggestedChanges && analysis.suggestedChanges.length > 0 && (
                                        <div className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/30 rounded-2xl p-6">
                                            <h4 className="font-bold text-white text-lg mb-4 flex items-center gap-2">
                                                <i className="bi bi-lightbulb text-yellow-400"></i>
                                                Suggested Improvements
                                            </h4>
                                            <div className="space-y-3">
                                                {analysis.suggestedChanges.map((change, i) => (
                                                    <div key={i} className="flex items-start gap-3 p-4 bg-slate-800/50 rounded-xl hover:bg-slate-800/70 transition-colors">
                                                        <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0 text-white font-bold text-sm">
                                                            {i + 1}
                                                        </span>
                                                        <p className="text-slate-300 text-sm leading-relaxed">{change}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </>
                            )
                        ) : (
                            <div className="bg-slate-800/30 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-12 text-center">
                                <div className="w-20 h-20 mx-auto bg-slate-700/50 rounded-2xl flex items-center justify-center mb-4">
                                    <i className="bi bi-file-earmark-text text-4xl text-slate-500"></i>
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2">Ready to Analyze</h3>
                                <p className="text-slate-400">Upload your resume or paste it manually, then click "Analyze Resume" to get AI-powered feedback</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AIResume;
