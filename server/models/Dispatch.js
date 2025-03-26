const mongoose = require('mongoose');

const DispatchSchema = new mongoose.Schema({
  dispatchNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  orders: [{
    type: mongoose.Schema.ObjectId,
    ref: 'Order',
    required: true
  }],
  courier: {
    name: {
      type: String,
      required: true
    },
    phone: {
      type: String,
      required: true
    },
    vehicleType: {
      type: String,
      enum: ['motorcycle', 'car', 'van', 'truck'],
      default: 'motorcycle'
    },
    vehicleNumber: String,
    currentLocation: {
      coordinates: {
        lat: Number,
        lng: Number
      },
      lastUpdated: {
        type: Date,
        default: Date.now
      }
    }
  },
  status: {
    type: String,
    enum: ['pending', 'assigned', 'in-progress', 'completed', 'cancelled'],
    default: 'pending'
  },
  route: {
    optimized: {
      type: Boolean,
      default: true
    },
    waypoints: [{
      order: {
        type: mongoose.Schema.ObjectId,
        ref: 'Order'
      },
      address: {
        street: String,
        city: String,
        state: String,
        postalCode: String,
        country: String,
        coordinates: {
          lat: Number,
          lng: Number
        }
      },
      estimatedArrivalTime: Date,
      actualArrivalTime: Date,
      status: {
        type: String,
        enum: ['pending', 'arrived', 'completed', 'skipped'],
        default: 'pending'
      },
      notes: String
    }],
    totalDistance: Number, // in kilometers
    totalTime: Number // in minutes
  },
  startTime: Date,
  endTime: Date,
  notes: String,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Create dispatch number before saving
DispatchSchema.pre('save', async function(next) {
  if (!this.dispatchNumber) {
    // Generate a unique dispatch number with prefix 'DSP' followed by timestamp and random digits
    const timestamp = new Date().getTime().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    this.dispatchNumber = `DSP-${timestamp}-${random}`;
  }
  
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Dispatch', DispatchSchema);