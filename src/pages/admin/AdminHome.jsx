import React, { useState, useEffect } from 'react';
import APIService from '../../services/api';

function AdminHome() {
    const [stats, setStats] = useState({
        users: 0,
        courses: 0,
        bootcamps: 0,
        roadmaps: 0,
        loading: true
    });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const [users, courses, bootcamps, roadmaps] = await Promise.all([
                    APIService.profile.getAll().catch(() => ({ data: { data: [] } })),
                    APIService.courses.getAll().catch(() => ({ data: { data: [] } })),
                    APIService.bootcamps.getAll().catch(() => ({ data: { data: [] } })),
                    APIService.roadmaps.getAll().catch(() => ({ data: { data: [] } }))
                ]);

                setStats({
                    users: (users.data?.data || users.data || []).length,
                    courses: (courses.data?.data || courses.data || []).length,
                    bootcamps: (bootcamps.data?.data || bootcamps.data || []).length,
                    roadmaps: (roadmaps.data?.data || roadmaps.data || []).length,
                    loading: false
                });
            } catch {
                setStats(prev => ({ ...prev, loading: false }));
            }
        };
        fetchStats();
    }, []);

    const statCards = [
        { label: 'Total Users', value: stats.users, icon: 'bi-people-fill', gradient: 'from-blue-600 to-cyan-600' },
        { label: 'Total Courses', value: stats.courses, icon: 'bi-book-fill', gradient: 'from-purple-600 to-pink-600' },
        { label: 'Bootcamps', value: stats.bootcamps, icon: 'bi-laptop-fill', gradient: 'from-green-600 to-emerald-600' },
        { label: 'Roadmaps', value: stats.roadmaps, icon: 'bi-map-fill', gradient: 'from-orange-600 to-red-600' }
    ];

    return (
        <div className="h-full w-full overflow-auto p-6">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-4xl font-bold text-white mb-2">Admin Dashboard</h1>
                <p className="text-slate-400">Welcome back! Here's what's happening today.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {statCards.map((card, idx) => (
                    <div
                        key={idx}
                        className="bg-slate-800/30 backdrop-blur-sm rounded-xl border border-slate-700/50 p-6 hover:scale-105 transition-transform"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className={`w-12 h-12 bg-gradient-to-br ${card.gradient} rounded-lg flex items-center justify-center`}>
                                <i className={`bi ${card.icon} text-2xl text-white`}></i>
                            </div>
                        </div>
                        <h3 className="text-slate-400 text-sm font-medium mb-1">{card.label}</h3>
                        <p className="text-3xl font-bold text-white">
                            {stats.loading ? '...' : card.value}
                        </p>
                    </div>
                ))}
            </div>

            {/* Quick Actions */}
            <div className="bg-slate-800/30 backdrop-blur-sm rounded-xl border border-slate-700/50 p-6">
                <h2 className="text-xl font-bold text-white mb-4">Quick Actions</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[
                        { label: 'Create Course', icon: 'bi-plus-square-fill', link: '/admin-dashboard/profile/create-course', color: 'blue' },
                        { label: 'Create Bootcamp', icon: 'bi-code-square', link: '/admin-dashboard/profile/create-bootcamp', color: 'purple' },
                        { label: 'Create Roadmap', icon: 'bi-signpost-split-fill', link: '/admin-dashboard/profile/create-road-map', color: 'green' },
                        { label: 'All Users', icon: 'bi-people-fill', link: '/admin-dashboard/profile/all-users', color: 'cyan' },
                        { label: 'All Registers', icon: 'bi-person-check-fill', link: '/admin-dashboard/profile/all-registers', color: 'pink' },
                        { label: 'Create Interview', icon: 'bi-chat-dots-fill', link: '/admin-dashboard/profile/create-interview', color: 'orange' }
                    ].map((action, idx) => (
                        <a
                            key={idx}
                            href={action.link}
                            className={`flex items-center gap-3 p-4 bg-${action.color}-500/10 hover:bg-${action.color}-500/20 border border-${action.color}-500/20 rounded-lg transition-all group`}
                        >
                            <i className={`bi ${action.icon} text-2xl text-${action.color}-400`}></i>
                            <span className="text-white font-medium">{action.label}</span>
                            <i className="bi bi-arrow-right ml-auto text-slate-400 group-hover:translate-x-1 transition-transform"></i>
                        </a>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default AdminHome;
