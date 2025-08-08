import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/router';
import Link from 'next/link';

interface MedicalItem {
  _id: string;
  name: string;
  category: string;
  sku: string;
  price: number;
  unit: string;
  inStock: boolean;
  minQuantity: number;
  currentStock: number;
}

interface OrderItem {
  itemId: string;
  item: MedicalItem;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  notes?: string;
}

export default function CreateOrder() {
  const { user, isAuthenticated, loading, logout } = useAuth();
  const router = useRouter();
  const [medicalItems, setMedicalItems] = useState<MedicalItem[]>([
    {
      _id: '1',
      name: 'Paracetamol 500mg',
      category: 'Medicine',
      sku: 'MED001',
      price: 5.0,
      unit: 'tablets',
      inStock: true,
      minQuantity: 100,
      currentStock: 500
    },
    {
      _id: '2',
      name: 'Surgical Gloves (Box)',
      category: 'Medical Supplies',
      sku: 'SUP001',
      price: 25.0,
      unit: 'box',
      inStock: true,
      minQuantity: 50,
      currentStock: 200
    },
    {
      _id: '3',
      name: 'Digital Thermometer',
      category: 'Equipment',
      sku: 'EQP001',
      price: 150.0,
      unit: 'piece',
      inStock: true,
      minQuantity: 10,
      currentStock: 25
    },
    {
      _id: '4',
      name: 'Insulin Syringes',
      category: 'Medical Supplies',
      sku: 'SUP002',
      price: 0.5,
      unit: 'piece',
      inStock: true,
      minQuantity: 500,
      currentStock: 1000
    }
  ]);

  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [orderType, setOrderType] = useState('prescription');
  const [priority, setPriority] = useState('normal');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const categories = ['all', 'Medicine', 'Medical Supplies', 'Equipment', 'Consumables'];
  const orderTypes = [
    { value: 'prescription', label: 'Prescription' },
    { value: 'clinical_supplies', label: 'Clinical Supplies' },
    { value: 'equipment', label: 'Equipment' },
    { value: 'consumables', label: 'Consumables' },
    { value: 'emergency', label: 'Emergency' }
  ];

  const priorities = [
    { value: 'low', label: 'Low', color: 'text-green-400' },
    { value: 'normal', label: 'Normal', color: 'text-blue-400' },
    { value: 'high', label: 'High', color: 'text-orange-400' },
    { value: 'urgent', label: 'Urgent', color: 'text-red-400' }
  ];

  const filteredItems = medicalItems.filter(item => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.sku.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const addToOrder = (item: MedicalItem) => {
    const existingItem = orderItems.find(orderItem => orderItem.itemId === item._id);
    
    if (existingItem) {
      setOrderItems(prev => prev.map(orderItem =>
        orderItem.itemId === item._id
          ? {
              ...orderItem,
              quantity: orderItem.quantity + 1,
              subtotal: (orderItem.quantity + 1) * orderItem.unitPrice
            }
          : orderItem
      ));
    } else {
      setOrderItems(prev => [...prev, {
        itemId: item._id,
        item: item,
        quantity: 1,
        unitPrice: item.price,
        subtotal: item.price
      }]);
    }
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromOrder(itemId);
    } else {
      setOrderItems(prev => prev.map(orderItem =>
        orderItem.itemId === itemId
          ? {
              ...orderItem,
              quantity,
              subtotal: quantity * orderItem.unitPrice
            }
          : orderItem
      ));
    }
  };

  const removeFromOrder = (itemId: string) => {
    setOrderItems(prev => prev.filter(orderItem => orderItem.itemId !== itemId));
  };

  const totalAmount = orderItems.reduce((sum, item) => sum + item.subtotal, 0);

  const handleSubmitOrder = async () => {
    if (orderItems.length === 0) {
      alert('Please add at least one item to the order');
      return;
    }

    const orderData = {
      orderType,
      priority,
      items: orderItems,
      totalAmount,
      finalAmount: totalAmount,
      notes
    };

    // Here you would normally send to API
    console.log('Order submitted:', orderData);
    alert('Order created successfully!');
    router.push('/orders');
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
                  <h1 className="text-xl font-bold text-white">MediMitra</h1>
                  <p className="text-xs text-gray-400">Create Order</p>
                </div>
              </Link>
            </div>

            {/* User Menu */}
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-white font-medium">{user?.name}</p>
                <p className="text-xs text-gray-400">{user?.email}</p>
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
              <Link href="/orders" className="text-gray-400 hover:text-gray-300 text-sm">
                Orders
              </Link>
              <span className="text-gray-600">→</span>
              <span className="text-blue-400 text-sm font-medium">Create New Order</span>
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
                  Create New Order 🛒
                </h1>
                <p className="text-blue-100">
                  Add medical supplies, equipment, and medications to your order
                </p>
              </div>
              <div className="text-6xl opacity-20">📦</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Item Selection */}
          <div className="lg:col-span-2">
            {/* Order Configuration */}
            <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700 rounded-xl p-6 mb-6">
              <h3 className="text-xl font-bold text-white mb-4">Order Configuration</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">Order Type</label>
                  <select
                    value={orderType}
                    onChange={(e) => setOrderType(e.target.value)}
                    className="w-full bg-slate-700/50 border border-slate-600 text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {orderTypes.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="w-full bg-slate-700/50 border border-slate-600 text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {priorities.map(p => (
                      <option key={p.value} value={p.value}>{p.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Filters and Search */}
            <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700 rounded-xl p-6 mb-6">
              <h3 className="text-xl font-bold text-white mb-4">Find Items</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">Category</label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full bg-slate-700/50 border border-slate-600 text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {categories.map(category => (
                      <option key={category} value={category}>
                        {category === 'all' ? 'All Categories' : category}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">Search</label>
                  <input
                    type="text"
                    placeholder="Search by name or SKU..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-slate-700/50 border border-slate-600 text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400"
                  />
                </div>
              </div>
            </div>

            {/* Available Items */}
            <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700 rounded-xl p-6">
              <h3 className="text-xl font-bold text-white mb-4">Available Items</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredItems.map((item) => (
                  <div key={item._id} className="bg-slate-700/30 border border-slate-600 rounded-lg p-4 hover:border-slate-500 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="text-white font-semibold">{item.name}</h4>
                        <p className="text-gray-400 text-sm">{item.category} • SKU: {item.sku}</p>
                        <div className="mt-2">
                          <span className="text-emerald-400 font-bold">₹{item.price}</span>
                          <span className="text-gray-400 text-sm">/{item.unit}</span>
                        </div>
                        <div className="mt-2">
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            item.currentStock > item.minQuantity 
                              ? 'bg-emerald-500/10 text-emerald-400' 
                              : 'bg-orange-500/10 text-orange-400'
                          }`}>
                            {item.currentStock} in stock
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => addToOrder(item)}
                        disabled={!item.inStock}
                        className="bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 px-3 py-2 rounded-lg text-sm font-medium transition-colors border border-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700 rounded-xl p-6 sticky top-24">
              <h3 className="text-xl font-bold text-white mb-4">Order Summary</h3>
              
              {orderItems.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-4xl mb-4 opacity-50">🛒</div>
                  <p className="text-gray-400">No items added yet</p>
                </div>
              ) : (
                <>
                  <div className="space-y-4 mb-6">
                    {orderItems.map((orderItem) => (
                      <div key={orderItem.itemId} className="bg-slate-700/30 border border-slate-600 rounded-lg p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <h4 className="text-white font-medium text-sm">{orderItem.item.name}</h4>
                            <p className="text-gray-400 text-xs">₹{orderItem.unitPrice}/{orderItem.item.unit}</p>
                          </div>
                          <button
                            onClick={() => removeFromOrder(orderItem.itemId)}
                            className="text-red-400 hover:text-red-300 text-xs"
                          >
                            Remove
                          </button>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => updateQuantity(orderItem.itemId, orderItem.quantity - 1)}
                              className="bg-slate-600 hover:bg-slate-500 text-white w-6 h-6 rounded text-xs"
                            >
                              -
                            </button>
                            <span className="text-white text-sm w-8 text-center">{orderItem.quantity}</span>
                            <button
                              onClick={() => updateQuantity(orderItem.itemId, orderItem.quantity + 1)}
                              className="bg-slate-600 hover:bg-slate-500 text-white w-6 h-6 rounded text-xs"
                            >
                              +
                            </button>
                          </div>
                          <span className="text-emerald-400 font-bold text-sm">₹{orderItem.subtotal.toFixed(2)}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-slate-600 pt-4 mb-6">
                    <div className="flex justify-between text-xl font-bold">
                      <span className="text-white">Total:</span>
                      <span className="text-emerald-400">₹{totalAmount.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="mb-6">
                    <label className="block text-gray-300 text-sm font-medium mb-2">Order Notes</label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Add any special instructions..."
                      className="w-full bg-slate-700/50 border border-slate-600 text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400 h-20 resize-none"
                    />
                  </div>

                  <button
                    onClick={handleSubmitOrder}
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-lg font-medium transition-colors"
                  >
                    Create Order
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
