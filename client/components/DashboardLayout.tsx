import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/router';
import Sidebar from './Sidebar';
import Navigation from './Navigation';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  // Check if current page should use dashboard layout
  const dashboardPages = [
    '/dashboard',
    '/health/tracking',
    '/health/predict',
    '/appointments',
    '/reminders',
    '/ehr/upload',
    '/chatbot',
    '/admin',
    '/doctor'
  ];

  // Pages that have their own navigation and don't need the Navigation component
  const pagesWithOwnNavigation = [
    '/',
    '/login',
    '/register'
  ];

  const isDashboardPage = dashboardPages.some(page => 
    router.pathname.startsWith(page)
  );

  const hasOwnNavigation = pagesWithOwnNavigation.includes(router.pathname);

  // For pages with their own navigation (landing, login, register), just render children
  if (hasOwnNavigation) {
    return <main>{children}</main>;
  }

  // For authenticated dashboard pages, use full dashboard layout
  if (isAuthenticated && isDashboardPage) {
    // Continue to dashboard layout below
  } else {
    // For other authenticated pages or pages that need navigation
    return (
      <>
        <Navigation variant="default" />
        <main>{children}</main>
      </>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden transition-all duration-300 ml-16 lg:ml-64">
        {/* Top Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="px-6 py-4">
            <h1 className="text-2xl font-semibold text-gray-800">
              {getPageTitle(router.pathname)}
            </h1>
          </div>
        </header>
        
        {/* Page Content */}
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

function getPageTitle(pathname: string): string {
  const titles: { [key: string]: string } = {
    '/dashboard': 'Dashboard',
    '/health/tracking': 'Health Tracking',
    '/health/predict': 'AI Predictions',
    '/appointments': 'My Appointments',
    '/reminders': 'Reminders',
    '/ehr/upload': 'Documents',
    '/chatbot': 'AI Assistant',
    '/admin': 'Admin Panel',
    '/doctor': 'Doctor Portal'
  };

  return titles[pathname] || 'MediMitra';
}
