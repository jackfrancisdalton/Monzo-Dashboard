import React from 'react';

const API_URL = import.meta.env.VITE_API_URL;
const FRONTEND_URL = import.meta.env.VITE_FRONTEND_URL;

const OAuthPage: React.FC = () => {
    const startAuth = () => {
        // TODO: assess if redirect should be a query param or assigned in the backend
        window.location.href = `${API_URL}/auth/monzo/login?redirect_uri=${encodeURIComponent(`${FRONTEND_URL}/sync`)}`;
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
            <h1 className="text-3xl font-bold mb-4 text-center">Authorize Monzo Account</h1>
            <p className="mb-6 text-center">
                Click the button below to connect your Monzo account. 
                Once your authorized, we'll sync all of your Monzo data!
            </p>
            <button
                onClick={startAuth}
                className="bg-blue-600 text-white px-6 py-3 rounded shadow hover:bg-blue-700 transition"
            >
                Authorize Monzo
            </button>
        </div>
    );
};

export default OAuthPage;
