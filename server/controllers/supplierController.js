const Supplier = require('../models/Supplier');
const Inventory = require('../models/Inventory');

// @desc    Get all suppliers with pagination and filtering
// @route   GET /api/suppliers
// @access  Private (Admin only)
const getSuppliers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Build filter object
    const filter = {};

    // Active filter
    if (req.query.active !== undefined) {
      filter.isActive = req.query.active === 'true';
    } else {
      filter.isActive = true; // Default to active suppliers only
    }

    // Preferred filter
    if (req.query.preferred === 'true') {
      filter.isPreferred = true;
    }

    // Specialty filter
    if (req.query.specialty) {
      filter.specialties = req.query.specialty.toLowerCase();
    }

    // Search by name
    if (req.query.search) {
      filter.$text = { $search: req.query.search };
    }

    // Rating filter
    if (req.query.minRating) {
      filter['performance.rating'] = { $gte: parseFloat(req.query.minRating) };
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

    const suppliers = await Supplier.find(filter)
      .populate('createdBy', 'name')
      .sort(sort)
      .skip(skip)
      .limit(limit);

    const total = await Supplier.countDocuments(filter);
    const totalPages = Math.ceil(total / limit);

    res.json({
      success: true,
      data: suppliers,
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
    console.error('Error fetching suppliers:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching suppliers'
    });
  }
};

// @desc    Get single supplier
// @route   GET /api/suppliers/:id
// @access  Private (Admin only)
const getSupplier = async (req, res) => {
  try {
    const supplier = await Supplier.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email');

    if (!supplier) {
      return res.status(404).json({
        success: false,
        error: 'Supplier not found'
      });
    }

    // Get inventory items from this supplier
    const inventoryItems = await Inventory.find({ supplier: req.params.id })
      .select('name category currentStock unitPrice totalValue')
      .limit(20);

    res.json({
      success: true,
      data: {
        supplier,
        inventoryItems: {
          items: inventoryItems,
          totalItems: inventoryItems.length
        }
      }
    });

  } catch (error) {
    console.error('Error fetching supplier:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching supplier'
    });
  }
};

// @desc    Add new supplier
// @route   POST /api/suppliers
// @access  Private (Admin only)
const addSupplier = async (req, res) => {
  try {
    const supplierData = {
      ...req.body,
      createdBy: req.user._id
    };

    const supplier = new Supplier(supplierData);
    await supplier.save();

    res.status(201).json({
      success: true,
      message: 'Supplier added successfully',
      data: supplier
    });

  } catch (error) {
    console.error('Error adding supplier:', error);
    
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
        error: 'Company registration number already exists'
      });
    }

    res.status(500).json({
      success: false,
      error: 'Server error while adding supplier'
    });
  }
};

// @desc    Update supplier
// @route   PUT /api/suppliers/:id
// @access  Private (Admin only)
const updateSupplier = async (req, res) => {
  try {
    const updateData = {
      ...req.body,
      updatedBy: req.user._id
    };

    const supplier = await Supplier.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!supplier) {
      return res.status(404).json({
        success: false,
        error: 'Supplier not found'
      });
    }

    res.json({
      success: true,
      message: 'Supplier updated successfully',
      data: supplier
    });

  } catch (error) {
    console.error('Error updating supplier:', error);
    
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
      error: 'Server error while updating supplier'
    });
  }
};

// @desc    Delete supplier
// @route   DELETE /api/suppliers/:id
// @access  Private (Admin only)
const deleteSupplier = async (req, res) => {
  try {
    // Check if supplier has active inventory items
    const inventoryCount = await Inventory.countDocuments({ 
      supplier: req.params.id,
      isAvailable: true 
    });

    if (inventoryCount > 0) {
      return res.status(400).json({
        success: false,
        error: 'Cannot delete supplier with active inventory items. Please reassign or deactivate items first.'
      });
    }

    const supplier = await Supplier.findByIdAndDelete(req.params.id);

    if (!supplier) {
      return res.status(404).json({
        success: false,
        error: 'Supplier not found'
      });
    }

    res.json({
      success: true,
      message: 'Supplier deleted successfully',
      data: {
        deletedSupplier: {
          id: supplier._id,
          name: supplier.name,
          companyRegistration: supplier.companyRegistration
        }
      }
    });

  } catch (error) {
    console.error('Error deleting supplier:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while deleting supplier'
    });
  }
};

// @desc    Toggle supplier active status
// @route   PATCH /api/suppliers/:id/toggle-active
// @access  Private (Admin only)
const toggleSupplierActive = async (req, res) => {
  try {
    const supplier = await Supplier.findById(req.params.id);

    if (!supplier) {
      return res.status(404).json({
        success: false,
        error: 'Supplier not found'
      });
    }

    supplier.isActive = !supplier.isActive;
    supplier.updatedBy = req.user._id;
    await supplier.save();

    // If deactivating supplier, mark their inventory as unavailable
    if (!supplier.isActive) {
      await Inventory.updateMany(
        { supplier: req.params.id },
        { isAvailable: false }
      );
    }

    res.json({
      success: true,
      message: `Supplier ${supplier.isActive ? 'activated' : 'deactivated'} successfully`,
      data: supplier
    });

  } catch (error) {
    console.error('Error toggling supplier status:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while updating supplier status'
    });
  }
};

// @desc    Toggle supplier preferred status
// @route   PATCH /api/suppliers/:id/toggle-preferred
// @access  Private (Admin only)
const toggleSupplierPreferred = async (req, res) => {
  try {
    const supplier = await Supplier.findById(req.params.id);

    if (!supplier) {
      return res.status(404).json({
        success: false,
        error: 'Supplier not found'
      });
    }

    if (!supplier.isActive) {
      return res.status(400).json({
        success: false,
        error: 'Cannot mark inactive supplier as preferred'
      });
    }

    supplier.isPreferred = !supplier.isPreferred;
    supplier.updatedBy = req.user._id;
    await supplier.save();

    res.json({
      success: true,
      message: `Supplier ${supplier.isPreferred ? 'marked as preferred' : 'removed from preferred'} successfully`,
      data: supplier
    });

  } catch (error) {
    console.error('Error toggling supplier preferred status:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while updating supplier preferred status'
    });
  }
};

// @desc    Update supplier performance
// @route   PATCH /api/suppliers/:id/performance
// @access  Private (Admin only)
const updateSupplierPerformance = async (req, res) => {
  try {
    const { deliveredOnTime, hasQualityIssues, rating, notes } = req.body;

    const supplier = await Supplier.findById(req.params.id);

    if (!supplier) {
      return res.status(404).json({
        success: false,
        error: 'Supplier not found'
      });
    }

    // Update performance metrics
    const orderData = {
      deliveredOnTime: deliveredOnTime || false,
      hasQualityIssues: hasQualityIssues || false
    };

    await supplier.updatePerformance(orderData);

    // Manual rating override if provided
    if (rating && rating >= 1 && rating <= 5) {
      supplier.performance.rating = rating;
      await supplier.save();
    }

    if (notes) {
      supplier.notes = notes;
      await supplier.save();
    }

    res.json({
      success: true,
      message: 'Supplier performance updated successfully',
      data: supplier
    });

  } catch (error) {
    console.error('Error updating supplier performance:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while updating supplier performance'
    });
  }
};

// @desc    Get preferred suppliers
// @route   GET /api/suppliers/preferred
// @access  Private (Admin only)
const getPreferredSuppliers = async (req, res) => {
  try {
    const suppliers = await Supplier.getPreferredSuppliers();

    res.json({
      success: true,
      count: suppliers.length,
      data: suppliers
    });

  } catch (error) {
    console.error('Error fetching preferred suppliers:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching preferred suppliers'
    });
  }
};

// @desc    Get suppliers by specialty
// @route   GET /api/suppliers/by-specialty/:specialty
// @access  Private (Admin only)
const getSuppliersBySpecialty = async (req, res) => {
  try {
    const { specialty } = req.params;
    const suppliers = await Supplier.getBySpecialty(specialty);

    res.json({
      success: true,
      count: suppliers.length,
      data: suppliers,
      meta: {
        specialty: specialty
      }
    });

  } catch (error) {
    console.error('Error fetching suppliers by specialty:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching suppliers by specialty'
    });
  }
};

// @desc    Get supplier analytics
// @route   GET /api/suppliers/analytics
// @access  Private (Admin only)
const getSupplierAnalytics = async (req, res) => {
  try {
    const totalSuppliers = await Supplier.countDocuments();
    const activeSuppliers = await Supplier.countDocuments({ isActive: true });
    const preferredSuppliers = await Supplier.countDocuments({ isPreferred: true, isActive: true });

    // Performance distribution
    const performanceDistribution = await Supplier.aggregate([
      { $match: { isActive: true } },
      {
        $bucket: {
          groupBy: '$performance.rating',
          boundaries: [1, 2, 3, 4, 5, 6],
          default: 'Other',
          output: {
            count: { $sum: 1 },
            suppliers: { $push: { name: '$name', rating: '$performance.rating' } }
          }
        }
      }
    ]);

    // Specialty breakdown
    const specialtyBreakdown = await Supplier.aggregate([
      { $match: { isActive: true } },
      { $unwind: '$specialties' },
      {
        $group: {
          _id: '$specialties',
          count: { $sum: 1 },
          averageRating: { $avg: '$performance.rating' }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Top performing suppliers
    const topSuppliers = await Supplier.find({ isActive: true })
      .select('name performance contactInfo.email specialties')
      .sort({ 'performance.rating': -1, 'performance.onTimeDeliveries': -1 })
      .limit(10);

    // Suppliers with quality issues
    const suppliersWithIssues = await Supplier.find({ 
      isActive: true,
      'performance.qualityIssues': { $gt: 0 }
    })
      .select('name performance contactInfo.email')
      .sort({ 'performance.qualityIssues': -1 })
      .limit(10);

    res.json({
      success: true,
      data: {
        summary: {
          totalSuppliers,
          activeSuppliers,
          preferredSuppliers,
          inactiveSuppliers: totalSuppliers - activeSuppliers
        },
        performanceDistribution,
        specialtyBreakdown,
        topSuppliers,
        suppliersWithIssues
      }
    });

  } catch (error) {
    console.error('Error fetching supplier analytics:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching supplier analytics'
    });
  }
};

module.exports = {
  getSuppliers,
  getSupplier,
  addSupplier,
  updateSupplier,
  deleteSupplier,
  toggleSupplierActive,
  toggleSupplierPreferred,
  updateSupplierPerformance,
  getPreferredSuppliers,
  getSuppliersBySpecialty,
  getSupplierAnalytics
};
