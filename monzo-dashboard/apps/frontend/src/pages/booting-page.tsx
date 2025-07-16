import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { type MonzoSyncProgressUpdate } from '@repo/monzo-types';
import SyncProgress from '../components/SyncProgress';

const API_URL = import.meta.env.VITE_API_URL;

const BootingPage: React.FC = () => {
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);
  const [syncTasks, setSyncTasks] = useState<MonzoSyncProgressUpdate[]>([]);

  useEffect(() => {
    const checkAndSync = async () => {
      try {
        const res = await fetch(`${API_URL}/dashboard-data/is-configured`);
        const data = await res.json();

        if (data.isConfigured) {
          const eventSource = new EventSource(`${API_URL}/monzo/incremental-sync`);

          eventSource.onmessage = (event) => {
            console.log('Received SSE message:', event.data);

            const task: MonzoSyncProgressUpdate = JSON.parse(event.data);
            setSyncTasks((prev) => {
              const taskMap = new Map(prev.map(t => [t.taskName, t]));
              taskMap.set(task.taskName, task);
              return Array.from(taskMap.values());
            });

            if (task.taskStage === 'completed' && task.taskName === 'sync') {
              eventSource.close();
              setTimeout(() => navigate('/dashboard'), 2000);
            }
          };

          eventSource.onerror = (err) => {
            console.error('SSE error', err);
            eventSource.close();
            setTimeout(() => {
              navigate('/dashboard');
            }, 2000);
          };

        } else {
          navigate('/oauth');
        }

      } catch (err) {
        console.error('Failed to check config', err);
        navigate('/oauth');
      } finally {
        setChecking(false);
      }
    };

    checkAndSync();
  }, [navigate]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-6">
      <h1 className="text-3xl font-bold mb-4">Preparing Your Dashboard</h1>
      <p className="text-gray-700 mb-6 max-w-md text-center">
        We’re checking your application data to ensures your app is configured and has up to date data.
        Sit tight, we’ll redirect you as soon as everything is ready!
      </p>

      {checking ? (
        <p className="text-lg font-medium text-gray-800">Checking your configuration...</p>
      ) : (
        <SyncProgress syncTasks={syncTasks} />
      )}
    </div>
  );
};

export default BootingPage;
