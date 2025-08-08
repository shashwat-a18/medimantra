import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import DashboardLayout from '../components/DashboardLayout';

interface OrderItem {
  item: {
    _id: string;
    name: string;
    category: string;
    sku: string;
  };
  quantity: number;
  unitPrice: number;
  subtotal: number;
  notes?: string;
}

interface Order {
  _id: string;
  orderNumber: string;
  user: {
    _id: string;
    name: string;
    email: string;
    role: string;
  };
  orderType: string;
  priority: string;
  items: OrderItem[];
  totalAmount: number;
  finalAmount: number;
  status: string;
  deliveryInformation?: {
    address: {
      street: string;
      city: string;
      state: string;
      zipCode: string;
    };
    phone: string;
  };
  payment: {
    method: string;
    status: string;
  };
  createdAt: Date;
  updatedAt: Date;
  approvedBy?: {
    name: string;
  };
  rejectedBy?: {
    name: string;
  };
  rejectionReason?: string;
  canBeCancelled: boolean;
}

interface Filters {
  status: string;
  orderType: string;
  priority: string;
  startDate: string;
  endDate: string;
}

const OrdersPage: React.FC = () => {
  const { user, token } = useAuth();
  const [orders, setOrders] = useState<Order[]>([
    {
      _id: '1',
      orderNumber: 'ORD-2025-001',
      user: {
        _id: 'user1',
        name: 'Rajesh Kumar',
        email: 'rajesh@email.com',
        role: 'patient'
      },
      orderType: 'prescription',
      priority: 'normal',
      items: [
        {
          item: {
            _id: 'item1',
            name: 'Paracetamol 500mg',
            category: 'Medicine',
            sku: 'MED001'
          },
          quantity: 30,
          unitPrice: 5.0,
          subtotal: 150.0
        }
      ],
      totalAmount: 150.0,
      finalAmount: 150.0,
      status: 'pending',
      payment: {
        method: 'cash',
        status: 'pending'
      },
      createdAt: new Date('2025-08-07'),
      updatedAt: new Date('2025-08-07'),
      canBeCancelled: true
    },
    {
      _id: '2',
      orderNumber: 'ORD-2025-002',
      user: {
        _id: 'user2',
        name: 'Priya Sharma',
        email: 'priya@email.com',
        role: 'patient'
      },
      orderType: 'clinical_supplies',
      priority: 'high',
      items: [
        {
          item: {
            _id: 'item2',
            name: 'Surgical Gloves',
            category: 'Medical Supplies',
            sku: 'SUP001'
          },
          quantity: 100,
          unitPrice: 0.5,
          subtotal: 50.0
        }
      ],
      totalAmount: 50.0,
      finalAmount: 50.0,
      status: 'approved',
      payment: {
        method: 'card',
        status: 'completed'
      },
      createdAt: new Date('2025-08-06'),
      updatedAt: new Date('2025-08-07'),
      canBeCancelled: false
    }
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(2);

  const [filters, setFilters] = useState<Filters>({
    status: '',
    orderType: '',
    priority: '',
    startDate: '',
    endDate: ''
  });

  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');

  const orderStatuses = [
    { value: 'pending', label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'approved', label: 'Approved', color: 'bg-green-100 text-green-800' },
    { value: 'rejected', label: 'Rejected', color: 'bg-red-100 text-red-800' },
    { value: 'processing', label: 'Processing', color: 'bg-blue-100 text-blue-800' },
    { value: 'shipped', label: 'Shipped', color: 'bg-purple-100 text-purple-800' },
    { value: 'delivered', label: 'Delivered', color: 'bg-green-100 text-green-800' },
    { value: 'completed', label: 'Completed', color: 'bg-gray-100 text-gray-800' },
    { value: 'cancelled', label: 'Cancelled', color: 'bg-red-100 text-red-800' }
  ];

  const orderTypes = [
    { value: 'prescription', label: 'Prescription' },
    { value: 'clinical_supplies', label: 'Clinical Supplies' },
    { value: 'equipment', label: 'Equipment' },
    { value: 'consumables', label: 'Consumables' },
    { value: 'emergency', label: 'Emergency' }
  ];

  const priorities = [
    { value: 'low', label: 'Low' },
    { value: 'normal', label: 'Normal' },
    { value: 'high', label: 'High' },
    { value: 'urgent', label: 'Urgent' }
  ];

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
        sortBy,
        sortOrder
      });

      Object.entries(filters).forEach(([key, value]) => {
        if (value && value !== '') {
          queryParams.append(key, value);
        }
      });

      const response = await fetch(`/api/orders?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (data.success) {
        setOrders(data.data);
        setTotalPages(data.pagination.totalPages);
        setTotalItems(data.pagination.totalItems);
      } else {
        setError(data.error || 'Failed to fetch orders');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [currentPage, filters, sortBy, sortOrder]);

  const handleFilterChange = (key: keyof Filters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const getStatusColor = (status: string) => {
    const statusObj = orderStatuses.find(s => s.value === status);
    return statusObj ? statusObj.color : 'bg-gray-100 text-gray-800';
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-600';
      case 'high': return 'text-orange-600';
      case 'normal': return 'text-green-600';
      case 'low': return 'text-gray-400';
      default: return 'text-gray-400';
    }
  };

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
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading && orders.length === 0) {
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
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-white">Orders Management</h1>
            <p className="mt-1 text-sm text-gray-500">
              {user?.role === 'patient' ? 'Your order history and status' : 'Manage and track all orders'}
            </p>
          </div>
          <button
            onClick={() => window.location.href = '/orders/create'}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
          >
            Create Order
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700 shadow-sm rounded-lg overflow-hidden">
          {orders.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-slate-800/30">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Order Details
                    </th>
                    {user?.role !== 'patient' && (
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Customer
                      </th>
                    )}
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Items
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-slate-800/50 backdrop-blur-xl border border-slate-700 divide-y divide-gray-200">
                  {orders.map((order) => (
                    <tr key={order._id} className="hover:bg-slate-800/30">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-white">
                            {order.orderNumber}
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-500 capitalize">
                              {order.orderType.replace('_', ' ')}
                            </span>
                            <span className={`text-sm font-medium ${getPriorityColor(order.priority)}`}>
                              {order.priority.toUpperCase()}
                            </span>
                          </div>
                        </div>
                      </td>
                      {user?.role !== 'patient' && (
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-white">{order.user?.name || 'Unknown User'}</div>
                          <div className="text-sm text-gray-500">{order.user?.role || 'N/A'}</div>
                        </td>
                      )}
                      <td className="px-6 py-4">
                        <div className="text-sm text-white">
                          {order.items.length} item{order.items.length > 1 ? 's' : ''}
                        </div>
                        <div className="text-sm text-gray-500">
                          {order.items[0]?.item?.name || 'No items'}
                          {order.items.length > 1 && ` +${order.items.length - 1} more`}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-white">
                          {formatCurrency(order.finalAmount)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(order.status)}`}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(order.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">📋</div>
              <h3 className="text-lg font-medium text-white mb-2">No orders found</h3>
              <p className="text-gray-500 mb-4">
                {user?.role === 'patient' 
                  ? "You haven't placed any orders yet" 
                  : "No orders match your current filters"
                }
              </p>
              <button
                onClick={() => window.location.href = '/orders/create'}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md text-sm font-medium"
              >
                Create Your First Order
              </button>
            </div>
          )}
        </div>

        {totalPages > 1 && (
          <div className="flex justify-center items-center space-x-4 mt-8">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 text-sm font-medium text-gray-300 bg-slate-800/50 backdrop-blur-xl border border-slate-500 rounded-md hover:bg-slate-800/30 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            
            <span className="text-sm text-gray-400">
              Page {currentPage} of {totalPages}
            </span>
            
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 text-sm font-medium text-gray-300 bg-slate-800/50 backdrop-blur-xl border border-slate-500 rounded-md hover:bg-slate-800/30 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default OrdersPage;
