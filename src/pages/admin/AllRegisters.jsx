import React, { useState, useEffect, useCallback, useMemo } from "react";
import APIService from "../../services/api";

const RegisterRow = React.memo(({ number, data, onDelete }) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = useCallback(async () => {
    if (!window.confirm(`Delete ${data.name}?`)) return;

    setIsDeleting(true);
    try {
      const response = await APIService.registers.delete(data._id);
      if (response.status === 200) {
        onDelete(data._id, `${data.name} deleted successfully!`);
      }
    } catch {
      setIsDeleting(false);
      onDelete(null, "Failed to delete registration", "error");
    }
  }, [data._id, data.name, onDelete]);

  return (
    <tr className="border-b border-slate-700/50 hover:bg-slate-800/30 transition-colors">
      <td className="px-4 py-4">
        <span className="text-slate-400 font-mono text-sm">{number}</span>
      </td>
      <td className="px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center font-bold text-sm">
            {data.name[0].toUpperCase()}
          </div>
          <span className="text-white font-medium">{data.name}</span>
        </div>
      </td>
      <td className="px-4 py-4">
        <span className="text-slate-300 text-sm">{data.email}</span>
      </td>
      <td className="px-4 py-4">
        <span className="text-slate-400 text-sm">{data.mobile}</span>
      </td>
      <td className="px-4 py-4">
        <span className="text-slate-400 text-sm">{data.country || "-"}</span>
      </td>
      <td className="px-4 py-4">
        <span className="text-slate-400 text-sm">{data.state || "-"}</span>
      </td>
      <td className="px-4 py-4">
        <span className="px-3 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-full text-xs font-medium">
          {data.course}
        </span>
      </td>
      <td className="px-4 py-4">
        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-lg text-xs font-medium transition-all hover:scale-105 disabled:opacity-50"
        >
          {isDeleting ? (
            <i className="bi bi-arrow-repeat animate-spin"></i>
          ) : (
            <i className="bi bi-trash-fill"></i>
          )}
        </button>
      </td>
    </tr>
  );
});

RegisterRow.displayName = "RegisterRow";

function AllRegisters() {
  const [userData, setUserData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);
  const [progress, setProgress] = useState(100);
  const [searchQuery, setSearchQuery] = useState("");

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

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await APIService.registers.getAll();
      const data = response?.data?.data || response?.data || [];
      setUserData(Array.isArray(data) ? data : []);
    } catch (err) {
      showAlert("Failed to fetch registrations.", "error");
      setUserData([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleDeleteSuccess = useCallback((deletedId, message, type = "success") => {
    if (deletedId) {
      setUserData((prev) => prev.filter((user) => user._id !== deletedId));
    }
    setAlert({ message, type });
    setTimeout(() => setAlert(null), 3000);
  }, []);

  const filteredUsers = useMemo(() =>
    userData.filter((user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
    ),
    [userData, searchQuery]
  );

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-white text-xl">Loading registrations...</div>
      </div>
    );
  }

  return (
    <div className="h-full w-full overflow-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white mb-2">Course Registrations</h1>
        <p className="text-slate-400">View all course registration requests</p>
      </div>

      {/* Search */}
      <div className="mb-6 bg-slate-800/30 backdrop-blur-sm rounded-xl border border-slate-700/50 p-6">
        <div className="flex items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <i className="bi bi-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-slate-900/50 border border-slate-700/50 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
          <div className="px-4 py-2 bg-slate-900/50 rounded-lg border border-slate-700/50 ml-4">
            <span className="text-sm text-slate-400">
              Total: <span className="font-bold text-white">{filteredUsers.length}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-slate-800/30 backdrop-blur-sm rounded-xl border border-slate-700/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-900/50 border-b border-slate-700/50">
                <th className="px-4 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">#</th>
                <th className="px-4 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Name</th>
                <th className="px-4 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Email</th>
                <th className="px-4 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Mobile</th>
                <th className="px-4 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Country</th>
                <th className="px-4 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">State</th>
                <th className="px-4 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Course</th>
                <th className="px-4 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Delete</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user, index) => (
                  <RegisterRow
                    key={user._id}
                    number={index + 1}
                    data={user}
                    onDelete={handleDeleteSuccess}
                  />
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="px-4 py-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-16 h-16 bg-slate-700/30 rounded-full flex items-center justify-center">
                        <i className="bi bi-inbox text-3xl text-slate-500"></i>
                      </div>
                      <p className="text-slate-400">No registrations found</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {alert && (
        <div className="fixed bottom-6 right-6 z-50">
          <div className={`${alert.type === "success" ? "bg-gradient-to-r from-green-600 to-emerald-600" : "bg-gradient-to-r from-red-600 to-rose-600"} text-white px-6 py-4 rounded-xl shadow-2xl min-w-[320px]`}>
            <div className="flex items-center gap-3">
              <i className={`${alert.type === "success" ? "bi bi-check-circle-fill" : "bi bi-exclamation-circle-fill"} text-2xl`}></i>
              <div className="flex-1">
                <p className="font-medium">{alert.message}</p>
                <div className="mt-2 h-1 bg-white/30 rounded-full overflow-hidden">
                  <div className="h-full bg-white transition-all duration-75 ease-linear" style={{ width: `${progress}%` }}></div>
                </div>
              </div>
              <button onClick={dismissAlert} className="text-white/80 hover:text-white">
                <i className="bi bi-x-lg"></i>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AllRegisters;