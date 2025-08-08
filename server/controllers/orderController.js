const Order = require('../models/Order');
const Inventory = require('../models/Inventory');
const User = require('../models/User');
const NotificationService = require('../services/notificationService');
const mongoose = require('mongoose');

// @desc    Create new order
// @route   POST /api/orders
// @access  Private (Registered Patient, Doctor, Admin)
const createOrder = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const {
      orderType,
      priority,
      items,
      deliveryInformation,
      payment,
      notes,
      prescriptionDetails
    } = req.body;

    // Enhanced user validation (req.user already validated by middleware)
    const user = req.user;

    // Role-specific validations
    if (user.role === 'patient') {
      // Patients can only create certain types of orders
      const allowedOrderTypes = ['prescription', 'clinical_supplies'];
      if (!allowedOrderTypes.includes(orderType)) {
        return res.status(403).json({
          success: false,
          error: 'Patients can only place prescription or clinical supply orders'
        });
      }

      // Patients cannot set high priority
      if (priority === 'high' || priority === 'urgent') {
        return res.status(403).json({
          success: false,
          error: 'Patients cannot set high or urgent priority orders'
        });
      }

      // Validate prescription details for medication orders
      if (orderType === 'prescription' && !prescriptionDetails) {
        return res.status(400).json({
          success: false,
          error: 'Prescription details are required for medication orders'
        });
      }
    }

    // Validate items and check availability
    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'At least one item is required'
      });
    }

    const orderItems = [];
    let totalAmount = 0;

    for (const item of items) {
      const inventoryItem = await Inventory.findById(item.item).session(session);
      
      if (!inventoryItem) {
        return res.status(404).json({
          success: false,
          error: `Item with ID ${item.item} not found`
        });
      }

      if (!inventoryItem.isAvailable) {
        return res.status(400).json({
          success: false,
          error: `Item ${inventoryItem.name} is not available`
        });
      }

      // Enhanced patient restrictions for inventory items
      if (user.role === 'patient') {
        // Patients cannot order expired items
        if (inventoryItem.isExpired) {
          return res.status(400).json({
            success: false,
            error: `Item ${inventoryItem.name} has expired and cannot be ordered`
          });
        }

        // Patients cannot order restricted categories unless it's a prescription order
        const restrictedCategories = ['medication', 'medical_equipment'];
        if (restrictedCategories.includes(inventoryItem.category) && orderType !== 'prescription') {
          return res.status(403).json({
            success: false,
            error: `Patients can only order ${inventoryItem.category} items through prescription orders`
          });
        }
      }

      if (inventoryItem.currentStock < item.quantity) {
        return res.status(400).json({
          success: false,
          error: `Insufficient stock for ${inventoryItem.name}. Available: ${inventoryItem.currentStock}, Requested: ${item.quantity}`
        });
      }

      const subtotal = item.quantity * inventoryItem.unitPrice;
      totalAmount += subtotal;

      orderItems.push({
        item: item.item,
        quantity: item.quantity,
        unitPrice: inventoryItem.unitPrice,
        subtotal: subtotal,
        notes: item.notes || ''
      });

      // Reserve stock (reduce current stock)
      inventoryItem.currentStock -= item.quantity;
      await inventoryItem.save({ session });
    }

    // Determine if order requires approval
    let requiresApproval = true;
    
    // Patients always need approval for orders over certain amount or specific categories
    if (req.user.role === 'patient') {
      requiresApproval = true;
    }
    
    // Doctors may not need approval for basic supplies under certain amount
    if (req.user.role === 'doctor' && totalAmount < 500 && orderType === 'clinical_supplies') {
      requiresApproval = false;
    }

    // Admin orders may not need approval
    if (req.user.role === 'admin') {
      requiresApproval = false;
    }

    // Calculate tax and final amount
    const taxRate = 0.08; // 8% tax rate
    const taxAmount = totalAmount * taxRate;
    const shippingCost = totalAmount > 100 ? 0 : 15; // Free shipping over $100
    const finalAmount = totalAmount + taxAmount + shippingCost;

    const orderData = {
      user: req.user._id,
      orderType: orderType || 'clinical_supplies',
      priority: priority || 'normal',
      items: orderItems,
      totalAmount,
      tax: {
        rate: taxRate,
        amount: taxAmount
      },
      finalAmount,
      status: requiresApproval ? 'pending' : 'approved',
      deliveryInformation: deliveryInformation || {},
      shipping: {
        method: req.body.shippingMethod || 'standard',
        cost: shippingCost
      },
      payment: payment || { method: 'credit_card', status: 'pending' },
      prescriptionDetails: prescriptionDetails || {},
      notes: notes || '',
      requiresApproval,
      isUrgent: priority === 'urgent'
    };

    // Set approval details if auto-approved
    if (!requiresApproval) {
      orderData.approvedBy = req.user._id;
      orderData.approvedAt = new Date();
    }

    const order = new Order(orderData);
    await order.save({ session });

    // Add initial status to history
    order.statusHistory.push({
      status: order.status,
      timestamp: new Date(),
      updatedBy: req.user._id,
      notes: requiresApproval ? 'Order created and pending approval' : 'Order created and auto-approved'
    });

    await order.save({ session });
    await session.commitTransaction();

    // Populate the order for response
    await order.populate([
      { path: 'user', select: 'name email role' },
      { path: 'items.item', select: 'name category sku' },
      { path: 'approvedBy', select: 'name' }
    ]);

    // Send notifications about new order to admins
    await NotificationService.notifyOrderPlaced({
      _id: order._id,
      requestedBy: req.user._id,
      items: order.items,
      totalAmount: order.totalAmount,
      status: order.status
    });

    res.status(201).json({
      success: true,
      message: requiresApproval ? 'Order created successfully and is pending approval' : 'Order created and approved successfully',
      data: order
    });

  } catch (error) {
    await session.abortTransaction();
    console.error('Error creating order:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: errors
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Server error while creating order'
    });
  } finally {
    session.endSession();
  }
};

// @desc    Get orders with filtering and pagination
// @route   GET /api/orders
// @access  Private (Patient: own orders, Doctor/Admin: all orders)
const getOrders = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Build filter
    const filter = {};

    // Role-based filtering
    if (req.user.role === 'patient') {
      filter.user = req.user._id;
    } else if (req.query.userId && req.user.role === 'admin') {
      filter.user = req.query.userId;
    }

    // Status filter
    if (req.query.status) {
      filter.status = req.query.status.toLowerCase();
    }

    // Order type filter
    if (req.query.orderType) {
      filter.orderType = req.query.orderType.toLowerCase();
    }

    // Priority filter
    if (req.query.priority) {
      filter.priority = req.query.priority.toLowerCase();
    }

    // Date range filter
    if (req.query.startDate || req.query.endDate) {
      filter.createdAt = {};
      if (req.query.startDate) {
        filter.createdAt.$gte = new Date(req.query.startDate);
      }
      if (req.query.endDate) {
        filter.createdAt.$lte = new Date(req.query.endDate);
      }
    }

    // Pending approval filter (admin only)
    if (req.query.pendingApproval === 'true' && req.user.role === 'admin') {
      filter.status = 'pending';
      filter.requiresApproval = true;
    }

    // Sort options
    let sort = {};
    if (req.query.sortBy) {
      const sortField = req.query.sortBy;
      const sortOrder = req.query.sortOrder === 'desc' ? -1 : 1;
      sort[sortField] = sortOrder;
    } else {
      sort = { createdAt: -1 }; // Default sort by newest first
    }

    const orders = await Order.find(filter)
      .populate('user', 'name email role phoneNumber')
      .populate('items.item', 'name category sku unitPrice')
      .populate('approvedBy', 'name')
      .populate('rejectedBy', 'name')
      .sort(sort)
      .skip(skip)
      .limit(limit);

    const total = await Order.countDocuments(filter);
    const totalPages = Math.ceil(total / limit);

    res.json({
      success: true,
      data: orders,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: total,
        itemsPerPage: limit,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching orders'
    });
  }
};

// @desc    Get single order
// @route   GET /api/orders/:id
// @access  Private (Patient: own orders, Doctor/Admin: all orders)
const getOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email role phoneNumber address')
      .populate('items.item', 'name category sku unitPrice description manufacturer')
      .populate('approvedBy', 'name email')
      .populate('rejectedBy', 'name email')
      .populate('statusHistory.updatedBy', 'name');

    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }

    // Check permissions - patients can only view their own orders
    if (req.user.role === 'patient' && order.user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Access denied. You can only view your own orders'
      });
    }

    res.json({
      success: true,
      data: order
    });

  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching order'
    });
  }
};

// @desc    Approve order
// @route   PATCH /api/orders/:id/approve
// @access  Private (Admin only)
const approveOrder = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { notes } = req.body;
    
    const order = await Order.findById(req.params.id).session(session);

    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }

    if (order.status !== 'pending') {
      return res.status(400).json({
        success: false,
        error: `Cannot approve order with status: ${order.status}`
      });
    }

    await order.approve(req.user._id, notes);
    await session.commitTransaction();

    await order.populate([
      { path: 'user', select: 'name email' },
      { path: 'items.item', select: 'name category sku' }
    ]);

    res.json({
      success: true,
      message: 'Order approved successfully',
      data: order
    });

  } catch (error) {
    await session.abortTransaction();
    console.error('Error approving order:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while approving order'
    });
  } finally {
    session.endSession();
  }
};

// @desc    Reject order
// @route   PATCH /api/orders/:id/reject
// @access  Private (Admin only)
const rejectOrder = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { reason } = req.body;

    if (!reason) {
      return res.status(400).json({
        success: false,
        error: 'Rejection reason is required'
      });
    }
    
    const order = await Order.findById(req.params.id).session(session);

    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }

    if (order.status !== 'pending') {
      return res.status(400).json({
        success: false,
        error: `Cannot reject order with status: ${order.status}`
      });
    }

    // Restore inventory stock
    for (const orderItem of order.items) {
      const inventoryItem = await Inventory.findById(orderItem.item).session(session);
      if (inventoryItem) {
        inventoryItem.currentStock += orderItem.quantity;
        await inventoryItem.save({ session });
      }
    }

    await order.reject(req.user._id, reason);
    await session.commitTransaction();

    await order.populate([
      { path: 'user', select: 'name email' },
      { path: 'rejectedBy', select: 'name' }
    ]);

    res.json({
      success: true,
      message: 'Order rejected successfully',
      data: order
    });

  } catch (error) {
    await session.abortTransaction();
    console.error('Error rejecting order:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while rejecting order'
    });
  } finally {
    session.endSession();
  }
};

// @desc    Update order status
// @route   PATCH /api/orders/:id/status
// @access  Private (Admin only)
const updateOrderStatus = async (req, res) => {
  try {
    const { status, notes } = req.body;
    
    const validStatuses = ['pending', 'approved', 'rejected', 'processing', 'shipped', 'delivered', 'completed', 'cancelled'];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid status'
      });
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }

    await order.updateStatus(status, req.user._id, notes);

    // Populate order for notification
    await order.populate([
      { path: 'user', select: 'name email role' },
      { path: 'items.item', select: 'name category sku' }
    ]);

    // Send notification about status change
    await NotificationService.notifyOrderStatusChanged({
      _id: order._id,
      requestedBy: order.user._id,
      items: order.items,
      status: order.status
    }, status);

    await order.populate([
      { path: 'user', select: 'name email' },
      { path: 'items.item', select: 'name category sku' }
    ]);

    res.json({
      success: true,
      message: `Order status updated to ${status}`,
      data: order
    });

  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while updating order status'
    });
  }
};

// @desc    Cancel order
// @route   PATCH /api/orders/:id/cancel
// @access  Private (Patient: own orders, Admin: all orders)
const cancelOrder = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { reason } = req.body;
    
    const order = await Order.findById(req.params.id).session(session);

    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }

    // Check permissions
    if (req.user.role === 'patient' && order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Access denied. You can only cancel your own orders'
      });
    }

    if (!order.canBeCancelled) {
      return res.status(400).json({
        success: false,
        error: `Cannot cancel order with status: ${order.status}`
      });
    }

    // Restore inventory stock if order was approved or pending
    if (['pending', 'approved'].includes(order.status)) {
      for (const orderItem of order.items) {
        const inventoryItem = await Inventory.findById(orderItem.item).session(session);
        if (inventoryItem) {
          inventoryItem.currentStock += orderItem.quantity;
          await inventoryItem.save({ session });
        }
      }
    }

    await order.updateStatus('cancelled', req.user._id, reason || 'Order cancelled by user');
    await session.commitTransaction();

    res.json({
      success: true,
      message: 'Order cancelled successfully',
      data: order
    });

  } catch (error) {
    await session.abortTransaction();
    console.error('Error cancelling order:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while cancelling order'
    });
  } finally {
    session.endSession();
  }
};

// @desc    Get order analytics
// @route   GET /api/orders/analytics
// @access  Private (Admin only)
const getOrderAnalytics = async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments();
    const pendingOrders = await Order.countDocuments({ status: 'pending' });
    const approvedOrders = await Order.countDocuments({ status: 'approved' });
    const completedOrders = await Order.countDocuments({ status: 'completed' });
    const cancelledOrders = await Order.countDocuments({ status: 'cancelled' });

    // Revenue analytics
    const revenueResult = await Order.aggregate([
      { $match: { status: { $in: ['completed', 'delivered'] } } },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$finalAmount' },
          averageOrderValue: { $avg: '$finalAmount' }
        }
      }
    ]);

    const revenue = revenueResult.length > 0 ? revenueResult[0] : { totalRevenue: 0, averageOrderValue: 0 };

    // Orders by status
    const ordersByStatus = await Order.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalValue: { $sum: '$finalAmount' }
        }
      }
    ]);

    // Orders by type
    const ordersByType = await Order.aggregate([
      {
        $group: {
          _id: '$orderType',
          count: { $sum: 1 },
          totalValue: { $sum: '$finalAmount' }
        }
      }
    ]);

    // Recent orders
    const recentOrders = await Order.find()
      .populate('user', 'name role')
      .select('orderNumber status totalAmount createdAt')
      .sort({ createdAt: -1 })
      .limit(10);

    // Monthly order trends (last 12 months)
    const monthlyTrends = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000) }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          orderCount: { $sum: 1 },
          totalRevenue: { $sum: '$finalAmount' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    res.json({
      success: true,
      data: {
        summary: {
          totalOrders,
          pendingOrders,
          approvedOrders,
          completedOrders,
          cancelledOrders,
          totalRevenue: revenue.totalRevenue,
          averageOrderValue: revenue.averageOrderValue
        },
        ordersByStatus,
        ordersByType,
        monthlyTrends,
        recentOrders
      }
    });

  } catch (error) {
    console.error('Error fetching order analytics:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching order analytics'
    });
  }
};

module.exports = {
  createOrder,
  getOrders,
  getOrder,
  approveOrder,
  rejectOrder,
  updateOrderStatus,
  cancelOrder,
  getOrderAnalytics
};
