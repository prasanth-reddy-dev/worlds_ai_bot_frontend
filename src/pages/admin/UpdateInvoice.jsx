import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import APIService from "../../services/api";

const UpdateInvoice = () => {
  const { id } = useParams(); // user ID
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [courses, setCourses] = useState([]);
  const [newCourse, setNewCourse] = useState({
    transactionId: "",
    amount: 0,
    courseName: "",
    recordingsId: "",
    status: true, // Payment status
    recordingAccess: true, // Recording access toggle
    purchaseDate: new Date().toISOString()
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    fetchUserData();
  }, [id]);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const response = await APIService.users.getById(id);
      const userData = response.data;
      setUser(userData);
      setCourses(userData.courses || []);
    } catch (error) {
      console.error("Error fetching user:", error);
      alert("Failed to load user data");
    } finally {
      setLoading(false);
    }
  };

  const handleAddCourse = async () => {
    try {
      if (!newCourse.transactionId || !newCourse.courseName || !newCourse.amount) {
        alert("Please fill all required fields");
        return;
      }

      setSaving(true);
      const updatedCourses = [
        ...courses,
        {
          ...newCourse,
          email: user.email,
          name: user.name,
        }
      ];

      await APIService.users.update(id, { courses: updatedCourses });

      setCourses(updatedCourses);
      setNewCourse({
        transactionId: "",
        amount: 0,
        courseName: "",
        recordingsId: "",
        status: true,
        recordingAccess: true,
        purchaseDate: new Date().toISOString()
      });
      setShowAddForm(false);
      alert("Course added successfully!");
    } catch (error) {
      console.error("Error adding course:", error);
      alert("Failed to add course");
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveCourse = async (index) => {
    if (!confirm("Are you sure you want to remove this course?")) return;

    try {
      setSaving(true);
      const updatedCourses = courses.filter((_, i) => i !== index);
      await APIService.users.update(id, { courses: updatedCourses });
      setCourses(updatedCourses);
      alert("Course removed successfully!");
    } catch (error) {
      console.error("Error removing course:", error);
      alert("Failed to remove course");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleRecordingAccess = async (index) => {
    try {
      setSaving(true);
      const updatedCourses = [...courses];
      updatedCourses[index].recordingAccess = !updatedCourses[index].recordingAccess;

      await APIService.users.update(id, { courses: updatedCourses });
      setCourses(updatedCourses);
      alert(`Recording access ${updatedCourses[index].recordingAccess ? 'enabled' : 'disabled'}`);
    } catch (error) {
      console.error("Error toggling access:", error);
      alert("Failed to update recording access");
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateCourse = async (index, field, value) => {
    try {
      setSaving(true);
      const updatedCourses = [...courses];
      updatedCourses[index][field] = value;

      await APIService.users.update(id, { courses: updatedCourses });
      setCourses(updatedCourses);
    } catch (error) {
      console.error("Error updating course:", error);
      alert("Failed to update course");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400">Loading user data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 overflow-y-auto">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate("/admin-dashboard/profile/all-users")}
          className="text-slate-400 hover:text-white flex items-center gap-2 mb-4 transition-colors"
        >
          <i className="bi bi-arrow-left"></i> Back to Users
        </button>
        <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          Manage Courses - {user?.name}
        </h1>
        <p className="text-slate-400 mt-2">Email: {user?.email}</p>
        <p className="text-slate-400">Total Courses: {courses.length}</p>
      </div>

      {/* Add Course Button */}
      <div className="mb-6">
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium rounded-lg transition-all shadow-lg"
        >
          <i className="bi bi-plus-circle mr-2"></i>
          {showAddForm ? "Cancel" : "Add New Course"}
        </button>
      </div>

      {/* Add Course Form */}
      {showAddForm && (
        <div className="mb-8 bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 p-6">
          <h2 className="text-xl font-bold text-white mb-4">Add New Course</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Transaction ID *
              </label>
              <input
                type="text"
                value={newCourse.transactionId}
                onChange={(e) => setNewCourse({ ...newCourse, transactionId: e.target.value })}
                className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
                placeholder="Enter transaction ID"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Amount (₹) *
              </label>
              <input
                type="number"
                value={newCourse.amount}
                onChange={(e) => setNewCourse({ ...newCourse, amount: parseFloat(e.target.value) })}
                className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Course Name *
              </label>
              <input
                type="text"
                value={newCourse.courseName}
                onChange={(e) => setNewCourse({ ...newCourse, courseName: e.target.value })}
                className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
                placeholder="Enter course name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Recordings ID
              </label>
              <input
                type="text"
                value={newCourse.recordingsId}
                onChange={(e) => setNewCourse({ ...newCourse, recordingsId: e.target.value })}
                className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
                placeholder="Enter recordings ID"
              />
            </div>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={newCourse.status}
                  onChange={(e) => setNewCourse({ ...newCourse, status: e.target.checked })}
                  className="w-4 h-4"
                />
                <span className="text-slate-300">Payment Received</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={newCourse.recordingAccess}
                  onChange={(e) => setNewCourse({ ...newCourse, recordingAccess: e.target.checked })}
                  className="w-4 h-4"
                />
                <span className="text-slate-300">Recording Access</span>
              </label>
            </div>
          </div>
          <div className="mt-4 flex gap-3">
            <button
              onClick={handleAddCourse}
              disabled={saving}
              className="px-6 py-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-medium rounded-lg transition-all disabled:opacity-50"
            >
              {saving ? "Adding..." : "Add Course"}
            </button>
            <button
              onClick={() => setShowAddForm(false)}
              className="px-6 py-2 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-lg transition-all"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Courses List */}
      {courses.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {courses.map((course, index) => (
            <div
              key={index}
              className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 p-6 hover:border-purple-500/50 transition-all"
            >
              {/* Course Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                    <i className="bi bi-receipt text-2xl text-white"></i>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Invoice #{index + 1}</h3>
                    <p className="text-sm text-slate-400">
                      {new Date(course.purchaseDate || Date.now()).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleRemoveCourse(index)}
                  disabled={saving}
                  className="text-red-400 hover:text-red-300 transition-colors disabled:opacity-50"
                >
                  <i className="bi bi-trash text-xl"></i>
                </button>
              </div>

              {/* Course Details */}
              <div className="space-y-3 mb-4">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Course Name</label>
                  <p className="text-white font-medium">{course.courseName}</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Amount</label>
                    <p className="text-white font-medium">₹{course.amount}</p>
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Transaction ID</label>
                    <p className="text-white font-medium text-sm truncate">{course.transactionId}</p>
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Recordings ID</label>
                  <p className="text-white font-medium">{course.recordingsId || "Not assigned"}</p>
                </div>
              </div>

              {/* Status Badges */}
              <div className="flex flex-wrap gap-2 mb-4">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${course.status
                  ? "bg-green-500/20 text-green-400 border border-green-500/30"
                  : "bg-red-500/20 text-red-400 border border-red-500/30"
                  }`}>
                  {course.status ? "Paid" : "Unpaid"}
                </span>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${course.recordingAccess !== false
                  ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                  : "bg-orange-500/20 text-orange-400 border border-orange-500/30"
                  }`}>
                  {course.recordingAccess !== false ? "Access Granted" : "Access Denied"}
                </span>
              </div>

              {/* Recording Access Toggle */}
              <div className="border-t border-slate-700/50 pt-4">
                <label className="flex items-center justify-between cursor-pointer group">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center group-hover:bg-purple-500/30 transition-colors">
                      <i className={`bi ${course.recordingAccess !== false ? 'bi-unlock-fill' : 'bi-lock-fill'} text-purple-400`}></i>
                    </div>
                    <div>
                      <p className="text-white font-medium">Recording Access</p>
                      <p className="text-xs text-slate-400">
                        {course.recordingAccess !== false ? "Student can view recordings" : "Student cannot view recordings"}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleToggleRecordingAccess(index)}
                    disabled={saving}
                    className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors disabled:opacity-50 ${course.recordingAccess !== false ? "bg-purple-600" : "bg-slate-600"
                      }`}
                  >
                    <span
                      className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${course.recordingAccess !== false ? "translate-x-7" : "translate-x-1"
                        }`}
                    />
                  </button>
                </label>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-slate-800/30 backdrop-blur-sm rounded-xl border border-slate-700/50 p-12 text-center">
          <i className="bi bi-inbox text-6xl text-slate-600 mb-4"></i>
          <h3 className="text-xl font-bold text-white mb-2">No Courses Yet</h3>
          <p className="text-slate-400 mb-6">This user hasn't purchased any courses</p>
          <button
            onClick={() => setShowAddForm(true)}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium rounded-lg transition-all"
          >
            Add First Course
          </button>
        </div>
      )}
    </div>
  );
};

export default UpdateInvoice;