import React, { useState, useEffect } from 'react';
import { FaShoppingCart, FaPlus, FaMinus, FaBox, FaExclamationTriangle } from 'react-icons/fa';

interface InventoryItem {
  _id: string;
  name: string;
  description: string;
  category: string;
  sku: string;
  currentStock: number;
  minimumStock: number;
  unitPrice: number;
  location: string;
  manufacturer: string;
  supplier: {
    name: string;
    contactInfo: { email: string; phone: string };
  };
  expiryDate?: string;
  stockStatus: 'in_stock' | 'low_stock' | 'out_of_stock';
}

interface OrderRequestModalProps {
  item: InventoryItem;
  isOpen: boolean;
  onClose: () => void;
  userRole: 'patient' | 'doctor' | 'admin';
}

const OrderRequestModal: React.FC<OrderRequestModalProps> = ({
  item,
  isOpen,
  onClose,
  userRole
}) => {
  const [quantity, setQuantity] = useState(1);
  const [orderType, setOrderType] = useState<'prescription' | 'clinical_supplies' | 'equipment' | 'general'>('general');
  const [priority, setPriority] = useState<'low' | 'normal' | 'high' | 'urgent'>('normal');
  const [justification, setJustification] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState({
    street: '',
    city: '',
    state: '',
    zipCode: '',
    phone: ''
  });
  const [prescriptionDetails, setPrescriptionDetails] = useState({
    prescriptionId: '',
    doctorName: '',
    licenseNumber: '',
    issuedDate: '',
    validUntil: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      // Reset form when modal opens
      setQuantity(1);
      setError('');
      setJustification('');
      
      // Set default order type based on category and user role
      if (item.category === 'medication' && userRole === 'patient') {
        setOrderType('prescription');
      } else if (item.category === 'supplies' || item.category === 'consumables') {
        setOrderType('clinical_supplies');
      } else if (item.category === 'medical_equipment' || item.category === 'devices') {
        setOrderType('equipment');
      } else {
        setOrderType('general');
      }

      // Load user's saved address if available
      loadUserAddress();
    }
  }, [isOpen, item.category, userRole]);

  const loadUserAddress = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/auth/profile', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const userData = await response.json();
        if (userData.address) {
          setDeliveryAddress({
            street: userData.address.street || '',
            city: userData.address.city || '',
            state: userData.address.state || '',
            zipCode: userData.address.zipCode || '',
            phone: userData.phone || ''
          });
        }
      }
    } catch (error) {
      console.error('Error loading user address:', error);
    }
  };

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= 1 && newQuantity <= item.currentStock) {
      setQuantity(newQuantity);
    }
  };

  const calculateTotal = () => {
    const subtotal = item.unitPrice * quantity;
    const tax = subtotal * 0.08; // 8% tax
    return {
      subtotal,
      tax,
      total: subtotal + tax
    };
  };

  const validateForm = () => {
    if (quantity < 1 || quantity > item.currentStock) {
      setError('Invalid quantity selected');
      return false;
    }

    if (!deliveryAddress.street || !deliveryAddress.city || !deliveryAddress.state || !deliveryAddress.zipCode) {
      setError('Please provide complete delivery address');
      return false;
    }

    if (orderType === 'prescription') {
      if (!prescriptionDetails.prescriptionId || !prescriptionDetails.doctorName || !prescriptionDetails.licenseNumber) {
        setError('Prescription details are required for medication orders');
        return false;
      }
    }

    if (userRole === 'patient' && (priority === 'high' || priority === 'urgent') && !justification) {
      setError('Justification is required for high priority orders');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const { subtotal, tax, total } = calculateTotal();

      const orderData = {
        orderType,
        priority,
        items: [{
          item: item._id,
          quantity,
          unitPrice: item.unitPrice,
          subtotal
        }],
        totalAmount: subtotal,
        tax: {
          rate: 0.08,
          amount: tax
        },
        finalAmount: total,
        deliveryInformation: {
          address: deliveryAddress,
          phone: deliveryAddress.phone
        },
        justification: justification || undefined,
        prescriptionDetails: orderType === 'prescription' ? {
          ...prescriptionDetails,
          issuedDate: new Date(prescriptionDetails.issuedDate),
          validUntil: new Date(prescriptionDetails.validUntil)
        } : undefined
      };

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Order created successfully:', result);
        onClose();
        // You might want to show a success message or redirect
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to create order');
      }
    } catch (error) {
      console.error('Error creating order:', error);
      setError('Failed to create order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  if (!isOpen) return null;

  const { subtotal, tax, total } = calculateTotal();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-3">
            <FaShoppingCart className="h-6 w-6 text-blue-600" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Order Request</h2>
              <p className="text-sm text-gray-500">{item.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <span className="sr-only">Close</span>
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[75vh]">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
              <FaExclamationTriangle className="h-5 w-5 text-red-500 flex-shrink-0" />
              <span className="text-sm text-red-700">{error}</span>
            </div>
          )}

          {/* Item Summary */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3 mb-3">
              <FaBox className="h-5 w-5 text-gray-400" />
              <div>
                <h3 className="font-medium text-gray-900">{item.name}</h3>
                <p className="text-sm text-gray-600">SKU: {item.sku} | Available: {item.currentStock} units</p>
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-2">{item.description}</p>
            <div className="flex items-center justify-between text-sm">
              <span>Unit Price: {formatCurrency(item.unitPrice)}</span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                item.stockStatus === 'in_stock' 
                  ? 'text-green-600 bg-green-100'
                  : item.stockStatus === 'low_stock'
                  ? 'text-yellow-600 bg-yellow-100'
                  : 'text-red-600 bg-red-100'
              }`}>
                {item.stockStatus.replace('_', ' ')}
              </span>
            </div>
          </div>

          <div className="space-y-6">
            {/* Quantity */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quantity *
              </label>
              <div className="flex items-center space-x-3">
                <button
                  type="button"
                  onClick={() => handleQuantityChange(quantity - 1)}
                  disabled={quantity <= 1}
                  className="p-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FaMinus className="h-4 w-4" />
                </button>
                <input
                  type="number"
                  min="1"
                  max={item.currentStock}
                  value={quantity}
                  onChange={(e) => handleQuantityChange(parseInt(e.target.value))}
                  className="w-20 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center"
                />
                <button
                  type="button"
                  onClick={() => handleQuantityChange(quantity + 1)}
                  disabled={quantity >= item.currentStock}
                  className="p-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FaPlus className="h-4 w-4" />
                </button>
                <span className="text-sm text-gray-600">
                  Max: {item.currentStock} available
                </span>
              </div>
            </div>

            {/* Order Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Order Type *
              </label>
              <select
                value={orderType}
                onChange={(e) => setOrderType(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="general">General Order</option>
                <option value="clinical_supplies">Clinical Supplies</option>
                <option value="equipment">Equipment</option>
                {(userRole === 'patient' || userRole === 'doctor') && (
                  <option value="prescription">Prescription</option>
                )}
              </select>
            </div>

            {/* Priority */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Priority *
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="low">Low</option>
                <option value="normal">Normal</option>
                {userRole !== 'patient' && <option value="high">High</option>}
                {userRole === 'admin' && <option value="urgent">Urgent</option>}
              </select>
            </div>

            {/* Justification for high priority */}
            {(priority === 'high' || priority === 'urgent') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Justification * <span className="text-xs text-gray-500">(Required for high priority orders)</span>
                </label>
                <textarea
                  value={justification}
                  onChange={(e) => setJustification(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Please explain why this order requires high priority..."
                />
              </div>
            )}

            {/* Prescription Details */}
            {orderType === 'prescription' && (
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">Prescription Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Prescription ID *
                    </label>
                    <input
                      type="text"
                      value={prescriptionDetails.prescriptionId}
                      onChange={(e) => setPrescriptionDetails({...prescriptionDetails, prescriptionId: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="RX-12345"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Doctor Name *
                    </label>
                    <input
                      type="text"
                      value={prescriptionDetails.doctorName}
                      onChange={(e) => setPrescriptionDetails({...prescriptionDetails, doctorName: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Dr. John Smith"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      License Number *
                    </label>
                    <input
                      type="text"
                      value={prescriptionDetails.licenseNumber}
                      onChange={(e) => setPrescriptionDetails({...prescriptionDetails, licenseNumber: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="MD123456"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Valid Until
                    </label>
                    <input
                      type="date"
                      value={prescriptionDetails.validUntil}
                      onChange={(e) => setPrescriptionDetails({...prescriptionDetails, validUntil: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Delivery Address */}
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">Delivery Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Street Address *
                  </label>
                  <input
                    type="text"
                    value={deliveryAddress.street}
                    onChange={(e) => setDeliveryAddress({...deliveryAddress, street: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="123 Main Street"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    City *
                  </label>
                  <input
                    type="text"
                    value={deliveryAddress.city}
                    onChange={(e) => setDeliveryAddress({...deliveryAddress, city: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Boston"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    State *
                  </label>
                  <input
                    type="text"
                    value={deliveryAddress.state}
                    onChange={(e) => setDeliveryAddress({...deliveryAddress, state: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="MA"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ZIP Code *
                  </label>
                  <input
                    type="text"
                    value={deliveryAddress.zipCode}
                    onChange={(e) => setDeliveryAddress({...deliveryAddress, zipCode: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="02115"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={deliveryAddress.phone}
                    onChange={(e) => setDeliveryAddress({...deliveryAddress, phone: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="+1-555-0123"
                  />
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-3">Order Summary</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Subtotal ({quantity} × {formatCurrency(item.unitPrice)}):</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax (8%):</span>
                  <span>{formatCurrency(tax)}</span>
                </div>
                <div className="flex justify-between font-medium text-lg pt-2 border-t">
                  <span>Total:</span>
                  <span>{formatCurrency(total)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end space-x-3 mt-8 pt-6 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || item.stockStatus === 'out_of_stock'}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Processing...' : 'Submit Order Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OrderRequestModal;
