import React, { useState, useEffect } from 'react';
import { 
  FaTimes, FaBox, FaCalendarAlt, FaMapMarkerAlt, FaUser, 
  FaExclamationTriangle, FaCheckCircle, FaClock, FaTruck 
} from 'react-icons/fa';

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
  location: string;
  manufacturer: string;
  supplier: {
    name: string;
    contactInfo: { email: string; phone: string };
    address: { street: string; city: string; state: string; zipCode: string };
  };
  expiryDate?: string;
  batchNumber?: string;
  serialNumber?: string;
  warrantyExpiry?: string;
  dosage?: string;
  administration?: string;
  createdAt: string;
  updatedAt: string;
  stockStatus: 'in_stock' | 'low_stock' | 'out_of_stock';
  expiryStatus: 'valid' | 'expiring_soon' | 'expired';
}

interface OrderHistoryItem {
  _id: string;
  orderNumber: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  status: string;
  orderDate: string;
  deliveryDate?: string;
}

interface InventoryDetailsModalProps {
  item: InventoryItem;
  isOpen: boolean;
  onClose: () => void;
  userRole: 'patient' | 'doctor' | 'admin';
}

const InventoryDetailsModal: React.FC<InventoryDetailsModalProps> = ({
  item,
  isOpen,
  onClose,
  userRole
}) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [orderHistory, setOrderHistory] = useState<OrderHistoryItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && activeTab === 'history') {
      fetchOrderHistory();
    }
  }, [isOpen, activeTab, item._id]);

  const fetchOrderHistory = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/orders/item/${item._id}/history`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setOrderHistory(data.orders);
      }
    } catch (error) {
      console.error('Error fetching order history:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStockStatusColor = (status: string) => {
    switch (status) {
      case 'in_stock': return 'text-green-600 bg-green-100';
      case 'low_stock': return 'text-yellow-600 bg-yellow-100';
      case 'out_of_stock': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getExpiryStatusColor = (status: string) => {
    switch (status) {
      case 'valid': return 'text-green-600 bg-green-100';
      case 'expiring_soon': return 'text-orange-600 bg-orange-100';
      case 'expired': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-3">
            <FaBox className="h-6 w-6 text-blue-600" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{item.name}</h2>
              <p className="text-sm text-gray-500">SKU: {item.sku}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <FaTimes className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b">
          <nav className="flex space-x-8 px-6">
            {['overview', 'details', 'supplier', 'history'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Status Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-600">Current Stock</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStockStatusColor(item.stockStatus)}`}>
                      {item.stockStatus.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="mt-2 flex items-baseline">
                    <span className="text-2xl font-semibold text-gray-900">{item.currentStock}</span>
                    <span className="ml-2 text-sm text-gray-600">units</span>
                  </div>
                  <div className="mt-1 text-sm text-gray-500">
                    Min: {item.minimumStock} | Max: {item.maximumStock}
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-600">Unit Price</span>
                    <span className="text-sm text-green-600 font-medium">Available</span>
                  </div>
                  <div className="mt-2 flex items-baseline">
                    <span className="text-2xl font-semibold text-gray-900">{formatCurrency(item.unitPrice)}</span>
                  </div>
                  <div className="mt-1 text-sm text-gray-500">
                    Total Value: {formatCurrency(item.unitPrice * item.currentStock)}
                  </div>
                </div>

                {item.expiryDate && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-600">Expiry Status</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getExpiryStatusColor(item.expiryStatus)}`}>
                        {item.expiryStatus.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="mt-2">
                      <span className="text-lg font-semibold text-gray-900">
                        {formatDate(item.expiryDate)}
                      </span>
                    </div>
                    {item.batchNumber && (
                      <div className="mt-1 text-sm text-gray-500">
                        Batch: {item.batchNumber}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Description */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Description</h3>
                <p className="text-gray-600">{item.description}</p>
              </div>

              {/* Key Information */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Key Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-3">
                    <FaMapMarkerAlt className="h-5 w-5 text-gray-400" />
                    <div>
                      <span className="text-sm font-medium text-gray-600">Location:</span>
                      <span className="ml-2 text-sm text-gray-900">{item.location}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <FaBox className="h-5 w-5 text-gray-400" />
                    <div>
                      <span className="text-sm font-medium text-gray-600">Category:</span>
                      <span className="ml-2 text-sm text-gray-900 capitalize">{item.category.replace('_', ' ')}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <FaUser className="h-5 w-5 text-gray-400" />
                    <div>
                      <span className="text-sm font-medium text-gray-600">Manufacturer:</span>
                      <span className="ml-2 text-sm text-gray-900">{item.manufacturer}</span>
                    </div>
                  </div>
                  {item.dosage && (
                    <div className="flex items-center space-x-3">
                      <FaCalendarAlt className="h-5 w-5 text-gray-400" />
                      <div>
                        <span className="text-sm font-medium text-gray-600">Dosage:</span>
                        <span className="ml-2 text-sm text-gray-900">{item.dosage}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'details' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Product Details</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-600">SKU:</span>
                      <span className="text-sm text-gray-900">{item.sku}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-600">Manufacturer:</span>
                      <span className="text-sm text-gray-900">{item.manufacturer}</span>
                    </div>
                    {item.serialNumber && (
                      <div className="flex justify-between">
                        <span className="text-sm font-medium text-gray-600">Serial Number:</span>
                        <span className="text-sm text-gray-900">{item.serialNumber}</span>
                      </div>
                    )}
                    {item.batchNumber && (
                      <div className="flex justify-between">
                        <span className="text-sm font-medium text-gray-600">Batch Number:</span>
                        <span className="text-sm text-gray-900">{item.batchNumber}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Stock Information</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-600">Current Stock:</span>
                      <span className="text-sm text-gray-900">{item.currentStock} units</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-600">Minimum Stock:</span>
                      <span className="text-sm text-gray-900">{item.minimumStock} units</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-600">Maximum Stock:</span>
                      <span className="text-sm text-gray-900">{item.maximumStock} units</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-600">Unit Price:</span>
                      <span className="text-sm text-gray-900">{formatCurrency(item.unitPrice)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {(item.expiryDate || item.warrantyExpiry) && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Dates & Expiry</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {item.expiryDate && (
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-sm font-medium text-gray-600">Expiry Date:</span>
                          <span className="text-sm text-gray-900">{formatDate(item.expiryDate)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm font-medium text-gray-600">Expiry Status:</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getExpiryStatusColor(item.expiryStatus)}`}>
                            {item.expiryStatus.replace('_', ' ')}
                          </span>
                        </div>
                      </div>
                    )}
                    {item.warrantyExpiry && (
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-sm font-medium text-gray-600">Warranty Expiry:</span>
                          <span className="text-sm text-gray-900">{formatDate(item.warrantyExpiry)}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {(item.dosage || item.administration) && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Medical Information</h3>
                  <div className="space-y-3">
                    {item.dosage && (
                      <div className="flex justify-between">
                        <span className="text-sm font-medium text-gray-600">Dosage:</span>
                        <span className="text-sm text-gray-900">{item.dosage}</span>
                      </div>
                    )}
                    {item.administration && (
                      <div className="flex justify-between">
                        <span className="text-sm font-medium text-gray-600">Administration:</span>
                        <span className="text-sm text-gray-900 capitalize">{item.administration}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'supplier' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Supplier Information</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900">{item.supplier.name}</h4>
                      <div className="mt-2 space-y-1 text-sm text-gray-600">
                        <div>Email: {item.supplier.contactInfo.email}</div>
                        <div>Phone: {item.supplier.contactInfo.phone}</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <h5 className="font-medium text-gray-900 mb-2">Address</h5>
                    <div className="text-sm text-gray-600">
                      <div>{item.supplier.address.street}</div>
                      <div>{item.supplier.address.city}, {item.supplier.address.state} {item.supplier.address.zipCode}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Order History</h3>
                {userRole === 'admin' && (
                  <button
                    onClick={fetchOrderHistory}
                    disabled={loading}
                    className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                  >
                    {loading ? 'Loading...' : 'Refresh'}
                  </button>
                )}
              </div>

              {loading ? (
                <div className="text-center py-8">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : orderHistory.length > 0 ? (
                <div className="space-y-3">
                  {orderHistory.map((order) => (
                    <div key={order._id} className="border rounded-lg p-4 bg-gray-50">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <span className="font-medium text-gray-900">{order.orderNumber}</span>
                          <span className="ml-2 text-sm text-gray-500">
                            Qty: {order.quantity}
                          </span>
                        </div>
                        <div className="text-right">
                          <div className="font-medium text-gray-900">
                            {formatCurrency(order.totalAmount)}
                          </div>
                          <div className="text-sm text-gray-500">
                            {formatDate(order.orderDate)}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          order.status === 'completed' 
                            ? 'text-green-600 bg-green-100'
                            : order.status === 'approved'
                            ? 'text-blue-600 bg-blue-100'
                            : 'text-yellow-600 bg-yellow-100'
                        }`}>
                          {order.status}
                        </span>
                        {order.deliveryDate && (
                          <span className="text-sm text-gray-500">
                            Delivered: {formatDate(order.deliveryDate)}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No order history available for this item.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t bg-gray-50">
          <div className="text-sm text-gray-500">
            Last updated: {formatDate(item.updatedAt)}
          </div>
          <div className="flex space-x-3">
            {userRole !== 'patient' && (
              <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                Request Order
              </button>
            )}
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InventoryDetailsModal;
