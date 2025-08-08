const Inventory = require('../models/Inventory');
const Supplier = require('../models/Supplier');
const NotificationService = require('../services/notificationService');
const mongoose = require('mongoose');

// @desc    Get all inventory items with pagination and filtering
// @route   GET /api/inventory
// @access  Private (Registered Patient, Doctor, Admin with role-based filtering)
const getInventoryItems = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // Build filter object
    const filter = {};
    
    // Enhanced role-based filtering
    if (req.user.role === 'patient') {
      // Patients can only see available items with stock > 0
      filter.isAvailable = true;
      filter.currentStock = { $gt: 0 };
      filter.isExpired = { $ne: true }; // Don't show expired items to patients
      
      // Patients can only see certain categories (exclude sensitive items)
      const patientAllowedCategories = ['supplies', 'consumables', 'devices'];
      if (req.query.category && !patientAllowedCategories.includes(req.query.category.toLowerCase())) {
        return res.status(403).json({ 
          message: 'Access denied. You can only view supplies, consumables, and devices.' 
        });
      }
      
      // If no category specified, limit to patient-allowed categories
      if (!req.query.category) {
        filter.category = { $in: patientAllowedCategories };
      }
    } else {
      // Doctors and admins can see all items with optional availability filter
      if (req.query.available !== undefined) {
        filter.isAvailable = req.query.available === 'true';
      }
    }
    
    // Search by name or description
    if (req.query.search) {
      filter.$text = { $search: req.query.search };
    }
    
    // Stock level filters
    if (req.query.lowStock === 'true') {
      filter.isLowStock = true;
    }
    
    if (req.query.outOfStock === 'true') {
      filter.currentStock = 0;
    }
    
    // Price range filter
    if (req.query.minPrice || req.query.maxPrice) {
      filter.unitPrice = {};
      if (req.query.minPrice) filter.unitPrice.$gte = parseFloat(req.query.minPrice);
      if (req.query.maxPrice) filter.unitPrice.$lte = parseFloat(req.query.maxPrice);
    }
    
    // Expiry filter
    if (req.query.expiring) {
      const days = parseInt(req.query.expiring) || 30;
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + days);
      
      filter.expiryDate = {
        $exists: true,
        $lte: futureDate,
        $gte: new Date()
      };
    }
    
    // Sort options
    let sort = {};
    if (req.query.sortBy) {
      const sortField = req.query.sortBy;
      const sortOrder = req.query.sortOrder === 'desc' ? -1 : 1;
      sort[sortField] = sortOrder;
    } else {
      sort = { name: 1 }; // Default sort by name
    }
    
    const items = await Inventory.find(filter)
      .populate('supplier', 'name contactInfo.email contactInfo.phone')
      .populate('createdBy', 'name')
      .sort(sort)
      .skip(skip)
      .limit(limit);
    
    const total = await Inventory.countDocuments(filter);
    const totalPages = Math.ceil(total / limit);
    
    res.json({
      success: true,
      data: items,
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
    console.error('Error fetching inventory:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching inventory items'
    });
  }
};

// @desc    Get single inventory item
// @route   GET /api/inventory/:id
// @access  Private (Registered Patient, Doctor, Admin with role-based access)
const getInventoryItem = async (req, res) => {
  try {
    const item = await Inventory.findById(req.params.id)
      .populate('supplier', 'name contactInfo address')
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email');
    
    if (!item) {
      return res.status(404).json({
        success: false,
        error: 'Inventory item not found'
      });
    }
    
    // Enhanced patient access restrictions
    if (req.user.role === 'patient') {
      // Patients can only view available, non-expired items with stock
      if (!item.isAvailable || item.currentStock === 0 || item.isExpired) {
        return res.status(404).json({
          success: false,
          error: 'Item not available'
        });
      }
      
      // Patients cannot view sensitive categories (medications, medical equipment)
      const restrictedCategories = ['medication', 'medical_equipment'];
      if (restrictedCategories.includes(item.category)) {
        return res.status(403).json({
          success: false,
          error: 'Access denied. Patients cannot view this type of inventory item.'
        });
      }
    }
    
    res.json({
      success: true,
      data: item
    });
  } catch (error) {
    console.error('Error fetching inventory item:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching inventory item'
    });
  }
};

// @desc    Add new inventory item
// @route   POST /api/inventory
// @access  Private (Admin only)
const addInventoryItem = async (req, res) => {
  try {
    const itemData = {
      ...req.body,
      createdBy: req.user._id
    };
    
    // Validate supplier exists
    if (itemData.supplier) {
      const supplier = await Supplier.findById(itemData.supplier);
      if (!supplier || !supplier.isActive) {
        return res.status(400).json({
          success: false,
          error: 'Invalid or inactive supplier'
        });
      }
    }
    
    const item = new Inventory(itemData);
    await item.save();
    
    await item.populate('supplier', 'name contactInfo.email');
    
    res.status(201).json({
      success: true,
      message: 'Inventory item added successfully',
      data: item
    });
  } catch (error) {
    console.error('Error adding inventory item:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: errors
      });
    }
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        error: 'SKU already exists'
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Server error while adding inventory item'
    });
  }
};

// @desc    Update inventory item
// @route   PUT /api/inventory/:id
// @access  Private (Admin only)
const updateInventoryItem = async (req, res) => {
  try {
    const updateData = {
      ...req.body,
      updatedBy: req.user._id
    };
    
    // Validate supplier if provided
    if (updateData.supplier) {
      const supplier = await Supplier.findById(updateData.supplier);
      if (!supplier || !supplier.isActive) {
        return res.status(400).json({
          success: false,
          error: 'Invalid or inactive supplier'
        });
      }
    }
    
    const item = await Inventory.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('supplier', 'name contactInfo.email');
    
    if (!item) {
      return res.status(404).json({
        success: false,
        error: 'Inventory item not found'
      });
    }

    // Check if stock level is now low and send notification
    if (item.currentStock <= item.minimumStock && item.currentStock > 0) {
      await NotificationService.notifyLowStock({
        _id: item._id,
        name: item.name,
        currentStock: item.currentStock,
        minimumStock: item.minimumStock
      });
    }
    
    res.json({
      success: true,
      message: 'Inventory item updated successfully',
      data: item
    });
  } catch (error) {
    console.error('Error updating inventory item:', error);
    
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
      error: 'Server error while updating inventory item'
    });
  }
};

// @desc    Update stock level
// @route   PATCH /api/inventory/:id/stock
// @access  Private (Admin only)
const updateStock = async (req, res) => {
  try {
    const { quantity, operation, reason } = req.body;
    
    if (!quantity || !operation) {
      return res.status(400).json({
        success: false,
        error: 'Quantity and operation are required'
      });
    }
    
    const item = await Inventory.findById(req.params.id);
    
    if (!item) {
      return res.status(404).json({
        success: false,
        error: 'Inventory item not found'
      });
    }
    
    let newStock;
    
    switch (operation) {
      case 'add':
        newStock = item.currentStock + quantity;
        if (operation === 'add') {
          item.lastRestocked = new Date();
        }
        break;
      case 'subtract':
        newStock = item.currentStock - quantity;
        break;
      case 'set':
        newStock = quantity;
        break;
      default:
        return res.status(400).json({
          success: false,
          error: 'Invalid operation. Use add, subtract, or set'
        });
    }
    
    if (newStock < 0) {
      return res.status(400).json({
        success: false,
        error: 'Stock cannot be negative'
      });
    }
    
    item.currentStock = newStock;
    item.updatedBy = req.user._id;
    
    await item.save();
    
    res.json({
      success: true,
      message: `Stock ${operation}ed successfully`,
      data: {
        itemId: item._id,
        name: item.name,
        previousStock: item.currentStock,
        newStock: newStock,
        operation,
        reason
      }
    });
  } catch (error) {
    console.error('Error updating stock:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while updating stock'
    });
  }
};

// @desc    Delete inventory item
// @route   DELETE /api/inventory/:id
// @access  Private (Admin only)
const deleteInventoryItem = async (req, res) => {
  try {
    const item = await Inventory.findByIdAndDelete(req.params.id);
    
    if (!item) {
      return res.status(404).json({
        success: false,
        error: 'Inventory item not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Inventory item deleted successfully',
      data: {
        deletedItem: {
          id: item._id,
          name: item.name,
          sku: item.sku
        }
      }
    });
  } catch (error) {
    console.error('Error deleting inventory item:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while deleting inventory item'
    });
  }
};

// @desc    Get low stock items
// @route   GET /api/inventory/alerts/low-stock
// @access  Private (Doctor, Admin)
const getLowStockItems = async (req, res) => {
  try {
    const items = await Inventory.getLowStockItems();
    
    res.json({
      success: true,
      count: items.length,
      data: items
    });
  } catch (error) {
    console.error('Error fetching low stock items:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching low stock items'
    });
  }
};

// @desc    Get expiring items
// @route   GET /api/inventory/alerts/expiring
// @access  Private (Doctor, Admin)
const getExpiringItems = async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const items = await Inventory.getExpiringItems(days);
    
    res.json({
      success: true,
      count: items.length,
      data: items,
      meta: {
        daysThreshold: days
      }
    });
  } catch (error) {
    console.error('Error fetching expiring items:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching expiring items'
    });
  }
};

// @desc    Get expired items
// @route   GET /api/inventory/alerts/expired
// @access  Private (Admin only)
const getExpiredItems = async (req, res) => {
  try {
    const items = await Inventory.getExpiredItems();
    
    res.json({
      success: true,
      count: items.length,
      data: items
    });
  } catch (error) {
    console.error('Error fetching expired items:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching expired items'
    });
  }
};

// @desc    Get inventory analytics
// @route   GET /api/inventory/analytics
// @access  Private (Admin only)
const getInventoryAnalytics = async (req, res) => {
  try {
    const totalItems = await Inventory.countDocuments({ isAvailable: true });
    const lowStockItems = await Inventory.countDocuments({ isLowStock: true, isAvailable: true });
    const outOfStockItems = await Inventory.countDocuments({ currentStock: 0 });
    const expiredItems = await Inventory.countDocuments({ isExpired: true });
    
    // Get expiring items in next 30 days
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 30);
    const expiringItems = await Inventory.countDocuments({
      expiryDate: { $exists: true, $lte: futureDate, $gte: new Date() },
      isAvailable: true
    });
    
    // Category breakdown
    const categoryBreakdown = await Inventory.aggregate([
      { $match: { isAvailable: true } },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          totalValue: { $sum: '$totalValue' },
          averagePrice: { $avg: '$unitPrice' }
        }
      }
    ]);
    
    // Total inventory value
    const totalValueResult = await Inventory.aggregate([
      { $match: { isAvailable: true } },
      {
        $group: {
          _id: null,
          totalValue: { $sum: '$totalValue' }
        }
      }
    ]);
    
    const totalInventoryValue = totalValueResult.length > 0 ? totalValueResult[0].totalValue : 0;
    
    // Most expensive items
    const mostExpensiveItems = await Inventory.find({ isAvailable: true })
      .select('name category unitPrice currentStock totalValue')
      .sort({ unitPrice: -1 })
      .limit(5);
    
    // Items by supplier
    const supplierBreakdown = await Inventory.aggregate([
      { $match: { isAvailable: true } },
      {
        $lookup: {
          from: 'suppliers',
          localField: 'supplier',
          foreignField: '_id',
          as: 'supplierInfo'
        }
      },
      { $unwind: '$supplierInfo' },
      {
        $group: {
          _id: '$supplier',
          supplierName: { $first: '$supplierInfo.name' },
          itemCount: { $sum: 1 },
          totalValue: { $sum: '$totalValue' }
        }
      },
      { $sort: { itemCount: -1 } },
      { $limit: 10 }
    ]);
    
    res.json({
      success: true,
      data: {
        summary: {
          totalItems,
          lowStockItems,
          outOfStockItems,
          expiredItems,
          expiringItems,
          totalInventoryValue
        },
        categoryBreakdown,
        supplierBreakdown,
        mostExpensiveItems
      }
    });
  } catch (error) {
    console.error('Error fetching inventory analytics:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching inventory analytics'
    });
  }
};

// @desc    Search inventory items
// @route   GET /api/inventory/search
// @access  Private (Patient, Doctor, Admin)
const searchInventory = async (req, res) => {
  try {
    const { query, category, available } = req.query;
    
    if (!query) {
      return res.status(400).json({
        success: false,
        error: 'Search query is required'
      });
    }
    
    const filter = {
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
        { sku: { $regex: query, $options: 'i' } },
        { manufacturer: { $regex: query, $options: 'i' } }
      ]
    };
    
    if (category) {
      filter.category = category.toLowerCase();
    }
    
    if (req.user.role === 'patient') {
      filter.isAvailable = true;
      filter.currentStock = { $gt: 0 };
    } else if (available !== undefined) {
      filter.isAvailable = available === 'true';
    }
    
    const items = await Inventory.find(filter)
      .populate('supplier', 'name contactInfo.email')
      .select('name category sku unitPrice currentStock isAvailable description')
      .limit(20);
    
    res.json({
      success: true,
      count: items.length,
      data: items
    });
  } catch (error) {
    console.error('Error searching inventory:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while searching inventory'
    });
  }
};

module.exports = {
  getInventoryItems,
  getInventoryItem,
  addInventoryItem,
  updateInventoryItem,
  updateStock,
  deleteInventoryItem,
  getLowStockItems,
  getExpiringItems,
  getExpiredItems,
  getInventoryAnalytics,
  searchInventory
};
