import React, { useState, useEffect } from "react";
import APIService from "../../services/api";

function CreateRecordings() {
  const [batch, setBatch] = useState({
    batchNumber: "",
    videos: [
      {
        videoUrl: "",
        videoTitle: "",
      },
    ],
  });

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

  // Handle batch number change
  const handleBatchNumberChange = (e) => {
    setBatch({ ...batch, batchNumber: e.target.value });
  };

  // Handle video URL change
  const handleVideoUrlChange = (index, value) => {
    const updatedVideos = [...batch.videos];
    updatedVideos[index].videoUrl = value;
    setBatch({ ...batch, videos: updatedVideos });
  };

  // Handle video title change
  const handleVideoTitleChange = (index, value) => {
    const updatedVideos = [...batch.videos];
    updatedVideos[index].videoTitle = value;
    setBatch({ ...batch, videos: updatedVideos });
  };

  // Add a new video URL and title input
  const addVideo = () => {
    setBatch({
      ...batch,
      videos: [...batch.videos, { videoUrl: "", videoTitle: "" }],
    });
  };

  // Remove a video URL and title input
  const removeVideo = (index) => {
    const updatedVideos = batch.videos.filter((_, i) => i !== index);
    setBatch({ ...batch, videos: updatedVideos });
  };

  // Validation function
  const validate = () => {
    const newErrors = {};

    if (!batch.batchNumber.trim()) {
      newErrors.batchNumber = "Batch number is required.";
    }

    batch.videos.forEach((video, index) => {
      if (!video.videoUrl.trim()) {
        newErrors[`videoUrl-${index}`] = "Video URL is required.";
      }
      if (!video.videoTitle.trim()) {
        newErrors[`videoTitle-${index}`] = "Video title is required.";
      }
    });

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      const errorMessages = Object.values(newErrors).join(', ');
      showAlert(errorMessages, 'error');
      return false;
    }
    return true;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (validate()) {
      try {
        const response = await APIService.recordings.create({
          batchNumber: batch.batchNumber,
          recordings: batch.videos.map((video) => ({
            videoUrl: video.videoUrl,
            videoTitle: video.videoTitle,
          })),
        });

        if (response.status === 200 || response.status === 201) {
          showAlert("Recordings added successfully!", "success");
          setBatch({
            batchNumber: "",
            videos: [
              {
                videoUrl: "",
                videoTitle: "",
              },
            ],
          });
          setErrors({});
        }
      } catch (error) {
        showAlert(error.response?.data?.message || "Failed to add recordings. Please try again.", "error");
      }
    }
  };

  return (
    <div className="sm:p-6 p-0 sm:pb-0 pb-[120px] bg-[#030712] h-full overflow-y-scroll m-4 rounded shadow-md">
      <div className="mb-4">
        <label className="block text-white font-medium mb-2">
          Batch Number:
        </label>
        <input
          type="number"
          value={batch.batchNumber}
          onChange={handleBatchNumberChange}
          placeholder="Enter batch number"
          className="w-full px-3 py-2 rounded border border-gray-400"
        />
      </div>

      {batch.videos.map((video, index) => (
        <div key={index} className="mb-6 p-4 bg-[#18181b] rounded shadow relative">
          <div className="mb-4">
            <label className="block text-white font-medium mb-2">
              Video URL:
            </label>
            <input
              type="text"
              value={video.videoUrl}
              onChange={(e) => handleVideoUrlChange(index, e.target.value)}
              placeholder="Enter video URL"
              className="w-full px-3 py-2 rounded border border-gray-400"
            />
          </div>

          <div>
            <label className="block text-white font-medium mb-2">
              Video Title:
            </label>
            <input
              type="text"
              value={video.videoTitle}
              onChange={(e) => handleVideoTitleChange(index, e.target.value)}
              placeholder="Enter video title"
              className="w-full px-3 py-2 rounded border border-gray-400"
            />
          </div>

          <button
            type="button"
            onClick={() => removeVideo(index)}
            className="absolute top-2 right-2 px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Delete
          </button>
        </div>
      ))}

      <button
        type="button"
        onClick={addVideo}
        className="mt-4 px-4 py-2 bg-green-700 text-black font-bold rounded hover:bg-green-800"
      >
        + Add Video
      </button>

      <div className="mt-6">
        <button
          type="submit"
          onClick={handleSubmit}
          className="px-5 py-2 bg-blue-500 text-black rounded hover:bg-blue-600"
        >
          Submit
        </button>
      </div>

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
  );
}

export default CreateRecordings;