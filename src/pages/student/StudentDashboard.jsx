
import React, { useState } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import { clearUser } from "../../redux/userSlice";
import APIService from "../../services/api";
import { useNavigate } from "react-router-dom";


function StudentDashboard() {
  const { user } = useSelector((state) => state.user);
  const name = user?.name || "Guest";
  const email = user?.email || "";
  const one = name.length > 1 ? name[0] + name[1] : name[0] || "G";
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const location = useLocation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const sidebarOptions = [
    { to: "/student-dashboard/profile", icon: "bi-person-circle", label: "Profile", gradient: "from-blue-500 to-cyan-500" },
    { to: "/student-dashboard/profile/lectures", icon: "bi-collection-play-fill", label: "My Courses", gradient: "from-purple-500 to-pink-500" },
    { to: "/student-dashboard/profile/awards", icon: "bi-award-fill", label: "Certificates", gradient: "from-green-500 to-emerald-500" },
    { to: "/student-dashboard/profile/resume-templates", icon: "bi-journal-code", label: "Resume", gradient: "from-orange-500 to-red-500" },
    { to: "/student-dashboard/profile/editor", icon: "bi-code-slash", label: "Editor", gradient: "from-teal-500 to-cyan-500" },
    { to: "/student-dashboard/profile/ai-interview", icon: "bi-robot", label: "AI Interview", gradient: "from-violet-500 to-purple-500" },
    { to: "/student-dashboard/profile/ai-resume", icon: "bi-file-earmark-person", label: "AI Resume", gradient: "from-rose-500 to-pink-500" },
    { to: "/student-dashboard/profile/ai-job-search", icon: "bi-briefcase-fill", label: "Job Search", gradient: "from-blue-500 to-cyan-500" },
    { to: "/student-dashboard/profile/ai-settings", icon: "bi-gear-wide-connected", label: "AI Settings", gradient: "from-slate-500 to-gray-500" },
  ];

  const visibleOptions = sidebarOptions.slice(0, 4);
  const hiddenOptions = sidebarOptions.slice(4);

  const isActive = (path) => location.pathname === path;

  const handleSignOut = async () => {
    try {
      await APIService.auth.signout();
      localStorage.removeItem('token');
      dispatch(clearUser());
      navigate("/");
    } catch (error) {
      localStorage.removeItem('token');
      dispatch(clearUser());
      navigate("/");
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-screen overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Left Sidebar - Desktop */}
      <div className="hidden md:flex flex-col w-[280px] bg-slate-900/50 backdrop-blur-xl border-r border-slate-700/50 h-[calc(100vh-64px)] fixed left-0 top-16 overflow-y-auto">
        {/* Profile Section */}
        <div className="p-6 border-b border-slate-700/50">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center font-bold text-2xl text-white shadow-lg">
                {one.toUpperCase()}
              </div>
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-slate-900"></div>
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-white font-semibold text-base truncate">{name}</h2>
              <p className="text-slate-400 text-xs truncate">{email}</p>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 p-4 space-y-2">
          {sidebarOptions.map((option, index) => {
            const active = isActive(option.to);
            return (
              <Link key={index} to={option.to}>
                <div
                  className={`group relative p-3 rounded-lg transition-all duration-300 ${active
                    ? 'bg-gradient-to-r ' + option.gradient + ' shadow-md'
                    : 'hover:bg-slate-800/50'
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-transform group-hover:scale-110 ${active ? 'bg-white/20' : 'bg-slate-800/50'
                      }`}>
                      <i className={`bi ${option.icon} text-base ${active ? 'text-white' : 'text-slate-300'}`}></i>
                    </div>
                    <span className={`text-sm font-medium ${active ? 'text-white' : 'text-slate-300 group-hover:text-white'}`}>
                      {option.label}
                    </span>
                  </div>
                  {active && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-r-full"></div>
                  )}
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Sign Out Button */}
        <div className="p-4 border-t border-slate-700/50">
          <button
            onClick={handleSignOut}
            className="w-full p-4 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 hover:border-red-500/50 transition-all duration-300 group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                <i className="bi bi-box-arrow-right text-xl text-red-400"></i>
              </div>
              <span className="text-sm font-medium text-red-400 group-hover:text-red-300">Sign Out</span>
            </div>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 md:ml-[280px] mb-16 md:mb-0 overflow-y-auto bg-slate-950/50">
        <Outlet />
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-xl border-t border-slate-700/50 z-50">
        <div className="flex justify-around items-center p-2">
          {visibleOptions.map((option, index) => {
            const active = isActive(option.to);
            return (
              <Link key={index} to={option.to} className="flex-1">
                <div className={`flex flex-col items-center p-2 rounded-lg transition-all ${active ? 'bg-gradient-to-br ' + option.gradient : ''
                  }`}>
                  <i className={`bi ${option.icon} text-xl ${active ? 'text-white' : 'text-slate-400'}`}></i>
                  <span className={`text-[10px] mt-1 truncate max-w-full ${active ? 'text-white font-medium' : 'text-slate-400'}`}>
                    {option.label === 'My Courses' ? 'Courses' : option.label}
                  </span>
                </div>
              </Link>
            );
          })}

          {/* More Menu */}
          <div className="flex-1 relative">
            <button
              onClick={() => setIsMoreOpen(!isMoreOpen)}
              className="w-full flex flex-col items-center p-2 rounded-lg hover:bg-slate-800/50 transition-all"
            >
              <i className="bi bi-three-dots-vertical text-xl text-slate-400"></i>
              <span className="text-xs mt-1 text-slate-400">More</span>
            </button>

            {isMoreOpen && (
              <>
                <div
                  className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
                  onClick={() => setIsMoreOpen(false)}
                ></div>
                <div className="absolute bottom-full right-0 mb-2 bg-slate-900/95 backdrop-blur-xl border border-slate-700/50 rounded-xl p-2 shadow-2xl z-50 min-w-[200px]">
                  {/* Close button */}
                  <div className="flex justify-between items-center pb-2 mb-2 border-b border-slate-700/50">
                    <span className="text-sm font-medium text-white pl-2">Menu</span>
                    <button
                      onClick={() => setIsMoreOpen(false)}
                      className="text-gray-400 hover:text-white transition-colors p-1 hover:bg-white/10 rounded-lg"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  {hiddenOptions.map((option, index) => {
                    const active = isActive(option.to);
                    return (
                      <Link
                        key={index}
                        to={option.to}
                        onClick={() => setIsMoreOpen(false)}
                      >
                        <div className={`flex items-center gap-3 p-3 rounded-lg transition-all ${active ? 'bg-gradient-to-r ' + option.gradient : 'hover:bg-slate-800/50'
                          }`}>
                          <i className={`bi ${option.icon} text-lg ${active ? 'text-white' : 'text-slate-300'}`}></i>
                          <span className={`font-medium ${active ? 'text-white' : 'text-slate-300'}`}>
                            {option.label}
                          </span>
                        </div>
                      </Link>
                    );
                  })}

                  {/* Sign Out in More Menu */}
                  <div className="border-t border-slate-700/50 mt-2 pt-2">
                    <button
                      onClick={() => {
                        setIsMoreOpen(false);
                        handleSignOut();
                      }}
                      className="w-full flex items-center gap-3 p-3 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 transition-all"
                    >
                      <i className="bi bi-box-arrow-right text-lg text-red-400"></i>
                      <span className="font-medium text-red-400">Sign Out</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default StudentDashboard;