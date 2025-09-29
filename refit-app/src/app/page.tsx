'use client';

import { useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { Dashboard } from '@/components/Dashboard';
import { Locations } from '@/components/Locations';
import { Projects } from '@/components/Projects';
import { Contractors } from '@/components/Contractors';
import Quotes from '@/components/Quotes';
import { useCurrentView, useCurrentUser, useLogin } from '@/store';
import { useHydration } from '@/hooks/useHydration';

export default function Home() {
  const hydrated = useHydration();
  const currentView = useCurrentView();
  const currentUser = useCurrentUser();
  const login = useLogin();

  // Auto-login for demo purposes
  useEffect(() => {
    if (hydrated && !currentUser) {
      const demoUser = {
        id: 'demo-user-1',
        firstName: 'Mario',
        lastName: 'Rossi',
        email: 'mario.rossi@company.com',
        role: 'project_manager' as const,
        permissions: [
          { resource: 'projects', actions: ['create', 'read', 'update', 'delete'] },
          { resource: 'stores', actions: ['create', 'read', 'update', 'delete'] },
          { resource: 'contractors', actions: ['create', 'read', 'update', 'delete'] },
          { resource: 'quotes', actions: ['create', 'read', 'update', 'delete'] }
        ],
        department: 'Operations',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      login(demoUser);
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
      case 'quotes':
        return <Quotes />;
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
      {renderCurrentView()}
    </Layout>
  );
}
