'use client';

import { useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { Dashboard } from '@/components/Dashboard';
import { Locations } from '@/components/Locations';
import { Projects } from '@/components/Projects';
import { Contractors } from '@/components/Contractors';
import Quotes from '@/components/Quotes';
import { Calendar } from '@/components/Calendar';
import { AppointmentList } from '@/components/AppointmentList';
import { TaskBoard } from '@/components/TaskBoard';
import { TeamDirectory } from '@/components/Team/TeamDirectory';
import DataInitializer from '@/components/DataInitializer';
import { useCurrentView, useCurrentUser, useLogin } from '@/store';
import { useHydration } from '@/hooks/useHydration';

export default function Home() {
  const hydrated = useHydration();
  const currentView = useCurrentView();
  const currentUser = useCurrentUser();
  const login = useLogin();

  // Auto-login con utente da dati di esempio
  useEffect(() => {
    if (hydrated && !currentUser) {
      // Prova a caricare l'utente corrente dal localStorage
      const storedUser = localStorage.getItem('refit_current_user');
      if (storedUser) {
        try {
          const user = JSON.parse(storedUser);
          login(user);
        } catch (error) {
          console.error('Errore caricamento utente:', error);
        }
      }
    }
  }, [hydrated, currentUser, login]);

  const renderCurrentView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard />;
      case 'locations':
        return <Locations />;
      case 'projects':
        return <Projects />;
      case 'contractors':
        return <Contractors />;
      case 'team':
        return <TeamDirectory />;
      case 'quotes':
        return <Quotes />;
      case 'calendar':
        return <Calendar />;
      case 'appointments':
        return <AppointmentList />;
      case 'tasks':
        return <TaskBoard />;
      case 'settings':
        return (
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Impostazioni</h1>
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <p className="text-gray-600">Impostazioni in sviluppo...</p>
            </div>
          </div>
        );
      default:
        return <Dashboard />;
    }
  };

  if (!hydrated) {
    return (
      <div className="h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Caricamento...</p>
        </div>
      </div>
    );
  }

  return (
    <Layout>
      <DataInitializer />
      {renderCurrentView()}
    </Layout>
  );
}
