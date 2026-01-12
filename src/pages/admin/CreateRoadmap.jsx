import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import APIService from "../../services/api";

const RoadMapForm = () => {
  const navigate = useNavigate();
  const [roadmap, setRoadmap] = useState({
    courseName: "",
    tutorName: "",
    tutorDescription: "",
    tutorImageUrl: "",
    skills: [
      {
        skillName: "",
        subTopics: [""],
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

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setRoadmap({ ...roadmap, [name]: value });
  };

  // Handle skill name change
  const handleSkillNameChange = (index, value) => {
    const updatedSkills = [...roadmap.skills];
    updatedSkills[index].skillName = value;
    setRoadmap({ ...roadmap, skills: updatedSkills });
  };

  // Handle topic change
  const handleTopicChange = (skillIndex, topicIndex, value) => {
    const updatedSkills = [...roadmap.skills];
    updatedSkills[skillIndex].subTopics[topicIndex] = value;
    setRoadmap({ ...roadmap, skills: updatedSkills });
  };

  // Add a new topic for a specific skill
  const addTopic = (skillIndex) => {
    const updatedSkills = [...roadmap.skills];
    updatedSkills[skillIndex].subTopics.push("");
    setRoadmap({ ...roadmap, skills: updatedSkills });
  };

  // Add a new skill
  const addSkill = () => {
    setRoadmap({
      ...roadmap,
      skills: [
        ...roadmap.skills,
        {
          skillName: "",
          subTopics: [""],
        },
      ],
    });
  };

  // Remove a topic
  const removeTopic = (skillIndex, topicIndex) => {
    const updatedSkills = [...roadmap.skills];
    updatedSkills[skillIndex].subTopics.splice(topicIndex, 1);
    setRoadmap({ ...roadmap, skills: updatedSkills });
  };

  // Remove a skill
  const removeSkill = (skillIndex) => {
    const updatedSkills = [...roadmap.skills];
    updatedSkills.splice(skillIndex, 1);
    setRoadmap({ ...roadmap, skills: updatedSkills });
  };

  // Validation Function
  const validate = () => {
    const newErrors = {};
    if (!roadmap.courseName.trim()) {
      newErrors.courseName = "Course Name is required.";
    }
    if (!roadmap.tutorName.trim()) {
      newErrors.tutorName = "Tutor Name is required.";
    }
    if (!roadmap.tutorDescription.trim()) {
      newErrors.tutorDescription = "Tutor Description is required.";
    }
    if (!roadmap.tutorImageUrl.trim()) {
      newErrors.tutorImageUrl = "Tutor Image URL is required.";
    }
    roadmap.skills.forEach((skill, skillIndex) => {
      if (!skill.skillName.trim()) {
        newErrors[`skillName-${skillIndex}`] = "Skill Name is required.";
      }
      skill.subTopics.forEach((topic, topicIndex) => {
        if (!topic.trim()) {
          newErrors[`subTopic-${skillIndex}-${topicIndex}`] = "Topic is required.";
        }
      });
    });
    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      const errorMessages = Object.values(newErrors).join(', ');
      showAlert(errorMessages, 'error');
      return false;
    }
    return true;
  };

  // Submit the form
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validate()) {
      try {
        const response = await APIService.roadmaps.create(roadmap);
        if (response.status === 200 || response.status === 201) {
          showAlert("Roadmap stored successfully!", "success");
          setTimeout(() => {
            navigate("/admin-dashboard/profile/all-roadmaps");
          }, 2000);
        } else {
          showAlert("Failed to store roadmap.", "error");
        }
      } catch (err) {
        showAlert(err.response?.data?.message || "Something went wrong while storing the roadmap.", "error");
      }
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="sm:p-6 p-0 sm:pb-0 pb-[120px] bg-[#030712] h-full overflow-y-auto m-4 rounded shadow-md"
    >
      <div className="mb-4">
        <label className="block text-white font-medium mb-2">Course Name:</label>
        <input
          type="text"
          name="courseName"
          value={roadmap.courseName}
          onChange={handleInputChange}
          placeholder="Enter course name"
          className="w-full px-3 py-2 rounded border border-gray-400"
        />
      </div>

      <div className="mb-4">
        <label className="block text-white font-medium mb-2">Tutor Name:</label>
        <input
          type="text"
          name="tutorName"
          value={roadmap.tutorName}
          onChange={handleInputChange}
          placeholder="Enter tutor name"
          className="w-full px-3 py-2 rounded border border-gray-400"
        />
      </div>

      <div className="mb-4">
        <label className="block text-white font-medium mb-2">Tutor Description:</label>
        <textarea
          name="tutorDescription"
          value={roadmap.tutorDescription}
          onChange={handleInputChange}
          placeholder="Enter tutor description"
          className="w-full px-3 py-2 rounded border border-gray-400"
        />
      </div>

      <div className="mb-4">
        <label className="block text-white font-medium mb-2">Tutor Image URL:</label>
        <input
          type="text"
          name="tutorImageUrl"
          value={roadmap.tutorImageUrl}
          onChange={handleInputChange}
          placeholder="Enter tutor image URL"
          className="w-full px-3 py-2 rounded border border-gray-400"
        />
      </div>

      {roadmap.skills.map((skill, skillIndex) => (
        <div
          key={skillIndex}
          className="mb-6 p-4 bg-[#18181b] rounded shadow relative"
        >
          <label className="block text-white font-medium mb-2">
            Skill Name:
          </label>
          <input
            type="text"
            value={skill.skillName}
            onChange={(e) => handleSkillNameChange(skillIndex, e.target.value)}
            placeholder="Enter skill name"
            className="w-full px-3 py-2 rounded border border-gray-400"
          />
          <button
            type="button"
            onClick={() => removeSkill(skillIndex)}
            className="absolute top-2 right-2 px-2 py-1 bg-red-500 text-white rounded"
          >
            Delete Skill
          </button>

          <div className="mt-4">
            <strong className="block text-white font-medium mb-2">Topics:</strong>
            {skill.subTopics.map((topic, topicIndex) => (
              <div key={topicIndex} className="flex items-center mb-2">
                <input
                  type="text"
                  value={topic}
                  onChange={(e) =>
                    handleTopicChange(skillIndex, topicIndex, e.target.value)
                  }
                  placeholder="Enter topic"
                  className="w-full px-3 py-2 rounded border border-gray-400"
                />
                <button
                  type="button"
                  onClick={() => removeTopic(skillIndex, topicIndex)}
                  className="ml-2 px-3 py-2 bg-red-500 text-white rounded"
                >
                  Delete
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => addTopic(skillIndex)}
              className="mt-2 px-3 py-2 bg-green-700 text-black font-bolder rounded"
            >
              + Add Topic
            </button>
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={addSkill}
        className="mb-4 px-4 py-2 bg-blue-500 text-black rounded hover:bg-blue-600"
      >
        + Add Skill
      </button>

      <div>
        <button
          type="submit"
          className="px-5 py-2 bg-blue-500 text-black rounded hover:bg-blue-600"
        >
          Create Road Map
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
    </form>
  );
};

export default RoadMapForm;