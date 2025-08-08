const mongoose = require('mongoose');

const supplierSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Supplier name is required'],
    trim: true
  },
  companyRegistration: {
    type: String,
    required: [true, 'Company registration number is required'],
    unique: true,
    trim: true,
    uppercase: true
  },
  contactInfo: {
    email: {
      type: String,
      required: [true, 'Email is required'],
      lowercase: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true
    },
    alternatePhone: {
      type: String,
      trim: true
    },
    website: {
      type: String,
      trim: true
    }
  },
  address: {
    street: {
      type: String,
      required: [true, 'Street address is required'],
      trim: true
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true
    },
    state: {
      type: String,
      required: [true, 'State is required'],
      trim: true
    },
    zipCode: {
      type: String,
      required: [true, 'ZIP code is required'],
      trim: true
    },
    country: {
      type: String,
      required: [true, 'Country is required'],
      trim: true,
      default: 'United States'
    }
  },
  specialties: [{
    type: String,
    enum: ['medication', 'medical_equipment', 'supplies', 'devices', 'consumables'],
    lowercase: true
  }],
  certifications: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    number: {
      type: String,
      required: true,
      trim: true
    },
    issuedBy: {
      type: String,
      required: true,
      trim: true
    },
    issuedDate: {
      type: Date,
      required: true
    },
    expiryDate: {
      type: Date,
      required: true
    },
    isActive: {
      type: Boolean,
      default: true
    }
  }],
  paymentTerms: {
    type: String,
    enum: ['net_15', 'net_30', 'net_45', 'net_60', 'cash_on_delivery', 'advance_payment'],
    default: 'net_30'
  },
  creditLimit: {
    type: Number,
    min: [0, 'Credit limit cannot be negative'],
    default: 0
  },
  taxId: {
    type: String,
    required: [true, 'Tax ID is required'],
    trim: true,
    uppercase: true
  },
  bankDetails: {
    bankName: {
      type: String,
      trim: true
    },
    accountNumber: {
      type: String,
      trim: true
    },
    routingNumber: {
      type: String,
      trim: true
    },
    accountHolderName: {
      type: String,
      trim: true
    }
  },
  performance: {
    rating: {
      type: Number,
      min: 1,
      max: 5,
      default: 3
    },
    totalOrders: {
      type: Number,
      default: 0,
      min: 0
    },
    onTimeDeliveries: {
      type: Number,
      default: 0,
      min: 0
    },
    qualityIssues: {
      type: Number,
      default: 0,
      min: 0
    },
    lastOrderDate: {
      type: Date
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isPreferred: {
    type: Boolean,
    default: false
  },
  notes: {
    type: String,
    trim: true
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

// Virtual for delivery performance percentage
supplierSchema.virtual('deliveryPerformance').get(function() {
  if (this.performance.totalOrders === 0) return 0;
  return Math.round((this.performance.onTimeDeliveries / this.performance.totalOrders) * 100);
});

// Virtual for quality score
supplierSchema.virtual('qualityScore').get(function() {
  if (this.performance.totalOrders === 0) return 100;
  const issueRate = (this.performance.qualityIssues / this.performance.totalOrders) * 100;
  return Math.max(0, 100 - issueRate);
});

// Virtual for full address
supplierSchema.virtual('fullAddress').get(function() {
  return `${this.address.street}, ${this.address.city}, ${this.address.state} ${this.address.zipCode}, ${this.address.country}`;
});

// Indexes
supplierSchema.index({ name: 'text' });
supplierSchema.index({ specialties: 1 });
supplierSchema.index({ isActive: 1 });
supplierSchema.index({ isPreferred: 1 });
supplierSchema.index({ 'performance.rating': 1 });

// Static method to get preferred suppliers
supplierSchema.statics.getPreferredSuppliers = function() {
  return this.find({ 
    isPreferred: true, 
    isActive: true 
  }).sort({ 'performance.rating': -1 });
};

// Static method to get suppliers by specialty
supplierSchema.statics.getBySpecialty = function(specialty) {
  return this.find({ 
    specialties: specialty, 
    isActive: true 
  }).sort({ 'performance.rating': -1 });
};

// Method to update performance metrics
supplierSchema.methods.updatePerformance = function(orderData) {
  this.performance.totalOrders += 1;
  
  if (orderData.deliveredOnTime) {
    this.performance.onTimeDeliveries += 1;
  }
  
  if (orderData.hasQualityIssues) {
    this.performance.qualityIssues += 1;
  }
  
  this.performance.lastOrderDate = new Date();
  
  // Recalculate rating based on performance
  const deliveryRate = this.deliveryPerformance / 100;
  const qualityRate = this.qualityScore / 100;
  this.performance.rating = Math.round((deliveryRate * 0.6 + qualityRate * 0.4) * 5);
  
  return this.save();
};

module.exports = mongoose.model('Supplier', supplierSchema);
