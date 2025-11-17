
import React from 'react';
import { Medication } from '../types';
import { XIcon, InfoIcon } from './Icons';

interface MedicationInfoModalProps {
  medication: Medication;
  content: string;
  isLoading: boolean;
  error: string;
  onClose: () => void;
}

export const MedicationInfoModal: React.FC<MedicationInfoModalProps> = ({ medication, content, isLoading, error, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" aria-modal="true" role="dialog">
      <div className="relative bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-md m-4 transform transition-all">
        <div className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <InfoIcon className="h-6 w-6 text-indigo-500" />
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{medication.name}</h3>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-full text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              aria-label="Close modal"
            >
              <XIcon className="h-6 w-6" />
            </button>
          </div>
          <div className="mt-4 text-sm text-slate-600 dark:text-slate-300 min-h-[100px]">
            {isLoading && (
              <div className="flex justify-center items-center h-full">
                 <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
              </div>
            )}
            {error && <p className="text-red-500">{error}</p>}
            {!isLoading && !error && content && (
                <p>{content}</p>
            )}
          </div>
          <p className="mt-4 text-xs text-slate-400 dark:text-slate-500">
            Information provided by Gemini. This is not medical advice. Always consult with a healthcare professional.
          </p>
        </div>
      </div>
    </div>
  );
};
