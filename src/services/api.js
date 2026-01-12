import axios from 'axios';
import { BACKEND_URL } from '../../config/constant';

// Create axios instance with default config
const api = axios.create({
    baseURL: BACKEND_URL,
    timeout: 30000, // 30 second timeout
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor - Add auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor - Handle errors globally
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response) {
            // Server responded with error
            const { status } = error.response;

            switch (status) {
                case 401:
                    // Just clear token, don't redirect (let components handle it)
                    localStorage.removeItem('token');
                    break;
                case 403:
                case 404:
                case 500:
                default:
                    // Errors are handled in individual components
                    break;
            }
        }


        return Promise.reject(error);
    }
);

// API Service Methods
class APIService {
    // Auth endpoints
    static auth = {
        signup: (data) => api.post('/signup', data),
        signin: (data) => api.post('/signin', data),
        signout: () => api.post('/signout'),
        resetPasswordRequest: (email) => api.post('/reset-password-request', { email }),
        resetPassword: (data) => api.post('/reset-password', data),
    };

    // Profile endpoints
    static profile = {
        getMe: () => api.get('/profile'),
        updateMe: (data) => api.patch('/profile/edit', data),
        updateProfile: (data) => api.patch('/profile/edit', data), // Student profile update
        deleteAccount: () => api.delete('/profile/delete'), // Student account deletion
        getAll: () => api.get('/show-profiles'),
        getById: (id) => api.get(`/show-user/${id}`),
        update: (id, data) => api.put(`/update-user/${id}`, data),
        delete: (id) => api.delete(`/delete-profile/${id}`),
    };

    // Course endpoints
    static courses = {
        getAll: () => api.get('/show-courses'),
        getById: (id) => api.get(`/show-course/${id}`),
        create: (data) => api.post('/create-course', data),
        update: (id, data) => api.put(`/update-course/${id}`, data),  // Backend uses PUT
        delete: (id) => api.delete(`/delete-course/${id}`),
        validateCoupon: (courseId, coupon) => api.post(`/validate-coupon/${courseId}`, { coupon }),
    };

    // Bootcamp endpoints
    static bootcamps = {
        getAll: () => api.get('/all-bootcamps'),
        getById: (id) => api.get(`/show-bootcamp/${id}`),
        create: (data) => api.post('/create-bootcamp', data),
        update: (id, data) => api.put(`/update-bootcamp/${id}`, data),
        delete: (id) => api.delete(`/delete-bootcamp/${id}`),
    };

    // Roadmap endpoints
    static roadmaps = {
        getAll: () => api.get('/show-roadmaps'),
        getById: (id) => api.get(`/show-roadmap/${id}`),
        create: (data) => api.post('/create-roadmap', data),
        update: (id, data) => api.put(`/update-roadmap/${id}`, data),
        delete: (id) => api.delete(`/delete-roadmap/${id}`),
    };

    // Roadmap Topics endpoints
    static roadmapTopics = {
        getAll: () => api.get('/show-roadmap-topic'),
        create: (data) => api.post('/create-roadmap-topic', data),
        update: (id, data) => api.patch(`/update-roadmap-topic/${id}`, data),
        delete: (id) => api.delete(`/delete-roadmap-topic/${id}`),
    };

    // Recording endpoints
    static recordings = {
        getAll: () => api.get('/show-recordings'),
        getById: (id) => api.get(`/show-recordings/${id}`),
        create: (data) => api.post('/create-recordings', data),
        update: (id, data) => api.put(`/update-recordings/${id}`, data),
        delete: (id) => api.delete(`/delete-recordings/${id}`),
    };

    // Success Videos endpoints
    static videos = {
        getAll: () => api.get('/show-videos'),
        getById: (id) => api.get(`/show-video/${id}`),
        create: (data) => api.post('/create-video', data),
        update: (id, data) => api.put(`/update-video/${id}`, data),  // Backend uses PUT
        delete: (id) => api.delete(`/delete-video/${id}`),
    };

    // Company Logos endpoints
    static companies = {
        getAll: () => api.get('/show-companies'),
        getById: (id) => api.get(`/show-company/${id}`),
        create: (data) => api.post('/create-logo', data),
        update: (id, data) => api.put(`/update-company/${id}`, data),  // Backend uses PUT
        delete: (id) => api.delete(`/delete-company/${id}`),
    };

    // Contact endpoints
    static contacts = {
        getAll: () => api.get('/all-contacts'),
        getById: (id) => api.get(`/show-contact/${id}`),
        create: (data) => api.post('/create-contact', data),
        update: (id, data) => api.put(`/update-contact/${id}`, data),
        delete: (id) => api.delete(`/delete-contact/${id}`),
    };

    // Privacy endpoints
    static privacy = {
        getAll: () => api.get('/show-privacies'),
        create: (data) => api.post('/create-privacy', data),
        delete: (id) => api.delete(`/delete-privacy/${id}`),
    };

    // Register endpoints
    static registers = {
        getAll: () => api.get('/all-registers'),
        delete: (id) => api.delete(`/delete-register/${id}`),
    };

    // Feedback endpoints
    static feedbacks = {
        getAll: () => api.get('/all-feedbacks'),
        getById: (id) => api.get(`/show-feedback/${id}`),
        updateStatus: (id, status) => api.put(`/update-feedback/${id}`, { status }),
        delete: (id) => api.delete(`/delete-feedback/${id}`),
    };

    // Test endpoints
    static tests = {
        getAll: () => api.get('/all-tests'),
        getById: (id) => api.get(`/show-test/${id}`),
        create: (data) => api.post('/create-test', data),
        update: (id, data) => api.put(`/update-test/${id}`, data),
        delete: (id) => api.delete(`/delete-test/${id}`),
    };

    // Job endpoints
    static jobs = {
        getAll: () => api.get('/show-jobs'),  // Backend uses /show-jobs
        getById: (id) => api.get(`/show-job/${id}`),
        create: (data) => api.post('/create-job', data),
        update: (id, data) => api.put(`/update-job/${id}`, data),  // Changed to PUT
        delete: (id) => api.delete(`/delete-job/${id}`),
    };

    // Interview Questions endpoints
    static interviews = {
        getAll: () => api.get('/all-questions'),
        getById: (id) => api.get(`/show-questions/${id}`),  // Fixed: plural form
        create: (data) => api.post('/create-questions', data),
        update: (id, data) => api.put(`/update-questions/${id}`, data),
        delete: (id) => api.delete(`/delete-questions/${id}`),
    };

    // Privacy Policy endpoints
    static privacy = {
        getAll: () => api.get('/show-privacies'),
        getById: (id) => api.get(`/show-privacy/${id}`),
        create: (data) => api.post('/create-privacy', data),
        update: (id, data) => api.put(`/update-privacy/${id}`, data),
        delete: (id) => api.delete(`/delete-privacy/${id}`),
    };

    // Bootcamps endpoints
    static bootcamps = {
        getAll: () => api.get('/all-bootcamps'),  // Backend uses /all-bootcamps
        getById: (id) => api.get(`/show-bootcamp/${id}`),
        create: (data) => api.post('/create-bootcamp', data),
        update: (id, data) => api.put(`/update-bootcamp/${id}`, data),
        delete: (id) => api.delete(`/delete-bootcamp/${id}`),
    };

    // Roadmap Topics endpoints
    static roadmapTopics = {
        getAll: () => api.get('/show-roadmap-topic'),
        getById: (id) => api.get(`/show-roadmap-topic/${id}`),
        create: (data) => api.post('/create-roadmap-topic', data),
        update: (id, data) => api.put(`/update-roadmap-topic/${id}`, data),
        delete: (id) => api.delete(`/delete-roadmap-topic/${id}`),
    };

    // Users endpoints
    static users = {
        getAll: () => api.get('/all-users'),
        getById: (id) => api.get(`/show-user/${id}`),
        update: (id, data) => api.put(`/update-user/${id}`, data),
        delete: (id) => api.delete(`/delete-user/${id}`),
    };

    // Payment endpoints
    static payment = {
        addCourse: (data) => api.post('/payment-success', data),
    };
}

// Export both the configured axios instance and the service
export { api };
export default APIService;
