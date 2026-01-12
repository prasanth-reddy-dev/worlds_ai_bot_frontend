import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import APIService from '../../services/api';

function RecordingCard(props) {
  const { data, showAlert, onRefresh } = props;

  async function handleDelete() {
    if (!window.confirm('Are you sure you want to delete this recording batch?')) return;

    try {
      const response = await APIService.recordings.delete(data._id);
      if (response.status === 200) {
        showAlert("Recordings deleted successfully!", "success");
        onRefresh(); // Refresh the list
      } else {
        showAlert("Failed to delete the recordings.", "error");
      }
    } catch (error) {
      showAlert("An error occurred while deleting the recordings.", "error");
    }
  }

  return (
    <div className="card bg-[#16191F] text-white my-2">
      <div className="card-body items-center text-center">
        <h2 className="card-title">{data.batchNumber}</h2>
        <p>{data._id}</p>
        <div className="card-actions justify-end">
          <Link to={`/admin-dashboard/profile/update-recordings/${data._id}`}>
            <button className="badge rounded py-4 px-4 bg-success text-black">Update</button>
          </Link>
          <button className="badge rounded py-4 px-4 bg-error text-black" onClick={handleDelete}>
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

function AllRecordings() {
  const [recordings, setRecordings] = useState([]);
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

  async function fetchRecordings() {
    try {
      const response = await APIService.recordings.getAll();
      const data = response?.data?.data || response?.data || [];
      setRecordings(Array.isArray(data) ? data : []);
    } catch (error) {
      setRecordings([]);
      showAlert("Error fetching recordings. Please try again.", "error");
    }
  }

  useEffect(() => {
    fetchRecordings();
  }, []);

  if (recordings.length === 0) {
    return <h1>No recordings are available</h1>;
  }

  return (
    <div className="flex flex-wrap align-center justify-evenly">
      {recordings.map((x, index) => (
        <RecordingCard key={x._id || index} data={x} showAlert={showAlert} onRefresh={fetchRecordings} />
      ))}
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

export default AllRecordings;