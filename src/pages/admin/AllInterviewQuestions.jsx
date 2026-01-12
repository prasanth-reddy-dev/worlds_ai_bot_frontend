import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import APIService from "../../services/api";

function AllInterviewQuestions() {
  const [questionSets, setQuestionSets] = useState([]);
  const [alert, setAlert] = useState(null);
  const [progress, setProgress] = useState(100);

  const fetchQuestionSets = async () => {
    try {
      const response = await APIService.interviews.getAll();
      const questions = response?.data?.data || response?.data || [];
      setQuestionSets(Array.isArray(questions) ? questions : []);
    } catch (error) {
      showAlert("Error fetching questions. Please try again.", "error");
    }
  };

  useEffect(() => {
    fetchQuestionSets();
  }, []);

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

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete these interview questions?')) return;

    try {
      await APIService.interviews.delete(id);
      showAlert("Questions deleted successfully!", "success");
      fetchQuestionSets(); // Refresh the list
    } catch (error) {
      showAlert("Error deleting questions. Please try again.", "error");
    }
  };

  return (
    <div className="bg-gray-950 min-h-screen p-5 text-[#ccd6f6]">
      <h1 className="text-center text-[#64ffda] mb-8 text-3xl font-bold">
        All Interview Questions
      </h1>
      <div className="flex flex-wrap gap-5 justify-center">
        {questionSets.map((set) => (
          <div
            key={set._id}
            className="bg-[#112240] p-5 rounded-lg w-72 shadow-lg transition-transform duration-200 cursor-pointer hover:scale-105 text-[#ccd6f6]"
          >
            <h2 className="text-[#64ffda] mb-3 text-xl font-semibold">
              {set.topic}
            </h2>
            <p>{set._id}</p>
            <div className="flex gap-3 mt-5">
              <Link
                to={`/admin-dashboard/profile/update-interview/${set._id}`}
                className="flex-1 text-center no-underline bg-[#64ffda] text-[#0a192f] px-4 py-2 rounded-lg font-bold"
              >
                Update
              </Link>
              <button
                onClick={() => handleDelete(set._id)}
                className="flex-1 bg-[#ff4d4d] text-[#0a192f] px-4 py-2 rounded-lg font-bold border-none cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {alert && (
        <div
          className={`fixed bottom-4 right-4 px-4 py-3 rounded-lg text-white shadow-lg transition-all duration-300 ${alert.type === "success" ? "bg-green-600" : "bg-red-600"
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

export default AllInterviewQuestions;