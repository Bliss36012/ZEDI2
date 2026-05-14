/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { PatientManagement } from './components/PatientManagement';
import { BookingManagement } from './components/BookingManagement';
import { ReminderManagement } from './components/ReminderManagement';
import { Analytics } from './components/Analytics';
import { Login } from './components/Login';
import { Patient, Booking, Reminder } from './types';
import { storage } from './lib/storage';
import { motion, AnimatePresence } from 'motion/react';
import { usePWA } from './hooks/usePWA';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [patients, setPatients] = useState<Patient[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<{ fullName: string; username: string } | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { isOnline, installPrompt, installApp } = usePWA();

  // Load data on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const [p, b, r] = await Promise.all([
          storage.getPatients(),
          storage.getBookings(),
          storage.getReminders(),
        ]);
        setPatients(p);
        setBookings(b);
        setReminders(r);
      } catch (error) {
        console.error("Failed to load initial data:", error);
      } finally {
        const savedUser = localStorage.getItem('siha_angavu_user');
        if (savedUser) {
          setUser(JSON.parse(savedUser));
        }
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const handleLogin = (userData: { fullName: string; username: string }) => {
    setUser(userData);
    localStorage.setItem('siha_angavu_user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('siha_angavu_user');
  };

  // Persistence effects
  useEffect(() => {
    if (!isLoading) storage.savePatients(patients);
  }, [patients, isLoading]);

  useEffect(() => {
    if (!isLoading) storage.saveBookings(bookings);
  }, [bookings, isLoading]);

  useEffect(() => {
    if (!isLoading) storage.saveReminders(reminders);
  }, [reminders, isLoading]);

  const handleAddPatient = (patient: Patient) => {
    setPatients(prev => [patient, ...prev]);
  };

  const handleUpdatePatient = (updatedPatient: Patient) => {
    setPatients(prev => prev.map(p => p.id === updatedPatient.id ? updatedPatient : p));
  };

  const handleAddBooking = (booking: Booking) => {
    setBookings(prev => [booking, ...prev]);
  };

  const handleUpdateBooking = (updatedBooking: Booking) => {
    setBookings(prev => prev.map(b => b.id === updatedBooking.id ? updatedBooking : b));
  };

  const handleAddReminder = (reminder: Reminder) => {
    setReminders(prev => [reminder, ...prev]);
  };

  const handleUpdateReminder = (updatedReminder: Reminder) => {
    setReminders(prev => prev.map(r => r.id === updatedReminder.id ? updatedReminder : r));
  };

  const handleDeleteReminder = (id: string) => {
    setReminders(prev => prev.filter(r => r.id !== id));
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard patients={patients} bookings={bookings} reminders={reminders} />;
      case 'patients':
        return <PatientManagement patients={patients} onAddPatient={handleAddPatient} onUpdatePatient={handleUpdatePatient} />;
      case 'bookings':
        return <BookingManagement bookings={bookings} patients={patients} onAddBooking={handleAddBooking} onUpdateBooking={handleUpdateBooking} />;
      case 'analytics':
        return <Analytics patients={patients} bookings={bookings} reminders={reminders} />;
      case 'reminders':
        return <ReminderManagement reminders={reminders} onAddReminder={handleAddReminder} onUpdateReminder={handleUpdateReminder} onDeleteReminder={handleDeleteReminder} />;
      default:
        return <Dashboard patients={patients} bookings={bookings} reminders={reminders} />;
    }
  };

  if (isLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary-soft border-t-primary-deep rounded-full animate-spin" />
          <p className="text-slate-500 font-medium">Loading Serenity...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-slate-50">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onLogout={handleLogout} 
        username={user.fullName} 
        isOnline={isOnline}
        canInstall={!!installPrompt}
        onInstall={installApp}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
      
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        <header className="lg:hidden flex items-center justify-between p-4 bg-white border-b border-slate-200 sticky top-0 z-30">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary-deep rounded-lg flex items-center justify-center text-white font-serif text-xl">S</div>
            <span className="font-bold text-slate-900">Siha Angavu</span>
          </div>
          <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(true)}>
            <Menu className="w-6 h-6" />
          </Button>
        </header>

        <main className="flex-1 p-4 md:p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {renderContent()}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  );
}

