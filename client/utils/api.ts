// API Configuration for MediMantra Pro
// Uses environment variables for consistent configuration across environments

// Environment variables with fallbacks
const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
  ML_SERVER_URL: process.env.NEXT_PUBLIC_ML_SERVER_URL || 'http://localhost:8000',
  APP_NAME: process.env.NEXT_PUBLIC_APP_NAME || 'MediMantra Pro',
  APP_VERSION: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
  ENABLE_CHATBOT: process.env.NEXT_PUBLIC_ENABLE_CHATBOT === 'true',
  ENABLE_NOTIFICATIONS: process.env.NEXT_PUBLIC_ENABLE_NOTIFICATIONS === 'true',
  ENABLE_ANALYTICS: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === 'true',
  MAX_FILE_SIZE: parseInt(process.env.NEXT_PUBLIC_MAX_FILE_SIZE || '10485760'),
  ALLOWED_FILE_TYPES: (process.env.NEXT_PUBLIC_ALLOWED_FILE_TYPES || 'pdf,doc,docx,jpg,jpeg,png').split(','),
  SESSION_TIMEOUT: parseInt(process.env.NEXT_PUBLIC_SESSION_TIMEOUT || '3600000'),
  TIMEOUT: 10000,
} as const;

// API request headers
const createApiHeaders = (token?: string) => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-App-Version': API_CONFIG.APP_VERSION,
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
};

// Create API URL helper
const createApiUrl = (endpoint: string): string => {
  const baseUrl = API_CONFIG.BASE_URL.replace(/\/$/, '');
  const cleanEndpoint = endpoint.replace(/^\//, '');
  return `${baseUrl}/${cleanEndpoint}`;
};

// Create ML Server URL helper
const createMlUrl = (endpoint: string): string => {
  const baseUrl = API_CONFIG.ML_SERVER_URL.replace(/\/$/, '');
  const cleanEndpoint = endpoint.replace(/^\//, '');
  return `${baseUrl}/${cleanEndpoint}`;
};

// File validation helper
const validateFile = (file: File): { valid: boolean; error?: string } => {
  // Check file size
  if (file.size > API_CONFIG.MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File size exceeds ${(API_CONFIG.MAX_FILE_SIZE / 1024 / 1024).toFixed(1)}MB limit`
    };
  }
  
  // Check file type
  const fileExtension = file.name.split('.').pop()?.toLowerCase() || '';
  if (!API_CONFIG.ALLOWED_FILE_TYPES.includes(fileExtension)) {
    return {
      valid: false,
      error: `File type .${fileExtension} not allowed. Allowed types: ${API_CONFIG.ALLOWED_FILE_TYPES.join(', ')}`
    };
  }
  
  return { valid: true };
};

// Session management
const isSessionExpired = (lastActivity: number): boolean => {
  return Date.now() - lastActivity > API_CONFIG.SESSION_TIMEOUT;
};

// Generic API request wrapper with error handling
const apiRequest = async <T = any>(
  url: string,
  options: RequestInit = {}
): Promise<T> => {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API Request Error:', error);
    throw error;
  }
};

// Authenticated API request wrapper
const authenticatedRequest = async <T = any>(
  endpoint: string,
  options: RequestInit = {},
  token?: string
): Promise<T> => {
  const url = createApiUrl(endpoint);
  const headers = createApiHeaders(token);
  
  return apiRequest<T>(url, {
    ...options,
    headers: {
      ...headers,
      ...options.headers,
    },
  });
};

// Export configuration and utilities
export {
  API_CONFIG,
  createApiHeaders,
  createApiUrl,
  createMlUrl,
  validateFile,
  isSessionExpired,
  apiRequest,
  authenticatedRequest,
};

export default API_CONFIG;
