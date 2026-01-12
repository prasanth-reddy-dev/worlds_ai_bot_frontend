import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import APIService from "../../services/api";

function UpdateRecordings() {
  const { id } = useParams(); // Batch ID from URL params
  const [batch, setBatch] = useState({
    batchNumber: "",
    videos: [],
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
    const fetchBatchData = async () => {
      try {
        const response = await APIService.recordings.getById(id);

        if (response.status === 200) {
          const { batchNumber, recordings } = response.data;

          if (recordings && Array.isArray(recordings)) {
            const formattedVideos = recordings.map((recording) => ({
              videoUrl: recording.videoUrl || recording.url || "",
              videoTitle: recording.videoTitle || recording.title || "",
            }));

            setBatch({
              batchNumber: batchNumber || "",
              videos: formattedVideos,
            });
          } else {
            showAlert("No recordings found.", "error");
          }
        }
      } catch (error) {
        showAlert("Failed to load batch data.", "error");
      }
    };

    fetchBatchData();
  }, [id]);

  const handleBatchNumberChange = (e) => {
    setBatch({ ...batch, batchNumber: e.target.value });
  };

  const handleVideoUrlChange = (index, value) => {
    const updatedVideos = [...batch.videos];
    updatedVideos[index].videoUrl = value;
    setBatch({ ...batch, videos: updatedVideos });
  };

  const handleVideoTitleChange = (index, value) => {
    const updatedVideos = [...batch.videos];
    updatedVideos[index].videoTitle = value;
    setBatch({ ...batch, videos: updatedVideos });
  };

  const removeVideo = (index) => {
    const updatedVideos = batch.videos.filter((_, i) => i !== index);
    setBatch({ ...batch, videos: updatedVideos });
  };

  const addVideo = () => {
    const updatedVideos = [...batch.videos, { videoUrl: "", videoTitle: "" }];
    setBatch({ ...batch, videos: updatedVideos });
  };

  const validate = () => {
    const newErrors = [];

    if (!batch.batchNumber) {
      newErrors.push("Batch number is required.");
    }

    batch.videos.forEach((video, index) => {
      const videoErrors = [];
      if (!video.videoUrl.trim()) {
        videoErrors.push("Video URL is required.");
      }
      if (!video.videoTitle.trim()) {
        videoErrors.push("Video title is required.");
      }
      if (videoErrors.length > 0) {
        newErrors.push(`Video ${index + 1}: ${videoErrors.join(", ")}`);
      }
    });

    if (newErrors.length > 0) {
      showAlert(newErrors.join(" | "), "error");
      return false;
    }
    return true;
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (validate()) {
      try {
        const response = await APIService.recordings.update(id, {
          batchNumber: batch.batchNumber,
          recordings: batch.videos
        });
        if (response.status === 200) {
          showAlert("Recordings updated successfully!", "success");
        }
      } catch (error) {
        showAlert(error.response?.data?.message || "Failed to update recordings.", "error");
      }
    }
  };

  return (
    <div className="sm:p-6 p-0 sm:pb-0 pb-[120px] bg-[#030712] h-full overflow-y-scroll m-4 rounded shadow-md">
      <h1 className="text-white text-xl font-bold mb-6">Update Recordings</h1>

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

      <div className="mt-4">
        <button
          type="button"
          onClick={addVideo}
          className="px-5 py-2 bg-green-500 text-black rounded hover:bg-green-600"
        >
          Add Video
        </button>
      </div>

      <div className="mt-6">
        <button
          type="submit"
          onClick={handleUpdate}
          className="px-5 py-2 bg-blue-500 text-black rounded hover:bg-blue-600"
        >
          Update Recordings
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

export default UpdateRecordings;