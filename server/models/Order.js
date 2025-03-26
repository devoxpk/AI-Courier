const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  customer: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  items: [
    {
      name: {
        type: String,
        required: true
      },
      quantity: {
        type: Number,
        required: true,
        min: 1
      },
      price: {
        type: Number,
        required: true
      },
      weight: {
        type: Number,
        default: 0
      }
    }
  ],
  totalAmount: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'dispatched', 'in-transit', 'delivered', 'cancelled', 'returned', 'exception'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['cash-on-delivery', 'prepaid', 'credit-card', 'bank-transfer'],
    default: 'cash-on-delivery'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  pickupAddress: {
    street: String,
    city: String,
    state: String,
    postalCode: String,
    country: {
      type: String,
      default: 'Pakistan'
    },
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  deliveryAddress: {
    street: {
      type: String,
      required: true
    },
    city: {
      type: String,
      required: true
    },
    state: {
      type: String,
      required: true
    },
    postalCode: {
      type: String,
      required: true
    },
    country: {
      type: String,
      default: 'Pakistan'
    },
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  dispatchInfo: {
    dispatchId: {
      type: mongoose.Schema.ObjectId,
      ref: 'Dispatch'
    },
    dispatchDate: Date,
    estimatedDeliveryDate: Date,
    actualDeliveryDate: Date
  },
  trackingNumber: {
    type: String,
    unique: true,
    sparse: true
  },
  notes: String,
  exceptionDetails: {
    type: {
      type: String,
      enum: ['delay', 'damage', 'wrong-address', 'customer-unavailable', 'other']
    },
    description: String,
    reportedAt: Date,
    resolvedAt: Date,
    resolution: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Create order number before saving
OrderSchema.pre('save', async function(next) {
  if (!this.orderNumber) {
    // Generate a unique order number with prefix 'ORD' followed by timestamp and random digits
    const timestamp = new Date().getTime().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    this.orderNumber = `ORD-${timestamp}-${random}`;
  }
  
  // Generate tracking number if not already set and order is being dispatched
  if (!this.trackingNumber && (this.status === 'dispatched' || this.status === 'in-transit')) {
    const timestamp = new Date().getTime().toString().slice(-8);
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    this.trackingNumber = `TRK-${timestamp}-${random}`;
  }
  
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Order', OrderSchema);