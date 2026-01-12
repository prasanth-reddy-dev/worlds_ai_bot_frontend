import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";

function Lectures() {
  const { user } = useSelector((state) => state.user);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCourses();
  }, [user]);

  const loadCourses = () => {
    try {
      setLoading(true);
      // Get courses from user data
      const userCourses = user?.courses || [];
      setCourses(userCourses);
    } catch (error) {
      console.error("Error loading courses:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 to-slate-900 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400 text-lg">Loading your courses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 to-slate-900 px-4 md:px-6 pt-4 pb-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
          My Courses
        </h1>
        <p className="text-slate-400 text-base md:text-lg">
          {courses.length} {courses.length === 1 ? "course" : "courses"} enrolled
        </p>
      </div>

      {/* Stats Section */}
      {courses.length > 0 && (
        <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-800/30 backdrop-blur-sm rounded-xl border border-slate-700/50 p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                <i className="bi bi-book-fill text-2xl text-white"></i>
              </div>
              <div>
                <p className="text-slate-400 text-sm">Total Courses</p>
                <h3 className="text-2xl font-bold text-white">{courses.length}</h3>
              </div>
            </div>
          </div>

          <div className="bg-slate-800/30 backdrop-blur-sm rounded-xl border border-slate-700/50 p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                <i className="bi bi-check-circle-fill text-2xl text-white"></i>
              </div>
              <div>
                <p className="text-slate-400 text-sm">Active Courses</p>
                <h3 className="text-2xl font-bold text-white">
                  {courses.filter(c => c.status).length}
                </h3>
              </div>
            </div>
          </div>

          <div className="bg-slate-800/30 backdrop-blur-sm rounded-xl border border-slate-700/50 p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <i className="bi bi-clock-fill text-2xl text-white"></i>
              </div>
              <div>
                <p className="text-slate-400 text-sm">Learning Hours</p>
                <h3 className="text-2xl font-bold text-white">{courses.length * 40}+</h3>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Courses Grid */}
      {courses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course, index) => (
            <div
              key={index}
              className="group bg-slate-800/30 backdrop-blur-sm rounded-xl border border-slate-700/50 overflow-hidden hover:border-purple-500/50 transition-all duration-300 hover:scale-105"
            >
              {/* Course Header */}
              <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                    <i className="bi bi-play-circle-fill text-3xl text-white"></i>
                  </div>
                  {course.status && (
                    <span className="px-3 py-1 bg-green-500/20 text-green-400 text-xs font-medium rounded-full border border-green-500/30">
                      Active
                    </span>
                  )}
                </div>
                <h3 className="text-white font-bold text-xl mb-2 line-clamp-2">
                  {course.courseName || "Course"}
                </h3>
              </div>

              {/* Course Details */}
              <div className="p-6">
                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-3 text-slate-400 text-sm">
                    <i className="bi bi-calendar-check"></i>
                    <span>
                      Purchased: {new Date(course.purchaseDate || Date.now()).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-400 text-sm">
                    <i className="bi bi-currency-rupee"></i>
                    <span>₹{course.amount || "N/A"}</span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-400 text-sm">
                    <i className="bi bi-receipt"></i>
                    <span className="truncate">Transaction: {course.transactionId || "N/A"}</span>
                  </div>
                </div>

                {/* Action Button */}
                {course.recordingsId ? (
                  <Link
                    to={`/student-dashboard/profile/recordings/${course.recordingsId}`}
                    className="block w-full text-center px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium rounded-lg transition-all group-hover:shadow-lg group-hover:shadow-purple-500/50"
                  >
                    <span className="flex items-center justify-center gap-2">
                      <i className="bi bi-play-circle-fill"></i>
                      Start Learning
                    </span>
                  </Link>
                ) : (
                  <button
                    disabled
                    className="w-full px-4 py-3 bg-slate-700/50 text-slate-500 font-medium rounded-lg cursor-not-allowed"
                  >
                    Recordings Unavailable
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        // Empty State
        <div className="max-w-2xl mx-auto">
          <div className="bg-slate-800/30 backdrop-blur-sm rounded-xl border border-slate-700/50 p-12 text-center">
            <div className="w-24 h-24 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <i className="bi bi-book-fill text-5xl text-purple-400"></i>
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">No Courses Yet</h2>
            <p className="text-slate-400 text-lg mb-8">
              Start your learning journey by enrolling in a course
            </p>
            <Link
              to="/courses"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium rounded-lg transition-all shadow-lg hover:shadow-purple-500/50"
            >
              <i className="bi bi-search"></i>
              Browse Courses
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default Lectures;