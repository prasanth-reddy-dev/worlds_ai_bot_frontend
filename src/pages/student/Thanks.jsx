import React, { useState, useEffect } from 'react';
import APIService from '../../services/api';


const Thanks = () => {
  const [contactData, setContactData] = useState({
    group: 'https://chat.whatsapp.com/YOUR_WHATSAPP_GROUP_LINK',
    email: 'nandharapu1234@gmail.com',
    number: '+1 (123) 456-7890',
  });

  useEffect(() => {
    // Fetch group, email, and number data
    const fetchContactData = async () => {
      try {
        const response = await APIService.contacts.getAll();

        // Backend returns {message, data: [...]} so we need response.data.data
        const contactsArray = response.data.data || response.data || [];
        const data = contactsArray[0]; // Take the first item

        if (data) {
          setContactData({
            group: data.group || 'https://chat.whatsapp.com/YOUR_WHATSAPP_GROUP_LINK',
            email: data.email || 'nandharapu1234@gmail.com',
            number: data.number || '+1 (123) 456-7890',
          });
        }
      } catch (error) {
        // Keep default values if API fails
      }
    };

    fetchContactData();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 to-blue-950 text-white flex items-start md:items-center justify-center relative overflow-hidden pt-16 md:pt-0">
      {/* Background Decorative Elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 left-0 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Main Content */}
      <div className="text-center max-w-2xl px-4 z-10 animate-fadeIn">
        {/* Checkmark Icon in Circle */}
        <div className="mb-8 flex justify-center">
          <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
            <svg
              className="w-12 h-12 text-white animate-bounce"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="3"
                d="M5 13l4 4L19 7"
              ></path>
            </svg>
          </div>
        </div>

        {/* Heading */}
        <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
          Thank You for Registering!
        </h1>

        {/* Message */}
        <p className="text-xl md:text-2xl text-gray-300 mb-10 max-w-lg mx-auto">
          We’re thrilled to have you on board! Join our WhatsApp group to stay updated with the latest news, resources, and support.
        </p>

        {/* WhatsApp Button */}
        <a
          href={contactData.group}
          target="_blank"
          rel="noopener noreferrer"
          className="relative px-8 py-4 bg-gradient-to-r from-green-500 to-green-700 rounded-lg font-bold text-lg hover:from-green-600 hover:to-green-800 transition-all transform hover:scale-105 inline-block shadow-lg mb-6"
        >
          <span className="relative z-10">Join WhatsApp Group</span>
          {/* Glowing Effect */}
          <span className="absolute inset-0 bg-green-500 opacity-40 blur-md rounded-lg animate-pulse"></span>
        </a>

        {/* Additional Info */}
        <div className="text-sm text-gray-400 mt-6 space-y-2">
          <p>
            Can’t join? Contact us at{' '}
            <a href={`mailto:${contactData.email}`} className="underline hover:text-blue-400">
              {contactData.email}
            </a>
          </p>
          <p>
            Facing any problem with join? Drop a message to WhatsApp or call{' '}
            <a href={`tel:${contactData.number}`} className="underline hover:text-blue-400">
              {contactData.number}
            </a>
            .
          </p>
          <a
            href={`https://wa.me/${contactData.number.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
              'Need WorldsAIbot help to join'
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-6 py-2 bg-gradient-to-r from-green-500 to-green-700 rounded-lg font-semibold text-sm hover:from-green-600 hover:to-green-800 transition-all transform hover:scale-105 text-[white]"
          >
            Message on WhatsApp
          </a>
        </div>
      </div>

      {/* Custom CSS for Animations */}
      <style jsx>{`
        @keyframes fadeIn {
          0% { opacity: 0; transform: translateY(20px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 1s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default Thanks;