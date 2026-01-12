import React, { useState, useEffect } from "react";
import APIService from "../../services/api";

function CreateInterviewQuestions() {
  const [topic, setTopic] = useState("");
  const [questions, setQuestions] = useState([""]);
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

  const handleQuestionChange = (index, value) => {
    const newQuestions = [...questions];
    newQuestions[index] = value;
    setQuestions(newQuestions);
  };

  const addQuestionField = () => {
    setQuestions([...questions, ""]);
  };

  const removeQuestionField = (index) => {
    if (questions.length > 1) {
      setQuestions(questions.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!topic || questions.some((q) => !q.trim())) {
      showAlert("Topic and all questions are required.", "error");
      return;
    }
    try {
      const response = await APIService.interviews.create({ topic, questions });
      if (response.status === 200 || response.status === 201) {
        showAlert("Interview questions created successfully!", "success");
        setTopic("");
        setQuestions([""]);
      }
    } catch (err) {
      showAlert(err.response?.data?.message || "Failed to create interview questions.", "error");
    }
  };

  return (
    <div className="h-full mt-4 sm:mt-5 m-3 bg-gray-950 flex items-start justify-center">
      <div className="bg-gray-800 sm:p-8 p-3 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center text-white">
          Create Interview Questions
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label
              className="block text-white text-sm font-bold mb-2"
              htmlFor="topic"
            >
              Topic
            </label>
            <input
              type="text"
              id="topic"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-700 text-white"
              placeholder="Enter topic (e.g., Python)"
            />
          </div>
          <div className="mb-6">
            <label className="block text-white text-sm font-bold mb-2">
              Questions
            </label>
            {questions.map((question, index) => (
              <div key={index} className="flex mb-2">
                <textarea
                  value={question}
                  onChange={(e) => handleQuestionChange(index, e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-700 text-white"
                  placeholder={`Question ${index + 1}`}
                />
                {questions.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeQuestionField(index)}
                    className="ml-2 bg-red-500 text-white px-2 py-1 rounded-lg"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={addQuestionField}
              className="bg-green-500 text-white px-4 py-2 rounded-lg mt-2"
            >
              Add Question
            </button>
          </div>
          <div className="flex justify-center">
            <button
              type="submit"
              className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition duration-300"
            >
              Create Questions
            </button>
          </div>
        </form>

        {alert && (
          <div
            className={`fixed bottom-4 right-4 px-4 py-3 rounded-lg text-white shadow-lg transition-all duration-300 z-[50] ${alert.type === "success" ? "bg-green-600" : "bg-red-600"
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

export default CreateInterviewQuestions;