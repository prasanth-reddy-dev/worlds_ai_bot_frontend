import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import APIService from "../../services/api";

function AdminDashboardHome() {
    const { user } = useSelector((state) => state.user);
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalCourses: 0,
        totalBootcamps: 0,
        totalJobs: 0,
        totalEarnings: 0,
        totalRegisters: 0,
    });
    const [loading, setLoading] = useState(true);
    const [greeting, setGreeting] = useState("");

    useEffect(() => {
        const hour = new Date().getHours();
        if (hour >= 5 && hour < 12) {
            setGreeting("Good Morning");
        } else if (hour >= 12 && hour < 18) {
            setGreeting("Good Afternoon");
        } else if (hour >= 18 && hour < 22) {
            setGreeting("Good Evening");
        } else {
            setGreeting("Good Night");
        }

        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            setLoading(true);
            // Fetch stats from API
            const [usersRes, coursesRes, bootcampsRes, jobsRes, registersRes] = await Promise.all([
                APIService.users.getAll().catch(() => ({ data: [] })),
                APIService.courses.getAll().catch(() => ({ data: [] })),
                APIService.bootcamps.getAll().catch(() => ({ data: [] })),
                APIService.jobs.getAll().catch(() => ({ data: [] })),
                APIService.registers.getAll().catch(() => ({ data: [] })),
            ]);

            // Extract data properly (APIs return {data, message} or {data: {data}})
            const users = usersRes?.data?.data || usersRes?.data || [];

            // Calculate total earnings from all paid courses across all users
            let totalEarnings = 0;
            if (Array.isArray(users)) {
                users.forEach(user => {
                    const userCourses = user.courses || [];
                    userCourses.forEach(course => {
                        // Only count paid courses (status = true)
                        if (course.status && course.amount) {
                            totalEarnings += parseFloat(course.amount) || 0;
                        }
                    });
                });
            }


            const courses = coursesRes?.data?.data || coursesRes?.data || [];
            const bootcamps = bootcampsRes?.data?.data || bootcampsRes?.data || [];
            const jobs = jobsRes?.data?.data || jobsRes?.data || [];
            const registers = registersRes?.data?.data || registersRes?.data || [];

            setStats({
                totalUsers: Array.isArray(users) ? users.length : 0,
                totalCourses: Array.isArray(courses) ? courses.length : 0,
                totalBootcamps: Array.isArray(bootcamps) ? bootcamps.length : 0,
                totalJobs: Array.isArray(jobs) ? jobs.length : 0,
                totalEarnings: totalEarnings,
                totalRegisters: Array.isArray(registers) ? registers.length : 0,
            });
        } catch (error) {
        } finally {
            setLoading(false);
        }
    };

    const quickLinks = [
        { to: "/admin-dashboard/profile/all-users", icon: "bi-people-fill", label: "All Users", color: "from-blue-500 to-cyan-500" },
        { to: "/admin-dashboard/profile/create-course", icon: "bi-plus-circle-fill", label: "Create Course", color: "from-purple-500 to-pink-500" },
        { to: "/admin-dashboard/profile/all-courses", icon: "bi-journal-code", label: "All Courses", color: "from-green-500 to-emerald-500" },
        { to: "/admin-dashboard/profile/create-bootcamp", icon: "bi-code-square", label: "Create Bootcamp", color: "from-orange-500 to-red-500" },
        { to: "/admin-dashboard/profile/all-bootcamps", icon: "bi-laptop-fill", label: "All Bootcamps", color: "from-indigo-500 to-blue-500" },
        { to: "/admin-dashboard/profile/create-job", icon: "bi-briefcase-fill", label: "Create Job", color: "from-teal-500 to-cyan-500" },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 overflow-y-auto">
            {/* Welcome Section */}
            <div className="mb-8">
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
                    {greeting}, {user?.name || "Admin"}! 👋
                </h1>
                <p className="text-slate-400 text-lg">Welcome to your admin dashboard. Here's an overview of your platform.</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {/* Total Users */}
                <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 backdrop-blur-sm rounded-xl border border-blue-500/20 p-6 hover:scale-105 transition-all duration-300">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-blue-400 text-sm font-medium mb-1">Total Users</p>
                            <h3 className="text-3xl font-bold text-white">
                                {loading ? "..." : stats.totalUsers}
                            </h3>
                        </div>
                        <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                            <i className="bi bi-people-fill text-2xl text-white"></i>
                        </div>
                    </div>
                </div>

                {/* Total Courses */}
                <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 backdrop-blur-sm rounded-xl border border-purple-500/20 p-6 hover:scale-105 transition-all duration-300">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-purple-400 text-sm font-medium mb-1">Total Courses</p>
                            <h3 className="text-3xl font-bold text-white">
                                {loading ? "..." : stats.totalCourses}
                            </h3>
                        </div>
                        <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                            <i className="bi bi-journal-code text-2xl text-white"></i>
                        </div>
                    </div>
                </div>

                {/* Total Bootcamps */}
                <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 backdrop-blur-sm rounded-xl border border-green-500/20 p-6 hover:scale-105 transition-all duration-300">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-green-400 text-sm font-medium mb-1">Total Bootcamps</p>
                            <h3 className="text-3xl font-bold text-white">
                                {loading ? "..." : stats.totalBootcamps}
                            </h3>
                        </div>
                        <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                            <i className="bi bi-laptop-fill text-2xl text-white"></i>
                        </div>
                    </div>
                </div>

                {/* Total Jobs */}
                <div className="bg-gradient-to-br from-orange-500/10 to-red-500/10 backdrop-blur-sm rounded-xl border border-orange-500/20 p-6 hover:scale-105 transition-all duration-300">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-orange-400 text-sm font-medium mb-1">Total Jobs</p>
                            <h3 className="text-3xl font-bold text-white">
                                {loading ? "..." : stats.totalJobs}
                            </h3>
                        </div>
                        <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                            <i className="bi bi-briefcase-fill text-2xl text-white"></i>
                        </div>
                    </div>
                </div>

                {/* Total Earnings */}
                <div className="bg-gradient-to-br from-yellow-500/10 to-amber-500/10 backdrop-blur-sm rounded-xl border border-yellow-500/20 p-6 hover:scale-105 transition-all duration-300">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-yellow-400 text-sm font-medium mb-1">Total Earnings</p>
                            <h3 className="text-3xl font-bold text-white">
                                {loading ? "..." : `₹${stats.totalEarnings.toLocaleString()}`}
                            </h3>
                            <p className="text-xs text-slate-400 mt-1">From student payments</p>
                        </div>
                        <div className="w-14 h-14 bg-gradient-to-br from-yellow-500 to-amber-500 rounded-full flex items-center justify-center">
                            <i className="bi bi-currency-rupee text-2xl text-white"></i>
                        </div>
                    </div>
                </div>

                {/* Total Registers */}
                <div className="bg-gradient-to-br from-indigo-500/10 to-violet-500/10 backdrop-blur-sm rounded-xl border border-indigo-500/20 p-6 hover:scale-105 transition-all duration-300">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-indigo-400 text-sm font-medium mb-1">Total Registers</p>
                            <h3 className="text-3xl font-bold text-white">
                                {loading ? "..." : stats.totalRegisters}
                            </h3>
                            <p className="text-xs text-slate-400 mt-1">Bootcamp registrations</p>
                        </div>
                        <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-violet-500 rounded-full flex items-center justify-center">
                            <i className="bi bi-person-check-fill text-2xl text-white"></i>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Links Section */}
            <div className="mb-8">
                <h2 className="text-2xl font-bold text-white mb-4">Quick Links</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {quickLinks.map((link, index) => (
                        <Link
                            key={index}
                            to={link.to}
                            className="group bg-slate-800/30 backdrop-blur-sm rounded-xl border border-slate-700/50 p-6 hover:border-slate-600 transition-all duration-300 hover:scale-105"
                        >
                            <div className="flex items-center gap-4">
                                <div className={`w-12 h-12 bg-gradient-to-br ${link.color} rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform`}>
                                    <i className={`bi ${link.icon} text-xl text-white`}></i>
                                </div>
                                <div>
                                    <h3 className="text-white font-semibold group-hover:text-blue-400 transition-colors">
                                        {link.label}
                                    </h3>
                                    <p className="text-slate-400 text-sm">Quick access</p>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>

            {/* Recent Activity Section (Optional - can be added later) */}
            <div>
                <h2 className="text-2xl font-bold text-white mb-4">Platform Overview</h2>
                <div className="bg-slate-800/30 backdrop-blur-sm rounded-xl border border-slate-700/50 p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <h3 className="text-lg font-semibold text-white mb-3">Content Management</h3>
                            <div className="space-y-2">
                                <Link to="/admin-dashboard/profile/create-data" className="block text-slate-400 hover:text-blue-400 transition-colors">
                                    <i className="bi bi-database-fill-add mr-2"></i> Create New Data
                                </Link>
                                <Link to="/admin-dashboard/profile/all-create-data" className="block text-slate-400 hover:text-blue-400 transition-colors">
                                    <i className="bi bi-database-fill mr-2"></i> View All Data
                                </Link>
                                <Link to="/admin-dashboard/profile/all-recordings" className="block text-slate-400 hover:text-blue-400 transition-colors">
                                    <i className="bi bi-mic-fill mr-2"></i> Manage Recordings
                                </Link>
                            </div>
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-white mb-3">User Management</h3>
                            <div className="space-y-2">
                                <Link to="/admin-dashboard/profile/all-users" className="block text-slate-400 hover:text-blue-400 transition-colors">
                                    <i className="bi bi-people-fill mr-2"></i> View All Users
                                </Link>
                                <Link to="/admin-dashboard/profile/all-registers" className="block text-slate-400 hover:text-blue-400 transition-colors">
                                    <i className="bi bi-person-check-fill mr-2"></i> Registration Requests
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AdminDashboardHome;
