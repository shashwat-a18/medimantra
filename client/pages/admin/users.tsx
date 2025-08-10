import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { usePermissions, PermissionGate } from '../../utils/permissions';

interface User {
  _id: string;
  name: string;
  email: string;
  role: 'admin' | 'doctor' | 'patient';
  isActive: boolean;
  profile?: {
    phone?: string;
    address?: string;
    dateOfBirth?: string;
    gender?: string;
    specialization?: string; // for doctors
    licenseNumber?: string; // for doctors
    department?: string; // for doctors
  };
  createdAt: string;
  updatedAt: string;
  lastLogin?: string;
}

interface UserStats {
  total: number;
  admins: number;
  doctors: number;
  patients: number;
  active: number;
  inactive: number;
}

export default function AdminUsers() {
  const { user, isAuthenticated, loading, logout } = useAuth();
  const { hasPermission } = usePermissions();
  const router = useRouter();
  
  const [users, setUsers] = useState<User[]>([
    {
      _id: '1',
      name: 'Dr. Priya Sharma',
      email: 'priya.sharma@hospital.com',
      role: 'doctor',
      isActive: true,
      profile: {
        phone: '+91-9876543210',
        specialization: 'Cardiology',
        licenseNumber: 'MED12345',
        department: 'Cardiology',
        gender: 'female'
      },
      createdAt: '2025-01-15T10:00:00Z',
      updatedAt: '2025-08-07T14:30:00Z',
      lastLogin: '2025-08-08T08:30:00Z'
    },
    {
      _id: '2',
      name: 'Rajesh Kumar',
      email: 'rajesh@email.com',
      role: 'patient',
      isActive: true,
      profile: {
        phone: '+91-9876543211',
        dateOfBirth: '1985-05-20',
        gender: 'male',
        address: '123 Main Street, Delhi'
      },
      createdAt: '2025-02-20T10:00:00Z',
      updatedAt: '2025-08-06T16:45:00Z',
      lastLogin: '2025-08-07T19:15:00Z'
    },
    {
      _id: '3',
      name: 'Admin User',
  email: 'admin@medimantra.com',
      role: 'admin',
      isActive: true,
      profile: {
        phone: '+91-9876543212'
      },
      createdAt: '2025-01-01T00:00:00Z',
      updatedAt: '2025-08-08T10:00:00Z',
      lastLogin: '2025-08-08T10:00:00Z'
    },
    {
      _id: '4',
      name: 'Dr. Amit Singh',
      email: 'amit.singh@hospital.com',
      role: 'doctor',
      isActive: false,
      profile: {
        phone: '+91-9876543213',
        specialization: 'General Medicine',
        licenseNumber: 'MED12346',
        department: 'General Medicine',
        gender: 'male'
      },
      createdAt: '2025-03-10T10:00:00Z',
      updatedAt: '2025-08-05T12:00:00Z',
      lastLogin: '2025-08-01T09:30:00Z'
    }
  ]);

  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    role: 'patient',
    phone: '',
    specialization: '',
    licenseNumber: '',
    department: ''
  });

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
    if (!loading && isAuthenticated && user?.role !== 'admin') {
      router.push('/dashboard');
    }
  }, [isAuthenticated, loading, router, user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== 'admin') {
    return null;
  }

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const getRoleColor = (role: string) => {
    const roleMap: { [key: string]: string } = {
      admin: 'text-red-400 bg-red-500/10 border-red-500/20',
      doctor: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
      patient: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
    };
    return roleMap[role] || 'text-gray-400 bg-gray-500/10 border-gray-500/20';
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive 
      ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
      : 'text-red-400 bg-red-500/10 border-red-500/20';
  };

  const stats: UserStats = {
    total: users.length,
    admins: users.filter(u => u.role === 'admin').length,
    doctors: users.filter(u => u.role === 'doctor').length,
    patients: users.filter(u => u.role === 'patient').length,
    active: users.filter(u => u.isActive).length,
    inactive: users.filter(u => !u.isActive).length
  };

  const filteredUsers = users.filter(user => {
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'active' && user.isActive) ||
      (statusFilter === 'inactive' && !user.isActive);
    const matchesSearch = 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.profile?.specialization?.toLowerCase().includes(searchTerm.toLowerCase()) || false);
    
    return matchesRole && matchesStatus && matchesSearch;
  });

  const toggleUserStatus = (userId: string) => {
    setUsers(prev => 
      prev.map(user => 
        user._id === userId 
          ? { ...user, isActive: !user.isActive, updatedAt: new Date().toISOString() }
          : user
      )
    );
  };

  const deleteUser = (userId: string) => {
    if (confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      setUsers(prev => prev.filter(user => user._id !== userId));
    }
  };

  const createUser = () => {
    if (!newUser.name || !newUser.email || !newUser.password) {
      alert('Please fill in all required fields');
      return;
    }

    const user: User = {
      _id: Date.now().toString(),
      name: newUser.name,
      email: newUser.email,
      role: newUser.role as any,
      isActive: true,
      profile: {
        phone: newUser.phone,
        ...(newUser.role === 'doctor' && {
          specialization: newUser.specialization,
          licenseNumber: newUser.licenseNumber,
          department: newUser.department
        })
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setUsers(prev => [user, ...prev]);
    setIsCreateModalOpen(false);
    setNewUser({
      name: '',
      email: '',
      password: '',
      role: 'patient',
      phone: '',
      specialization: '',
      licenseNumber: '',
      department: ''
    });
  };

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Top Navigation */}
      <nav className="bg-slate-800/50 backdrop-blur-xl border-b border-slate-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center space-x-4">
              <Link href="/dashboard" className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-emerald-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">M</span>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">MediMantra</h1>
                  <p className="text-xs text-gray-400">Admin - User Management</p>
                </div>
              </Link>
            </div>

            {/* User Menu */}
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-white font-medium">{user?.name}</p>
                <p className="text-xs text-gray-400">{user?.email} • {user?.role?.toUpperCase()}</p>
              </div>
              <button
                onClick={handleLogout}
                className="bg-red-500/10 hover:bg-red-500/20 text-red-400 px-4 py-2 rounded-lg transition-colors duration-200 border border-red-500/20"
              >
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* Breadcrumb Navigation */}
        <div className="border-t border-slate-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center space-x-4 py-3">
              <Link href="/dashboard" className="text-gray-400 hover:text-gray-300 text-sm">
                Dashboard
              </Link>
              <span className="text-gray-600">→</span>
              <Link href="/admin" className="text-gray-400 hover:text-gray-300 text-sm">
                Admin
              </Link>
              <span className="text-gray-600">→</span>
              <span className="text-blue-400 text-sm font-medium">User Management</span>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-emerald-600 rounded-2xl p-6 text-white shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold mb-2">
                  User Management 👥
                </h1>
                <p className="text-blue-100">
                  Add, edit, and manage all system users with role-based access control
                </p>
              </div>
              <div className="text-6xl opacity-20">🔐</div>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-4 mb-8">
          <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700 rounded-xl p-4">
            <div className="text-center">
              <p className="text-gray-400 text-sm">Total Users</p>
              <p className="text-2xl font-bold text-white">{stats.total}</p>
            </div>
          </div>
          
          <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700 rounded-xl p-4">
            <div className="text-center">
              <p className="text-gray-400 text-sm">Admins</p>
              <p className="text-2xl font-bold text-red-400">{stats.admins}</p>
            </div>
          </div>
          
          <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700 rounded-xl p-4">
            <div className="text-center">
              <p className="text-gray-400 text-sm">Doctors</p>
              <p className="text-2xl font-bold text-blue-400">{stats.doctors}</p>
            </div>
          </div>
          
          <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700 rounded-xl p-4">
            <div className="text-center">
              <p className="text-gray-400 text-sm">Patients</p>
              <p className="text-2xl font-bold text-emerald-400">{stats.patients}</p>
            </div>
          </div>
          
          <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700 rounded-xl p-4">
            <div className="text-center">
              <p className="text-gray-400 text-sm">Active</p>
              <p className="text-2xl font-bold text-emerald-400">{stats.active}</p>
            </div>
          </div>
          
          <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700 rounded-xl p-4">
            <div className="text-center">
              <p className="text-gray-400 text-sm">Inactive</p>
              <p className="text-2xl font-bold text-red-400">{stats.inactive}</p>
            </div>
          </div>
        </div>

        {/* Actions and Filters */}
        <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700 rounded-xl p-6 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="bg-slate-700/50 border border-slate-600 text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Roles</option>
                <option value="admin">Admins</option>
                <option value="doctor">Doctors</option>
                <option value="patient">Patients</option>
              </select>
              
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-slate-700/50 border border-slate-600 text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
              
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-slate-700/50 border border-slate-600 text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400"
              />
            </div>
            
            <PermissionGate resource="users" action="create">
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
              >
                Add New User
              </button>
            </PermissionGate>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700 rounded-xl overflow-hidden">
          <div className="p-6">
            <h3 className="text-xl font-bold text-white mb-4">
              All Users ({filteredUsers.length})
            </h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-slate-700/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Last Login
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {filteredUsers.map((user) => (
                  <tr key={user._id} className="hover:bg-slate-700/30 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-white font-medium">{user.name}</div>
                        <div className="text-gray-400 text-sm">{user.email}</div>
                        {user.profile?.phone && (
                          <div className="text-gray-400 text-sm">{user.profile.phone}</div>
                        )}
                        {user.profile?.specialization && (
                          <div className="text-blue-300 text-sm">{user.profile.specialization}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getRoleColor(user.role)}`}>
                        {user.role.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(user.isActive)}`}>
                        {user.isActive ? 'ACTIVE' : 'INACTIVE'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-white text-sm">
                        {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex space-x-2">
                        <PermissionGate resource="users" action="update">
                          <button
                            onClick={() => {
                              setSelectedUser(user);
                              setIsModalOpen(true);
                            }}
                            className="bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 px-3 py-1 rounded-lg text-xs border border-blue-500/20 transition-colors"
                          >
                            Edit
                          </button>
                        </PermissionGate>
                        
                        <PermissionGate resource="users" action="update">
                          <button
                            onClick={() => toggleUserStatus(user._id)}
                            className={`px-3 py-1 rounded-lg text-xs border transition-colors ${
                              user.isActive 
                                ? 'bg-red-500/10 hover:bg-red-500/20 text-red-400 border-red-500/20'
                                : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border-emerald-500/20'
                            }`}
                          >
                            {user.isActive ? 'Deactivate' : 'Activate'}
                          </button>
                        </PermissionGate>
                        
                        <PermissionGate resource="users" action="delete">
                          {user._id !== '3' && ( // Prevent deleting main admin
                            <button
                              onClick={() => deleteUser(user._id)}
                              className="bg-red-500/10 hover:bg-red-500/20 text-red-400 px-3 py-1 rounded-lg text-xs border border-red-500/20 transition-colors"
                            >
                              Delete
                            </button>
                          )}
                        </PermissionGate>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Create User Modal */}
        {isCreateModalOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 w-full max-w-lg mx-4 max-h-96 overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-white">Create New User</h3>
                <button
                  onClick={() => setIsCreateModalOpen(false)}
                  className="text-gray-400 hover:text-gray-300"
                >
                  ✕
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">Name *</label>
                    <input
                      type="text"
                      value={newUser.name}
                      onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                      className="w-full bg-slate-700/50 border border-slate-600 text-white rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">Email *</label>
                    <input
                      type="email"
                      value={newUser.email}
                      onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                      className="w-full bg-slate-700/50 border border-slate-600 text-white rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">Password *</label>
                    <input
                      type="password"
                      value={newUser.password}
                      onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                      className="w-full bg-slate-700/50 border border-slate-600 text-white rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">Role *</label>
                    <select
                      value={newUser.role}
                      onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                      className="w-full bg-slate-700/50 border border-slate-600 text-white rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="patient">Patient</option>
                      <option value="doctor">Doctor</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">Phone</label>
                  <input
                    type="text"
                    value={newUser.phone}
                    onChange={(e) => setNewUser({...newUser, phone: e.target.value})}
                    className="w-full bg-slate-700/50 border border-slate-600 text-white rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                {newUser.role === 'doctor' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-gray-300 text-sm font-medium mb-2">Specialization</label>
                        <input
                          type="text"
                          value={newUser.specialization}
                          onChange={(e) => setNewUser({...newUser, specialization: e.target.value})}
                          className="w-full bg-slate-700/50 border border-slate-600 text-white rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-gray-300 text-sm font-medium mb-2">License Number</label>
                        <input
                          type="text"
                          value={newUser.licenseNumber}
                          onChange={(e) => setNewUser({...newUser, licenseNumber: e.target.value})}
                          className="w-full bg-slate-700/50 border border-slate-600 text-white rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-gray-300 text-sm font-medium mb-2">Department</label>
                      <select
                        value={newUser.department}
                        onChange={(e) => setNewUser({...newUser, department: e.target.value})}
                        className="w-full bg-slate-700/50 border border-slate-600 text-white rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Select Department</option>
                        <option value="Cardiology">Cardiology</option>
                        <option value="General Medicine">General Medicine</option>
                        <option value="Pediatrics">Pediatrics</option>
                        <option value="Orthopedics">Orthopedics</option>
                        <option value="Dermatology">Dermatology</option>
                        <option value="Neurology">Neurology</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-6 flex space-x-3">
                <button
                  onClick={() => setIsCreateModalOpen(false)}
                  className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-2 rounded-lg text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={createUser}
                  className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg text-sm"
                >
                  Create User
                </button>
              </div>
            </div>
          </div>
        )}

        {/* User Details Modal */}
        {isModalOpen && selectedUser && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 w-full max-w-md mx-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-white">User Details</h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-gray-400 hover:text-gray-300"
                >
                  ✕
                </button>
              </div>
              
              <div className="space-y-3">
                <div>
                  <span className="text-gray-400 text-sm">Name:</span>
                  <p className="text-white font-medium">{selectedUser.name}</p>
                </div>
                
                <div>
                  <span className="text-gray-400 text-sm">Email:</span>
                  <p className="text-white">{selectedUser.email}</p>
                </div>
                
                <div>
                  <span className="text-gray-400 text-sm">Role:</span>
                  <span className={`ml-2 px-2 py-1 rounded text-xs ${getRoleColor(selectedUser.role)}`}>
                    {selectedUser.role.toUpperCase()}
                  </span>
                </div>
                
                <div>
                  <span className="text-gray-400 text-sm">Status:</span>
                  <span className={`ml-2 px-2 py-1 rounded text-xs ${getStatusColor(selectedUser.isActive)}`}>
                    {selectedUser.isActive ? 'ACTIVE' : 'INACTIVE'}
                  </span>
                </div>
                
                {selectedUser.profile?.phone && (
                  <div>
                    <span className="text-gray-400 text-sm">Phone:</span>
                    <p className="text-white">{selectedUser.profile.phone}</p>
                  </div>
                )}
                
                {selectedUser.profile?.specialization && (
                  <div>
                    <span className="text-gray-400 text-sm">Specialization:</span>
                    <p className="text-white">{selectedUser.profile.specialization}</p>
                  </div>
                )}
                
                <div>
                  <span className="text-gray-400 text-sm">Created:</span>
                  <p className="text-white text-sm">{new Date(selectedUser.createdAt).toLocaleDateString()}</p>
                </div>
                
                <div>
                  <span className="text-gray-400 text-sm">Last Login:</span>
                  <p className="text-white text-sm">
                    {selectedUser.lastLogin ? new Date(selectedUser.lastLogin).toLocaleDateString() : 'Never'}
                  </p>
                </div>
              </div>

              <div className="mt-6 flex space-x-3">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-2 rounded-lg text-sm"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
