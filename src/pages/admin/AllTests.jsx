import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import APIService from "../../services/api";

function Row(props) {
  const { data, number, onRefresh } = props;

  async function handleDelete() {
    try {
      if (window.confirm("Are you sure you want to delete this test?")) {
        const response = await APIService.tests.delete(data._id);
        if (response.status === 200) {
          alert("Test deleted successfully!");
          onRefresh(); // Refresh the list
        } else {
          alert("Failed to delete the test.");
        }
      }
    } catch (error) {
      alert("An error occurred while deleting the test.");
    }
  }

  return (
    <tr>
      <th>{number}</th>
      <td>{data.question}</td>
      <td>
        {data.test.map((item, index) => (
          <div key={index}>
            Input: {item.input}, Output: {item.output}
          </div>
        ))}
      </td>
      <td className="text-success cursor-pointer">
        <Link to={`/admin-dashboard/profile/update-test/${data._id}`}>
          update
        </Link>
      </td>
      <td className="text-error cursor-pointer" onClick={handleDelete}>
        delete
      </td>
    </tr>
  );
}

function AllTests() {
  const [testData, setTestData] = useState([]);

  async function fetchTests() {
    try {
      const response = await APIService.tests.getAll();
      const tests = response?.data?.data || response?.data || [];
      setTestData(Array.isArray(tests) ? tests : []);
    } catch (err) {
      setTestData([]);
    }
  }

  useEffect(() => {
    fetchTests();
  }, []);

  return (
    <div className="h-full w-full  overflow-x-scroll overflow-y-scroll">
      <table className="table table-xs table-pin-rows table-pin-cols">
        <thead>
          <tr>
            <th>#</th>
            <td>Question</td>
            <td>Test Cases</td>
            <td>Update</td>
            <td>Delete</td>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {testData.length > 0 ? (
            testData.map((item, index) => (
              <Row key={item._id || index} data={item} number={index + 1} onRefresh={fetchTests} />
            ))
          ) : (
            <tr>
              <td colSpan="5" className="text-center">
                No tests found.
              </td>
            </tr>
          )}
        </tbody>
        <tfoot>
          <tr>
            <th></th>
            <td>Question</td>
            <td>Test Cases</td>
            <td>Update</td>
            <td>Delete</td>
            <th></th>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

export default AllTests;