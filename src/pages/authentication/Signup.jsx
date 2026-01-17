import React, { useState, useMemo } from "react";
import axios from "axios";
import { SignupFormValidate } from "../../utils/signupFormvalidate";
import { useNavigate } from 'react-router-dom';
import { Link } from "react-router-dom";
import { BACKEND_URL } from "../../../config/constant";

// Country codes data
const countryCodes = [
  { code: "+91", country: "IN", flag: "🇮🇳" },
  { code: "+1", country: "US", flag: "🇺🇸" },
  { code: "+44", country: "UK", flag: "🇬🇧" },
  { code: "+971", country: "UAE", flag: "🇦🇪" },
  { code: "+65", country: "SG", flag: "🇸🇬" },
  { code: "+61", country: "AU", flag: "🇦🇺" },
  { code: "+49", country: "DE", flag: "🇩🇪" },
  { code: "+33", country: "FR", flag: "🇫🇷" },
  { code: "+81", country: "JP", flag: "🇯🇵" },
  { code: "+86", country: "CN", flag: "🇨🇳" },
  { code: "+82", country: "KR", flag: "🇰🇷" },
  { code: "+7", country: "RU", flag: "🇷🇺" },
  { code: "+55", country: "BR", flag: "🇧🇷" },
  { code: "+27", country: "ZA", flag: "🇿🇦" },
  { code: "+234", country: "NG", flag: "🇳🇬" },
];

function Signup() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [countryCode, setCountryCode] = useState("+91");
  const [number, setNumber] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [cPassword, setCPassword] = useState("");
  const [formError, setFormError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);

  // Password strength calculation
  const passwordStrength = useMemo(() => {
    if (!password) return { score: 0, label: "", color: "" };

    let score = 0;
    const checks = {
      length: password.length >= 8,
      lowercase: /[a-z]/.test(password),
      uppercase: /[A-Z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    };

    score = Object.values(checks).filter(Boolean).length;

    if (score <= 1) return { score: 20, label: "Very Weak", color: "bg-red-500", checks };
    if (score === 2) return { score: 40, label: "Weak", color: "bg-orange-500", checks };
    if (score === 3) return { score: 60, label: "Fair", color: "bg-yellow-500", checks };
    if (score === 4) return { score: 80, label: "Good", color: "bg-blue-500", checks };
    return { score: 100, label: "Strong", color: "bg-green-500", checks };
  }, [password]);

  async function handleSignUp() {
    try {
      // Validate with just the phone number (10 digits)
      const result = SignupFormValidate(name, number, email, password, cPassword);
      if (result) {
        setFormError(result);
        return;
      }

      // Check if terms are agreed
      if (!agreeToTerms) {
        setFormError("Please agree to the Terms and Conditions to continue");
        return;
      }

      setFormError("");
      setLoading(true);

      // Send full number with country code to backend
      const fullNumber = `${countryCode}${number}`;

      const user = {
        name,
        number: fullNumber,
        email,
        password,
      };

      const response = await axios.post(`${BACKEND_URL}/signup`, user, {
        withCredentials: true,
      });

      if (response.status === 200) {
        setIsSuccess(true);
        setTimeout(() => {
          navigate('/signin');
        }, 3000);
      }
    } catch (err) {
      setFormError(err.response?.data?.message || "An error occurred during registration");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-start md:items-center justify-center p-4 bg-black relative overflow-hidden">
      {/* Enhanced Starry background with subtle gradient */}
      <div className="absolute inset-0 z-0 bg-gradient-to-br from-black via-purple-900/10 to-black">
        <div className="stars-layer layer1"></div>
        <div className="stars-layer layer2"></div>
        <div className="stars-layer layer3"></div>
        <div className="stars-layer layer4"></div>

        {/* UFO Spaceships - Clean and Spacious */}
        {!isSuccess && (
          <>
            <div className="ufo-float ufo1">
              <div className="text-5xl">🛸</div>
              <div className="tech-label bg-purple-600 shadow-purple-500/50">AI</div>
            </div>
            <div className="ufo-float ufo2">
              <div className="text-5xl">🛸</div>
              <div className="tech-label bg-blue-600 shadow-blue-500/50">React</div>
            </div>
            <div className="ufo-float ufo3">
              <div className="text-5xl">🛸</div>
              <div className="tech-label bg-orange-600 shadow-orange-500/50">Python</div>
            </div>
            <div className="ufo-float ufo4">
              <div className="text-5xl">🛸</div>
              <div className="tech-label bg-emerald-600 shadow-emerald-500/50">Node</div>
            </div>
            <div className="ufo-float ufo5">
              <div className="text-5xl">🛸</div>
              <div className="tech-label bg-pink-600 shadow-pink-500/50">ML</div>
            </div>

            {/* Orange Developer Symbols - Balanced Placement */}
            <div className="absolute top-12 left-16 text-orange-400/70 text-3xl font-mono animate-float-gentle">{'{'}</div>
            <div className="absolute top-16 right-24 text-orange-400/70 text-3xl font-mono animate-float-gentle" style={{ animationDelay: '1s' }}>{'}'}</div>
            <div className="absolute bottom-24 left-20 text-orange-400/70 text-3xl font-mono animate-float-gentle" style={{ animationDelay: '2s' }}>{'</>'}</div>
            <div className="absolute bottom-16 right-16 text-orange-400/70 text-3xl font-mono animate-float-gentle" style={{ animationDelay: '1.5s' }}>{'()'}</div>
            <div className="absolute top-1/3 left-12 text-orange-400/70 text-2xl font-mono animate-float-gentle" style={{ animationDelay: '0.5s' }}>{'[]'}</div>
            <div className="absolute top-1/3 right-12 text-orange-400/70 text-2xl font-mono animate-float-gentle" style={{ animationDelay: '2.5s' }}>{'...'}</div>
            <div className="absolute bottom-1/3 left-24 text-orange-400/70 text-3xl font-mono animate-float-gentle" style={{ animationDelay: '3s' }}>{'<'}</div>
            <div className="absolute bottom-1/3 right-24 text-orange-400/70 text-3xl font-mono animate-float-gentle" style={{ animationDelay: '0.8s' }}>{'>'}</div>
            <div className="absolute top-1/4 left-1/4 text-orange-400/70 text-2xl font-mono animate-float-gentle" style={{ animationDelay: '1.2s' }}>{'=>'}</div>
            <div className="absolute top-2/3 right-1/3 text-orange-400/70 text-2xl font-mono animate-float-gentle" style={{ animationDelay: '2.2s' }}>{'const'}</div>
          </>
        )}
      </div>

      {/* Main Container */}
      <div className="w-full max-w-4xl relative z-10 mx-2 mt-8 md:mt-0">
        <div className="flex flex-col md:flex-row backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden bg-gradient-to-br from-gray-900/70 via-gray-800/60 to-gray-900/70 border border-white/10 transition-all duration-500">
          {/* Left Side - Updated Content */}
          <div className="hidden md:block w-full md:w-1/2 p-8">
            <div className="h-full flex flex-col justify-between">
              <div>
                <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-[50%] flex items-center justify-center mb-6 shadow-lg shadow-purple-500/30 ">
                  <span className="text-white text-3xl font-bold tracking-tighter rotate-[21deg]">W</span>
                </div>
                <h1 className="text-3xl font-bold text-white mb-3">
                  Master <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-500">Tech Skills</span>
                </h1>
                <p className="text-gray-300/90 text-base mb-6">
                  Join thousands of learners mastering cutting-edge technologies
                </p>

                <div className="space-y-5">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 mt-1">
                      <div className="h-6 w-6 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center">
                        <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-lg font-medium text-white">Gen AI, ML, DL & NLP</h3>
                      <p className="mt-1 text-gray-300/90">
                        Master Generative AI, Machine Learning, Deep Learning & Natural Language Processing
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="flex-shrink-0 mt-1">
                      <div className="h-6 w-6 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center">
                        <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-lg font-medium text-white">Full Stack & Cloud</h3>
                      <p className="mt-1 text-gray-300/90">
                        Learn Full Stack Development with AWS, Azure & Cloud technologies
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="flex-shrink-0 mt-1">
                      <div className="h-6 w-6 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center">
                        <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-lg font-medium text-white">Interview Preparation</h3>
                      <p className="mt-1 text-gray-300/90">
                        Problem solving, DSA & comprehensive interview prep for top companies
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-white/10">
                <p className="text-gray-300/90">
                  Already have an account?{' '}
                  <Link to="/signin" className="text-indigo-400 hover:text-indigo-300 hover:underline">
                    Sign in here
                  </Link>
                </p>
              </div>
            </div>
          </div>

          {/* Vertical Divider (Visible on large screens) */}
          <div className="hidden md:block w-px bg-white/10"></div>

          {/* Right Side - Form (Always visible) */}
          <div className="w-full md:w-1/2 p-5 relative z-10" style={isSuccess ? { transform: 'scale(0.95)' } : { transform: 'scale(1)' }}>
            {isSuccess ? (
              <div className="flex flex-col items-center justify-center py-12 px-4">
                {/* Animated Success Checkmark */}
                <div className="relative mb-8">
                  <div className="w-32 h-32 bg-gradient-to-br from-emerald-400 to-teal-600 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/30">
                    <svg
                      className="h-20 w-20 text-white animate-checkmark"
                      viewBox="0 0 52 52"
                      fill="none"
                    >
                      <circle cx="26" cy="26" r="25" fill="none" stroke="currentColor" strokeWidth="2" />
                      <path
                        className="animate-checkmark-path"
                        stroke="currentColor"
                        strokeWidth="4"
                        strokeLinecap="round"
                        d="M14.1 27.2l7.1 7.2 16.7-16.8"
                      />
                    </svg>
                  </div>
                  <div className="absolute -inset-4 rounded-full border-2 border-teal-400/30 animate-ping-slow opacity-0"></div>
                </div>

                <h2 className="text-3xl font-bold text-white text-center mb-2">
                  Welcome Aboard!
                </h2>
                <p className="text-gray-300 text-center max-w-md">
                  Your account has been successfully created. Redirecting you to sign in...
                </p>

                {/* Progress bar */}
                <div className="w-full bg-white/10 rounded-full h-1.5 mt-6 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-emerald-400 to-teal-600 h-1.5 rounded-full animate-progress"
                    style={{ animationDuration: '3s' }}
                  ></div>
                </div>
              </div>
            ) : (
              <>
                {/* Logo and Header */}
                <div className="text-center mb-8">
                  <h1 className="text-xl font-bold text-white mb-2">
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-500">Learn Tech</span> with Us
                  </h1>
                  <p className="text-sm text-gray-300/90">
                    Start your journey into AI, ML & Full Stack Development
                  </p>
                </div>

                {/* Error Message */}
                {formError && (
                  <div className="bg-red-500/10 border border-red-500/30 text-red-300 px-4 py-3 rounded-xl mb-6 text-sm flex items-start">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <span>{formError}</span>
                  </div>
                )}

                {/* Form Fields */}
                <div className="space-y-5">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-300/90 flex items-center">
                      Full Name
                      <span className="text-red-400 ml-1">*</span>
                    </label>
                    <div className="flex items-center bg-white/5 border border-white/10 rounded-xl overflow-hidden transition-all duration-200 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/30 hover:border-white/20">
                      <span className="px-3 text-gray-400">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                        </svg>
                      </span>
                      <input
                        type="text"
                        placeholder="John Doe"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full p-2 outline-none bg-transparent text-white text-sm placeholder-gray-400/70"
                      />
                    </div>
                  </div>

                  {/* Mobile Number with Country Code */}
                  <div className="space-y-1.5 relative">
                    <label className="text-sm font-medium text-gray-300/90 flex items-center">
                      Mobile Number
                      <span className="text-red-400 ml-1">*</span>
                    </label>
                    <div className="flex items-center bg-white/5 border border-white/10 rounded-xl transition-all duration-200 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/30 hover:border-white/20">
                      {/* Country Code Dropdown */}
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                          className="flex items-center gap-1 px-3 py-2 text-white hover:bg-white/5 transition-colors border-r border-white/10"
                        >
                          <span className="text-lg">{countryCodes.find(c => c.code === countryCode)?.flag}</span>
                          <span className="text-sm">{countryCode}</span>
                          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>

                        {showCountryDropdown && (
                          <div className="absolute top-full left-0 mt-1 w-48 max-h-60 overflow-y-auto bg-gray-900 border border-white/10 rounded-xl shadow-2xl z-[100]">
                            {countryCodes.map((country) => (
                              <button
                                key={country.code}
                                type="button"
                                onClick={() => {
                                  setCountryCode(country.code);
                                  setShowCountryDropdown(false);
                                }}
                                className={`w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-white/10 transition-colors ${countryCode === country.code ? 'bg-indigo-500/20' : ''}`}
                              >
                                <span className="text-lg">{country.flag}</span>
                                <span className="text-white text-sm">{country.code}</span>
                                <span className="text-gray-400 text-xs">{country.country}</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      <input
                        type="tel"
                        placeholder="1234567890"
                        value={number}
                        onChange={(e) => setNumber(e.target.value.replace(/\D/g, ''))}
                        className="flex-1 p-2 outline-none bg-transparent text-white text-sm placeholder-gray-400/70"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-300/90 flex items-center">
                      Email
                      <span className="text-red-400 ml-1">*</span>
                    </label>
                    <div className="flex items-center bg-white/5 border border-white/10 rounded-xl overflow-hidden transition-all duration-200 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/30 hover:border-white/20">
                      <span className="px-3 text-gray-400">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                          <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                        </svg>
                      </span>
                      <input
                        type="email"
                        placeholder="john@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full p-2 outline-none bg-transparent text-white text-sm placeholder-gray-400/70"
                      />
                    </div>
                  </div>

                  {/* Password with Strength Indicator */}
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-300/90 flex items-center">
                      Password
                      <span className="text-red-400 ml-1">*</span>
                    </label>
                    <div className="flex items-center bg-white/5 border border-white/10 rounded-xl overflow-hidden transition-all duration-200 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/30 hover:border-white/20">
                      <span className="px-3 text-gray-400">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                        </svg>
                      </span>
                      <input
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full p-2 outline-none bg-transparent text-white text-sm placeholder-gray-400/70"
                      />
                    </div>

                    {/* Password Strength Indicator */}
                    {password && (
                      <div className="mt-2 space-y-2">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                            <div
                              className={`h-full ${passwordStrength.color} transition-all duration-300`}
                              style={{ width: `${passwordStrength.score}%` }}
                            ></div>
                          </div>
                          <span className={`text-xs font-medium ${passwordStrength.score <= 40 ? 'text-red-400' :
                            passwordStrength.score <= 60 ? 'text-yellow-400' :
                              passwordStrength.score <= 80 ? 'text-blue-400' : 'text-green-400'
                            }`}>
                            {passwordStrength.label}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-2 text-xs">
                          <span className={`px-2 py-0.5 rounded ${passwordStrength.checks?.length ? 'bg-green-500/20 text-green-400' : 'bg-white/5 text-gray-500'}`}>
                            8+ chars
                          </span>
                          <span className={`px-2 py-0.5 rounded ${passwordStrength.checks?.uppercase ? 'bg-green-500/20 text-green-400' : 'bg-white/5 text-gray-500'}`}>
                            A-Z
                          </span>
                          <span className={`px-2 py-0.5 rounded ${passwordStrength.checks?.lowercase ? 'bg-green-500/20 text-green-400' : 'bg-white/5 text-gray-500'}`}>
                            a-z
                          </span>
                          <span className={`px-2 py-0.5 rounded ${passwordStrength.checks?.number ? 'bg-green-500/20 text-green-400' : 'bg-white/5 text-gray-500'}`}>
                            0-9
                          </span>
                          <span className={`px-2 py-0.5 rounded ${passwordStrength.checks?.special ? 'bg-green-500/20 text-green-400' : 'bg-white/5 text-gray-500'}`}>
                            @#$%
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-300/90 flex items-center">
                      Confirm Password
                      <span className="text-red-400 ml-1">*</span>
                    </label>
                    <div className="flex items-center bg-white/5 border border-white/10 rounded-xl overflow-hidden transition-all duration-200 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/30 hover:border-white/20">
                      <span className="px-3 text-gray-400">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                        </svg>
                      </span>
                      <input
                        type="password"
                        placeholder="••••••••"
                        value={cPassword}
                        onChange={(e) => setCPassword(e.target.value)}
                        className="w-full p-2 outline-none bg-transparent text-white text-sm placeholder-gray-400/70"
                      />
                    </div>
                    {cPassword && password !== cPassword && (
                      <p className="text-red-400 text-xs mt-1">Passwords do not match</p>
                    )}
                  </div>

                  {/* Terms and Conditions */}
                  <div className="flex items-start mt-4">
                    <div className="flex items-center h-5">
                      <input
                        id="terms"
                        name="terms"
                        type="checkbox"
                        checked={agreeToTerms}
                        onChange={(e) => setAgreeToTerms(e.target.checked)}
                        className="h-4 w-4 rounded border-white/20 bg-white/5 text-indigo-500 focus:ring-indigo-500 cursor-pointer"
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor="terms" className="text-gray-300/90 cursor-pointer">
                        I agree to the{' '}
                        <a href="/privacy-policy" target="_blank" className="text-indigo-400 hover:text-indigo-300 hover:underline">
                          Terms and Conditions
                        </a>
                        <span className="text-red-400 ml-1">*</span>
                      </label>
                    </div>
                  </div>

                  {/* Sign Up Button */}
                  <button
                    onClick={handleSignUp}
                    disabled={loading || !agreeToTerms}
                    className={`w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-3.5 rounded-xl font-medium transition-all duration-300 flex items-center justify-center shadow-lg shadow-indigo-500/20 mt-4 ${!agreeToTerms ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-90 hover:shadow-indigo-500/30'}`}
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Creating Account...
                      </>
                    ) : (
                      "Sign Up Now"
                    )}
                  </button>
                </div>

                {/* Sign in option (shown on mobile only) */}
                <div className="mt-8 pt-6 border-t border-white/10 md:hidden">
                  <p className="text-gray-300/90 text-center">
                    Already have an account?{' '}
                    <Link to="/signin" className="text-indigo-400 hover:text-indigo-300 hover:underline">
                      Sign in here
                    </Link>
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* CSS Animations */}
      <style>{`
        .ufo-float {
          position: absolute;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
        }

        .tech-label {
          font-size: 10px;
          font-weight: bold;
          color: white;
          padding: 2px 8px;
          border-radius: 9999px;
          box-shadow: 0 0 10px;
        }

        .ufo1 {
          top: 50%;
          left: 50%;
          animation: orbit-circle-1 20s linear infinite;
        }

        .ufo2 {
          top: 50%;
          left: 50%;
          animation: orbit-circle-2 25s linear infinite;
        }

        .ufo3 {
          top: 50%;
          left: 50%;
          animation: orbit-circle-3 18s linear infinite reverse;
        }

        .ufo4 {
          top: 50%;
          left: 50%;
          animation: orbit-circle-4 22s linear infinite;
        }

        .ufo5 {
          top: 50%;
          left: 50%;
          animation: orbit-circle-5 24s linear infinite reverse;
        }

        @keyframes orbit-circle-1 {
          from {
            transform: translate(-50%, -50%) rotate(0deg) translateX(520px) rotate(0deg);
          }
          to {
            transform: translate(-50%, -50%) rotate(360deg) translateX(520px) rotate(-360deg);
          }
        }

        @keyframes orbit-circle-2 {
          from {
            transform: translate(-50%, -50%) rotate(72deg) translateX(580px) rotate(-72deg);
          }
          to {
            transform: translate(-50%, -50%) rotate(432deg) translateX(580px) rotate(-432deg);
          }
        }

        @keyframes orbit-circle-3 {
          from {
            transform: translate(-50%, -50%) rotate(144deg) translateX(500px) rotate(-144deg);
          }
          to {
            transform: translate(-50%, -50%) rotate(504deg) translateX(500px) rotate(-504deg);
          }
        }

        @keyframes orbit-circle-4 {
          from {
            transform: translate(-50%, -50%) rotate(216deg) translateX(550px) rotate(-216deg);
          }
          to {
            transform: translate(-50%, -50%) rotate(576deg) translateX(550px) rotate(-576deg);
          }
        }

        @keyframes orbit-circle-5 {
          from {
            transform: translate(-50%, -50%) rotate(288deg) translateX(530px) rotate(-288deg);
          }
          to {
            transform: translate(-50%, -50%) rotate(648deg) translateX(530px) rotate(-648deg);
          }
        }

        @keyframes float-gentle {
          0%, 100% {
            transform: translateY(0);
            opacity: 0.6;
          }
          50% {
            transform: translateY(-20px);
            opacity: 0.8;
          }
        }

        .animate-float-gentle {
          animation: float-gentle 4s ease-in-out infinite;
        }

        .stars-layer {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          width: 100%;
          height: 100%;
          background: url('https://s3-us-west-2.amazonaws.com/s.cdpn.io/1231630/stars.png') repeat;
          animation: deep-stars linear infinite;
          transform-origin: center;
        }

        .layer1 {
          opacity: 1;
          animation-duration: 25s;
          background-size: 1200px 1200px;
          filter: blur(0.8px);
        }

        .layer2 {
          opacity: 0.7;
          animation-duration: 20s;
          background-size: 800px 800px;
          transform: scale(1.2);
          filter: blur(0.4px);
        }

        .layer3 {
          opacity: 0.5;
          animation-duration: 15s;
          background-size: 500px 500px;
          transform: scale(1.5);
        }

        @keyframes deep-stars {
          0% {
            transform: scale(1);
            opacity: 1;
          }
          100% {
            transform: scale(3);
            opacity: 0;
          }
        }

        @keyframes float {
          0% {
            transform: translateY(0) translateX(0);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            transform: translateY(-100vh) translateX(20px);
            opacity: 0;
          }
        }

        @keyframes ping-slow {
          0% {
            transform: scale(0.8);
            opacity: 0.8;
          }
          70%, 100% {
            transform: scale(1.3);
            opacity: 0;
          }
        }

        .animate-ping-slow {
          animation: ping-slow 2s cubic-bezier(0, 0, 0.2, 1) infinite;
        }

        .animate-checkmark {
          animation: checkmark-scale 0.3s ease-in-out both;
        }

        .animate-checkmark-path {
          stroke-dasharray: 48;
          stroke-dashoffset: 48;
          animation: checkmark-stroke 0.5s cubic-bezier(0.65, 0, 0.45, 1) 0.3s forwards;
        }

        @keyframes checkmark-stroke {
          100% {
            stroke-dashoffset: 0;
          }
        }

        @keyframes checkmark-scale {
          0%, 100% {
            transform: none;
          }
          50% {
            transform: scale3d(1.1, 1.1, 1);
          }
        }

        .animate-progress {
          animation: progress-bar 3s linear forwards;
        }

        @keyframes progress-bar {
          0% {
            width: 0%;
          }
          100% {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}

export default Signup;