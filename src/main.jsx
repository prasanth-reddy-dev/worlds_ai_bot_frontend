import 'regenerator-runtime/runtime';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import React, { useEffect, useState } from 'react';
import APIService from './services/api';

const Index = () => {
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [bootcamps, setBootcamps] = useState([]);
  const [bannerData, setBannerData] = useState(null);

  const defaultBannerData = {
    offer: '🎉 Special Launch Offer - Enroll Now!',
    heading: 'Transform Your Future',
    tag: 'Join 10,000+ learners mastering in-demand skills with our AI-powered platform.',
    insta: '', linkedin: '', youtube: '', channel: '',
    maps: '', group: '', email: '', number: '', address: '', logo: ''
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 2;
      });
    }, 120);

    const fetchData = async () => {
      try {
        // Add timeout to prevent infinite loading
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Timeout')), 5000)
        );

        const fetchPromise = Promise.all([
          APIService.contacts.getAll(),
          APIService.bootcamps.getAll()
        ]);

        const [bannerRes, bootcampsRes] = await Promise.race([fetchPromise, timeoutPromise]);

        // Backend returns {message, data: [...]} so we need bannerRes.data.data
        const contactsArray = bannerRes.data.data || bannerRes.data || [];
        const contact = contactsArray[0] || {};

        setBannerData({
          offer: contact.offer || defaultBannerData.offer,
          heading: contact.heading || defaultBannerData.heading,
          tag: contact.tag || defaultBannerData.tag,
          insta: contact.insta || '',
          linkedin: contact.linkedin || '',
          youtube: contact.youtube || '',
          channel: contact.channel || '',
          maps: contact.maps || '',
          group: contact.group || '',
          email: contact.email || '',
          number: contact.number || '',
          address: contact.address || '',
          logo: contact.logo || ''
        });

        // Extract bootcamps data properly
        const bootcampsData = bootcampsRes?.data?.data || bootcampsRes?.data || [];
        setBootcamps(Array.isArray(bootcampsData) ? bootcampsData : []);
      } catch (error) {
        // API fetch failed or timed out, use default banner data
        console.log('Initial data fetch failed, using defaults:', error.message);
        setBannerData(defaultBannerData);
        setBootcamps([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    return () => clearInterval(interval);
  }, []);

  const FancyLoader = () => (
    <div className="loader-container">
      <style>{`
        .loader-container {
          position: fixed;
          inset: 0;
          background: #111827;
          z-index: 50;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 20px;
        }
        @keyframes orbit {
          0% { transform: rotate(0deg) translateX(35px) rotate(0deg); }
          100% { transform: rotate(360deg) translateX(35px) rotate(-360deg); }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 0.8; }
          50% { transform: scale(1.2); opacity: 1; }
        }
        .progress-bar {
          width: 200px;
          height: 6px;
          background: #374151;
          border-radius: 3px;
          overflow: hidden;
        }
        .progress {
          height: 100%;
          background: linear-gradient(to right, #06b6d4, #7c3aed);
          transition: width 0.2s ease;
        }
        .w-container {
          position: relative;
          width: 80px;
          height: 80px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .particle {
          position: absolute;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: linear-gradient(to right, #06b6d4, #7c3aed);
          animation: orbit 2s linear infinite;
        }
        .w-letter {
          font-size: 2.5rem;
          font-weight: bold;
          color: transparent;
          background: linear-gradient(to right, #06b6d4, #7c3aed);
          background-clip: text;
          -webkit-background-clip: text;
          animation: pulse 1.5s ease-in-out infinite;
          rotate: 21deg;
        }
      `}</style>
      <div className="w-container">
        <div className="w-letter">W</div>
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="particle"
            style={{
              animationDelay: `${i * -10.25}s`,
              background: `hsl(${i * 45}, 80%, 60%)`,
            }}
          />
        ))}
      </div>
      <div className="text-xl font-semibold text-white">WAB AI</div>
      <div className="progress-bar">
        <div className="progress" style={{ width: `${progress}%` }} />
      </div>
    </div>
  );

  return loading ? <FancyLoader /> : <App bootcamps={bootcamps} bannerData={bannerData} />;
};

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Index />
  </StrictMode>
);
