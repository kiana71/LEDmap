// Fallback.js
import React from 'react';

const Fallback = () => (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 text-center p-4">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md mx-auto">
            <h1 className="text-3xl font-semibold text-green-600 mb-4">Oops, something went wrong.</h1>
            <p className="text-lg text-gray-700 mb-6">Try refreshing the page, or contact support if the issue persists.</p>
            <button 
                onClick={() => window.location.reload()} 
                className="bg-blue-500 text-white py-2 px-6 rounded-full hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300">
                Refresh Page
            </button>
        </div>
    </div>
);

export default Fallback;
