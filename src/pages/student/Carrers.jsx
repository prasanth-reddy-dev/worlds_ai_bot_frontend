import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Footer from '../../components/Footer';
import { BACKEND_URL } from '../../../config/constant';

const Careers = (props) => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [emailLoading, setEmailLoading] = useState(true);
  const [applicationEmail, setApplicationEmail] = useState(null);
  const [alert, setAlert] = useState(null);
  const [progress, setProgress] = useState(100);

  const benefits = [
    {
      icon: '💰',
      title: 'Competitive Pay',
      description: 'Industry-leading compensation with performance bonuses',
    },
    {
      icon: '📚',
      title: 'Learning Budget',
      description: 'Annual budget for courses, conferences, and certifications',
    },
    {
      icon: '🏥',
      title: 'Health Benefits',
      description: 'Comprehensive health, dental, and vision coverage',
    },
    {
      icon: '⚖️',
      title: 'Work-Life Balance',
      description: 'Flexible working hours and remote work options',
    },
  ];

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

  useEffect(() => {
    const fetchApplicationEmail = async () => {
      try {
        const response = await axios.get(`${BACKEND_URL}/all-contacts`, {
          withCredentials: true,
        });
        const data = response.data;
        if (data && Array.isArray(data) && data[0]?.email) {
          setApplicationEmail(data[0].email);
        } else {
          showAlert('Invalid email data received.', 'error');
        }
      } catch (error) {
        showAlert(
          error.response?.data?.message || 'Failed to fetch application email.',
          'error'
        );
      } finally {
        setEmailLoading(false);
      }
    };

    const fetchJobs = async () => {
      try {
        const response = await axios.get(`${BACKEND_URL}/show-jobs`, {
          withCredentials: true,
        });
        const jobData = [
          {
            department: 'Tech Excellence, Development & Research Department',
            roles: response.data.map((job) => ({
              title: job.jobRole || 'Unknown Role',
              type: job.jobType || 'Full-time',
              location:
                job.workType?.charAt(0).toUpperCase() + (job.workType?.slice(1) || 'Remote'),
              experience: job.experience || 'Not specified',
            })),
          },
        ];
        setDepartments(jobData);
      } catch (error) {
        showAlert(
          error.response?.data?.message || 'Failed to fetch job openings.',
          'error'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchApplicationEmail();
    fetchJobs();
  }, []);

  const handleApply = (role) => {
    if (!applicationEmail) {
      showAlert('Application email not available. Please try again later.', 'error');
      return;
    }

    const email = applicationEmail;
    const subject = `Application for ${role.title} Position`;
    const body = `Dear Hiring Manager,\n\nI am excited to apply for the ${role.title} position at your company. Below are the details of the role:\n\n- Job Role: ${role.title}\n- Type: ${role.type}\n- Location: ${role.location}\n- Experience Required: ${role.experience}\n\nPlease find my resume attached to showcase my experience. I am eager to contribute to your team and would be happy to provide additional information if needed.\n\nThank you for considering my application. I look forward to the opportunity to discuss how I can contribute to your organization.\n\nBest regards,\n[Your Name]\n[Your Contact Information]`;

    const mailtoLink = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    try {
      window.location.href = mailtoLink;
    } catch (error) {
      showAlert('Failed to open email client. Please try again.', 'error');
    }
  };

  const handleOpenApplication = () => {
    if (!applicationEmail) {
      showAlert('Application email not available. Please try again later.', 'error');
      return;
    }

    const email = applicationEmail;
    const subject = `Open Application`;
    const body = `Dear Hiring Manager,\n\nI am enthusiastic about the opportunity to join your team. While I may not have a specific role in mind, I am eager to contribute my skills and make an impact in any capacity where I am needed.\n\nPlease find my resume attached to showcase my experience. I am excited to contribute to your mission and would appreciate any opportunity to discuss how I can fit into your organization.\n\nThank you for considering my application. I look forward to hearing from you!\n\nBest regards,\n[Your Name]\n[Your Contact Information]`;

    const mailtoLink = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    try {
      window.location.href = mailtoLink;
    } catch (error) {
      showAlert('Failed to open email client. Please try again.', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Alert Component */}
      {alert && (
        <div
        className={`fixed bottom-4 right-4 px-4 py-3 rounded-lg text-white shadow-lg transition-all duration-300 z-[50] ${
          alert.type === 'success' ? 'bg-green-600' : 'bg-red-600'
        } flex flex-col w-80 ${alert.visible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        
        >
          <div className="flex items-center space-x-2">
            <span className="flex-1">{alert.message}</span>
            <button
              onClick={dismissAlert}
              className="text-white hover:text-gray-200 focus:outline-none"
              aria-label="Dismiss alert"
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

      {/* Open Application Section */}
      <div className="py-6 sm:py-10 relative">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6 sm:mb-8 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Don’t See Your Perfect Role?
          </h2>
          <p className="text-lg sm:text-xl text-gray-300 mb-6 sm:mb-8 max-w-2xl mx-auto">
            We’re always looking for talented individuals. Send us your resume and let us know how you can contribute to our mission.
          </p>
          <button
            onClick={handleOpenApplication}
            className="px-6 py-3 sm:px-8 sm:py-4 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105 cursor-pointer disabled:opacity-50"
            type="button"
            disabled={emailLoading || !applicationEmail}
            aria-label="Send open application"
          >
            {emailLoading ? 'Loading...' : 'Send Open Application'}
          </button>
        </div>
      </div>
      <hr className="mx-4 sm:mx-16 border-[3px] hidden sm:block" />

      {/* Open Positions Section */}
      <div className="py-10 sm:py-20 relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,#2a004730,transparent)] animate-pulse pointer-events-none"></div>
        <div className="container mx-auto px-4 relative z-10">
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-10 sm:mb-16 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Open Positions at Other Companies
          </h2>
          <div className="space-y-8 sm:space-y-12">
            {loading ? (
              <p className="text-center text-gray-300">Loading job openings...</p>
            ) : departments.length > 0 ? (
              departments.map((department, index) => (
                <div key={index} className="space-y-4 sm:space-y-6">
                  <h3 className="text-xl sm:text-2xl font-bold text-blue-400 mb-4 sm:mb-6">
                    {department.department}
                  </h3>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    {department.roles.map((role, roleIndex) => (
                      <div
                        key={roleIndex}
                        className="p-4 sm:p-6 rounded-xl bg-gray-900/50 border border-blue-800/30 hover:border-blue-600/50 transition-all pointer-events-auto"
                      >
                        <h4 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                          {role.title}
                        </h4>
                        <div className="space-y-1 sm:space-y-2 mb-4 sm:mb-6">
                          <div className="flex items-center text-gray-300">
                            <span className="text-xs sm:text-sm">🕒 {role.type}</span>
                          </div>
                          <div className="flex items-center text-gray-300">
                            <span className="text-xs sm:text-sm">📍 {role.location}</span>
                          </div>
                          <div className="flex items-center text-gray-300">
                            <span className="text-xs sm:text-sm">⭐ {role.experience}</span>
                          </div>
                        </div>
                        <button
                          onClick={() => handleApply(role)}
                          className="w-full py-2 rounded-lg border border-blue-800/50 hover:bg-blue-900/50 transition-all text-xs sm:text-sm cursor-pointer focus:outline-none pointer-events-auto disabled:opacity-50"
                          type="button"
                          disabled={emailLoading || !applicationEmail}
                          aria-label={`Apply for ${role.title}`}
                        >
                          Apply Now →
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-300">No job openings available at the moment.</p>
            )}
          </div>
        </div>
      </div>

      {/* Why Join Us Section */}
      <div className="py-10 sm:py-20 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-gray-900/20 to-blue-950/20 pointer-events-none"></div>
        <div className="container mx-auto px-4 relative z-10">
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-10 sm:mb-16 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Why Join Us?
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {benefits.map((benefit, index) => (
              <div
                key={index}
                className="p-4 sm:p-6 rounded-xl bg-gray-900/50 border border-blue-800/30 hover:border-blue-600/50 transition-all pointer-events-auto"
              >
                <div className="text-3xl sm:text-4xl mb-3 sm:mb-4">{benefit.icon}</div>
                <h3 className="text-lg sm:text-xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  {benefit.title}
                </h3>
                <p className="text-gray-300 text-sm sm:text-base">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Footer {...props} />
    </div>
  );
};

export default Careers;