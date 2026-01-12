import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";

function AISettings() {
    const { user } = useSelector((state) => state.user);

    // API Keys state
    const [apiKeys, setApiKeys] = useState({
        gemini: "",
        openai: "",
        groq: "",
        huggingface: "",
        cohere: ""
    });

    const [showKeys, setShowKeys] = useState({
        gemini: false,
        openai: false,
        groq: false,
        huggingface: false,
        cohere: false
    });

    const [testing, setTesting] = useState("");
    const [message, setMessage] = useState({ type: "", text: "" });
    const [activeProvider, setActiveProvider] = useState("gemini");

    // API Provider configurations
    const providers = [
        {
            id: "gemini",
            name: "Google Gemini",
            icon: "bi-google",
            color: "from-blue-500 to-cyan-500",
            description: "Google's most capable AI model with excellent reasoning",
            freeLimit: "Free tier: 60 requests/minute",
            getKeyUrl: "https://aistudio.google.com/app/apikey",
            placeholder: "AIzaSy...",
            testEndpoint: async (key) => {
                const response = await fetch(
                    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${key}`,
                    {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            contents: [{ parts: [{ text: "Say 'working' in one word" }] }]
                        })
                    }
                );
                return response.ok;
            }
        },
        {
            id: "openai",
            name: "OpenAI",
            icon: "bi-cpu",
            color: "from-green-500 to-emerald-500",
            description: "ChatGPT's powerful GPT models for various tasks",
            freeLimit: "Free credits for new users ($5)",
            getKeyUrl: "https://platform.openai.com/api-keys",
            placeholder: "sk-...",
            testEndpoint: async (key) => {
                const response = await fetch("https://api.openai.com/v1/models", {
                    headers: { 'Authorization': `Bearer ${key}` }
                });
                return response.ok;
            }
        },
        {
            id: "groq",
            name: "Groq",
            icon: "bi-lightning-charge-fill",
            color: "from-orange-500 to-red-500",
            description: "Ultra-fast inference with Llama & Mixtral models",
            freeLimit: "Free tier: 30 requests/minute",
            getKeyUrl: "https://console.groq.com/keys",
            placeholder: "gsk_...",
            testEndpoint: async (key) => {
                const response = await fetch("https://api.groq.com/openai/v1/models", {
                    headers: { 'Authorization': `Bearer ${key}` }
                });
                return response.ok;
            }
        },
        {
            id: "huggingface",
            name: "Hugging Face",
            icon: "bi-emoji-smile",
            color: "from-yellow-500 to-orange-500",
            description: "Access thousands of open-source AI models",
            freeLimit: "Free tier with rate limits",
            getKeyUrl: "https://huggingface.co/settings/tokens",
            placeholder: "hf_...",
            testEndpoint: async (key) => {
                const response = await fetch("https://huggingface.co/api/whoami", {
                    headers: { 'Authorization': `Bearer ${key}` }
                });
                return response.ok;
            }
        },
        {
            id: "cohere",
            name: "Cohere",
            icon: "bi-chat-dots-fill",
            color: "from-purple-500 to-pink-500",
            description: "Enterprise-grade language models for text generation",
            freeLimit: "Free trial with 1000 API calls/month",
            getKeyUrl: "https://dashboard.cohere.com/api-keys",
            placeholder: "...",
            testEndpoint: async (key) => {
                const response = await fetch("https://api.cohere.ai/v1/check-api-key", {
                    headers: { 'Authorization': `Bearer ${key}` }
                });
                return response.ok;
            }
        }
    ];

    useEffect(() => {
        // Load saved API keys from localStorage
        const savedKeys = {
            gemini: localStorage.getItem("gemini_api_key") || "",
            openai: localStorage.getItem("openai_api_key") || "",
            groq: localStorage.getItem("groq_api_key") || "",
            huggingface: localStorage.getItem("huggingface_api_key") || "",
            cohere: localStorage.getItem("cohere_api_key") || ""
        };
        setApiKeys(savedKeys);

        // Set active provider to first one that has a key
        const firstActiveProvider = Object.entries(savedKeys).find(([_, value]) => value)?.[0] || "gemini";
        setActiveProvider(localStorage.getItem("active_ai_provider") || firstActiveProvider);
    }, [user]);

    const handleKeyChange = (provider, value) => {
        setApiKeys(prev => ({ ...prev, [provider]: value }));
    };

    const handleSaveKey = (provider) => {
        const key = apiKeys[provider];
        if (!key.trim()) {
            setMessage({ type: "error", text: `Please enter your ${providers.find(p => p.id === provider)?.name} API key` });
            return;
        }

        localStorage.setItem(`${provider}_api_key`, key);
        setMessage({ type: "success", text: `${providers.find(p => p.id === provider)?.name} API key saved successfully!` });

        // Auto-set as active provider if no other active
        if (!localStorage.getItem("active_ai_provider")) {
            localStorage.setItem("active_ai_provider", provider);
            setActiveProvider(provider);
        }
    };

    const handleTestKey = async (provider) => {
        const key = apiKeys[provider];
        if (!key.trim()) {
            setMessage({ type: "error", text: "Please enter an API key first" });
            return;
        }

        setTesting(provider);
        try {
            const providerConfig = providers.find(p => p.id === provider);
            const isValid = await providerConfig.testEndpoint(key);

            if (isValid) {
                setMessage({ type: "success", text: `✅ ${providerConfig.name} API key is valid!` });
            } else {
                setMessage({ type: "error", text: `❌ Invalid ${providerConfig.name} API key` });
            }
        } catch (error) {
            setMessage({ type: "error", text: `Failed to test API key. Check your internet connection.` });
        } finally {
            setTesting("");
        }
    };

    const handleClearKey = (provider) => {
        localStorage.removeItem(`${provider}_api_key`);
        setApiKeys(prev => ({ ...prev, [provider]: "" }));
        setMessage({ type: "success", text: "API key removed" });

        // If clearing active provider, switch to another available one
        if (activeProvider === provider) {
            const nextProvider = Object.entries(apiKeys).find(([key, value]) => key !== provider && value)?.[0];
            if (nextProvider) {
                setActiveProvider(nextProvider);
                localStorage.setItem("active_ai_provider", nextProvider);
            }
        }
    };

    const handleSetActive = (provider) => {
        if (!apiKeys[provider]) {
            setMessage({ type: "error", text: "Please save an API key for this provider first" });
            return;
        }
        setActiveProvider(provider);
        localStorage.setItem("active_ai_provider", provider);
        setMessage({ type: "success", text: `${providers.find(p => p.id === provider)?.name} set as active provider` });
    };

    const toggleShowKey = (provider) => {
        setShowKeys(prev => ({ ...prev, [provider]: !prev[provider] }));
    };

    // Count configured providers
    const configuredCount = Object.values(apiKeys).filter(k => k).length;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 px-4 py-6 md:px-6 md:py-8">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                        <i className="bi bi-gear-wide-connected text-purple-400"></i>
                        AI Settings
                    </h1>
                    <p className="text-slate-400">Configure your AI providers - any configured key will power all AI features</p>
                </div>

                {/* Status Banner */}
                <div className={`mb-6 p-4 rounded-xl flex items-center justify-between ${configuredCount > 0
                        ? "bg-green-500/20 border border-green-500/50"
                        : "bg-yellow-500/20 border border-yellow-500/50"
                    }`}>
                    <div className="flex items-center gap-3">
                        <i className={`bi ${configuredCount > 0 ? "bi-check-circle-fill text-green-400" : "bi-exclamation-triangle-fill text-yellow-400"} text-xl`}></i>
                        <div>
                            <p className={configuredCount > 0 ? "text-green-300 font-medium" : "text-yellow-300 font-medium"}>
                                {configuredCount > 0
                                    ? `${configuredCount} API provider${configuredCount > 1 ? 's' : ''} configured`
                                    : "No API providers configured yet"}
                            </p>
                            <p className="text-slate-400 text-sm">
                                {configuredCount > 0
                                    ? `Active: ${providers.find(p => p.id === activeProvider)?.name}`
                                    : "Add at least one API key to use AI features"}
                            </p>
                        </div>
                    </div>
                    {configuredCount > 0 && (
                        <div className="flex items-center gap-2">
                            <span className="px-3 py-1 bg-green-500/30 rounded-full text-green-300 text-sm font-medium">
                                <i className="bi bi-lightning-charge mr-1"></i> Ready
                            </span>
                        </div>
                    )}
                </div>

                {/* Message */}
                {message.text && (
                    <div className={`mb-6 p-4 rounded-xl ${message.type === "success"
                        ? "bg-green-500/20 border border-green-500/50 text-green-400"
                        : "bg-red-500/20 border border-red-500/50 text-red-400"
                        }`}>
                        <div className="flex items-center gap-2">
                            <i className={`bi ${message.type === "success" ? "bi-check-circle-fill" : "bi-exclamation-triangle-fill"}`}></i>
                            <p>{message.text}</p>
                        </div>
                    </div>
                )}

                {/* API Providers */}
                <div className="space-y-4 mb-8">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <i className="bi bi-key-fill text-yellow-400"></i>
                        API Providers
                    </h2>
                    <p className="text-slate-400 text-sm">Configure one or more AI providers. All AI features will work with any configured provider.</p>

                    {providers.map((provider) => (
                        <div
                            key={provider.id}
                            className={`bg-slate-800/30 backdrop-blur-sm rounded-2xl border transition-all ${activeProvider === provider.id && apiKeys[provider.id]
                                    ? "border-green-500/50 ring-2 ring-green-500/20"
                                    : "border-slate-700/50 hover:border-slate-600/50"
                                }`}
                        >
                            <div className="p-5">
                                <div className="flex items-start gap-4">
                                    {/* Provider Icon */}
                                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${provider.color} flex items-center justify-center flex-shrink-0`}>
                                        <i className={`bi ${provider.icon} text-xl text-white`}></i>
                                    </div>

                                    {/* Provider Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="text-lg font-bold text-white">{provider.name}</h3>
                                            {activeProvider === provider.id && apiKeys[provider.id] && (
                                                <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs rounded-full font-medium">
                                                    Active
                                                </span>
                                            )}
                                            {apiKeys[provider.id] && activeProvider !== provider.id && (
                                                <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 text-xs rounded-full font-medium">
                                                    Configured
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-slate-400 text-sm mb-1">{provider.description}</p>
                                        <p className="text-green-400 text-xs">{provider.freeLimit}</p>
                                    </div>

                                    {/* Get Key Button */}
                                    <a
                                        href={provider.getKeyUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="px-3 py-1.5 bg-slate-700/50 hover:bg-slate-600/50 text-slate-300 rounded-lg text-sm flex items-center gap-1 transition-colors"
                                    >
                                        <i className="bi bi-box-arrow-up-right"></i>
                                        Get Key
                                    </a>
                                </div>

                                {/* API Key Input */}
                                <div className="mt-4 flex gap-2">
                                    <div className="relative flex-1">
                                        <input
                                            type={showKeys[provider.id] ? "text" : "password"}
                                            value={apiKeys[provider.id]}
                                            onChange={(e) => handleKeyChange(provider.id, e.target.value)}
                                            placeholder={provider.placeholder}
                                            className="w-full px-4 py-2.5 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 pr-10 text-sm"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => toggleShowKey(provider.id)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                                        >
                                            <i className={`bi ${showKeys[provider.id] ? "bi-eye-slash" : "bi-eye"}`}></i>
                                        </button>
                                    </div>

                                    <button
                                        onClick={() => handleSaveKey(provider.id)}
                                        className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-sm font-medium transition-colors"
                                    >
                                        <i className="bi bi-check-lg"></i>
                                    </button>

                                    <button
                                        onClick={() => handleTestKey(provider.id)}
                                        disabled={testing === provider.id || !apiKeys[provider.id]}
                                        className="px-4 py-2.5 bg-slate-700 hover:bg-slate-600 text-white rounded-xl text-sm font-medium transition-colors disabled:opacity-50"
                                    >
                                        {testing === provider.id ? (
                                            <i className="bi bi-arrow-repeat animate-spin"></i>
                                        ) : (
                                            <i className="bi bi-lightning-charge"></i>
                                        )}
                                    </button>

                                    {apiKeys[provider.id] && activeProvider !== provider.id && (
                                        <button
                                            onClick={() => handleSetActive(provider.id)}
                                            className="px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl text-sm font-medium transition-colors"
                                            title="Set as active"
                                        >
                                            <i className="bi bi-check2-circle"></i>
                                        </button>
                                    )}

                                    {apiKeys[provider.id] && (
                                        <button
                                            onClick={() => handleClearKey(provider.id)}
                                            className="px-4 py-2.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-xl text-sm font-medium transition-colors"
                                        >
                                            <i className="bi bi-trash"></i>
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Quick Comparison */}
                <div className="bg-slate-800/30 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-6 mb-6">
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <i className="bi bi-bar-chart-fill text-cyan-400"></i>
                        Provider Comparison
                    </h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="text-slate-400 border-b border-slate-700">
                                    <th className="text-left py-3 px-2">Provider</th>
                                    <th className="text-left py-3 px-2">Best For</th>
                                    <th className="text-left py-3 px-2">Speed</th>
                                    <th className="text-left py-3 px-2">Free Tier</th>
                                </tr>
                            </thead>
                            <tbody className="text-slate-300">
                                <tr className="border-b border-slate-700/50">
                                    <td className="py-3 px-2 font-medium">Google Gemini</td>
                                    <td className="py-3 px-2">General tasks, reasoning</td>
                                    <td className="py-3 px-2"><span className="text-green-400">Fast</span></td>
                                    <td className="py-3 px-2"><span className="text-green-400">✓ Generous</span></td>
                                </tr>
                                <tr className="border-b border-slate-700/50">
                                    <td className="py-3 px-2 font-medium">OpenAI</td>
                                    <td className="py-3 px-2">Creative writing, code</td>
                                    <td className="py-3 px-2"><span className="text-yellow-400">Medium</span></td>
                                    <td className="py-3 px-2"><span className="text-yellow-400">$5 credits</span></td>
                                </tr>
                                <tr className="border-b border-slate-700/50">
                                    <td className="py-3 px-2 font-medium">Groq</td>
                                    <td className="py-3 px-2">Speed-critical tasks</td>
                                    <td className="py-3 px-2"><span className="text-green-400">Ultra Fast</span></td>
                                    <td className="py-3 px-2"><span className="text-green-400">✓ Generous</span></td>
                                </tr>
                                <tr className="border-b border-slate-700/50">
                                    <td className="py-3 px-2 font-medium">Hugging Face</td>
                                    <td className="py-3 px-2">Specialized models</td>
                                    <td className="py-3 px-2"><span className="text-yellow-400">Varies</span></td>
                                    <td className="py-3 px-2"><span className="text-green-400">✓ Free</span></td>
                                </tr>
                                <tr>
                                    <td className="py-3 px-2 font-medium">Cohere</td>
                                    <td className="py-3 px-2">Text analysis, embeddings</td>
                                    <td className="py-3 px-2"><span className="text-green-400">Fast</span></td>
                                    <td className="py-3 px-2"><span className="text-yellow-400">1000 calls/mo</span></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Features Overview */}
                <div className="bg-slate-800/30 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-6">
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <i className="bi bi-stars text-yellow-400"></i>
                        AI Features Available
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-4 bg-gradient-to-br from-violet-500/20 to-purple-500/20 rounded-xl border border-violet-500/30">
                            <i className="bi bi-robot text-3xl text-violet-400 mb-2"></i>
                            <h4 className="font-semibold text-white mb-1">AI Mock Interview</h4>
                            <p className="text-slate-400 text-sm">Practice interviews with AI-generated questions and feedback</p>
                        </div>
                        <div className="p-4 bg-gradient-to-br from-rose-500/20 to-pink-500/20 rounded-xl border border-rose-500/30">
                            <i className="bi bi-file-earmark-person text-3xl text-rose-400 mb-2"></i>
                            <h4 className="font-semibold text-white mb-1">Resume Analysis</h4>
                            <p className="text-slate-400 text-sm">Get AI feedback and ATS score for your resume</p>
                        </div>
                        <div className="p-4 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-xl border border-blue-500/30">
                            <i className="bi bi-briefcase-fill text-3xl text-blue-400 mb-2"></i>
                            <h4 className="font-semibold text-white mb-1">AI Job Search</h4>
                            <p className="text-slate-400 text-sm">Find jobs with AI-powered search across platforms</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AISettings;
