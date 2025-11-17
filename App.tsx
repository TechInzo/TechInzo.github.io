
import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { AddMedicationForm } from './components/AddMedicationForm';
import { MedicationList } from './components/MedicationList';
import { HistoryLog } from './components/HistoryLog';
import { Medication, Dose, Schedule } from './types';
import { useLocalStorage } from './hooks/useLocalStorage';
import { PillIcon, SunIcon, SunsetIcon, MoonIcon } from './components/Icons';
import { getMedicationInfo } from './services/geminiService';
import { MedicationInfoModal } from './components/MedicationInfoModal';
import { useReminders } from './hooks/useReminders';
import { EditMedicationModal } from './components/EditMedicationModal';

type TimeFilter = 'All' | 'Morning' | 'Afternoon' | 'Evening';

const App: React.FC = () => {
  const [rawMedications, setRawMedications] = useLocalStorage<Medication[]>('medications', []);
  const [doseHistory, setDoseHistory] = useLocalStorage<Dose[]>('doseHistory', []);
  
  const [isInfoModalOpen, setInfoModalOpen] = useState(false);
  const [selectedMedForInfo, setSelectedMedForInfo] = useState<Medication | null>(null);
  const [medInfoContent, setMedInfoContent] = useState<string>('');
  const [isLoadingInfo, setIsLoadingInfo] = useState<boolean>(false);
  const [infoError, setInfoError] = useState<string>('');

  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [selectedMedForEdit, setSelectedMedForEdit] = useState<Medication | null>(null);

  const [activeFilter, setActiveFilter] = useState<TimeFilter>('All');

  // Migrate old data structure
  const medications: Medication[] = useMemo(() => {
    return rawMedications.map((med: any) => {
      if (typeof med.schedule === 'string') {
        return {
          ...med,
          schedule: {
            frequency: med.schedule,
            timesOfDay: [],
          },
        };
      }
      return med;
    });
  }, [rawMedications]);

  const setMedications = (meds: Medication[]) => {
    setRawMedications(meds);
  };

  useReminders(medications, doseHistory);

  const addMedication = (med: Omit<Medication, 'id'>) => {
    const newMed: Medication = { ...med, id: crypto.randomUUID() };
    setMedications([...medications, newMed]);
  };

  const takeDose = useCallback((medicationId: string) => {
    const med = medications.find(m => m.id === medicationId);
    if (med) {
      const newDose: Dose = {
        id: crypto.randomUUID(),
        medicationId: med.id,
        medicationName: med.name,
        dosage: med.dosage,
        timestamp: new Date(),
      };
      setDoseHistory(prevHistory => [newDose, ...prevHistory]);
    }
  }, [medications, setDoseHistory]);

  const handleShowInfo = async (med: Medication) => {
    setSelectedMedForInfo(med);
    setInfoModalOpen(true);
    setIsLoadingInfo(true);
    setInfoError('');
    setMedInfoContent('');

    try {
      const info = await getMedicationInfo(med.name);
      setMedInfoContent(info);
    } catch (error) {
      console.error("Failed to get medication info:", error);
      setInfoError("Sorry, we couldn't fetch information for this medication. Please try again later.");
    } finally {
      setIsLoadingInfo(false);
    }
  };

  const closeInfoModal = () => {
    setInfoModalOpen(false);
    setSelectedMedForInfo(null);
    setMedInfoContent('');
    setInfoError('');
  };
  
  const handleEdit = (med: Medication) => {
    setSelectedMedForEdit(med);
    setEditModalOpen(true);
  };

  const handleUpdateMedication = (updatedMed: Medication) => {
    setMedications(medications.map(med => med.id === updatedMed.id ? updatedMed : med));
    setEditModalOpen(false);
    setSelectedMedForEdit(null);
  };

  const handleDeleteMedication = (medicationId: string) => {
    const medToDelete = medications.find(m => m.id === medicationId);
    if (!medToDelete) return;

    if (window.confirm(`Are you sure you want to delete ${medToDelete.name}? This action cannot be undone.`)) {
      setMedications(medications.filter(med => med.id !== medicationId));
      setDoseHistory(prevHistory => prevHistory.filter(dose => dose.medicationId !== medicationId));
    }
  };

  const closeEditModal = () => {
    setEditModalOpen(false);
    setSelectedMedForEdit(null);
  };
  
  const filteredMedications = useMemo(() => {
    if (activeFilter === 'All') {
      return medications;
    }
    return medications.filter(med => {
      // New filtering logic based on structured schedule
      if (med.schedule && med.schedule.timesOfDay) {
         return med.schedule.timesOfDay.includes(activeFilter);
      }
      
      // Fallback for any old data or reminders set without timesOfDay
      if (!med.reminderTime) return false;
      const [hour] = med.reminderTime.split(':').map(Number);
      if (activeFilter === 'Morning') return hour < 12;
      if (activeFilter === 'Afternoon') return hour >= 12 && hour < 17;
      if (activeFilter === 'Evening') return hour >= 17;

      return false;
    });
  }, [medications, activeFilter]);

  const filterButtons: { label: TimeFilter; icon: React.ReactNode }[] = [
    { label: 'Morning', icon: <SunIcon className="h-5 w-5 mr-2" /> },
    { label: 'Afternoon', icon: <SunsetIcon className="h-5 w-5 mr-2" /> },
    { label: 'Evening', icon: <MoonIcon className="h-5 w-5 mr-2" /> },
  ];
  
  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-200 font-sans flex flex-col">
      <header className="bg-white dark:bg-slate-800 shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <PillIcon className="h-8 w-8 text-indigo-500" />
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">PillPal</h1>
          </div>
          <span className="text-sm text-slate-500 dark:text-slate-400">Your Personal Medicine Tracker</span>
        </div>
      </header>

      <main className="container mx-auto p-4 sm:p-6 lg:p-8 flex-grow">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <AddMedicationForm onAddMedication={addMedication} />
            
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                 <button
                    onClick={() => setActiveFilter('All')}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      activeFilter === 'All'
                        ? 'bg-indigo-600 text-white shadow motion-safe:animate-pulse-glow'
                        : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                    }`}
                  >
                    All
                  </button>
                {filterButtons.map(({ label, icon }) => (
                  <button
                    key={label}
                    onClick={() => setActiveFilter(label)}
                    className={`flex items-center px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      activeFilter === label
                        ? 'bg-indigo-600 text-white shadow motion-safe:animate-pulse-glow'
                        : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                    }`}
                  >
                    {icon}
                    {label}
                  </button>
                ))}
              </div>

              <MedicationList 
                medications={filteredMedications} 
                onTakeDose={takeDose} 
                onShowInfo={handleShowInfo} 
                onEdit={handleEdit}
                onDelete={handleDeleteMedication}
              />
            </div>

          </div>
          <div className="lg:col-span-1">
            <HistoryLog history={doseHistory} />
          </div>
        </div>
      </main>

      {isInfoModalOpen && selectedMedForInfo && (
        <MedicationInfoModal
          medication={selectedMedForInfo}
          content={medInfoContent}
          isLoading={isLoadingInfo}
          error={infoError}
          onClose={closeInfoModal}
        />
      )}

      {isEditModalOpen && selectedMedForEdit && (
        <EditMedicationModal
          medication={selectedMedForEdit}
          onUpdate={handleUpdateMedication}
          onClose={closeEditModal}
          onDelete={handleDeleteMedication}
        />
      )}

      <footer className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center text-sm text-slate-500 dark:text-slate-400">
        <p>
          PillPal: Your Personal Medicine Tracker.
          {' '}
          <a 
            href="https://github.com/google-gemini/pillpal-react-example" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
          >
            View on GitHub
          </a>
        </p>
      </footer>
    </div>
  );
};

export default App;
