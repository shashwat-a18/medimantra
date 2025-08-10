'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { API_CONFIG, createApiUrl, createApiHeaders } from '../utils/api';

// User interface
interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'doctor' | 'patient';
  profileImage?: string;
}

// Auth context interface
interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
}

// Registration data interface
interface RegisterData {
  name: string;
  email: string;
  password: string;
  role: 'patient' | 'doctor';
}

// Default context value for SSR
const defaultAuthContext: AuthContextType = {
  user: null,
  token: null,
  loading: true,
  isAuthenticated: false,
  login: async () => {
    throw new Error('AuthProvider not initialized');
  },
  register: async () => {
    throw new Error('AuthProvider not initialized');
  },
  logout: () => {
    throw new Error('AuthProvider not initialized');
  },
  updateUser: () => {
    throw new Error('AuthProvider not initialized');
  },
};

// Create context with default values
const AuthContext = createContext<AuthContextType>(defaultAuthContext);

// Storage keys
const TOKEN_KEY = 'medimitra_token';
const USER_KEY = 'medimitra_user';
const LAST_ACTIVITY_KEY = 'medimitra_last_activity';

// Auth provider component
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);

  // Set client-side flag
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Initialize auth state from localStorage
  useEffect(() => {
    if (!isClient) {
      return;
    }

    const initAuth = () => {
      try {
        const storedToken = localStorage.getItem(TOKEN_KEY);
        const storedUser = localStorage.getItem(USER_KEY);
        const lastActivity = localStorage.getItem(LAST_ACTIVITY_KEY);

        if (storedToken && storedUser && lastActivity) {
          // Check if session is expired
          const isExpired = Date.now() - parseInt(lastActivity) > API_CONFIG.SESSION_TIMEOUT;
          
          if (isExpired) {
            // Session expired, clear storage
            localStorage.removeItem(TOKEN_KEY);
            localStorage.removeItem(USER_KEY);
            localStorage.removeItem(LAST_ACTIVITY_KEY);
          } else {
            const parsedUser = JSON.parse(storedUser);
            setUser(parsedUser);
            setToken(storedToken);
            updateLastActivity();
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
        localStorage.removeItem(LAST_ACTIVITY_KEY);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, [isClient]);

  // Update last activity timestamp
  const updateLastActivity = () => {
    if (isClient) {
      localStorage.setItem(LAST_ACTIVITY_KEY, Date.now().toString());
    }
  };

  // Login function
  const login = async (email: string, password: string): Promise<void> => {
    try {
      setIsLoading(true);

      const response = await fetch(createApiUrl('/auth/login'), {
        method: 'POST',
        headers: createApiHeaders(),
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Login failed');
      }

      const data = await response.json();
      
      if (data.success && data.token && data.user) {
        const { token: newToken, user: newUser } = data;
        
        setToken(newToken);
        setUser(newUser);
        
        if (isClient) {
          localStorage.setItem(TOKEN_KEY, newToken);
          localStorage.setItem(USER_KEY, JSON.stringify(newUser));
          updateLastActivity();
        }
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Register function
  const register = async (userData: RegisterData): Promise<void> => {
    try {
      setIsLoading(true);

      const response = await fetch(createApiUrl('/auth/register'), {
        method: 'POST',
        headers: createApiHeaders(),
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Registration failed');
      }

      const data = await response.json();
      
      if (data.success && data.token && data.user) {
        const { token: newToken, user: newUser } = data;
        
        setToken(newToken);
        setUser(newUser);

        if (isClient) {
          localStorage.setItem(TOKEN_KEY, newToken);
          localStorage.setItem(USER_KEY, JSON.stringify(newUser));
          updateLastActivity();
        }
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    setUser(null);
    setToken(null);
    
    if (isClient) {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      localStorage.removeItem(LAST_ACTIVITY_KEY);
    }
  };

  // Update user data
  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      
      if (isClient) {
        localStorage.setItem(USER_KEY, JSON.stringify(updatedUser));
      }
    }
  };

  // Check authentication status
  const isAuthenticated = !!(user && token);

  const value: AuthContextType = {
    user,
    token,
    loading: isClient ? isLoading : true,
    isAuthenticated,
    login,
    register,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  
  // Handle SSR case
  if (typeof window === 'undefined') {
    return defaultAuthContext;
  }
  
  return context;
};

export default AuthContext;
