import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CreateCourseValidate } from "../../utils/createCourseValidate";
import APIService from "../../services/api";

function CreateCourse() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    courseName: "",
    imageUrl: "",
    price: "",
    duration: "",
    enrolled: "",
    status: "0",
    badge: "trending",
    hours: "",
    nextId: "",
    recordingId: "",
    coupon: "",  // Optional coupon code
  });

  const [alert, setAlert] = useState(null);
  const [progress, setProgress] = useState(100);
  const [submitting, setSubmitting] = useState(false);

  const showAlert = (message, type) => {
    setAlert({ message, type });
    setProgress(100);
  };

  const dismissAlert = () => {
    setAlert(null);
    setProgress(100);
  };

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
  }, [alert]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationError = CreateCourseValidate(
      formData.courseName,
      formData.imageUrl,
      formData.price,
      formData.duration,
      formData.enrolled,
      formData.status,
      formData.badge,
      formData.hours,
      formData.nextId,
      formData.recordingId
    );

    if (validationError) {
      showAlert(validationError, "error");
      return;
    }

    setSubmitting(true);
    try {
      const response = await APIService.courses.create(formData);

      if (response.status === 201 || response.status === 200) {
        showAlert(response.data.message || "Course created successfully!", "success");
        setTimeout(() => {
          setFormData({
            courseName: "",
            imageUrl: "",
            price: "",
            duration: "",
            enrolled: "",
            status: "0",
            badge: "trending",
            hours: "",
            nextId: "",
            recordingId: "",
          });
          navigate("/admin-dashboard/profile/all-courses");
        }, 2000);
      }
    } catch (err) {
      const message = err.response?.data?.message || "Failed to create course.";
      showAlert(message, "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="h-full w-full overflow-auto p-6">
      <div className="mb-6">
        <button
          onClick={() => navigate("/admin-dashboard/profile/all-courses")}
          className="mb-4 text-slate-400 hover:text-white transition-colors flex items-center gap-2"
        >
          <i className="bi bi-arrow-left"></i>
          Back to Courses
        </button>
        <h1 className="text-3xl font-bold text-white mb-2">Create New Course</h1>
        <p className="text-slate-400">Add a new course to your platform</p>
      </div>

      <form onSubmit={handleSubmit} className="max-w-4xl">
        <div className="bg-slate-800/30 backdrop-blur-sm rounded-xl border border-slate-700/50 p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Course Name */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Course Name *
              </label>
              <input
                type="text"
                name="courseName"
                value={formData.courseName}
                onChange={handleChange}
                placeholder="Enter course name"
                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700/50 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20"
                required
              />
            </div>

            {/* Image URL */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Image URL *
              </label>
              <input
                type="url"
                name="imageUrl"
                value={formData.imageUrl}
                onChange={handleChange}
                placeholder="https://example.com/image.jpg"
                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700/50 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20"
                required
              />
            </div>

            {/* Price */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Price (₹) *
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                placeholder="Enter price"
                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700/50 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20"
                required
              />
            </div>

            {/* Duration */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Duration (Months) *
              </label>
              <input
                type="number"
                name="duration"
                value={formData.duration}
                onChange={handleChange}
                placeholder="Enter duration"
                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700/50 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20"
                required
              />
            </div>

            {/* Enrolled */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Students Enrolled *
              </label>
              <input
                type="number"
                name="enrolled"
                value={formData.enrolled}
                onChange={handleChange}
                placeholder="Number of students"
                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700/50 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20"
                required
              />
            </div>

            {/* Hours */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Course Hours *
              </label>
              <input
                type="number"
                name="hours"
                value={formData.hours}
                onChange={handleChange}
                placeholder="Total hours"
                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700/50 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20"
                required
              />
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700/50 rounded-lg text-white focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="0">Inactive</option>
                <option value="1">Active</option>
              </select>
            </div>

            {/* Badge */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Badge
              </label>
              <select
                name="badge"
                value={formData.badge}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700/50 rounded-lg text-white focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="trending">Trending</option>
                <option value="best-seller">Best Seller</option>
              </select>
            </div>

            {/* Custom Course ID */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Custom Course ID
              </label>
              <input
                type="text"
                name="nextId"
                value={formData.nextId}
                onChange={handleChange}
                placeholder="Optional custom ID"
                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700/50 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            {/* Recording ID */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Recording ID
              </label>
              <input
                type="text"
                name="recordingId"
                value={formData.recordingId}
                onChange={handleChange}
                placeholder="Enter recording ID"
                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700/50 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            {/* Coupon Code */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Coupon Code <span className="text-slate-500">(Optional)</span>
              </label>
              <input
                type="text"
                name="coupon"
                value={formData.coupon || ''}
                onChange={handleChange}
                placeholder="Enter coupon code (leave empty if none)"
                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700/50 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20"
              />
              <p className="text-xs text-slate-500 mt-1">Students can use this coupon for free enrollment</p>
            </div>
          </div>

          <div className="flex gap-3 pt-8 mt-6 border-t border-slate-700/50">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <i className="bi bi-arrow-repeat animate-spin"></i>
                  Creating...
                </>
              ) : (
                <>
                  <i className="bi bi-plus-circle mr-2"></i>
                  Create Course
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => navigate("/admin-dashboard/profile/all-courses")}
              className="px-6 py-3 bg-slate-700/50 text-slate-300 rounded-lg font-medium hover:bg-slate-700"
            >
              Cancel
            </button>
          </div>
        </div>
      </form>

      {alert && (
        <div className="fixed bottom-6 right-6 z-[9999]">
          <div className={`${alert.type === "success" ? "bg-gradient-to-r from-green-600 to-emerald-600" : "bg-gradient-to-r from-red-600 to-rose-600"} text-white px-6 py-4 rounded-xl shadow-2xl min-w-[320px]`}>
            <div className="flex items-center gap-3">
              <i className={`${alert.type === "success" ? "bi bi-check-circle-fill" : "bi bi-exclamation-circle-fill"} text-2xl`}></i>
              <div className="flex-1">
                <p className="font-medium">{alert.message}</p>
                <div className="mt-2 h-1 bg-white/30 rounded-full overflow-hidden">
                  <div className="h-full bg-white transition-all duration-75 ease-linear" style={{ width: `${progress}%` }}></div>
                </div>
              </div>
              <button onClick={dismissAlert} className="text-white/80 hover:text-white">
                <i className="bi bi-x-lg"></i>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CreateCourse;