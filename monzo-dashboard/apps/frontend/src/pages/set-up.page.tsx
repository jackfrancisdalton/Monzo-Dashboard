import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { MonzoSyncProgressUpdate } from '@repo/monzo-types';
import { CheckCircle, Loader2 } from 'lucide-react';

const SetUpPage: React.FC = () => {
    const navigate = useNavigate();
    const [syncTasks, setSyncTasks] = useState<MonzoSyncProgressUpdate[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [oauthSuccess, setOauthSuccess] = useState(false);

    useEffect(() => {
        const url = new URL(window.location.href);
        // TODO: replace with CONSTS
        if (url.searchParams.get('oauth') === 'success') {
            setOauthSuccess(true);
        }
    }, []);

    const startAuth = () => {
        // TODO: replace with CONSTS
        window.location.href = `http://localhost:3000/auth/monzo/login?redirect_uri=${encodeURIComponent(
            'http://localhost:5173/setup?oauth=success'
        )}`;
    };

    const startSync = () => {
        // TODO: replace with CONSTS
        const eventSource = new EventSource('http://localhost:3000/monzo/sync');

        eventSource.onmessage = (event) => {
            const data: MonzoSyncProgressUpdate = JSON.parse(event.data);

            setSyncTasks((prevTasks) => {
                const taskIndex = prevTasks.findIndex((task) => task.taskName === data.taskName);

                if (taskIndex !== -1) {
                    const updatedTasks = [...prevTasks];

                    updatedTasks[taskIndex] = { 
                        ...updatedTasks[taskIndex], 
                        taskStage: data.taskStage,
                        syncedCount: data.syncedCount
                    };

                    return updatedTasks;
                } else {
                    return [...prevTasks, { 
                        taskName: data.taskName, 
                        taskStage: data.taskStage,
                        syncedCount: data.syncedCount
                    }];
                }
            });

            // TODO: replace with CONSTS
            // When this message arrives we've received the complete sync and can navigate to dashboard
            if (data.taskStage === 'completed' && data.taskName === 'fullSync') {
                eventSource.close();
                setTimeout(() => navigate('/dashboard'), 5000);
            }
        };

        eventSource.onerror = () => {
            setError('Sync failed. Please try again.');
            setSyncTasks([]);
            eventSource.close();
        };
    };

    const renderHeader = () => (
        <div className="text-center">
            <h1 className="text-3xl font-bold mb-4">Auth and sync your Monzo account</h1>
            <p className="mb-6 max-w-xl mx-auto">
                We'll redirect you to auth with Monzo, then automatically sync all your data.
                Tokens are securely stored and auto-refresh. Future syncs only fetch new transactions.
            </p>
        </div>
    );

    const renderConnectButton = () => (
        <button
            onClick={startAuth}
            className="bg-blue-600 text-white px-6 py-3 rounded shadow hover:bg-blue-700 transition"
        >
            Connect and Sync
        </button>
    );

    const renderSyncButton = () => (
        <button
            onClick={startSync}
            className="bg-green-600 text-white px-6 py-3 rounded shadow hover:bg-green-700 transition mt-4"
        >
            Start Sync
        </button>
    );

    const renderSyncTasks = () => (
        <div className="w-full max-w-4xl mt-6">
            <h2 className="text-xl font-semibold mb-4 text-center">
                Now syncing data, will continue in background if you close this page
            </h2>
            <div className="flex flex-wrap gap-4 justify-center">
                {syncTasks.map((task, index) => {
                    const isCompleted = task.taskStage === 'completed';
                    return (
                        <div
                            key={index}
                            className={`flex flex-col items-center justify-center w-40 h-40 rounded-2xl shadow p-4 
                                transition-colors duration-300
                                ${isCompleted ? 'bg-green-400' : 'bg-orange-400'}`}
                        >
                            {isCompleted ? (
                                <CheckCircle className="w-12 h-12 text-white" />
                            ) : (
                                <Loader2 className="w-12 h-12 text-white animate-spin" />
                            )}
                            <p className="mt-3 text-white font-medium text-center">{task.taskName}</p>
                            {task.syncedCount !== undefined && (
                                <p className="mt-1 text-white text-sm text-center">
                                    Synced: {task.syncedCount}
                                </p>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );

    const renderError = () => error && <p className="text-red-600 mt-6">{error}</p>;

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
            {renderHeader()}
            {!oauthSuccess && syncTasks.length === 0 && renderConnectButton()}
            {oauthSuccess && syncTasks.length === 0 && renderSyncButton()}
            {syncTasks.length > 0 && renderSyncTasks()}
            {renderError()}
        </div>
    );
};

export default SetUpPage;
