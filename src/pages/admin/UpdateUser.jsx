import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import APIService from "../../services/api";

const UpdateUser = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    number: "",
    role: "student",
    batchNumber: 10,
    paymentStatus: false,
    university: "worldsaibot",
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [alert, setAlert] = useState(null);
  const [progress, setProgress] = useState(100);

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

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await APIService.profile.getById(id);
        const userData = response.data;

        setFormData({
          name: userData.name || "",
          email: userData.email || "",
          number: userData.number || "",
          role: userData.role || "student",
          batchNumber: userData.batchNumber || 10,
          paymentStatus: userData.paymentStatus || false,
          university: userData.university || "worldsaibot",
        });

        setLoading(false);
      } catch (error) {
        showAlert("Failed to fetch user data.", "error");
        setLoading(false);
      }
    };

    fetchUserData();
  }, [id]);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData({
      ...formData,
      [name]:
        type === "number" && value === ""
          ? ""
          : name === "paymentStatus"
            ? value === "true"
            : value,
    });
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      showAlert("Name is required.", "error");
      return false;
    }
    if (!formData.email.trim()) {
      showAlert("Email is required.", "error");
      return false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      showAlert("Email format is invalid.", "error");
      return false;
    }
    if (!formData.number.trim()) {
      showAlert("Number is required.", "error");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      const response = await APIService.profile.update(id, formData);
      if (response.status === 200) {
        showAlert("User updated successfully!", "success");
        setTimeout(() => navigate("/admin-dashboard/profile/all-users"), 2000);
      }
    } catch (error) {
      showAlert(
        error.response?.data?.message || "Failed to update user.",
        "error"
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-white text-xl">Loading user data...</div>
      </div>
    );
  }

  return (
    <div className="h-full w-full overflow-auto p-6">
      <div className="mb-6">
        <button
          onClick={() => navigate("/admin-dashboard/profile/all-users")}
          className="mb-4 text-slate-400 hover:text-white transition-colors flex items-center gap-2"
        >
          <i className="bi bi-arrow-left"></i>
          Back to Users
        </button>
        <h1 className="text-3xl font-bold text-white mb-2">Update User</h1>
        <p className="text-slate-400">Edit user information and permissions</p>
      </div>

      <form onSubmit={handleSubmit} className="max-w-2xl">
        <div className="bg-slate-800/30 backdrop-blur-sm rounded-xl border border-slate-700/50 p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter name"
                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700/50 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Email *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter email"
                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700/50 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Phone Number *
              </label>
              <input
                type="text"
                name="number"
                value={formData.number}
                onChange={handleChange}
                placeholder="Enter phone number"
                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700/50 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                University
              </label>
              <input
                type="text"
                name="university"
                value={formData.university}
                onChange={handleChange}
                placeholder="Enter university"
                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700/50 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Batch Number
              </label>
              <input
                type="number"
                name="batchNumber"
                value={formData.batchNumber}
                onChange={handleChange}
                placeholder="Enter batch number"
                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700/50 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Role
              </label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700/50 rounded-lg text-white focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="student">Student</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Payment Status
              </label>
              <select
                name="paymentStatus"
                value={formData.paymentStatus.toString()}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700/50 rounded-lg text-white focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="false">Unpaid</option>
                <option value="true">Paid</option>
              </select>
            </div>
          </div>

          <div className="flex gap-3 pt-6">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <i className="bi bi-arrow-repeat animate-spin mr-2"></i>
                  Updating...
                </>
              ) : (
                <>
                  <i className="bi bi-check-circle mr-2"></i>
                  Update User
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => navigate("/admin-dashboard/profile/all-users")}
              className="px-6 py-3 bg-slate-700/50 text-slate-300 rounded-lg font-medium hover:bg-slate-700"
            >
              Cancel
            </button>
          </div>
        </div>
      </form>

      {alert && (
        <div className="fixed bottom-6 right-6 z-50">
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
};

export default UpdateUser;