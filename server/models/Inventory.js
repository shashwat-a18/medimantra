const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Product description is required'],
    trim: true
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['medication', 'medical_equipment', 'supplies', 'devices', 'consumables'],
    lowercase: true
  },
  sku: {
    type: String,
    required: [true, 'SKU is required'],
    unique: true,
    uppercase: true
  },
  currentStock: {
    type: Number,
    required: [true, 'Current stock is required'],
    min: [0, 'Stock cannot be negative'],
    default: 0
  },
  minimumStock: {
    type: Number,
    required: [true, 'Minimum stock threshold is required'],
    min: [0, 'Minimum stock cannot be negative'],
    default: 10
  },
  maximumStock: {
    type: Number,
    required: [true, 'Maximum stock is required'],
    min: [0, 'Maximum stock cannot be negative'],
    validate: {
      validator: function(value) {
        return value >= this.minimumStock;
      },
      message: 'Maximum stock must be greater than or equal to minimum stock'
    }
  },
  unitPrice: {
    type: Number,
    required: [true, 'Unit price is required'],
    min: [0, 'Price cannot be negative']
  },
  totalValue: {
    type: Number,
    default: function() {
      return this.currentStock * this.unitPrice;
    }
  },
  expiryDate: {
    type: Date,
    required: function() {
      return this.category === 'medication';
    }
  },
  batchNumber: {
    type: String,
    required: function() {
      return this.category === 'medication';
    },
    trim: true,
    uppercase: true
  },
  manufacturer: {
    type: String,
    required: [true, 'Manufacturer is required'],
    trim: true
  },
  location: {
    type: String,
    required: [true, 'Storage location is required'],
    trim: true
  },
  supplier: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Supplier',
    required: [true, 'Supplier is required']
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  isExpired: {
    type: Boolean,
    default: false
  },
  isLowStock: {
    type: Boolean,
    default: function() {
      return this.currentStock <= this.minimumStock;
    }
  },
  // Medication specific fields
  dosage: {
    type: String,
    required: function() {
      return this.category === 'medication';
    }
  },
  administration: {
    type: String,
    enum: ['oral', 'injection', 'topical', 'inhalation', 'other'],
    required: function() {
      return this.category === 'medication';
    }
  },
  // Equipment specific fields
  serialNumber: {
    type: String,
    required: function() {
      return this.category === 'medical_equipment' || this.category === 'devices';
    },
    trim: true,
    uppercase: true
  },
  warrantyExpiry: {
    type: Date,
    required: function() {
      return this.category === 'medical_equipment' || this.category === 'devices';
    }
  },
  // Audit trail
  lastRestocked: {
    type: Date,
    default: Date.now
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for days until expiry
inventorySchema.virtual('daysUntilExpiry').get(function() {
  if (!this.expiryDate) return null;
  const today = new Date();
  const diffTime = this.expiryDate - today;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Virtual for stock status
inventorySchema.virtual('stockStatus').get(function() {
  if (this.currentStock === 0) return 'out_of_stock';
  if (this.currentStock <= this.minimumStock) return 'low_stock';
  if (this.currentStock >= this.maximumStock) return 'overstocked';
  return 'in_stock';
});

// Indexes for better query performance
inventorySchema.index({ sku: 1 });
inventorySchema.index({ category: 1 });
inventorySchema.index({ supplier: 1 });
inventorySchema.index({ expiryDate: 1 });
inventorySchema.index({ currentStock: 1 });
inventorySchema.index({ isAvailable: 1 });
inventorySchema.index({ name: 'text', description: 'text' });

// Middleware to update calculated fields
inventorySchema.pre('save', function(next) {
  // Update total value
  this.totalValue = this.currentStock * this.unitPrice;
  
  // Update low stock status
  this.isLowStock = this.currentStock <= this.minimumStock;
  
  // Update expiry status for medications
  if (this.expiryDate) {
    const today = new Date();
    this.isExpired = this.expiryDate < today;
  }
  
  // Update last updated timestamp
  this.lastUpdated = new Date();
  
  next();
});

// Static method to get low stock items
inventorySchema.statics.getLowStockItems = function() {
  return this.find({ 
    $or: [
      { currentStock: { $lte: this.minimumStock } },
      { isLowStock: true }
    ],
    isAvailable: true 
  }).populate('supplier', 'name contactInfo');
};

// Static method to get expiring items
inventorySchema.statics.getExpiringItems = function(days = 30) {
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + days);
  
  return this.find({
    expiryDate: { 
      $exists: true,
      $lte: futureDate 
    },
    isAvailable: true,
    isExpired: false
  }).populate('supplier', 'name contactInfo');
};

// Static method to get expired items
inventorySchema.statics.getExpiredItems = function() {
  const today = new Date();
  return this.find({
    expiryDate: { 
      $exists: true,
      $lt: today 
    }
  }).populate('supplier', 'name contactInfo');
};

module.exports = mongoose.model('Inventory', inventorySchema);
