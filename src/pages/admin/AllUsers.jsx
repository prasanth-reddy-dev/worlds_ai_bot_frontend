import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Link } from "react-router-dom";
import APIService from "../../services/api";
import Loading from "../../components/Loading";

const UserRow = React.memo(({ number, data, onDelete }) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = useCallback(async () => {
    if (!window.confirm(`Delete ${data.name}?`)) return;

    setIsDeleting(true);
    try {
      await APIService.profile.delete(data._id);
      onDelete(data._id, `${data.name} deleted successfully!`);
    } catch {
      setIsDeleting(false);
      onDelete(null, "Failed to delete user", "error");
    }
  }, [data._id, data.name, onDelete]);

  const isPaid = useMemo(() => data.courses?.length > 0, [data.courses]);

  return (
    <tr className="border-b border-slate-700/50 hover:bg-slate-800/30 transition-colors">
      <td className="px-4 py-4">
        <span className="text-slate-400 font-mono text-sm">{number}</span>
      </td>
      <td className="px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center font-bold text-sm">
            {data.name[0].toUpperCase()}
          </div>
          <div>
            <p className="font-medium text-white">{data.name}</p>
            <p className="text-xs text-slate-400">{data.email}</p>
          </div>
        </div>
      </td>
      <td className="px-4 py-4">
        <span className="text-slate-300 text-sm">{data.number}</span>
      </td>
      <td className="px-4 py-4">
        <span className="text-slate-400 text-sm">{data.batchNumber || "-"}</span>
      </td>
      <td className="px-4 py-4">
        <span
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${isPaid
              ? "bg-green-500/10 text-green-400 border border-green-500/20"
              : "bg-red-500/10 text-red-400 border border-red-500/20"
            }`}
        >
          <i className={`bi ${isPaid ? "bi-check-circle-fill" : "bi-x-circle-fill"}`}></i>
          {isPaid ? "Paid" : "Not Paid"}
        </span>
      </td>
      <td className="px-4 py-4">
        <div className="flex gap-2">
          {["update-pc", "update-ic", "update-cc", "update-invoice"].map((path) => (
            <Link
              key={path}
              to={`/admin-dashboard/profile/${path}/${data._id}`}
              className="px-3 py-1.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 rounded-lg text-xs font-medium transition-all hover:scale-105"
            >
              {path.split("-")[1].toUpperCase()}
            </Link>
          ))}
          <Link
            to={`/admin-dashboard/profile/update-user/${data._id}`}
            className="px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20 rounded-lg text-xs font-medium transition-all hover:scale-105"
          >
            <i className="bi bi-pencil-fill"></i>
          </Link>
        </div>
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

UserRow.displayName = "UserRow";

function AllUsers() {
  const [userData, setUserData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchEmail, setSearchEmail] = useState("");
  const [paidFilter, setPaidFilter] = useState("All");
  const [alert, setAlert] = useState(null);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await APIService.profile.getAll();
      const users = response.data?.data || response.data || [];
      setUserData(Array.isArray(users) ? users : []);
    } catch {
      setAlert({ message: "Failed to fetch users", type: "error" });
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

  const filteredUsers = useMemo(() => {
    return userData.filter((user) => {
      const matchesEmail = user.email.toLowerCase().includes(searchEmail.toLowerCase());
      const isPaid = user.courses?.length > 0;
      const matchesPaid =
        paidFilter === "All" ||
        (paidFilter === "Paid" && isPaid) ||
        (paidFilter === "Not Paid" && !isPaid);
      return matchesEmail && matchesPaid;
    });
  }, [userData, searchEmail, paidFilter]);

  if (loading) {
    return <Loading message="Loading users..." />;
  }

  return (
    <div className="h-full w-full overflow-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white mb-2">Users Management</h1>
        <p className="text-slate-400">Manage and view all registered users</p>
      </div>

      {/* Filters */}
      <div className="mb-6 bg-slate-800/30 backdrop-blur-sm rounded-xl border border-slate-700/50 p-6">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <i className="bi bi-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
            <input
              type="text"
              placeholder="Search by email..."
              value={searchEmail}
              onChange={(e) => setSearchEmail(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-slate-900/50 border border-slate-700/50 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all"
            />
          </div>

          {/* Filter Buttons */}
          <div className="flex gap-2 bg-slate-900/50 p-1.5 rounded-lg border border-slate-700/50">
            {["All", "Paid", "Not Paid"].map((filter) => (
              <button
                key={filter}
                onClick={() => setPaidFilter(filter)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${paidFilter === filter
                    ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                    : "text-slate-400 hover:text-white hover:bg-slate-800/50"
                  }`}
              >
                {filter}
              </button>
            ))}
          </div>

          {/* Count */}
          <div className="px-4 py-2 bg-slate-900/50 rounded-lg border border-slate-700/50">
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
                <th className="px-4 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">User</th>
                <th className="px-4 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Phone</th>
                <th className="px-4 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Batch</th>
                <th className="px-4 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</th>
                <th className="px-4 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Actions</th>
                <th className="px-4 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Delete</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user, index) => (
                  <UserRow
                    key={user._id}
                    number={index + 1}
                    data={user}
                    onDelete={handleDeleteSuccess}
                  />
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="px-4 py-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-16 h-16 bg-slate-700/30 rounded-full flex items-center justify-center">
                        <i className="bi bi-people text-3xl text-slate-500"></i>
                      </div>
                      <p className="text-slate-400">No users found</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Alert Toast */}
      {alert && (
        <div className="fixed bottom-6 right-6 z-50 animate-slide-up">
          <div
            className={`${alert.type === "success"
                ? "bg-gradient-to-r from-green-600 to-emerald-600"
                : "bg-gradient-to-r from-red-600 to-rose-600"
              } text-white px-6 py-4 rounded-xl shadow-2xl min-w-[320px]`}
          >
            <div className="flex items-center gap-3">
              <i
                className={`${alert.type === "success" ? "bi bi-check-circle-fill" : "bi bi-exclamation-circle-fill"
                  } text-2xl`}
              ></i>
              <p className="font-medium">{alert.message}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AllUsers;