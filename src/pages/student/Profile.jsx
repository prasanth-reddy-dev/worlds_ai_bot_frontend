import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import APIService from "../../services/api";

function Profile() {
  const { user } = useSelector((state) => state.user);
  const [stats, setStats] = useState({
    coursesEnrolled: 0,
    certificatesEarned: 0,
    hoursLearned: 0,
    interviewQuestions: 0,
  });
  const [loading, setLoading] = useState(true);
  const [recentCourses, setRecentCourses] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      // Get user's purchased courses
      const courses = user?.courses || [];
      const certificates = (user?.pCertificates?.length || 0) +
        (user?.iCertificates?.length || 0) +
        (user?.cCertificates?.length || 0);

      setStats({
        coursesEnrolled: courses.length,
        certificatesEarned: certificates,
        hoursLearned: courses.length * 40, // Estimate: 40 hours per course
        interviewQuestions: user?.interviewsPracticed || 0,
      });

      // Set recent courses (last 3)
      setRecentCourses(courses.slice(-3).reverse());
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const quickLinks = [
    { to: "/student-dashboard/profile/lectures", icon: "bi-play-circle-fill", label: "My Courses", color: "from-purple-500 to-pink-500", desc: "Continue learning" },
    { to: "/student-dashboard/profile/awards", icon: "bi-award-fill", label: "Certificates", color: "from-green-500 to-emerald-500", desc: "View achievements" },
    { to: "/student-dashboard/profile/resume-templates", icon: "bi-journal-code", label: "Resume Builder", color: "from-orange-500 to-red-500", desc: "Create resume" },
    { to: "/student-dashboard/profile/interview-preparation", icon: "bi-journal-text", label: "Interview Prep", color: "from-indigo-500 to-blue-500", desc: "Practice questions" },
    { to: "/student-dashboard/profile/editor", icon: "bi-code-slash", label: "Code Editor", color: "from-teal-500 to-cyan-500", desc: "Write & test code" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 to-slate-900 px-4 md:px-6 pt-4 pb-6">
      {/* Welcome Section */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
            Welcome back, {user?.name || "Student"}! 👋
          </h1>
          <p className="text-slate-400 text-base md:text-lg">
            Ready to continue your learning journey?
          </p>
        </div>
        <Link
          to="/student-dashboard/profile/settings"
          className="bg-slate-800/50 hover:bg-slate-700/50 border border-slate-600 text-white px-4 py-2 rounded-lg transition-all flex items-center gap-2 text-sm"
        >
          <i className="bi bi-gear-fill"></i>
          <span className="hidden md:inline">Settings</span>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-8">
        {/* Courses Enrolled */}
        <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 backdrop-blur-sm rounded-xl border border-purple-500/20 p-4 md:p-6 hover:scale-105 transition-all duration-300">
          <div className="flex flex-col items-center text-center">
            <div className="w-12 h-12 md:w-14 md:h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mb-3">
              <i className="bi bi-book-fill text-xl md:text-2xl text-white"></i>
            </div>
            <h3 className="text-2xl md:text-3xl font-bold text-white mb-1">
              {loading ? "..." : stats.coursesEnrolled}
            </h3>
            <p className="text-purple-400 text-xs md:text-sm font-medium">Courses Enrolled</p>
          </div>
        </div>

        {/* Certificates */}
        <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 backdrop-blur-sm rounded-xl border border-green-500/20 p-4 md:p-6 hover:scale-105 transition-all duration-300">
          <div className="flex flex-col items-center text-center">
            <div className="w-12 h-12 md:w-14 md:h-14 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center mb-3">
              <i className="bi bi-award-fill text-xl md:text-2xl text-white"></i>
            </div>
            <h3 className="text-2xl md:text-3xl font-bold text-white mb-1">
              {loading ? "..." : stats.certificatesEarned}
            </h3>
            <p className="text-green-400 text-xs md:text-sm font-medium">Certificates Earned</p>
          </div>
        </div>

        {/* Hours Learned */}
        <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 backdrop-blur-sm rounded-xl border border-blue-500/20 p-4 md:p-6 hover:scale-105 transition-all duration-300">
          <div className="flex flex-col items-center text-center">
            <div className="w-12 h-12 md:w-14 md:h-14 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mb-3">
              <i className="bi bi-clock-fill text-xl md:text-2xl text-white"></i>
            </div>
            <h3 className="text-2xl md:text-3xl font-bold text-white mb-1">
              {loading ? "..." : stats.hoursLearned}+
            </h3>
            <p className="text-blue-400 text-xs md:text-sm font-medium">Hours Learned</p>
          </div>
        </div>

        {/* Interview Questions */}
        <div className="bg-gradient-to-br from-orange-500/10 to-red-500/10 backdrop-blur-sm rounded-xl border border-orange-500/20 p-4 md:p-6 hover:scale-105 transition-all duration-300">
          <div className="flex flex-col items-center text-center">
            <div className="w-12 h-12 md:w-14 md:h-14 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center mb-3">
              <i className="bi bi-journal-text text-xl md:text-2xl text-white"></i>
            </div>
            <h3 className="text-2xl md:text-3xl font-bold text-white mb-1">
              {loading ? "..." : stats.interviewQuestions}
            </h3>
            <p className="text-orange-400 text-xs md:text-sm font-medium">Questions Practiced</p>
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="mb-8">
        <h2 className="text-xl md:text-2xl font-bold text-white mb-4">Quick Access</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickLinks.map((link, index) => (
            <Link key={index} to={link.to}>
              <div className="group bg-slate-800/30 backdrop-blur-sm rounded-xl border border-slate-700/50 p-6 hover:border-slate-600 transition-all duration-300 hover:scale-105">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 bg-gradient-to-br ${link.color} rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform`}>
                    <i className={`bi ${link.icon} text-xl text-white`}></i>
                  </div>
                  <div>
                    <h3 className="text-white font-semibold text-base group-hover:text-blue-400 transition-colors">
                      {link.label}
                    </h3>
                    <p className="text-slate-400 text-sm">{link.desc}</p>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Courses */}
      {recentCourses.length > 0 && (
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-white mb-4">Continue Learning</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentCourses.map((course, index) => (
              <div key={index} className="bg-slate-800/30 backdrop-blur-sm rounded-xl border border-slate-700/50 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                    <i className="bi bi-play-circle-fill text-2xl text-white"></i>
                  </div>
                  {course.status && (
                    <span className="px-3 py-1 bg-green-500/20 text-green-400 text-xs font-medium rounded-full border border-green-500/30">
                      Active
                    </span>
                  )}
                </div>
                <h3 className="text-white font-semibold text-base mb-2">{course.courseName || "Course"}</h3>
                <p className="text-slate-400 text-sm mb-4">
                  Purchased on {new Date(course.purchaseDate || Date.now()).toLocaleDateString()}
                </p>
                <Link
                  to={`/student-dashboard/profile/recordings/${course.recordingsId}`}
                  className="block w-full text-center px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium rounded-lg transition-all"
                >
                  Continue Learning →
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {recentCourses.length === 0 && (
        <div className="bg-slate-800/30 backdrop-blur-sm rounded-xl border border-slate-700/50 p-12 text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="bi bi-book-fill text-4xl text-purple-400"></i>
          </div>
          <h3 className="text-white font-semibold text-xl mb-2">No courses yet</h3>
          <p className="text-slate-400 mb-6">Start your learning journey by enrolling in a course</p>
          <Link
            to="/courses"
            className="inline-block px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium rounded-lg transition-all"
          >
            Browse Courses
          </Link>
        </div>
      )}
    </div>
  );
}

export default Profile;