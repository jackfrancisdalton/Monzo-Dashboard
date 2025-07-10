import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

type SyncStage = string; // update to a more specific type

const SetUpPage: React.FC = () => {
    const navigate = useNavigate();
    const [stage, setStage] = useState<SyncStage | null>(null); // TODO: replace with cards that are marked with traffic lights on progress
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const url = new URL(window.location.href);
        if (url.searchParams.get('oauth') === 'success') {
            // User will have to open their monzo app and approve access before this can start, prompt them to do so
            startSync();
        }
    }, []);

    const startAuth = () => {
        // TODO: replace oauth success param with strong typing version
        window.location.href = `http://localhost:3000/auth/monzo/login?redirect_uri=${encodeURIComponent('http://localhost:5173/setup?oauth=success')}`;
    };

    const startSync = () => {
        setStage('Starting...');
        // NOTE: we're hardcoding to monzo, we'd want to change this if we supported multiple providers
        const eventSource = new EventSource('http://localhost:3000/monzo/sync');

        eventSource.onmessage = (event) => {
            const data = JSON.parse(event.data);
            setStage(data.stage);

            if (data.stage === 'completed') {
                eventSource.close();
                setTimeout(() => navigate('/dashboard'), 1000);
            }
        };

        eventSource.onerror = () => {
            setError('Sync failed. Please try again.');
            setStage(null);
            eventSource.close();
        };
    };

    return (
        <div className="flex flex-col items-center justify-center h-screen bg-gray-100 p-6">
            <h1 className="text-3xl font-bold mb-4">Auth and sync your Monzo account</h1>
            <p className="mb-4 text-center max-w-xl">
                We'll redirect you to auth with Monzo, then automatically sync all your data.
                Tokens are securely stored and auto-refresh. Future syncs only fetch new transactions.
            </p>

            {!stage && (
                <button
                    onClick={startAuth}
                    className="bg-blue-600 text-white px-6 py-3 rounded shadow hover:bg-blue-700 transition"
                >
                    Connect and Sync
                </button>
            )}

            {stage && (
                <div className="flex flex-col items-center">
                    <div className="loader mb-4"></div>
                    <h1>Now syncing data, will continue in backround if you close this page</h1>
                    <p>Sync in progress: {stage}</p>
                </div>
            )}

            {error && <p className="text-red-600 mt-4">{error}</p>}
        </div>
    );
};

export default SetUpPage;
