import React from 'react';
import { type MonzoSyncProgressUpdate } from '@repo/monzo-types';
import { CheckCircle, Loader2 } from 'lucide-react';

interface SyncProgressProps {
  syncTasks: MonzoSyncProgressUpdate[];
}

const SyncProgress: React.FC<SyncProgressProps> = ({ syncTasks }) => {
  return (
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
  );
};

export default SyncProgress;
