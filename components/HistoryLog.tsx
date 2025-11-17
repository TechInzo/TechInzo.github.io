
import React, { useState, useMemo } from 'react';
import { Dose } from '../types';
import { CheckCircleIcon, SortAscendingIcon, SortDescendingIcon } from './Icons';

interface HistoryLogProps {
  history: Dose[];
}

const formatDate = (date: Date) => {
  const d = new Date(date);
  return d.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

const formatTime = (date: Date) => {
  const d = new Date(date);
  return d.toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export const HistoryLog: React.FC<HistoryLogProps> = ({ history }) => {
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

  const sortedHistory = useMemo(() => {
    return [...history].sort((a, b) => {
      const dateA = new Date(a.timestamp).getTime();
      const dateB = new Date(b.timestamp).getTime();
      if (sortOrder === 'desc') {
        return dateB - dateA;
      } else {
        return dateA - dateB;
      }
    });
  }, [history, sortOrder]);

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md">
      <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
        <h2 className="text-lg font-semibold text-slate-700 dark:text-slate-200">History</h2>
        <div className="flex items-center space-x-1">
            <button
              onClick={() => setSortOrder('desc')}
              className={`p-1.5 rounded-md transition-colors ${sortOrder === 'desc' ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400' : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'}`}
              aria-label="Sort newest first"
              title="Sort newest first"
            >
              <SortDescendingIcon className="h-5 w-5" />
            </button>
            <button
              onClick={() => setSortOrder('asc')}
              className={`p-1.5 rounded-md transition-colors ${sortOrder === 'asc' ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400' : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'}`}
              aria-label="Sort oldest first"
              title="Sort oldest first"
            >
              <SortAscendingIcon className="h-5 w-5" />
            </button>
          </div>
      </div>
      <div className="p-4 max-h-96 overflow-y-auto">
        {history.length === 0 ? (
          <p className="text-center text-slate-500 dark:text-slate-400 py-8">No doses recorded yet.</p>
        ) : (
          <ul className="space-y-4">
            {sortedHistory.map((dose) => (
              <li key={dose.id} className="flex items-start space-x-3">
                <CheckCircleIcon className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="font-medium text-slate-800 dark:text-slate-100">
                    {dose.medicationName} <span className="text-slate-500 dark:text-slate-400">({dose.dosage})</span>
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {formatDate(dose.timestamp)} at {formatTime(dose.timestamp)}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};
