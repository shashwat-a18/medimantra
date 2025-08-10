import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/router';
import DashboardLayout from '../../components/DashboardLayout';
import { Card, Button, Input, Badge } from '../../components/ui/ModernComponents';

import { API_CONFIG } from '../utils/api';
interface Department {
  _id: string;
  name: string;
  description: string;
  head: string;
  isActive: boolean;
  createdAt: string;
}

export default function AdminDepartments() {
  const { isAuthenticated, loading, token, user } = useAuth();
  const router = useRouter();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newDepartment, setNewDepartment] = useState({
    name: '',
    description: '',
    head: ''
  });

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    } else if (!loading && user?.role !== 'admin') {
      router.push('/admin/dashboard');
    } else if (isAuthenticated && user?.role === 'admin') {
      fetchDepartments();
    }
  }, [isAuthenticated, loading, router, user]);

  const fetchDepartments = async () => {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/admin/departments`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setDepartments(data.departments || []);
      }
    } catch (error) {
      console.error('Error fetching departments:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddDepartment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/admin/departments`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newDepartment)
      });

      if (response.ok) {
        fetchDepartments();
        setShowAddModal(false);
        setNewDepartment({ name: '', description: '', head: '' });
      }
    } catch (error) {
      console.error('Error adding department:', error);
    }
  };

  const toggleDepartmentStatus = async (departmentId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/admin/departments/${departmentId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ isActive: !currentStatus })
      });

      if (response.ok) {
        fetchDepartments();
      }
    } catch (error) {
      console.error('Error updating department:', error);
    }
  };

  if (loading || isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!isAuthenticated || user?.role !== 'admin') {
    return null;
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
              Department Management
            </h1>
            <p className="text-gray-400 mt-2">Manage hospital departments and their information</p>
          </div>
          <Button
            onClick={() => setShowAddModal(true)}
            variant="primary"
            size="md"
            className="flex items-center"
          >
            <span className="mr-2">➕</span>
            Add Department
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center text-white text-xl">
                  🏥
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-400">Total Departments</p>
                <p className="text-2xl font-bold text-white">{departments.length}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center text-white text-xl">
                  ✅
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-400">Active Departments</p>
                <p className="text-2xl font-bold text-white">
                  {departments.filter(d => d.isActive).length}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center text-white text-xl">
                  👨‍⚕️
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-400">With Heads</p>
                <p className="text-2xl font-bold text-white">
                  {departments.filter(d => d.head).length}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Departments Grid */}
        <Card className="p-0 overflow-hidden">
          <div className="p-6 border-b border-slate-600 bg-gradient-to-r from-blue-50 to-green-50">
            <h2 className="text-xl font-bold text-white flex items-center">
              <span className="mr-3">📋</span>
              All Departments ({departments.length})
            </h2>
          </div>

          {departments.length === 0 ? (
            <div className="p-12 text-center">
              <div className="text-6xl mb-4">🏥</div>
              <h3 className="text-xl font-medium text-white mb-2">No departments yet</h3>
              <p className="text-gray-400 mb-6">Create your first department to get started with organization.</p>
              <Button
                onClick={() => setShowAddModal(true)}
                variant="primary"
                size="lg"
              >
                Create First Department
              </Button>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {departments.map((department) => (
                <div key={department._id} className="p-6 hover:bg-slate-800/30 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <h3 className="text-lg font-bold text-white mr-3">
                          {department.name}
                        </h3>
                        <Badge variant={department.isActive ? 'success' : 'danger'}>
                          {department.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                      <p className="text-gray-400 mb-2">{department.description}</p>
                      <div className="flex items-center text-sm text-gray-500">
                        <span className="mr-4">
                          👨‍⚕️ Head: {department.head || 'Not Assigned'}
                        </span>
                        <span>
                          📅 Created: {new Date(department.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="ml-6 flex items-center space-x-3">
                      <Button
                        onClick={() => toggleDepartmentStatus(department._id, department.isActive)}
                        variant={department.isActive ? "outline" : "primary"}
                        size="sm"
                      >
                        {department.isActive ? 'Deactivate' : 'Activate'}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Add Department Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-md bg-slate-800/50 backdrop-blur-xl border border-slate-700 shadow-2xl">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                    Add New Department
                  </h3>
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="text-gray-400 hover:text-gray-400 transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <form onSubmit={handleAddDepartment} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Department Name
                    </label>
                    <Input
                      type="text"
                      name="name"
                      value={newDepartment.name}
                      onChange={(e) => setNewDepartment({...newDepartment, name: e.target.value})}
                      placeholder="e.g., Cardiology, Neurology"
                      required
                      icon="🏥"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Description
                    </label>
                    <textarea
                      value={newDepartment.description}
                      onChange={(e) => setNewDepartment({...newDepartment, description: e.target.value})}
                      className="w-full px-4 py-3 border border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400 transition-colors duration-200"
                      rows={3}
                      placeholder="Brief description of the department's services and specialties"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Department Head (Optional)
                    </label>
                    <Input
                      type="text"
                      name="head"
                      value={newDepartment.head}
                      onChange={(e) => setNewDepartment({...newDepartment, head: e.target.value})}
                      placeholder="Dr. John Smith"
                      icon="👨‍⚕️"
                    />
                  </div>

                  <div className="flex justify-end space-x-3 pt-4">
                    <Button
                      type="button"
                      onClick={() => setShowAddModal(false)}
                      variant="outline"
                      size="md"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      variant="primary"
                      size="md"
                    >
                      Create Department
                    </Button>
                  </div>
                </form>
              </div>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
