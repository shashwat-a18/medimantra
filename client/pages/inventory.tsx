import React from 'react';
import DashboardLayout from '../components/DashboardLayout';

const Inventory = () => {
  return (
    <DashboardLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Inventory Management</h1>
        <div className="bg-white rounded-lg shadow-md p-6">
          <p className="text-gray-600">Inventory management feature coming soon...</p>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Inventory;