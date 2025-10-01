'use client';

import { Bell, Menu, Search, Settings, User, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useAppStore, useCurrentUser, useToggleSidebar, useSetSearchQuery, useLogout } from '@/store';
import { useState } from 'react';
import { useNotifications } from '@/hooks/useNotifications';
import { NotificationCenter } from '@/components/Notifications/NotificationCenter';

export function Header() {
  const currentUser = useCurrentUser();
  const { sidebarOpen, searchQuery } = useAppStore();
  const toggleSidebar = useToggleSidebar();
  const setSearchQuery = useSetSearchQuery();
  const logout = useLogout();
  const { unreadCount } = useNotifications();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
  };

  return (
    <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
      {/* Left Section */}
      <div className="flex items-center space-x-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </Button>

        <div className="hidden lg:block">
          <h1 className="text-xl font-semibold text-gray-900">
            Bds Project Manager
          </h1>
        </div>
      </div>

      {/* Center Section - Search */}
      <div className="flex-1 max-w-md mx-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Cerca progetti, punti vendita, fornitori..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={searchQuery}
            onChange={handleSearch}
          />
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center space-x-2">
        {/* Notifications */}
        <div className="relative">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 rounded-full flex items-center justify-center animate-pulse">
                <span className="text-xs text-white font-semibold">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
                <span className="absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75 animate-ping"></span>
              </span>
            )}
          </Button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 z-50">
              <NotificationCenter onClose={() => setShowNotifications(false)} />
            </div>
          )}
        </div>

        {/* User Menu */}
        <div className="relative">
          <Button
            variant="ghost"
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center space-x-2"
          >
            <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
              {currentUser ? (
                <span className="text-sm font-medium text-blue-600">
                  {currentUser.firstName[0]}{currentUser.lastName[0]}
                </span>
              ) : (
                <User className="h-4 w-4 text-blue-600" />
              )}
            </div>
            <div className="hidden md:block text-left">
              <div className="text-sm font-medium text-gray-900">
                {currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : 'Utente'}
              </div>
              <div className="text-xs text-gray-500">
                {currentUser?.role || 'Guest'}
              </div>
            </div>
          </Button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-50">
              <div className="p-2">
                <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded flex items-center space-x-2">
                  <User className="h-4 w-4" />
                  <span>Profilo</span>
                </button>
                <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded flex items-center space-x-2">
                  <Settings className="h-4 w-4" />
                  <span>Impostazioni</span>
                </button>
                <hr className="my-2" />
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded flex items-center space-x-2"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}