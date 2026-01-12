import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import APIService from '../../services/api';
import Loading from '../../components/Loading';

function AllBootcamps() {
  const [bootcamps, setBootcamps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);
  const [progress, setProgress] = useState(100);

  const fetchBootcamps = async () => {
    try {
      setLoading(true);
      const response = await APIService.bootcamps.getAll();
      const bootcampsData = response?.data?.data || response?.data || [];
      setBootcamps(Array.isArray(bootcampsData) ? bootcampsData : []);
    } catch (error) {
      showAlert('Error fetching bootcamps. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBootcamps();
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
    if (!window.confirm("Are you sure you want to delete this bootcamp?")) return;

    try {
      await APIService.bootcamps.delete(id);
      setBootcamps(bootcamps.filter((bootcamp) => bootcamp._id !== id));
      showAlert('Bootcamp deleted successfully!', 'success');
    } catch (error) {
      showAlert('Error deleting bootcamp. Please try again.', 'error');
    }
  };

  if (loading) {
    return <Loading message="Loading bootcamps..." />;
  }

  if (bootcamps.length === 0) {
    return (
      <div className="bg-gray-950 min-h-screen p-5 flex flex-col items-center justify-center text-[#ccd6f6]">
        <h1 className="text-3xl font-bold mb-4">No Bootcamps Found</h1>
        <Link to="/admin-dashboard/profile/create-bootcamp" className="bg-[#64ffda] text-[#0a192f] px-6 py-2 rounded-lg font-bold">
          Create Bootcamp
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-gray-950 min-h-screen p-5 text-[#ccd6f6]">
      <h1 className="text-center text-[#64ffda] mb-8 text-3xl font-bold">All Bootcamps</h1>
      <div className="flex flex-wrap gap-5 justify-center">
        {bootcamps.map((bootcamp) => (
          <div
            key={bootcamp._id}
            className="bg-[#112240] p-5 rounded-lg w-72 shadow-lg transition-transform duration-200 hover:scale-105 text-[#ccd6f6]"
          >
            <h2 className="text-[#64ffda] mb-3 text-xl font-semibold">{bootcamp.courseName}</h2>
            <div className="text-sm text-gray-400 mb-4 space-y-1">
              <p>Type: {bootcamp.days} Days</p>
              <p>Starts: {bootcamp.startDate}</p>
              <p>ID: <span className="text-xs">{bootcamp._id}</span></p>
            </div>
            <div className="flex gap-3 mt-5">
              <Link
                to={`/admin-dashboard/profile/update-bootcamp/${bootcamp._id}`}
                className="flex-1 text-center no-underline bg-[#64ffda] text-[#0a192f] px-4 py-2 rounded-lg font-bold hover:opacity-90 transition-opacity"
              >
                Update
              </Link>
              <button
                onClick={() => handleDelete(bootcamp._id)}
                className="flex-1 bg-[#ff4d4d] text-[#0a192f] px-4 py-2 rounded-lg font-bold border-none cursor-pointer hover:opacity-90 transition-opacity"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {alert && (
        <div
          className={`fixed bottom-4 right-4 px-4 py-3 rounded-lg text-white shadow-lg transition-all duration-300 z-50 ${alert.type === "success" ? "bg-green-600" : "bg-red-600"
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

export default AllBootcamps;