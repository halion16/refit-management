'use client';

import {
  BarChart3,
  Building2,
  FolderOpen,
  Users,
  FileText,
  Settings,
  ChevronLeft,
  Home,
  Calendar,
  Camera,
  Euro
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useAppStore, useCurrentView, useSidebarOpen, useSetCurrentView, useToggleSidebar } from '@/store';
import { cn } from '@/lib/utils';

interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  view: string;
  active?: boolean;
  onClick: () => void;
  badge?: number;
}

function SidebarItem({ icon, label, active, onClick, badge }: SidebarItemProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors',
        active
          ? 'bg-blue-100 text-blue-700 border-r-2 border-blue-600'
          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
      )}
    >
      <span className="mr-3">{icon}</span>
      <span className="flex-1 text-left">{label}</span>
      {badge && badge > 0 && (
        <span className="ml-2 px-2 py-1 text-xs bg-red-100 text-red-600 rounded-full">
          {badge > 99 ? '99+' : badge}
        </span>
      )}
    </button>
  );
}

export function Sidebar() {
  const sidebarOpen = useSidebarOpen();
  const currentView = useCurrentView();
  const setCurrentView = useSetCurrentView();
  const toggleSidebar = useToggleSidebar();

  const menuItems = [
    {
      view: 'dashboard',
      icon: <Home className="h-5 w-5" />,
      label: 'Dashboard',
    },
    {
      view: 'locations',
      icon: <Building2 className="h-5 w-5" />,
      label: 'Locations',
    },
    {
      view: 'projects',
      icon: <FolderOpen className="h-5 w-5" />,
      label: 'Progetti',
      badge: 3 // Active projects
    },
    {
      view: 'contractors',
      icon: <Users className="h-5 w-5" />,
      label: 'Fornitori',
    },
    {
      view: 'quotes',
      icon: <Euro className="h-5 w-5" />,
      label: 'Preventivi',
      badge: 2 // Pending quotes
    },
    {
      view: 'calendar',
      icon: <Calendar className="h-5 w-5" />,
      label: 'Calendario',
    },
    {
      view: 'reports',
      icon: <BarChart3 className="h-5 w-5" />,
      label: 'Report',
    },
    {
      view: 'documents',
      icon: <FileText className="h-5 w-5" />,
      label: 'Documenti',
    },
    {
      view: 'photos',
      icon: <Camera className="h-5 w-5" />,
      label: 'Foto',
    }
  ];

  const handleViewChange = (view: string) => {
    setCurrentView(view as any);
  };

  return (
    <>
      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-gray-600 bg-opacity-75 lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          'fixed inset-y-0 left-0 z-30 w-64 bg-white border-r border-gray-200 transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:inset-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo/Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Building2 className="h-5 w-5 text-white" />
              </div>
              <span className="ml-2 text-lg font-semibold text-gray-900">
                Refit Manager
              </span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSidebar}
              className="lg:hidden"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            <div className="mb-4">
              <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Principale
              </h3>
            </div>

            {menuItems.slice(0, 4).map((item) => (
              <SidebarItem
                key={item.view}
                icon={item.icon}
                label={item.label}
                view={item.view}
                active={currentView === item.view}
                onClick={() => handleViewChange(item.view)}
                badge={item.badge}
              />
            ))}

            <div className="mt-8 mb-4">
              <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Gestione
              </h3>
            </div>

            {menuItems.slice(4).map((item) => (
              <SidebarItem
                key={item.view}
                icon={item.icon}
                label={item.label}
                view={item.view}
                active={currentView === item.view}
                onClick={() => handleViewChange(item.view)}
                badge={item.badge}
              />
            ))}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200">
            <Button
              variant="ghost"
              onClick={() => handleViewChange('settings')}
              className={cn(
                'w-full justify-start',
                currentView === 'settings' && 'bg-blue-100 text-blue-700'
              )}
            >
              <Settings className="h-5 w-5 mr-3" />
              Impostazioni
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}