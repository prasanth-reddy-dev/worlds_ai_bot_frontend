import React, { useState, useEffect } from 'react';
import APIService from '../../services/api';

const CreateBootcamp = () => {
  const [formData, setFormData] = useState({
    days: '',
    courseName: '',
    startDate: '',
    endDate: '',
    startTime: '',
    courseRoadmap: [['']],
    videoUrl: '',
    instructors: [{ name: '', role: '', description: '' }],
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

  const handleChange = (e, index, type, subIndex) => {
    const { name, value } = e.target;
    if (type === 'courseRoadmap') {
      const newRoadmap = [...formData.courseRoadmap];
      newRoadmap[index][subIndex] = value;
      setFormData({ ...formData, courseRoadmap: newRoadmap });
    } else if (type === 'instructors') {
      const newInstructors = [...formData.instructors];
      newInstructors[index][name] = value;
      setFormData({ ...formData, instructors: newInstructors });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const addRoadmap = () => {
    setFormData({
      ...formData,
      courseRoadmap: [...formData.courseRoadmap, ['']],
    });
  };

  const deleteRoadmap = (index) => {
    const newRoadmap = formData.courseRoadmap.filter((_, i) => i !== index);
    setFormData({ ...formData, courseRoadmap: newRoadmap });
  };

  const addTopic = (index) => {
    const newRoadmap = [...formData.courseRoadmap];
    newRoadmap[index].push('');
    setFormData({ ...formData, courseRoadmap: newRoadmap });
  };

  const deleteTopic = (roadmapIndex, topicIndex) => {
    const newRoadmap = [...formData.courseRoadmap];
    newRoadmap[roadmapIndex] = newRoadmap[roadmapIndex].filter((_, i) => i !== topicIndex);
    setFormData({ ...formData, courseRoadmap: newRoadmap });
  };

  const addInstructor = () => {
    setFormData({
      ...formData,
      instructors: [...formData.instructors, { name: '', role: '', description: '' }],
    });
  };

  const deleteInstructor = (index) => {
    const newInstructors = formData.instructors.filter((_, i) => i !== index);
    setFormData({ ...formData, instructors: newInstructors });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await APIService.bootcamps.create(formData);
      if (response.status === 200 || response.status === 201) {
        showAlert('Bootcamp created successfully!', 'success');
        // Reset form after successful creation
        setFormData({
          days: '',
          courseName: '',
          startDate: '',
          endDate: '',
          startTime: '',
          courseRoadmap: [['']],
          videoUrl: '',
          instructors: [{ name: '', role: '', description: '' }],
        });
      }
    } catch (error) {
      showAlert(error.response?.data?.message || 'An error occurred while creating the bootcamp.', 'error');
    }
  };

  return (
    <div className="bg-gray-950 h-full overflow-y-auto sm:p-6 p-2 text-white flex items-start justify-center">
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

      <div className="bg-gray-800 sm:p-8 p-2 pb-[120px] rounded-lg shadow-lg w-full max-w-4xl">
        <h1 className="text-3xl font-bold text-teal-400 mb-6">Create Bootcamp</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300">Days:</label>
            <input
              type="number"
              name="days"
              value={formData.days}
              onChange={(e) => handleChange(e)}
              className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:ring-teal-500 focus:border-teal-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300">Course Name:</label>
            <input
              type="text"
              name="courseName"
              value={formData.courseName}
              onChange={(e) => handleChange(e)}
              className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:ring-teal-500 focus:border-teal-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300">Start Date:</label>
            <input
              type="date"
              name="startDate"
              value={formData.startDate}
              onChange={(e) => handleChange(e)}
              className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:ring-teal-500 focus:border-teal-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300">End Date:</label>
            <input
              type="date"
              name="endDate"
              value={formData.endDate}
              onChange={(e) => handleChange(e)}
              className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:ring-teal-500 focus:border-teal-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300">Start Time:</label>
            <input
              type="time"
              name="startTime"
              value={formData.startTime}
              onChange={(e) => handleChange(e)}
              className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:ring-teal-500 focus:border-teal-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300">Course Roadmap:</label>
            {formData.courseRoadmap.map((roadmap, index) => (
              <div key={index} className="space-y-2">
                {roadmap.map((topic, subIndex) => (
                  <div key={subIndex} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={topic}
                      onChange={(e) => handleChange(e, index, 'courseRoadmap', subIndex)}
                      className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:ring-teal-500 focus:border-teal-500"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => deleteTopic(index, subIndex)}
                      className="px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                    >
                      Delete
                    </button>
                  </div>
                ))}
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => addTopic(index)}
                    className="mt-2 px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700"
                  >
                    Add Topic
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteRoadmap(index)}
                    className="mt-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                  >
                    Delete Roadmap
                  </button>
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={addRoadmap}
              className="mt-4 px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700"
            >
              Add Roadmap
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300">Video URL:</label>
            <input
              type="text"
              name="videoUrl"
              value={formData.videoUrl}
              onChange={(e) => handleChange(e)}
              className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:ring-teal-500 focus:border-teal-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300">Instructors:</label>
            {formData.instructors.map((instructor, index) => (
              <div key={index} className="space-y-2">
                <input
                  type="text"
                  name="name"
                  placeholder="Name"
                  value={instructor.name}
                  onChange={(e) => handleChange(e, index, 'instructors')}
                  className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:ring-teal-500 focus:border-teal-500"
                  required
                />
                <input
                  type="text"
                  name="role"
                  placeholder="Role"
                  value={instructor.role}
                  onChange={(e) => handleChange(e, index, 'instructors')}
                  className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:ring-teal-500 focus:border-teal-500"
                  required
                />
                <input
                  type="text"
                  name="description"
                  placeholder="Description"
                  value={instructor.description}
                  onChange={(e) => handleChange(e, index, 'instructors')}
                  className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:ring-teal-500 focus:border-teal-500"
                  required
                />
                <button
                  type="button"
                  onClick={() => deleteInstructor(index)}
                  className="mt-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  Delete Instructor
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addInstructor}
              className="mt-4 px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700"
            >
              Add Instructor
            </button>
          </div>

          <button
            type="submit"
            className="w-full px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700"
          >
            Submit
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateBootcamp;