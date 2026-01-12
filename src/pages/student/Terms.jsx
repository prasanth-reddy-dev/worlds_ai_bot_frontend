
import React, { useState, useEffect } from 'react';
import APIService from '../../services/api';

const Terms = () => {
  const [privacyData, setPrivacyData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await APIService.privacy.getAll();
        // Backend returns {data: [...]} so access response.data.data
        const privacyItems = response.data?.data || [];
        setPrivacyData(Array.isArray(privacyItems) ? privacyItems : []);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching privacy data:', error);
        setPrivacyData([]);
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-black py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-16 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 blur-3xl opacity-10"></div>
          <h1 className="text-5xl font-bold text-white mb-4 relative">
            Privacy Policy
          </h1>
          <div className="w-24 h-0.5 bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 mx-auto rounded-full"></div>
        </header>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : privacyData.length === 0 ? (
          <div className="text-center text-zinc-400">No privacy policies available.</div>
        ) : (
          <div className="space-y-8">
            {privacyData.map((item, index) => (
              <div
                key={index}
                className="bg-zinc-900 rounded-xl p-8 shadow-2xl hover:shadow-purple-500/5 transition-all duration-500 border border-zinc-800 relative group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-red-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-xl"></div>
                <div className="flex items-start gap-6 mb-6 relative">
                  <span className="text-4xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 text-transparent bg-clip-text">
                    {(index + 1).toString().padStart(2, '0')}
                  </span>
                  <h2 className="text-2xl font-semibold text-white pt-1">
                    {item.heading}
                  </h2>
                </div>
                <div className="text-zinc-400 leading-relaxed space-y-4 ml-16">
                  {item.paragraph.split('\n').map((para, idx) => (
                    <p key={idx} className="hover:text-zinc-300 transition-colors duration-300">
                      {para}
                    </p>
                  ))}
                </div>
                <div className="mt-6 pt-4 border-t border-zinc-800 ml-16">
                  <p className="text-sm text-zinc-500">
                    Last Updated: {item.lastUpdated || item.updatedAt || item.createdAt
                      ? new Date(item.lastUpdated || item.updatedAt || item.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })
                      : 'Recently'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        <footer className="mt-12 text-center">
          <p className="text-sm text-zinc-500">
            © {new Date().getFullYear()} All Rights Reserved
          </p>
        </footer>
      </div>
    </div>
  );
};

export default Terms;