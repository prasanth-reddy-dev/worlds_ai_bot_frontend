import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import APIService from "../../services/api";

function UpdateData() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    offer: "",
    heading: "",
    tag: "",
    insta: "",
    linkedin: "",
    youtube: "",
    channel: "",
    maps: "",
    group: "",
    email: "",
    number: "",
    address: "",
    logo: "",
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

  useEffect(() => {
    async function fetchContact() {
      try {
        setLoading(true);
        const response = await APIService.contacts.getById(id);
        if (response.status === 200) {
          const { _id, __v, ...filteredData } = response.data;
          setFormData(filteredData);
        }
      } catch (err) {
        showAlert("Failed to load contact data.", "error");
      } finally {
        setLoading(false);
      }
    }
    fetchContact();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const validateForm = () => {
    // Email validation
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      showAlert("Please enter a valid email address.", "error");
      return false;
    }

    // Phone number validation
    if (formData.number && !/^\d{10}$/.test(formData.number)) {
      showAlert("Phone number must contain exactly 10 digits.", "error");
      return false;
    }

    // URL validations
    const urlFields = ['insta', 'linkedin', 'youtube', 'maps', 'group', 'logo'];
    for (const field of urlFields) {
      if (formData[field] && !/^https?:\/\/.+/.test(formData[field])) {
        showAlert(`${field.charAt(0).toUpperCase() + field.slice(1)} must be a valid URL.`, "error");
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      const response = await APIService.contacts.update(id, formData);

      if (response.status === 200) {
        showAlert("Contact data updated successfully!", "success");
        setTimeout(() => {
          navigate("/admin-dashboard/profile/all-create-data");
        }, 2000);
      }
    } catch (err) {
      const message = err.response?.data?.message || "Failed to update contact data.";
      showAlert(message, "error");
    } finally {
      setSubmitting(false);
    }
  };

  const inputGroups = [
    {
      title: "Banner & Branding",
      fields: [
        { name: "offer", label: "Offer Banner", type: "text", placeholder: "🎉 Special Launch Offer", required: true },
        { name: "heading", label: "Main Heading", type: "text", placeholder: "Transform Your Future", required: true },
        { name: "tag", label: "Tagline", type: "text", placeholder: "Join 10,000+ learners...", required: true },
        { name: "logo", label: "Logo URL", type: "url", placeholder: "https://example.com/logo.png" },
      ]
    },
    {
      title: "Social Media Links",
      fields: [
        { name: "insta", label: "Instagram", type: "url", placeholder: "https://instagram.com/yourpage", icon: "bi-instagram" },
        { name: "linkedin", label: "LinkedIn", type: "url", placeholder: "https://linkedin.com/company/yourcompany", icon: "bi-linkedin" },
        { name: "youtube", label: "YouTube", type: "url", placeholder: "https://youtube.com/@yourchannel", icon: "bi-youtube" },
        { name: "channel", label: "Channel/Twitter", type: "url", placeholder: "https://twitter.com/yourhandle", icon: "bi-twitter-x" },
        { name: "group", label: "Community Group", type: "url", placeholder: "https://t.me/yourgroup", icon: "bi-telegram" },
      ]
    },
    {
      title: "Contact Information",
      fields: [
        { name: "email", label: "Email Address", type: "email", placeholder: "contact@example.com", required: true, icon: "bi-envelope" },
        { name: "number", label: "Phone Number", type: "tel", placeholder: "9876543210", required: true, maxLength: 10, icon: "bi-telephone" },
        { name: "address", label: "Office Address", type: "text", placeholder: "123 Main St, City, Country", required: true, icon: "bi-geo-alt" },
        { name: "maps", label: "Google Maps Embed URL", type: "url", placeholder: "https://maps.google.com/...", icon: "bi-map" },
      ]
    },
  ];

  if (loading) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400">Loading contact data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full overflow-auto p-6">
      <div className="mb-6">
        <button
          onClick={() => navigate("/admin-dashboard/profile/all-create-data")}
          className="mb-4 text-slate-400 hover:text-white transition-colors flex items-center gap-2"
        >
          <i className="bi bi-arrow-left"></i>
          Back to Contact Data
        </button>
        <h1 className="text-3xl font-bold text-white mb-2">Update Contact Data</h1>
        <p className="text-slate-400">Modify your website's contact information and branding</p>
      </div>

      <form onSubmit={handleSubmit} className="max-w-4xl">
        {inputGroups.map((group, groupIndex) => (
          <div key={groupIndex} className="bg-slate-800/30 backdrop-blur-sm rounded-xl border border-slate-700/50 p-8 mb-6">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <span className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center text-sm">
                {groupIndex + 1}
              </span>
              {group.title}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {group.fields.map((field) => (
                <div key={field.name} className={field.name === 'tag' || field.name === 'address' ? 'md:col-span-2' : ''}>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    {field.label} {field.required && <span className="text-red-400">*</span>}
                  </label>
                  <div className="relative">
                    {field.icon && (
                      <i className={`${field.icon} absolute left-4 top-1/2 -translate-y-1/2 text-slate-400`}></i>
                    )}
                    <input
                      type={field.type}
                      name={field.name}
                      value={formData[field.name]}
                      onChange={handleChange}
                      placeholder={field.placeholder}
                      maxLength={field.maxLength}
                      required={field.required}
                      className={`w-full ${field.icon ? 'pl-12' : 'pl-4'} pr-4 py-3 bg-slate-900/50 border border-slate-700/50 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={submitting}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {submitting ? (
              <>
                <i className="bi bi-arrow-repeat animate-spin"></i>
                Updating...
              </>
            ) : (
              <>
                <i className="bi bi-check-circle"></i>
                Update Contact Data
              </>
            )}
          </button>
          <button
            type="button"
            onClick={() => navigate("/admin-dashboard/profile/all-create-data")}
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
}

export default UpdateData;