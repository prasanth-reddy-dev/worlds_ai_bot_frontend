import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import APIService from "../../services/api";

function Row(props) {
  const { number, data, showAlert, onRefresh } = props;

  async function handleDelete() {
    if (!window.confirm('Are you sure you want to delete this contact?')) return;

    try {
      const response = await APIService.contacts.delete(data._id);
      if (response.status === 200) {
        showAlert("Contact deleted successfully!", "success");
        onRefresh(); // Refresh the list
      } else {
        showAlert("Failed to delete the contact.", "error");
      }
    } catch (error) {
      showAlert("An error occurred while deleting the contact.", "error");
    }
  }

  return (
    <tr>
      <th>{number}</th>
      <td>{data.offer}</td>
      <td>{data.heading}</td>
      <td>{data.tag}</td>
      <td>
        <a href={data.insta} target="_blank" className="text-blue-500">
          {data.insta}
        </a>
      </td>
      <td>
        <a href={data.linkedin} target="_blank" className="text-blue-500">
          {data.linkedin}
        </a>
      </td>
      <td>
        <a href={data.youtube} target="_blank" className="text-blue-500">
          {data.youtube}
        </a>
      </td>
      <td>{data.channel}</td>
      <td>
        <a href={data.maps} target="_blank" className="text-blue-500">
          {data.maps}
        </a>
      </td>
      <td>
        <a href={data.group} target="_blank" className="text-blue-500">
          {data.group}
        </a>
      </td>
      <td>{data.email}</td>
      <td>{data.number}</td>
      <td>{data.address}</td>
      <td>
        <img
          src={data.logo}
          alt="Contact Logo"
          className="w-16 h-16 object-contain"
        />
      </td>
      <td className="text-success cursor-pointer">
        <Link to={`/admin-dashboard/profile/update-create-data/${data._id}`}>
          update
        </Link>
      </td>
      <td className="text-error cursor-pointer" onClick={handleDelete}>
        delete
      </td>
    </tr>
  );
}

function AllData() {
  const [contactData, setContactData] = useState([]);
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

  async function fetchContacts() {
    try {
      const response = await APIService.contacts.getAll();
      // Extract data from nested structure
      const contacts = response?.data?.data || response?.data || [];
      setContactData(Array.isArray(contacts) ? contacts : []);
    } catch (err) {
      setContactData([]);
      showAlert("Error fetching contacts. Please try again.", "error");
    }
  }

  useEffect(() => {
    fetchContacts();
  }, []);

  return (
    <div className="h-full w-full overflow-x-scroll overflow-y-scroll">
      <table className="table table-xs table-pin-rows table-pin-cols">
        <thead>
          <tr>
            <th>#</th>
            <td>Offer</td>
            <td>Heading</td>
            <td>Tag</td>
            <td>Instagram</td>
            <td>LinkedIn</td>
            <td>YouTube</td>
            <td>Channel</td>
            <td>Maps</td>
            <td>Group</td>
            <td>Email</td>
            <td>Phone Number</td>
            <td>Address</td>
            <td>Logo</td>
            <td>Update</td>
            <td>Delete</td>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {contactData.length > 0 ? (
            contactData.map((x, index) => (
              <Row key={x._id || index} number={index + 1} data={x} showAlert={showAlert} onRefresh={fetchContacts} />
            ))
          ) : (
            <tr>
              <td colSpan="16" className="text-center">
                No contacts found.
              </td>
            </tr>
          )}
        </tbody>
        <tfoot>
          <tr>
            <th></th>
            <td>Offer</td>
            <td>Heading</td>
            <td>Tag</td>
            <td>Instagram</td>
            <td>LinkedIn</td>
            <td>YouTube</td>
            <td>Channel</td>
            <td>Maps</td>
            <td>Group</td>
            <td>Email</td>
            <td>Phone Number</td>
            <td>Address</td>
            <td>Logo</td>
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
          POSIX:644
        </div>
      )}
    </div>
  );
}

export default AllData;