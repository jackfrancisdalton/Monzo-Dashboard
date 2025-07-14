import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { type MonzoSyncProgressUpdate } from '@repo/monzo-types';
import { CheckCircle, Loader2 } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL;

const SyncPage: React.FC = () => {
    const navigate = useNavigate();
    const [syncTasks, setSyncTasks] = useState<MonzoSyncProgressUpdate[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [userHasApprovedAccess, setUserHasApprovedAccess] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);

    const startSync = () => {
        setIsSyncing(true);
        const eventSource = new EventSource(`${API_URL}/monzo/sync`);

        eventSource.onmessage = (event) => {
            const data: MonzoSyncProgressUpdate = JSON.parse(event.data);

            setSyncTasks((prevTasks) => {
                const updatedTasks = prevTasks.filter((task) => task.taskName !== data.taskName);
                return [...updatedTasks, data];
            });

            if (data.taskStage === 'completed' && data.taskName === 'fullSync') {
                eventSource.close();
                setTimeout(() => navigate('/dashboard'), 5000);
            }
        };

        eventSource.onerror = (error) => {
            console.error('EventSource error:', error);
            setError('Sync error occurred.');
            eventSource.close();
            setIsSyncing(false);
        };
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
            <h1 className="text-3xl font-bold mb-4">Sync Monzo Data</h1>
            <div className="flex items-center mb-4">
                <input
                    type="checkbox"
                    id="approvalCheckbox"
                    checked={userHasApprovedAccess}
                    onChange={(e) => setUserHasApprovedAccess(e.target.checked)}
                    className="mr-2"
                />
                <label htmlFor="approvalCheckbox" className="text-sm">
                    I have approved this app in the Monzo app. (you should have a notification in the Monzo app)
                </label>
            </div>

            {userHasApprovedAccess && !isSyncing && (
                <button
                    onClick={startSync}
                    className="bg-blue-500 text-white px-4 py-2 rounded shadow hover:bg-blue-600 transition"
                >
                    Start Sync
                </button>
            )}

            {isSyncing && (
                <p className="mb-4">Sync in progress! Once we've completed the sync of your data we'll redirect to the dashboard!</p>
            )}

            <div className="flex flex-wrap gap-4 justify-center mt-6">
                {syncTasks.map((task) => (
                    <div
                        key={task.taskName}
                        className={`flex flex-col items-center justify-center w-40 h-40 rounded-2xl shadow p-4 transition-colors duration-300 ${
                            task.taskStage === 'completed' ? 'bg-green-400' : 'bg-orange-400'
                        }`}
                    >
                        {task.taskStage === 'completed' ? (
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
                ))}
            </div>

            {error && <p className="text-red-600 mt-6">{error}</p>}
        </div>
    );
};

export default SyncPage;
