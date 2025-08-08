import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/router';
import Link from 'next/link';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { isAuthenticated, user, logout } = useAuth();
  const router = useRouter();

  // Pages that have their own navigation and don't need the Navigation component
  const pagesWithOwnNavigation = [
    '/',
    '/login',
    '/register'
  ];

  const hasOwnNavigation = pagesWithOwnNavigation.includes(router.pathname);

  // For pages with their own navigation (landing, login, register), just render children
  if (hasOwnNavigation) {
    return <main>{children}</main>;
  }

  // For other pages, use simplified layout without sidebar
  return (
    <div className="min-h-screen bg-slate-900">
      {/* Top Navigation */}
      <nav className="bg-slate-800 border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard" className="text-2xl font-bold text-white hover:text-blue-400">
                MediMitra
              </Link>
              <div className="hidden md:block">
                <div className="ml-4 flex items-baseline space-x-4">
                  {user?.role === 'admin' && (
                    <>
                      <Link href="/dashboard" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
                        Dashboard
                      </Link>
                      <Link href="/admin/users" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
                        Users
                      </Link>
                      <Link href="/admin/inventory" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
                        Inventory
                      </Link>
                      <Link href="/admin/reports" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
                        Reports
                      </Link>
                      <Link href="/admin/chatbot" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
                        AI Assistant
                      </Link>
                    </>
                  )}
                  {user?.role === 'doctor' && (
                    <>
                      <Link href="/dashboard" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
                        Dashboard
                      </Link>
                      <Link href="/doctor/patients" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
                        Patients
                      </Link>
                      <Link href="/doctor/appointments" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
                        Appointments
                      </Link>
                      <Link href="/chatbot" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
                        AI Assistant
                      </Link>
                    </>
                  )}
                  {user?.role === 'patient' && (
                    <>
                      <Link href="/dashboard" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
                        Dashboard
                      </Link>
                      <Link href="/appointments" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
                        Appointments
                      </Link>
                      <Link href="/orders" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
                        Orders
                      </Link>
                      <Link href="/reminders" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
                        Reminders
                      </Link>
                      <Link href="/chatbot" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
                        AI Assistant
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-gray-300 text-sm">
                Welcome, {user?.name}
              </span>
              <button
                onClick={() => {
                  logout();
                  router.push('/');
                }}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>
      
      {/* Page Content */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}
