import React from 'react';
import { Medication } from '../types';
import { PillIcon, InfoIcon, ClockIcon, BellIcon, EditIcon, TrashIcon } from './Icons';

interface MedicationItemProps {
  medication: Medication;
  onTakeDose: (medicationId: string) => void;
  onShowInfo: (medication: Medication) => void;
  onEdit: (medication: Medication) => void;
  onDelete: (medicationId: string) => void;
}

const formatSchedule = (schedule: Medication['schedule']): string => {
  if (typeof schedule === 'string') {
    return schedule; // Fallback for old data
  }
  if (schedule && schedule.frequency) {
    const times = schedule.timesOfDay && schedule.timesOfDay.length > 0
      ? ` (${schedule.timesOfDay.join(', ')})`
      : '';
    return `${schedule.frequency}${times}`;
  }
  return 'Not specified';
};

export const MedicationItem: React.FC<MedicationItemProps> = ({ medication, onTakeDose, onShowInfo, onEdit, onDelete }) => {
  const scheduleText = formatSchedule(medication.schedule);

  return (
    <div className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0 sm:space-x-4">
      <div className="flex items-center space-x-4 flex-1">
        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center">
          <PillIcon className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
        </div>
        <div>
          <p className="font-semibold text-slate-800 dark:text-slate-100">{medication.name}</p>
          <p className="text-sm text-slate-500 dark:text-slate-400">{medication.dosage}</p>
          <div className="flex items-center text-sm text-slate-500 dark:text-slate-400 mt-1">
            <ClockIcon className="h-4 w-4 mr-1.5" />
            <span>{scheduleText}</span>
          </div>
           {medication.reminderTime && (
            <div className="flex items-center text-sm text-indigo-600 dark:text-indigo-400 mt-1 font-medium">
                <BellIcon className="h-4 w-4 mr-1.5" />
                <span>{medication.reminderTime}</span>
            </div>
        )}
        </div>
      </div>
      <div className="flex items-center space-x-2 w-full sm:w-auto">
        <button
          onClick={() => onDelete(medication.id)}
          className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-red-100 dark:hover:bg-red-800 hover:text-red-600 dark:hover:text-red-400 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500"
          aria-label={`Delete ${medication.name}`}
        >
          <TrashIcon className="h-5 w-5" />
        </button>
        <button
          onClick={() => onEdit(medication)}
          className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-800 dark:hover:text-slate-200 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
          aria-label={`Edit ${medication.name}`}
        >
          <EditIcon className="h-5 w-5" />
        </button>
        <button
          onClick={() => onShowInfo(medication)}
          className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
          aria-label={`Information about ${medication.name}`}
        >
          <InfoIcon className="h-5 w-5" />
        </button>
        <button
          onClick={() => onTakeDose(medication.id)}
          className="flex-grow sm:flex-none justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
        >
          Take Now
        </button>
      </div>
    </div>
  );
};