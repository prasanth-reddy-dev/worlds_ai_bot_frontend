import React, { useState, useEffect } from "react";
import { callAI, hasAnyProvider } from "../../services/aiService";

function AIJobSearch() {
    const [loading, setLoading] = useState(false);
    const [jobs, setJobs] = useState([]);
    const [searched, setSearched] = useState(false);
    const [hasProvider, setHasProvider] = useState(false);

    // Search filters
    const [country, setCountry] = useState("United States");
    const [city, setCity] = useState("");
    const [role, setRole] = useState("");
    const [customRole, setCustomRole] = useState("");
    const [experience, setExperience] = useState("entry");
    const [jobType, setJobType] = useState("full-time");
    const [remote, setRemote] = useState("any");

    const countries = [
        "United States", "United Kingdom", "Canada", "Australia", "Germany",
        "India", "Singapore", "Netherlands", "France", "Japan", "Ireland",
        "Sweden", "Switzerland", "New Zealand", "UAE", "Israel"
    ];

    const popularRoles = [
        "Software Engineer", "Frontend Developer", "Backend Developer", "Full Stack Developer",
        "Data Scientist", "Data Analyst", "Machine Learning Engineer", "DevOps Engineer",
        "Cloud Architect", "Product Manager", "UX Designer", "UI Designer",
        "Mobile Developer", "iOS Developer", "Android Developer", "React Developer",
        "Python Developer", "Java Developer", "Node.js Developer", "QA Engineer",
        "Security Engineer", "Database Administrator", "System Administrator",
        "Business Analyst", "Project Manager", "Scrum Master", "Technical Writer"
    ];

    const experienceLevels = [
        { value: "internship", label: "Internship" },
        { value: "entry", label: "Entry Level (0-2 years)" },
        { value: "mid", label: "Mid Level (3-5 years)" },
        { value: "senior", label: "Senior Level (5-8 years)" },
        { value: "lead", label: "Lead/Principal (8+ years)" },
        { value: "executive", label: "Executive/Director" }
    ];

    useEffect(() => {
        setHasProvider(hasAnyProvider());
    }, []);

    const searchJobs = async () => {
        const selectedRole = role === "custom" ? customRole : role;

        if (!selectedRole) {
            alert("Please select or enter a job role!");
            return;
        }

        setLoading(true);
        setSearched(true);

        try {
            const locationQuery = city ? `${city}, ${country}` : country;
            const remoteText = remote === "remote" ? "remote" : remote === "hybrid" ? "hybrid" : "";
            const expText = experienceLevels.find(e => e.value === experience)?.label || "";

            // Build direct search URLs for job platforms
            const searchQuery = encodeURIComponent(`${selectedRole} ${jobType} ${remoteText} ${expText}`.trim());
            const locationEncoded = encodeURIComponent(locationQuery);
            const roleEncoded = encodeURIComponent(selectedRole);

            // Generate direct job search links to real job boards
            const jobPlatforms = [
                {
                    name: "LinkedIn Jobs",
                    icon: "bi-linkedin",
                    color: "#0A66C2",
                    url: `https://www.linkedin.com/jobs/search/?keywords=${roleEncoded}&location=${locationEncoded}&f_TPR=r604800${jobType === 'full-time' ? '&f_JT=F' : jobType === 'part-time' ? '&f_JT=P' : jobType === 'contract' ? '&f_JT=C' : jobType === 'internship' ? '&f_JT=I' : ''}${remote === 'remote' ? '&f_WT=2' : remote === 'hybrid' ? '&f_WT=1' : ''}`,
                    description: "Professional network with verified company jobs"
                },
                {
                    name: "Indeed",
                    icon: "bi-briefcase-fill",
                    color: "#2164f3",
                    url: `https://www.indeed.com/jobs?q=${roleEncoded}&l=${locationEncoded}&fromage=7${jobType === 'full-time' ? '&jt=fulltime' : jobType === 'part-time' ? '&jt=parttime' : jobType === 'contract' ? '&jt=contract' : jobType === 'internship' ? '&jt=internship' : ''}${remote === 'remote' ? '&remotejob=032b3046-06a3-4876-8dfd-474eb5e7ed11' : ''}`,
                    description: "Largest job aggregator with millions of listings"
                },
                {
                    name: "Glassdoor",
                    icon: "bi-building",
                    color: "#0caa41",
                    url: `https://www.glassdoor.com/Job/jobs.htm?sc.keyword=${roleEncoded}&locT=C&locKeyword=${locationEncoded}`,
                    description: "Jobs with salary info and company reviews"
                },
                {
                    name: "Google Jobs",
                    icon: "bi-google",
                    color: "#4285f4",
                    url: `https://www.google.com/search?q=${searchQuery}+jobs+${locationEncoded}&ibp=htl;jobs`,
                    description: "Aggregated listings from multiple sources"
                },
                {
                    name: "ZipRecruiter",
                    icon: "bi-search",
                    color: "#5ba94c",
                    url: `https://www.ziprecruiter.com/jobs-search?search=${roleEncoded}&location=${locationEncoded}`,
                    description: "AI-powered job matching platform"
                },
                {
                    name: "Monster",
                    icon: "bi-search-heart",
                    color: "#6e45a5",
                    url: `https://www.monster.com/jobs/search?q=${roleEncoded}&where=${locationEncoded}&tm=7`,
                    description: "Classic job board with global reach"
                },
                {
                    name: "SimplyHired",
                    icon: "bi-briefcase",
                    color: "#5a3a8a",
                    url: `https://www.simplyhired.com/search?q=${roleEncoded}&l=${locationEncoded}`,
                    description: "Job aggregator with salary estimates"
                },
                {
                    name: "Dice (Tech)",
                    icon: "bi-cpu",
                    color: "#eb1c26",
                    url: `https://www.dice.com/jobs?q=${roleEncoded}&location=${locationEncoded}&countryCode=US&radius=30&radiusUnit=mi&page=1&pageSize=20&filters.postedDate=SEVEN&language=en`,
                    description: "Tech-focused job board"
                }
            ];

            // Use AI to get market insights (not fake jobs)
            const insightsPrompt = `You are a career advisor. Provide job market insights for someone looking for a ${selectedRole} role in ${locationQuery}.

Return ONLY valid JSON in this format:
{
    "marketInsights": {
        "demandLevel": "High/Medium/Low",
        "salaryRange": "$XX,XXX - $XXX,XXX per year",
        "topSkills": ["skill1", "skill2", "skill3", "skill4", "skill5"],
        "topCompanies": ["company1", "company2", "company3", "company4", "company5"],
        "growthOutlook": "Brief 1-2 sentence outlook"
    },
    "tips": [
        "Specific actionable tip 1",
        "Specific actionable tip 2",
        "Specific actionable tip 3"
    ],
    "keywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"]
}`;

            let insights = null;
            try {
                const result = await callAI(insightsPrompt);
                const jsonMatch = result.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    insights = JSON.parse(jsonMatch[0]);
                }
            } catch (e) {
                console.error("Failed to get AI insights:", e);
            }

            setJobs({
                platforms: jobPlatforms,
                insights: insights,
                searchQuery: selectedRole,
                location: locationQuery
            });

        } catch (error) {
            console.error("Search error:", error);
            alert("Failed to search jobs. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const resetSearch = () => {
        setJobs([]);
        setSearched(false);
        setRole("");
        setCustomRole("");
        setCity("");
    };

    if (!hasProvider) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 px-4 py-6 flex items-center justify-center">
                <div className="text-center max-w-md">
                    <div className="w-20 h-20 mx-auto bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mb-6">
                        <i className="bi bi-key-fill text-4xl text-white"></i>
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-4">API Key Required</h2>
                    <p className="text-slate-400 mb-6">Please set up an AI API key in AI Settings for market insights.</p>
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
                        <i className="bi bi-briefcase-fill text-blue-400"></i>
                        Job Search
                    </h1>
                    <p className="text-slate-400">Search real jobs from LinkedIn, Indeed, Glassdoor & more</p>
                </div>

                {/* Search Filters */}
                <div className="bg-slate-800/30 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-6 mb-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <i className="bi bi-funnel text-cyan-400"></i>
                            Search Filters
                        </h2>
                        {searched && (
                            <button
                                onClick={resetSearch}
                                className="text-slate-400 hover:text-white text-sm flex items-center gap-1"
                            >
                                <i className="bi bi-arrow-counterclockwise"></i> Reset
                            </button>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {/* Country */}
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                <i className="bi bi-globe mr-1"></i> Country
                            </label>
                            <select
                                value={country}
                                onChange={(e) => setCountry(e.target.value)}
                                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white focus:outline-none focus:border-blue-500"
                            >
                                {countries.map(c => (
                                    <option key={c} value={c}>{c}</option>
                                ))}
                            </select>
                        </div>

                        {/* City/State */}
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                <i className="bi bi-geo-alt mr-1"></i> City / State
                            </label>
                            <input
                                type="text"
                                value={city}
                                onChange={(e) => setCity(e.target.value)}
                                placeholder="e.g., San Francisco, CA"
                                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                            />
                        </div>

                        {/* Job Role */}
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                <i className="bi bi-person-workspace mr-1"></i> Job Role
                            </label>
                            <select
                                value={role}
                                onChange={(e) => setRole(e.target.value)}
                                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white focus:outline-none focus:border-blue-500"
                            >
                                <option value="">Select a role...</option>
                                {popularRoles.map(r => (
                                    <option key={r} value={r}>{r}</option>
                                ))}
                                <option value="custom">✏️ Enter Custom Role</option>
                            </select>
                        </div>

                        {/* Custom Role Input */}
                        {role === "custom" && (
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    <i className="bi bi-pencil mr-1"></i> Custom Role
                                </label>
                                <input
                                    type="text"
                                    value={customRole}
                                    onChange={(e) => setCustomRole(e.target.value)}
                                    placeholder="Enter your desired role"
                                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                                />
                            </div>
                        )}

                        {/* Experience Level */}
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                <i className="bi bi-bar-chart mr-1"></i> Experience Level
                            </label>
                            <select
                                value={experience}
                                onChange={(e) => setExperience(e.target.value)}
                                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white focus:outline-none focus:border-blue-500"
                            >
                                {experienceLevels.map(e => (
                                    <option key={e.value} value={e.value}>{e.label}</option>
                                ))}
                            </select>
                        </div>

                        {/* Job Type */}
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                <i className="bi bi-clock mr-1"></i> Job Type
                            </label>
                            <select
                                value={jobType}
                                onChange={(e) => setJobType(e.target.value)}
                                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white focus:outline-none focus:border-blue-500"
                            >
                                <option value="full-time">Full-time</option>
                                <option value="part-time">Part-time</option>
                                <option value="contract">Contract</option>
                                <option value="freelance">Freelance</option>
                                <option value="internship">Internship</option>
                            </select>
                        </div>

                        {/* Remote Preference */}
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                <i className="bi bi-house-door mr-1"></i> Work Mode
                            </label>
                            <select
                                value={remote}
                                onChange={(e) => setRemote(e.target.value)}
                                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white focus:outline-none focus:border-blue-500"
                            >
                                <option value="any">Any</option>
                                <option value="remote">Remote Only</option>
                                <option value="hybrid">Hybrid</option>
                                <option value="onsite">On-site Only</option>
                            </select>
                        </div>
                    </div>

                    {/* Search Button */}
                    <button
                        onClick={searchJobs}
                        disabled={loading}
                        className="w-full mt-6 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl font-bold text-lg hover:from-blue-700 hover:to-cyan-700 transition-all disabled:opacity-50 flex items-center justify-center gap-3"
                    >
                        {loading ? (
                            <><i className="bi bi-arrow-repeat animate-spin"></i> Searching...</>
                        ) : (
                            <><i className="bi bi-search"></i> Search Jobs</>
                        )}
                    </button>
                </div>

                {/* Results Section */}
                {searched && !loading && jobs.platforms && (
                    <div className="space-y-6">
                        {/* Search Summary */}
                        <div className="bg-gradient-to-r from-blue-600/20 to-cyan-600/20 border border-blue-500/30 rounded-2xl p-6">
                            <div className="flex items-center justify-between flex-wrap gap-4">
                                <div>
                                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                        <i className="bi bi-search text-cyan-400"></i>
                                        Searching: {jobs.searchQuery}
                                    </h3>
                                    <p className="text-slate-400 mt-1">
                                        <i className="bi bi-geo-alt mr-1"></i> {jobs.location}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm font-medium">
                                        <i className="bi bi-check-circle mr-1"></i> {jobs.platforms.length} Platforms
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Job Platforms - Direct Links */}
                        <div className="bg-slate-800/30 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-6">
                            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                <i className="bi bi-link-45deg text-blue-400"></i>
                                Find Jobs on These Platforms
                            </h3>
                            <p className="text-slate-400 text-sm mb-6">
                                Click any link below to view real job listings matching your criteria
                            </p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {jobs.platforms.map((platform, index) => (
                                    <a
                                        key={index}
                                        href={platform.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="group p-5 bg-slate-700/30 hover:bg-slate-700/50 rounded-xl border border-slate-600/50 hover:border-blue-500/50 transition-all"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div
                                                className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0"
                                                style={{ backgroundColor: platform.color + '20' }}
                                            >
                                                <i className={`bi ${platform.icon} text-2xl`} style={{ color: platform.color }}></i>
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors flex items-center gap-2">
                                                    {platform.name}
                                                    <i className="bi bi-box-arrow-up-right text-sm opacity-0 group-hover:opacity-100 transition-opacity"></i>
                                                </h4>
                                                <p className="text-slate-400 text-sm">{platform.description}</p>
                                            </div>
                                        </div>
                                    </a>
                                ))}
                            </div>
                        </div>

                        {/* AI Market Insights */}
                        {jobs.insights && (
                            <>
                                <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-2xl p-6">
                                    <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                        <i className="bi bi-graph-up-arrow text-purple-400"></i>
                                        Market Insights for {jobs.searchQuery}
                                    </h3>

                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                                        {jobs.insights.marketInsights && (
                                            <>
                                                <div className="bg-slate-800/50 rounded-xl p-4 text-center">
                                                    <p className="text-slate-400 text-sm mb-1">Demand</p>
                                                    <p className={`text-xl font-bold ${jobs.insights.marketInsights.demandLevel === 'High' ? 'text-green-400' :
                                                            jobs.insights.marketInsights.demandLevel === 'Medium' ? 'text-yellow-400' : 'text-red-400'
                                                        }`}>
                                                        {jobs.insights.marketInsights.demandLevel}
                                                    </p>
                                                </div>
                                                <div className="bg-slate-800/50 rounded-xl p-4 text-center">
                                                    <p className="text-slate-400 text-sm mb-1">Salary Range</p>
                                                    <p className="text-lg font-bold text-green-400">
                                                        {jobs.insights.marketInsights.salaryRange}
                                                    </p>
                                                </div>
                                            </>
                                        )}
                                    </div>

                                    {/* Top Skills */}
                                    {jobs.insights.marketInsights?.topSkills && (
                                        <div className="mb-4">
                                            <h4 className="text-sm font-semibold text-slate-300 mb-3">Top Skills in Demand</h4>
                                            <div className="flex flex-wrap gap-2">
                                                {jobs.insights.marketInsights.topSkills.map((skill, i) => (
                                                    <span key={i} className="px-3 py-1.5 bg-purple-500/20 text-purple-300 rounded-full text-sm">
                                                        {skill}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Top Companies */}
                                    {jobs.insights.marketInsights?.topCompanies && (
                                        <div className="mb-4">
                                            <h4 className="text-sm font-semibold text-slate-300 mb-3">Top Hiring Companies</h4>
                                            <div className="flex flex-wrap gap-2">
                                                {jobs.insights.marketInsights.topCompanies.map((company, i) => (
                                                    <span key={i} className="px-3 py-1.5 bg-blue-500/20 text-blue-300 rounded-full text-sm">
                                                        {company}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Growth Outlook */}
                                    {jobs.insights.marketInsights?.growthOutlook && (
                                        <p className="text-slate-300 text-sm bg-slate-800/30 rounded-lg p-3">
                                            <i className="bi bi-lightbulb text-yellow-400 mr-2"></i>
                                            {jobs.insights.marketInsights.growthOutlook}
                                        </p>
                                    )}
                                </div>

                                {/* Job Search Tips */}
                                {jobs.insights.tips && jobs.insights.tips.length > 0 && (
                                    <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/30 rounded-2xl p-6">
                                        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                            <i className="bi bi-lightbulb-fill text-amber-400"></i>
                                            Tips for Your Job Search
                                        </h3>
                                        <ul className="space-y-3">
                                            {jobs.insights.tips.map((tip, i) => (
                                                <li key={i} className="flex items-start gap-3 text-slate-300">
                                                    <span className="w-6 h-6 rounded-full bg-amber-500/20 flex items-center justify-center flex-shrink-0 text-amber-400 text-sm font-bold mt-0.5">
                                                        {i + 1}
                                                    </span>
                                                    <span>{tip}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {/* Resume Keywords */}
                                {jobs.insights.keywords && jobs.insights.keywords.length > 0 && (
                                    <div className="bg-slate-800/30 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-6">
                                        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                            <i className="bi bi-tags text-cyan-400"></i>
                                            Keywords to Include in Your Resume
                                        </h3>
                                        <div className="flex flex-wrap gap-2">
                                            {jobs.insights.keywords.map((keyword, i) => (
                                                <span key={i} className="px-4 py-2 bg-cyan-500/20 text-cyan-300 rounded-xl text-sm font-medium border border-cyan-500/30">
                                                    {keyword}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                )}

                {/* Loading State */}
                {loading && (
                    <div className="bg-slate-800/30 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-12 text-center">
                        <div className="w-16 h-16 mx-auto bg-blue-500/20 rounded-full flex items-center justify-center mb-4 animate-pulse">
                            <i className="bi bi-briefcase text-3xl text-blue-400"></i>
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">Preparing Job Search Links...</h3>
                        <p className="text-slate-400">Generating direct links to real job listings</p>
                    </div>
                )}

                {/* Initial State */}
                {!searched && (
                    <div className="bg-slate-800/30 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-12 text-center">
                        <div className="w-24 h-24 mx-auto bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-3xl flex items-center justify-center mb-6">
                            <i className="bi bi-briefcase text-5xl text-blue-400"></i>
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-3">Find Real Jobs</h3>
                        <p className="text-slate-400 max-w-md mx-auto mb-6">
                            Use the filters above to search for jobs. We'll generate direct links to job listings on LinkedIn, Indeed, Glassdoor, and more.
                        </p>
                        <div className="flex flex-wrap justify-center gap-3">
                            {["LinkedIn", "Indeed", "Glassdoor", "Google Jobs"].map((platform, i) => (
                                <span key={i} className="px-4 py-2 bg-slate-700/50 rounded-full text-slate-300 text-sm">
                                    <i className="bi bi-check-circle-fill text-green-400 mr-1"></i> {platform}
                                </span>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default AIJobSearch;
