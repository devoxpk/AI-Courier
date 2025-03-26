const Order = require('../models/Order');
const Dispatch = require('../models/Dispatch');
const mongoose = require('mongoose');

// @desc    Get daily orders report
// @route   GET /api/reports/orders/daily
// @access  Private/Admin
exports.getDailyOrdersReport = async (req, res) => {
  try {
    // Get start and end date for today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Get orders created today
    const orders = await Order.find({
      createdAt: { $gte: today, $lt: tomorrow }
    }).sort({ createdAt: 1 });

    // Group orders by hour
    const hourlyData = {};
    for (let i = 0; i < 24; i++) {
      hourlyData[i] = 0;
    }

    orders.forEach(order => {
      const hour = order.createdAt.getHours();
      hourlyData[hour]++;
    });

    // Get order status counts
    const pendingCount = await Order.countDocuments({
      createdAt: { $gte: today, $lt: tomorrow },
      status: 'pending'
    });

    const processingCount = await Order.countDocuments({
      createdAt: { $gte: today, $lt: tomorrow },
      status: 'processing'
    });

    const dispatchedCount = await Order.countDocuments({
      createdAt: { $gte: today, $lt: tomorrow },
      status: 'dispatched'
    });

    const deliveredCount = await Order.countDocuments({
      createdAt: { $gte: today, $lt: tomorrow },
      status: 'delivered'
    });

    const cancelledCount = await Order.countDocuments({
      createdAt: { $gte: today, $lt: tomorrow },
      status: 'cancelled'
    });

    const exceptionCount = await Order.countDocuments({
      createdAt: { $gte: today, $lt: tomorrow },
      status: 'exception'
    });

    // Calculate total revenue for today
    const totalRevenue = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: today, $lt: tomorrow }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$totalAmount' }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        date: today,
        totalOrders: orders.length,
        hourlyData,
        statusCounts: {
          pending: pendingCount,
          processing: processingCount,
          dispatched: dispatchedCount,
          delivered: deliveredCount,
          cancelled: cancelledCount,
          exception: exceptionCount
        },
        totalRevenue: totalRevenue.length > 0 ? totalRevenue[0].total : 0
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

// @desc    Get weekly orders report
// @route   GET /api/reports/orders/weekly
// @access  Private/Admin
exports.getWeeklyOrdersReport = async (req, res) => {
  try {
    // Get start and end date for the current week
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay()); // Start of week (Sunday)
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(endOfWeek.getDate() + 7); // End of week (next Sunday)

    // Get orders created this week
    const orders = await Order.find({
      createdAt: { $gte: startOfWeek, $lt: endOfWeek }
    }).sort({ createdAt: 1 });

    // Group orders by day of week
    const dailyData = {};
    for (let i = 0; i < 7; i++) {
      dailyData[i] = 0;
    }

    orders.forEach(order => {
      const dayOfWeek = order.createdAt.getDay();
      dailyData[dayOfWeek]++;
    });

    // Get order status counts for the week
    const pendingCount = await Order.countDocuments({
      createdAt: { $gte: startOfWeek, $lt: endOfWeek },
      status: 'pending'
    });

    const processingCount = await Order.countDocuments({
      createdAt: { $gte: startOfWeek, $lt: endOfWeek },
      status: 'processing'
    });

    const dispatchedCount = await Order.countDocuments({
      createdAt: { $gte: startOfWeek, $lt: endOfWeek },
      status: 'dispatched'
    });

    const deliveredCount = await Order.countDocuments({
      createdAt: { $gte: startOfWeek, $lt: endOfWeek },
      status: 'delivered'
    });

    const cancelledCount = await Order.countDocuments({
      createdAt: { $gte: startOfWeek, $lt: endOfWeek },
      status: 'cancelled'
    });

    const exceptionCount = await Order.countDocuments({
      createdAt: { $gte: startOfWeek, $lt: endOfWeek },
      status: 'exception'
    });

    // Calculate total revenue for the week
    const totalRevenue = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startOfWeek, $lt: endOfWeek }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$totalAmount' }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        startDate: startOfWeek,
        endDate: endOfWeek,
        totalOrders: orders.length,
        dailyData,
        statusCounts: {
          pending: pendingCount,
          processing: processingCount,
          dispatched: dispatchedCount,
          delivered: deliveredCount,
          cancelled: cancelledCount,
          exception: exceptionCount
        },
        totalRevenue: totalRevenue.length > 0 ? totalRevenue[0].total : 0
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

// @desc    Get monthly orders report
// @route   GET /api/reports/orders/monthly
// @access  Private/Admin
exports.getMonthlyOrdersReport = async (req, res) => {
  try {
    // Get start and end date for the current month
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 999);

    // Get orders created this month
    const orders = await Order.find({
      createdAt: { $gte: startOfMonth, $lte: endOfMonth }
    }).sort({ createdAt: 1 });

    // Group orders by day of month
    const dailyData = {};
    const daysInMonth = endOfMonth.getDate();
    for (let i = 1; i <= daysInMonth; i++) {
      dailyData[i] = 0;
    }

    orders.forEach(order => {
      const dayOfMonth = order.createdAt.getDate();
      dailyData[dayOfMonth]++;
    });

    // Get order status counts for the month
    const pendingCount = await Order.countDocuments({
      createdAt: { $gte: startOfMonth, $lte: endOfMonth },
      status: 'pending'
    });

    const processingCount = await Order.countDocuments({
      createdAt: { $gte: startOfMonth, $lte: endOfMonth },
      status: 'processing'
    });

    const dispatchedCount = await Order.countDocuments({
      createdAt: { $gte: startOfMonth, $lte: endOfMonth },
      status: 'dispatched'
    });

    const deliveredCount = await Order.countDocuments({
      createdAt: { $gte: startOfMonth, $lte: endOfMonth },
      status: 'delivered'
    });

    const cancelledCount = await Order.countDocuments({
      createdAt: { $gte: startOfMonth, $lte: endOfMonth },
      status: 'cancelled'
    });

    const exceptionCount = await Order.countDocuments({
      createdAt: { $gte: startOfMonth, $lte: endOfMonth },
      status: 'exception'
    });

    // Calculate total revenue for the month
    const totalRevenue = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startOfMonth, $lte: endOfMonth }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$totalAmount' }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        startDate: startOfMonth,
        endDate: endOfMonth,
        totalOrders: orders.length,
        dailyData,
        statusCounts: {
          pending: pendingCount,
          processing: processingCount,
          dispatched: dispatchedCount,
          delivered: deliveredCount,
          cancelled: cancelledCount,
          exception: exceptionCount
        },
        totalRevenue: totalRevenue.length > 0 ? totalRevenue[0].total : 0
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

// @desc    Get dispatch performance report
// @route   GET /api/reports/performance/dispatch
// @access  Private/Admin
exports.getDispatchPerformanceReport = async (req, res) => {
  try {
    // Get date range (default to last 30 days if not provided)
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);

    if (req.query.startDate) {
      startDate = new Date(req.query.startDate);
    }

    if (req.query.endDate) {
      endDate = new Date(req.query.endDate);
      endDate.setHours(23, 59, 59, 999);
    }

    // Get completed dispatches in the date range
    const dispatches = await Dispatch.find({
      status: 'completed',
      createdAt: { $gte: startDate, $lte: endDate }
    }).populate('orders');

    // Calculate performance metrics
    let totalDeliveryTime = 0;
    let totalDistance = 0;
    let totalOrders = 0;
    let ordersPerDispatch = [];

    dispatches.forEach(dispatch => {
      // Calculate delivery time (in minutes)
      if (dispatch.startTime && dispatch.endTime) {
        const deliveryTime = (dispatch.endTime - dispatch.startTime) / (1000 * 60);
        totalDeliveryTime += deliveryTime;
      }

      // Calculate total distance
      if (dispatch.route && dispatch.route.totalDistance) {
        totalDistance += dispatch.route.totalDistance;
      }

      // Count orders
      if (dispatch.orders) {
        totalOrders += dispatch.orders.length;
        ordersPerDispatch.push(dispatch.orders.length);
      }
    });

    // Calculate averages
    const avgDeliveryTime = dispatches.length > 0 ? totalDeliveryTime / dispatches.length : 0;
    const avgDistance = dispatches.length > 0 ? totalDistance / dispatches.length : 0;
    const avgOrdersPerDispatch = dispatches.length > 0 ? totalOrders / dispatches.length : 0;

    res.status(200).json({
      success: true,
      data: {
        startDate,
        endDate,
        totalDispatches: dispatches.length,
        totalOrders,
        avgDeliveryTime,
        avgDistance,
        avgOrdersPerDispatch,
        ordersPerDispatchDistribution: ordersPerDispatch
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

// @desc    Get delivery time report
// @route   GET /api/reports/performance/delivery-time
// @access  Private/Admin
exports.getDeliveryTimeReport = async (req, res) => {
  try {
    // Get date range (default to last 30 days if not provided)
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);

    if (req.query.startDate) {
      startDate = new Date(req.query.startDate);
    }

    if (req.query.endDate) {
      endDate = new Date(req.query.endDate);
      endDate.setHours(23, 59, 59, 999);
    }

    // Get delivered orders in the date range
    const orders = await Order.find({
      status: 'delivered',
      createdAt: { $gte: startDate, $lte: endDate },
      'dispatchInfo.dispatchDate': { $exists: true },
      'dispatchInfo.deliveryDate': { $exists: true }
    });

    // Calculate delivery times
    const deliveryTimes = [];
    let totalDeliveryTime = 0;

    orders.forEach(order => {
      if (order.dispatchInfo.dispatchDate && order.dispatchInfo.deliveryDate) {
        const deliveryTime = (order.dispatchInfo.deliveryDate - order.dispatchInfo.dispatchDate) / (1000 * 60); // in minutes
        deliveryTimes.push(deliveryTime);
        totalDeliveryTime += deliveryTime;
      }
    });

    // Calculate average delivery time
    const avgDeliveryTime = deliveryTimes.length > 0 ? totalDeliveryTime / deliveryTimes.length : 0;

    // Group delivery times into ranges
    const deliveryTimeRanges = {
      'under30min': 0,
      '30to60min': 0,
      '1to2hours': 0,
      '2to4hours': 0,
      '4to8hours': 0,
      'over8hours': 0
    };

    deliveryTimes.forEach(time => {
      if (time < 30) {
        deliveryTimeRanges['under30min']++;
      } else if (time < 60) {
        deliveryTimeRanges['30to60min']++;
      } else if (time < 120) {
        deliveryTimeRanges['1to2hours']++;
      } else if (time < 240) {
        deliveryTimeRanges['2to4hours']++;
      } else if (time < 480) {
        deliveryTimeRanges['4to8hours']++;
      } else {
        deliveryTimeRanges['over8hours']++;
      }
    });

    res.status(200).json({
      success: true,
      data: {
        startDate,
        endDate,
        totalOrders: orders.length,
        avgDeliveryTime,
        deliveryTimeRanges,
        deliveryTimes
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

// @desc    Get exception report
// @route   GET /api/reports/performance/exceptions
// @access  Private/Admin
exports.getExceptionReport = async (req, res) => {
  try {
    // Get date range (default to last 30 days if not provided)
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);

    if (req.query.startDate) {
      startDate = new Date(req.query.startDate);
    }

    if (req.query.endDate) {
      endDate = new Date(req.query.endDate);
      endDate.setHours(23, 59, 59, 999);
    }

    // Get exception orders in the date range
    const exceptionOrders = await Order.find({
      status: 'exception',
      createdAt: { $gte: startDate, $lte: endDate }
    }).populate('customer', 'name');

    // Get cancelled orders in the date range
    const cancelledOrders = await Order.find({
      status: 'cancelled',
      createdAt: { $gte: startDate, $lte: endDate }
    }).populate('customer', 'name');

    // Calculate exception rate
    const totalOrders = await Order.countDocuments({
      createdAt: { $gte: startDate, $lte: endDate }
    });

    const exceptionRate = totalOrders > 0 ? (exceptionOrders.length / totalOrders) * 100 : 0;
    const cancellationRate = totalOrders > 0 ? (cancelledOrders.length / totalOrders) * 100 : 0;

    res.status(200).json({
      success: true,
      data: {
        startDate,
        endDate,
        totalOrders,
        exceptionOrders: exceptionOrders.length,
        cancelledOrders: cancelledOrders.length,
        exceptionRate,
        cancellationRate,
        exceptions: exceptionOrders.map(order => ({
          id: order._id,
          orderNumber: order.orderNumber,
          customer: order.customer ? order.customer.name : 'Unknown',
          createdAt: order.createdAt
        })),
        cancellations: cancelledOrders.map(order => ({
          id: order._id,
          orderNumber: order.orderNumber,
          customer: order.customer ? order.customer.name : 'Unknown',
          createdAt: order.createdAt
        }))
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

// @desc    Get custom report
// @route   POST /api/reports/custom
// @access  Private/Admin
exports.getCustomReport = async (req, res) => {
  try {
    const { startDate, endDate, metrics, filters } = req.body;

    if (!startDate || !endDate || !metrics || !Array.isArray(metrics)) {
      return res.status(400).json({
        success: false,
        error: 'Please provide startDate, endDate, and metrics array'
      });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    // Build query based on filters
    const query = {
      createdAt: { $gte: start, $lte: end }
    };

    if (filters) {
      if (filters.status) {
        query.status = filters.status;
      }

      if (filters.paymentMethod) {
        query.paymentMethod = filters.paymentMethod;
      }

      if (filters.city) {
        query['deliveryAddress.city'] = filters.city;
      }
    }

    // Initialize results object
    const results = {
      startDate: start,
      endDate: end,
      filters: filters || {}
    };

    // Process each requested metric
    for (const metric of metrics) {
      switch (metric) {
        case 'orderCount':
          results.orderCount = await Order.countDocuments(query);
          break;

        case 'revenue':
          const revenueData = await Order.aggregate([
            { $match: query },
            { $group: { _id: null, total: { $sum: '$totalAmount' } } }
          ]);
          results.revenue = revenueData.length > 0 ? revenueData[0].total : 0;
          break;

        case 'statusBreakdown':
          const statuses = ['pending', 'processing', 'dispatched', 'in-transit', 'delivered', 'cancelled', 'returned', 'exception'];
          results.statusBreakdown = {};

          for (const status of statuses) {
            const statusQuery = { ...query, status };
            results.statusBreakdown[status] = await Order.countDocuments(statusQuery);
          }
          break;

        case 'dailyOrders':
          results.dailyOrders = {};
          const orders = await Order.find(query).select('createdAt');

          orders.forEach(order => {
            const dateStr = order.createdAt.toISOString().split('T')[0];
            if (!results.dailyOrders[dateStr]) {
              results.dailyOrders[dateStr] = 0;
            }
            results.dailyOrders[dateStr]++;
          });
          break;

        case 'paymentMethodBreakdown':
          const paymentMethods = ['cash-on-delivery', 'prepaid', 'credit-card', 'bank-transfer'];
          results.paymentMethodBreakdown = {};

          for (const method of paymentMethods) {
            const paymentQuery = { ...query, paymentMethod: method };
            results.paymentMethodBreakdown[method] = await Order.countDocuments(paymentQuery);
          }
          break;

        case 'averageOrderValue':
          const avgOrderData = await Order.aggregate([
            { $match: query },
            { $group: { _id: null, avg: { $avg: '$totalAmount' } } }
          ]);
          results.averageOrderValue = avgOrderData.length > 0 ? avgOrderData[0].avg : 0;
          break;

        case 'cityBreakdown':
          results.cityBreakdown = await Order.aggregate([
            { $match: query },
            { $group: { _id: '$deliveryAddress.city', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
          ]);
          break;
      }
    }

    res.status(200).json({
      success: true,
      data: results
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Export report to CSV
// @route   GET /api/reports/export/csv/:reportId
// @access  Private/Admin
exports.exportReportToCSV = async (req, res) => {
  try {
    // In a real implementation, this would generate a CSV file
    // For now, we'll just return a message
    res.status(200).json({
      success: true,
      message: 'CSV export functionality will be implemented here',
      reportId: req.params.reportId
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Export report to PDF
// @route   GET /api/reports/export/pdf/:reportId
// @access  Private/Admin
exports.exportReportToPDF = async (req, res) => {
  try {
    // In a real implementation, this would generate a PDF file
    // For now, we'll just return a message
    res.status(200).json({
      success: true,
      message: 'PDF export functionality will be implemented here',
      reportId: req.params.reportId
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Get revenue report
// @route   GET /api/reports/revenue
// @access  Private/Admin
exports.getRevenueReport = async (req, res) => {
  try {
    // Get date range (default to last 30 days if not provided)
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);

    if (req.query.startDate) {
      startDate = new Date(req.query.startDate);
    }

    if (req.query.endDate) {
      endDate = new Date(req.query.endDate);
      endDate.setHours(23, 59, 59, 999);
    }

    // Get daily revenue
    const dailyRevenue = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
          paymentStatus: 'completed'
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          revenue: { $sum: '$totalAmount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Get revenue by payment method
    const revenueByPaymentMethod = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
          paymentStatus: 'completed'
        }
      },
      {
        $group: {
          _id: '$paymentMethod',
          revenue: { $sum: '$totalAmount' },
          count: { $sum: 1 }
        }
      }
    ]);

    // Calculate total revenue
    const totalRevenue = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
          paymentStatus: 'completed'
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$totalAmount' },
          count: { $sum: 1 }
        }
      }
    ]);

    // Calculate average order value
    const averageOrderValue = totalRevenue.length > 0 ? totalRevenue[0].total / totalRevenue[0].count : 0;

    res.status(200).json({
      success: true,
      data: {
        startDate,
        endDate,
        totalRevenue: totalRevenue.length > 0 ? totalRevenue[0].total : 0,
        totalOrders: totalRevenue.length > 0 ? totalRevenue[0].count : 0,
        averageOrderValue,
        dailyRevenue,
        revenueByPaymentMethod
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