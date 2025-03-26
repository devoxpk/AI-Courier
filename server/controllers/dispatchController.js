const Dispatch = require('../models/Dispatch');
const Order = require('../models/Order');
const Notification = require('../models/Notification');

// @desc    Get all dispatches
// @route   GET /api/dispatch
// @access  Private/Admin/Dispatcher
exports.getDispatches = async (req, res) => {
  try {
    // Add pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    // Build query
    let query = {};

    // Filter by status if provided
    if (req.query.status) {
      query.status = req.query.status;
    }

    // Filter by date range if provided
    if (req.query.startDate && req.query.endDate) {
      query.createdAt = {
        $gte: new Date(req.query.startDate),
        $lte: new Date(req.query.endDate)
      };
    }

    const total = await Dispatch.countDocuments(query);

    // Execute query with pagination
    const dispatches = await Dispatch.find(query)
      .populate({
        path: 'orders',
        select: 'orderNumber status deliveryAddress',
        populate: {
          path: 'customer',
          select: 'name phone'
        }
      })
      .sort({ createdAt: -1 })
      .skip(startIndex)
      .limit(limit);

    // Pagination result
    const pagination = {};

    if (endIndex < total) {
      pagination.next = {
        page: page + 1,
        limit
      };
    }

    if (startIndex > 0) {
      pagination.prev = {
        page: page - 1,
        limit
      };
    }

    res.status(200).json({
      success: true,
      count: dispatches.length,
      pagination,
      total,
      data: dispatches
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Get single dispatch
// @route   GET /api/dispatch/:id
// @access  Private/Admin/Dispatcher
exports.getDispatch = async (req, res) => {
  try {
    const dispatch = await Dispatch.findById(req.params.id).populate({
      path: 'orders',
      select: 'orderNumber status deliveryAddress items totalAmount',
      populate: {
        path: 'customer',
        select: 'name email phone'
      }
    });

    if (!dispatch) {
      return res.status(404).json({
        success: false,
        error: 'Dispatch not found'
      });
    }

    res.status(200).json({
      success: true,
      data: dispatch
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Create new dispatch
// @route   POST /api/dispatch
// @access  Private/Admin/Dispatcher
exports.createDispatch = async (req, res) => {
  try {
    const { orders, courier, notes } = req.body;

    // Validate orders
    if (!orders || !Array.isArray(orders) || orders.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Please provide at least one order for dispatch'
      });
    }

    // Check if orders exist and are not already dispatched
    for (const orderId of orders) {
      const order = await Order.findById(orderId);
      
      if (!order) {
        return res.status(404).json({
          success: false,
          error: `Order with ID ${orderId} not found`
        });
      }

      if (order.status === 'dispatched' || order.status === 'delivered') {
        return res.status(400).json({
          success: false,
          error: `Order ${order.orderNumber} is already ${order.status}`
        });
      }
    }

    // Create dispatch with waypoints from orders
    const waypoints = [];
    const orderDetails = await Promise.all(
      orders.map(async (orderId) => {
        const order = await Order.findById(orderId);
        waypoints.push({
          order: orderId,
          address: order.deliveryAddress,
          status: 'pending'
        });
        return order;
      })
    );

    // Create dispatch
    const dispatch = await Dispatch.create({
      orders,
      courier,
      notes,
      route: {
        waypoints
      },
      status: courier ? 'assigned' : 'pending'
    });

    // Update order status to dispatched and add dispatch info
    for (const order of orderDetails) {
      order.status = 'dispatched';
      order.dispatchInfo = {
        dispatchId: dispatch._id,
        dispatchDate: Date.now()
      };
      await order.save();

      // Create notification for customer
      await Notification.create({
        recipient: order.customer,
        order: order._id,
        type: 'dispatch-update',
        title: 'Order Dispatched',
        message: `Your order #${order.orderNumber} has been dispatched and is on its way.`,
        status: 'sent'
      });
    }

    res.status(201).json({
      success: true,
      data: dispatch
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Update dispatch
// @route   PUT /api/dispatch/:id
// @access  Private/Admin/Dispatcher
exports.updateDispatch = async (req, res) => {
  try {
    let dispatch = await Dispatch.findById(req.params.id);

    if (!dispatch) {
      return res.status(404).json({
        success: false,
        error: 'Dispatch not found'
      });
    }

    dispatch = await Dispatch.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: dispatch
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Delete dispatch
// @route   DELETE /api/dispatch/:id
// @access  Private/Admin
exports.deleteDispatch = async (req, res) => {
  try {
    const dispatch = await Dispatch.findById(req.params.id);

    if (!dispatch) {
      return res.status(404).json({
        success: false,
        error: 'Dispatch not found'
      });
    }

    // Update orders to remove dispatch info
    for (const orderId of dispatch.orders) {
      const order = await Order.findById(orderId);
      if (order) {
        order.status = 'processing'; // Reset to processing
        order.dispatchInfo = {};
        await order.save();
      }
    }

    await dispatch.deleteOne();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Assign courier to dispatch
// @route   PUT /api/dispatch/:id/assign-courier
// @access  Private/Admin/Dispatcher
exports.assignCourier = async (req, res) => {
  try {
    const { name, phone, vehicleType, vehicleNumber } = req.body;

    if (!name || !phone) {
      return res.status(400).json({
        success: false,
        error: 'Please provide courier name and phone'
      });
    }

    let dispatch = await Dispatch.findById(req.params.id);

    if (!dispatch) {
      return res.status(404).json({
        success: false,
        error: 'Dispatch not found'
      });
    }

    // Update courier info
    dispatch.courier = {
      name,
      phone,
      vehicleType: vehicleType || 'motorcycle',
      vehicleNumber: vehicleNumber || ''
    };

    // Update status if it was pending
    if (dispatch.status === 'pending') {
      dispatch.status = 'assigned';
    }

    await dispatch.save();

    res.status(200).json({
      success: true,
      data: dispatch
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Update dispatch status
// @route   PUT /api/dispatch/:id/status
// @access  Private/Admin/Dispatcher
exports.updateDispatchStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a status'
      });
    }

    let dispatch = await Dispatch.findById(req.params.id).populate('orders');

    if (!dispatch) {
      return res.status(404).json({
        success: false,
        error: 'Dispatch not found'
      });
    }

    // Update dispatch status
    dispatch.status = status;

    // If completed, update all orders to delivered
    if (status === 'completed') {
      dispatch.endTime = Date.now();
      
      // Update all orders to delivered
      for (const order of dispatch.orders) {
        await Order.findByIdAndUpdate(order._id, {
          status: 'delivered',
          'dispatchInfo.deliveryDate': Date.now()
        });

        // Create notification for customer
        await Notification.create({
          recipient: order.customer,
          order: order._id,
          type: 'delivery-update',
          title: 'Order Delivered',
          message: `Your order #${order.orderNumber} has been delivered successfully.`,
          status: 'sent'
        });
      }

      // Update all waypoints to completed
      for (const waypoint of dispatch.route.waypoints) {
        waypoint.status = 'completed';
        waypoint.actualArrivalTime = Date.now();
      }
    }

    // If in-progress, set start time
    if (status === 'in-progress' && !dispatch.startTime) {
      dispatch.startTime = Date.now();
    }

    await dispatch.save();

    res.status(200).json({
      success: true,
      data: dispatch
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Get dispatches by status
// @route   GET /api/dispatch/status/:status
// @access  Private/Admin/Dispatcher
exports.getDispatchesByStatus = async (req, res) => {
  try {
    const dispatches = await Dispatch.find({ status: req.params.status })
      .populate({
        path: 'orders',
        select: 'orderNumber status deliveryAddress',
        populate: {
          path: 'customer',
          select: 'name phone'
        }
      })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: dispatches.length,
      data: dispatches
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Optimize route for dispatch
// @route   POST /api/dispatch/:id/optimize-route
// @access  Private/Admin/Dispatcher
exports.optimizeRoute = async (req, res) => {
  try {
    const dispatch = await Dispatch.findById(req.params.id).populate({
      path: 'orders',
      select: 'deliveryAddress'
    });

    if (!dispatch) {
      return res.status(404).json({
        success: false,
        error: 'Dispatch not found'
      });
    }

    // For now, we'll implement a simple optimization by sorting waypoints
    // In a real implementation, you would integrate with a routing API
    // or implement a more sophisticated algorithm

    // Simple optimization: sort by postal code as a basic proxy for geographic proximity
    dispatch.route.waypoints.sort((a, b) => {
      const postalA = a.address.postalCode || '';
      const postalB = b.address.postalCode || '';
      return postalA.localeCompare(postalB);
    });

    dispatch.route.optimized = true;
    
    // Estimate total distance and time (placeholder values)
    // In a real implementation, these would come from a routing API
    dispatch.route.totalDistance = dispatch.route.waypoints.length * 2; // 2km per waypoint as placeholder
    dispatch.route.totalTime = dispatch.route.waypoints.length * 10; // 10 minutes per waypoint as placeholder

    await dispatch.save();

    res.status(200).json({
      success: true,
      data: dispatch
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Update courier location
// @route   PUT /api/dispatch/:id/courier-location
// @access  Private/Admin/Dispatcher
exports.updateCourierLocation = async (req, res) => {
  try {
    const { lat, lng } = req.body;

    if (!lat || !lng) {
      return res.status(400).json({
        success: false,
        error: 'Please provide latitude and longitude'
      });
    }

    let dispatch = await Dispatch.findById(req.params.id);

    if (!dispatch) {
      return res.status(404).json({
        success: false,
        error: 'Dispatch not found'
      });
    }

    // Update courier location
    if (!dispatch.courier) {
      dispatch.courier = {};
    }

    if (!dispatch.courier.currentLocation) {
      dispatch.courier.currentLocation = {};
    }

    dispatch.courier.currentLocation.coordinates = {
      lat,
      lng
    };
    dispatch.courier.currentLocation.lastUpdated = Date.now();

    await dispatch.save();

    res.status(200).json({
      success: true,
      data: dispatch.courier.currentLocation
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Get active dispatches
// @route   GET /api/dispatch/active
// @access  Private/Admin/Dispatcher
exports.getActiveDispatches = async (req, res) => {
  try {
    const dispatches = await Dispatch.find({
      status: { $in: ['assigned', 'in-progress'] }
    })
      .populate({
        path: 'orders',
        select: 'orderNumber status deliveryAddress',
        populate: {
          path: 'customer',
          select: 'name phone'
        }
      })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: dispatches.length,
      data: dispatches
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Get dispatch statistics
// @route   GET /api/dispatch/statistics
// @access  Private/Admin
exports.getDispatchStatistics = async (req, res) => {
  try {
    // Get total dispatches count
    const totalDispatches = await Dispatch.countDocuments();

    // Get dispatches by status
    const pendingDispatches = await Dispatch.countDocuments({ status: 'pending' });
    const assignedDispatches = await Dispatch.countDocuments({ status: 'assigned' });
    const inProgressDispatches = await Dispatch.countDocuments({ status: 'in-progress' });
    const completedDispatches = await Dispatch.countDocuments({ status: 'completed' });
    const cancelledDispatches = await Dispatch.countDocuments({ status: 'cancelled' });

    // Get dispatches created today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayDispatches = await Dispatch.countDocuments({
      createdAt: { $gte: today }
    });

    // Get dispatches created this week
    const startOfWeek = new Date();
    startOfWeek.setDate(today.getDate() - today.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    const weeklyDispatches = await Dispatch.countDocuments({
      createdAt: { $gte: startOfWeek }
    });

    // Get dispatches created this month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    const monthlyDispatches = await Dispatch.countDocuments({
      createdAt: { $gte: startOfMonth }
    });

    // Calculate average delivery time (in minutes)
    const completedDispatchesData = await Dispatch.find({
      status: 'completed',
      startTime: { $exists: true },
      endTime: { $exists: true }
    });

    let totalDeliveryTime = 0;
    let dispatchesWithValidTimes = 0;

    completedDispatchesData.forEach(dispatch => {
      if (dispatch.startTime && dispatch.endTime) {
        const deliveryTime = (dispatch.endTime - dispatch.startTime) / (1000 * 60); // Convert to minutes
        totalDeliveryTime += deliveryTime;
        dispatchesWithValidTimes++;
      }
    });

    const averageDeliveryTime = dispatchesWithValidTimes > 0 
      ? Math.round(totalDeliveryTime / dispatchesWithValidTimes) 
      : 0;

    res.status(200).json({
      success: true,
      data: {
        totalDispatches,
        pendingDispatches,
        assignedDispatches,
        inProgressDispatches,
        completedDispatches,
        cancelledDispatches,
        todayDispatches,
        weeklyDispatches,
        monthlyDispatches,
        averageDeliveryTime
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};