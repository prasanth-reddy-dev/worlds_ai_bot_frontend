
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import APIService from "../../services/api";

function Row(props) {
  const { showAlert, data, number, onRefresh } = props;

  async function handleDelete() {
    if (!window.confirm('Are you sure you want to delete this company logo?')) return;

    try {
      const response = await APIService.companies.delete(data._id);
      if (response.status === 200) {
        showAlert("Company deleted successfully!", "success");
        onRefresh(); // Refresh the list
      } else {
        showAlert("Failed to delete the company.", "error");
      }
    } catch (error) {
      showAlert("An error occurred while deleting the company.", "error");
    }
  }

  return (
    <tr>
      <th>{number}</th>
      <td>{data.companyName}</td>
      <td>
        <img src={data.logoUrl || data.logo} alt={data.companyName} className="w-16 h-16 object-contain" />
      </td>
      <td className="text-success cursor-pointer">
        <Link to={`/admin-dashboard/profile/update-company/${data._id}`}>update</Link>
      </td>
      <td className="text-error cursor-pointer" onClick={handleDelete}>
        delete
      </td>
    </tr>
  );
}

function AllCompanyLogos() {
  const [companyData, setCompanyData] = useState([]);
  const [alert, setAlert] = useState(null); // State for managing alerts
  const [progress, setProgress] = useState(100); // Progress bar state

  // Function to show alerts
  const showAlert = (message, type) => {
    setAlert({ message, type });
    setProgress(100); // Reset progress when new alert is shown
  };

  // Handle alert dismissal
  const dismissAlert = () => {
    setAlert(null);
    setProgress(100);
  };

  // Progress bar and auto-dismiss logic
  useEffect(() => {
    if (alert) {
      const duration = 3000; // 3 seconds
      const interval = 50; // Update every 50ms
      const decrement = (interval / duration) * 100; // Progress reduction per interval

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

  async function fetchCompanies() {
    try {
      const response = await APIService.companies.getAll();
      // Extract data from nested structure
      const companies = response?.data?.data || response?.data || [];
      setCompanyData(Array.isArray(companies) ? companies : []);
    } catch (err) {
      setCompanyData([]);
      showAlert("Error fetching companies. Please try again.", "error");
    }
  }

  useEffect(() => {
    fetchCompanies();
  }, []);

  return (
    <div className="h-full w-full overflow-x-scroll overflow-y-scroll pb-[82px] sm:pb-[0px]">
      <table className="table table-xs table-pin-rows table-pin-cols">
        <thead>
          <tr>
            <th></th>
            <td>Company Name</td>
            <td>Logo</td>
            <td>Update</td>
            <td>Delete</td>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {companyData.length > 0 ? (
            companyData.map((x, index) => (
              <Row key={x._id || index} number={index + 1} data={x} showAlert={showAlert} onRefresh={fetchCompanies} />
            ))
          ) : (
            <tr>
              <td colSpan="5" className="text-center">
                No logos found.
              </td>
            </tr>
          )}
        </tbody>
        <tfoot>
          <tr>
            <th></th>
            <td>Company Name</td>
            <td>Logo</td>
            <td>Update</td>
            <td>Delete</td>
            <th></th>
          </tr>
        </tfoot>
      </table>

      {/* Alert Component */}
      {alert && (
        <div
          className={`fixed bottom-4 right-4 px-4 py-3 rounded-lg text-white shadow-lg transition-all duration-300 ${alert.type === "success" ? "bg-green-600" : "bg-red-600"
            } flex flex-col w-80 z-[50]`}
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

export default AllCompanyLogos;