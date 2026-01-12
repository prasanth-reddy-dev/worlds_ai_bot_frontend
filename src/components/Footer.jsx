import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import APIService from '../services/api';

function Footer(props) {
  const currentYear = new Date().getFullYear();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [bootcamps, setBootcamps] = useState([]);

  // Fetch bootcamps (actual bootcamps, not roadmap topics)
  useEffect(() => {
    const fetchBootcamps = async () => {
      try {
        const response = await APIService.bootcamps.getAll();
        const bootcampsData = response?.data?.data || response?.data || [];
        setBootcamps(Array.isArray(bootcampsData) ? bootcampsData : []);
      } catch (error) {
        console.error('Error fetching bootcamps:', error);
        setBootcamps([]);
      }
    };

    fetchBootcamps();
  }, []);

  return (
    <div className="z-index-[-10]">
      <footer className="bg-black relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-950/20 to-transparent"></div>
        <div className="max-w-7xl mx-auto px-4 py-12 relative">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div className="space-y-6">
              <h3 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-fuchsia-400 bg-clip-text text-transparent">
                WAB AI
              </h3>
              <p className="text-gray-400">
                Transforming careers through AI-powered education and mentorship.
              </p>
              <div className="flex gap-4">
                {[
                  {
                    icon: 'bi-instagram',
                    name: 'Instagram',
                    href: props.insta,
                    color: 'text-[#E1306C]',
                  },
                  {
                    icon: 'bi-youtube',
                    name: 'YouTube',
                    href: props.channel,
                    color: 'text-[#FF0000]',
                  },
                  {
                    icon: 'bi-linkedin',
                    name: 'LinkedIn',
                    href: props.linkedin,
                    color: 'text-[#0A66C2]',
                  },
                  {
                    icon: 'bi-twitter-x',
                    name: 'X',
                    href: props.channel,
                    color: 'text-white',
                  },
                ].map((social) => (
                  <a
                    key={social.name}
                    href={social.href}
                    className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-900/40 to-fuchsia-900/40 flex items-center justify-center border border-purple-500/20 hover:scale-110 transition-transform"
                  >
                    <i className={`bi ${social.icon} ${social.color} text-xl`}></i>
                  </a>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4 bg-gradient-to-r from-purple-400 to-fuchsia-400 bg-clip-text text-transparent">
                Quick Links
              </h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link to="/" className="hover:text-purple-400 transition-colors">
                    Home
                  </Link>
                </li>
                <li>
                  <Link to="/about-us" className="hover:text-purple-400 transition-colors">
                    About us
                  </Link>
                </li>
                <li>
                  <Link to="/products" className="hover:text-purple-400 transition-colors">
                    Products
                  </Link>
                </li>
                <li>
                  <Link to="/carrers" className="hover:text-purple-400 transition-colors">
                    Careers
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4 bg-gradient-to-r from-purple-400 to-fuchsia-400 bg-clip-text text-transparent">
                Resources
              </h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="hover:text-purple-400 transition-colors text-left w-full"
                  >
                    Bootcamps
                  </button>
                </li>
                <li>
                  <Link to="/contact" className="hover:text-purple-400 transition-colors">
                    Contact
                  </Link>
                </li>
                <li>
                  <Link to="/privacy-policy" className="hover:text-purple-400 transition-colors">
                    Privacy policy
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4 bg-gradient-to-r from-purple-400 to-fuchsia-400 bg-clip-text text-transparent">
                Contact Us
              </h3>
              <ul className="space-y-2 text-gray-400">
                <li>{props.email}</li>
                <li>{props.number}</li>
                <li>Mon - Fri: 9AM - 6PM</li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-gray-800 text-center text-gray-400">
            <p>© {currentYear} WorldsAIbot. All rights reserved.</p>
          </div>
        </div>

        {/* Modal for Bootcamps */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
            <div
              className="relative bg-gradient-to-b from-[#1a1a1a] to-[#000000] rounded-xl p-6 w-full max-w-md 
                border-2 border-transparent bg-clip-padding animate-glow"
            >
              <style>
                {`
                  @keyframes glow {
                    0% { 
                      box-shadow: 0 0 10px rgba(138, 43, 226, 0.5), 
                                 0 0 20px rgba(75, 0, 130, 0.4), 
                                 0 0 30px rgba(112, 44, 246, 0.3); 
                      border-color: rgba(138, 43, 226, 0.8);
                    }
                    50% { 
                      box-shadow: 0 0 20px rgba(138, 43, 226, 0.7), 
                                 0 0 30px rgba(75, 0, 130, 0.6), 
                                 0 0 40px rgba(112, 44, 246, 0.5); 
                      border-color: rgba(75, 0, 130, 0.9);
                    }
                    100% { 
                      box-shadow: 0 0 10px rgba(138, 43, 226, 0.5), 
                                 0 0 20px rgba(75, 0, 130, 0.4), 
                                 0 0 30px rgba(112, 44, 246, 0.3); 
                      border-color: rgba(138, 43, 226, 0.8);
                    }
                  }
                  .animate-glow {
                    animation: glow 2s infinite ease-in-out;
                  }
                `}
              </style>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white tracking-wide">Bootcamps</h2>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-white hover:text-purple-300 transition-colors"
                >
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
              <div className="space-y-3">
                {bootcamps.length > 0 ? bootcamps.map((bootcamp) => (
                  <Link
                    key={bootcamp._id}
                    to={`/free-class/${bootcamp._id}`}
                    onClick={() => setIsModalOpen(false)}
                    className="block px-4 py-3 text-white bg-gradient-to-r from-[#2a2a2a] to-[#1a1a1a] 
                      rounded-lg transition-all duration-300 ease-in-out 
                      hover:scale-105 hover:bg-gradient-to-r hover:from-[#8A2BE2] hover:to-[#4B0082] 
                      hover:shadow-[0_0_15px_rgba(138,43,226,0.6)] 
                      active:scale-95 active:shadow-inner text-center font-medium"
                  >
                    {bootcamp.courseName || bootcamp.roadMapName}
                  </Link>
                )) : (
                  <div className="text-center text-gray-400 py-6">
                    <p>No bootcamps available</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </footer>
    </div>
  );
}

export default Footer;