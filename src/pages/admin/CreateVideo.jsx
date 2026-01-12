import React, { useState, useEffect } from 'react';
import APIService from '../../services/api';

function CreateVideo() {
  const [videoUrl, setVideoUrl] = useState('');
  const [jobRole, setJobRole] = useState('');
  const [name, setName] = useState('');
  const [packageAmount, setPackageAmount] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [errors, setErrors] = useState({});
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

  const validateForm = () => {
    const newErrors = {};
    if (!videoUrl.trim()) newErrors.videoUrl = 'Video URL is required';
    else if (!/^https?:\/\/.+/.test(videoUrl.trim())) {
      newErrors.videoUrl = 'Video URL must be a valid URL starting with http:// or https://';
    }

    if (!jobRole.trim()) newErrors.jobRole = 'Job Role is required';
    if (!name.trim()) newErrors.name = 'Name is required';
    if (!packageAmount.trim()) newErrors.packageAmount = 'Package is required';
    if (!companyName.trim()) newErrors.companyName = 'Company Name is required';
    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      const errorMessages = Object.values(newErrors).join(', ');
      showAlert(errorMessages, 'error');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const response = await APIService.videos.create({
        videoUrl,
        jobRole,
        name,
        package: packageAmount,
        companyName,
      });

      if (response.status === 200 || response.status === 201) {
        showAlert('Success video created successfully!', 'success');
        setVideoUrl('');
        setJobRole('');
        setName('');
        setPackageAmount('');
        setCompanyName('');
        setErrors({});
      }
    } catch (error) {
      showAlert(error.response?.data?.message || 'An error occurred while creating the video.', 'error');
    }
  };

  return (
    <div className="h-full bg-gray-950 p-2 sm:flex sm:items-center sm:justify-center">
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg w-full sm:max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center text-white">Create Success Video</h2>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-300 text-sm font-bold mb-2" htmlFor="videoUrl">
              Video URL
            </label>
            <input
              type="text"
              id="videoUrl"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.videoUrl
                ? 'border-red-500 focus:ring-red-500 bg-gray-700 text-white'
                : 'border-gray-600 focus:ring-blue-500 bg-gray-700 text-white'
                }`}
              placeholder="Enter video URL"
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-300 text-sm font-bold mb-2" htmlFor="jobRole">
              Job Role
            </label>
            <input
              type="text"
              id="jobRole"
              value={jobRole}
              onChange={(e) => setJobRole(e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.jobRole
                ? 'border-red-500 focus:ring-red-500 bg-gray-700 text-white'
                : 'border-gray-600 focus:ring-blue-500 bg-gray-700 text-white'
                }`}
              placeholder="Enter job role"
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-300 text-sm font-bold mb-2" htmlFor="name">
              Name
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.name
                ? 'border-red-500 focus:ring-red-500 bg-gray-700 text-white'
                : 'border-gray-600 focus:ring-blue-500 bg-gray-700 text-white'
                }`}
              placeholder="Enter name"
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-300 text-sm font-bold mb-2" htmlFor="package">
              Package
            </label>
            <input
              type="text"
              id="package"
              value={packageAmount}
              onChange={(e) => setPackageAmount(e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.packageAmount
                ? 'border-red-500 focus:ring-red-500 bg-gray-700 text-white'
                : 'border-gray-600 focus:ring-blue-500 bg-gray-700 text-white'
                }`}
              placeholder="Enter package"
            />
          </div>

          <div className="mb-6">
            <label className="block text-gray-300 text-sm font-bold mb-2" htmlFor="companyName">
              Company Name
            </label>
            <input
              type="text"
              id="companyName"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.companyName
                ? 'border-red-500 focus:ring-red-500 bg-gray-700 text-white'
                : 'border-gray-600 focus:ring-blue-500 bg-gray-700 text-white'
                }`}
              placeholder="Enter company name"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition duration-300"
          >
            Create Success Video
          </button>
        </form>

        {alert && (
          <div
            className={`fixed bottom-4 right-4 px-4 py-3 rounded-lg text-white shadow-lg transition-all duration-300 z-[50] ${alert.type === 'success' ? 'bg-green-600' : 'bg-red-600'
              } flex flex-col w-80`}
          >
            <div className="flex items-center space-x-2">
              <span className="flex-1">{alert.message}</span>
              <button
                onClick={dismissAlert}
                className="text-white hover:text-gray-200 focus:outline-none"
              >
                <i className="bi bi-x-lg"></i>
              </button>
            </div>
            <div className="w-full h-1 mt-2 bg-white/30 rounded-full overflow-hidden">
              <div
                className="h-full bg-white transition-all ease-linear"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default CreateVideo;