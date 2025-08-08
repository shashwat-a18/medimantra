// Role-based permissions system for MediMitra
export interface Permission {
  resource: string;
  actions: string[];
}

export interface RolePermissions {
  [key: string]: Permission[];
}

// Define comprehensive permissions for each role
export const ROLE_PERMISSIONS: RolePermissions = {
  admin: [
    // User Management
    { resource: 'users', actions: ['create', 'read', 'update', 'delete'] },
    { resource: 'user_profiles', actions: ['create', 'read', 'update', 'delete'] },
    
    // Appointment Management  
    { resource: 'appointments', actions: ['create', 'read', 'update', 'delete', 'approve', 'reject', 'reschedule', 'cancel', 'complete'] },
    { resource: 'appointment_history', actions: ['read'] },
    
    // Inventory Management
    { resource: 'inventory', actions: ['create', 'read', 'update', 'delete', 'reorder', 'adjust_stock'] },
    { resource: 'orders', actions: ['create', 'read', 'update', 'delete', 'approve', 'reject', 'fulfill'] },
    
    // Health Records & Documents
    { resource: 'health_records', actions: ['read', 'update', 'delete'] },
    { resource: 'medical_documents', actions: ['read', 'update', 'delete'] },
    { resource: 'patient_history', actions: ['read'] },
    
    // System Management
    { resource: 'departments', actions: ['create', 'read', 'update', 'delete'] },
    { resource: 'system_settings', actions: ['read', 'update'] },
    { resource: 'reports', actions: ['read', 'generate', 'export'] },
    { resource: 'audit_logs', actions: ['read'] },
    
    // Content Management
    { resource: 'announcements', actions: ['create', 'read', 'update', 'delete'] },
    { resource: 'chatbot_config', actions: ['read', 'update'] }
  ],
  
  doctor: [
    // Patient Management
    { resource: 'patients', actions: ['read', 'update'] },
    { resource: 'patient_history', actions: ['read'] },
    { resource: 'health_records', actions: ['read', 'update', 'create'] },
    { resource: 'medical_documents', actions: ['read', 'create', 'update'] },
    
    // Appointment Management
    { resource: 'appointments', actions: ['read', 'update', 'approve', 'reject', 'reschedule', 'cancel', 'complete'] },
    { resource: 'own_schedule', actions: ['read', 'update'] },
    
    // Medical Operations
    { resource: 'prescriptions', actions: ['create', 'read', 'update'] },
    { resource: 'diagnoses', actions: ['create', 'read', 'update'] },
    { resource: 'lab_results', actions: ['read', 'create', 'update'] },
    
    // Inventory (Limited)
    { resource: 'inventory', actions: ['read'] },
    { resource: 'orders', actions: ['create', 'read'] },
    
    // Communication
    { resource: 'patient_communication', actions: ['create', 'read'] },
    { resource: 'referrals', actions: ['create', 'read', 'update'] }
  ],
  
  patient: [
    // Own Data Management
    { resource: 'own_profile', actions: ['read', 'update'] },
    { resource: 'own_health_records', actions: ['read'] },
    { resource: 'own_appointments', actions: ['create', 'read', 'cancel'] },
    { resource: 'own_prescriptions', actions: ['read'] },
    { resource: 'own_medical_documents', actions: ['read'] },
    
    // Health Management
    { resource: 'health_tracking', actions: ['create', 'read', 'update'] },
    { resource: 'reminders', actions: ['create', 'read', 'update', 'delete'] },
    
    // Orders & Inventory
    { resource: 'medicine_orders', actions: ['create', 'read'] },
    { resource: 'available_medicines', actions: ['read'] },
    
    // Communication
    { resource: 'doctor_communication', actions: ['create', 'read'] },
    { resource: 'health_assistant', actions: ['use'] }
  ]
};

// Permission checking utilities
export const hasPermission = (userRole: string, resource: string, action: string): boolean => {
  const rolePerms = ROLE_PERMISSIONS[userRole?.toLowerCase()];
  if (!rolePerms) return false;
  
  const resourcePerm = rolePerms.find(perm => perm.resource === resource);
  return resourcePerm ? resourcePerm.actions.includes(action) : false;
};

export const getResourcePermissions = (userRole: string, resource: string): string[] => {
  const rolePerms = ROLE_PERMISSIONS[userRole?.toLowerCase()];
  if (!rolePerms) return [];
  
  const resourcePerm = rolePerms.find(perm => perm.resource === resource);
  return resourcePerm ? resourcePerm.actions : [];
};

export const getUserPermissions = (userRole: string): Permission[] => {
  return ROLE_PERMISSIONS[userRole?.toLowerCase()] || [];
};

// Permission-based component wrapper
export const withPermission = (
  Component: React.ComponentType<any>,
  resource: string,
  action: string
) => {
  return (props: any) => {
    const userRole = props.user?.role;
    if (!hasPermission(userRole, resource, action)) {
      return (
        <div className="text-center py-8">
          <div className="text-4xl mb-4 opacity-50">🔒</div>
          <h3 className="text-xl font-semibold text-white mb-2">Access Denied</h3>
          <p className="text-gray-400">You don't have permission to access this resource.</p>
        </div>
      );
    }
    return <Component {...props} />;
  };
};

// Permission hooks for React components
import { useAuth } from '../context/AuthContext';

export const usePermissions = () => {
  const { user } = useAuth();
  
  return {
    hasPermission: (resource: string, action: string) => 
      hasPermission(user?.role || '', resource, action),
    getResourcePermissions: (resource: string) => 
      getResourcePermissions(user?.role || '', resource),
    getUserPermissions: () => getUserPermissions(user?.role || ''),
    userRole: user?.role
  };
};

// UI Permission components
export const PermissionGate: React.FC<{
  resource: string;
  action: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}> = ({ resource, action, children, fallback = null }) => {
  const { hasPermission: checkPermission } = usePermissions();
  
  return checkPermission(resource, action) ? <>{children}</> : <>{fallback}</>;
};

export const RoleGate: React.FC<{
  allowedRoles: string[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}> = ({ allowedRoles, children, fallback = null }) => {
  const { userRole } = usePermissions();
  
  return allowedRoles.includes(userRole?.toLowerCase() || '') ? <>{children}</> : <>{fallback}</>;
};

// Admin-specific utilities
export const isAdmin = (userRole: string): boolean => {
  return userRole?.toLowerCase() === 'admin';
};

export const isDoctor = (userRole: string): boolean => {
  return userRole?.toLowerCase() === 'doctor';
};

export const isPatient = (userRole: string): boolean => {
  return userRole?.toLowerCase() === 'patient';
};

// Role-based navigation items
export const getNavigationItems = (userRole: string) => {
  const role = userRole?.toLowerCase();
  
  const navigationMap: { [key: string]: Array<{ href: string; label: string; icon: string }> } = {
    admin: [
      { href: '/dashboard', label: 'Dashboard', icon: '🏠' },
      { href: '/admin/users', label: 'User Management', icon: '👥' },
      { href: '/admin/appointments', label: 'All Appointments', icon: '📅' },
      { href: '/admin/inventory', label: 'Inventory Control', icon: '📦' },
      { href: '/admin/reports', label: 'Analytics', icon: '📊' },
      { href: '/admin/departments', label: 'Departments', icon: '🏢' },
      { href: '/admin/settings', label: 'System Settings', icon: '⚙️' },
      { href: '/chatbot', label: 'AI Assistant', icon: '🤖' }
    ],
    doctor: [
      { href: '/dashboard', label: 'Dashboard', icon: '🏠' },
      { href: '/doctor/patients', label: 'My Patients', icon: '👥' },
      { href: '/doctor/appointments', label: 'Appointments', icon: '📅' },
      { href: '/doctor/prescriptions', label: 'Prescriptions', icon: '💊' },
      { href: '/doctor/schedule', label: 'Schedule', icon: '🗓️' },
      { href: '/ehr', label: 'Health Records', icon: '📋' },
      { href: '/orders', label: 'Order Supplies', icon: '🛒' },
      { href: '/chatbot', label: 'AI Assistant', icon: '🤖' }
    ],
    patient: [
      { href: '/dashboard', label: 'Dashboard', icon: '🏠' },
      { href: '/appointments', label: 'My Appointments', icon: '📅' },
      { href: '/health/tracking', label: 'Health Tracking', icon: '💊' },
      { href: '/orders', label: 'Medicine Orders', icon: '🛒' },
      { href: '/reminders', label: 'Health Reminders', icon: '⏰' },
      { href: '/ehr', label: 'Medical Records', icon: '📋' },
      { href: '/chatbot', label: 'AI Assistant', icon: '🤖' }
    ]
  };
  
  return navigationMap[role] || [];
};

export default {
  ROLE_PERMISSIONS,
  hasPermission,
  getResourcePermissions,
  getUserPermissions,
  usePermissions,
  PermissionGate,
  RoleGate,
  isAdmin,
  isDoctor,
  isPatient,
  getNavigationItems
};
