import React, { useState, useMemo } from 'react';
import { Medication, TimeOfDay, Schedule } from '../types';
import { PlusIcon, ChevronDownIcon } from './Icons';

interface AddMedicationFormProps {
  onAddMedication: (med: Omit<Medication, 'id'>) => void;
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

export const AddMedicationForm: React.FC<AddMedicationFormProps> = ({ onAddMedication }) => {
  const [name, setName] = useState('');
  const [dosage, setDosage] = useState('');
  const [frequency, setFrequency] = useState(frequencyOptions[1].value);
  const [timesOfDay, setTimesOfDay] = useState<TimeOfDay[]>(['Morning']);
  const [isExpanded, setIsExpanded] = useState(false);
  const [hasReminder, setHasReminder] = useState(false);
  const [reminderTime, setReminderTime] = useState('09:00');

  const selectedFrequency = useMemo(() => frequencyOptions.find(f => f.value === frequency) || frequencyOptions[0], [frequency]);

  const handleTimeOfDayChange = (time: TimeOfDay) => {
    const isChecked = timesOfDay.includes(time);
    const newTimes = isChecked
      ? timesOfDay.filter(t => t !== time)
      : [...timesOfDay, time];

    if (selectedFrequency.times > 0 && newTimes.length > selectedFrequency.times) {
      return; // Prevent selecting more than allowed
    }
    setTimesOfDay(newTimes);
  };
  
  const handleFrequencyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newFrequency = e.target.value;
    setFrequency(newFrequency);
    // Reset times of day when frequency changes
    const newFreqConfig = frequencyOptions.find(f => f.value === newFrequency);
    if (newFreqConfig && newFreqConfig.times > 0) {
        setTimesOfDay(['Morning']);
    } else {
        setTimesOfDay([]);
    }
  };


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !dosage.trim()) return;

    const schedule: Schedule = {
        frequency,
        timesOfDay
    };

    onAddMedication({ 
      name, 
      dosage, 
      schedule,
      reminderTime: hasReminder ? reminderTime : null 
    });
    // Reset form
    setName('');
    setDosage('');
    setFrequency(frequencyOptions[1].value);
    setTimesOfDay(['Morning']);
    setHasReminder(false);
    setReminderTime('09:00');
    setIsExpanded(false);
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md transition-all duration-300">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 flex justify-between items-center text-left"
      >
        <div className="flex items-center space-x-3">
          <PlusIcon className="h-6 w-6 text-indigo-500" />
          <span className="text-lg font-semibold text-slate-700 dark:text-slate-200">Add New Medication</span>
        </div>
        <ChevronDownIcon className={`h-6 w-6 text-slate-400 transform transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
      </button>

      {isExpanded && (
        <form onSubmit={handleSubmit} className="p-4 border-t border-slate-200 dark:border-slate-700 space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">Medication Name</label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Ibuprofen"
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>
          <div>
            <label htmlFor="dosage" className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">Dosage</label>
            <input
              id="dosage"
              type="text"
              value={dosage}
              onChange={(e) => setDosage(e.target.value)}
              placeholder="e.g., 200mg"
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>
          <div>
            <label htmlFor="schedule" className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">Schedule</label>
            <select
              id="schedule"
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
                  id="reminder"
                  aria-describedby="reminder-description"
                  name="reminder"
                  type="checkbox"
                  checked={hasReminder}
                  onChange={(e) => setHasReminder(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 dark:border-slate-600 text-indigo-600 focus:ring-indigo-600"
                />
              </div>
              <div className="ml-3 text-sm leading-6">
                <label htmlFor="reminder" className="font-medium text-slate-700 dark:text-slate-200">
                  Set a reminder time
                </label>
              </div>
            </div>
            {hasReminder && (
              <div className="pl-7 pt-1">
                 <input
                    id="reminderTime"
                    type="time"
                    value={reminderTime}
                    onChange={(e) => setReminderTime(e.target.value)}
                    className="w-full max-w-xs px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
              </div>
            )}
          </div>
          <button type="submit" className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors">
            Add Medication
          </button>
        </form>
      )}
    </div>
  );
};