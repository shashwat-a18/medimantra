import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../../components/DashboardLayout';

interface InventoryItem {
  _id: string;
  name: string;
  description: string;
  category: string;
  sku: string;
  currentStock: number;
  minimumStock: number;
  maximumStock: number;
  unitPrice: number;
  totalValue: number;
  expiryDate?: Date;
  batchNumber?: string;
  manufacturer: string;
  location: string;
  supplier: {
    _id: string;
    name: string;
    contactInfo: {
      email: string;
      phone: string;
    };
  };
  isAvailable: boolean;
  isLowStock: boolean;
  isExpired: boolean;
  stockStatus: string;
  daysUntilExpiry?: number;
  createdAt: Date;
  updatedAt: Date;
}

interface AnalyticsData {
  summary: {
    totalItems: number;
    lowStockItems: number;
    outOfStockItems: number;
    expiredItems: number;
    expiringItems: number;
    totalInventoryValue: number;
  };
  categoryBreakdown: Array<{
    _id: string;
    count: number;
    totalValue: number;
    averagePrice: number;
  }>;
  supplierBreakdown: Array<{
    _id: string;
    supplierName: string;
    itemCount: number;
    totalValue: number;
  }>;
  mostExpensiveItems: Array<{
    _id: string;
    name: string;
    category: string;
    unitPrice: number;
    currentStock: number;
    totalValue: number;
  }>;
}

const AdminInventoryPage: React.FC = () => {
  const { user, token } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'items' | 'alerts' | 'analytics'>('overview');
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [lowStockItems, setLowStockItems] = useState<InventoryItem[]>([]);
  const [expiringItems, setExpiringItems] = useState<InventoryItem[]>([]);
  const [expiredItems, setExpiredItems] = useState<InventoryItem[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch all data in parallel
      const [itemsRes, lowStockRes, expiringRes, expiredRes, analyticsRes] = await Promise.all([
        fetch('/api/inventory?limit=20', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('/api/inventory/alerts/low-stock', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('/api/inventory/alerts/expiring?days=30', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('/api/inventory/alerts/expired', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('/api/inventory/analytics', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      const [itemsData, lowStockData, expiringData, expiredData, analyticsData] = await Promise.all([
        itemsRes.json(),
        lowStockRes.json(),
        expiringRes.json(),
        expiredRes.json(),
        analyticsRes.json()
      ]);

      if (itemsData.success) setItems(itemsData.data);
      if (lowStockData.success) setLowStockItems(lowStockData.data);
      if (expiringData.success) setExpiringItems(expiringData.data);
      if (expiredData.success) setExpiredItems(expiredData.data);
      if (analyticsData.success) setAnalytics(analyticsData.data);

    } catch (err) {
      setError('Failed to load inventory data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchData();
    }
  }, [user, token]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStockStatusColor = (status: string) => {
    switch (status) {
      case 'in_stock': return 'bg-green-100 text-green-800';
      case 'low_stock': return 'bg-yellow-100 text-yellow-800';
      case 'out_of_stock': return 'bg-red-100 text-red-800';
      case 'overstocked': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (user?.role !== 'admin') {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-white mb-2">Access Denied</h2>
          <p className="text-gray-400">You don't have permission to access this page.</p>
        </div>
      </DashboardLayout>
    );
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-white">Inventory Management</h1>
            <p className="mt-1 text-sm text-gray-500">
              Admin dashboard for managing medical inventory
            </p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => window.location.href = '/admin/suppliers'}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              Manage Suppliers
            </button>
            <button
              onClick={() => window.location.href = '/inventory'}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              Add New Item
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="border-b border-slate-600">
          <nav className="-mb-px flex space-x-8">
            {[
              { key: 'overview', label: 'Overview' },
              { key: 'items', label: 'Recent Items' },
              { key: 'alerts', label: 'Alerts' },
              { key: 'analytics', label: 'Analytics' }
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.key
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-300 hover:border-slate-500'
                }`}
              >
                {tab.label}
                {tab.key === 'alerts' && (lowStockItems.length + expiringItems.length + expiredItems.length > 0) && (
                  <span className="ml-2 bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                    {lowStockItems.length + expiringItems.length + expiredItems.length}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && analytics && (
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700 p-6 rounded-lg shadow-sm border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-400">Total Items</p>
                    <p className="text-3xl font-bold text-white">
                      {analytics.summary.totalItems.toLocaleString()}
                    </p>
                  </div>
                  <div className="text-blue-500 text-2xl">📦</div>
                </div>
              </div>

              <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700 p-6 rounded-lg shadow-sm border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-400">Total Value</p>
                    <p className="text-3xl font-bold text-white">
                      {formatCurrency(analytics.summary.totalInventoryValue)}
                    </p>
                  </div>
                  <div className="text-green-500 text-2xl">💰</div>
                </div>
              </div>

              <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700 p-6 rounded-lg shadow-sm border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-400">Low Stock</p>
                    <p className="text-3xl font-bold text-yellow-600">
                      {analytics.summary.lowStockItems}
                    </p>
                  </div>
                  <div className="text-yellow-500 text-2xl">⚠️</div>
                </div>
              </div>

              <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700 p-6 rounded-lg shadow-sm border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-400">Expiring Soon</p>
                    <p className="text-3xl font-bold text-red-600">
                      {analytics.summary.expiringItems}
                    </p>
                  </div>
                  <div className="text-red-500 text-2xl">⏰</div>
                </div>
              </div>
            </div>

            {/* Category Breakdown */}
            <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700 p-6 rounded-lg shadow-sm border">
              <h3 className="text-lg font-medium text-white mb-4">Inventory by Category</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {analytics.categoryBreakdown.map((category) => (
                  <div key={category._id} className="border rounded-lg p-4">
                    <h4 className="font-medium text-white capitalize mb-2">
                      {category._id.replace('_', ' ')}
                    </h4>
                    <div className="space-y-1 text-sm text-gray-400">
                      <div className="flex justify-between">
                        <span>Items:</span>
                        <span>{category.count}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Total Value:</span>
                        <span>{formatCurrency(category.totalValue)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Avg Price:</span>
                        <span>{formatCurrency(category.averagePrice)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Suppliers */}
            <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700 p-6 rounded-lg shadow-sm border">
              <h3 className="text-lg font-medium text-white mb-4">Top Suppliers by Item Count</h3>
              <div className="space-y-3">
                {analytics.supplierBreakdown.slice(0, 5).map((supplier) => (
                  <div key={supplier._id} className="flex justify-between items-center py-2 border-b">
                    <div>
                      <p className="font-medium text-white">{supplier.supplierName}</p>
                      <p className="text-sm text-gray-500">{supplier.itemCount} items</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-white">
                        {formatCurrency(supplier.totalValue)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Recent Items Tab */}
        {activeTab === 'items' && (
          <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700 shadow-sm rounded-lg border overflow-hidden">
            <div className="px-6 py-4 border-b">
              <h3 className="text-lg font-medium text-white">Recent Inventory Items</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-slate-800/30">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Item Details
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Stock
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Supplier
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-slate-800/50 backdrop-blur-xl border border-slate-700 divide-y divide-gray-200">
                  {items.map((item) => (
                    <tr key={item._id} className="hover:bg-slate-800/30">
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-white">{item.name}</div>
                          <div className="text-sm text-gray-500">{item.sku}</div>
                          <div className="text-sm text-gray-500 capitalize">
                            {item.category.replace('_', ' ')}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-white">{item.currentStock}</div>
                        <div className="text-sm text-gray-500">Min: {item.minimumStock}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-white">
                          {formatCurrency(item.unitPrice)}
                        </div>
                        <div className="text-sm text-gray-500">
                          Total: {formatCurrency(item.totalValue)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStockStatusColor(item.stockStatus)}`}>
                          {item.stockStatus.replace('_', ' ').toUpperCase()}
                        </span>
                        {item.isExpired && (
                          <div className="mt-1">
                            <span className="px-2 text-xs bg-red-100 text-red-800 rounded-full">
                              EXPIRED
                            </span>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-white">{item.supplier.name}</div>
                        <div className="text-sm text-gray-500">{item.supplier.contactInfo.email}</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Alerts Tab */}
        {activeTab === 'alerts' && (
          <div className="space-y-6">
            {/* Low Stock Alerts */}
            <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700 rounded-lg shadow-sm border">
              <div className="px-6 py-4 border-b">
                <h3 className="text-lg font-medium text-white flex items-center">
                  <span className="text-yellow-500 mr-2">⚠️</span>
                  Low Stock Items ({lowStockItems.length})
                </h3>
              </div>
              {lowStockItems.length > 0 ? (
                <div className="p-6 space-y-4">
                  {lowStockItems.map((item) => (
                    <div key={item._id} className="flex justify-between items-center p-4 border rounded-lg">
                      <div>
                        <h4 className="font-medium text-white">{item.name}</h4>
                        <p className="text-sm text-gray-500">{item.sku} • {item.supplier.name}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-yellow-600">
                          {item.currentStock} / {item.minimumStock} min
                        </p>
                        <p className="text-sm text-gray-500">
                          {item.category.replace('_', ' ')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 text-center text-gray-500">
                  No low stock items
                </div>
              )}
            </div>

            {/* Expiring Items */}
            <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700 rounded-lg shadow-sm border">
              <div className="px-6 py-4 border-b">
                <h3 className="text-lg font-medium text-white flex items-center">
                  <span className="text-orange-500 mr-2">⏰</span>
                  Expiring Items (Next 30 Days) ({expiringItems.length})
                </h3>
              </div>
              {expiringItems.length > 0 ? (
                <div className="p-6 space-y-4">
                  {expiringItems.map((item) => (
                    <div key={item._id} className="flex justify-between items-center p-4 border rounded-lg">
                      <div>
                        <h4 className="font-medium text-white">{item.name}</h4>
                        <p className="text-sm text-gray-500">
                          {item.sku} • Batch: {item.batchNumber}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-orange-600">
                          Expires: {item.expiryDate && formatDate(item.expiryDate)}
                        </p>
                        <p className="text-sm text-gray-500">
                          {item.daysUntilExpiry} days remaining
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 text-center text-gray-500">
                  No items expiring in the next 30 days
                </div>
              )}
            </div>

            {/* Expired Items */}
            <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700 rounded-lg shadow-sm border">
              <div className="px-6 py-4 border-b">
                <h3 className="text-lg font-medium text-white flex items-center">
                  <span className="text-red-500 mr-2">❌</span>
                  Expired Items ({expiredItems.length})
                </h3>
              </div>
              {expiredItems.length > 0 ? (
                <div className="p-6 space-y-4">
                  {expiredItems.map((item) => (
                    <div key={item._id} className="flex justify-between items-center p-4 border rounded-lg border-red-200">
                      <div>
                        <h4 className="font-medium text-white">{item.name}</h4>
                        <p className="text-sm text-gray-500">
                          {item.sku} • Batch: {item.batchNumber}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-red-600">
                          Expired: {item.expiryDate && formatDate(item.expiryDate)}
                        </p>
                        <p className="text-sm text-gray-500">
                          Stock: {item.currentStock}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 text-center text-gray-500">
                  No expired items
                </div>
              )}
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && analytics && (
          <div className="space-y-6">
            {/* Most Expensive Items */}
            <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700 rounded-lg shadow-sm border">
              <div className="px-6 py-4 border-b">
                <h3 className="text-lg font-medium text-white">Most Expensive Items</h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {analytics.mostExpensiveItems.map((item, index) => (
                    <div key={item._id} className="flex justify-between items-center p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="text-lg font-bold text-gray-400">#{index + 1}</div>
                        <div>
                          <h4 className="font-medium text-white">{item.name}</h4>
                          <p className="text-sm text-gray-500 capitalize">
                            {item.category.replace('_', ' ')}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-white">
                          {formatCurrency(item.unitPrice)}
                        </p>
                        <p className="text-sm text-gray-500">
                          Stock: {item.currentStock} • Total: {formatCurrency(item.totalValue)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Detailed Supplier Breakdown */}
            <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700 rounded-lg shadow-sm border">
              <div className="px-6 py-4 border-b">
                <h3 className="text-lg font-medium text-white">Detailed Supplier Analysis</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-slate-800/30">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Supplier
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Item Count
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total Value
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Avg Value per Item
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-slate-800/50 backdrop-blur-xl border border-slate-700 divide-y divide-gray-200">
                    {analytics.supplierBreakdown.map((supplier) => (
                      <tr key={supplier._id} className="hover:bg-slate-800/30">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-white">
                            {supplier.supplierName}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-white">{supplier.itemCount}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-white">
                            {formatCurrency(supplier.totalValue)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-white">
                            {formatCurrency(supplier.totalValue / supplier.itemCount)}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AdminInventoryPage;
