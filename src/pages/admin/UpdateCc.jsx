import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import APIService, { api } from "../../services/api";

const UpdateCc = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [cCertificates, setCCertificates] = useState([
    { name: "", status: false, startDate: "", endDate: "", courseName: "" },
  ]);
  const [alert, setAlert] = useState(null);
  const [progress, setProgress] = useState(100);
  const [loading, setLoading] = useState(true);

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
    const fetchCertificates = async () => {
      try {
        const response = await APIService.users.getById(id);
        if (response.status === 200) {
          const certificates = response.data.cCertificates || [];
          if (certificates.length === 0) {
            setCCertificates([{ name: "", status: false, startDate: "", endDate: "", courseName: "" }]);
          } else {
            setCCertificates(certificates);
          }
        }
      } catch (error) {
        showAlert("Failed to fetch certificates.", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchCertificates();
  }, [id]);

  const handleChange = (index, field, value) => {
    const updated = [...cCertificates];
    updated[index][field] = value;
    setCCertificates(updated);
  };

  const handleAddCertificate = () => {
    setCCertificates([...cCertificates, { name: "", status: false, startDate: "", endDate: "", courseName: "" }]);
  };

  const handleRemoveCertificate = (index) => {
    const updated = cCertificates.filter((_, i) => i !== index);
    setCCertificates(updated);
  };

  const validate = () => {
    for (const cert of cCertificates) {
      if (!cert.name.trim() || !cert.startDate || !cert.endDate || !cert.courseName.trim()) {
        showAlert("All fields are required for each certificate.", "error");
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validate()) {
      try {
        // Use dedicated /update-cc endpoint
        const response = await api.put(`/update-cc/${id}`, { cCertificates });
        if (response.status === 200) {
          showAlert("Completion Certificates updated successfully!", "success");
          setTimeout(() => navigate("/admin-dashboard/profile/all-users"), 2000);
        }
      } catch {
        showAlert("Failed to update certificates.", "error");
      }
    }
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
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
        <h1 className="text-3xl font-bold text-white mb-2">Update Completion Certificates</h1>
        <p className="text-slate-400">Manage student completion certificates</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {cCertificates.map((cert, index) => (
          <div key={index} className="bg-slate-800/30 backdrop-blur-sm rounded-xl border border-slate-700/50 p-6 relative">
            <button
              type="button"
              onClick={() => handleRemoveCertificate(index)}
              className="absolute top-4 right-4 px-3 py-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-lg text-sm"
            >
              <i className="bi bi-trash-fill mr-1"></i> Remove
            </button>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Student Name *</label>
                <input
                  type="text"
                  value={cert.name}
                  onChange={(e) => handleChange(index, "name", e.target.value)}
                  placeholder="Enter student name"
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700/50 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Course Name *</label>
                <input
                  type="text"
                  value={cert.courseName}
                  onChange={(e) => handleChange(index, "courseName", e.target.value)}
                  placeholder="Enter course name"
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700/50 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Start Date *</label>
                <input
                  type="date"
                  value={cert.startDate}
                  onChange={(e) => handleChange(index, "startDate", e.target.value)}
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700/50 rounded-lg text-white focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">End Date *</label>
                <input
                  type="date"
                  value={cert.endDate}
                  onChange={(e) => handleChange(index, "endDate", e.target.value)}
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700/50 rounded-lg text-white focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-300 mb-2">Status</label>
                <select
                  value={cert.status}
                  onChange={(e) => handleChange(index, "status", e.target.value === "true")}
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700/50 rounded-lg text-white focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value="false">Inactive</option>
                  <option value="true">Active</option>
                </select>
              </div>
            </div>
          </div>
        ))}

        <button
          type="button"
          onClick={handleAddCertificate}
          className="px-6 py-3 bg-green-500/10 hover:bg-green-500/20 text-green-400 border border-green-500/20 rounded-lg transition-all flex items-center gap-2"
        >
          <i className="bi bi-plus-circle-fill"></i> Add Certificate
        </button>

        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all"
          >
            <i className="bi bi-check-circle mr-2"></i>
            Update Certificates
          </button>
          <button
            type="button"
            onClick={() => navigate("/admin-dashboard/profile/all-users")}
            className="px-6 py-3 bg-slate-700/50 text-slate-300 rounded-lg font-medium hover:bg-slate-700"
          >
            Cancel
          </button>
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

export default UpdateCc;