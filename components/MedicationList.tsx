import React from 'react';
import { Medication } from '../types';
import { MedicationItem } from './MedicationItem';

interface MedicationListProps {
  medications: Medication[];
  onTakeDose: (medicationId: string) => void;
  onShowInfo: (medication: Medication) => void;
  onEdit: (medication: Medication) => void;
  onDelete: (medicationId: string) => void;
}

export const MedicationList: React.FC<MedicationListProps> = ({ medications, onTakeDose, onShowInfo, onEdit, onDelete }) => {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md">
      <div className="p-4 border-b border-slate-200 dark:border-slate-700">
        <h2 className="text-lg font-semibold text-slate-700 dark:text-slate-200">My Medications</h2>
      </div>
      <div className="divide-y divide-slate-200 dark:divide-slate-700">
        {medications.length === 0 ? (
          <p className="text-center text-slate-500 dark:text-slate-400 py-8 px-4">You haven't added any medications yet. Click "Add New Medication" to get started.</p>
        ) : (
          medications.map((med) => (
            <MedicationItem key={med.id} medication={med} onTakeDose={onTakeDose} onShowInfo={onShowInfo} onEdit={onEdit} onDelete={onDelete} />
          ))
        )}
      </div>
    </div>
  );
};