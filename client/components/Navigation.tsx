import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/router';

interface NavigationProps {
  variant?: 'default' | 'dashboard';
}

export default function Navigation({ variant = 'default' }: NavigationProps) {
  const { user, logout, isAuthenticated } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  // For dashboard pages, return null as sidebar handles navigation
  if (variant === 'dashboard' && isAuthenticated) {
    return null;
  }

  return (
    <nav className="bg-slate-800/90 backdrop-blur-xl border-b border-slate-700 shadow-2xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-6">
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <img src="/logo.svg" alt="MediMitra" className="h-8 w-8 mr-3" />
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">MediMitra</h1>
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <Link href="/dashboard" className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-lg transition-all duration-200">
                  Dashboard
                </Link>
                <button onClick={handleLogout} className="px-4 py-2 text-sm font-medium bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white rounded-lg transition-all">
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-lg transition-all duration-200">
                  Login
                </Link>
                <Link href="/register" className="px-4 py-2 text-sm font-medium bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700 text-white rounded-lg transition-all">
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
