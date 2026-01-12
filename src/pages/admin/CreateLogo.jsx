import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import APIService from '../../services/api';

function CreateLogo() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    companyName: '',
    logo: ''
  });
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    if (!formData.companyName.trim()) {
      showAlert('Company Name is required', 'error');
      return false;
    }
    if (!formData.logo.trim()) {
      showAlert('Logo URL is required', 'error');
      return false;
    }
    if (!/^https?:\/\/.+/.test(formData.logo)) {
      showAlert('Please enter a valid URL starting with http:// or https://', 'error');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      const response = await APIService.companies.create({
        companyName: formData.companyName,
        logoUrl: formData.logo  // Backend expects logoUrl
      });
      if (response.status === 200 || response.status === 201) {
        showAlert('Company logo created successfully!', 'success');
        setFormData({
          companyName: '',
          logo: ''
        });
      }
    } catch (error) {
      showAlert(error.response?.data?.message || 'An error occurred while creating the logo.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="h-full w-full overflow-auto p-6">
      <div className="mb-6">
        <button
          onClick={() => navigate("/admin-dashboard/profile/all-company-logos")}
          className="mb-4 text-slate-400 hover:text-white transition-colors flex items-center gap-2"
        >
          <i className="bi bi-arrow-left"></i>
          Back to Company Logos
        </button>
        <h1 className="text-3xl font-bold text-white mb-2">Create Company Logo</h1>
        <p className="text-slate-400">Add a new company logo to your collection</p>
      </div>

      <form onSubmit={handleSubmit} className="max-w-2xl">
        <div className="bg-slate-800/30 backdrop-blur-sm rounded-xl border border-slate-700/50 p-8">
          <div className="space-y-6">
            {/* Company Name */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Company Name <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <i className="bi bi-building absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
                <input
                  type="text"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleChange}
                  placeholder="e.g., Google, Microsoft, Apple"
                  className="w-full pl-12 pr-4 py-3 bg-slate-900/50 border border-slate-700/50 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20"
                  required
                />
              </div>
              <p className="mt-1 text-xs text-slate-500">Enter the official company name</p>
            </div>

            {/* Logo URL */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Logo URL <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <i className="bi bi-image absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
                <input
                  type="url"
                  name="logo"
                  value={formData.logo}
                  onChange={handleChange}
                  placeholder="https://example.com/logo.png"
                  className="w-full pl-12 pr-4 py-3 bg-slate-900/50 border border-slate-700/50 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20"
                  required
                />
              </div>
              <p className="mt-1 text-xs text-slate-500">Provide a direct URL to the company logo image</p>
            </div>

            {/* Logo Preview */}
            {formData.logo && /^https?:\/\/.+/.test(formData.logo) && (
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Logo Preview
                </label>
                <div className="bg-slate-900/50 border border-slate-700/50 rounded-lg p-6 flex items-center justify-center">
                  <img
                    src={formData.logo}
                    alt="Logo preview"
                    className="max-w-full max-h-32 object-contain"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextElementSibling.style.display = 'flex';
                    }}
                  />
                  <div className="hidden flex-col items-center gap-2 text-slate-500">
                    <i className="bi bi-image-fill text-3xl"></i>
                    <p className="text-sm">Failed to load image</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-3 mt-6">
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
                <i className="bi bi-plus-circle"></i>
                Create Company Logo
              </>
            )}
          </button>
          <button
            type="button"
            onClick={() => navigate("/admin-dashboard/profile/all-company-logos")}
            className="px-6 py-3 bg-slate-700/50 text-slate-300 rounded-lg font-medium hover:bg-slate-700 transition-all"
          >
            Cancel
          </button>
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

export default CreateLogo;