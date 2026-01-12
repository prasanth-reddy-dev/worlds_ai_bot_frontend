import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import APIService from "../../services/api";

function Row(props) {
  const { number, data, showAlert, onRefresh } = props;

  async function handleDelete() {
    if (!window.confirm('Are you sure you want to delete this privacy entry?')) return;

    try {
      const response = await APIService.privacy.delete(data._id);
      if (response.status === 200) {
        showAlert("Privacy entry deleted successfully!", "success");
        onRefresh(); // Refresh the list
      } else {
        showAlert("Failed to delete the privacy entry.", "error");
      }
    } catch (error) {
      showAlert("An error occurred while deleting the privacy entry.", "error");
    }
  }

  return (
    <tr>
      <th>{number}</th>
      <td>{data.heading}</td>
      <td>{data.paragraph}</td>
      <td className="text-success cursor-pointer">
        <Link to={`/admin-dashboard/profile/update-privacy/${data._id}`}>update</Link>
      </td>
      <td className="text-error cursor-pointer" onClick={handleDelete}>
        delete
      </td>
    </tr>
  );
}

function AllPrivacy() {
  const [privacyData, setPrivacyData] = useState([]);
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

  async function fetchPrivacies() {
    try {
      const response = await APIService.privacy.getAll();
      const privacies = response?.data?.data || response?.data || [];
      setPrivacyData(Array.isArray(privacies) ? privacies : []);
    } catch (err) {
      setPrivacyData([]);
      showAlert("Error fetching privacy entries. Please try again.", "error");
    }
  }

  useEffect(() => {
    fetchPrivacies();
  }, []);

  return (
    <div className="h-full w-full overflow-x-scroll overflow-y-scroll">
      <table className="table table-xs table-pin-rows table-pin-cols">
        <thead>
          <tr>
            <th></th>
            <td>Heading</td>
            <td>Paragraph</td>
            <td>Update</td>
            <td>Delete</td>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {privacyData.length > 0 ? (
            privacyData.map((x, index) => (
              <Row key={x._id || index} number={index + 1} data={x} showAlert={showAlert} onRefresh={fetchPrivacies} />
            ))
          ) : (
            <tr>
              <td colSpan="5" className="text-center">
                No privacy entries found.
              </td>
            </tr>
          )}
        </tbody>
        <tfoot>
          <tr>
            <th></th>
            <td>Heading</td>
            <td>Paragraph</td>
            <td>Update</td>
            <td>Delete</td>
            <th></th>
          </tr>
        </tfoot>
      </table>

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

export default AllPrivacy;