import React from 'react';

const Loading = ({ message = 'Loading...', fullScreen = false }) => {
    const containerClass = fullScreen
        ? 'min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-black'
        : 'flex items-center justify-center p-8';

    return (
        <div className={containerClass}>
            <div className="text-center">
                {/* Animated UFO Loading */}
                <div className="relative inline-block mb-4">
                    <div className="text-6xl animate-bounce">🛸</div>
                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2">
                        <div className="flex gap-1">
                            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                            <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                            <div className="w-2 h-2 bg-pink-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                        </div>
                    </div>
                </div>

                <p className="text-gray-400 mt-4 font-medium">{message}</p>

                {/* Progress bar */}
                <div className="w-48 h-1 bg-gray-700 rounded-full mt-4 mx-auto overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 animate-loading-bar"></div>
                </div>
            </div>

            <style>{`
        @keyframes loading-bar {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
        
        .animate-loading-bar {
          animation: loading-bar 1.5s ease-in-out infinite;
        }
      `}</style>
        </div>
    );
};

export default Loading;
