import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import APIService from '../../services/api';

function UpdateBootcamp() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
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

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        setLoading(true);
        const response = await APIService.bootcamps.getById(id);
        const data = response.data;

        // Convert dates to YYYY-MM-DD format
        const formattedData = {
          ...data,
          startDate: data.startDate ? new Date(data.startDate).toISOString().split('T')[0] : '',
          endDate: data.endDate ? new Date(data.endDate).toISOString().split('T')[0] : '',
        };

        setFormData(formattedData);
      } catch (error) {
        showAlert('Error fetching course data.', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchCourse();
  }, [id]);

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

  const addTopic = (index) => {
    const newRoadmap = [...formData.courseRoadmap];
    newRoadmap[index].push('');
    setFormData({ ...formData, courseRoadmap: newRoadmap });
  };

  const addInstructor = () => {
    setFormData({
      ...formData,
      instructors: [...formData.instructors, { name: '', role: '', description: '' }],
    });
  };

  const validateForm = () => {
    const errors = [];
    if (!formData.days) errors.push('Days is required.');
    if (!formData.courseName.trim()) errors.push('Course Name is required.');
    if (!formData.startDate) errors.push('Start Date is required.');
    if (!formData.endDate) errors.push('End Date is required.');
    if (!formData.startTime) errors.push('Start Time is required.');
    if (!formData.videoUrl.trim()) errors.push('Video URL is required.');
    if (formData.courseRoadmap.some(roadmap => roadmap.every(topic => !topic.trim()))) {
      errors.push('At least one non-empty topic is required in each roadmap.');
    }
    if (formData.instructors.some(instructor => !instructor.name.trim() || !instructor.role.trim() || !instructor.description.trim())) {
      errors.push('Each instructor must have a name, role, and description.');
    }

    if (errors.length > 0) {
      showAlert(errors.join(', '), 'error');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const response = await APIService.bootcamps.update(id, formData);
      if (response.status === 200) {
        showAlert('Course updated successfully!', 'success');
        setTimeout(() => {
          navigate('/admin-dashboard/profile/all-bootcamps');
        }, 2000);
      } else {
        showAlert('Failed to update course.', 'error');
      }
    } catch (error) {
      showAlert(error.response?.data?.message || 'Error updating course.', 'error');
    }
  };

  if (loading) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400">Loading bootcamp data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-950 h-full overflow-y-auto sm:p-6 p-2 text-white">
      <h1 className="text-3xl font-bold text-[#64ffda] text-center mb-8">Update Bootcamp</h1>
      <form onSubmit={handleSubmit} className="max-w-2xl mx-auto bg-gray-900 rounded-lg p-4 sm:pb-[0px] pb-[120px]">
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">Days</label>
          <input
            type="number"
            name="days"
            value={formData.days}
            onChange={(e) => handleChange(e)}
            className="w-full p-2 bg-[#112240] rounded text-[#ccd6f6]"
            required
          />
        </div>
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">Course Name</label>
          <input
            type="text"
            name="courseName"
            value={formData.courseName}
            onChange={(e) => handleChange(e)}
            className="w-full p-2 bg-[#112240] rounded text-[#ccd6f6]"
            required
          />
        </div>
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">Start Date</label>
          <input
            type="date"
            name="startDate"
            value={formData.startDate}
            onChange={(e) => handleChange(e)}
            className="w-full p-2 bg-[#112240] rounded text-[#ccd6f6]"
            required
          />
        </div>
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">End Date</label>
          <input
            type="date"
            name="endDate"
            value={formData.endDate}
            onChange={(e) => handleChange(e)}
            className="w-full p-2 bg-[#112240] rounded text-[#ccd6f6]"
            required
          />
        </div>
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">Start Time</label>
          <input
            type="time"
            name="startTime"
            value={formData.startTime}
            onChange={(e) => handleChange(e)}
            className="w-full p-2 bg-[#112240] rounded text-[#ccd6f6]"
            required
          />
        </div>
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">Course Roadmap</label>
          {formData.courseRoadmap.map((roadmap, index) => (
            <div key={index} className="mb-4">
              {roadmap.map((topic, subIndex) => (
                <input
                  key={subIndex}
                  type="text"
                  value={topic}
                  onChange={(e) => handleChange(e, index, 'courseRoadmap', subIndex)}
                  className="w-full p-2 bg-[#112240] rounded text-[#ccd6f6] mb-2"
                  required
                />
              ))}
              <button
                type="button"
                onClick={() => addTopic(index)}
                className="bg-[#64ffda] text-[#0a192f] px-4 py-2 rounded"
              >
                Add Topic
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={addRoadmap}
            className="bg-[#64ffda] text-[#0a192f] px-4 py-2 rounded"
          >
            Add Roadmap
          </button>
        </div>
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">Video URL</label>
          <input
            type="text"
            name="videoUrl"
            value={formData.videoUrl}
            onChange={(e) => handleChange(e)}
            className="w-full p-2 bg-[#112240] rounded text-[#ccd6f6]"
            required
          />
        </div>
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">Instructors</label>
          {formData.instructors.map((instructor, index) => (
            <div key={index} className="mb-4">
              <input
                type="text"
                name="name"
                placeholder="Name"
                value={instructor.name}
                onChange={(e) => handleChange(e, index, 'instructors')}
                className="w-full p-2 bg-[#112240] rounded text-[#ccd6f6] mb-2"
                required
              />
              <input
                type="text"
                name="role"
                placeholder="Role"
                value={instructor.role}
                onChange={(e) => handleChange(e, index, 'instructors')}
                className="w-full p-2 bg-[#112240] rounded text-[#ccd6f6] mb-2"
                required
              />
              <input
                type="text"
                name="description"
                placeholder="Description"
                value={instructor.description}
                onChange={(e) => handleChange(e, index, 'instructors')}
                className="w-full p-2 bg-[#112240] rounded text-[#ccd6f6] mb-2"
                required
              />
            </div>
          ))}
          <button
            type="button"
            onClick={addInstructor}
            className="bg-[#64ffda] text-[#0a192f] px-4 py-2 rounded"
          >
            Add Instructor
          </button>
        </div>
        <button
          type="submit"
          className="w-full bg-[#64ffda] text-[#0a192f] px-4 py-2 rounded font-bold"
        >
          Update Course
        </button>

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
    </div>
  );
}

export default UpdateBootcamp;