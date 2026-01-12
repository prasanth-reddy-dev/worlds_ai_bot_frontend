import React, { useState } from "react";
import axios from "axios";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { setUser } from "../../redux/userSlice";
import { Link } from "react-router-dom";
import { BACKEND_URL } from "../../../config/constant";
function Signin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [formError, setFormError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false); // Added for success animation
  const dispatch = useDispatch();
  const navigate = useNavigate();

  async function handleSignIn() {
    try {
      if (!email || !password) {
        setFormError("Email and password are required");
        return;
      }

      setLoading(true);
      setFormError("");

      const response = await axios.post(
        `${BACKEND_URL}/signin`,
        { email, password },
        { withCredentials: true }
      );

      // Store JWT token in localStorage
      if (response.data && response.data.user) {
        // Get token from response body (primary source)
        let token = response.data.token;
        // Remove 'Bearer ' prefix if present
        if (token && token.startsWith('Bearer ')) {
          token = token.substring(7);
        }
        if (token) {
          localStorage.setItem('token', token);
        }
        dispatch(setUser(response.data.user));
        setIsSuccess(true); // Trigger success animation
        setTimeout(() => {
          navigate("/"); // Navigate after animation
        }, 3000); // 3s for full animation
      }
    } catch (err) {
      setFormError(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-start md:items-center justify-center p-2 bg-black relative overflow-hidden">
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

      {/* Enhanced card with glass morphism effect - Made smaller */}
      <div className={`w-full max-w-md backdrop-blur-lg rounded-2xl shadow-xl p-6 ${isSuccess ? '' : 'border border-white/10'} relative z-10 mx-2 mt-8 md:mt-0 bg-gradient-to-br from-gray-900/80 to-gray-800/80`}>
        {isSuccess ? (
          <div className="flex flex-col items-center justify-center h-full py-12">
            <div className="success-planet flex flex-col items-center">
              <div className="w-32 h-32 bg-gradient-to-br from-emerald-400 to-teal-600 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/30 animate-pulse">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="mt-6 text-3xl font-bold text-white">Welcome!</h2>
              <p className="mt-2 text-gray-300">You're now signed in</p>
            </div>
          </div>
        ) : (
          <>
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-gradient-to-br from-sky-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-500/30">
                <span className="text-white text-3xl font-bold tracking-tighter rotate-[21deg]">W</span>

              </div>
              <h1 className="text-xl font-bold text-white mb-2 bg-clip-text text-transparent bg-gradient-to-r from-sky-400 to-blue-500">
                Welcome Back
              </h1>
              <p className="text-sm text-gray-300">
                Best teaching platform integrated for your learning journey
              </p>
            </div>

            {formError && (
              <div className="bg-red-500/10 border border-red-500/50 text-red-300 px-4 py-3 rounded-lg mb-6 text-sm flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {formError}
              </div>
            )}

            <form onSubmit={(e) => { e.preventDefault(); handleSignIn(); }} className="space-y-5">
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-300">Email</label>
                <div className="flex items-center bg-white/5 border border-white/10 rounded-lg overflow-hidden transition-all focus-within:border-sky-500 focus-within:ring-2 focus-within:ring-sky-500/30">
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
                    className="w-full p-3 outline-none bg-transparent text-white placeholder-gray-400"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-300">Password</label>
                <div className="flex items-center bg-white/5 border border-white/10 rounded-lg overflow-hidden transition-all focus-within:border-sky-500 focus-within:ring-2 focus-within:ring-sky-500/30">
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
                    className="w-full p-3 outline-none bg-transparent text-white placeholder-gray-400"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 rounded border-white/10 bg-white/5 text-sky-500 focus:ring-sky-500"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-300">
                    Remember me
                  </label>
                </div>

                <Link to="/reset-password-request" className="text-sm text-sky-400 hover:text-sky-300 hover:underline">
                  Forgot password?
                </Link>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-sky-500 to-blue-600 text-white py-3 rounded-lg font-medium hover:opacity-90 transition-all flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Signing In...
                  </>
                ) : (
                  "Sign In"
                )}
              </button>
            </form>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-gray-800/80 text-gray-400">New to platform?</span>
              </div>
            </div>

            <Link
              to="/signup"
              className="w-full border border-white/10 text-white py-3 rounded-lg font-medium hover:bg-white/5 transition-all flex items-center justify-center"
            >
              Create an account
            </Link>
          </>
        )}
      </div>

      {/* Enhanced CSS for starry background and success planet */}
      <style>{`
        .stars-layer {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          width: 100%;
          height: 100%;
          background: url("https://s3-us-west-2.amazonaws.com/s.cdpn.io/1231630/stars.png") repeat;
          animation: deep-stars linear infinite;
          transform-origin: center;
        }
  
        .layer1 {
          opacity: 1;
          animation-duration: 20s;
          background-size: 1200px 1200px;
          filter: blur(1px);
        }
  
        .layer2 {
          opacity: 0.8;
          animation-duration: 15s;
          background-size: 800px 800px;
          transform: scale(1.2);
          filter: blur(0.5px);
        }
  
        .layer3 {
          opacity: 0.6;
          animation-duration: 10s;
          background-size: 500px 500px;
          transform: scale(1.5);
        }
  
        .layer4 {
          opacity: 0.4;
          animation-duration: 5s;
          background-size: 300px 300px;
          transform: scale(2);
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

        .ufo6 {
          top: 50%;
          left: 50%;
          animation: orbit-circle-6 19s linear infinite;
        }

        .ufo7 {
          top: 50%;
          left: 50%;
          animation: orbit-circle-7 21s linear infinite reverse;
        }

        .ufo8 {
          top: 50%;
          left: 50%;
          animation: orbit-circle-8 23s linear infinite;
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
      `}</style>
    </div>
  );
}

export default Signin;