import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import APIService from "../../services/api";
import Loading from "../../components/Loading";

function Course(props) {
  const { data, showAlert, onDelete } = props;

  async function handleDelete() {
    try {
      await APIService.courses.delete(data._id);
      showAlert("Course deleted successfully!", "success");
      onDelete(); // Refresh list
    } catch (error) {
      showAlert("An error occurred while deleting the course.", "error");
    }
  }

  return (
    <div className="card shadow-2xl bg-base-300 sm:w-80 w-full sm:m-3 m-4 my-4 shadow-xl h-fit hover:shadow-2xl transition-shadow duration-300">
      <figure>
        <img
          src={data.imageUrl}
          alt={data.courseName}
          className="h-[170px] w-full object-cover"
        />
      </figure>
      <div className="card-body p-4">
        <h2 className="card-title text-white">
          {data.courseName}
          <div className="badge badge-secondary text-xs">English</div>
        </h2>
        <div className="flex align-center justify-between text-sm text-gray-300">
          <div className="space-y-1">
            <p>Mode: <span className="text-white">Online</span></p>
            <p>Status: <span className="text-success">Ongoing</span></p>
          </div>
          <div className="space-y-1 text-right">
            <p>Price: ₹{data.price}</p>
            <p>Duration: {data.duration} days</p>
          </div>
        </div>
        <div className="space-y-1 mt-2 text-sm text-gray-300">
          <p>Free Internship: <span className="text-success">Available</span></p>
          <p>Certificate: Completion + Internship</p>
          <p className="flex items-center gap-2">
            Recordings: {data.hours}+hrs
            <span className="badge badge-success badge-sm text-black font-bold">LIFETIME</span>
          </p>
        </div>
        <div className="card-actions justify-end mt-4">
          <Link to={`/admin-dashboard/profile/all-courses/${data._id}`}>
            <div className="btn btn-sm btn-outline btn-success">
              Update
            </div>
          </Link>
          <button
            className="btn btn-sm btn-outline btn-error"
            onClick={handleDelete}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

function AllCourses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
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

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await APIService.courses.getAll();
      setCourses(response?.data?.data || []);
    } catch (error) {
      setCourses([]);
      showAlert("Error fetching courses. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  if (loading) {
    return <Loading message="Loading courses..." />;
  }

  if (courses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-400">
        <p className="text-xl">No courses found</p>
        <Link to="/admin-dashboard/profile/create-course" className="btn btn-primary mt-4">
          Create First Course
        </Link>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto pb-[100px] p-4">
      <div className="flex flex-wrap justify-evenly gap-4">
        {courses.map((x, index) => (
          <Course key={x._id || index} data={x} showAlert={showAlert} onDelete={fetchCourses} />
        ))}
      </div>

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
  );
}

export default AllCourses;