import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { type MonzoSyncProgressUpdate } from '@repo/monzo-types';
import SyncProgress from '../components/SyncProgress';

const API_URL = import.meta.env.VITE_API_URL;

// TODO: rename to full sync page
const SyncPage: React.FC = () => {
  const navigate = useNavigate();
  const [syncTasks, setSyncTasks] = useState<MonzoSyncProgressUpdate[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [userHasApprovedAccess, setUserHasApprovedAccess] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  const startSync = () => {
    if (isSyncing) return;

    setIsSyncing(true);
    const eventSource = new EventSource(`${API_URL}/monzo/sync-full`);

    eventSource.onmessage = (event) => {
      const data: MonzoSyncProgressUpdate = JSON.parse(event.data);

      setSyncTasks((prev) => {
        const taskMap = new Map(prev.map(t => [t.taskName, t]));
        taskMap.set(data.taskName, data);
        return Array.from(taskMap.values());
      });

      if (data.taskStage === 'completed' && data.taskName === 'sync') {
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
          I have approved this app in the Monzo app.
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
        <>
          <p className="mb-4">Sync in progress! We'll redirect you once complete.</p>
          <SyncProgress syncTasks={syncTasks} />
        </>
      )}

      {error && <p className="text-red-600 mt-6">{error}</p>}
    </div>
  );
};

export default SyncPage;
