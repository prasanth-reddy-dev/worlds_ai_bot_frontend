import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import APIService from "../../services/api";
import Loading from "../../components/Loading";

function RoadMapCard(props) {
  const { data, showAlert, onDelete } = props;

  async function handleDelete() {
    if (!window.confirm(`Are you sure you want to delete roadmap: ${data.courseName}?`)) return;

    try {
      await APIService.roadmaps.delete(data._id);
      showAlert("Roadmap deleted successfully!", "success");
      onDelete(data._id);
    } catch (error) {
      showAlert("An error occurred while deleting the roadmap.", "error");
    }
  }

  return (
    <div className="card bg-[#16191F] text-white my-4 shadow-xl hover:shadow-2xl transition-all duration-300 w-80">
      <div className="card-body items-center text-center">
        <h2 className="card-title text-xl font-bold text-blue-400">{data.courseName}</h2>
        <p className="text-gray-400 text-xs mb-4">{data._id}</p>

        <div className="flex gap-2 w-full mt-4">
          <Link to={`/admin-dashboard/profile/update-road-map/${data._id}`} className="flex-1">
            <button className="btn btn-sm btn-outline btn-success w-full">Update</button>
          </Link>
          <button
            className="btn btn-sm btn-outline btn-error flex-1"
            onClick={handleDelete}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

function AllRoadMaps() {
  const [roadMap, setRoadMap] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);
  const [progress, setProgress] = useState(100);

  const fetchRoadMap = async () => {
    try {
      setLoading(true);
      const response = await APIService.roadmaps.getAll();
      // Extract data from nested structure - could be response.data.data or response.data
      const roadmaps = response?.data?.data || response?.data || [];
      setRoadMap(Array.isArray(roadmaps) ? roadmaps : []);
    } catch (error) {
      setRoadMap([]);
      showAlert("Error fetching roadmaps. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoadMap();
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

  const handleDeleteSuccess = (id) => {
    setRoadMap(prev => prev.filter(item => item._id !== id));
  };

  if (loading) {
    return <Loading message="Loading roadmaps..." />;
  }

  if (roadMap.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-10 text-gray-400">
        <h1 className="text-2xl mb-4">No roadmaps available</h1>
        <Link to="/admin-dashboard/profile/create-roadmap" className="btn btn-primary">
          Create First Roadmap
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap align-center justify-evenly gap-4 p-4 pb-24">
      {roadMap.map((x, index) => (
        <RoadMapCard key={x._id || index} data={x} showAlert={showAlert} onDelete={handleDeleteSuccess} />
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

export default AllRoadMaps;