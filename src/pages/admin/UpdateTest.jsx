import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import APIService from "../../services/api";

function UpdateTest() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    question: "",
    youtube_url: "",
    test: [{ input: "", output: "" }],
  });
  const [alert, setAlert] = useState(null);
  const [progress, setProgress] = useState(100);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    async function fetchTest() {
      try {
        setLoading(true);
        const response = await APIService.tests.getById(id);
        if (response.status === 200) {
          const { _id, __v, ...filteredData } = response.data;
          setFormData({
            question: filteredData.question || "",
            youtube_url: filteredData.youtube_url || "",
            test: filteredData.test || [{ input: "", output: "" }],
          });
        }
      } catch (err) {
        showAlert("Failed to load test data.", "error");
      } finally {
        setLoading(false);
      }
    }
    fetchTest();
  }, [id]);

  const handleChange = (e, index) => {
    const { name, value } = e.target;
    if (name === "question" || name === "youtube_url") {
      setFormData({ ...formData, [name]: value });
    } else {
      const updatedTest = [...formData.test];
      updatedTest[index][name] = value;
      setFormData({ ...formData, test: updatedTest });
    }
  };

  const addTestCase = () => {
    setFormData({
      ...formData,
      test: [...formData.test, { input: "", output: "" }],
    });
  };

  const removeTestCase = (index) => {
    const updatedTest = formData.test.filter((_, i) => i !== index);
    setFormData({ ...formData, test: updatedTest });
  };

  const validateForm = () => {
    const errors = [];
    if (!formData.question.trim()) {
      errors.push("Question is required.");
    }
    if (formData.test.length === 0) {
      errors.push("At least one test case is required.");
    }
    formData.test.forEach((item, index) => {
      const testCaseErrors = [];
      if (!item.input.trim()) {
        testCaseErrors.push("Input is required.");
      }
      if (!item.output.trim()) {
        testCaseErrors.push("Output is required.");
      }
      if (testCaseErrors.length > 0) {
        errors.push(`Test Case ${index + 1}: ${testCaseErrors.join(", ")}`);
      }
    });

    if (errors.length > 0) {
      showAlert(errors.join(" | "), "error");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setIsSubmitting(true);
      const response = await APIService.tests.update(id, formData);
      if (response.status === 200) {
        showAlert("Test updated successfully!", "success");
        setTimeout(() => {
          navigate("/admin-dashboard/profile/all-tests");
        }, 2000);
      }
    } catch (err) {
      showAlert(err.response?.data?.message || "Failed to update test.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Extract YouTube video ID for preview
  const getYouTubeId = (url) => {
    const match = url?.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
    return match ? match[1] : null;
  };

  const youtubeId = getYouTubeId(formData.youtube_url);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400">Loading test data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate("/admin-dashboard/profile/all-tests")}
            className="flex items-center gap-2 text-slate-400 hover:text-white mb-4 transition-colors"
          >
            <i className="bi bi-arrow-left"></i>
            Back to Tests
          </button>
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 text-transparent bg-clip-text">
            Update Coding Test
          </h1>
          <p className="text-slate-400 mt-2">Edit the coding problem, test cases, and video solution</p>
        </div>

        {/* Main Form Card */}
        <form onSubmit={handleSubmit} className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6 md:p-8 shadow-2xl">

          {/* Question Field */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-300 mb-2">
              <i className="bi bi-question-circle-fill mr-2 text-blue-400"></i>
              Problem Question
            </label>
            <textarea
              name="question"
              value={formData.question}
              onChange={handleChange}
              placeholder="Enter the coding problem statement..."
              rows={4}
              className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none"
            />
          </div>

          {/* YouTube URL Field */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-300 mb-2">
              <i className="bi bi-youtube mr-2 text-red-500"></i>
              YouTube Solution Video URL (Optional)
            </label>
            <input
              type="url"
              name="youtube_url"
              value={formData.youtube_url}
              onChange={handleChange}
              placeholder="https://www.youtube.com/watch?v=..."
              className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
            />

            {/* YouTube Preview */}
            {youtubeId && (
              <div className="mt-4 rounded-xl overflow-hidden border border-slate-600/50">
                <div className="aspect-video">
                  <iframe
                    src={`https://www.youtube.com/embed/${youtubeId}`}
                    title="YouTube Preview"
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              </div>
            )}
          </div>

          {/* Test Cases Section */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <label className="text-sm font-medium text-slate-300">
                <i className="bi bi-code-square mr-2 text-green-400"></i>
                Test Cases
              </label>
              <button
                type="button"
                onClick={addTestCase}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-500 hover:to-emerald-500 transition-all text-sm font-medium"
              >
                <i className="bi bi-plus-lg"></i>
                Add Test Case
              </button>
            </div>

            <div className="space-y-4">
              {formData.test.map((testCase, index) => (
                <div key={index} className="bg-slate-900/50 rounded-xl border border-slate-600/50 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-purple-400">
                      Test Case #{index + 1}
                    </span>
                    {formData.test.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeTestCase(index)}
                        className="text-red-400 hover:text-red-300 transition-colors"
                      >
                        <i className="bi bi-trash-fill"></i>
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Input</label>
                      <input
                        type="text"
                        name="input"
                        value={testCase.input}
                        onChange={(e) => handleChange(e, index)}
                        placeholder="e.g., [1, 2, 3]"
                        className="w-full px-3 py-2 bg-slate-800 border border-slate-600/50 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Expected Output</label>
                      <input
                        type="text"
                        name="output"
                        value={testCase.output}
                        onChange={(e) => handleChange(e, index)}
                        placeholder="e.g., 6"
                        className="w-full px-3 py-2 bg-slate-800 border border-slate-600/50 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white font-bold rounded-xl hover:from-blue-500 hover:via-purple-500 hover:to-pink-500 transition-all shadow-lg shadow-purple-500/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <span className="loading loading-spinner loading-sm"></span>
                Updating...
              </>
            ) : (
              <>
                <i className="bi bi-check-circle-fill"></i>
                Update Test
              </>
            )}
          </button>
        </form>
      </div>

      {/* Toast Alert */}
      {alert && (
        <div className="fixed bottom-6 right-6 z-50 animate-slide-up">
          <div
            className={`${alert.type === "success"
                ? "bg-gradient-to-r from-green-600 to-emerald-600"
                : "bg-gradient-to-r from-red-600 to-rose-600"
              } text-white px-6 py-4 rounded-xl shadow-2xl min-w-[320px] max-w-md`}
          >
            <div className="flex items-start gap-3">
              <i
                className={`${alert.type === "success"
                    ? "bi bi-check-circle-fill"
                    : "bi bi-exclamation-circle-fill"
                  } text-2xl flex-shrink-0`}
              ></i>
              <div className="flex-1">
                <p className="font-medium">{alert.message}</p>
                <div className="mt-2 h-1 bg-white/30 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-white transition-all duration-75 ease-linear"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              </div>
              <button
                onClick={dismissAlert}
                className="text-white/80 hover:text-white transition-colors"
              >
                <i className="bi bi-x-lg"></i>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default UpdateTest;