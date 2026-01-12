import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import APIService from "../services/api";
import { clearUser } from "../redux/userSlice";
import { useNavigate } from "react-router-dom";

function Navbar(props) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useSelector((state) => state.user);
  const name = user?.name;
  const role = user?.role;
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [bootcamps, setBootcamps] = useState([]);

  // Fetch bootcamps (actual bootcamps, not roadmap topics)
  useEffect(() => {
    const fetchBootcamps = async () => {
      try {
        const response = await APIService.bootcamps.getAll();
        const bootcampsData = response?.data?.data || response?.data || [];
        setBootcamps(Array.isArray(bootcampsData) ? bootcampsData : []);
      } catch (error) {
        console.error('Error fetching bootcamps:', error);
        setBootcamps([]);
      }
    };

    fetchBootcamps();
  }, []);

  // Scroll detection
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSignOut = async () => {
    try {
      await APIService.auth.signout();
      // Clear localStorage token
      localStorage.removeItem('token');
      // Clear Redux user state
      dispatch(clearUser());
      // Navigate to home page
      navigate("/");
    } catch (error) {
      // Even if API call fails, clear local data
      localStorage.removeItem('token');
      dispatch(clearUser());
      navigate("/");
    }
  };

  const isActive = (path) => location.pathname === path;

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled
        ? 'bg-slate-900/95 backdrop-blur-lg shadow-xl border-b border-white/10'
        : 'bg-transparent'
        }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Mobile: Hamburger on left */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 text-white hover:bg-white/10 rounded-lg transition-all mr-3"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>

            {/* Logo - Always visible on all screens */}
            <Link to="/" className="flex items-center gap-0.5 flex-shrink-0">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center shadow-lg">
                <span className="text-white text-xl font-black rotate-[30deg]">W</span>
              </div>
              <span className="text-lg sm:text-xl font-bold text-white">orldsAiBot</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-1">
              <Link to="/" className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${isActive("/")
                ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white"
                : "text-gray-300 hover:text-white hover:bg-white/10"
                }`}>
                Home
              </Link>
              <Link to="/courses" className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${isActive("/courses")
                ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white"
                : "text-gray-300 hover:text-white hover:bg-white/10"
                }`}>
                Courses
              </Link>
              <button
                onClick={() => setIsModalOpen(true)}
                className="px-4 py-2 rounded-lg text-sm font-medium text-gray-300 hover:text-white hover:bg-white/10 transition-all"
              >
                Bootcamps
              </button>
              <Link to="/about-us" className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${isActive("/about-us")
                ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white"
                : "text-gray-300 hover:text-white hover:bg-white/10"
                }`}>
                About
              </Link>
              <Link to="/products" className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${isActive("/products")
                ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white"
                : "text-gray-300 hover:text-white hover:bg-white/10"
                }`}>
                Products
              </Link>
              <Link to="/carrers" className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${isActive("/carrers")
                ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white"
                : "text-gray-300 hover:text-white hover:bg-white/10"
                }`}>
                Careers
              </Link>
              <Link to="/contact" className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${isActive("/contact")
                ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white"
                : "text-gray-300 hover:text-white hover:bg-white/10"
                }`}>
                Contact
              </Link>
            </div>

            {/* Auth Buttons - Desktop & Mobile */}
            <div className="flex items-center gap-2">
              {!user ? (
                <>
                  <Link to="/signin">
                    <button className="px-3 sm:px-5 py-2 text-xs sm:text-sm font-semibold text-white bg-white/10 rounded-lg hover:bg-white/20 transition-all">
                      Sign In
                    </button>
                  </Link>
                  <Link to="/signup">
                    <button className="px-3 sm:px-5 py-2 text-xs sm:text-sm font-semibold text-white bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg">
                      Sign Up
                    </button>
                  </Link>
                </>
              ) : (
                <div className="relative group">
                  <button className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-white font-bold text-xs sm:text-sm hover:scale-110 transition-transform">
                    {name ? (name[0] + name[1]).toUpperCase() : "U"}
                  </button>
                  <div className="absolute right-0 mt-2 w-48 bg-slate-900 rounded-lg shadow-xl border border-white/10 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                    <Link
                      to={role === "student" ? "/student-dashboard/profile" : "/admin-dashboard"}
                      className="block px-4 py-3 text-sm text-gray-300 hover:text-white hover:bg-white/10 rounded-t-lg transition-all"
                    >
                      Dashboard
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="w-full text-left px-4 py-3 text-sm text-gray-300 hover:text-white hover:bg-white/10 rounded-b-lg transition-all"
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Sidebar */}
      {isMobileMenuOpen && (
        <>
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden" onClick={() => setIsMobileMenuOpen(false)} />
          <div className="fixed top-0 left-0 bottom-0 w-72 bg-slate-900/98 backdrop-blur-lg border-r border-white/10 z-50 shadow-2xl lg:hidden transform transition-transform duration-300">
            <div className="p-6 border-b border-white/10">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-0.5">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center shadow-lg">
                    <span className="text-white text-xl font-black rotate-[30deg]">W</span>
                  </div>
                  <span className="text-lg font-bold text-white">orldsAiBot</span>
                </div>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-4 space-y-1 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 120px)' }}>
              <Link
                to="/"
                onClick={() => setIsMobileMenuOpen(false)}
                className={`block px-4 py-3 rounded-lg text-sm font-medium transition-all ${isActive("/") ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white" : "text-gray-300 hover:bg-white/10 hover:text-white"
                  }`}
              >
                Home
              </Link>
              <Link
                to="/courses"
                onClick={() => setIsMobileMenuOpen(false)}
                className={`block px-4 py-3 rounded-lg text-sm font-medium transition-all ${isActive("/courses") ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white" : "text-gray-300 hover:bg-white/10 hover:text-white"
                  }`}
              >
                Courses
              </Link>
              <button
                onClick={() => { setIsModalOpen(true); setIsMobileMenuOpen(false); }}
                className="w-full text-left px-4 py-3 rounded-lg text-sm font-medium text-gray-300 hover:bg-white/10 hover:text-white transition-all"
              >
                Bootcamps
              </button>
              <Link
                to="/about-us"
                onClick={() => setIsMobileMenuOpen(false)}
                className={`block px-4 py-3 rounded-lg text-sm font-medium transition-all ${isActive("/about-us") ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white" : "text-gray-300 hover:bg-white/10 hover:text-white"
                  }`}
              >
                About
              </Link>
              <Link
                to="/products"
                onClick={() => setIsMobileMenuOpen(false)}
                className={`block px-4 py-3 rounded-lg text-sm font-medium transition-all ${isActive("/products") ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white" : "text-gray-300 hover:bg-white/10 hover:text-white"
                  }`}
              >
                Products
              </Link>
              <Link
                to="/carrers"
                onClick={() => setIsMobileMenuOpen(false)}
                className={`block px-4 py-3 rounded-lg text-sm font-medium transition-all ${isActive("/carrers") ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white" : "text-gray-300 hover:bg-white/10 hover:text-white"
                  }`}
              >
                Careers
              </Link>
              <Link
                to="/contact"
                onClick={() => setIsMobileMenuOpen(false)}
                className={`block px-4 py-3 rounded-lg text-sm font-medium transition-all ${isActive("/contact") ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white" : "text-gray-300 hover:bg-white/10 hover:text-white"
                  }`}
              >
                Contact
              </Link>
            </div>
          </div>
        </>
      )}

      {/* Bootcamp Modal - Improved */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setIsModalOpen(false)}>
          <div className="bg-slate-900/95 backdrop-blur-xl rounded-2xl p-6 w-full max-w-md border border-white/10 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-bold text-white">Choose Your Bootcamp</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white transition-colors p-1 hover:bg-white/10 rounded-lg">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
              {bootcamps.length > 0 ? bootcamps.map((bootcamp) => (
                <Link
                  key={bootcamp._id}
                  to={`/free-class/${bootcamp._id}`}
                  onClick={() => setIsModalOpen(false)}
                  className="block px-4 py-3 rounded-lg bg-white/5 border border-white/10 hover:border-purple-500/50 hover:bg-gradient-to-r hover:from-purple-600/20 hover:to-pink-600/20 transition-all text-white text-sm font-medium"
                >
                  {bootcamp.courseName || bootcamp.roadMapName}
                </Link>
              )) : (
                <div className="text-center text-gray-400 py-6">
                  <p>No bootcamps available</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="h-16" />
    </>
  );
}

export default Navbar;