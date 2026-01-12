import React, { useState, useEffect } from 'react';
import APIService from '../../services/api';

const AllFeedbacks = () => {
    const [feedbacks, setFeedbacks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchFeedbacks();
    }, []);

    const fetchFeedbacks = async () => {
        try {
            setLoading(true);
            const response = await APIService.feedbacks.getAll();
            const data = response.data?.data || response.data || [];
            setFeedbacks(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('Error fetching feedbacks:', err);
            setError('Failed to load feedbacks');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this feedback?')) return;

        try {
            await APIService.feedbacks.delete(id);
            setFeedbacks(feedbacks.filter(f => f._id !== id));
        } catch (err) {
            console.error('Error deleting feedback:', err);
            alert('Failed to delete feedback');
        }
    };

    const handleStatusChange = async (id, newStatus) => {
        try {
            await APIService.feedbacks.updateStatus(id, newStatus);
            setFeedbacks(feedbacks.map(f =>
                f._id === id ? { ...f, status: newStatus } : f
            ));
        } catch (err) {
            console.error('Error updating status:', err);
            alert('Failed to update status');
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'resolved': return 'bg-green-500/20 text-green-400 border-green-500/30';
            case 'reviewed': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
            default: return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
        }
    };

    const formatDate = (date) => {
        if (!date) return 'N/A';
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                        User Feedbacks
                    </h1>
                    <p className="text-gray-400 mt-2">
                        Messages received from the contact form
                    </p>
                </div>

                {error && (
                    <div className="mb-6 p-4 rounded-xl bg-red-500/20 border border-red-500/30 text-red-400">
                        {error}
                    </div>
                )}

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <div className="p-6 rounded-2xl bg-slate-800/50 border border-slate-700/50">
                        <div className="text-3xl font-bold text-blue-400">{feedbacks.length}</div>
                        <div className="text-gray-400">Total Feedbacks</div>
                    </div>
                    <div className="p-6 rounded-2xl bg-slate-800/50 border border-slate-700/50">
                        <div className="text-3xl font-bold text-amber-400">
                            {feedbacks.filter(f => f.status === 'pending').length}
                        </div>
                        <div className="text-gray-400">Pending</div>
                    </div>
                    <div className="p-6 rounded-2xl bg-slate-800/50 border border-slate-700/50">
                        <div className="text-3xl font-bold text-green-400">
                            {feedbacks.filter(f => f.status === 'resolved').length}
                        </div>
                        <div className="text-gray-400">Resolved</div>
                    </div>
                </div>

                {/* Feedbacks List */}
                {feedbacks.length === 0 ? (
                    <div className="text-center py-20 bg-slate-800/30 rounded-2xl border border-slate-700/50">
                        <svg className="w-16 h-16 mx-auto text-gray-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
                        </svg>
                        <h3 className="text-xl font-bold text-white mb-2">No feedbacks yet</h3>
                        <p className="text-gray-400">Messages from the contact form will appear here</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {feedbacks.map((feedback) => (
                            <div
                                key={feedback._id}
                                className="p-6 rounded-2xl bg-slate-800/50 border border-slate-700/50 hover:border-slate-600/50 transition-all"
                            >
                                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                                    <div className="flex-1">
                                        {/* User Info */}
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                                                {feedback.name?.charAt(0)?.toUpperCase() || 'U'}
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-white">{feedback.name}</h3>
                                                <p className="text-sm text-gray-400">{feedback.email}</p>
                                            </div>
                                        </div>

                                        {/* Contact Info */}
                                        {feedback.mobile && (
                                            <p className="text-sm text-gray-400 mb-3">
                                                📱 {feedback.mobile}
                                            </p>
                                        )}

                                        {/* Message */}
                                        <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-700/30">
                                            <p className="text-gray-300 whitespace-pre-wrap">{feedback.message}</p>
                                        </div>

                                        {/* Date */}
                                        <p className="text-xs text-gray-500 mt-3">
                                            Received: {formatDate(feedback.createdAt)}
                                        </p>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex flex-col gap-2 min-w-[150px]">
                                        <select
                                            value={feedback.status || 'pending'}
                                            onChange={(e) => handleStatusChange(feedback._id, e.target.value)}
                                            className={`px-4 py-2 rounded-xl border text-sm font-medium cursor-pointer ${getStatusColor(feedback.status)}`}
                                        >
                                            <option value="pending">⏳ Pending</option>
                                            <option value="reviewed">👀 Reviewed</option>
                                            <option value="resolved">✅ Resolved</option>
                                        </select>

                                        <button
                                            onClick={() => handleDelete(feedback._id)}
                                            className="px-4 py-2 rounded-xl bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 transition text-sm font-medium"
                                        >
                                            🗑️ Delete
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AllFeedbacks;
