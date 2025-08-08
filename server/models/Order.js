const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    required: [true, 'Order number is required'],
    unique: true,
    uppercase: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required']
  },
  orderType: {
    type: String,
    enum: ['prescription', 'clinical_supplies', 'equipment', 'consumables', 'emergency'],
    required: [true, 'Order type is required'],
    lowercase: true
  },
  priority: {
    type: String,
    enum: ['low', 'normal', 'high', 'urgent'],
    default: 'normal',
    lowercase: true
  },
  items: [{
    item: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Inventory',
      required: [true, 'Item reference is required']
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [1, 'Quantity must be at least 1']
    },
    unitPrice: {
      type: Number,
      required: [true, 'Unit price is required'],
      min: [0, 'Unit price cannot be negative']
    },
    subtotal: {
      type: Number,
      required: [true, 'Subtotal is required'],
      min: [0, 'Subtotal cannot be negative']
    },
    notes: {
      type: String,
      trim: true
    }
  }],
  totalAmount: {
    type: Number,
    required: [true, 'Total amount is required'],
    min: [0, 'Total amount cannot be negative']
  },
  tax: {
    rate: {
      type: Number,
      default: 0,
      min: 0,
      max: 1
    },
    amount: {
      type: Number,
      default: 0,
      min: 0
    }
  },
  finalAmount: {
    type: Number,
    required: [true, 'Final amount is required'],
    min: [0, 'Final amount cannot be negative']
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'processing', 'shipped', 'delivered', 'completed', 'cancelled'],
    default: 'pending',
    lowercase: true
  },
  statusHistory: [{
    status: {
      type: String,
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    notes: {
      type: String,
      trim: true
    }
  }],
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedAt: {
    type: Date
  },
  rejectedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  rejectedAt: {
    type: Date
  },
  rejectionReason: {
    type: String,
    trim: true
  },
  deliveryInformation: {
    address: {
      street: {
        type: String,
        required: function() {
          return ['approved', 'processing', 'shipped'].includes(this.status);
        },
        trim: true
      },
      city: {
        type: String,
        required: function() {
          return ['approved', 'processing', 'shipped'].includes(this.status);
        },
        trim: true
      },
      state: {
        type: String,
        required: function() {
          return ['approved', 'processing', 'shipped'].includes(this.status);
        },
        trim: true
      },
      zipCode: {
        type: String,
        required: function() {
          return ['approved', 'processing', 'shipped'].includes(this.status);
        },
        trim: true
      }
    },
    phone: {
      type: String,
      required: function() {
        return ['approved', 'processing', 'shipped'].includes(this.status);
      },
      trim: true
    },
    alternatePhone: {
      type: String,
      trim: true
    },
    deliveryInstructions: {
      type: String,
      trim: true
    },
    preferredDeliveryTime: {
      type: String,
      enum: ['morning', 'afternoon', 'evening', 'any_time'],
      default: 'any_time'
    }
  },
  shipping: {
    method: {
      type: String,
      enum: ['standard', 'expedited', 'overnight', 'pickup'],
      default: 'standard'
    },
    cost: {
      type: Number,
      default: 0,
      min: 0
    },
    trackingNumber: {
      type: String,
      trim: true
    },
    carrier: {
      type: String,
      trim: true
    },
    estimatedDelivery: {
      type: Date
    },
    actualDelivery: {
      type: Date
    }
  },
  payment: {
    method: {
      type: String,
      enum: ['credit_card', 'debit_card', 'insurance', 'cash', 'check', 'bank_transfer'],
      required: [true, 'Payment method is required']
    },
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed', 'refunded'],
      default: 'pending'
    },
    transactionId: {
      type: String,
      trim: true
    },
    paidAmount: {
      type: Number,
      default: 0,
      min: 0
    },
    paidAt: {
      type: Date
    },
    insuranceClaimId: {
      type: String,
      trim: true
    }
  },
  prescriptionDetails: {
    prescriptionId: {
      type: String,
      trim: true
    },
    doctorName: {
      type: String,
      trim: true
    },
    licenseNumber: {
      type: String,
      trim: true
    },
    issuedDate: {
      type: Date
    },
    validUntil: {
      type: Date
    }
  },
  notes: {
    type: String,
    trim: true
  },
  internalNotes: {
    type: String,
    trim: true
  },
  expectedDeliveryDate: {
    type: Date
  },
  actualDeliveryDate: {
    type: Date
  },
  isUrgent: {
    type: Boolean,
    default: false
  },
  requiresApproval: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for order age in days
orderSchema.virtual('orderAge').get(function() {
  const diffTime = new Date() - this.createdAt;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Virtual for delivery status
orderSchema.virtual('deliveryStatus').get(function() {
  if (!this.expectedDeliveryDate) return 'not_scheduled';
  
  const today = new Date();
  const expected = new Date(this.expectedDeliveryDate);
  
  if (this.actualDeliveryDate) {
    return this.actualDeliveryDate <= expected ? 'delivered_on_time' : 'delivered_late';
  }
  
  if (today > expected) return 'overdue';
  return 'on_schedule';
});

// Virtual for can be cancelled
orderSchema.virtual('canBeCancelled').get(function() {
  return ['pending', 'approved'].includes(this.status);
});

// Indexes
orderSchema.index({ orderNumber: 1 });
orderSchema.index({ user: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ orderType: 1 });
orderSchema.index({ priority: 1 });
orderSchema.index({ createdAt: -1 });
orderSchema.index({ approvedBy: 1 });

// Pre-save middleware to generate order number
orderSchema.pre('save', async function(next) {
  if (this.isNew && !this.orderNumber) {
    const count = await mongoose.model('Order').countDocuments();
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    
    this.orderNumber = `ORD-${year}${month}${day}-${String(count + 1).padStart(4, '0')}`;
  }
  
  // Calculate totals
  if (this.items && this.items.length > 0) {
    this.totalAmount = this.items.reduce((total, item) => total + item.subtotal, 0);
    this.tax.amount = this.totalAmount * this.tax.rate;
    this.finalAmount = this.totalAmount + this.tax.amount + (this.shipping.cost || 0);
  }
  
  next();
});

// Method to add status history
orderSchema.methods.updateStatus = function(newStatus, updatedBy, notes = '') {
  const statusEntry = {
    status: newStatus,
    timestamp: new Date(),
    updatedBy: updatedBy,
    notes: notes
  };
  
  this.statusHistory.push(statusEntry);
  this.status = newStatus;
  
  // Set specific fields based on status
  if (newStatus === 'approved') {
    this.approvedBy = updatedBy;
    this.approvedAt = new Date();
  } else if (newStatus === 'rejected') {
    this.rejectedBy = updatedBy;
    this.rejectedAt = new Date();
    this.rejectionReason = notes;
  } else if (newStatus === 'delivered') {
    this.actualDeliveryDate = new Date();
    this.shipping.actualDelivery = new Date();
  }
  
  return this.save();
};

// Method to approve order
orderSchema.methods.approve = function(approvedBy, notes = '') {
  return this.updateStatus('approved', approvedBy, notes);
};

// Method to reject order
orderSchema.methods.reject = function(rejectedBy, reason) {
  return this.updateStatus('rejected', rejectedBy, reason);
};

// Static method to get pending orders
orderSchema.statics.getPendingOrders = function() {
  return this.find({ status: 'pending' })
    .populate('user', 'name email role')
    .populate('items.item', 'name category sku')
    .sort({ priority: 1, createdAt: 1 });
};

// Static method to get orders by user
orderSchema.statics.getUserOrders = function(userId) {
  return this.find({ user: userId })
    .populate('items.item', 'name category sku')
    .sort({ createdAt: -1 });
};

// Static method to get urgent orders
orderSchema.statics.getUrgentOrders = function() {
  return this.find({ 
    priority: { $in: ['high', 'urgent'] },
    status: { $nin: ['delivered', 'completed', 'cancelled'] }
  })
    .populate('user', 'name email role')
    .populate('items.item', 'name category sku')
    .sort({ priority: 1, createdAt: 1 });
};

module.exports = mongoose.model('Order', orderSchema);
