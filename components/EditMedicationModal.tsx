import React, { useState, useEffect, useMemo } from 'react';
import { Medication, TimeOfDay, Schedule } from '../types';
import { XIcon, PillIcon, TrashIcon } from './Icons';

interface EditMedicationModalProps {
  medication: Medication;
  onClose: () => void;
  onUpdate: (updatedMed: Medication) => void;
  onDelete: (medicationId: string) => void;
}

const frequencyOptions = [
  { value: "As needed", label: "As needed", times: 0 },
  { value: "Once daily", label: "Once daily", times: 1 },
  { value: "Twice daily", label: "Twice daily", times: 2 },
  { value: "Three times daily", label: "Three times daily", times: 3 },
  { value: "Four times daily", label: "Four times daily", times: 4 },
  { value: "Every other day", label: "Every other day", times: 1 },
  { value: "Once a week", label: "Once a week", times: 1 },
];

const timeOfDayOptions: TimeOfDay[] = ['Morning', 'Afternoon', 'Evening'];


export const EditMedicationModal: React.FC<EditMedicationModalProps> = ({ medication, onClose, onUpdate, onDelete }) => {
  const [name, setName] = useState('');
  const [dosage, setDosage] = useState('');
  const [frequency, setFrequency] = useState(frequencyOptions[1].value);
  const [timesOfDay, setTimesOfDay] = useState<TimeOfDay[]>([]);
  const [hasReminder, setHasReminder] = useState(false);
  const [reminderTime, setReminderTime] = useState('09:00');

  useEffect(() => {
    if (medication) {
      setName(medication.name);
      setDosage(medication.dosage);
      
      // Handle both old and new schedule structures
      const currentSchedule = medication.schedule;
      if (typeof currentSchedule === 'object' && currentSchedule.frequency) {
        setFrequency(currentSchedule.frequency);
        setTimesOfDay(currentSchedule.timesOfDay || []);
      } else if (typeof currentSchedule === 'string') {
        // Fallback for old data structure
        setFrequency(currentSchedule);
        setTimesOfDay([]);
      }

      setHasReminder(!!medication.reminderTime);
      setReminderTime(medication.reminderTime || '09:00');
    }
  }, [medication]);

  const selectedFrequency = useMemo(() => frequencyOptions.find(f => f.value === frequency) || frequencyOptions[0], [frequency]);

  const handleTimeOfDayChange = (time: TimeOfDay) => {
    const isChecked = timesOfDay.includes(time);
    const newTimes = isChecked
      ? timesOfDay.filter(t => t !== time)
      : [...timesOfDay, time];

    if (selectedFrequency.times > 0 && newTimes.length > selectedFrequency.times) {
      return; 
    }
    setTimesOfDay(newTimes);
  };
  
  const handleFrequencyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newFrequency = e.target.value;
    setFrequency(newFrequency);
    const newFreqConfig = frequencyOptions.find(f => f.value === newFrequency);
    if (newFreqConfig && newFreqConfig.times > 0 && timesOfDay.length === 0) {
        setTimesOfDay(['Morning']);
    } else if (newFreqConfig && newFreqConfig.times === 0) {
        setTimesOfDay([]);
    }
  };


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !dosage.trim()) return;

    const updatedSchedule: Schedule = {
      frequency,
      timesOfDay,
    };

    onUpdate({
      ...medication,
      name,
      dosage,
      schedule: updatedSchedule,
      reminderTime: hasReminder ? reminderTime : null,
    });
  };
  
  const handleDelete = () => {
    onDelete(medication.id);
    onClose();
  };


  if (!medication) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" aria-modal="true" role="dialog">
      <div className="relative bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-md m-4 transform transition-all">
        <form onSubmit={handleSubmit}>
          <div className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <PillIcon className="h-6 w-6 text-indigo-500" />
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Edit Medication</h3>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="p-1 rounded-full text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                aria-label="Close modal"
              >
                <XIcon className="h-6 w-6" />
              </button>
            </div>
            
            <div className="mt-4 space-y-4">
              <div>
                <label htmlFor="edit-name" className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">Medication Name</label>
                <input
                  id="edit-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
              <div>
                <label htmlFor="edit-dosage" className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">Dosage</label>
                <input
                  id="edit-dosage"
                  type="text"
                  value={dosage}
                  onChange={(e) => setDosage(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
              <div>
                <label htmlFor="edit-schedule" className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">Schedule</label>
                <select
                  id="edit-schedule"
                  value={frequency}
                  onChange={handleFrequencyChange}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                >
                  {frequencyOptions.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>
               {selectedFrequency.times > 0 && (
                <div>
                  <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">Time of Day (select up to {selectedFrequency.times})</label>
                  <div className="flex flex-wrap gap-x-4 gap-y-2">
                    {timeOfDayOptions.map(time => (
                      <label key={time} className="flex items-center space-x-2 text-sm">
                        <input
                          type="checkbox"
                          checked={timesOfDay.includes(time)}
                          onChange={() => handleTimeOfDayChange(time)}
                          className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                        />
                        <span>{time}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
               <div className="space-y-2 pt-2">
                <div className="relative flex items-start">
                  <div className="flex h-6 items-center">
                    <input
                      id="edit-reminder"
                      type="checkbox"
                      checked={hasReminder}
                      onChange={(e) => setHasReminder(e.target.checked)}
                      className="h-4 w-4 rounded border-gray-300 dark:border-slate-600 text-indigo-600 focus:ring-indigo-600"
                    />
                  </div>
                  <div className="ml-3 text-sm leading-6">
                    <label htmlFor="edit-reminder" className="font-medium text-slate-700 dark:text-slate-200">
                      Set a reminder
                    </label>
                  </div>
                </div>
                {hasReminder && (
                  <div className="pl-7 pt-1">
                     <input
                        id="edit-reminderTime"
                        type="time"
                        value={reminderTime}
                        onChange={(e) => setReminderTime(e.target.value)}
                        className="w-full max-w-xs px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        required
                      />
                  </div>
                )}
              </div>
            </div>

          </div>
          <div className="bg-slate-50 dark:bg-slate-900 px-6 py-3 flex justify-between items-center rounded-b-lg">
             <button 
                type="button" 
                onClick={handleDelete} 
                className="flex items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-red-700 bg-red-100 hover:bg-red-200 dark:bg-red-900 dark:text-red-300 dark:hover:bg-red-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                <TrashIcon className="h-4 w-4 mr-2" />
                Delete
            </button>
            <div className="flex space-x-3">
              <button type="button" onClick={onClose} className="py-2 px-4 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                  Cancel
              </button>
              <button type="submit" className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                  Update Medication
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};