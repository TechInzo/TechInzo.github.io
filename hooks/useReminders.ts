import { useEffect } from 'react';
import { Medication, Dose } from '../types';

const NOTIFICATION_PERMISSION_KEY = 'notification_permission';

export const useReminders = (medications: Medication[], doseHistory: Dose[]) => {
  useEffect(() => {
    const checkAndRequestPermission = async () => {
      if ('Notification' in window) {
        const storedPermission = localStorage.getItem(NOTIFICATION_PERMISSION_KEY);
        if (!storedPermission && Notification.permission === 'default') {
          const permission = await Notification.requestPermission();
          localStorage.setItem(NOTIFICATION_PERMISSION_KEY, permission);
        }
      }
    };
    checkAndRequestPermission();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (Notification.permission !== 'granted') {
        return;
      }

      const now = new Date();
      const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      const todayStr = now.toISOString().split('T')[0];
      
      medications.forEach(med => {
        if (med.reminderTime && med.reminderTime === currentTime) {

          const todayReminderTime = new Date(`${todayStr}T${med.reminderTime}`);
          const yesterdayReminderTime = new Date(todayReminderTime);
          yesterdayReminderTime.setDate(yesterdayReminderTime.getDate() - 1);

          const takenSinceLastReminder = doseHistory.some(dose => 
            dose.medicationId === med.id && new Date(dose.timestamp) > yesterdayReminderTime
          );

          if (!takenSinceLastReminder) {
            new Notification('Time for your medication!', {
              body: `It's time to take your ${med.name} (${med.dosage}).`,
              icon: 'assets/icon-192.svg',
              tag: med.id, // Use tag to prevent multiple notifications for the same med if interval runs fast
            });
          }
        }
      });
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [medications, doseHistory]);
};