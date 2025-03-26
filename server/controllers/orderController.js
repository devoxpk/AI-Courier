const Order = require('../models/Order');
const User = require('../models/User');
const Notification = require('../models/Notification');

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private/Admin/Dispatcher
exports.getOrders = async (req, res) => {
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

    const total = await Order.countDocuments(query);

    // Execute query with pagination
    const orders = await Order.find(query)
      .populate('customer', 'name email phone')
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
      count: orders.length,
      pagination,
      total,
      data: orders
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Get single order
// @route   GET /api/orders/:id
// @access  Private
exports.getOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate(
      'customer',
      'name email phone'
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }

    // Make sure user is order owner or admin/dispatcher
    if (
      order.customer._id.toString() !== req.user.id &&
      req.user.role !== 'admin' &&
      req.user.role !== 'dispatcher'
    ) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to access this order'
      });
    }

    res.status(200).json({
      success: true,
      data: order
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
exports.createOrder = async (req, res) => {
  try {
    // Add customer to req.body
    req.body.customer = req.user.id;

    // Generate unique order number
    const timestamp = new Date().getTime().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    req.body.orderNumber = `ORD-${timestamp}-${random}`;

    // Calculate total amount if not provided
    if (!req.body.totalAmount && req.body.items && req.body.items.length > 0) {
      req.body.totalAmount = req.body.items.reduce(
        (total, item) => total + item.price * item.quantity,
        0
      );
    }

    const order = await Order.create(req.body);

    // Create notification for order confirmation
    await Notification.create({
      recipient: req.user.id,
      order: order._id,
      type: 'order-confirmation',
      title: 'Order Confirmed',
      message: `Your order #${order.orderNumber} has been confirmed and is being processed.`,
      status: 'sent'
    });

    res.status(201).json({
      success: true,
      data: order
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Update order
// @route   PUT /api/orders/:id
// @access  Private/Admin/Dispatcher
exports.updateOrder = async (req, res) => {
  try {
    let order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }

    // Make sure user is admin or dispatcher
    if (req.user.role !== 'admin' && req.user.role !== 'dispatcher') {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to update this order'
      });
    }

    order = await Order.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: order
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Delete order
// @route   DELETE /api/orders/:id
// @access  Private/Admin
exports.deleteOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }

    await order.deleteOne();

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

// @desc    Get logged in user's orders
// @route   GET /api/orders/myorders
// @access  Private
exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ customer: req.user.id }).sort({
      createdAt: -1
    });

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private/Admin/Dispatcher
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a status'
      });
    }

    let order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }

    // Update order status
    order.status = status;
    await order.save();

    // Create notification for status update
    let notificationType = 'order-confirmation';
    let notificationTitle = 'Order Update';
    let notificationMessage = `Your order #${order.orderNumber} status has been updated to ${status}.`;

    // Customize notification based on status
    if (status === 'dispatched') {
      notificationType = 'dispatch-update';
      notificationTitle = 'Order Dispatched';
      notificationMessage = `Your order #${order.orderNumber} has been dispatched and is on its way.`;
    } else if (status === 'delivered') {
      notificationType = 'delivery-update';
      notificationTitle = 'Order Delivered';
      notificationMessage = `Your order #${order.orderNumber} has been delivered successfully.`;
    } else if (status === 'exception') {
      notificationType = 'exception-alert';
      notificationTitle = 'Delivery Exception';
      notificationMessage = `There is an issue with your order #${order.orderNumber}. Our team is working to resolve it.`;
    }

    // Create notification
    await Notification.create({
      recipient: order.customer,
      order: order._id,
      type: notificationType,
      title: notificationTitle,
      message: notificationMessage,
      status: 'sent'
    });

    res.status(200).json({
      success: true,
      data: order
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Track order by tracking number
// @route   GET /api/orders/track/:trackingNumber
// @access  Public
exports.trackOrder = async (req, res) => {
  try {
    const order = await Order.findOne({
      orderNumber: req.params.trackingNumber
    }).select('orderNumber status createdAt dispatchInfo deliveryAddress');

    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }

    res.status(200).json({
      success: true,
      data: order
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Get orders by status
// @route   GET /api/orders/status/:status
// @access  Private/Admin/Dispatcher
exports.getOrdersByStatus = async (req, res) => {
  try {
    const orders = await Order.find({ status: req.params.status })
      .populate('customer', 'name email phone')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Get order statistics
// @route   GET /api/orders/statistics
// @access  Private/Admin
exports.getOrderStatistics = async (req, res) => {
  try {
    // Get total orders count
    const totalOrders = await Order.countDocuments();

    // Get orders by status
    const pendingOrders = await Order.countDocuments({ status: 'pending' });
    const processingOrders = await Order.countDocuments({ status: 'processing' });
    const dispatchedOrders = await Order.countDocuments({ status: 'dispatched' });
    const deliveredOrders = await Order.countDocuments({ status: 'delivered' });
    const cancelledOrders = await Order.countDocuments({ status: 'cancelled' });
    const exceptionOrders = await Order.countDocuments({ status: 'exception' });

    // Get orders created today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayOrders = await Order.countDocuments({
      createdAt: { $gte: today }
    });

    // Get orders created this week
    const startOfWeek = new Date();
    startOfWeek.setDate(today.getDate() - today.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    const weeklyOrders = await Order.countDocuments({
      createdAt: { $gte: startOfWeek }
    });

    // Get orders created this month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    const monthlyOrders = await Order.countDocuments({
      createdAt: { $gte: startOfMonth }
    });

    res.status(200).json({
      success: true,
      data: {
        totalOrders,
        pendingOrders,
        processingOrders,
        dispatchedOrders,
        deliveredOrders,
        cancelledOrders,
        exceptionOrders,
        todayOrders,
        weeklyOrders,
        monthlyOrders
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

// @desc    Bulk import orders
// @route   POST /api/orders/bulk-import
// @access  Private/Admin
exports.bulkImportOrders = async (req, res) => {
  try {
    const { orders } = req.body;

    if (!orders || !Array.isArray(orders) || orders.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Please provide an array of orders'
      });
    }

    // Process each order
    const processedOrders = [];

    for (const orderData of orders) {
      // Generate unique order number
      const timestamp = new Date().getTime().toString().slice(-6);
      const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
      orderData.orderNumber = `ORD-${timestamp}-${random}`;

      // Create order
      const order = await Order.create(orderData);
      processedOrders.push(order);

      // Create notification for order confirmation
      if (orderData.customer) {
        await Notification.create({
          recipient: orderData.customer,
          order: order._id,
          type: 'order-confirmation',
          title: 'Order Confirmed',
          message: `Your order #${order.orderNumber} has been confirmed and is being processed.`,
          status: 'sent'
        });
      }
    }

    res.status(201).json({
      success: true,
      count: processedOrders.length,
      data: processedOrders
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Generate order invoice
// @route   GET /api/orders/:id/invoice
// @access  Private
exports.generateOrderInvoice = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate(
      'customer',
      'name email phone address'
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }

    // Make sure user is order owner or admin/dispatcher
    if (
      order.customer._id.toString() !== req.user.id &&
      req.user.role !== 'admin' &&
      req.user.role !== 'dispatcher'
    ) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to access this order'
      });
    }

    // TODO: Generate actual PDF invoice
    // For now, just return the order data that would be used in the invoice

    const invoiceData = {
      orderNumber: order.orderNumber,
      date: order.createdAt,
      customer: {
        name: order.customer.name,
        email: order.customer.email,
        phone: order.customer.phone,
        address: order.customer.address
      },
      items: order.items,
      totalAmount: order.totalAmount,
      deliveryAddress: order.deliveryAddress,
      paymentMethod: order.paymentMethod,
      paymentStatus: order.paymentStatus
    };

    res.status(200).json({
      success: true,
      data: invoiceData
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};