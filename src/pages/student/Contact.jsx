import React, { useState } from 'react';
import Footer from '../../components/Footer';
import axios from 'axios';
import { BACKEND_URL } from '../../../config/constant';

const Contact = (props) => {
  const [formData, setFormData] = useState({ name: '', email: '', mobile: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({ name: '', email: '', mobile: '', message: '' });
  const [successMessage, setSuccessMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    // Clear error when user starts typing
    setErrors({ ...errors, [name]: '' });
    setSuccessMessage('');
  };

  const validateForm = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const mobileRegex = /^[+]?[\d\s-]{10,}$/;
    const newErrors = { name: '', email: '', mobile: '', message: '' };
    let isValid = true;

    if (!formData.email || !emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address.';
      isValid = false;
    }
    if (!formData.mobile || !mobileRegex.test(formData.mobile)) {
      newErrors.mobile = 'Please enter a valid mobile number.';
      isValid = false;
    }
    if (!formData.name) {
      newErrors.name = 'Name is required.';
      isValid = false;
    }
    if (!formData.message) {
      newErrors.message = 'Message is required.';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    setSuccessMessage('');

    try {
      // Save feedback to database
      const response = await axios.post(`${BACKEND_URL}/create-feedback`, {
        name: formData.name,
        email: formData.email,
        mobile: formData.mobile,
        message: formData.message
      });

      if (response.data) {
        setSuccessMessage('Thank you for your message! We will get back to you soon.');
        setFormData({ name: '', email: '', mobile: '', message: '' });
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
      setErrors({ ...errors, form: 'Failed to send message. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-blue-950 text-white">
      <div className="relative py-10 sm:py-20 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,#2a004730,transparent)] animate-pulse"></div>
        <div className="container mx-auto px-4 relative z-10">
          <h2 className="text-4xl sm:text-5xl font-bold text-center mb-10 sm:mb-16 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Contact Us
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-12">
            <div className="p-4 sm:p-8 rounded-xl bg-gray-900/50 border border-blue-800/30 hover:border-blue-600/50 transition-all">
              <h3 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Get in Touch
              </h3>
              <p className="text-base sm:text-lg text-gray-300 mb-4 sm:mb-8">
                Have questions or need assistance? We're here to help! Fill out the form below and we'll get back to you soon.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                {successMessage && (
                  <div className="p-4 rounded-lg bg-green-500/20 border border-green-500/50 text-green-400" role="alert">
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      {successMessage}
                    </div>
                  </div>
                )}

                {errors.form && (
                  <p className="text-red-400 text-sm p-3 rounded-lg bg-red-500/10 border border-red-500/30" role="alert">
                    {errors.form}
                  </p>
                )}

                <div>
                  <label htmlFor="name" className="block text-xs sm:text-sm font-medium text-gray-300">
                    Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 sm:px-4 sm:py-3 rounded-lg bg-blue-900/30 border border-blue-800/50 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Your Name"
                    required
                    aria-required="true"
                    aria-describedby="name-error"
                  />
                  {errors.name && (
                    <p id="name-error" className="text-red-400 text-sm mt-1" role="alert">
                      {errors.name}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="email" className="block text-xs sm:text-sm font-medium text-gray-300">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 sm:px-4 sm:py-3 rounded-lg bg-blue-900/30 border border-blue-800/50 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="your.email@example.com"
                    required
                    aria-required="true"
                    aria-describedby="email-error"
                  />
                  {errors.email && (
                    <p id="email-error" className="text-red-400 text-sm mt-1" role="alert">
                      {errors.email}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="mobile" className="block text-xs sm:text-sm font-medium text-gray-300">
                    Mobile Number
                  </label>
                  <input
                    type="tel"
                    id="mobile"
                    name="mobile"
                    value={formData.mobile}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 sm:px-4 sm:py-3 rounded-lg bg-blue-900/30 border border-blue-800/50 text-white placeholder-gray-500 focusSLAPS focus:ring-2 focus:ring-blue-500"
                    placeholder="+1 (123) 456-7890"
                    required
                    aria-required="true"
                    aria-describedby="mobile-error"
                  />
                  {errors.mobile && (
                    <p id="mobile-error" className="text-red-400 text-sm mt-1" role="alert">
                      {errors.mobile}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="message" className="block text-xs sm:text-sm font-medium text-gray-300">
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows={5}
                    className="mt-1 block w-full px-3 py-2 sm:px-4 sm:py-3 rounded-lg bg-blue-900/30 border border-blue-800/50 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Your message..."
                    required
                    aria-required="true"
                    aria-describedby="message-error"
                  ></textarea>
                  {errors.message && (
                    <p id="message-error" className="text-red-400 text-sm mt-1" role="alert">
                      {errors.message}
                    </p>
                  )}
                </div>

                <div>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full px-4 py-2 sm:px-6 sm:py-3 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 hover: мою from-blue-700 hover:to-purple-700 text-white font-semibold transition-all transform hover:scale-105 disabled:opacity-50"
                    aria-label="Send message"
                  >
                    {isSubmitting ? 'Preparing...' : 'Send Message'}
                  </button>
                </div>
              </form>
            </div>

            <div className="p-4 sm:p-8 rounded-xl bg-gray-900/50 border border-blue-800/30 hover:border-blue-600/50 transition-all">
              {props && props.email ? (
                <>
                  <h3 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                    Our Information
                  </h3>
                  <div className="space-y-4 sm:space-y-6">
                    <div className="flex items-center space-x-3 sm:space-x-4">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center bg-blue-900/30 rounded-lg border border-blue-800/50">
                        <i className="bi bi-geo-alt text-white text-xl"></i>
                      </div>
                      <div>
                        <p className="text-base sm:text-lg font-semibold text-white">Address</p>
                        <p className="text-gray-300 text-sm sm:text-base">{props.address}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 sm:space-x-4">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center bg-blue-900/30 rounded-lg border border-blue-800/50">
                        <i className="bi bi-telephone text-white text-xl"></i>
                      </div>
                      <div>
                        <p className="text-base sm:text-lg font-semibold text-white">Phone</p>
                        <p className="text-gray-300 text-sm sm:text-base">{props.number}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 sm:space-x-4">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center bg-blue-900/30 rounded-lg border border-blue-800/50">
                        <i className="bi bi-envelope text-white text-xl"></i>
                      </div>
                      <div>
                        <p className="text-base sm:text-lg font-semibold text-white">Email</p>
                        <p className="text-gray-300 text-sm sm:text-base">{props.email}</p>
                      </div>
                    </div>

                    <div className="mt-6 sm:mt-8">
                      <h4 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                        Follow Us
                      </h4>
                      <div className="flex space-x-3 sm:space-x-4">
                        <a
                          href={props.insta || ''}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center bg-blue-900/30 rounded-lg border border-blue-800/50 hover:bg-blue-900/50 transition-all"
                          aria-label="Follow us on Instagram"
                        >
                          <i className="bi bi-instagram text-[#E1306C] text-xl"></i>
                        </a>
                        <a
                          href={props.youtube || ''}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center bg-blue-900/30 rounded-lg border border-blue-800/50 hover:bg-blue-900/50 transition-all"
                          aria-label="Follow us on YouTube"
                        >
                          <i className="bi bi-youtube text-[#FF0000] text-xl"></i>
                        </a>
                        <a
                          href={props.linkedin || ''}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center bg-blue-900/30 rounded-lg border border-blue-800/50 hover:bg-blue-900/50 transition-all"
                          aria-label="Follow us on LinkedIn"
                        >
                          <i className="bi bi-linkedin text-[#0A66C2] text-xl"></i>
                        </a>
                        <a
                          href={props.channel || ''}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center bg-blue-900/30 rounded-lg border border-blue-800/50 hover:bg-blue-900/50 transition-all"
                          aria-label="Follow us on Twitter"
                        >
                          <i className="bi bi-twitter-x text-white text-xl"></i>
                        </a>
                      </div>
                    </div>

                    <div className="mt-6 sm:mt-8">
                      <h4 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                        Visit Us
                      </h4>
                      <div className="w-full h-40 sm:h-48 rounded-lg overflow-hidden">
                        <iframe
                          src={props.maps || ''}
                          width="100%"
                          height="100%"
                          style={{ border: 0 }}
                          allowFullScreen
                          loading="lazy"
                          title="Our Location"
                        ></iframe>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <p className="text-gray-300 text-center">Failed to load contact information.</p>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer  {...props} />
    </div>
  );
};

export default Contact;