import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { clearUser } from "../../redux/userSlice";
import { useNavigate } from "react-router-dom";
import APIService from "../../services/api";

function AdminDashboard() {
  const { user } = useSelector((state) => state.user);
  const name = user?.name || "Guest";
  const initials = useMemo(() =>
    name.length > 1 ? name[0] + name[1] : name[0] || "G",
    [name]
  );

  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const [alert, setAlert] = useState(null);
  const [progress, setProgress] = useState(100);
  const location = useLocation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const sidebarOptions = useMemo(() => [
    { to: "/admin-dashboard", icon: "bi bi-speedometer2", label: "Dashboard" },
    { to: "/admin-dashboard/profile/all-users", icon: "bi bi-people-fill", label: "All Users" },
    { to: "/admin-dashboard/profile/create-data", icon: "bi bi-database-fill-add", label: "Create Data" },
    { to: "/admin-dashboard/profile/all-create-data", icon: "bi bi-database-fill", label: "All Data" },
    { to: "/admin-dashboard/profile/all-registers", icon: "bi bi-person-check-fill", label: "All Registers" },
    { to: "/admin-dashboard/profile/all-feedbacks", icon: "bi bi-chat-heart-fill", label: "User Feedbacks" },
    { to: "/admin-dashboard/profile/create-course", icon: "bi bi-plus-circle-fill", label: "Create Course" },
    { to: "/admin-dashboard/profile/all-courses", icon: "bi bi-journal-code", label: "All Courses" },
    { to: "/admin-dashboard/profile/create-road-map", icon: "bi bi-signpost-split-fill", label: "Create Roadmap" },
    { to: "/admin-dashboard/profile/all-roadmaps", icon: "bi bi-map-fill", label: "All Roadmaps" },
    { to: "/admin-dashboard/profile/create-recordings", icon: "bi bi-mic-mute-fill", label: "Create Recordings" },
    { to: "/admin-dashboard/profile/all-recordings", icon: "bi bi-mic-fill", label: "All Recordings" },
    { to: "/admin-dashboard/profile/create-logo", icon: "bi bi-brush-fill", label: "Create Company Logo" },
    { to: "/admin-dashboard/profile/all-company-logos", icon: "bi bi-building", label: "All Company Logos" },
    { to: "/admin-dashboard/profile/create-video", icon: "bi bi-play-btn-fill", label: "Create Video" },
    { to: "/admin-dashboard/profile/all-videos", icon: "bi bi-camera-video-fill", label: "All Videos" },
    { to: "/admin-dashboard/profile/create-privacy", icon: "bi bi-shield-lock-fill", label: "Create Privacy" },
    { to: "/admin-dashboard/profile/all-privacy", icon: "bi bi-lock-fill", label: "All Privacy" },
    { to: "/admin-dashboard/profile/create-bootcamp", icon: "bi bi-code-square", label: "Create Bootcamp" },
    { to: "/admin-dashboard/profile/all-bootcamps", icon: "bi bi-laptop-fill", label: "All Bootcamps" },
    { to: "/admin-dashboard/profile/create-road-map-topics", icon: "bi bi-list-task", label: "Create Topics" },
    { to: "/admin-dashboard/profile/all-road-map-topics", icon: "bi bi-list-check", label: "All Topics" },
    { to: "/admin-dashboard/profile/create-job", icon: "bi bi-briefcase-fill", label: "Create Job" },
    { to: "/admin-dashboard/profile/all-jobs", icon: "bi bi-briefcase", label: "All Jobs" },
    { to: "/admin-dashboard/profile/create-test", icon: "bi bi-clipboard-check-fill", label: "Create Test" },
    { to: "/admin-dashboard/profile/all-tests", icon: "bi bi-clipboard-data", label: "All Tests" },
    { to: "/admin-dashboard/profile/create-interview", icon: "bi bi-chat-dots-fill", label: "Create Interview" },
    { to: "/admin-dashboard/profile/all-interview", icon: "bi bi-chat-left-text-fill", label: "All Interviews" },
  ], []);

  const isActive = useCallback((path) => location.pathname === path, [location.pathname]);

  const showAlert = useCallback((message, type) => {
    setAlert({ message, type });
    setProgress(100);
  }, []);

  const dismissAlert = useCallback(() => {
    setAlert(null);
    setProgress(100);
  }, []);

  useEffect(() => {
    if (alert) {
      const duration = 3000;
      const interval = 50;
      const decrement = (interval / duration) * 100;

      const timer = setInterval(() => {
        setProgress((prev) => {
          const newProgress = prev - decrement;
          if (newProgress <= 0) {
            dismissAlert();
            clearInterval(timer);
            return 0;
          }
          return newProgress;
        });
      }, interval);

      return () => clearInterval(timer);
    }
  }, [alert, dismissAlert]);

  const handleSignOut = useCallback(async () => {
    try {
      await APIService.auth.signout();
      localStorage.removeItem('token');
      dispatch(clearUser());
      navigate("/");
    } catch {
      localStorage.removeItem('token');
      dispatch(clearUser());
      navigate("/");
    }
  }, [dispatch, navigate]);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-slate-900/50 backdrop-blur-xl border-r border-slate-700/50">
        {/* User Profile */}
        <div className="p-6 border-b border-slate-700/50">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center font-bold text-lg shadow-lg">
              {initials.toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-sm font-semibold text-white truncate">{name}</h2>
              <p className="text-xs text-slate-400">Administrator</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-1 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
          {sidebarOptions.map((option) => (
            <Link
              key={option.to}
              to={option.to}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group ${isActive(option.to)
                ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                : "text-slate-300 hover:bg-slate-800/50 hover:text-white"
                }`}
            >
              <i className={`${option.icon} text-lg`}></i>
              <span className="text-sm font-medium truncate">{option.label}</span>
            </Link>
          ))}
        </nav>

        {/* Sign Out Button */}
        <div className="p-4 border-t border-slate-700/50">
          <button
            onClick={handleSignOut}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-slate-300 hover:bg-red-500/10 hover:text-red-400 transition-all duration-200"
          >
            <i className="bi bi-box-arrow-right text-lg"></i>
            <span className="text-sm font-medium">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar for Mobile */}
        <header className="md:hidden bg-slate-900/50 backdrop-blur-xl border-b border-slate-700/50 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center font-bold">
                {initials.toUpperCase()}
              </div>
              <div>
                <h2 className="text-sm font-semibold text-white">{name}</h2>
                <p className="text-xs text-slate-400">Admin</p>
              </div>
            </div>
            <button
              onClick={handleSignOut}
              className="p-2 text-slate-400 hover:text-red-400"
            >
              <i className="bi bi-box-arrow-right text-xl"></i>
            </button>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto pb-20 md:pb-0">
          <Outlet />
        </div>

        {/* Mobile Bottom Navigation */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-xl border-t border-slate-700/50 safe-area-inset-bottom">
          <div className="flex justify-around items-center px-2 py-2">
            {sidebarOptions.slice(0, 4).map((option) => (
              <Link
                key={option.to}
                to={option.to}
                className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all ${isActive(option.to)
                  ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                  : "text-slate-400 hover:text-white"
                  }`}
              >
                <i className={`${option.icon} text-xl`}></i>
                <span className="text-xs font-medium">{option.label.split(" ")[0]}</span>
              </Link>
            ))}
            <div className="relative">
              <button
                onClick={() => setIsMoreOpen(!isMoreOpen)}
                className="flex flex-col items-center gap-1 px-3 py-2 text-slate-400 hover:text-white"
              >
                <i className="bi bi-grid-fill text-xl"></i>
                <span className="text-xs font-medium">More</span>
              </button>

              {isMoreOpen && (
                <>
                  <div
                    className="fixed inset-0 bg-black/50 z-40"
                    onClick={() => setIsMoreOpen(false)}
                  ></div>
                  <div className="absolute bottom-full right-0 mb-2 w-64 max-h-96 overflow-y-auto bg-slate-900/95 backdrop-blur-xl rounded-xl border border-slate-700/50 shadow-2xl z-50">
                    <div className="p-2 space-y-1">
                      {sidebarOptions.map((option) => (
                        <Link
                          key={option.to}
                          to={option.to}
                          onClick={() => setIsMoreOpen(false)}
                          className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${isActive(option.to)
                            ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                            : "text-slate-300 hover:bg-slate-800/50"
                            }`}
                        >
                          <i className={`${option.icon} text-lg`}></i>
                          <span className="text-sm font-medium">{option.label}</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </nav>
      </main>

      {/* Toast Alert */}
      {alert && (
        <div className="fixed bottom-24 md:bottom-6 right-6 z-50 animate-slide-up">
          <div
            className={`${alert.type === "success"
              ? "bg-gradient-to-r from-green-600 to-emerald-600"
              : "bg-gradient-to-r from-red-600 to-rose-600"
              } text-white px-6 py-4 rounded-xl shadow-2xl min-w-[320px] max-w-md`}
          >
            <div className="flex items-start gap-3">
              <i
                className={`${alert.type === "success" ? "bi bi-check-circle-fill" : "bi bi-exclamation-circle-fill"
                  } text-2xl flex-shrink-0`}
              ></i>
              <div className="flex-1">
                <p className="font-medium">{alert.message}</p>
                <div className="mt-2 h-1 bg-white/30 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-white transition-all duration-75 ease-linear"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              </div>
              <button
                onClick={dismissAlert}
                className="text-white/80 hover:text-white transition-colors"
              >
                <i className="bi bi-x-lg"></i>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;